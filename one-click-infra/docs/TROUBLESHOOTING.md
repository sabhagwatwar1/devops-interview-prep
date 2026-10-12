# Troubleshooting & Operational Runbooks

This guide provides actionable remediation steps for common operational issues encountered while provisioning or managing infrastructure with **One-Click Infra**.

---

## 1. Quick Diagnostic Checklist

When a provisioning or CI/CD job fails, check the following in order:
1. **AWS Credentials**: Run `aws sts get-caller-identity` to verify valid credentials and region.
2. **Terraform Syntax**: Run `terraform validate` inside `terraform/`.
3. **Jenkins Console**: Check the build output for the exact stage and error message.
4. **AWS Service Quotas**: Check if regional limits (EIP, VPC, NAT Gateway, vCPU) have been reached.

---

## 2. Common Issues & Solutions

### Issue 1: State Lock Contention (`Error acquiring the state lock`)

#### Symptom:
```
Error: Error acquiring the state lock
Lock Info:
  ID:        5f2a1b9c-7d4e-4f3a-8b2c-1a2b3c4d5e6f
  Path:      my-org-tfstate/dev/terraform.tfstate
  Who:       jenkins@agent-node-1
  Created:   2026-09-29 18:00:00.000000000 +0000 UTC
```

#### Cause:
A previous Terraform run was interrupted (e.g., job cancelled, agent crashed, manual abort) before releasing the lock in DynamoDB or local lockfile.

#### Resolution:
1. Confirm that no other engineer or pipeline is currently applying changes.
2. If safe, force unlock using the lock ID from the error message:
   ```bash
   cd terraform/
   terraform force-unlock 5f2a1b9c-7d4e-4f3a-8b2c-1a2b3c4d5e6f
   ```
3. Re-run your `terraform plan` or Jenkins pipeline.

---

### Issue 2: AWS Elastic IP (EIP) Quota Exceeded

#### Symptom:
```
Error: creating EC2 EIP: AddressLimitExceeded: The maximum number of addresses has been reached.
```

#### Cause:
AWS accounts have a default soft limit of 5 Elastic IPs per region. In multi-AZ deployments with multiple NAT Gateways, this limit can be reached quickly.

#### Resolution:
- **Immediate Fix (Cost-Effective)**: Set `single_nat_gateway = true` in your configuration (`terraform.tfvars`). This routes all private outbound traffic through 1 NAT Gateway and 1 EIP instead of provisioning one per AZ:
  ```hcl
  single_nat_gateway = true
  ```
- **Long-term Fix**: Request an EIP quota increase in the AWS Service Quotas console under **Amazon EC2** &rarr; **EC2-VPC Elastic IPs**.

---

### Issue 3: VPC Deletion Fails During `terraform destroy` (DependencyViolation)

#### Symptom:
```
Error: deleting EC2 VPC (vpc-0123456789abcdef0): DependencyViolation: The vpc has dependencies and cannot be deleted.
```

#### Cause:
Kubernetes (EKS) or AWS services created dynamic resources (such as AWS Network Load Balancers, Security Groups, or Elastic Network Interfaces) that are outside Terraform's state.

#### Resolution:
1. Delete any Kubernetes Services of type `LoadBalancer` or Ingress controllers before running `terraform destroy`:
   ```bash
   kubectl get svc --all-namespaces -o json | jq -r '.items[] | select(.spec.type=="LoadBalancer") | "\(.metadata.namespace) \(.metadata.name)"' | while read ns svc; do kubectl delete svc -n $ns $svc; done
   ```
2. Check for lingering Elastic Network Interfaces (ENIs):
   ```bash
   aws ec2 describe-network-interfaces \
     --filters "Name=vpc-id,Values=<VPC_ID>" \
     --query "NetworkInterfaces[?Status!='in-use'].[NetworkInterfaceId,Description]" \
     --output table
   ```
3. Detach and delete any orphaned ENIs and re-run:
   ```bash
   terraform destroy -auto-approve
   ```

---

### Issue 4: RDS Subnet Group Error (`DBSubnetGroupDoesNotCoverEnoughAZs`)

#### Symptom:
```
Error: creating RDS DB Subnet Group: DBSubnetGroupDoesNotCoverEnoughAZs: The DB subnet group doesn't meet availability zone coverage requirement. Please add subnets in at least 2 availability zones.
```

#### Cause:
AWS RDS requires database subnet groups to span at least two distinct Availability Zones for high availability and failover support.

#### Resolution:
Ensure `availability_zones` in `terraform.tfvars` contains at least two valid zones:
```hcl
availability_zones = ["us-east-1a", "us-east-1b"]
```
The included `vpc` module automatically computes and provisions database subnets across all specified availability zones.

---

### Issue 5: IAM Permission Denied (`AccessDenied` / `UnauthorizedOperation`)

#### Symptom:
```
Error: creating EKS Cluster: AccessDeniedException: User: arn:aws:iam::123456789012:user/jenkins is not authorized to perform: eks:CreateCluster on resource
```

#### Cause:
The AWS IAM user or role executing the Terraform code lacks the required IAM policies.

#### Minimum Required Policy Actions:
Attach the following AWS Managed Policies or equivalent least-privilege roles to your Jenkins/deployment IAM principal:
- `AmazonVPCFullAccess` (or custom VPC management policy)
- `AmazonEKSClusterPolicy` & `AmazonEKSServicePolicy`
- `AmazonEC2FullAccess`
- `AmazonRDSFullAccess`
- `IAMFullAccess` (or scoped policy for creating roles/instance profiles for EKS/EC2)
- `SecretsManagerReadWrite`

---

### Issue 6: EKS Node Group Creation Fails / Nodes Don't Join Cluster

#### Symptom:
EKS Cluster creates successfully, but `aws_eks_node_group` times out after 20 minutes waiting for nodes to reach `ACTIVE` status.

#### Common Causes & Checks:
1. **Subnet Routing**: Worker nodes in private subnets must have a default route (`0.0.0.0/0`) pointing to a valid NAT Gateway so they can reach the EKS control plane API endpoint and AWS ECR to pull system pods (`coredns`, `kube-proxy`, `aws-node`).
2. **Public vs. Private Endpoint**:
   - In `terraform/modules/compute_eks/main.tf`, `endpoint_private_access = true` and `endpoint_public_access = true` are enabled by default to ensure both external and internal communication work out of the box.
3. **Subnet Tags**: Subnets must have the proper cluster discovery tags:
   - Public subnets: `kubernetes.io/role/elb = 1`
   - Private subnets: `kubernetes.io/role/internal-elb = 1`
   - All subnets: `kubernetes.io/cluster/<cluster-name> = shared`
   *(All tags are automatically injected by our `vpc` module!)*

---

### Issue 7: Jenkins Build Fails - `aws-credentials` Not Found

#### Symptom:
```
Could not find credentials matching 'aws-credentials'
```

#### Resolution:
1. Verify the credential ID in Jenkins matches **exactly**: `aws-credentials` (all lowercase, hyphenated).
2. Check that the credential is saved in the **Global** domain.
3. Review [JENKINS_SETUP.md](./JENKINS_SETUP.md) for step-by-step credential injection.

---

## 3. Disaster Recovery & Manual Teardown Checklist

If an infrastructure apply or destroy gets stuck, follow this clean teardown procedure:

```
[1. Delete K8s Workloads / LoadBalancers]
                 │
                 ▼
[2. Terminate EC2 Instances & ASG]
                 │
                 ▼
[3. Delete EKS Node Groups & Cluster]
                 │
                 ▼
[4. Delete RDS Database Instance]
                 │
                 ▼
[5. Release NAT Gateways & Elastic IPs]
                 │
                 ▼
[6. Delete Subnets, Route Tables & VPC]
```

1. **Delete EKS LoadBalancers**:
   ```bash
   kubectl delete svc --all --all-namespaces
   ```
2. **Destroy via Terraform targeting compute first**:
   ```bash
   cd terraform/
   terraform destroy -target=module.compute_eks -auto-approve
   terraform destroy -target=module.compute_ec2 -auto-approve
   terraform destroy -target=module.database_rds -auto-approve
   terraform destroy -target=module.vpc -auto-approve
   ```
3. **Confirm zero orphaned resources in AWS Console** under VPC & EC2.

