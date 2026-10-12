# 🚀 One-Click Infra

> **Zero-Friction, Interactive Cloud Infrastructure Provisioner powered by Terraform & Jenkins CI/CD.**

[![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.5.0-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Overview

**One-Click Infra** eliminates the complexity of setting up modern cloud environments. Instead of hand-crafting configuration files or copying complex codebases, One-Click Infra provides:

1. **Interactive CLI Wizard (`./one-click.sh`)**: Prompts you for your project name, target environment, AWS region, compute preference (EKS or EC2), and database tier, validates your choices, writes `terraform.tfvars`, and handles execution.
2. **Modular Terraform Engine (`terraform/`)**: Production-ready, modular AWS architecture following HashiCorp and AWS Well-Architected Framework best practices.
3. **Enterprise Jenkins CI/CD Pipeline (`Jenkinsfile`)**: Declarative parameterized pipeline with linting, SAST security scans (`tfsec`), plan diff outputs, an interactive manual approval gate, and automated state management.
4. **Local Jenkins Docker Runner (`docker-compose.jenkins.yml`)**: Spin up a fully pre-configured Jenkins environment locally with one command.
5. **Comprehensive Documentation Suite (`docs/`)**: Deep-dive architecture specs, Jenkins integration guides, and troubleshooting runbooks.

---

## 🏗️ Architecture Summary

```
                      INTERACTIVE OR CI/CD TRIGGER
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
     [ ./one-click.sh ]                         [ Jenkinsfile ]
  Interactive Terminal Wizard                 Parameterized Pipeline
              │                                         │
              └────────────────────┬────────────────────┘
                                   │
                                   ▼
                    [ Terraform Engine (v1.5+) ]
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     [ 3-Tier Multi-AZ VPC ]  [ Compute Tier ]    [ Database Tier ]
     • Public Subnets         • AWS EKS Cluster   • RDS Postgres/MySQL
     • Private App Subnets      OR                • Multi-AZ Subnet Group
     • Private DB Subnets     • EC2 ASG + ALB     • Secrets Manager Password
     • NAT Gateways & IGW
```

For full networking diagrams, security group isolation matrices, and cost optimization tiers, see the **[Architecture Documentation](./docs/ARCHITECTURE.md)**.

---

## ⚡ Quickstart: Local Interactive Wizard

No manual `.tfvars` file creation required. Simply run the interactive setup script:

```bash
# 1. Clone repository & navigate to project
cd one-click-infra/

# 2. Make wizard executable
chmod +x one-click.sh

# 3. Launch the Interactive Wizard
./one-click.sh
```

### The Wizard prompts you for:
- **Project Name** *(e.g., `acme-core`)*
- **Target Environment** *(e.g., `dev`, `staging`, `prod`)*
- **AWS Region** *(e.g., `us-east-1`, `ap-south-1`)*
- **VPC CIDR & Availability Zones** *(auto-calculated subnet tiers)*
- **Compute Choice**:
  - `1) EKS (Elastic Kubernetes Service)`
  - `2) EC2 (Auto Scaling Group + Application Load Balancer)`
  - `3) None (Networking / DB only)`
- **Database Choice**:
  - `1) None`
  - `2) RDS PostgreSQL`
  - `3) RDS MySQL`
- **Action**:
  - `1) Generate config only (dry-run)`
  - `2) Run terraform plan`
  - `3) Run terraform apply (Provision Infrastructure)`
  - `4) Run terraform destroy (Teardown)`

---

## 🔄 Automated CI/CD with Jenkins

A production-grade, parameterized `Jenkinsfile` is included out-of-the-box.

### Pipeline Stages:
1. **Pre-flight & Lint**: Runs `terraform fmt -check` and `terraform validate`.
2. **Security Scan**: Static analysis with `tfsec` to catch misconfigurations.
3. **Dynamic Config**: Automatically generates `terraform.tfvars` from Jenkins job parameters.
4. **Terraform Plan**: Generates plan diff and archives it as a build artifact.
5. **Interactive Approval Gate**: Pauses for team review before any modifying actions.
6. **Terraform Apply / Destroy**: Deploys or destroys infrastructure safely.
7. **Post-Action Artifacts**: Extracts connection strings, kubeconfig commands, and endpoints.

### Setup Instructions:
Read the complete guide in **[Jenkins Setup Guide](./docs/JENKINS_SETUP.md)**.

To test Jenkins locally:
```bash
docker compose -f docker-compose.jenkins.yml up -d
```
Access Jenkins at `http://localhost:8080`.

---

## 📁 Project Structure

```
one-click-infra/
├── README.md                      # Primary documentation & quickstart
├── one-click.sh                   # Interactive colored CLI configuration wizard
├── Jenkinsfile                    # Production parameterized declarative CI/CD pipeline
├── docker-compose.jenkins.yml      # Local Jenkins testing container
├── docs/
│   ├── ARCHITECTURE.md            # Topology diagrams, routing, security & cost models
│   ├── JENKINS_SETUP.md           # Step-by-step Jenkins plugin, credential & job setup
│   └── TROUBLESHOOTING.md         # Diagnostic runbooks, state locks & disaster recovery
└── terraform/
    ├── main.tf                    # Root orchestrator invoking submodules conditionally
    ├── variables.tf               # Input definitions with defaults and validations
    ├── outputs.tf                 # Formatted outputs (ALB DNS, EKS kubeconfig, RDS endpoint)
    ├── providers.tf               # AWS provider configuration
    ├── versions.tf                # Provider and Terraform version pins
    ├── terraform.tfvars.example   # Static example configuration reference
    └── modules/
        ├── vpc/                   # 3-tier multi-AZ VPC, IGW, NAT GW, route tables
        ├── compute_eks/           # EKS cluster, managed node group, OIDC/IRSA, IAM roles
        ├── compute_ec2/           # EC2 ASG, Launch Template, ALB & Target Group
        └── database_rds/          # RDS PostgreSQL/MySQL, Subnet Group, Secrets Manager
```

---

## ⚙️ Configuration Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `project_name` | `string` | `"one-click-infra"` | Identifier prefixed to all created cloud resources |
| `environment` | `string` | `"dev"` | Target environment: `dev`, `staging`, `prod` |
| `aws_region` | `string` | `"us-east-1"` | AWS destination region |
| `vpc_cidr` | `string` | `"10.0.0.0/16"` | CIDR block allocated for the VPC |
| `availability_zones` | `list(string)`| `["us-east-1a", "us-east-1b"]` | AZs used for subnet distribution |
| `single_nat_gateway` | `bool` | `true` | Use 1 NAT GW to reduce non-production AWS costs |
| `compute_type` | `string` | `"eks"` | Compute workload: `"eks"`, `"ec2"`, or `"none"` |
| `eks_node_count` | `number` | `2` | Desired EKS worker node count |
| `eks_instance_types`| `list(string)`| `["t3.medium"]` | EC2 instance types for EKS worker nodes |
| `ec2_instance_type` | `string` | `"t3.micro"` | Instance type for EC2 ASG |
| `enable_database` | `bool` | `true` | Whether to provision an RDS database instance |
| `db_engine` | `string` | `"postgres"` | Database engine: `"postgres"` or `"mysql"` |
| `db_instance_class` | `string` | `"db.t3.micro"` | Database instance sizing class |

---

## 🧹 Teardown & Clean Up

To destroy all provisioned cloud resources and stop recurring AWS costs:

### Via Interactive CLI:
```bash
./one-click.sh
# Select option 4: Run terraform destroy
```

### Via Jenkins:
Run the pipeline with parameter `ACTION = destroy`.

### Via Native Terraform:
```bash
cd terraform/
terraform destroy -auto-approve
```

For troubleshooting stuck resources or dependency violations, refer to **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**.

