variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to deploy subnets in"
  type        = list(string)
  default     = []
}

variable "enable_nat_gateway" {
  description = "Whether to provision NAT Gateways for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "If true, deploy a single shared NAT Gateway across AZs to save costs (recommended for non-prod)"
  type        = bool
  default     = true
}

variable "cluster_name" {
  description = "Optional EKS cluster name for subnet discovery tags"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
