# ─── VPC Outputs ────────────────────────────────────────────────────────────
output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = module.vpc.vpc_id
}

output "public_subnets" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_app_subnets" {
  description = "IDs of the private application subnets"
  value       = module.vpc.private_app_subnet_ids
}

output "private_db_subnets" {
  description = "IDs of the private database subnets"
  value       = module.vpc.private_db_subnet_ids
}

# ─── EKS Outputs ────────────────────────────────────────────────────────────
output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = var.compute_type == "eks" && length(module.compute_eks) > 0 ? module.compute_eks[0].cluster_name : null
}

output "eks_cluster_endpoint" {
  description = "EKS control plane API endpoint"
  value       = var.compute_type == "eks" && length(module.compute_eks) > 0 ? module.compute_eks[0].cluster_endpoint : null
}

output "eks_configure_kubectl_command" {
  description = "Command to configure kubectl on your local machine"
  value       = var.compute_type == "eks" && length(module.compute_eks) > 0 ? module.compute_eks[0].configure_kubectl_command : null
}

# ─── EC2 / ALB Outputs ──────────────────────────────────────────────────────
output "alb_public_url" {
  description = "Public URL of the Application Load Balancer"
  value       = var.compute_type == "ec2" && length(module.compute_ec2) > 0 ? "http://${module.compute_ec2[0].alb_dns_name}" : null
}

output "asg_name" {
  description = "Name of the EC2 Auto Scaling Group"
  value       = var.compute_type == "ec2" && length(module.compute_ec2) > 0 ? module.compute_ec2[0].asg_name : null
}

# ─── RDS Outputs ────────────────────────────────────────────────────────────
output "rds_endpoint" {
  description = "Connection endpoint for the RDS database"
  value       = var.enable_database && length(module.database_rds) > 0 ? module.database_rds[0].db_endpoint : null
}

output "rds_database_name" {
  description = "Name of the default database created"
  value       = var.enable_database && length(module.database_rds) > 0 ? module.database_rds[0].db_name : null
}

output "rds_credentials_secret_arn" {
  description = "AWS Secrets Manager ARN holding the master password"
  value       = var.enable_database && length(module.database_rds) > 0 ? module.database_rds[0].credentials_secret_arn : null
}

# ─── Deployment Summary ─────────────────────────────────────────────────────
output "deployment_summary" {
  description = "High-level summary of provisioned infrastructure"
  value = {
    project     = var.project_name
    environment = var.environment
    region      = var.aws_region
    compute     = var.compute_type
    database    = var.enable_database ? "${var.db_engine} (${var.db_instance_class})" : "none"
  }
}

