locals {
  name_prefix = "${var.project_name}-${var.environment}"
  port        = var.engine == "postgres" ? 5432 : 3306
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.tags
  )
}

# ─── Random Master Password ─────────────────────────────────────────────────
resource "random_password" "master_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ─── Secrets Manager for DB Password ────────────────────────────────────────
resource "aws_secretsmanager_secret" "db_credentials" {
  name_prefix             = "${local.name_prefix}-rds-creds-"
  description             = "Master credentials for ${local.name_prefix}-rds"
  recovery_window_in_days = 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    engine   = var.engine
    host     = aws_db_instance.this.address
    port     = local.port
    username = var.username
    password = random_password.master_password.result
    database = var.db_name
  })
}

# ─── DB Subnet Group ────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "this" {
  name_prefix = "${local.name_prefix}-dbsng-"
  subnet_ids  = var.subnet_ids

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-dbsng" })
}

# ─── Security Group for Database ────────────────────────────────────────────
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Controls inbound access to RDS instance"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = length(var.allowed_security_group_ids) > 0 ? [1] : []
    content {
      description     = "Allow DB traffic from compute tier"
      from_port       = local.port
      to_port         = local.port
      protocol        = "tcp"
      security_groups = var.allowed_security_group_ids
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-rds-sg" })
}

# ─── RDS DB Instance ────────────────────────────────────────────────────────
resource "aws_db_instance" "this" {
  identifier_prefix     = "${substr(local.name_prefix, 0, 20)}-"
  engine                = var.engine
  engine_version        = var.engine_version
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.username
  password = random_password.master_password.result
  port     = local.port

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az            = var.multi_az
  skip_final_snapshot = var.environment != "prod"

  deletion_protection = var.environment == "prod"

  backup_retention_period = var.environment == "prod" ? 7 : 1
  auto_minor_version_upgrade = true

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-rds" })
}
