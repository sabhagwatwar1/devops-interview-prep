# Jenkins CI/CD Setup Guide for One-Click Infra

This guide provides step-by-step instructions to configure, run, and automate the **One-Click Infra** provisioning pipeline in Jenkins.

---

## 1. Overview

The `Jenkinsfile` in this repository implements a production-grade, parameterized declarative CI/CD pipeline. It automates:
1. **Pre-flight linting and syntax validation** (`terraform fmt`, `terraform validate`)
2. **Static Application Security Testing (SAST)** with `tfsec`
3. **Dynamic `terraform.tfvars` generation** matching build parameters
4. **Dry-run planning** (`terraform plan`) with diff outputs
5. **Interactive manual approval gate** before destructive or costly applies
6. **Execution** (`terraform apply` or `terraform destroy`)
7. **Post-build telemetry and artifact archiving** (plan outputs, tfvars snapshots)

```
[Trigger / Webhook]
       │
       ▼
[Parameter Selection] ──> [Checkout & Tool Prep] ──> [Lint & tfsec Scan]
                                                              │
                                                              ▼
[Apply / Destroy] <── [Manual Approval Gate] <── [Terraform Plan & Diff]
       │
       ▼
[Artifact Archival & Notification]
```

---

## 2. Prerequisites

- **Jenkins Controller**: Jenkins LTS 2.414+ (or run via the included `docker-compose.jenkins.yml`)
- **Agent Environment**: Linux agent (amd64 or arm64) with:
  - Terraform `>= 1.5.0`
  - AWS CLI v2
  - `tfsec` (optional, falls back gracefully if absent)
  - `git`, `bash`, `curl`, `jq`
- **AWS IAM Identity**: Access Key & Secret Key (or IAM Role attached to the Jenkins EC2/EKS agent) with permissions to manage VPC, EKS, EC2, ALB, and RDS resources.

---

## 3. Required Jenkins Plugins

Navigate to **Manage Jenkins** &rarr; **Plugins** &rarr; **Available Plugins** and install:

| Plugin Name | ID | Purpose |
| :--- | :--- | :--- |
| **Credentials Binding** | `credentials-binding` | Injects AWS credentials into the build securely |
| **Pipeline** | `workflow-aggregator` | Core pipeline orchestration engine |
| **AnsiColor** | `ansicolor` | Renders colorized Terraform diffs in build console |
| **Pipeline Stage View** | `pipeline-stage-view` | Visual stage pipeline progression & approval buttons |
| **Git Plugin** | `git` | Clones repository containing Terraform code |
| **Terraform Plugin** *(optional)* | `terraform` | Auto-installs Terraform versions if using tool configuration |

---

## 4. Configuring AWS Credentials

The pipeline references a Jenkins credential ID named `aws-credentials`.

### Step-by-Step Configuration:
1. Go to **Manage Jenkins** &rarr; **Credentials** &rarr; **System** &rarr; **Global credentials (unrestricted)**.
2. Click **+ Add Credentials**.
3. Choose one of two credential types:

#### Option A: AWS Credentials Type (Recommended)
- **Kind**: AWS Credentials (requires CloudBees AWS Credentials Plugin or AWS Steps plugin)
- **ID**: `aws-credentials`
- **Access Key ID**: `<YOUR_AWS_ACCESS_KEY_ID>`
- **Secret Access Key**: `<YOUR_AWS_SECRET_ACCESS_KEY>`
- **Description**: `AWS Credentials for One-Click Infra Automation`

#### Option B: Username with Password (Universal Fallback)
- **Kind**: Username with password
- **Username**: `<YOUR_AWS_ACCESS_KEY_ID>`
- **Password**: `<YOUR_AWS_SECRET_ACCESS_KEY>`
- **ID**: `aws-credentials`
- **Description**: `AWS Credentials for One-Click Infra Automation`

> [!TIP]
> If Jenkins is hosted inside AWS (e.g., on EC2 or EKS), prefer using **IAM Roles for Service Accounts (IRSA)** or **EC2 Instance Profile Roles**. When an IAM role is attached, the AWS SDK automatically obtains temporary STS credentials without needing hardcoded keys.

---

## 5. Creating the Jenkins Pipeline Job

1. On the Jenkins dashboard, click **New Item**.
2. Enter item name: `one-click-infra-pipeline`.
3. Select **Pipeline** and click **OK**.
4. Configure General Settings:
   - Check **Discard old builds** &rarr; Max # of builds to keep: `20`.
5. Under the **Pipeline** section:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/<your-org>/interview-prep.git` (or your repository URL)
   - **Credentials**: Select your Git access token or SSH credential if private
   - **Branch Specifier**: `*/main`
   - **Script Path**: `one-click-infra/Jenkinsfile`
6. Click **Save**.

> [!NOTE]
> On the very first run, click **Build Now**. The first execution registers all pipeline parameters defined inside `Jenkinsfile`. Subsequent executions will show the **Build with Parameters** option.

---

## 6. Running a Parameterized Build

Click **Build with Parameters** from the left navigation menu. You will see the following parameters:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Choice | `dev` | Target environment (`dev`, `staging`, `prod`) |
| `ACTION` | Choice | `plan` | Action to perform (`plan`, `apply`, `destroy`) |
| `AWS_REGION` | Choice | `us-east-1` | AWS deployment region (`us-east-1`, `us-west-2`, `ap-south-1`, `eu-west-1`) |
| `COMPUTE_TYPE` | Choice | `eks` | Compute tier (`eks`, `ec2`, `none`) |
| `ENABLE_DATABASE` | Boolean | `true` | Provision an RDS database instance in private DB subnets |
| `DB_ENGINE` | Choice | `postgres` | Database engine (`postgres` or `mysql`) |
| `EKS_NODE_COUNT` | String | `2` | Desired EKS worker node count (if compute is EKS) |
| `AUTO_APPROVE` | Boolean | `false` | Skip the manual approval gate (useful for automated nightly jobs) |

---

## 7. The Manual Approval Gate

When `ACTION = apply` or `ACTION = destroy` and `AUTO_APPROVE = false`, the pipeline:
1. Executes `terraform plan -out=tfplan`
2. Formats and prints the plan diff in the Jenkins console log
3. Enters an **interactive input pause**:
   ```
   Terraform Plan completed. Do you want to apply these changes to 'dev' in 'us-east-1'?
   [Proceed] / [Abort]
   ```
4. Authorized team members can inspect the plan diff in Jenkins Stage View and click **Proceed** to apply or **Abort** to cancel the run.
5. The gate automatically times out after **30 minutes** if no action is taken, preventing hung workers.

---

## 8. Quickstart with Local Jenkins (Docker Compose)

For testing the pipeline on your local workstation without installing Jenkins on the host OS:

```bash
# 1. Navigate to the project root
cd /Users/omkarbhagwatwar/Desktop/interview-prep/one-click-infra

# 2. Start Jenkins LTS container in the background
docker compose -f docker-compose.jenkins.yml up -d

# 3. Wait for startup and retrieve the initial administrator password
docker compose -f docker-compose.jenkins.yml logs -f jenkins | grep -A 2 "Please use the following password"

# 4. Open your browser and navigate to:
http://localhost:8080
```

Install suggested plugins, create an admin user, configure the credentials, and link your Git repository!

---

## 9. Security Best Practices

1. **State Storage Encryption**: In production, configure the S3 backend in `terraform/versions.tf` with AES-256 server-side encryption and DynamoDB state locking.
2. **Secret Masking**: Passwords generated by the RDS module are automatically stored in **AWS Secrets Manager** and marked sensitive in Terraform, preventing cleartext leaks in Jenkins build logs.
3. **IAM Least Privilege**: Create a dedicated Jenkins deployment role restricted to the resources and regions your team manages.
4. **Audit Trails**: Enable Jenkins audit logging and retain build logs for compliance.
