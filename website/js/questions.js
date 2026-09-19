// DevOps & SRE Comprehensive Interview Question Bank
// Sourced from extensive interview preparation guides & production cheat sheets

const interviewQuestions = {
    linux: [
        {
            id: 'l1',
            level: 'junior',
            question: 'What is the difference between Hard Links and Soft (Symbolic) Links in Linux?',
            answer: `<strong>Hard Link:</strong> Directly points to the file inode on the filesystem. It shares the same inode number and file permissions. If the original file is deleted, the hard link still provides access to the file data. Hard links cannot span across different filesystems or partitions, and cannot link to directories.
<br><br>
<strong>Soft (Symbolic) Link:</strong> Acts like a Windows shortcut—it is an independent small file that contains the file path of the target file (has its own inode). If the original file is deleted, the symlink breaks (dangling link). Soft links can span across different filesystems and can link to directories.
<pre><code># Create Hard Link
ln original.txt hardlink.txt

# Create Soft Link
ln -s /path/to/original.txt symlink.txt

# Check Inode numbers
ls -li original.txt hardlink.txt symlink.txt</code></pre>`,
            tags: ['Linux', 'Filesystem', 'Inodes']
        },
        {
            id: 'l2',
            level: 'junior',
            question: 'What are Zombie and Orphan processes in Linux, and how do you handle them?',
            answer: `<strong>Zombie Process (Defunct):</strong> A process that has finished execution (called <code>exit()</code>) but still has an entry in the process table because its parent has not yet read its exit status via <code>wait()</code>. It consumes no CPU or memory, only a Process ID (PID) slot.
<br><em>How to kill:</em> You cannot kill a zombie with <code>kill -9</code> because it is already dead. You must signal the parent process (<code>kill -s SIGCHLD &lt;parent_pid&gt;</code>) or kill the parent process so `init`/`systemd` adopts and reaps it.
<br><br>
<strong>Orphan Process:</strong> A running process whose parent has terminated before it did. The Linux init system (PID 1 / systemd) automatically adopts orphan processes and reaps them when they terminate.
<pre><code># Find Zombie processes
ps aux | awk '{if ($8 ~ "Z") print $0}'
top -b -n 1 | grep zombie</code></pre>`,
            tags: ['Linux', 'Processes', 'Troubleshooting']
        },
        {
            id: 'l3',
            level: 'mid',
            question: 'Explain the Linux Boot Process step-by-step.',
            answer: `The Linux boot sequence consists of 6 primary stages:
<ol>
  <li><strong>BIOS / UEFI:</strong> Executes Power-On Self-Test (POST), checks hardware integrity, and locates the bootable drive (MBR or EFI system partition).</li>
  <li><strong>MBR / GRUB:</strong> Loads the bootloader (GRUB2). GRUB displays the OS selection menu and loads the selected Linux kernel into memory.</li>
  <li><strong>Kernel:</strong> Initializes hardware drivers, mounts the temporary root filesystem (<code>initramfs</code> or <code>initrd</code>), and executes the first user-space process.</li>
  <li><strong>initramfs / initrd:</strong> Loads temporary block drivers and modules required to mount the real root filesystem (<code>/</code>).</li>
  <li><strong>Systemd (PID 1):</strong> The init system takes control, reads configuration from <code>/etc/systemd/system/</code>, and starts system targets and background daemons.</li>
  <li><strong>Runlevel / Target:</strong> Reaches the default target (e.g., <code>multi-user.target</code> for CLI or <code>graphical.target</code> for GUI) and prompts the login screen.</li>
</ol>`,
            tags: ['Linux', 'Kernel', 'Boot']
        },
        {
            id: 'l4',
            level: 'mid',
            question: 'How do you troubleshoot a server with High Load Average and CPU spikes?',
            answer: `Follow this structured troubleshooting methodology:
<ol>
  <li><strong>Check Overall Load:</strong> Run <code>uptime</code> or <code>top</code> to inspect 1, 5, and 15-minute load averages against total CPU core count (<code>nproc</code>).</li>
  <li><strong>Identify Bottleneck Domain (CPU vs. I/O Wait):</strong>
    <ul>
      <li>High <code>%us</code> (user space): Application CPU bottleneck.</li>
      <li>High <code>%sy</code> (system): Kernel syscall or context switching bottleneck.</li>
      <li>High <code>%wa</code> (iowait): Disk I/O or NFS storage bottleneck.</li>
    </ul>
  </li>
  <li><strong>Find Resource-Hungry Processes:</strong> Run <code>pidstat 1</code> or <code>htop</code> sorted by CPU/Memory.</li>
  <li><strong>Inspect Disk I/O:</strong> Run <code>iostat -x 1 5</code> to check <code>%util</code>, <code>await</code>, and queue depth.</li>
  <li><strong>Trace Offending Process:</strong> Use <code>strace -p &lt;PID&gt; -c</code> for syscall profiling or <code>perf top</code>.</li>
</ol>
<pre><code># Quick diagnostics one-liner
vmstat 1 5
iostat -xz 1 5
sar -q 1 5</code></pre>`,
            tags: ['Linux', 'Performance', 'Troubleshooting']
        },
        {
            id: 'l5',
            level: 'senior',
            question: 'How does Linux Memory Management work, and what is the Linux OOM Killer mechanism?',
            answer: `Linux allocates physical RAM using page tables and virtual memory. Unused memory is aggressively utilized for <strong>Buffers & Page Cache</strong> to optimize I/O performance.
<br><br>
<strong>The OOM (Out Of Memory) Killer:</strong>
When available memory and swap are completely exhausted and the kernel cannot allocate a new page, the kernel invokes the OOM Killer. It calculates an <code>oom_badness_score</code> for all active processes based on:
<ul>
  <li>Total percentage of RAM consumed by the process.</li>
  <li>Process runtime and CPU usage (protects critical system processes).</li>
  <li>Manual configuration in <code>/proc/&lt;PID&gt;/oom_score_adj</code> (-1000 to +1000).</li>
</ul>
The process with the highest score is sent a <code>SIGKILL</code> (Exit Code 137).
<pre><code># Check OOM killer events in kernel ring buffer
dmesg -T | grep -i "oom"
journalctl -k | grep -i "killed process"

# Check badness score of process
cat /proc/&lt;PID&gt;/oom_score</code></pre>`,
            tags: ['Linux', 'Memory', 'Kernel', 'Troubleshooting']
        },
        {
            id: 'l6',
            level: 'mid',
            question: 'How do you track open file descriptors and handle "Too many open files" errors in production?',
            answer: `In Linux, "everything is a file" (sockets, pipes, disks, directories). Each open resource consumes a File Descriptor (FD).
<br><br>
<strong>Troubleshooting Steps:</strong>
<ol>
  <li>Check system-wide limits: <code>cat /proc/sys/fs/file-max</code></li>
  <li>Check per-process limit: <code>ulimit -n</code> or <code>cat /proc/&lt;PID&gt;/limits</code></li>
  <li>Count open FDs per process: <code>lsof -p &lt;PID&gt; | wc -l</code> or <code>ls /proc/&lt;PID&gt;/fd | wc -l</code></li>
  <li>Increase limits in <code>/etc/security/limits.conf</code>:
<pre><code>* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536</code></pre>
  </li>
  <li>For Systemd services, set <code>LimitNOFILE=65536</code> in the service unit file.</li>
</ol>`,
            tags: ['Linux', 'SysAdmin', 'Limits']
        }
    ],

    git: [
        {
            id: 'g1',
            level: 'junior',
            question: 'What is the difference between Git Merge and Git Rebase?',
            answer: `<strong>Git Merge:</strong> Combines changes from one branch into another by creating a new "merge commit". It preserves the exact chronological history and context of when branches were created and merged.
<br><em>Pros:</em> Non-destructive, historical transparency.
<br><em>Cons:</em> Commit history can become cluttered with many merge commits ("polluted history").
<br><br>
<strong>Git Rebase:</strong> Re-applies commits from your branch onto the tip of the target branch one by one, rewriting the commit hashes.
<br><em>Pros:</em> Results in a perfectly linear, clean commit history.
<br><em>Cons:</em> Rewrites commit history. <strong>Golden Rule of Rebase:</strong> Never rebase commits that have been pushed to a public/shared branch!
<pre><code># Merge feature into main
git checkout main
git merge feature-branch

# Rebase feature on main
git checkout feature-branch
git rebase main</code></pre>`,
            tags: ['Git', 'Branching', 'Workflow']
        },
        {
            id: 'g2',
            level: 'junior',
            question: 'What is the difference between Git Reset and Git Revert?',
            answer: `<strong>Git Reset:</strong> Moves the <code>HEAD</code> pointer backwards in commit history.
<ul>
  <li><code>--soft</code>: Keeps working directory and staging index untouched.</li>
  <li><code>--mixed</code> (default): Keeps working directory, unstages changes.</li>
  <li><code>--hard</code>: Completely discards all changes in working directory and staging area.</li>
</ul>
<em>Use Case:</em> Cleaning up local unpushed work.
<br><br>
<strong>Git Revert:</strong> Creates a brand new commit that performs the exact inverse of a targeted previous commit.
<br><em>Use Case:</em> Undoing pushed/shared commits safely without rewriting history.
<pre><code># Undo last commit locally (keep changes staged)
git reset --soft HEAD~1

# Safely undo a published commit
git revert &lt;commit-hash&gt;</code></pre>`,
            tags: ['Git', 'Rollbacks', 'BestPractices']
        },
        {
            id: 'g3',
            level: 'mid',
            question: 'What is a Detached HEAD state in Git and how do you recover from it?',
            answer: `A <strong>Detached HEAD</strong> state occurs when <code>HEAD</code> points directly to a specific commit hash or remote tag rather than a local named branch reference (e.g. after running <code>git checkout &lt;commit-sha&gt;</code>).
<br><br>
Any new commits made in this state will become orphaned and eligible for garbage collection (<code>git gc</code>) when switching branches.
<br><br>
<strong>How to recover/save work:</strong>
<pre><code># Create and switch to a new branch preserving detached commits
git switch -c recovery-branch
# Or traditional syntax:
git checkout -b recovery-branch

# If you accidentally switched away and lost the commits:
git reflog
git checkout -b recovery-branch &lt;commit-sha-from-reflog&gt;</code></pre>`,
            tags: ['Git', 'Troubleshooting', 'Reflog']
        },
        {
            id: 'g4',
            level: 'senior',
            question: 'Explain Git Cherry-Pick and Git Bisect with production scenarios.',
            answer: `<strong>Git Cherry-Pick:</strong> Selects a specific commit from one branch and applies its exact diff as a new commit onto the current branch.
<br><em>Scenario:</em> A hotfix was committed to <code>develop</code> branch, and needs to be urgently applied to <code>production</code> branch without deploying all intermediate unstable features in develop.
<pre><code>git checkout production
git cherry-pick &lt;hotfix-commit-hash&gt;</code></pre>
<br>
<strong>Git Bisect:</strong> Uses binary search algorithm across commit history to rapidly identify which exact commit introduced a bug or regression.
<pre><code>git bisect start
git bisect bad                 # Current commit is broken
git bisect good v1.4.0        # v1.4.0 was working
# Git checks out midpoint commits; test and mark:
git bisect good (or git bisect bad)
# After culprit identified:
git bisect reset</code></pre>`,
            tags: ['Git', 'Troubleshooting', 'Automation']
        }
    ],

    cicd: [
        {
            id: 'ci1',
            level: 'junior',
            question: 'What is the difference between Continuous Integration, Continuous Delivery, and Continuous Deployment?',
            answer: `<ul>
  <li><strong>Continuous Integration (CI):</strong> Developers frequently merge code into a shared repository. Every push triggers automated builds, unit tests, linting, and security scans to detect bugs early.</li>
  <li><strong>Continuous Delivery (CD):</strong> Extends CI by automating the release packaging and staging deployment process. Code is always in a deployable state, but deployment to production requires a <strong>manual human approval gate</strong>.</li>
  <li><strong>Continuous Deployment (CD):</strong> Fully automates the entire delivery pipeline—every single commit that passes all automated test and compliance stages is <strong>automatically deployed directly to production</strong> with zero human intervention.</li>
</ul>`,
            tags: ['CI/CD', 'DevOps', 'Definitions']
        },
        {
            id: 'ci2',
            level: 'mid',
            question: 'What is the "Build Once, Deploy Many" principle in CI/CD, and why is it critical?',
            answer: `<strong>The Golden Rule of CI/CD:</strong> An artifact (Docker container image or binary) must be compiled and built <strong>only once</strong> during the CI stage, uniquely tagged with the Git commit SHA (e.g., <code>myapp:a1b2c3d</code>), and promoted unchanged across Dev &rarr; QA &rarr; Staging &rarr; Production.
<br><br>
<strong>Why it is critical:</strong>
<ol>
  <li><strong>Environment Consistency:</strong> Rebuilding images per environment risks pulling updated dependencies, different compiler versions, or altered build artifacts, invalidating QA test results.</li>
  <li><strong>Traceability & Immutability:</strong> What was tested in Staging is mathematically identical (SHA digest match) to what runs in Production.</li>
  <li><strong>Decoupled Configuration:</strong> Environment-specific parameters (database URLs, API tokens) are injected at runtime via ConfigMaps, Secrets, or Environment Variables, never baked into the artifact.</li>
</ol>`,
            tags: ['CI/CD', 'BestPractices', 'Containers']
        },
        {
            id: 'ci3',
            level: 'mid',
            question: 'Compare Blue-Green vs. Canary Deployment strategies.',
            answer: `<strong>Blue-Green Deployment:</strong>
Two identical production environments exist. <strong>Blue</strong> is active and receives 100% of production traffic. <strong>Green</strong> hosts the new release.
<ul>
  <li><em>Mechanism:</em> Deploy and verify v2 on Green &rarr; Switch router/load balancer traffic instantly from Blue to Green.</li>
  <li><em>Pros:</em> Instantaneous cutover, near-instant zero-downtime rollback (switch back to Blue).</li>
  <li><em>Cons:</em> Requires double resource capacity ($2\times$ cost/infrastructure).</li>
</ul>
<br>
<strong>Canary Deployment:</strong>
Routes a tiny fraction of live user traffic (e.g., 5% &rarr; 25% &rarr; 50% &rarr; 100%) to the new version while the rest remains on the old version.
<ul>
  <li><em>Mechanism:</em> Traffic split via Service Mesh (Istio), Ingress annotations, or Argo Rollouts. Metrics (error rate, P99 latency) are continuously monitored.</li>
  <li><em>Pros:</em> Minimizes blast radius; early detection of production bugs on real users.</li>
  <li><em>Cons:</em> Requires sophisticated observability and traffic routing infrastructure.</li>
</ul>`,
            tags: ['CI/CD', 'Deployments', 'Architecture']
        },
        {
            id: 'ci4',
            level: 'senior',
            question: 'How do you design a secure, highly scalable CI/CD pipeline for 20+ Microservices?',
            answer: `<strong>Architectural Blueprint:</strong>
<ol>
  <li><strong>Repository Strategy:</strong> Monorepo with path-based change detection (e.g., Nx / Turborepo) or Multi-repo with standardized shared pipeline templates.</li>
  <li><strong>Ephemeral Self-Hosted Runners:</strong> Kubernetes-based dynamic autoscaling runners (e.g., Actions Runner Controller - ARC / Kubernetes plugin for Jenkins) that spin up runner pods on-demand and terminate after job completion.</li>
  <li><strong>Security Gates (Shift-Left DevSecOps):</strong>
    <ul>
      <li>SAST: SonarQube / Semgrep</li>
      <li>SCA: OWASP Dependency-Check / Snyk</li>
      <li>Container Vulnerability Scan: Trivy (break build on CRITICAL CVEs)</li>
      <li>Secret Detection: Gitleaks / TruffleHog</li>
      <li>Image Signing: Cosign / Notary</li>
    </ul>
  </li>
  <li><strong>Artifact Management:</strong> Push immutable commit-SHA tagged images to ECR/ACR with image immutability enabled.</li>
  <li><strong>GitOps Deployment:</strong> Pipeline updates the image tag in a central GitOps repository (Kustomize/Helm); ArgoCD synchronizes cluster state.</li>
</ol>`,
            tags: ['CI/CD', 'SystemDesign', 'Security', 'Enterprise']
        }
    ],

    docker: [
        {
            id: 'd1',
            level: 'junior',
            question: 'What is the fundamental difference between Containers and Virtual Machines?',
            answer: `<strong>Virtual Machines (VMs):</strong> Virtualize the physical hardware layer. Each VM includes a complete Guest Operating System, its own kernel, binaries, libraries, and virtual device drivers running on top of a Hypervisor (Type 1 or Type 2). Boot time takes minutes, and disk/memory footprint is measured in Gigabytes.
<br><br>
<strong>Containers:</strong> Virtualize the operating system kernel. Containers run as isolated user-space processes directly on the host OS kernel, utilizing Linux <strong>Namespaces</strong> (isolation of PID, Network, Mount, IPC, UTS) and <strong>Control Groups (cgroups)</strong> (resource throttling for CPU, Memory, I/O). Boot time takes milliseconds, and footprint is measured in Megabytes.`,
            tags: ['Docker', 'Containers', 'Architecture']
        },
        {
            id: 'd2',
            level: 'junior',
            question: 'What is the difference between CMD and ENTRYPOINT in a Dockerfile?',
            answer: `<strong>ENTRYPOINT:</strong> Defines the default executable command for the container that is intended to run as PID 1. It is fixed and cannot be easily overridden unless passing <code>--entrypoint</code> explicitly.
<br><br>
<strong>CMD:</strong> Defines default arguments passed to the <code>ENTRYPOINT</code>, or default command if <code>ENTRYPOINT</code> is omitted. Runtime arguments passed to <code>docker run</code> will completely overwrite <code>CMD</code>.
<pre><code># Dockerfile Example
ENTRYPOINT ["python3", "app.py"]
CMD ["--port", "8080"]

# Running container normally executes: python3 app.py --port 8080
docker run myimage

# Overriding CMD executes: python3 app.py --port 9090
docker run myimage --port 9090</code></pre>`,
            tags: ['Docker', 'Dockerfile', 'CLI']
        },
        {
            id: 'd3',
            level: 'mid',
            question: 'How do you optimize Docker image size and maximize build layer caching?',
            answer: `Apply these production Docker optimization strategies:
<ol>
  <li><strong>Multi-Stage Builds:</strong> Compile code in a heavy build stage with full SDKs, then copy only the compiled binary to a minimal base image (<code>alpine</code> or <code>gcr.io/distroless</code>).</li>
  <li><strong>Order Instructions by Change Frequency:</strong> Put rarely changing instructions first (<code>COPY package.json</code> &rarr; <code>RUN npm install</code>) before frequently changing source code (<code>COPY . .</code>).</li>
  <li><strong>Combine RUN Commands:</strong> Chain commands with <code>&&</code> and clean package manager caches in the same layer:
<pre><code>RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    && rm -rf /var/lib/apt/lists/*</code></pre>
  </li>
  <li><strong>Use <code>.dockerignore</code>:</strong> Exclude <code>node_modules</code>, <code>.git</code>, test reports, and temporary logs from the build context.</li>
  <li><strong>Run as Non-Root User:</strong> Create an unprivileged user (<code>USER appuser</code>) for runtime security.</li>
</ol>`,
            tags: ['Docker', 'Optimization', 'Security']
        },
        {
            id: 'd4',
            level: 'senior',
            question: 'Explain Linux Namespaces and Cgroups in the context of container isolation.',
            answer: `Containers are not physical entities; they are standard Linux processes isolated by two kernel primitives:
<br><br>
<strong>1. Linux Namespaces (Provides Isolation - "What a process can see"):</strong>
<ul>
  <li><strong>PID Namespace:</strong> Isolates Process IDs (container main process sees itself as PID 1).</li>
  <li><strong>NET Namespace:</strong> Isolates network interfaces, IP addresses, routing tables, and port bindings.</li>
  <li><strong>MNT Namespace:</strong> Isolates filesystem mount points (root filesystem pivot).</li>
  <li><strong>UTS Namespace:</strong> Isolates hostnames and domain names.</li>
  <li><strong>IPC Namespace:</strong> Isolates Inter-Process Communication (semaphores, message queues).</li>
  <li><strong>USER Namespace:</strong> Maps container root UID 0 to an unprivileged UID on the host.</li>
</ul>
<br>
<strong>2. Control Groups / cgroups (Provides Metering - "How much a process can use"):</strong>
Enforces strict resource allocation and limits for CPU, RAM, Disk I/O, and Network bandwidth. If memory exceeds the cgroup limit, the kernel OOM killer terminates the container process.`,
            tags: ['Docker', 'Kernel', 'Security', 'Internals']
        }
    ],

    kubernetes: [
        {
            id: 'k1',
            level: 'junior',
            question: 'Explain the core Kubernetes Architecture (Control Plane vs. Worker Nodes).',
            answer: `<strong>Control Plane (The Brain):</strong>
<ul>
  <li><strong>kube-apiserver:</strong> Central REST API gateway, authenticates, authorizes (RBAC), and validates all requests.</li>
  <li><strong>etcd:</strong> Highly available, distributed key-value store using Raft consensus; holds the single source of truth for all cluster state.</li>
  <li><strong>kube-scheduler:</strong> Watches unscheduled pods and assigns them to optimal worker nodes based on resource capacity, affinity, and taints.</li>
  <li><strong>kube-controller-manager:</strong> Runs core reconciliation control loops (Deployment, ReplicaSet, Node, Namespace controllers).</li>
</ul>
<br>
<strong>Worker Nodes (The Muscles):</strong>
<ul>
  <li><strong>kubelet:</strong> Node agent that communicates with API Server, instructs container runtime (containerd) to run containers, and reports node/pod health.</li>
  <li><strong>kube-proxy:</strong> Manages Service networking by programming OS kernel iptables or IPVS rules to load-balance traffic to pod IPs.</li>
  <li><strong>Container Runtime (containerd / CRI-O):</strong> Executes and manages container lifecycles.</li>
  <li><strong>CNI Plugin (Calico/Cilium/Flannel):</strong> Provides pod-to-pod flat network routing.</li>
</ul>`,
            tags: ['Kubernetes', 'Architecture', 'ControlPlane']
        },
        {
            id: 'k2',
            level: 'junior',
            question: 'What is the difference between Liveness, Readiness, and Startup Probes in Kubernetes?',
            answer: `<ul>
  <li><strong>Liveness Probe:</strong> Detects if the container has crashed or entered an unrecoverable deadlock. If it fails, <strong>kubelet kills and restarts the container</strong>.</li>
  <li><strong>Readiness Probe:</strong> Detects if the container is ready to accept incoming user traffic (e.g. database connections established, cache warmed). If it fails, the pod is <strong>temporarily removed from Service endpoints</strong>; the container is NOT restarted.</li>
  <li><strong>Startup Probe:</strong> Protects slow-starting legacy applications (e.g. apps taking >30s to boot). Disables Liveness and Readiness probes until the Startup probe succeeds, preventing premature restart loops.</li>
</ul>
<pre><code>livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5</code></pre>`,
            tags: ['Kubernetes', 'Probes', 'Reliability']
        },
        {
            id: 'k3',
            level: 'mid',
            question: 'Explain Kubernetes Service Types: ClusterIP, NodePort, LoadBalancer, and Ingress.',
            answer: `<ul>
  <li><strong>ClusterIP (Default):</strong> Assigns a stable internal virtual IP accessible only within the Kubernetes cluster. Used for internal microservice-to-microservice communication.</li>
  <li><strong>NodePort:</strong> Exposes the Service on a static high port (range <code>30000–32767</code>) on every worker node's external IP address.</li>
  <li><strong>LoadBalancer:</strong> Provisions an external Cloud Provider Load Balancer (e.g., AWS NLB/ALB, Azure LB) that automatically routes public traffic into the Service's NodePorts. (1 LB per Service).</li>
  <li><strong>Ingress:</strong> A Layer 7 (HTTP/HTTPS) reverse proxy and router. Consolidates multiple microservice hostnames and URL paths behind a single external IP / Load Balancer, handling SSL/TLS termination and path-based routing.</li>
</ul>`,
            tags: ['Kubernetes', 'Networking', 'Services']
        },
        {
            id: 'k4',
            level: 'mid',
            question: 'How do you troubleshoot a Pod stuck in Pending, CrashLoopBackOff, or ImagePullBackOff?',
            answer: `<strong>1. Pod stuck in Pending:</strong>
Run <code>kubectl describe pod &lt;pod-name&gt;</code> and check the <strong>Events</strong> section:
<ul>
  <li><em>Insufficient Resources:</em> Nodes don't have enough CPU/Memory to satisfy <code>resources.requests</code>.</li>
  <li><em>Taints/Tolerations:</em> Node has taints that the pod does not tolerate.</li>
  <li><em>PVC Unbound:</em> PVC requested by pod is not bound to a PV or storage class is misconfigured.</li>
</ul>
<br>
<strong>2. Pod in CrashLoopBackOff:</strong>
<ul>
  <li>Check previous logs: <code>kubectl logs &lt;pod-name&gt; --previous</code></li>
  <li>Inspect exit code: Exit Code 137 indicates <code>OOMKilled</code> (Memory limit exceeded); Exit Code 1 indicates application startup crash/unhandled exception.</li>
  <li>Check missing environment variables or secret keys.</li>
</ul>
<br>
<strong>3. Pod in ImagePullBackOff / ErrImagePull:</strong>
<ul>
  <li>Verify image name and tag spelling.</li>
  <li>Check private registry authentication: verify <code>imagePullSecrets</code> exists and is linked.</li>
  <li>Check network routing between worker nodes and container registry.</li>
</ul>`,
            tags: ['Kubernetes', 'Troubleshooting', 'Operations']
        },
        {
            id: 'k5',
            level: 'senior',
            question: 'How do Horizontal Pod Autoscaler (HPA) and Cluster Autoscaler (CA) cooperate during traffic surges?',
            answer: `<strong>The Dual Autoscaling Workflow:</strong>
<ol>
  <li><strong>Traffic Surge:</strong> User request volume spikes, causing pod CPU/Memory utilization to exceed the target configured in HPA (e.g., target 60% CPU).</li>
  <li><strong>HPA Scales Pods:</strong> HPA controller periodically queries the Metrics Server and calculates desired replicas ($R = \\lceil \\text{Current} \\times \\frac{\\text{ActualMetric}}{\\text{TargetMetric}} \\rceil$), updating the Deployment replica count.</li>
  <li><strong>Cluster Capacity Exhaustion:</strong> As new pods are created, worker node CPU/Memory capacity is exhausted. The Scheduler cannot place the pods, leaving them in <strong>Pending</strong> state.</li>
  <li><strong>Cluster Autoscaler (CA) Triggers:</strong> CA detects pods stuck in Pending due to resource constraints. It requests the cloud provider (AWS Auto Scaling Group / Azure VMSS) to provision new worker node VM instances.</li>
  <li><strong>Resolution:</strong> New nodes join the cluster in <code>Ready</code> state &rarr; Kube-scheduler places the Pending pods &rarr; Traffic load normalizes.</li>
</ol>`,
            tags: ['Kubernetes', 'Autoscaling', 'Production', 'Architecture']
        },
        {
            id: 'k6',
            level: 'senior',
            question: 'What are Kubernetes Network Policies, and how do you achieve Zero Trust microsegmentation?',
            answer: `By default, Kubernetes uses a flat, open networking model where <strong>all pods can communicate with all other pods</strong> across all namespaces.
<br><br>
<strong>Network Policies:</strong> Declarative Layer 3/Layer 4 firewall rules enforced by CNI plugins (Calico, Cilium).
<br><br>
<strong>Zero-Trust Production Pattern:</strong>
<ol>
  <li><strong>Default Deny All Ingress:</strong> Block all inbound traffic in the namespace by default.</li>
  <li><strong>Explicit Allow Rules:</strong> Explicitly permit only necessary communication flows using pod labels and port numbers (e.g., Ingress Controller &rarr; Frontend Pods &rarr; Backend API:8080 &rarr; Database:5432).</li>
</ol>
<pre><code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend-only
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: backend-api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080</code></pre>`,
            tags: ['Kubernetes', 'Security', 'NetworkPolicy', 'ZeroTrust']
        }
    ],

    terraform: [
        {
            id: 't1',
            level: 'junior',
            question: 'What is Terraform State (`terraform.tfstate`) and why is it essential?',
            answer: `<strong>Terraform State:</strong> A JSON metadata file that records the mapping between resources declared in your HCL code and the actual real-world infrastructure objects created in your cloud provider.
<br><br>
<strong>Why it is essential:</strong>
<ul>
  <li><strong>Change Tracking:</strong> Terraform uses state to calculate diffs during <code>terraform plan</code> (determines whether to create, update in-place, or recreate resources).</li>
  <li><strong>Performance / Metadata Caching:</strong> Stores resource dependencies, IP addresses, and metadata without needing to query cloud provider APIs on every single line of code.</li>
  <li><strong>Dependency Management:</strong> Tracks resource dependency graphs to orchestrate correct provisioning and destruction orders.</li>
</ul>`,
            tags: ['Terraform', 'State', 'Fundamentals']
        },
        {
            id: 't2',
            level: 'junior',
            question: 'What is the difference between `terraform plan` and `terraform apply`?',
            answer: `<strong>`terraform plan`:</strong> A read-only dry-run command that refreshes the state against cloud reality, compares declared code with current state, and prints an execution plan showing proposed changes (<code>+ create</code>, <code>~ modify</code>, <code>- destroy</code>). It makes zero modifications to cloud infrastructure.
<br><br>
<strong>`terraform apply`:</strong> Executes the proposed execution plan by issuing real API calls to cloud providers, creating/updating infrastructure, and writing the newly returned resource IDs back to the state file.
<pre><code># Best practice for CI/CD pipelines
terraform plan -out=tfplan.binary
terraform apply tfplan.binary</code></pre>`,
            tags: ['Terraform', 'CLI', 'Workflow']
        },
        {
            id: 't3',
            level: 'mid',
            question: 'Why is Remote State with State Locking mandatory for teams, and how is it configured in AWS/Azure?',
            answer: `<strong>Why Local State Fails in Teams:</strong>
<ul>
  <li>Local state cannot be shared safely across developers.</li>
  <li>Risk of committing sensitive secrets (database passwords stored in state) to Git.</li>
  <li><strong>State Corruption / Race Conditions:</strong> If two engineers run <code>terraform apply</code> simultaneously, the state file will be overwritten and permanently corrupted.</li>
</ul>
<br>
<strong>Remote State with Locking:</strong>
Stores state in centralized, encrypted cloud storage and acquires an exclusive lease lock during operations.
<pre><code># AWS S3 + DynamoDB Locking
terraform {
  backend "s3" {
    bucket         = "company-tf-state-prod"
    key            = "vpc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}</code></pre>`,
            tags: ['Terraform', 'RemoteState', 'Locking', 'S3']
        },
        {
            id: 't4',
            level: 'mid',
            question: 'What is Configuration Drift in Terraform and how do you detect and fix it?',
            answer: `<strong>Configuration Drift:</strong> Occurs when real-world cloud infrastructure is modified outside of Terraform (e.g., an engineer manually opened port 22 in an AWS Security Group via the AWS Web Console).
<br><br>
<strong>How to Detect & Remediate:</strong>
<ol>
  <li><strong>Detect Drift:</strong> Run <code>terraform plan</code> (or <code>terraform refresh</code>). Terraform queries cloud APIs, compares live reality against code, and highlights the manual discrepancies.</li>
  <li><strong>Fix Drift (Option A - Overwrite manual changes):</strong> Run <code>terraform apply</code> to revert cloud infrastructure back to the declared configuration in code.</li>
  <li><strong>Fix Drift (Option B - Keep manual changes):</strong> Update your HCL code to match the manual changes and run <code>terraform apply</code> to synchronize state cleanly.</li>
</ol>`,
            tags: ['Terraform', 'Drift', 'Operations']
        },
        {
            id: 't5',
            level: 'senior',
            question: 'Explain `count` vs. `for_each` and when to use dynamic blocks in Terraform.',
            answer: `<strong>`count`:</strong> Creates multiple resource instances based on an integer count index (<code>count.index</code>).
<br><em>Major Risk:</em> If resources are created from a list by index (e.g. <code>["subnet-a", "subnet-b", "subnet-c"]</code>) and an item is deleted from the middle of the list, Terraform will destroy and recreate all subsequent resources due to shifted indices!
<br><br>
<strong>`for_each`:</strong> Iterates over a Map or Set of unique strings. Each resource gets a distinct, immutable key (<code>each.key</code>, <code>each.value</code>). Removing an item only deletes that specific resource without affecting others.
<br><br>
<strong>Dynamic Blocks:</strong> Programmatically generates repeated nested blocks inside a resource (e.g., multiple <code>ingress</code> rules in a Security Group) based on a complex variable collection.
<pre><code>resource "aws_security_group" "web" {
  name = "web-sg"
  dynamic "ingress" {
    for_each = var.service_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["10.0.0.0/16"]
    }
  }
}</code></pre>`,
            tags: ['Terraform', 'Loops', 'HCL', 'Advanced']
        }
    ],

    aws: [
        {
            id: 'a1',
            level: 'junior',
            question: 'What is the difference between AWS Security Groups and Network ACLs (NACLs)?',
            answer: `| Feature | Security Group (SG) | Network ACL (NACL) |
|---|---|---|
| **Operating Layer** | Instance / ENI Level | Subnet Boundary Level |
| **State Nature** | **Stateful** (Inbound return traffic is automatically allowed outbound regardless of rules) | **Stateless** (Return traffic must be explicitly allowed via ephemeral ports) |
| **Rule Types** | **ALLOW rules only** (Everything else implicitly denied) | **ALLOW and DENY rules** |
| **Rule Processing** | Evaluates all rules before making decision | Evaluates rules in strict numerical order (lowest number first) |`,
            tags: ['AWS', 'Networking', 'Security', 'VPC']
        },
        {
            id: 'a2',
            level: 'junior',
            question: 'What is an IAM Role, and why should EC2 instances never use hardcoded IAM Access Keys?',
            answer: `An <strong>IAM Role</strong> is an AWS identity with permission policies that determine what actions can be performed, but is not associated with a permanent user password or access key. Instead, it is assumed by AWS services or federated identities.
<br><br>
<strong>Why Hardcoded Access Keys are Dangerous:</strong>
<ul>
  <li>Static access keys can be accidentally committed to Git repositories or leaked in application logs.</li>
  <li>Keys do not expire automatically and require tedious manual rotation.</li>
</ul>
<br>
<strong>Best Practice:</strong> Attach an IAM Role to an <strong>EC2 Instance Profile</strong>. The AWS SDK automatically fetches short-lived temporary STS credentials from the <strong>EC2 Instance Metadata Service (IMDS)</strong> (<code>http://169.254.169.254/latest/meta-data/</code>) and rotates them automatically without downtime.`,
            tags: ['AWS', 'IAM', 'Security', 'BestPractices']
        },
        {
            id: 'a3',
            level: 'mid',
            question: 'What is the difference between Application Load Balancer (ALB) and Network Load Balancer (NLB)?',
            answer: `<ul>
  <li><strong>Application Load Balancer (ALB):</strong> Operates at <strong>Layer 7 (HTTP/HTTPS)</strong>.
    <ul>
      <li>Supports advanced routing: Path-based (<code>/api/*</code> vs <code>/web/*</code>), Host-based (<code>api.domain.com</code>), HTTP headers, and query parameters.</li>
      <li>Handles SSL/TLS termination and WebSocket traffic.</li>
      <li>Slightly higher latency due to deep packet inspection.</li>
    </ul>
  </li>
  <li><strong>Network Load Balancer (NLB):</strong> Operates at <strong>Layer 4 (TCP/UDP/TLS)</strong>.
    <ul>
      <li>Ultra-high performance, capable of handling millions of requests per second with sub-millisecond latency.</li>
      <li>Provides static / Elastic IP addresses per Availability Zone.</li>
      <li>Preserves client source IP address automatically.</li>
      <li>Best for gaming, streaming, database load balancing, and TLS passthrough.</li>
    </ul>
  </li>
</ul>`,
            tags: ['AWS', 'LoadBalancers', 'Networking']
        },
        {
            id: 'a4',
            level: 'senior',
            question: 'How do you architect a Multi-Region, Disaster-Resilient application on AWS?',
            answer: `<strong>Multi-Region Architecture Design:</strong>
<ol>
  <li><strong>Global Traffic Management:</strong> AWS Route 53 with Latency-based or Failover routing policies and health checks (or AWS Global Accelerator).</li>
  <li><strong>Compute Layer:</strong> Amazon EKS / ECS deployed in Primary (e.g., <code>us-east-1</code>) and Secondary (e.g., <code>us-west-2</code>) regions, managed via GitOps (ArgoCD).</li>
  <li><strong>Data Layer:</strong>
    <ul>
      <li>Relational: Amazon Aurora Global Database with sub-second cross-region replication and fast failover.</li>
      <li>NoSQL: Amazon DynamoDB Global Tables (active-active multi-region replication).</li>
      <li>Object Storage: Amazon S3 Cross-Region Replication (CRR) with versioning enabled.</li>
    </ul>
  </li>
  <li><strong>Secrets & Config:</strong> AWS Secrets Manager multi-region replica keys.</li>
  <li><strong>Disaster Recovery Strategy:</strong>
    <ul>
      <li><strong>Pilot Light / Warm Standby:</strong> Secondary region runs minimal resources and scales up on failover (low cost, RTO &lt; 15 mins).</li>
      <li><strong>Active-Active:</strong> Both regions actively serve traffic simultaneously (zero RTO, highest cost).</li>
    </ul>
  </li>
</ol>`,
            tags: ['AWS', 'SystemDesign', 'DisasterRecovery', 'HighAvailability']
        }
    ],

    networking: [
        {
            id: 'n1',
            level: 'junior',
            question: 'Explain the difference between TCP and UDP with real-world examples.',
            answer: `<strong>TCP (Transmission Control Protocol):</strong>
Connection-oriented protocol. Establishes a connection via a 3-way handshake (SYN &rarr; SYN-ACK &rarr; ACK) before transmitting data. Guarantees ordered delivery, error checking, and retransmission of lost packets.
<br><em>Use Cases:</em> Web traffic (HTTP/HTTPS), File transfers (SSH/SFTP), Databases (MySQL, PostgreSQL), REST APIs.
<br><br>
<strong>UDP (User Datagram Protocol):</strong>
Connectionless protocol. Sends standalone datagrams with no handshake, no delivery guarantees, and no ordering or retransmission. Minimal overhead and lowest latency.
<br><em>Use Cases:</em> DNS queries (port 53), Video streaming, VoIP, Gaming, DHCP, Metrics collection (StatsD).`,
            tags: ['Networking', 'Protocols', 'TCP', 'UDP']
        },
        {
            id: 'n2',
            level: 'junior',
            question: 'What is DNS, and how does the recursive DNS lookup process work?',
            answer: `DNS (Domain Name System) translates human-friendly domain names (<code>api.example.com</code>) into machine-routable IP addresses (<code>93.184.216.34</code>).
<br><br>
<strong>Step-by-Step Recursive Resolution:</strong>
<ol>
  <li><strong>Browser / OS Cache:</strong> Checks local DNS cache and <code>/etc/hosts</code>.</li>
  <li><strong>Recursive Resolver:</strong> Queries the configured ISP or cloud resolver (e.g. <code>8.8.8.8</code>).</li>
  <li><strong>Root Nameserver (<code>.</code>):</strong> Directs the resolver to the Top-Level Domain (TLD) server.</li>
  <li><strong>TLD Nameserver (<code>.com</code>):</strong> Directs resolver to the domain's Authoritative Nameservers.</li>
  <li><strong>Authoritative Nameserver:</strong> Holds the official DNS records and returns the IP address.</li>
  <li><strong>Client Connection:</strong> Resolver caches the record based on TTL (Time-To-Live) and returns the IP to the browser.</li>
</ol>`,
            tags: ['Networking', 'DNS', 'Architecture']
        },
        {
            id: 'n3',
            level: 'mid',
            question: 'What is the exact difference between "Connection Refused" and "Connection Timeout"?',
            answer: `<strong>Connection Refused (Fast Failure):</strong>
<ul>
  <li><em>Symptom:</em> Command fails immediately with <code>Connection refused</code>.</li>
  <li><em>Underlying Cause:</em> The TCP SYN packet reached the destination host, but the destination OS kernel sent back an immediate <code>TCP RST</code> (Reset) packet because <strong>no application is actively listening on that target port</strong> (or a local host firewall explicitly rejected it).</li>
</ul>
<br>
<strong>Connection Timeout (Slow Failure):</strong>
<ul>
  <li><em>Symptom:</em> Command hangs for 30–60 seconds before timing out.</li>
  <li><em>Underlying Cause:</em> The TCP SYN packet was <strong>silently dropped</strong> along the network path. The client receives no response at all. Common causes include: intermediate firewall / AWS Security Group rules dropping traffic, missing route in route table, or broken default gateway.</li>
</ul>`,
            tags: ['Networking', 'Troubleshooting', 'TCP', 'Firewalls']
        },
        {
            id: 'n4',
            level: 'senior',
            question: 'Walk through the 10-Step Professional Network Troubleshooting Framework.',
            answer: `When diagnosing an application connectivity failure (e.g., <code>App Server A cannot talk to Database B</code>):
<ol>
  <li><strong>Step 1 (DNS):</strong> Run <code>dig database.example.com</code> to verify correct IP resolution.</li>
  <li><strong>Step 2 (Local Resolution):</strong> Run <code>getent hosts database.example.com</code> to check <code>/etc/hosts</code>.</li>
  <li><strong>Step 3 (Routing):</strong> Run <code>ip route</code> to ensure a valid route and default gateway exist.</li>
  <li><strong>Step 4 (L3 Reachability):</strong> Run <code>ping &lt;IP&gt;</code> to test ICMP path and latency.</li>
  <li><strong>Step 5 (L4 Port Reachability):</strong> Run <code>nc -zv &lt;IP&gt; 5432</code> to test the TCP 3-way handshake.</li>
  <li><strong>Step 6 (Listening Socket):</strong> On destination host, run <code>ss -lntp | grep 5432</code> to ensure database is bound to <code>0.0.0.0</code> rather than <code>127.0.0.1</code>.</li>
  <li><strong>Step 7 (L7 HTTP/TLS):</strong> Run <code>curl -vvv https://...</code> or use DB client to verify TLS negotiation and application handshake.</li>
  <li><strong>Step 8 (Firewalls & Security Groups):</strong> Verify AWS Security Groups, NACLs, and <code>iptables -L</code> / <code>nftables</code>.</li>
  <li><strong>Step 9 (Packet Capture):</strong> Run <code>tcpdump -i eth0 host &lt;IP&gt; and port 5432 -nn</code> to check for SYN, RST, or dropped frames.</li>
  <li><strong>Step 10 (App Logs):</strong> Check connection pool exhaustion, max connections, and authorization rules (e.g. <code>pg_hba.conf</code>).</li>
</ol>`,
            tags: ['Networking', 'Troubleshooting', 'Methodology']
        }
    ],

    gitops: [
        {
            id: 'go1',
            level: 'junior',
            question: 'What is GitOps and what are its core principles?',
            answer: `<strong>GitOps:</strong> An operational framework that takes DevOps best practices used for application development (version control, collaboration, compliance, CI/CD) and applies them to infrastructure automation.
<br><br>
<strong>The 4 Core Principles of GitOps (OpenGitOps):</strong>
<ol>
  <li><strong>Declarative:</strong> The entire system desired state is described declaratively (e.g., Kubernetes YAML, Helm, Kustomize).</li>
  <li><strong>Versioned & Immutable:</strong> Desired state is stored in Git as the single source of truth with complete audit history.</li>
  <li><strong>Pulled Automatically:</strong> Software agents (ArgoCD / Flux) running inside the cluster continuously pull state from Git.</li>
  <li><strong>Continuously Reconciled:</strong> Agents monitor actual live state and automatically remediate or alert on <strong>configuration drift</strong>.</li>
</ol>`,
            tags: ['GitOps', 'ArgoCD', 'Definitions']
        },
        {
            id: 'go2',
            level: 'mid',
            question: 'What is the difference between Push-based CI/CD and Pull-based GitOps?',
            answer: `<strong>Push-Based CI/CD (Traditional Jenkins / GitHub Actions):</strong>
The CI pipeline executes <code>kubectl apply</code> or cloud commands directly against the target cluster.
<ul>
  <li><em>Disadvantages:</em> Requires storing highly privileged cluster credentials inside the external CI system (security risk); cannot automatically detect manual cluster drift.</li>
</ul>
<br>
<strong>Pull-Based GitOps (ArgoCD / Flux):</strong>
An operator agent resides inside the Kubernetes cluster and pulls manifests from Git.
<ul>
  <li><em>Advantages:</em> Zero external access credentials needed for the cluster; cluster firewall stays closed; continuous reconciliation loop actively detects and fixes manual drift.</li>
</ul>`,
            tags: ['GitOps', 'CI/CD', 'ArgoCD', 'Architecture']
        },
        {
            id: 'go3',
            level: 'senior',
            question: 'Explain ArgoCD ApplicationSets and how to manage multi-tenant, multi-cluster deployments.',
            answer: `<strong>ArgoCD ApplicationSets:</strong> An ArgoCD controller that automates the generation and management of multiple ArgoCD Applications using generators:
<ul>
  <li><strong>List Generator:</strong> Passes explicit lists of clusters and environments.</li>
  <li><strong>Cluster Generator:</strong> Automatically discovers registered Kubernetes clusters and deploys base infrastructure to each.</li>
  <li><strong>Git Directory / File Generator:</strong> Scans a Git repository directory tree and creates an application for each subfolder found.</li>
  <li><strong>Matrix Generator:</strong> Combines two generators (e.g., deploy 5 microservices across 3 cloud regions = 15 applications generated automatically from one manifest).</li>
</ul>
<br>
<strong>Multi-Tenant Pattern:</strong> Use ArgoCD <strong>App of Apps pattern</strong> paired with RBAC Projects to enforce namespace isolation, destination cluster whitelisting, and Git source constraints.`,
            tags: ['GitOps', 'ArgoCD', 'ApplicationSets', 'MultiCluster']
        }
    ],

    monitoring: [
        {
            id: 'm1',
            level: 'junior',
            question: 'What are the Three Pillars of Observability?',
            answer: `<ul>
  <li><strong>Metrics:</strong> Numeric aggregatable data points measured over time intervals (CPU %, Memory MB, Request Rate RPS, P99 Latency). Optimized for real-time alerting and dashboard visualization (e.g., Prometheus, Grafana, Datadog).</li>
  <li><strong>Logs:</strong> Discrete, timestamped event records detailing what happened at a specific point in time with rich context (e.g., stack traces, error messages). Ideal for root-cause post-mortem debugging (e.g., ELK Stack, Loki).</li>
  <li><strong>Traces:</strong> End-to-end representation of a single request journey as it traverses multiple distributed microservices, databases, and message queues. Pinpoints exactly which microservice caused latency (e.g., Jaeger, OpenTelemetry, AWS X-Ray).</li>
</ul>`,
            tags: ['Observability', 'Metrics', 'Logs', 'Traces']
        },
        {
            id: 'm2',
            level: 'mid',
            question: 'Explain the Golden Signals of Monitoring (Google SRE book).',
            answer: `The 4 Golden Signals of SRE monitoring:
<ol>
  <li><strong>Latency:</strong> The time it takes to service a request (distinguish between successful request latency vs. error request latency).</li>
  <li><strong>Traffic:</strong> A measure of demand placed on the system (e.g., HTTP requests per second, network I/O throughput).</li>
  <li><strong>Errors:</strong> The rate of requests that fail (e.g., HTTP 500s, DB connection timeouts, unhandled exceptions).</li>
  <li><strong>Saturation:</strong> How "full" the service is, measuring constrained system resources (e.g., CPU memory utilization, DB connection pool depth, disk queue).</li>
</ol>`,
            tags: ['SRE', 'Monitoring', 'GoogleSRE', 'BestPractices']
        },
        {
            id: 'm3',
            level: 'senior',
            question: 'What are SLI, SLO, SLA, and Error Budgets? How do SREs use them to balance velocity and reliability?',
            answer: `<ul>
  <li><strong>SLI (Service Level Indicator):</strong> A quantifiable metric measuring real-time service performance (e.g., <em>Percentage of successful HTTP requests with latency &lt; 200ms</em>).</li>
  <li><strong>SLO (Service Level Objective):</strong> An internal target reliability goal agreed upon by engineering and product teams (e.g., <em>99.9% of requests meet the SLI over a rolling 30-day window</em>).</li>
  <li><strong>SLA (Service Level Agreement):</strong> A legal contract with external customers specifying penalties or financial refunds if reliability falls below a threshold (e.g., <em>99.5% availability</em>).</li>
  <li><strong>Error Budget ($100\% - \text{SLO}$):</strong> The allowable amount of downtime or failure within a period (e.g., a $99.9\%$ SLO gives an error budget of $0.1\% \approx 43.8\text{ minutes/month}$).</li>
</ul>
<br>
<strong>How SREs Balance Velocity:</strong>
As long as the Error Budget is green, developers are free to push risky features rapidly. If the Error Budget is exhausted, feature releases are automatically frozen, and engineering focus shifts 100% to reliability and technical debt.`,
            tags: ['SRE', 'SLO', 'SLA', 'ErrorBudgets']
        }
    ],

    security: [
        {
            id: 's1',
            level: 'junior',
            question: 'What is DevSecOps and what is the "Shift-Left" security philosophy?',
            answer: `<strong>DevSecOps:</strong> Integrating security practices and compliance checks directly into every stage of the software development lifecycle (SDLC), rather than treating security as an afterthought bottleneck at the end of the release cycle.
<br><br>
<strong>Shift-Left Philosophy:</strong> Moving security testing as early as possible in the development pipeline (to the "left" of the timeline):
<ul>
  <li>Developer workstation: IDE security linters & pre-commit hooks (Gitleaks).</li>
  <li>Pull Request: SAST (SonarQube) & Dependency vulnerability scanning (Snyk/OWASP).</li>
  <li>CI Build: Container image scanning (Trivy) & IaC policy scanning (Checkov/tfsec).</li>
  <li>Kubernetes Admission: OPA Gatekeeper / Kyverno policies enforcing non-root containers.</li>
</ul>`,
            tags: ['Security', 'DevSecOps', 'ShiftLeft']
        },
        {
            id: 's2',
            level: 'mid',
            question: 'What is the difference between SAST, DAST, and SCA?',
            answer: `<ul>
  <li><strong>SAST (Static Application Security Testing):</strong> "White-box" testing that analyzes source code, bytecode, or binaries for security vulnerabilities (SQL injection, XSS, hardcoded secrets) without executing the application. (e.g., SonarQube, Semgrep).</li>
  <li><strong>DAST (Dynamic Application Security Testing):</strong> "Black-box" testing that evaluates a running application from the outside by simulating external cyberattacks on exposed endpoints and APIs. (e.g., OWASP ZAP, Burp Suite).</li>
  <li><strong>SCA (Software Composition Analysis):</strong> Scans third-party open-source dependencies and packages listed in lockfiles (npm, pip, maven) against known CVE databases. (e.g., OWASP Dependency-Check, Snyk, Dependabot).</li>
</ul>`,
            tags: ['Security', 'SAST', 'DAST', 'SCA']
        },
        {
            id: 's3',
            level: 'senior',
            question: 'How do you securely manage secrets in Kubernetes without storing raw credentials in etcd?',
            answer: `<strong>Production Secrets Architecture:</strong>
<ol>
  <li><strong>External Secrets Operator (ESO) / Secrets Store CSI Driver:</strong> Pods dynamically retrieve secrets directly from an enterprise vault (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault).</li>
  <li><strong>Azure Workload Identity / AWS IRSA:</strong> Pod ServiceAccounts authenticate using short-lived OIDC tokens without static API keys.</li>
  <li><strong>In-Memory Mounts:</strong> Secrets are mounted as ephemeral in-memory volumes (<code>tmpfs</code>) inside the container filesystem and are never written to disk or etcd.</li>
  <li><strong>Sealed Secrets / SOPS:</strong> If secrets must be stored in Git (GitOps), encrypt them with public-key cryptography (Bitnami SealedSecrets or Mozilla SOPS); only the in-cluster operator possesses the private key to decrypt.</li>
</ol>`,
            tags: ['Security', 'Kubernetes', 'Secrets', 'Vault']
        }
    ],

    scenario: [
        {
            id: 'sc1',
            level: 'mid',
            question: 'Production Scenario: Application is throwing HTTP 502 Bad Gateway errors. How do you troubleshoot?',
            answer: `<strong>Root Cause Breakdown:</strong> An HTTP 502 means the reverse proxy / Load Balancer (Nginx / ALB / Ingress) reached out to the upstream backend application, but received an invalid response, connection reset, or connection refusal.
<br><br>
<strong>Layered Troubleshooting Steps:</strong>
<ol>
  <li><strong>Check Upstream Pod / Server Status:</strong> Verify if backend pods are in <code>CrashLoopBackOff</code>, <code>OOMKilled</code>, or restarting.</li>
  <li><strong>Check Target Health in Load Balancer:</strong> In AWS ALB / Azure App Gateway, inspect <strong>Target Health</strong>. If marked Unhealthy, health check probes are failing.</li>
  <li><strong>Check Upstream Port & Binding:</strong> Verify the application is listening on the expected port on <code>0.0.0.0</code> and not hanging.</li>
  <li><strong>Inspect Upstream Application Logs:</strong> Run <code>kubectl logs &lt;pod&gt; --previous</code> or inspect systemd logs for unhandled fatal crashes.</li>
  <li><strong>Check Resource Saturation:</strong> High CPU/Memory throttling can cause the upstream process to drop incoming connections.</li>
</ol>`,
            tags: ['Scenario', 'Troubleshooting', 'HTTP502', 'IncidentResponse']
        },
        {
            id: 'sc2',
            level: 'senior',
            question: 'Production Scenario: You are On-Call and receive a PagerDuty alert that P99 latency has spiked 10x. Walk through your Incident Response.',
            answer: `<strong>Structured Incident Response Framework:</strong>
<ol>
  <li><strong>Acknowledge & Triage:</strong> Acknowledge the PagerDuty incident to signal the team. Check if user-facing SLOs are impacted.</li>
  <li><strong>Establish Incident Room & Roles:</strong> Open a dedicated Slack incident channel / bridge. Assign Incident Commander (IC), Communications Lead, and Operations Lead.</li>
  <li><strong>Mitigate First, Debug Later:</strong>
    <ul>
      <li>Was there a recent deployment? &rarr; Immediately initiate automated rollback (<code>kubectl rollout undo</code> or revert GitOps commit).</li>
      <li>Is traffic spiking abnormally (DDoS)? &rarr; Enable WAF rate-limiting or scale out replicas.</li>
    </ul>
  </li>
  <li><strong>Isolate the Bottleneck:</strong>
    <ul>
      <li>Trace requests in Jaeger / Datadog APM: Is latency originating in the web tier, microservice call, or Database query?</li>
      <li>Check Database metrics: Slow queries, lock contention, connection pool exhaustion, high CPU on RDS.</li>
    </ul>
  </li>
  <li><strong>Resolve & Post-Incident Review (PIR):</strong> Confirm metrics return to baseline. Schedule a blameless post-mortem document covering Root Cause, Timeline, What went well, What went poorly, and Action Items to prevent recurrence.</li>
</ol>`,
            tags: ['Scenario', 'SRE', 'OnCall', 'IncidentManagement']
        },
        {
            id: 'sc3',
            level: 'senior',
            question: 'Explain DORA Metrics and how you use them to measure DevOps team performance.',
            answer: `<strong>The 4 DORA (DevOps Research and Assessment) Metrics:</strong>
<ol>
  <li><strong>Deployment Frequency (DF):</strong> How often an organization successfully releases code to production. (Elite: On-demand, multiple deploys per day).</li>
  <li><strong>Lead Time for Changes (LTTC):</strong> The time it takes for a commit to go from code merge to running in production. (Elite: Less than 1 hour).</li>
  <li><strong>Change Failure Rate (CFR):</strong> The percentage of deployments causing a failure in production requiring a hotfix, rollback, or patch. (Elite: 0–15%).</li>
  <li><strong>Mean Time to Restore (MTTR) / Failed Deployment Recovery Time:</strong> How long it takes to recover from an incident or failure in production. (Elite: Less than 1 hour).</li>
</ol>
<br>
<em>Insight:</em> High-performing teams achieve high velocity (high DF, low Lead Time) <strong>without</strong> sacrificing stability (low CFR, low MTTR) by using automated testing, canary deployments, and feature flags.`,
            tags: ['DevOps', 'DORA', 'Leadership', 'Metrics']
        }
    ]
};

// Export to window for browser access
if (typeof window !== 'undefined') {
    window.interviewQuestions = interviewQuestions;
}

