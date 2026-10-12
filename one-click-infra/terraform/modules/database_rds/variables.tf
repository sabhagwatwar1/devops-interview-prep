variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of private DB subnet IDs"
  type        = list(string)
}

variable "engine" {
  description = "Database engine (postgres or mysql)"
  type        = string
  default     = "postgres"

  validation {
    condition     = contains(["postgres", "mysql"], var.engine)
    error_message = "Engine must be either 'postgres' or 'mysql'."
  }
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Initial allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage limit for auto-scaling in gigabytes"
  type        = number
  default     = 50
}

variable "db_name" {
  description = "The name of the database to create"
  type        = string
  default     = "appdb"
}

variable "username" {
  description = "Master username for database admin"
  type        = string
  default     = "dbadmin"
}

variable "allowed_security_group_ids" {
  description = "Security Group IDs allowed to access the database"
  type        = list(string)
  default     = []
}

variable "multi_az" {
  description = "Whether to deploy database as Multi-AZ"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to attach to resources"
  type        = map(string)
  default     = {}
}

