#!/usr/bin/env bash
# ==============================================================================
#  ONE-CLICK INFRA — Interactive Infrastructure Provisioner
#  Powered by Terraform, AWS & Jenkins
# ==============================================================================

set -eo pipefail

# ─── Colors & Styling ────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="${SCRIPT_DIR}/terraform"
TFVARS_FILE="${TF_DIR}/terraform.tfvars"

print_banner() {
  clear 2>/dev/null || true
  echo -e "${CYAN}${BOLD}"
  echo "  ██████╗ ███╗   ██╗███████╗     ██████╗██╗     ██╗ ██████╗██╗  ██╗"
  echo " ██╔═══██╗████╗  ██║██╔════╝    ██╔════╝██║     ██║██╔════╝██║ ██╔╝"
  echo " ██║   ██║██╔██╗ ██║█████╗      ██║     ██║     ██║██║     █████═╝ "
  echo " ██║   ██║██║╚██╗██║██╔══╝      ██║     ██║     ██║██║     ██╔═██╗ "
  echo " ╚██████╔╝██║ ╚████║███████╗    ╚██████╗███████╗██║╚██████╗██║  ██╗"
  echo "  ╚═════╝ ╚═╝  ╚═══╝╚══════╝     ╚═════╝╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝"
  echo "               I N F R A S T R U C T U R E   E N G I N E            "
  echo -e "${NC}"
  echo -e "${PURPLE}  Interactive Cloud Provisioning Wizard • Terraform & Jenkins ${NC}\n"
}

prompt_default() {
  local prompt_text="$1"
  local default_val="$2"
  local user_val=""

  echo -ne "${BOLD}${prompt_text}${NC} [${GREEN}${default_val}${NC}]: " >&2
  read -r user_val
  if [ -z "$user_val" ]; then
    echo "$default_val"
  else
    echo "$user_val"
  fi
}

check_dependencies() {
  echo -e "${CYAN}── Checking Prerequisites ─────────────────────────────────────${NC}"
  local missing=0

  if command -v terraform >/dev/null 2>&1; then
    echo -e "  [${GREEN}✓${NC}] Terraform installed: $(terraform version -json 2>/dev/null | grep -o '"terraform_version":"[^"]*"' | cut -d'"' -f4 || terraform -v | head -n1)"
  else
    echo -e "  [${YELLOW}!${NC}] Terraform is not installed on PATH. (Configs will still be generated)"
    missing=1
  fi

  if command -v aws >/dev/null 2>&1; then
    echo -e "  [${GREEN}✓${NC}] AWS CLI installed: $(aws --version 2>&1 | cut -d' ' -f1)"
  else
    echo -e "  [${YELLOW}!${NC}] AWS CLI is not installed or not in PATH."
  fi

  echo ""
}

run_wizard() {
  print_banner
  check_dependencies

  echo -e "${CYAN}── Step 1: Project & Environment Configuration ───────────────${NC}"
  PROJECT_NAME=$(prompt_default "Enter Project Name" "one-click")
  
  echo -e "\nSelect Target Environment:"
  echo -e "  1) dev     (Single NAT GW, smaller instances)"
  echo -e "  2) staging (Multi-AZ test environment)"
  echo -e "  3) prod    (Full Multi-AZ HA, backup retention, deletion protection)"
  ENV_CHOICE=$(prompt_default "Select environment (1-3)" "1")
  case "$ENV_CHOICE" in
    1) ENVIRONMENT="dev" ;;
    2) ENVIRONMENT="staging" ;;
    3) ENVIRONMENT="prod" ;;
    *) ENVIRONMENT="dev" ;;
  esac

  AWS_REGION=$(prompt_default "Target AWS Region" "us-east-1")

  echo -e "\n${CYAN}── Step 2: VPC & Networking Configuration ─────────────────────${NC}"
  VPC_CIDR=$(prompt_default "VPC CIDR Block" "10.0.0.0/16")
  
  if [ "$ENVIRONMENT" == "prod" ]; then
    SINGLE_NAT="false"
    echo -e "  Production detected: Multi-AZ redundant NAT Gateways enabled."
  else
    SINGLE_NAT_INPUT=$(prompt_default "Use Single NAT Gateway to save costs? (true/false)" "true")
    SINGLE_NAT="$SINGLE_NAT_INPUT"
  fi

  echo -e "\n${CYAN}── Step 3: Compute Architecture Selection ─────────────────────${NC}"
  echo -e "What type of compute infrastructure do you want to deploy?"
  echo -e "  1) EKS (Amazon Managed Kubernetes Cluster + Managed Worker Node Group)"
  echo -e "  2) EC2 (Auto Scaling Group + Application Load Balancer + Nginx)"
  echo -e "  3) None (VPC & Networking only)"
  COMPUTE_CHOICE=$(prompt_default "Select compute option (1-3)" "1")

  case "$COMPUTE_CHOICE" in
    1)
      COMPUTE_TYPE="eks"
      EKS_VERSION=$(prompt_default "EKS Kubernetes Version" "1.29")
      EKS_INSTANCE=$(prompt_default "Worker Node Instance Type" "t3.medium")
      EKS_DESIRED=$(prompt_default "Desired Worker Node Count" "2")
      EKS_MIN=$(prompt_default "Minimum Worker Node Count" "1")
      EKS_MAX=$(prompt_default "Maximum Worker Node Count" "4")
      ;;
    2)
      COMPUTE_TYPE="ec2"
      EC2_INSTANCE=$(prompt_default "EC2 Instance Type" "t3.micro")
      EC2_DESIRED=$(prompt_default "Desired EC2 Instances" "2")
      EC2_MIN=$(prompt_default "Minimum EC2 Instances" "1")
      EC2_MAX=$(prompt_default "Maximum EC2 Instances" "4")
      EC2_SSH_KEY=$(prompt_default "Optional SSH Key Pair Name (leave empty for none)" "")
      ;;
    *)
      COMPUTE_TYPE="none"
      ;;
  esac

  echo -e "\n${CYAN}── Step 4: Relational Database (RDS) ──────────────────────────${NC}"
  ENABLE_DB_INPUT=$(prompt_default "Provision a private RDS Database? (y/n)" "n")
  if [[ "$ENABLE_DB_INPUT" =~ ^[Yy]$ ]]; then
    ENABLE_DB="true"
    echo -e "Select Database Engine:"
    echo -e "  1) PostgreSQL (v15)"
    echo -e "  2) MySQL (v8.0)"
    DB_ENG_CHOICE=$(prompt_default "Select DB Engine (1-2)" "1")
    if [ "$DB_ENG_CHOICE" == "2" ]; then
      DB_ENGINE="mysql"
    else
      DB_ENGINE="postgres"
    fi
    DB_CLASS=$(prompt_default "RDS Instance Class" "db.t4g.micro")
    DB_STORAGE=$(prompt_default "Allocated Storage (GB)" "20")
    DB_NAME=$(prompt_default "Initial Database Name" "appdb")
    DB_USER=$(prompt_default "Master DB Username" "dbadmin")
  else
    ENABLE_DB="false"
    DB_ENGINE="postgres"
    DB_CLASS="db.t4g.micro"
    DB_STORAGE="20"
    DB_NAME="appdb"
    DB_USER="dbadmin"
  fi

  echo -e "\n${CYAN}── Configuration Summary ──────────────────────────────────────${NC}"
  echo -e "  Project Name     : ${BOLD}${PROJECT_NAME}${NC}"
  echo -e "  Environment      : ${GREEN}${ENVIRONMENT}${NC}"
  echo -e "  AWS Region       : ${BOLD}${AWS_REGION}${NC}"
  echo -e "  VPC CIDR         : ${BOLD}${VPC_CIDR}${NC}"
  echo -e "  Single NAT GW    : ${BOLD}${SINGLE_NAT}${NC}"
  echo -e "  Compute Type     : ${PURPLE}${BOLD}${COMPUTE_TYPE}${NC}"
  if [ "$COMPUTE_TYPE" == "eks" ]; then
    echo -e "    - EKS Version  : ${EKS_VERSION}"
    echo -e "    - Node Type    : ${EKS_INSTANCE}"
    echo -e "    - Node Scaling : Min=${EKS_MIN}, Desired=${EKS_DESIRED}, Max=${EKS_MAX}"
  elif [ "$COMPUTE_TYPE" == "ec2" ]; then
    echo -e "    - Instance Type: ${EC2_INSTANCE}"
    echo -e "    - ASG Scaling  : Min=${EC2_MIN}, Desired=${EC2_DESIRED}, Max=${EC2_MAX}"
  fi
  echo -e "  Database (RDS)   : ${BOLD}${ENABLE_DB}${NC}"
  if [ "$ENABLE_DB" == "true" ]; then
    echo -e "    - Engine       : ${DB_ENGINE}"
    echo -e "    - Class        : ${DB_CLASS} (${DB_STORAGE} GB)"
    echo -e "    - DB Name      : ${DB_NAME}"
  fi
  echo -e "─────────────────────────────────────────────────────────────────\n"

  CONFIRM=$(prompt_default "Proceed with this configuration? (y/n)" "y")
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted by user.${NC}"
    exit 0
  fi

  # Generate terraform.tfvars
  echo -e "\n${YELLOW}Writing configuration to ${TFVARS_FILE}...${NC}"
  cat <<TFVARS > "${TFVARS_FILE}"
# Auto-generated by One-Click Infra Wizard
# Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

project_name       = "${PROJECT_NAME}"
environment        = "${ENVIRONMENT}"
aws_region         = "${AWS_REGION}"

vpc_cidr           = "${VPC_CIDR}"
enable_nat_gateway = true
single_nat_gateway = ${SINGLE_NAT}

compute_type       = "${COMPUTE_TYPE}"

# EKS Settings
eks_cluster_version  = "${EKS_VERSION:-1.29}"
eks_instance_types   = ["${EKS_INSTANCE:-t3.medium}"]
eks_desired_capacity = ${EKS_DESIRED:-2}
eks_min_capacity     = ${EKS_MIN:-1}
eks_max_capacity     = ${EKS_MAX:-4}

# EC2 Settings
ec2_instance_type    = "${EC2_INSTANCE:-t3.micro}"
ec2_desired_capacity = ${EC2_DESIRED:-2}
ec2_min_size         = ${EC2_MIN:-1}
ec2_max_size         = ${EC2_MAX:-4}
ec2_ssh_key_name     = "${EC2_SSH_KEY:-}"

# Database Settings
enable_database      = ${ENABLE_DB}
db_engine            = "${DB_ENGINE}"
db_instance_class    = "${DB_CLASS}"
db_allocated_storage = ${DB_STORAGE}
db_name              = "${DB_NAME}"
db_username          = "${DB_USER}"
db_multi_az          = $([ "$ENVIRONMENT" == "prod" ] && echo "true" || echo "false")

tags = {
  Provisioner = "OneClickInfra-Wizard"
  Environment = "${ENVIRONMENT}"
}
TFVARS

  echo -e "${GREEN}✓ ${TFVARS_FILE} successfully generated!${NC}\n"

  echo -e "${CYAN}What action would you like to perform next?${NC}"
  echo -e "  1) Save config only and exit"
  echo -e "  2) Run 'terraform init & plan' (Preview changes)"
  echo -e "  3) Run 'terraform apply' (Provision live infrastructure)"
  echo -e "  4) Run 'terraform destroy' (Teardown infrastructure)"
  ACTION=$(prompt_default "Choose action (1-4)" "2")

  case "$ACTION" in
    1)
      echo -e "${GREEN}Config saved. You can run terraform commands inside '${TF_DIR}'.${NC}"
      exit 0
      ;;
    2)
      if ! command -v terraform >/dev/null 2>&1; then
        echo -e "${RED}Error: terraform binary not found in PATH. Please install Terraform first.${NC}"
        exit 1
      fi
      echo -e "\n${CYAN}── Running Terraform Init & Plan ─────────────────────────────${NC}"
      terraform -chdir="${TF_DIR}" init
      terraform -chdir="${TF_DIR}" plan
      ;;
    3)
      if ! command -v terraform >/dev/null 2>&1; then
        echo -e "${RED}Error: terraform binary not found in PATH. Please install Terraform first.${NC}"
        exit 1
      fi
      echo -e "\n${YELLOW}── WARNING: This will provision REAL AWS cloud resources! ──────${NC}"
      FINAL_CHECK=$(prompt_default "Are you sure you want to apply? (type 'yes' to proceed)" "no")
      if [ "$FINAL_CHECK" == "yes" ]; then
        terraform -chdir="${TF_DIR}" init
        terraform -chdir="${TF_DIR}" apply -auto-approve
        echo -e "\n${GREEN}🎉 Infrastructure provisioning complete! Check outputs above.${NC}"
      else
        echo -e "${YELLOW}Apply cancelled.${NC}"
      fi
      ;;
    4)
      if ! command -v terraform >/dev/null 2>&1; then
        echo -e "${RED}Error: terraform binary not found in PATH. Please install Terraform first.${NC}"
        exit 1
      fi
      echo -e "\n${RED}── DANGER: This will DESTROY all provisioned resources! ────────${NC}"
      DESTROY_CHECK=$(prompt_default "Type 'destroy' to confirm teardown" "cancel")
      if [ "$DESTROY_CHECK" == "destroy" ]; then
        terraform -chdir="${TF_DIR}" destroy -auto-approve
        echo -e "\n${GREEN}✓ Infrastructure successfully destroyed.${NC}"
      else
        echo -e "${YELLOW}Destroy cancelled.${NC}"
      fi
      ;;
  esac
}

# Run wizard
run_wizard
