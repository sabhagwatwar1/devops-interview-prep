# 🚀 DevOps & SRE Interview Preparation Platform

> **1,326+ Production-Grade Interview Questions, Deep Architectural Scenarios, 3D Flashcards, and Quizzes across 12 Specialized Domains.**

![Platform UI](website/images/preview.png) *(or launch locally via `website/index.html`)*

---

## 🌟 Overview
This platform is a modern, high-performance web application designed for **DevOps Engineers, Site Reliability Engineers (SRE), Cloud Architects, and Platform Engineers** preparing for technical interviews at top-tier tech companies.

It includes **100+ dedicated, in-depth questions per topic** across 12 core engineering domains:

| Domain | Question Count | Topics Covered |
| :--- | :---: | :--- |
| ☸️ **[Kubernetes (K8s)](website/kubernetes.html)** | **162** | Control plane, Pod lifecycle, Services, Ingress, PV/PVC, StorageClasses, RBAC, NetworkPolicies, HPA/VPA |
| 🏗️ **[Terraform & IaC](website/terraform.html)** | **115** | State locks, remote backends, modules, drift reconciliation, dynamic blocks, provisioners, Sentinel |
| ☁️ **[AWS & Cloud](website/aws.html)** | **112** | Multi-AZ VPC, Transit Gateway, ALB/NLB, EKS, ECS Fargate, IAM Roles, S3, Multi-Region HA & DR |
| 🐧 **[Linux & OS](website/linux.html)** | **104** | Kernel architecture, systemd, memory/page cache, cgroups v2, namespaces, Inodes, eBPF tuning |
| 🔄 **[CI/CD Pipelines](website/cicd.html)** | **106** | CD vs CD, Jenkins, GitHub Actions, GitLab CI, Tekton, Blue-Green, Canary, Rollback automation |
| 🐳 **[Docker & Containers](website/docker.html)** | **106** | Container runtimes (containerd/runc), OverlayFS, multi-stage Dockerfiles, distroless, hardening |
| 🌐 **[Networking & Protocols](website/networking.html)** | **103** | OSI 7-layer, TCP 3-way handshake, UDP, DNS recursion, CIDR subnetting, packet troubleshooting |
| 🐙 **[Git & Version Control](website/git.html)** | **104** | Git internals, DAG, merge vs rebase, cherry-pick, reflog recovery, worktrees, bisect debugging |
| ⚡ **[GitOps & ArgoCD](website/gitops.html)** | **102** | Declarative delivery, ApplicationSets, automated drift detection, Sync Waves, multi-cluster |
| 📊 **[Observability & SRE](website/observability.html)** | **103** | Metrics, Logs, Traces (OpenTelemetry), Prometheus PromQL, Grafana, SRE 4 Golden Signals, SLO/SLI |
| 🛡️ **[Security & DevSecOps](website/security.html)** | **102** | Shift-Left, SAST/DAST/SCA, Trivy, Kyverno/OPA Gatekeeper, HashiCorp Vault, Secrets Store CSI |
| 🚨 **[Incident Scenarios](website/scenario.html)** | **107** | Production outage triage (502/504 errors, OOMKilled), post-mortems, DORA metrics, system design |
| **Total** | **1,326+** | **Comprehensive Full Coverage** |

---

## ✨ Features
* 🌓 **Cyberpunk HUD Aesthetics:** Sleek, modern dark user interface with dynamic rainbow gradients and developer-grade typography (`Plus Jakarta Sans`, `Inter`, and `JetBrains Mono`).
* 💻 **Interactive Live DevOps CLI Terminal:** Real-time typewriter terminal on the hero dashboard demonstrating actual Terraform plans, kubectl status, Trivy security scans, and ArgoCD sync outputs.
* 🃏 **Dual Study Modes:**
  * **Accordion View:** Structured, syntax-highlighted code blocks with 1-click clipboard copy.
  * **3D Flashcard Mode:** Interactive flip cards to test knowledge before revealing technical answers.
* 🎯 **Topic-Specific Practice Quizzes:** Interactive multi-choice quizzes on every page with instant scoring and detailed answer explanations.
* 📈 **Question Mastery Tracker:** Real-time progress bar saved automatically in browser `localStorage`.
* 💬 **Community Doubts & Forum:** Submit questions, upvote technical answers, and engage with peers.

---

## 🚀 Quick Start (Local Setup)

Clone the repository and launch the application locally in any browser:

```bash
# 1. Clone the repository
git clone https://github.com/sabhagwatwar1/devops-sre-interview-prep.git

# 2. Navigate to project directory
cd devops-sre-interview-prep/website

# 3. Serve with Python HTTP server
python3 -m http.server 8000
```

Open your browser at **`http://localhost:8000`**

---

## 📁 Repository Structure

```
.
├── DOCUMENTATION.md                # Full technical architecture & maintenance manual
├── README.md                       # Repository overview and quick start
├── *.pdf                           # Source interview PDF reference materials
└── website/                        # Production web application
    ├── index.html                  # Master Dashboard
    ├── kubernetes.html             # Dedicated K8s Vault (162 Q&As)
    ├── terraform.html              # Dedicated Terraform Vault (115 Q&As)
    ├── linux.html                  # Dedicated Linux Vault (104 Q&As)
    ├── aws.html                    # Dedicated AWS Cloud Vault (112 Q&As)
    ├── cicd.html                   # Dedicated CI/CD Vault (106 Q&As)
    ├── docker.html                 # Dedicated Docker Vault (106 Q&As)
    ├── networking.html             # Dedicated Networking Vault (103 Q&As)
    ├── git.html                    # Dedicated Git Vault (104 Q&As)
    ├── gitops.html                 # Dedicated GitOps Vault (102 Q&As)
    ├── observability.html          # Dedicated Observability Vault (103 Q&As)
    ├── security.html               # Dedicated DevSecOps Vault (102 Q&As)
    ├── scenario.html               # Dedicated Scenarios Vault (107 Q&As)
    ├── community.html              # Community Q&A Forum
    ├── css/
    │   └── style.css               # Cyberpunk HUD design system
    └── js/
        ├── all_questions.js        # Master dataset with 1,326+ curated questions
        ├── app.js                  # Core helpers
        └── cyber_app.js            # Interactive CLI terminal, mastery tracker & quiz engine
```

---

## 📄 License & Attribution
Designed and maintained for DevOps & SRE interview candidates worldwide.
All rights reserved © 2026.

