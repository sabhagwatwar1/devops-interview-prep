locals {
  cluster_name = var.compute_type == "eks" ? "${var.project_name}-${var.environment}-eks" : ""

  # Determine which compute security groups should have database access
  compute_security_group_ids = compact([
    var.compute_type == "eks" && length(module.compute_eks) > 0 ? module.compute_eks[0].cluster_security_group_id : null,
    var.compute_type == "ec2" && length(module.compute_ec2) > 0 ? module.compute_ec2[0].ec2_security_group_id : null,
  ])
}

# ─── VPC Module (3-Tier Multi-AZ) ───────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway
  cluster_name       = local.cluster_name
  tags               = var.tags
}

# ─── Compute: EKS Managed Kubernetes Cluster ────────────────────────────────
module "compute_eks" {
  count  = var.compute_type == "eks" ? 1 : 0
  source = "./modules/compute_eks"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_app_subnet_ids
  cluster_version  = var.eks_cluster_version
  instance_types   = var.eks_instance_types
  desired_capacity = var.eks_desired_capacity
  min_capacity     = var.eks_min_capacity
  max_capacity     = var.eks_max_capacity
  tags             = var.tags
}

# ─── Compute: EC2 Auto Scaling Group + ALB ──────────────────────────────────
module "compute_ec2" {
  count  = var.compute_type == "ec2" ? 1 : 0
  source = "./modules/compute_ec2"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_app_subnet_ids
  instance_type      = var.ec2_instance_type
  desired_capacity   = var.ec2_desired_capacity
  min_size           = var.ec2_min_size
  max_size           = var.ec2_max_size
  ssh_key_name       = var.ec2_ssh_key_name
  tags               = var.tags
}

# ─── Database: Relational Database Service (RDS) ─────────────────────────────
module "database_rds" {
  count  = var.enable_database ? 1 : 0
  source = "./modules/database_rds"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_db_subnet_ids
  engine                     = var.db_engine
  instance_class             = var.db_instance_class
  allocated_storage          = var.db_allocated_storage
  db_name                    = var.db_name
  username                   = var.db_username
  multi_az                   = var.db_multi_az
  allowed_security_group_ids = local.compute_security_group_ids
  tags                       = var.tags
}

