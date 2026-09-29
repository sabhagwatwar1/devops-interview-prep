# ─── General Configuration ───────────────────────────────────────────────────
variable "project_name" {
  description = "Name identifier for the project and resources"
  type        = string
  default     = "one-click"
}

variable "environment" {
  description = "Target deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region for infrastructure provisioning"
  type        = string
  default     = "us-east-1"
}

# ─── VPC & Networking ───────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "Primary CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateways for private subnet outbound internet connectivity"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Deploy a single shared NAT Gateway across AZs (cost optimization for dev/staging)"
  type        = bool
  default     = true
}

# ─── Compute Selection ──────────────────────────────────────────────────────
variable "compute_type" {
  description = "Type of compute architecture to deploy: 'eks' (Kubernetes), 'ec2' (ASG + ALB), or 'none'"
  type        = string
  default     = "eks"

  validation {
    condition     = contains(["eks", "ec2", "none"], var.compute_type)
    error_message = "compute_type must be one of: 'eks', 'ec2', or 'none'."
  }
}

# ─── EKS Settings ───────────────────────────────────────────────────────────
variable "eks_cluster_version" {
  description = "Kubernetes control plane version"
  type        = string
  default     = "1.29"
}

variable "eks_instance_types" {
  description = "EC2 instance types for EKS managed node workers"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_desired_capacity" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_min_capacity" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 1
}

variable "eks_max_capacity" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 4
}

# ─── EC2 Settings ───────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  description = "Instance type for EC2 Auto Scaling Group"
  type        = string
  default     = "t3.micro"
}

variable "ec2_desired_capacity" {
  description = "Desired number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 2
}

variable "ec2_min_size" {
  description = "Minimum number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "ec2_max_size" {
  description = "Maximum number of EC2 instances in Auto Scaling Group"
  type        = number
  default     = 4
}

variable "ec2_ssh_key_name" {
  description = "Optional SSH key pair name for EC2 access"
  type        = string
  default     = ""
}

# ─── Database (RDS) Settings ────────────────────────────────────────────────
variable "enable_database" {
  description = "Provision an RDS database in private DB subnets"
  type        = bool
  default     = false
}

variable "db_engine" {
  description = "Database engine: 'postgres' or 'mysql'"
  type        = string
  default     = "postgres"
}

variable "db_instance_class" {
  description = "RDS DB instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS instance"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Name of the initial application database"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "dbadmin"
}

variable "db_multi_az" {
  description = "Enable Multi-AZ replication for high availability"
  type        = bool
  default     = false
}

# ─── Additional Tags ────────────────────────────────────────────────────────
variable "tags" {
  description = "Custom tags to attach to all resources"
  type        = map(string)
  default     = {}
}
