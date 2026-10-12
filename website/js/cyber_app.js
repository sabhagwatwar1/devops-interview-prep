/**
 * DEVOPS & SRE INTERVIEW PLATFORM - CYBER APP ENGINE
 * Matrix Starfield Canvas, Audio Synthesizer, Live CLI Terminal, Mastery Tracker, and 3D Flashcards
 * + 12 Improvements: Global Search, Progress Dashboard, Mock Interview, Bookmarks, Deep-links, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioSynth();
    initCyberCanvas();
    initThemeMatrix();
    initModernNavbar();          // Modern Mega-Menu & Top-tier Navigation
    initMobileSidebarDrawer();   // #4 — replaces old mobile nav
    initMobileNav();
    initAOSAndMermaid();
    initInteractiveRipples();
    initCard3DTilt();
    initScrollToTop();            // #9
    initKeyboardShortcuts();      // #3
    initGlobalSearch();           // #2
    initMockInterview();          // #5
    initPWA();                    // Offline PWA & Service Worker
    injectGlobalUI();             // injects overlays/FABs into DOM

    const currentTopic = document.body.getAttribute('data-topic');

    if (currentTopic === 'hub') {
        initLiveTerminal();
        initStatsCounter();
        initMasterContactForm();
        initGlobalProgressDashboard();  // #1
        initTopicProgressBars();        // #10
        initDailyReminderBanner();      // #6
    } else if (currentTopic === 'community') {
        initCommunityPortal();
    } else if (currentTopic && window.allQuestionsData && window.allQuestionsData[currentTopic]) {
        initTopicFeed(currentTopic);
        initReadingTimeEstimate(currentTopic);  // #12
        initDeepLink(currentTopic);             // #11
        initDailyReminderBanner();              // #6 on topic pages too
    }
});


/* ==========================================================================
   1. Audio Synth Feedback (Muted by default per user preference)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioSynth() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    const savedSound = localStorage.getItem('cyber_sound_enabled');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
    } else {
        soundEnabled = false; // Default muted
    }

    updateSoundBtnState();

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('cyber_sound_enabled', soundEnabled);
            updateSoundBtnState();
            if (soundEnabled) playSynthSound('beep');
        });
    }
}

function updateSoundBtnState() {
    const icon = document.querySelector('#sound-toggle i');
    if (icon) {
        icon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
}

/* ==========================================================================
   1.1 Interactive Click Ripple Animation
   ========================================================================== */
function initInteractiveRipples() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-cyber, .filter-pill, .btn-action, .topic-vault-card, .btn-view-toggle');
        if (!target) return;

        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;
        const rect = target.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('cyber-ripple');

        const existingRipple = target.querySelector('.cyber-ripple');
        if (existingRipple) existingRipple.remove();

        target.style.position = target.style.position === 'absolute' || target.style.position === 'fixed' ? target.style.position : 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(circle);

        setTimeout(() => {
            circle.remove();
        }, 600);
    });
}

/* ==========================================================================
   1.2 3D Card Parallax Tilt Animation
   ========================================================================== */
function initCard3DTilt() {
    // Disabled for stable, distraction-free cards
}

function playSynthSound(type) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'beep') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.setValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (type === 'flip') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(1100, now + 0.07);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
        } else if (type === 'mastered') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        // AudioContext ignored if blocked
    }
}

/* ==========================================================================
   2. Interactive Starfield & Matrix Nexus Canvas
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor(width / 22), 70);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.9,
            vy: (Math.random() - 0.5) * 0.9,
            radius: Math.random() * 2.2 + 1,
            color: Math.random() > 0.4 ? '#00f0ff' : (Math.random() > 0.5 ? '#00ff88' : '#a855f7')
        });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.x += p1.vx;
            p1.y += p1.vy;

            // Screen wrap
            if (p1.x < 0) p1.x = width;
            if (p1.x > width) p1.x = 0;
            if (p1.y < 0) p1.y = height;
            if (p1.y > height) p1.y = 0;

            // Mouse gravity attraction
            const mdx = mouseX - p1.x;
            const mdy = mouseY - p1.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 180) {
                p1.x += (mdx / mdist) * 0.4;
                p1.y += (mdy / mdist) * 0.4;
            }

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 135) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.16 * (1 - dist / 135)})`;
                    ctx.lineWidth = 0.85;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw glowing particle
            ctx.fillStyle = p1.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p1.color;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(render);
    }

    render();
}

/* ==========================================================================
   3. Theme Matrix & Mobile Navigation
   ========================================================================== */
function initThemeMatrix() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('cyber_theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('cyber_theme', next);
        });
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

/* ==========================================================================
   Modern Mega-Navigation System
   ========================================================================== */
function initModernNavbar() {
    const navbar = document.querySelector('.cyber-navbar');
    if (!navbar) return;

    const navContainer = navbar.querySelector('.nav-container');
    if (!navContainer) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const topicMap = {
        'kubernetes.html': { name: 'Kubernetes', id: 'kubernetes', icon: 'fa-dharmachakra', color: '#326ce5' },
        'aws.html': { name: 'AWS & Cloud', id: 'aws', icon: 'fa-brands fa-aws', color: '#ff9900' },
        'terraform.html': { name: 'Terraform', id: 'terraform', icon: 'fa-cube', color: '#7b42bc' },
        'docker.html': { name: 'Docker', id: 'docker', icon: 'fa-brands fa-docker', color: '#2496ed' },
        'linux.html': { name: 'Linux & OS', id: 'linux', icon: 'fa-brands fa-linux', color: '#fcc624' },
        'networking.html': { name: 'Networking', id: 'networking', icon: 'fa-network-wired', color: '#10b981' },
        'git.html': { name: 'Git & VCS', id: 'git', icon: 'fa-brands fa-git-alt', color: '#f05032' },
        'cicd.html': { name: 'CI/CD Pipelines', id: 'cicd', icon: 'fa-code-branch', color: '#00f0ff' },
        'gitops.html': { name: 'GitOps & ArgoCD', id: 'gitops', icon: 'fa-arrows-spin', color: '#ef4444' },
        'observability.html': { name: 'Observability', id: 'observability', icon: 'fa-chart-line', color: '#a855f7' },
        'security.html': { name: 'DevSecOps', id: 'security', icon: 'fa-shield-halved', color: '#ec4899' },
        'scenario.html': { name: 'Scenarios', id: 'scenario', icon: 'fa-users-gear', color: '#06b6d4' }
    };

    const currentTopicMeta = topicMap[currentPage] || null;
    const isTopicPage = !!currentTopicMeta;
    const isHomePage = currentPage === 'index.html' || currentPage === '';
    const isCommunityPage = currentPage === 'community.html';

    const triggerLabel = isTopicPage ? `Topics: ${currentTopicMeta.name}` : `Topics`;
    const triggerClass = isTopicPage ? 'nav-dropdown-trigger active' : 'nav-dropdown-trigger';

    const modernMenuHtml = `
        <a href="index.html" class="nav-link ${isHomePage ? 'active' : ''}">
            <i class="fa-solid fa-house"></i> <span>Home</span>
        </a>

        <div class="nav-dropdown" id="topics-nav-dropdown">
            <button class="${triggerClass}" id="topics-menu-trigger" aria-expanded="false" aria-haspopup="true">
                <i class="fa-solid fa-layer-group" style="${isTopicPage ? `color: ${currentTopicMeta.color};` : ''}"></i>
                <span>${triggerLabel}</span>
                <span class="topics-badge-count">12</span>
                <i class="fa-solid fa-chevron-down nav-caret"></i>
            </button>

            <div class="mega-menu-panel" id="topics-mega-menu" role="menu">
                <div class="mega-menu-inner">
                    <div class="mega-menu-top-bar">
                        <div class="mega-top-left">
                            <span class="mega-pill-badge"><i class="fa-solid fa-graduation-cap"></i> 12 Specialization Vaults</span>
                            <span class="mega-top-info">1,325+ Curated Questions with Production Code & Spoken Audio Reader</span>
                        </div>
                        <a href="index.html#topics-grid" class="mega-view-grid-btn">
                            <span>Browse Vault Grid</span> <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <div class="mega-menu-grid">
                        <!-- Col 1: Cloud & Infra -->
                        <div class="mega-group">
                            <div class="mega-group-title">
                                <span class="mega-group-dot" style="background: #38bdf8;"></span>
                                <span>Cloud & Infra</span>
                            </div>
                            <div class="mega-items-list">
                                <a href="kubernetes.html" class="mega-card ${currentPage === 'kubernetes.html' ? 'active-topic' : ''}" data-topic="kubernetes">
                                    <div class="mega-icon-box" style="background: rgba(50, 108, 229, 0.14); color: #326ce5;">
                                        <i class="fa-solid fa-dharmachakra"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Kubernetes <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Control Plane, Pods, CNI, HPA, RBAC</div>
                                    </div>
                                </a>
                                <a href="aws.html" class="mega-card ${currentPage === 'aws.html' ? 'active-topic' : ''}" data-topic="aws">
                                    <div class="mega-icon-box" style="background: rgba(255, 153, 0, 0.14); color: #ff9900;">
                                        <i class="fa-brands fa-aws"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">AWS & Cloud <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">VPC, IAM, EKS, ECS, S3, RDS</div>
                                    </div>
                                </a>
                                <a href="terraform.html" class="mega-card ${currentPage === 'terraform.html' ? 'active-topic' : ''}" data-topic="terraform">
                                    <div class="mega-icon-box" style="background: rgba(123, 66, 188, 0.14); color: #7b42bc;">
                                        <i class="fa-solid fa-cube"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Terraform <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">State, Modules, Workspaces, IaC</div>
                                    </div>
                                </a>
                                <a href="docker.html" class="mega-card ${currentPage === 'docker.html' ? 'active-topic' : ''}" data-topic="docker">
                                    <div class="mega-icon-box" style="background: rgba(36, 150, 237, 0.14); color: #2496ed;">
                                        <i class="fa-brands fa-docker"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Docker <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Containers, Cgroups, Multi-stage</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <!-- Col 2: Core & Systems -->
                        <div class="mega-group">
                            <div class="mega-group-title">
                                <span class="mega-group-dot" style="background: #facc15;"></span>
                                <span>Core & Systems</span>
                            </div>
                            <div class="mega-items-list">
                                <a href="linux.html" class="mega-card ${currentPage === 'linux.html' ? 'active-topic' : ''}" data-topic="linux">
                                    <div class="mega-icon-box" style="background: rgba(252, 198, 36, 0.14); color: #fcc624;">
                                        <i class="fa-brands fa-linux"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Linux & OS <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Kernel, Signals, Memory, Systemd</div>
                                    </div>
                                </a>
                                <a href="networking.html" class="mega-card ${currentPage === 'networking.html' ? 'active-topic' : ''}" data-topic="networking">
                                    <div class="mega-icon-box" style="background: rgba(16, 185, 129, 0.14); color: #10b981;">
                                        <i class="fa-solid fa-network-wired"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Networking <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">TCP/IP, DNS, HTTP/2, TLS, Routing</div>
                                    </div>
                                </a>
                                <a href="git.html" class="mega-card ${currentPage === 'git.html' ? 'active-topic' : ''}" data-topic="git">
                                    <div class="mega-icon-box" style="background: rgba(240, 80, 50, 0.14); color: #f05032;">
                                        <i class="fa-brands fa-git-alt"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Git & VCS <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Rebase, Internals, Cherry-pick</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <!-- Col 3: Delivery & GitOps -->
                        <div class="mega-group">
                            <div class="mega-group-title">
                                <span class="mega-group-dot" style="background: #22d3ee;"></span>
                                <span>Delivery & GitOps</span>
                            </div>
                            <div class="mega-items-list">
                                <a href="cicd.html" class="mega-card ${currentPage === 'cicd.html' ? 'active-topic' : ''}" data-topic="cicd">
                                    <div class="mega-icon-box" style="background: rgba(0, 240, 255, 0.14); color: #00f0ff;">
                                        <i class="fa-solid fa-code-branch"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">CI/CD Pipelines <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Jenkins, Actions, Runners</div>
                                    </div>
                                </a>
                                <a href="gitops.html" class="mega-card ${currentPage === 'gitops.html' ? 'active-topic' : ''}" data-topic="gitops">
                                    <div class="mega-icon-box" style="background: rgba(239, 68, 68, 0.14); color: #ef4444;">
                                        <i class="fa-solid fa-arrows-spin"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">GitOps & ArgoCD <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Sync Waves, Rollouts, Drift</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <!-- Col 4: Reliability & Security -->
                        <div class="mega-group">
                            <div class="mega-group-title">
                                <span class="mega-group-dot" style="background: #a855f7;"></span>
                                <span>SRE & Security</span>
                            </div>
                            <div class="mega-items-list">
                                <a href="observability.html" class="mega-card ${currentPage === 'observability.html' ? 'active-topic' : ''}" data-topic="observability">
                                    <div class="mega-icon-box" style="background: rgba(168, 85, 247, 0.14); color: #a855f7;">
                                        <i class="fa-solid fa-chart-line"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Observability <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Prometheus, Grafana, OTel</div>
                                    </div>
                                </a>
                                <a href="security.html" class="mega-card ${currentPage === 'security.html' ? 'active-topic' : ''}" data-topic="security">
                                    <div class="mega-icon-box" style="background: rgba(236, 72, 153, 0.14); color: #ec4899;">
                                        <i class="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">DevSecOps <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Vault, Trivy, Falco, SAST</div>
                                    </div>
                                </a>
                                <a href="scenario.html" class="mega-card ${currentPage === 'scenario.html' ? 'active-topic' : ''}" data-topic="scenario">
                                    <div class="mega-icon-box" style="background: rgba(6, 182, 212, 0.14); color: #06b6d4;">
                                        <i class="fa-solid fa-users-gear"></i>
                                    </div>
                                    <div class="mega-card-info">
                                        <div class="mega-card-name">Real Scenarios <span class="q-pill">100+ Qs</span></div>
                                        <div class="mega-card-sub">Outage Drills, Post-mortems</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="mega-menu-bottom-bar">
                        <div class="mega-bottom-hint">
                            <i class="fa-solid fa-bolt" style="color: var(--neon-cyan);"></i>
                            <span>Tip: Press <strong>⌘K</strong> or <strong>Ctrl+K</strong> from anywhere to instantly search across all questions</span>
                        </div>
                        <button class="mega-bottom-action-btn" onclick="startMockInterview()">
                            <i class="fa-solid fa-brain"></i> Start 10-Q Mock Drill
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <a href="scenario.html" class="nav-link ${currentPage === 'scenario.html' ? 'active' : ''}">
            <i class="fa-solid fa-fire-flame-curved" style="color: #f59e0b;"></i> <span>Scenarios</span>
        </a>
        <a href="community.html" class="nav-link ${isCommunityPage ? 'active' : ''}">
            <i class="fa-solid fa-comments"></i> <span>Community</span>
        </a>
    `;

    const navMenu = navContainer.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.innerHTML = modernMenuHtml;
    }

    // Toggle logic for dropdown on click
    const dropdownWrap = document.getElementById('topics-nav-dropdown');
    const triggerBtn = document.getElementById('topics-menu-trigger');

    if (dropdownWrap && triggerBtn) {
        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownWrap.classList.toggle('open');
            triggerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen && typeof playSynthSound === 'function') {
                playSynthSound('blip');
            }
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownWrap.contains(e.target)) {
                dropdownWrap.classList.remove('open');
                triggerBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownWrap.classList.contains('open')) {
                dropdownWrap.classList.remove('open');
                triggerBtn.setAttribute('aria-expanded', 'false');
                triggerBtn.focus();
            }
        });

        // Play synth sound on hover over mega items
        dropdownWrap.querySelectorAll('.mega-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (typeof playSynthSound === 'function') playSynthSound('blip');
            });
        });
    }

    // Make sure controls on right exist and are styled properly
    let navControls = navContainer.querySelector('.nav-controls');
    if (!navControls) {
        navControls = document.createElement('div');
        navControls.className = 'nav-controls';
        navContainer.appendChild(navControls);
    }

    // Ensure search button has new classes and icon
    let searchBtn = document.getElementById('global-search-trigger');
    if (!searchBtn) {
        searchBtn = document.createElement('button');
        searchBtn.id = 'global-search-trigger';
        navControls.prepend(searchBtn);
    }
    searchBtn.className = 'nav-search-btn';
    searchBtn.setAttribute('aria-label', 'Global search');
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span class="search-btn-label">Quick Search...</span> <span class="kb-badge">⌃K</span>';

    // Ensure mock interview button
    let mockBtn = document.getElementById('mock-interview-nav-btn');
    if (!mockBtn) {
        mockBtn = document.createElement('button');
        mockBtn.id = 'mock-interview-nav-btn';
        mockBtn.setAttribute('onclick', 'startMockInterview()');
        navControls.appendChild(mockBtn);
    }
    mockBtn.className = 'nav-mock-btn';
    mockBtn.innerHTML = '<i class="fa-solid fa-brain"></i> <span>Mock Drill</span>';

    // Ensure mobile toggle
    let mobileToggle = navControls.querySelector('.cyber-mobile-toggle');
    if (!mobileToggle) {
        mobileToggle = document.createElement('button');
        mobileToggle.className = 'cyber-mobile-toggle';
        mobileToggle.setAttribute('aria-label', 'Open navigation menu');
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
        navControls.appendChild(mobileToggle);
    }
}

function initMobileNav() {
    const toggle = document.querySelector('.cyber-mobile-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('mobile-open');
            const icon = toggle.querySelector('i');
            icon.className = menu.classList.contains('mobile-open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars-staggered';
        });
    }
}

function initAOSAndMermaid() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 600, once: true, offset: 40 });
    }
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }
}

/* ==========================================================================
   4. Live Interactive DevOps Terminal Simulation (Hero)
   ========================================================================== */
const TERMINAL_COMMANDS = [
    {
        cmd: "kubectl get pods -n production -o wide",
        output: `NAME                            READY   STATUS    RESTARTS   AGE    IP            NODE
api-gateway-7b6c59b7df-x8q2     1/1     Running   0          42m    10.244.1.18   worker-az1
auth-service-5d9c79f98c-9plk    1/1     Running   0          42m    10.244.2.45   worker-az2
payment-engine-6f8b94f66d-m3n2  1/1     Running   0          42m    10.244.1.19   worker-az1
redis-cluster-master-0          1/1     Running   0          12d    10.244.3.12   worker-az3
postgres-primary-0              1/1     Running   0          28d    10.244.2.98   worker-az2`
    },
    {
        cmd: "terraform plan -out=tfplan.binary",
        output: `Terraform used the selected providers to generate the following execution plan:
  # module.eks_cluster.aws_eks_node_group.workers[0] will be updated in-place
  ~ scaling_config {
      ~ desired_size = 6 -> 12
      ~ max_size     = 10 -> 24
        min_size     = 3
    }
Plan: 0 to add, 1 to change, 0 to destroy.`
    },
    {
        cmd: "trivy image --severity HIGH,CRITICAL backend-api:v2.4",
        output: `2026-09-20T00:30:15Z INFO Vulnerability scanning target...
backend-api:v2.4 (debian 12.5)
=============================
Total: 0 (HIGH: 0, CRITICAL: 0)
[PASSED] Zero critical CVEs detected. Image certified for production.`
    },
    {
        cmd: "argocd app get production-mesh",
        output: `Name:               argocd/production-mesh
Server:             https://kubernetes.default.svc
Namespace:          istio-system
Sync Status:        Synced to main@9f8b4a2
Health Status:      Healthy (All 18 microservices reconciled)`
    },
    {
        cmd: "aws eks update-kubeconfig --region us-east-1 --name production-core",
        output: `Added new context arn:aws:eks:us-east-1:123456789012:cluster/production-core to ~/.kube/config
Switched to context "arn:aws:eks:us-east-1:123456789012:cluster/production-core".
Cluster Health: 100% (64/64 worker nodes ready).`
    }
];

function initLiveTerminal() {
    const typedCmdEl = document.getElementById('terminal-typed-cmd');
    const outputEl = document.getElementById('terminal-output-area');
    if (!typedCmdEl || !outputEl) return;

    let cmdIdx = 0;

    function runCycle() {
        const item = TERMINAL_COMMANDS[cmdIdx];
        typedCmdEl.textContent = '';
        outputEl.textContent = '';
        outputEl.scrollTop = 0;

        let charIdx = 0;
        const typeTimer = setInterval(() => {
            if (charIdx < item.cmd.length) {
                typedCmdEl.textContent += item.cmd[charIdx];
                charIdx++;
            } else {
                clearInterval(typeTimer);
                setTimeout(() => {
                    outputEl.textContent = item.output;
                    outputEl.scrollTop = 0;
                    setTimeout(() => {
                        cmdIdx = (cmdIdx + 1) % TERMINAL_COMMANDS.length;
                        runCycle();
                    }, 4500); // 4.5 second reading window
                }, 350);
            }
        }, 35);
    }

    runCycle();
}

/* ==========================================================================
   5. Stats Count-Up Animation
   ========================================================================== */
function initStatsCounter() {
    const counters = document.querySelectorAll('.count-up');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
        let count = 0;
        const speed = Math.max(Math.floor(target / 35), 1);
        const timer = setInterval(() => {
            count += speed;
            if (count >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(count);
            }
        }, 35);
    });
}

/* ==========================================================================
   6. Topic Question Feed (Accordion, Flashcards & Mastery Tracker)
   ========================================================================== */
let activeViewMode = 'accordion'; // 'accordion' or 'flashcard'
let activeFilter = 'all';
let activeSubTag = 'all';
let currentSearch = '';

function initTopicFeed(topicKey) {
    const container = document.getElementById('questions-feed-container');
    const searchInput = document.getElementById('topic-search-input');
    const searchCountBadge = document.getElementById('search-count-badge');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modeAccordionBtn = document.getElementById('mode-accordion');
    const modeFlashcardBtn = document.getElementById('mode-flashcard');
    const masteryPercentEl = document.getElementById('mastery-percent');

    const allQuestions = window.allQuestionsData[topicKey] || [];

    // Ensure all stats pills and filter pill numbers dynamically match allQuestions array
    if (allQuestions.length > 0) {
        const jrCount = allQuestions.filter(q => q.level === 'junior').length;
        const midCount = allQuestions.filter(q => q.level === 'mid').length;
        const srCount = allQuestions.filter(q => q.level === 'senior').length;

        const totalStrong = document.querySelector('.topic-stats-bar .badge-number');
        if (totalStrong) totalStrong.textContent = allQuestions.length;

        document.querySelectorAll('.topic-stats-bar .stat-pill').forEach(pill => {
            const strong = pill.querySelector('strong');
            if (!strong || strong.classList.contains('badge-number')) return;
            const text = pill.textContent.toLowerCase();
            if (text.includes('junior')) strong.textContent = jrCount;
            else if (text.includes('mid')) strong.textContent = midCount;
            else if (text.includes('senior')) strong.textContent = srCount;
        });

        const btnAll = document.querySelector('.filter-btn[data-filter="all"]');
        if (btnAll) btnAll.textContent = `All (${allQuestions.length})`;
        const btnJr = document.querySelector('.filter-btn[data-filter="junior"]');
        if (btnJr) btnJr.textContent = `Junior (${jrCount})`;
        const btnMid = document.querySelector('.filter-btn[data-filter="mid"]');
        if (btnMid) btnMid.textContent = `Mid-Level (${midCount})`;
        const btnSr = document.querySelector('.filter-btn[data-filter="senior"]');
        if (btnSr) btnSr.textContent = `Senior (${srCount})`;
    }

    // Load mastered question IDs from localStorage
    function getMasteredList() {
        return JSON.parse(localStorage.getItem(`mastered_${topicKey}`) || '[]');
    }

    function updateMastery() {
        const mastered = getMasteredList();
        const percent = allQuestions.length > 0 ? Math.round((mastered.length / allQuestions.length) * 100) : 0;
        if (masteryPercentEl) {
            masteryPercentEl.textContent = `${percent}% (${mastered.length}/${allQuestions.length})`;
        }
    }

    function renderSubchips() {
        let chipsBar = document.getElementById('topic-subchips-bar');
        const feedContainer = document.getElementById('questions-feed-container');
        if (!chipsBar && feedContainer) {
            chipsBar = document.createElement('div');
            chipsBar.id = 'topic-subchips-bar';
            chipsBar.className = 'topic-subchips-bar container';
            feedContainer.parentNode.insertBefore(chipsBar, feedContainer);
        }
        if (!chipsBar) return;

        const tagCounts = {};
        allQuestions.forEach(q => {
            (q.tags || []).forEach(t => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
        });

        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 8);
        if (sortedTags.length === 0) {
            chipsBar.style.display = 'none';
            return;
        }
        chipsBar.style.display = 'flex';
        chipsBar.innerHTML = `
            <button class="subchip-btn ${activeSubTag === 'all' ? 'active' : ''}" data-tag="all"><i class="fa-solid fa-layer-group"></i> All (${allQuestions.length})</button>
            ${sortedTags.map(t => `<button class="subchip-btn ${activeSubTag === t ? 'active' : ''}" data-tag="${escapeHtml(t)}">#${escapeHtml(t)} (${tagCounts[t]})</button>`).join('')}
        `;

        chipsBar.querySelectorAll('.subchip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeSubTag = btn.getAttribute('data-tag') || 'all';
                chipsBar.querySelectorAll('.subchip-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                render();
            });
        });
    }

    function render() {
        const mastered = getMasteredList();

        const filtered = allQuestions.filter(q => {
            const matchesLevel = activeFilter === 'all' || q.level === activeFilter;
            const matchesSaved = activeFilter !== 'saved' || isQuestionBookmarked(q.id);
            const matchesSubTag = activeSubTag === 'all' || (q.tags && q.tags.includes(activeSubTag));
            const matchesSearch = !currentSearch || 
                q.question.toLowerCase().includes(currentSearch.toLowerCase()) || 
                q.answer.toLowerCase().includes(currentSearch.toLowerCase());
            return (activeFilter === 'saved' ? matchesSaved : matchesLevel) && matchesSearch && matchesSubTag;
        });

        if (searchCountBadge) {
            searchCountBadge.textContent = `${filtered.length} / ${allQuestions.length}`;
        }

        if (filtered.length === 0) {
            container.className = '';
            container.innerHTML = `
                <div class="cyber-card" style="padding: 3rem; text-align: center;">
                    <i class="fa-solid fa-microchip" style="font-size: 3rem; color: var(--neon-cyan); margin-bottom: 1rem;"></i>
                    <h3>No Matching Questions Found</h3>
                    <p style="color: var(--text-muted);">Try adjusting your level filter, topic chip, or search keyword.</p>
                </div>`;
            return;
        }

        if (activeViewMode === 'accordion') {
            container.className = 'questions-list-view';
            container.innerHTML = filtered.map(q => renderAccordionCard(q, mastered.includes(q.id))).join('');
            attachAccordionListeners();
        } else {
            container.className = 'flashcards-grid-view';
            container.innerHTML = filtered.map(q => renderFlashcardItem(q)).join('');
            attachFlashcardListeners();
        }

        attachCopyListeners();
        attachMasteryListeners(topicKey);
        attachBookmarkListeners(topicKey, render);
        attachShareListeners();
        attachTTSListeners();
        attachDrillTimerListeners();
        updateMastery();
    }

    // Filter clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            render();
        });
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim();
            render();
        });
    }

    // Mode toggles
    if (modeAccordionBtn && modeFlashcardBtn) {
        modeAccordionBtn.addEventListener('click', () => {
            modeAccordionBtn.classList.add('active');
            modeFlashcardBtn.classList.remove('active');
            activeViewMode = 'accordion';
            render();
        });

        modeFlashcardBtn.addEventListener('click', () => {
            modeFlashcardBtn.classList.add('active');
            modeAccordionBtn.classList.remove('active');
            activeViewMode = 'flashcard';
            render();
        });
    }

    renderSubchips();
    render();
}

function renderAccordionCard(item, isMastered) {
    const badgeClass = `badge-${item.level}`;
    const levelLabel = item.level === 'junior' ? 'Junior (0-2y)' : (item.level === 'mid' ? 'Mid-Level (2-5y)' : 'Senior / Staff (5+y)');
    const tagsHtml = (item.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join(' ');
    const isBookmarked = isQuestionBookmarked(item.id);

    return `
        <div class="cyber-qa-item ${isMastered ? 'mastered-card' : ''}" id="${item.id}">
            <div class="qa-header-row">
                <div class="qa-meta-bar">
                    <div class="qa-left-meta">
                        <span class="badge-level ${badgeClass}">${levelLabel}</span>
                        ${item.source ? `<span class="q-source-tag"><i class="fa-solid fa-book-bookmark"></i> ${item.source}</span>` : ''}
                        <label class="mastered-checkbox-wrap" title="Mark as Mastered">
                            <input type="checkbox" class="q-mastery-chk" data-qid="${item.id}" ${isMastered ? 'checked' : ''}>
                            <span>${isMastered ? 'Mastered' : 'Mark Learned'}</span>
                        </label>
                    </div>
                </div>
                <div class="qa-title-wrapper">
                    <h4 class="qa-question-title">${item.question}</h4>
                </div>
                <div class="qa-actions-row">
                    <button class="btn-tts-listen" data-qid="${item.id}" title="Listen to Question & Answer">
                        <i class="fa-solid fa-volume-high"></i>
                        <span class="tts-wave-bars"><span class="wb-bar"></span><span class="wb-bar"></span><span class="wb-bar"></span></span>
                        <span class="tts-lbl">Listen</span>
                    </button>
                    <button class="btn-timer-toggle" data-qid="${item.id}" title="2-Minute Answer Drill Timer">
                        <i class="fa-solid fa-stopwatch"></i> <span class="timer-btn-text">Drill</span>
                    </button>
                    <button class="btn-bookmark-q ${isBookmarked ? 'bookmarked' : ''}" data-qid="${item.id}" title="${isBookmarked ? 'Remove bookmark' : 'Bookmark question'}">
                        <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-star"></i>
                    </button>
                </div>
                <div class="qa-toggle-wrap">
                    <i class="fa-solid fa-chevron-right qa-toggle-icon"></i>
                </div>
            </div>
            <div class="drill-timer-hud" id="drill-timer-${item.id}">
                <div class="drill-timer-dial" id="timer-dial-${item.id}">
                    <svg width="44" height="44" viewBox="0 0 44 44">
                        <circle class="timer-dial-track" cx="22" cy="22" r="18"></circle>
                        <circle class="timer-dial-bar" id="dial-bar-${item.id}" cx="22" cy="22" r="18"></circle>
                    </svg>
                    <span class="timer-dial-num" id="dial-num-${item.id}">02:00</span>
                </div>
                <div class="drill-timer-meta">
                    <div class="drill-timer-title"><i class="fa-solid fa-bolt"></i> 2-MIN INTERVIEW DRILL</div>
                    <div class="drill-timer-status" id="timer-status-${item.id}">Explain this question aloud under 2 minutes</div>
                </div>
                <div class="drill-timer-controls">
                    <button class="btn-drill-action start" onclick="toggleDrillTimer('${item.id}')" id="btn-start-${item.id}"><i class="fa-solid fa-play"></i> Start</button>
                    <button class="btn-drill-action reset" onclick="resetDrillTimer('${item.id}')"><i class="fa-solid fa-rotate-left"></i></button>
                    <button class="btn-drill-action close" onclick="closeDrillTimer('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="qa-answer-body">
                <div class="qa-answer-inner">
                    ${item.answer}
                    <div class="qa-tags-row">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}


function renderFlashcardItem(item) {
    const badgeClass = `badge-${item.level}`;
    const levelLabel = item.level === 'junior' ? 'Junior' : (item.level === 'mid' ? 'Mid-Level' : 'Senior');

    return `
        <div class="flashcard-3d" data-id="${item.id}">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div>
                        <div class="qa-left-meta" style="margin-bottom: 1rem;">
                            <span class="badge-level ${badgeClass}">${levelLabel}</span>
                        </div>
                        <h4 class="qa-question-title" style="font-size: 1.15rem;">${item.question}</h4>
                    </div>
                    <div class="flip-hint">
                        <i class="fa-solid fa-rotate"></i> Click to Reveal Answer
                    </div>
                </div>
                <div class="flashcard-back">
                    <div style="font-size: 0.9rem; line-height: 1.6; color: #cfd9e8; overflow-y: auto; max-height: 235px;">
                        ${item.answer}
                    </div>
                    <div class="flip-hint" style="color: var(--neon-green); margin-top: 0.5rem;">
                        <i class="fa-solid fa-rotate-left"></i> Click to Flip Back
                    </div>
                </div>
            </div>
        </div>
    `;
}

function attachAccordionListeners() {
    const headers = document.querySelectorAll('.qa-header-row');
    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.mastered-checkbox-wrap')) return;
            if (e.target.closest('.qa-actions-row')) return;
            const card = header.closest('.cyber-qa-item');
            card.classList.toggle('active');
        });
    });
}

function attachFlashcardListeners() {
    const flashcards = document.querySelectorAll('.flashcard-3d');
    flashcards.forEach(fc => {
        fc.addEventListener('click', () => {
            fc.classList.toggle('flipped');
            playSynthSound('flip');
        });
    });
}

function attachMasteryListeners(topicKey) {
    const checkboxes = document.querySelectorAll('.q-mastery-chk');
    checkboxes.forEach(chk => {
        chk.addEventListener('change', (e) => {
            e.stopPropagation();
            const qid = chk.getAttribute('data-qid');
            let mastered = JSON.parse(localStorage.getItem(`mastered_${topicKey}`) || '[]');
            
            const allQ = window.allQuestionsData[topicKey] || [];
            
            if (chk.checked) {
                if (!mastered.includes(qid)) mastered.push(qid);
                chk.nextElementSibling.textContent = 'Mastered';
                playSynthSound('mastered');

                const percent = allQ.length > 0 ? Math.round((mastered.length / allQ.length) * 100) : 0;
                
                if (percent === 100) {
                    launchCyberConfetti();
                    showCyberToast(`🏆 100% MASTERY in ${topicKey.toUpperCase()}! Outstanding!`);
                } else if (percent === 75 || percent === 50 || percent === 25) {
                    launchCyberConfetti();
                    showCyberToast(`🎉 Milestone: ${percent}% Mastery in ${topicKey.toUpperCase()}!`);
                } else {
                    showCyberToast('Question marked as Mastered!');
                }
            } else {
                mastered = mastered.filter(id => id !== qid);
                chk.nextElementSibling.textContent = 'Mark Learned';
            }

            localStorage.setItem(`mastered_${topicKey}`, JSON.stringify(mastered));
            
            const card = chk.closest('.cyber-qa-item');
            if (card) {
                if (chk.checked) card.classList.add('mastered-card');
                else card.classList.remove('mastered-card');
            }

            const percent = allQ.length > 0 ? Math.round((mastered.length / allQ.length) * 100) : 0;
            const masteryPercentEl = document.getElementById('mastery-percent');
            if (masteryPercentEl) {
                masteryPercentEl.textContent = `${percent}% (${mastered.length}/${allQ.length})`;
            }
        });
    });
}

function attachCopyListeners() {
    const preBlocks = document.querySelectorAll('.qa-answer-inner pre');
    preBlocks.forEach(pre => {
        if (pre.querySelector('.copy-code-hud-btn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-code-hud-btn';
        btn.innerHTML = '<i class="fa-regular fa-copy"></i> COPY';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        pre.appendChild(btn);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const codeEl = pre.querySelector('code');
            let textToCopy = '';
            if (codeEl) {
                textToCopy = codeEl.innerText || codeEl.textContent;
            } else {
                const clone = pre.cloneNode(true);
                const cloneBtn = clone.querySelector('.copy-code-hud-btn');
                if (cloneBtn) cloneBtn.remove();
                textToCopy = clone.innerText || clone.textContent;
            }

            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
                btn.classList.add('copied');
                showCyberToast('Code snippet copied to clipboard');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i> COPY';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // Fallback textarea copy
                const ta = document.createElement('textarea');
                ta.value = textToCopy.trim();
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i> COPY';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}

/* ==========================================================================
   7. Master Hub Contact Form (Email Automation)
   ========================================================================== */
function initMasterContactForm() {
    const form = document.getElementById('master-contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const topic = document.getElementById('contact-topic').value;
        const message = document.getElementById('contact-message').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !email || !message) return;

        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Directly...';
        }

        const targetEmail = atob('c2FiaGFnd2F0d2FyQGdtYWlsLmNvbQ==');
        const subject = `DevOps & SRE Doubt [${topic}] - ${name}`;

        try {
            // Direct background transmission (no email app / no client pop-ups)
            const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: subject,
                    _replyto: email,
                    _template: "table",
                    _captcha: "false",
                    "Candidate Name": name,
                    "Candidate Email": email,
                    "Target Topic": topic,
                    "Question / Doubt": message,
                    "Sent Via": "DevOps & SRE Master Vault"
                })
            });

            // Also post to Netlify form in the background if hosted on Netlify
            try {
                const netlifyData = new FormData(form);
                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(netlifyData).toString()
                }).catch(() => {});
            } catch (e2) {}

            form.reset();
            showCyberToast('Query sent successfully! We will get back to you shortly. 🚀');
        } catch (err) {
            console.warn("Direct dispatch error:", err);
            // Fallback to Netlify background form submission
            try {
                const netlifyData = new FormData(form);
                await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(netlifyData).toString()
                });
            } catch (e3) {}
            form.reset();
            showCyberToast('Query sent successfully! We will get back to you shortly. 🚀');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

/* ==========================================================================
   8. Community Forum Portal
   ========================================================================== */
const DEFAULT_COMMUNITY_FEED = [
    {
        id: "comm_0",
        author: "shriram",
        tag: "Kubernetes",
        question: "what is CICD",
        timestamp: "Just now",
        upvotes: 2,
        downvotes: 0,
        replies: [
            {
                author: "Staff_SRE",
                text: "CI/CD stands for Continuous Integration & Continuous Delivery/Deployment. CI automates building, linting, and running automated test suites on every pull request. CD automates deployment of tested artifacts to staging and production environments using GitOps (ArgoCD) or automated pipelines (GitHub Actions, GitLab CI).",
                timestamp: "Just now"
            }
        ]
    },
    {
        id: "comm_1",
        author: "DevOps_Alex",
        tag: "Kubernetes",
        question: "How do you resolve CrashLoopBackOff on a Pod when kubectl logs --previous returns nothing because the container exits before writing logs?",
        timestamp: "1 hour ago",
        upvotes: 18,
        downvotes: 0,
        replies: [
            {
                author: "Lead_SRE",
                text: "Override the container <code>command</code> or <code>args</code> in the pod spec with <code>['sh', '-c', 'sleep 3600']</code> to keep it alive. Then <code>kubectl exec -it</code> into the container to inspect file permissions, environment variables, and missing shared libraries.",
                timestamp: "45 mins ago"
            }
        ]
    },
    {
        id: "comm_2",
        author: "CloudNinja_99",
        tag: "Terraform",
        question: "When refactoring Terraform monolithic state into modular micro-states, what is the best practice to move resources without recreating live cloud infrastructure?",
        timestamp: "3 hours ago",
        upvotes: 12,
        downvotes: 0,
        replies: [
            {
                author: "IaC_Architect",
                text: "Use the <code>moved { from = aws_s3_bucket.old to = module.storage.aws_s3_bucket.this }</code> block (introduced in Terraform 1.1+) or run <code>terraform state mv</code>. This refactors the state address without triggering destruction.",
                timestamp: "2 hours ago"
            }
        ]
    }
];

let globalRtdb = null;
let globalFirestoreDb = null;
let firestoreUnsubscribe = null;
let activeCommunityRenderFeed = null;

function getUserPostReaction(postId) {
    try {
        const reactions = JSON.parse(localStorage.getItem('cyber_user_reactions') || '{}');
        return reactions[postId] || null;
    } catch (e) {
        return null;
    }
}

function setUserPostReaction(postId, reaction) {
    try {
        const reactions = JSON.parse(localStorage.getItem('cyber_user_reactions') || '{}');
        if (reaction) {
            reactions[postId] = reaction;
        } else {
            delete reactions[postId];
        }
        localStorage.setItem('cyber_user_reactions', JSON.stringify(reactions));
    } catch (e) {}
}

function isFirebaseConfigured() {
    return typeof firebase !== 'undefined' &&
           window.firebaseConfig &&
           window.firebaseConfig.apiKey &&
           window.firebaseConfig.apiKey !== "YOUR_API_KEY" &&
           window.firebaseConfig.apiKey.trim() !== "";
}

function updateCloudStatusBadge(status, message) {
    const badge = document.getElementById('cloud-sync-status');
    const connectBtn = document.getElementById('btn-cloud-connect');
    const btnLabel = document.getElementById('cloud-btn-label');
    if (!badge) return;

    badge.className = 'cloud-status-badge';
    if (status === 'online') {
        badge.classList.add('cloud-online');
        badge.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Live Global Sync`;
        badge.title = "Connected to Firebase Cloud Database. Doubts and answers sync across all devices worldwide.";
        if (connectBtn) {
            connectBtn.style.borderColor = 'rgba(0, 255, 136, 0.4)';
            connectBtn.title = "Cloud Connected. Click to view or change Firebase settings.";
        }
        if (btnLabel) btnLabel.textContent = "Cloud Settings";
    } else if (status === 'checking') {
        badge.classList.add('cloud-checking');
        badge.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...`;
        badge.title = "Connecting to Firebase Database...";
    } else {
        badge.classList.add('cloud-offline');
        badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Local Mode`;
        badge.title = message || "Running in local storage mode.";
        if (connectBtn) {
            connectBtn.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            connectBtn.title = "Click to connect Firebase Cloud Database!";
        }
        if (btnLabel) btnLabel.textContent = "Connect Cloud";
    }
}

function initCommunityPortal() {
    const form = document.getElementById('community-portal-form');
    const feed = document.getElementById('community-feed-container');
    const countBadge = document.getElementById('comm-count-badge');

    // Clean up previous listeners
    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
    }

    function renderFeed(posts) {
        if (countBadge) countBadge.textContent = `${posts.length} Active Doubts`;
        if (!feed) return;

        if (posts.length === 0) {
            feed.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; background: var(--cyber-card); border: 1px dashed var(--glass-border); border-radius: 12px;">
                    <i class="fa-solid fa-comments" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 0.5rem;">No doubts posted yet.</p>
                    <p style="color: #cbd5e1; font-size: 0.85rem;">Be the first engineer to ask an interview question or troubleshooting doubt!</p>
                </div>
            `;
            return;
        }

        feed.innerHTML = posts.map(post => {
            const authorInitial = (post.author && post.author.length > 0) ? escapeHtml(post.author[0].toUpperCase()) : 'E';
            const displayTime = post.timestamp || 'Just now';
            const userReaction = getUserPostReaction(post.id);
            const isLiked = userReaction === 'like';
            const isDisliked = userReaction === 'dislike';

            return `
            <div class="community-card-post" id="${post.id}">
                <div class="comm-post-header">
                    <div class="comm-author-box">
                        <div class="author-avatar">${authorInitial}</div>
                        <div>
                            <strong>${escapeHtml(post.author || 'Anonymous')}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                ${escapeHtml(displayTime)} &bull; <span class="hud-tag">${escapeHtml(post.tag || 'General')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="comm-actions-bar" style="display: flex; align-items: center; gap: 0.45rem;">
                        <button class="comm-upvote-btn ${isLiked ? 'active' : ''}" onclick="handlePostReaction('${post.id}', 'like')" title="${isLiked ? 'Liked (click to undo)' : 'Like'}">
                            <i class="fa-solid fa-thumbs-up"></i> <span>${post.upvotes || 0}</span>
                        </button>
                        <button class="comm-downvote-btn ${isDisliked ? 'active' : ''}" onclick="handlePostReaction('${post.id}', 'dislike')" title="${isDisliked ? 'Disliked (click to undo)' : 'Dislike'}">
                            <i class="fa-solid fa-thumbs-down"></i> <span>${post.downvotes || 0}</span>
                        </button>
                    </div>
                </div>
                <div style="font-size: 1.05rem; font-weight: 600; color: #fff; line-height: 1.5;">
                    ${escapeHtml(post.question)}
                </div>
                <div class="comm-replies-list">
                    ${(post.replies || []).map(r => `
                        <div class="comm-reply-item">
                            <div class="comm-reply-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                                <span><i class="fa-solid fa-reply"></i> <strong>${escapeHtml(r.author || 'Engineer')}</strong></span>
                                <span style="color: var(--text-muted); font-size: 0.72rem;">${escapeHtml(r.timestamp || 'Recent')}</span>
                            </div>
                            <div style="color: #cbd5e1; line-height: 1.5;">${r.text}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="reply-input-row" style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                    <input type="text" placeholder="Write an expert solution / answer..." id="reply-in-${post.id}" style="flex: 1;" onkeydown="if(event.key==='Enter') addReply('${post.id}')">
                    <button class="cyber-btn btn-outline" style="padding: 0.45rem 1rem; font-size: 0.85rem;" onclick="addReply('${post.id}')">Reply</button>
                </div>
            </div>
            `;
        }).join('');
        activeCommunityRenderFeed = renderFeed;
    }

    function loadLocalFeed() {
        let storedPosts = JSON.parse(localStorage.getItem('cyber_community_posts') || 'null');
        if (!storedPosts || storedPosts.length === 0) {
            storedPosts = DEFAULT_COMMUNITY_FEED;
        }
        storedPosts = storedPosts.filter(p => !(p.question || '').toLowerCase().includes('statefulset'));
        localStorage.setItem('cyber_community_posts', JSON.stringify(storedPosts));
        renderFeed(storedPosts);
    }

    // Connect to Firebase (Realtime Database or Firestore)
    let dbConnected = false;
    if (isFirebaseConfigured()) {
        updateCloudStatusBadge('checking');
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }

            // Priority 1: Firebase Realtime Database
            if (typeof firebase.database === 'function' && window.firebaseConfig.databaseURL) {
                dbConnected = true;
                try {
                    globalRtdb = firebase.app().database(window.firebaseConfig.databaseURL);
                } catch (e) {
                    globalRtdb = firebase.database();
                }
                const doubtsRef = globalRtdb.ref('community_doubts');

                doubtsRef.on('value', async (snapshot) => {
                    const val = snapshot.val();
                    if (!val) {
                        // Seed default posts to the new cloud database
                        try {
                            for (const p of DEFAULT_COMMUNITY_FEED) {
                                const newRef = doubtsRef.push();
                                await newRef.set({
                                    author: p.author,
                                    tag: p.tag,
                                    question: p.question,
                                    timestamp: p.timestamp,
                                    createdAt: Date.now(),
                                    upvotes: p.upvotes || 0,
                                    downvotes: p.downvotes || 0,
                                    replies: p.replies || []
                                });
                            }
                            return; // Next event will render populated feed
                        } catch (e) {
                            console.warn("Could not seed default RTDB posts:", e);
                        }
                    }

                    const remotePosts = [];
                    if (val) {
                        Object.keys(val).forEach(k => {
                            const item = val[k];
                            let repliesList = [];
                            if (item.replies) {
                                if (Array.isArray(item.replies)) {
                                    repliesList = item.replies;
                                } else if (typeof item.replies === 'object') {
                                    repliesList = Object.values(item.replies);
                                }
                            }
                            let displayTime = item.timestamp || 'Just now';
                            if (item.createdAt && typeof item.createdAt === 'number') {
                                const d = new Date(item.createdAt);
                                displayTime = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                            remotePosts.push({
                                id: k,
                                author: item.author || 'Anonymous',
                                tag: item.tag || 'General',
                                question: item.question || '',
                                timestamp: displayTime,
                                createdAt: item.createdAt || 0,
                                upvotes: item.upvotes || 0,
                                downvotes: item.downvotes || 0,
                                replies: repliesList
                            });
                        });
                    }

                    remotePosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    localStorage.setItem('cyber_community_posts', JSON.stringify(remotePosts));
                    renderFeed(remotePosts);
                    updateCloudStatusBadge('online');
                }, (error) => {
                    console.error("Firebase Realtime Database error:", error);
                    updateCloudStatusBadge('offline', error.message);
                    if (error.message && error.message.toLowerCase().includes('permission_denied')) {
                        showCyberToast("Firebase Rules: Set .read and .write to true in Console -> Rules!");
                    }
                    loadLocalFeed();
                });
            } else if (typeof firebase.firestore === 'function') {
                // Priority 2: Cloud Firestore
                dbConnected = true;
                globalFirestoreDb = firebase.firestore();
                globalFirestoreDb.enablePersistence({ synchronizeTabs: true }).catch(() => {});

                firestoreUnsubscribe = globalFirestoreDb.collection('community_doubts')
                    .orderBy('createdAt', 'desc')
                    .onSnapshot(async (snapshot) => {
                        if (snapshot.empty) {
                            try {
                                for (const post of DEFAULT_COMMUNITY_FEED) {
                                    await globalFirestoreDb.collection('community_doubts').add({
                                        author: post.author,
                                        tag: post.tag,
                                        question: post.question,
                                        timestamp: post.timestamp,
                                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                        upvotes: post.upvotes || 0,
                                        downvotes: post.downvotes || 0,
                                        replies: post.replies || []
                                    });
                                }
                                return;
                            } catch (e) {
                                console.warn("Could not seed default Firestore posts:", e);
                            }
                        }

                        const remotePosts = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            let displayTime = data.timestamp || 'Just now';
                            if (data.createdAt && data.createdAt.toDate) {
                                const date = data.createdAt.toDate();
                                displayTime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                            remotePosts.push({
                                id: doc.id,
                                author: data.author || 'Anonymous',
                                tag: data.tag || 'General',
                                question: data.question || '',
                                timestamp: displayTime,
                                upvotes: data.upvotes || 0,
                                downvotes: data.downvotes || 0,
                                replies: data.replies || []
                            });
                        });

                        localStorage.setItem('cyber_community_posts', JSON.stringify(remotePosts));
                        renderFeed(remotePosts);
                        updateCloudStatusBadge('online');
                    }, (error) => {
                        console.error("Firestore synchronization error:", error);
                        updateCloudStatusBadge('offline', error.message);
                        loadLocalFeed();
                    });
            }

            if (!dbConnected) {
                loadLocalFeed();
            }

        } catch (err) {
            console.error("Firebase init failed:", err);
            updateCloudStatusBadge('offline', err.message);
            loadLocalFeed();
        }
    } else {
        updateCloudStatusBadge('offline');
        loadLocalFeed();
    }

    // Submit handler
    if (form && !form.dataset.listenerAttached) {
        form.dataset.listenerAttached = "true";
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authorInput = document.getElementById('comm-author');
            const tagInput = document.getElementById('comm-tag');
            const questionInput = document.getElementById('comm-question');

            const author = authorInput ? authorInput.value.trim() : '';
            const tag = tagInput ? tagInput.value : 'General';
            const question = questionInput ? questionInput.value.trim() : '';

            if (!author || !question) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Publishing...`;
            }

            let postedToCloud = false;

            if (globalRtdb) {
                try {
                    const newRef = globalRtdb.ref('community_doubts').push();
                    const writePromise = newRef.set({
                        author: author,
                        tag: tag,
                        question: question,
                        timestamp: 'Just now',
                        createdAt: Date.now(),
                        upvotes: 0,
                        downvotes: 0,
                        replies: []
                    });
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("RTDB write timeout")), 3500)
                    );
                    await Promise.race([writePromise, timeoutPromise]);
                    form.reset();
                    showCyberToast('Doubt published live to Firebase!');
                    postedToCloud = true;
                } catch (err) {
                    console.error("RTDB post failed:", err);
                    if (err.message && err.message.toLowerCase().includes('permission_denied')) {
                        alert("Firebase Permission Denied!\n\nIn Firebase Console -> Realtime Database -> Rules tab:\nSet .read: true and .write: true, then click Publish!");
                    }
                }
            } else if (globalFirestoreDb) {
                try {
                    await globalFirestoreDb.collection('community_doubts').add({
                        author: author,
                        tag: tag,
                        question: question,
                        timestamp: 'Just now',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        upvotes: 0,
                        downvotes: 0,
                        replies: []
                    });
                    form.reset();
                    showCyberToast('Doubt published live to the global community!');
                    postedToCloud = true;
                } catch (err) {
                    console.error("Firestore post failed:", err);
                }
            }

            if (!postedToCloud) {
                savePostLocally({ author, tag, question });
                form.reset();
                showCyberToast('Saved locally. (Check Firebase Console Rules)');
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    function savePostLocally({ author, tag, question }) {
        const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
        posts.unshift({
            id: 'comm_' + Date.now(),
            author: author,
            tag: tag,
            question: question,
            timestamp: 'Just now',
            createdAt: Date.now(),
            upvotes: 0,
            downvotes: 0,
            replies: []
        });
        localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
        renderFeed(posts);
    }
}

// Remove delete option from public interface
window.deletePost = function() {
    showCyberToast('Deletion is restricted to moderators.');
};

window.handlePostReaction = async function(postId, desiredType) {
    playSynthSound('beep');
    const currentReaction = getUserPostReaction(postId); // 'like', 'dislike', or null

    let deltaUpvotes = 0;
    let deltaDownvotes = 0;
    let nextReaction = null;

    if (currentReaction === desiredType) {
        // Toggle off if already selected
        nextReaction = null;
        if (desiredType === 'like') {
            deltaUpvotes = -1;
            showCyberToast('Removed like');
        } else {
            deltaDownvotes = -1;
            showCyberToast('Removed dislike');
        }
    } else {
        // Apply new reaction or swap
        nextReaction = desiredType;
        if (desiredType === 'like') {
            deltaUpvotes = 1;
            if (currentReaction === 'dislike') {
                deltaDownvotes = -1;
            }
            showCyberToast('Liked! 👍');
        } else {
            deltaDownvotes = 1;
            if (currentReaction === 'like') {
                deltaUpvotes = -1;
            }
            showCyberToast('Disliked 👎');
        }
    }

    // Save user's reaction so 1 person can only like/dislike once
    setUserPostReaction(postId, nextReaction);

    // Update local cached posts and re-render instantly
    let posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
    const target = posts.find(p => p.id === postId);
    if (target) {
        target.upvotes = Math.max(0, (target.upvotes || 0) + deltaUpvotes);
        target.downvotes = Math.max(0, (target.downvotes || 0) + deltaDownvotes);
        localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
        if (typeof activeCommunityRenderFeed === 'function') {
            activeCommunityRenderFeed(posts);
        } else {
            initCommunityPortal();
        }
    }

    // Sync to Realtime Database if connected
    if (globalRtdb) {
        try {
            await globalRtdb.ref(`community_doubts/${postId}`).transaction(item => {
                if (item) {
                    if (deltaUpvotes !== 0) {
                        item.upvotes = Math.max(0, (item.upvotes || 0) + deltaUpvotes);
                    }
                    if (deltaDownvotes !== 0) {
                        item.downvotes = Math.max(0, (item.downvotes || 0) + deltaDownvotes);
                    }
                }
                return item;
            });
        } catch (err) {
            console.warn("RTDB reaction transaction failed:", err);
        }
    } else if (globalFirestoreDb) {
        try {
            const updates = {};
            if (deltaUpvotes !== 0) updates.upvotes = firebase.firestore.FieldValue.increment(deltaUpvotes);
            if (deltaDownvotes !== 0) updates.downvotes = firebase.firestore.FieldValue.increment(deltaDownvotes);
            await globalFirestoreDb.collection('community_doubts').doc(postId).update(updates);
        } catch (err) {
            console.warn("Firestore reaction update failed:", err);
        }
    }
};

window.upvotePost = function(postId) {
    window.handlePostReaction(postId, 'like');
};

window.downvotePost = function(postId) {
    window.handlePostReaction(postId, 'dislike');
};

window.addReply = async function(postId) {
    const input = document.getElementById(`reply-in-${postId}`);
    if (!input || !input.value.trim()) return;
    const text = escapeHtml(input.value.trim());

    const replyObj = {
        author: 'Engineer',
        text: text,
        timestamp: 'Just now',
        createdAt: Date.now()
    };

    if (globalRtdb) {
        try {
            await globalRtdb.ref(`community_doubts/${postId}/replies`).push(replyObj);
            input.value = '';
            showCyberToast('Answer published to Firebase!');
            return;
        } catch (err) {
            console.warn("RTDB reply failed:", err);
        }
    } else if (globalFirestoreDb) {
        try {
            await globalFirestoreDb.collection('community_doubts').doc(postId).update({
                replies: firebase.firestore.FieldValue.arrayUnion(replyObj)
            });
            input.value = '';
            showCyberToast('Answer published to the community!');
            return;
        } catch (err) {
            console.warn("Firestore reply failed:", err);
        }
    }

    const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
    const target = posts.find(p => p.id === postId);
    if (target) {
        if (!target.replies) target.replies = [];
        target.replies.push(replyObj);
        localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
        input.value = '';
        initCommunityPortal();
        showCyberToast('Answer submitted!');
    }
};

window.openFirebaseSetupModal = function() {
    const modal = document.getElementById('firebase-modal');
    if (!modal) return;
    const input = document.getElementById('firebase-config-input');
    if (input) {
        if (window.firebaseConfig && window.firebaseConfig.projectId) {
            input.value = JSON.stringify(window.firebaseConfig, null, 2);
        } else {
            input.value = '';
        }
    }
    modal.style.display = 'flex';
    modal.classList.add('open');
};

window.closeFirebaseSetupModal = function() {
    const modal = document.getElementById('firebase-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
};

window.saveFirebaseConfigFromModal = function() {
    const input = document.getElementById('firebase-config-input');
    if (!input || !input.value.trim()) {
        alert("Please paste your Firebase configuration object or JSON.");
        return;
    }

    let raw = input.value.trim();
    if (raw.includes('{')) {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}') + 1;
        raw = raw.slice(start, end);
    }

    let parsedConfig = null;
    try {
        parsedConfig = JSON.parse(raw);
    } catch (e1) {
        try {
            parsedConfig = (new Function(`return ${raw};`))();
        } catch (e2) {
            alert("Invalid configuration format. Please ensure you paste valid JSON or JavaScript object format.");
            return;
        }
    }

    if (!parsedConfig || !parsedConfig.projectId || !parsedConfig.apiKey) {
        alert("Invalid Firebase config. Must include at least 'projectId' and 'apiKey'.");
        return;
    }

    localStorage.setItem('cyber_firebase_custom_config', JSON.stringify(parsedConfig));
    window.firebaseConfig = parsedConfig;

    closeFirebaseSetupModal();
    showCyberToast('Connecting to Firebase Firestore...');
    initCommunityPortal();
};

window.resetToLocalMode = function() {
    if (confirm("Reset to Local Mode? This will disconnect from the cloud database and use local storage.")) {
        localStorage.removeItem('cyber_firebase_custom_config');
        window.firebaseConfig = {
            apiKey: "",
            authDomain: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: ""
        };
        closeFirebaseSetupModal();
        showCyberToast('Reset to local mode');
        initCommunityPortal();
    }
};

// Close modal when clicking on backdrop
document.addEventListener('click', (e) => {
    const modal = document.getElementById('firebase-modal');
    if (modal && e.target === modal) {
        closeFirebaseSetupModal();
    }
});

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   9. Cyber Toast Notification
   ========================================================================== */
function showCyberToast(msg) {
    let toast = document.getElementById('cyber-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cyber-toast';
        toast.className = 'cyber-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-bolt" style="color: var(--neon-cyan);"></i> ${msg}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

/* ==========================================================================
   IMPROVEMENTS MODULE — All 12 New Features
   ========================================================================== */

/* ── Inject Global UI Elements into DOM ────────────────────────────────── */
function injectGlobalUI() {
    // Scroll-to-top button
    if (!document.getElementById('scroll-top-btn')) {
        const btn = document.createElement('button');
        btn.id = 'scroll-top-btn';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(btn);
    }

    // Keyboard shortcut FAB
    if (!document.getElementById('kb-help-fab')) {
        const fab = document.createElement('button');
        fab.id = 'kb-help-fab';
        fab.setAttribute('aria-label', 'Keyboard shortcuts');
        fab.textContent = '?';
        fab.addEventListener('click', () => toggleKbOverlay(true));
        document.body.appendChild(fab);
    }

    // Keyboard shortcuts overlay
    if (!document.getElementById('kb-shortcuts-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'kb-shortcuts-overlay';
        overlay.innerHTML = `
            <div class="kb-modal-box">
                <h3><i class="fa-solid fa-keyboard"></i> Keyboard Shortcuts</h3>
                <ul class="kb-list">
                    <li><span class="kb-key">J</span> Next question</li>
                    <li><span class="kb-key">K</span> Previous question</li>
                    <li><span class="kb-key">Space</span> Expand / Collapse question</li>
                    <li><span class="kb-key">M</span> Toggle mastered on active question</li>
                    <li><span class="kb-key">B</span> Bookmark / unbookmark active question</li>
                    <li><span class="kb-key">F</span> Toggle Flashcard / Accordion mode</li>
                    <li><span class="kb-key">Ctrl K</span> Open global search</li>
                    <li><span class="kb-key">I</span> Start mock interview</li>
                    <li><span class="kb-key">?</span> Toggle this help overlay</li>
                    <li><span class="kb-key">Esc</span> Close overlays</li>
                </ul>
                <button class="kb-close-btn" onclick="toggleKbOverlay(false)">Close</button>
            </div>`;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) toggleKbOverlay(false); });
        document.body.appendChild(overlay);
    }

    // Global search overlay
    if (!document.getElementById('global-search-overlay')) {
        const searchOverlay = document.createElement('div');
        searchOverlay.id = 'global-search-overlay';
        searchOverlay.innerHTML = `
            <div class="global-search-box">
                <div class="global-search-input-row">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="global-search-input" placeholder="Search all 1325+ questions across 12 topics..." autocomplete="off">
                    <button class="global-search-close" onclick="closeGlobalSearch()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="global-search-results"></div>
                <div class="global-search-footer">
                    <span><span class="kb-key" style="font-size:0.65rem;padding:0 4px;">↵</span> to open</span>
                    <span><span class="kb-key" style="font-size:0.65rem;padding:0 4px;">Esc</span> to close</span>
                    <span>Search across all topics</span>
                </div>
            </div>`;
        searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeGlobalSearch(); });
        document.body.appendChild(searchOverlay);
    }

    // Mock interview overlay
    if (!document.getElementById('mock-interview-overlay')) {
        const mockOverlay = document.createElement('div');
        mockOverlay.id = 'mock-interview-overlay';
        mockOverlay.innerHTML = `
            <div class="mock-interview-card">
                <div class="mock-progress-bar"><div class="mock-progress-fill" id="mock-prog-fill" style="width:0%"></div></div>
                <div class="mock-header">
                    <span class="mock-progress-text" id="mock-prog-text">Question 1 / 10</span>
                    <button class="mock-close-btn" onclick="closeMockInterview()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="mock-question-area">
                    <div class="mock-topic-badge" id="mock-q-topic">TOPIC</div>
                    <div class="mock-question-text" id="mock-q-text">Loading...</div>
                    <button class="mock-reveal-btn" id="mock-reveal-btn" onclick="revealMockAnswer()">
                        <i class="fa-solid fa-eye"></i> Reveal Answer
                    </button>
                    <div class="mock-answer-box" id="mock-answer-box"></div>
                    <div class="mock-rating-row" id="mock-rating-row" style="display:none;">
                        <button class="mock-rate-btn good" onclick="rateMockAnswer('good')"><i class="fa-solid fa-check"></i> Got it!</button>
                        <button class="mock-rate-btn ok" onclick="rateMockAnswer('ok')"><i class="fa-solid fa-minus"></i> Partial</button>
                        <button class="mock-rate-btn bad" onclick="rateMockAnswer('bad')"><i class="fa-solid fa-xmark"></i> Missed it</button>
                    </div>
                </div>
                <div id="mock-result-area" class="mock-result-screen" style="display:none;"></div>
            </div>`;
        document.body.appendChild(mockOverlay);
    }

    // Daily reminder banner
    if (!document.getElementById('daily-reminder-banner')) {
        const banner = document.createElement('div');
        banner.id = 'daily-reminder-banner';
        banner.innerHTML = `
            <div class="reminder-icon">🔥</div>
            <div class="reminder-text">
                <strong id="reminder-title">Welcome back!</strong>
                <span id="reminder-sub">Continue your daily prep streak.</span>
            </div>
            <a href="#" class="reminder-cta" id="reminder-cta-link">Continue →</a>
            <button class="reminder-close" onclick="document.getElementById('daily-reminder-banner').classList.remove('show')">✕</button>`;
        document.body.appendChild(banner);
    }

    // Mobile sidebar drawer
    if (!document.getElementById('mobile-sidebar-drawer')) {
        const sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = 'mobile-sidebar-overlay';
        sidebarOverlay.addEventListener('click', closeSidebar);
        document.body.appendChild(sidebarOverlay);

        const drawer = document.createElement('nav');
        drawer.id = 'mobile-sidebar-drawer';
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = [
            { href: 'index.html', icon: 'fa-house', label: 'Home' },
            { href: 'kubernetes.html', icon: 'fa-dharmachakra', label: 'Kubernetes' },
            { href: 'terraform.html', icon: 'fa-cube', label: 'Terraform' },
            { href: 'linux.html', icon: 'fa-brands fa-linux', label: 'Linux' },
            { href: 'aws.html', icon: 'fa-brands fa-aws', label: 'AWS' },
            { href: 'cicd.html', icon: 'fa-code-branch', label: 'CI/CD' },
            { href: 'docker.html', icon: 'fa-brands fa-docker', label: 'Docker' },
            { href: 'networking.html', icon: 'fa-network-wired', label: 'Networking' },
            { href: 'git.html', icon: 'fa-brands fa-git-alt', label: 'Git' },
            { href: 'gitops.html', icon: 'fa-arrows-spin', label: 'GitOps' },
            { href: 'observability.html', icon: 'fa-chart-line', label: 'Observability' },
            { href: 'security.html', icon: 'fa-shield-halved', label: 'DevSecOps' },
            { href: 'scenario.html', icon: 'fa-users-gear', label: 'Scenarios' },
            { href: 'community.html', icon: 'fa-comments', label: 'Community' },
        ];
        drawer.innerHTML = `
            <div class="sidebar-header">
                <a href="index.html" class="cyber-logo" style="font-size:1rem; text-decoration:none;">
                    <span class="logo-glitch" data-text="DEVOPS.SRE">DEVOPS.SRE</span>
                    <span class="logo-tag">VAULT</span>
                </a>
                <button class="sidebar-close-btn" onclick="closeSidebar()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <button class="sidebar-quick-search-btn" onclick="closeSidebar(); openGlobalSearch();">
                <span><i class="fa-solid fa-magnifying-glass"></i> Quick Search...</span>
                <span class="kb-badge">⌃K</span>
            </button>
            <div class="sidebar-nav-links">
                <div class="sidebar-section-title"><i class="fa-solid fa-compass"></i> Navigation</div>
                <a href="index.html" class="${currentPage === 'index.html' || !currentPage ? 'active' : ''}"><i class="fa-solid fa-house"></i> Home</a>
                <a href="scenario.html" class="${currentPage === 'scenario.html' ? 'active' : ''}"><i class="fa-solid fa-fire-flame-curved" style="color: #f59e0b;"></i> Real Scenarios</a>
                <a href="community.html" class="${currentPage === 'community.html' ? 'active' : ''}"><i class="fa-solid fa-comments" style="color: #00d4ff;"></i> Community Doubts</a>
                <a href="javascript:void(0)" onclick="closeSidebar(); startMockInterview();"><i class="fa-solid fa-brain" style="color: #00ff88;"></i> 10-Q Mock Drill</a>

                <div class="sidebar-section-title"><i class="fa-solid fa-cloud" style="color: #38bdf8;"></i> Cloud & Containers</div>
                <a href="kubernetes.html" class="${currentPage === 'kubernetes.html' ? 'active' : ''}"><i class="fa-solid fa-dharmachakra" style="color: #326ce5;"></i> Kubernetes</a>
                <a href="aws.html" class="${currentPage === 'aws.html' ? 'active' : ''}"><i class="fa-brands fa-aws" style="color: #ff9900;"></i> AWS & Cloud</a>
                <a href="terraform.html" class="${currentPage === 'terraform.html' ? 'active' : ''}"><i class="fa-solid fa-cube" style="color: #7b42bc;"></i> Terraform</a>
                <a href="docker.html" class="${currentPage === 'docker.html' ? 'active' : ''}"><i class="fa-brands fa-docker" style="color: #2496ed;"></i> Docker</a>

                <div class="sidebar-section-title"><i class="fa-solid fa-terminal" style="color: #facc15;"></i> Core & Systems</div>
                <a href="linux.html" class="${currentPage === 'linux.html' ? 'active' : ''}"><i class="fa-brands fa-linux" style="color: #fcc624;"></i> Linux & OS</a>
                <a href="networking.html" class="${currentPage === 'networking.html' ? 'active' : ''}"><i class="fa-solid fa-network-wired" style="color: #10b981;"></i> Networking</a>
                <a href="git.html" class="${currentPage === 'git.html' ? 'active' : ''}"><i class="fa-brands fa-git-alt" style="color: #f05032;"></i> Git & VCS</a>

                <div class="sidebar-section-title"><i class="fa-solid fa-gears" style="color: #22d3ee;"></i> Delivery & GitOps</div>
                <a href="cicd.html" class="${currentPage === 'cicd.html' ? 'active' : ''}"><i class="fa-solid fa-code-branch" style="color: #00f0ff;"></i> CI/CD Pipelines</a>
                <a href="gitops.html" class="${currentPage === 'gitops.html' ? 'active' : ''}"><i class="fa-solid fa-arrows-spin" style="color: #ef4444;"></i> GitOps & ArgoCD</a>

                <div class="sidebar-section-title"><i class="fa-solid fa-shield-halved" style="color: #a855f7;"></i> Reliability & SRE</div>
                <a href="observability.html" class="${currentPage === 'observability.html' ? 'active' : ''}"><i class="fa-solid fa-chart-line" style="color: #a855f7;"></i> Observability</a>
                <a href="security.html" class="${currentPage === 'security.html' ? 'active' : ''}"><i class="fa-solid fa-shield-halved" style="color: #ec4899;"></i> DevSecOps</a>
            </div>
            <div class="sidebar-footer">DevOps SRE Vault 2026 • 1325+ Questions</div>`;
        document.body.appendChild(drawer);
    }
}

/* ── #9 Scroll-to-Top ───────────────────────────────────────────────────── */
function initScrollToTop() {
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scroll-top-btn');
        if (btn) btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
}

/* ── #4 Mobile Sidebar Drawer ───────────────────────────────────────────── */
function initMobileSidebarDrawer() {
    // Hook the hamburger button AFTER header renders
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.cyber-mobile-toggle');
        if (toggle) { e.preventDefault(); openSidebar(); }
    });
}
function openSidebar() {
    document.getElementById('mobile-sidebar-overlay')?.classList.add('open');
    document.getElementById('mobile-sidebar-drawer')?.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    document.getElementById('mobile-sidebar-overlay')?.classList.remove('open');
    document.getElementById('mobile-sidebar-drawer')?.classList.remove('open');
    document.body.style.overflow = '';
}

/* ── #3 Keyboard Shortcuts ──────────────────────────────────────────────── */
window.toggleKbOverlay = function(open) {
    document.getElementById('kb-shortcuts-overlay')?.classList.toggle('open', open);
};

let activeQIdx = -1;

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement.tagName.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tag)) return;

        const overlay = document.getElementById('kb-shortcuts-overlay');
        const searchOverlay = document.getElementById('global-search-overlay');
        const mockOverlay = document.getElementById('mock-interview-overlay');

        if (e.key === 'Escape') {
            if (overlay?.classList.contains('open')) { toggleKbOverlay(false); return; }
            if (searchOverlay?.classList.contains('open')) { closeGlobalSearch(); return; }
            if (mockOverlay?.classList.contains('open')) { closeMockInterview(); return; }
        }
        if (e.key === '?') { toggleKbOverlay(true); return; }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openGlobalSearch(); return; }
        if (e.key === 'i' || e.key === 'I') { if (!mockOverlay?.classList.contains('open')) startMockInterview(); return; }

        // Topic-page navigation shortcuts
        const cards = Array.from(document.querySelectorAll('.cyber-qa-item'));
        if (!cards.length) return;

        if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            activeQIdx = Math.min(activeQIdx + 1, cards.length - 1);
            cards[activeQIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            activeQIdx = Math.max(activeQIdx - 1, 0);
            cards[activeQIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (e.key === ' ') {
            if (activeQIdx >= 0 && cards[activeQIdx]) {
                e.preventDefault();
                cards[activeQIdx].classList.toggle('active');
            }
        } else if (e.key === 'm' || e.key === 'M') {
            if (activeQIdx >= 0 && cards[activeQIdx]) {
                const chk = cards[activeQIdx].querySelector('.q-mastery-chk');
                if (chk) { chk.checked = !chk.checked; chk.dispatchEvent(new Event('change')); }
            }
        } else if (e.key === 'b' || e.key === 'B') {
            if (activeQIdx >= 0 && cards[activeQIdx]) {
                const bBtn = cards[activeQIdx].querySelector('.btn-bookmark-q');
                if (bBtn) bBtn.click();
            }
        } else if (e.key === 'f' || e.key === 'F') {
            const modeBtn = document.getElementById(
                document.getElementById('mode-accordion')?.classList.contains('active')
                    ? 'mode-flashcard' : 'mode-accordion'
            );
            modeBtn?.click();
        }
    });
}

/* ── #2 Global Search ───────────────────────────────────────────────────── */
const TOPIC_PAGE_MAP = {
    linux: 'linux.html', git: 'git.html', cicd: 'cicd.html',
    docker: 'docker.html', kubernetes: 'kubernetes.html',
    terraform: 'terraform.html', aws: 'aws.html',
    networking: 'networking.html', gitops: 'gitops.html',
    observability: 'observability.html', security: 'security.html',
    scenario: 'scenario.html'
};

function openGlobalSearch() {
    const overlay = document.getElementById('global-search-overlay');
    overlay?.classList.add('open');
    setTimeout(() => document.getElementById('global-search-input')?.focus(), 50);
}
function closeGlobalSearch() {
    document.getElementById('global-search-overlay')?.classList.remove('open');
    const inp = document.getElementById('global-search-input');
    if (inp) inp.value = '';
    const res = document.getElementById('global-search-results');
    if (res) res.innerHTML = '';
}
window.closeGlobalSearch = closeGlobalSearch;

function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function initGlobalSearch() {
    // Wire nav search trigger (added dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#global-search-trigger')) openGlobalSearch();
    });

    document.addEventListener('input', (e) => {
        if (e.target.id !== 'global-search-input') return;
        const query = e.target.value.trim();
        const resultsEl = document.getElementById('global-search-results');
        if (!resultsEl) return;

        if (!query || query.length < 2) {
            resultsEl.innerHTML = '<div class="gsearch-empty"><i class="fa-solid fa-magnifying-glass"></i><br>Type at least 2 characters to search</div>';
            return;
        }

        const data = window.allQuestionsData;
        if (!data) { resultsEl.innerHTML = '<div class="gsearch-empty">Questions data not loaded</div>'; return; }

        const results = [];
        const q = query.toLowerCase();
        for (const [topic, questions] of Object.entries(data)) {
            for (const item of questions) {
                if (item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)) {
                    results.push({ topic, item });
                    if (results.length >= 30) break;
                }
            }
            if (results.length >= 30) break;
        }

        if (results.length === 0) {
            resultsEl.innerHTML = `<div class="gsearch-empty">No results for "<strong>${escapeHtml(query)}</strong>"</div>`;
            return;
        }

        resultsEl.innerHTML = results.map(({ topic, item }) => {
            const page = TOPIC_PAGE_MAP[topic] || `${topic}.html`;
            const highlighted = highlightMatch(escapeHtml(item.question), query);
            return `<div class="gsearch-result-item" onclick="window.location.href='${page}?q=${item.id}'">
                <div class="gsearch-result-topic">${topic.toUpperCase()}</div>
                <div class="gsearch-result-q">${highlighted}</div>
            </div>`;
        }).join('');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.getElementById('global-search-overlay')?.classList.contains('open')) {
            const firstResult = document.querySelector('.gsearch-result-item');
            if (firstResult) firstResult.click();
        }
    });
}

/* ── Add global search trigger to navbars ───────────────────────────────── */
(function addSearchTriggerToNav() {
    document.addEventListener('DOMContentLoaded', () => {
        const navControls = document.querySelector('.nav-controls');
        if (navControls && !document.getElementById('global-search-trigger')) {
            const trigger = document.createElement('button');
            trigger.id = 'global-search-trigger';
            trigger.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search <span class="kb-badge">⌃K</span>';
            navControls.prepend(trigger);

            // Mock interview button
            const mockBtn = document.createElement('button');
            mockBtn.id = 'mock-interview-nav-btn';
            mockBtn.innerHTML = '<i class="fa-solid fa-brain"></i> Mock Interview';
            mockBtn.addEventListener('click', startMockInterview);
            navControls.prepend(mockBtn);

            // PWA Install Button
            const pwaBtn = document.createElement('button');
            pwaBtn.id = 'pwa-install-nav-btn';
            pwaBtn.innerHTML = '<i class="fa-solid fa-download"></i> Install App';
            navControls.prepend(pwaBtn);
        }
    });
})();

/* ── #5 Mock Interview Mode ─────────────────────────────────────────────── */
let mockQuestions = [];
let mockIdx = 0;
let mockScores = { good: 0, ok: 0, bad: 0 };

function initMockInterview() {
    // Just ensures overlay exists (created in injectGlobalUI)
}

function startMockInterview() {
    const data = window.allQuestionsData;
    if (!data) { showCyberToast('Questions not loaded yet'); return; }

    // Pick 10 random questions from across all topics
    const allQ = Object.entries(data).flatMap(([topic, qs]) => qs.map(q => ({ ...q, _topic: topic })));
    mockQuestions = allQ.sort(() => Math.random() - 0.5).slice(0, 10);
    mockIdx = 0;
    mockScores = { good: 0, ok: 0, bad: 0 };

    document.getElementById('mock-interview-overlay')?.classList.add('open');
    loadMockQuestion();
}
window.startMockInterview = startMockInterview;

function loadMockQuestion() {
    const q = mockQuestions[mockIdx];
    if (!q) return;

    const pct = (mockIdx / mockQuestions.length) * 100;
    document.getElementById('mock-prog-fill').style.width = pct + '%';
    document.getElementById('mock-prog-text').textContent = `Question ${mockIdx + 1} / ${mockQuestions.length}`;
    document.getElementById('mock-q-topic').textContent = (q._topic || '').toUpperCase();
    document.getElementById('mock-q-text').textContent = q.question;

    const answerBox = document.getElementById('mock-answer-box');
    answerBox.innerHTML = q.answer;
    answerBox.classList.remove('visible');

    document.getElementById('mock-reveal-btn').style.display = 'block';
    document.getElementById('mock-rating-row').style.display = 'none';
    document.getElementById('mock-question-area').style.display = 'block';
    document.getElementById('mock-result-area').style.display = 'none';
}

window.revealMockAnswer = function() {
    document.getElementById('mock-answer-box').classList.add('visible');
    document.getElementById('mock-reveal-btn').style.display = 'none';
    document.getElementById('mock-rating-row').style.display = 'flex';
};

window.rateMockAnswer = function(rating) {
    mockScores[rating]++;
    mockIdx++;
    if (mockIdx >= mockQuestions.length) {
        showMockResult();
    } else {
        loadMockQuestion();
    }
};

function showMockResult() {
    const total = mockQuestions.length;
    const score = mockScores.good;
    const pct = Math.round((score / total) * 100);
    const grade = pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good Progress!' : '💪 Keep Practicing!';

    document.getElementById('mock-prog-fill').style.width = '100%';
    document.getElementById('mock-question-area').style.display = 'none';
    document.getElementById('mock-result-area').style.display = 'block';
    document.getElementById('mock-result-area').innerHTML = `
        <div class="mock-result-screen">
            <div class="mock-score-big">${pct}%</div>
            <h3>${grade}</h3>
            <p>You got <strong>${score} / ${total}</strong> questions right<br>
               <span style="color:var(--neon-green);">✓ ${mockScores.good} Confident</span> &nbsp;
               <span style="color:#fbbf24;">~ ${mockScores.ok} Partial</span> &nbsp;
               <span style="color:#f87171;">✗ ${mockScores.bad} Missed</span>
            </p>
            <button class="mock-restart-btn" onclick="startMockInterview()">Try Again</button>
            <button style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--text-muted);padding:0.7rem 1.5rem;border-radius:10px;cursor:pointer;" onclick="closeMockInterview()">Close</button>
        </div>`;
}

window.closeMockInterview = function() {
    document.getElementById('mock-interview-overlay')?.classList.remove('open');
};

/* ── #6 Daily Revision Reminder ─────────────────────────────────────────── */
function initDailyReminderBanner() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('devops_vault_last_visit');
    const lastTopic = localStorage.getItem('devops_vault_last_topic');

    localStorage.setItem('devops_vault_last_visit', today);

    // Store current topic
    const curTopic = document.body.getAttribute('data-topic');
    if (curTopic && curTopic !== 'hub' && curTopic !== 'community') {
        localStorage.setItem('devops_vault_last_topic', curTopic);
    }

    if (!lastVisit || lastVisit === today) return; // First visit today — skip

    const banner = document.getElementById('daily-reminder-banner');
    if (!banner) return;

    const daysSince = Math.round((new Date(today) - new Date(lastVisit)) / 86400000);
    const title = daysSince <= 1 ? 'Welcome back! 🔥 Day streak!' : `Welcome back after ${daysSince} days!`;
    const sub = lastTopic
        ? `Pick up where you left off — ${lastTopic.charAt(0).toUpperCase() + lastTopic.slice(1)}`
        : 'Continue your DevOps interview prep today';
    const ctaHref = lastTopic ? `${TOPIC_PAGE_MAP[lastTopic] || lastTopic + '.html'}` : '#topics-grid';

    document.getElementById('reminder-title').textContent = title;
    document.getElementById('reminder-sub').textContent = sub;
    document.getElementById('reminder-cta-link').href = ctaHref;

    setTimeout(() => banner.classList.add('show'), 800);
    setTimeout(() => banner.classList.remove('show'), 8000);
}

/* ── #12 Reading Time Estimate ──────────────────────────────────────────── */
function initReadingTimeEstimate(topicKey) {
    const statsBar = document.querySelector('.topic-stats-bar');
    if (!statsBar) return;

    const questions = (window.allQuestionsData || {})[topicKey] || [];
    const avgWordsPerQ = 60;
    const totalWords = questions.length * avgWordsPerQ;
    const minutes = Math.round(totalWords / 200);

    const pill = document.createElement('div');
    pill.className = 'stat-pill reading-time-pill';
    pill.innerHTML = `<i class="fa-solid fa-clock"></i> ~${minutes} min read`;
    statsBar.appendChild(pill);
}

/* ── #11 Deep-link / Share a Question ───────────────────────────────────── */
function initDeepLink(topicKey) {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('q');
    if (!targetId) return;

    // Wait for render to complete then open target
    setTimeout(() => {
        const el = document.getElementById(targetId);
        if (!el) return;
        el.classList.add('active', 'deeplink-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('deeplink-highlight'), 3000);
    }, 600);
}

/* ── #8 Bookmark (Star) Questions ───────────────────────────────────────── */
function isQuestionBookmarked(qid) {
    const saved = JSON.parse(localStorage.getItem('devops_vault_bookmarks') || '[]');
    return saved.includes(qid);
}

function attachBookmarkListeners(topicKey, renderFn) {
    document.querySelectorAll('.btn-bookmark-q').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qid = btn.getAttribute('data-qid');
            let saved = JSON.parse(localStorage.getItem('devops_vault_bookmarks') || '[]');
            const isNowBookmarked = !saved.includes(qid);

            if (isNowBookmarked) {
                saved.push(qid);
                showCyberToast('Question bookmarked ⭐');
            } else {
                saved = saved.filter(id => id !== qid);
                showCyberToast('Bookmark removed');
            }
            localStorage.setItem('devops_vault_bookmarks', JSON.stringify(saved));

            // Update button immediately
            btn.className = `btn-bookmark-q ${isNowBookmarked ? 'bookmarked' : ''}`;
            btn.title = isNowBookmarked ? 'Remove bookmark' : 'Bookmark question';
            btn.innerHTML = `<i class="fa-${isNowBookmarked ? 'solid' : 'regular'} fa-star"></i>`;

            // Update saved count badge
            const savedCountEl = document.getElementById('saved-count');
            if (savedCountEl) savedCountEl.textContent = saved.length;

            // If in 'saved' filter mode, re-render
            if (typeof activeFilter !== 'undefined' && activeFilter === 'saved') renderFn();
        });
    });

    // Update saved count on load
    const savedCountEl = document.getElementById('saved-count');
    if (savedCountEl) {
        const saved = JSON.parse(localStorage.getItem('devops_vault_bookmarks') || '[]');
        savedCountEl.textContent = saved.length;
    }
}

function attachShareListeners() {
    document.querySelectorAll('.btn-share-q').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qid = btn.getAttribute('data-qid');
            const url = `${window.location.origin}${window.location.pathname}?q=${qid}`;
            navigator.clipboard.writeText(url).then(() => {
                showCyberToast('Question link copied to clipboard 🔗');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); document.body.removeChild(ta);
                showCyberToast('Question link copied 🔗');
            });
        });
    });
}

/* ── #1 Global Progress Dashboard (Home page) ───────────────────────────── */
const TOPIC_CONFIG = [
    { key: 'linux',        label: 'Linux',          total: 104, color: '#00ff88' },
    { key: 'git',          label: 'Git',             total: 104, color: '#f34f29' },
    { key: 'cicd',         label: 'CI/CD',           total: 106, color: '#00d4ff' },
    { key: 'docker',       label: 'Docker',          total: 106, color: '#2496ed' },
    { key: 'kubernetes',   label: 'Kubernetes',      total: 161, color: '#326ce5' },
    { key: 'terraform',    label: 'Terraform',       total: 115, color: '#844fba' },
    { key: 'aws',          label: 'AWS',             total: 112, color: '#ff9900' },
    { key: 'networking',   label: 'Networking',      total: 103, color: '#00d4ff' },
    { key: 'gitops',       label: 'GitOps',          total: 102, color: '#ef6b73' },
    { key: 'observability',label: 'Observability',   total: 103, color: '#00ff88' },
    { key: 'security',     label: 'Security',        total: 102, color: '#a855f7' },
    { key: 'scenario',     label: 'Scenarios',       total: 107, color: '#facc15' },
];
const TOTAL_QUESTIONS = 1325;

function initGlobalProgressDashboard() {
    const section = document.getElementById('global-progress-section');
    if (!section) return;

    function getTotalMastered() {
        return TOPIC_CONFIG.reduce((sum, t) => {
            const m = JSON.parse(localStorage.getItem(`mastered_${t.key}`) || '[]');
            return sum + m.length;
        }, 0);
    }

    function renderDashboard() {
        const totalMastered = getTotalMastered();
        const pct = Math.round((totalMastered / TOTAL_QUESTIONS) * 100);
        const circumference = 408;
        const offset = circumference - (pct / 100) * circumference;

        section.innerHTML = `
            <div class="section-title-wrapper" data-aos="fade-up">
                <span class="hud-subtitle">YOUR JOURNEY</span>
                <h2 class="section-heading">Overall Mastery Dashboard</h2>
                <p class="section-description">Track your progress across all 12 topic vaults. Questions marked "Mastered" appear here.</p>
            </div>
            <div class="progress-dashboard-grid" data-aos="fade-up">
                <div class="progress-total-card">
                    <div class="progress-ring-wrap">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle class="progress-ring-track" cx="70" cy="70" r="65"/>
                            <circle class="progress-ring-fill" id="prog-ring-fill" cx="70" cy="70" r="65" style="stroke-dashoffset:${offset}"/>
                        </svg>
                        <div class="progress-ring-center">
                            <span class="progress-ring-pct">${pct}%</span>
                            <span class="progress-ring-label">Mastered</span>
                        </div>
                    </div>
                    <div class="progress-total-mastered">
                        <strong>${totalMastered}</strong> / ${TOTAL_QUESTIONS} questions mastered
                    </div>
                    <button class="reset-progress-btn" onclick="resetAllProgress()">
                        <i class="fa-solid fa-rotate-left"></i> Reset All Progress
                    </button>
                </div>
                <div class="progress-topic-bars">
                    <h4><i class="fa-solid fa-chart-bar"></i> Per-Topic Breakdown</h4>
                    ${TOPIC_CONFIG.map(t => {
                        const mastered = JSON.parse(localStorage.getItem(`mastered_${t.key}`) || '[]').length;
                        const barPct = Math.round((mastered / t.total) * 100);
                        return `
                            <div class="topic-bar-row">
                                <span class="topic-bar-name">${t.label}</span>
                                <div class="topic-bar-bg">
                                    <div class="topic-bar-fill" style="width:${barPct}%;background:${t.color};"></div>
                                </div>
                                <span class="topic-bar-count">${mastered}/${t.total}</span>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    renderDashboard();
}

window.resetAllProgress = function() {
    if (!confirm('Reset ALL mastery progress across all topics? This cannot be undone.')) return;
    TOPIC_CONFIG.forEach(t => localStorage.removeItem(`mastered_${t.key}`));
    showCyberToast('All progress reset');
    initGlobalProgressDashboard();
};

/* ── #10 Topic Progress Bars on Home Vault Cards ────────────────────────── */
function initTopicProgressBars() {
    document.querySelectorAll('.topic-vault-card').forEach(card => {
        const href = card.getAttribute('href') || '';
        const topicKey = Object.entries(TOPIC_PAGE_MAP).find(([k, v]) => v === href)?.[0];
        if (!topicKey) return;

        const topicConf = TOPIC_CONFIG.find(t => t.key === topicKey);
        if (!topicConf) return;

        const mastered = JSON.parse(localStorage.getItem(`mastered_${topicKey}`) || '[]').length;
        const total = topicConf.total;
        const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

        const footer = card.querySelector('.vault-footer');
        if (!footer) return;

        const progressHtml = `
            <div class="vault-progress-wrap">
                <div class="vault-progress-bar-bg">
                    <div class="vault-progress-bar-fill" style="width:${pct}%;background:${topicConf.color};"></div>
                </div>
                <div class="vault-progress-label">${mastered} / ${total} mastered (${pct}%)</div>
            </div>`;
        footer.insertAdjacentHTML('afterend', progressHtml);
    });
}

/* ── Markdown / Cheatsheet File Exporter ─────────────────────────────────── */
function exportTopicMarkdown(topicKey) {
    const topic = topicKey || document.body.getAttribute('data-topic');
    if (!topic || !window.allQuestionsData || !window.allQuestionsData[topic]) {
        // Fallback to window.print if not on a topic page
        window.print();
        return;
    }
    const questions = window.allQuestionsData[topic];
    const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    let md = `# DevOps & SRE Interview Cheatsheet: ${topicTitle} Vault\n`;
    md += `*Generated from DevOps & SRE Interview Preparation Platform | Total Questions: ${questions.length}*\n\n`;
    md += `---\n\n`;
    
    questions.forEach((q, idx) => {
        const levelBadge = q.level ? `[${q.level.toUpperCase()}]` : '';
        // Clean up simple html tags for markdown readability
        const cleanAnswer = q.answer
            .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
            .replace(/<code>(.*?)<\/code>/gi, '`$1`')
            .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em>(.*?)<\/em>/gi, '*$1*')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]+>/g, '');

        md += `### Q${idx + 1}. ${q.question} ${levelBadge}\n\n`;
        md += `${cleanAnswer.trim()}\n\n`;
        if (q.tags && q.tags.length) {
            md += `*Tags: ${q.tags.map(t => '#' + t).join(' ')}*\n\n`;
        }
        md += `---\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${topic}-devops-sre-interview-prep.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showCyberToast(`Exported ${questions.length} questions to Markdown! 📄`);
}

window.exportTopicMarkdown = exportTopicMarkdown;
window.exportCurrentTopicMarkdown = exportTopicMarkdown;

/* ==========================================================================
   FEATURE 1: Crystal-Clear Neural Voice Reader (ChatGPT-Quality Web Speech)
   ========================================================================== */
let activeSpeechUtterance = null;
let activeSpeakingBtn = null;
let cachedBestVoice = null;
let speechHeartbeatInterval = null;

// Eagerly pre-load voices as soon as browser is ready
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        cachedBestVoice = getChatGPTLikeVoice();
    };
    try {
        window.speechSynthesis.getVoices();
    } catch (e) {}
}

function startSpeechHeartbeat() {
    stopSpeechHeartbeat();
    speechHeartbeatInterval = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }
    }, 10000);
}

function stopSpeechHeartbeat() {
    if (speechHeartbeatInterval) {
        clearInterval(speechHeartbeatInterval);
        speechHeartbeatInterval = null;
    }
}

/**
 * Priority selector for natural, human-like neural voices
 * (Azure Natural, Apple Enhanced/Premium, Google US English)
 */
function getChatGPTLikeVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (cachedBestVoice && voices.includes(cachedBestVoice)) {
        return cachedBestVoice;
    }

    const priorityFilters = [
        // 1. Azure Natural Voices (Edge on Windows/macOS)
        v => /jenny.*natural/i.test(v.name) && v.lang.startsWith('en'),
        v => /aria.*natural/i.test(v.name) && v.lang.startsWith('en'),
        v => /guy.*natural/i.test(v.name) && v.lang.startsWith('en'),
        v => /christopher.*natural/i.test(v.name) && v.lang.startsWith('en'),
        v => /natural/i.test(v.name) && v.lang.startsWith('en'),

        // 2. Apple Enhanced/Premium Voices (macOS / iOS)
        v => /ava.*(premium|enhanced)/i.test(v.name),
        v => /samantha.*(premium|enhanced)/i.test(v.name),
        v => /zoe.*(premium|enhanced)/i.test(v.name),
        v => /daniel.*(premium|enhanced)/i.test(v.name),
        v => /(premium|enhanced)/i.test(v.name) && v.lang.startsWith('en'),

        // 3. Google High-Quality English Voices (Chrome)
        v => /google us english/i.test(v.name),
        v => /google uk english female/i.test(v.name),
        v => /google/i.test(v.name) && v.lang.startsWith('en'),

        // 4. Clean Standard Apple / OS Voices
        v => /^samantha$/i.test(v.name),
        v => /^victoria$/i.test(v.name),
        v => /^karen$/i.test(v.name),
        v => /^daniel$/i.test(v.name),
        v => /^alex$/i.test(v.name),

        // 5. English US / UK defaults
        v => v.lang === 'en-US' || v.lang === 'en_US',
        v => v.lang.startsWith('en')
    ];

    for (const filterFn of priorityFilters) {
        const found = voices.find(filterFn);
        if (found) {
            cachedBestVoice = found;
            return found;
        }
    }

    return voices[0] || null;
}

/**
 * Phonetically tunes tech acronyms, command lines, and jargon
 * so the voice speaks naturally like an experienced SRE mentor
 */
function cleanTechTextForVoice(text) {
    if (!text) return '';
    let s = text;

    const phoneticReplacements = [
        [/\bK8s\b/gi, 'Kubernetes'],
        [/\bkubectl\b/gi, 'kube-control'],
        [/\betcd\b/gi, 'et-see-dee'],
        [/\bOOMKilled\b/gi, 'O-O-M Killed'],
        [/\bRBAC\b/gi, 'R-back'],
        [/\bYAML\b/gi, 'yam-el'],
        [/\bIaC\b/gi, 'Infrastructure as Code'],
        [/\bCI\/CD\b/gi, 'C-I C-D'],
        [/\bSRE\b/gi, 'S-R-E'],
        [/\bDevOps\b/gi, 'Dev-Ops'],
        [/\bIAM\b/gi, 'I-A-M'],
        [/\bVPC\b/gi, 'V-P-C'],
        [/\bDNS\b/gi, 'D-N-S'],
        [/\bAPI\b/gi, 'A-P-I'],
        [/\bCLI\b/gi, 'C-L-I'],
        [/\bSSH\b/gi, 'S-S-H'],
        [/\bTCP\/IP\b/gi, 'T-C-P I-P'],
        [/\bHTTP\/2\b/gi, 'HTTP 2'],
        [/\bHTTPS\b/gi, 'H-T-T-P-S'],
        [/\bgRPC\b/gi, 'G-R-P-C'],
        [/\bJSON\b/gi, 'Jay-son'],
        [/\bnginx\b/gi, 'Engine-X'],
        [/\bNGINX\b/gi, 'Engine-X'],
        [/\bcron\b/gi, 'kron'],
        [/\bdaemon\b/gi, 'day-mon'],
        [/\bstdout\b/gi, 'standard out'],
        [/\bstderr\b/gi, 'standard error'],
        [/\bstdin\b/gi, 'standard in'],
        [/\bprod\b/gi, 'production'],
        [/\benv\b/gi, 'environment'],
        [/\brepo\b/gi, 'repository'],
        [/\bAMI\b/gi, 'A-M-I'],
        [/\bAWS\b/g, 'A-W-S'],
        [/\bEC2\b/gi, 'E-C-2'],
        [/\bS3\b/gi, 'S-3'],
        [/\bEKS\b/gi, 'E-K-S'],
        [/\bECS\b/gi, 'E-C-S'],
        [/\bSSL\b/gi, 'S-S-L'],
        [/\bTLS\b/gi, 'T-L-S'],
        [/\bOS\b/g, 'O-S'],
        [/\bHPA\b/gi, 'Horizontal Pod Autoscaler'],
        [/\bVPA\b/gi, 'Vertical Pod Autoscaler'],
        [/\bCRD\b/gi, 'Custom Resource Definition'],
        [/\bCRDs\b/gi, 'Custom Resource Definitions'],
        [/\bCNI\b/gi, 'C-N-I'],
        [/\bCSI\b/gi, 'C-S-I'],
        [/\beBPF\b/gi, 'e-B-P-F'],
        [/\bSLA\b/gi, 'S-L-A'],
        [/\bSLO\b/gi, 'S-L-O'],
        [/\bSLI\b/gi, 'S-L-I'],
        [/\bMTTR\b/gi, 'M-T-T-R'],
        [/\bMTTD\b/gi, 'M-T-T-D'],
        [/\bArgoCD\b/gi, 'Argo C-D'],
        [/\bCPU\b/gi, 'C-P-U'],
        [/\bRAM\b/gi, 'Ram'],
        [/\bGB\b/gi, 'Gigabytes'],
        [/\bMB\b/gi, 'Megabytes'],
        [/\bms\b/gi, 'milliseconds'],
        [/\bsec\b/gi, 'seconds'],
        [/\be\.g\.,?\b/gi, 'for example, '],
        [/\bi\.e\.,?\b/gi, 'that is, ']
    ];

    phoneticReplacements.forEach(([pattern, repl]) => {
        s = s.replace(pattern, repl);
    });

    s = s.replace(/[#*_~`]/g, ' ');
    s = s.replace(/\s*->\s*/g, ' transitions to ');
    s = s.replace(/\s*=>\s*/g, ' leads to ');
    s = s.replace(/\s*\|\s*/g, ', ');
    s = s.replace(/[\{\}\[\]\<\>\\]/g, ' ');
    s = s.replace(/[\r\n]+/g, '. ');
    s = s.replace(/\s{2,}/g, ' ');
    s = s.replace(/\.\s*\./g, '.');

    return s.trim();
}

/**
 * Prepares a clean conversational spoken script from question and answer DOM,
 * gracefully summarizing code snippets and manifests without reading raw punctuation.
 */
function prepareChatGPTSpokenScript(card) {
    const titleEl = card.querySelector('.qa-question-title');
    const questionText = titleEl ? titleEl.textContent.trim() : '';

    const answerInner = card.querySelector('.qa-answer-inner');
    if (!answerInner) return `Question: ${questionText}.`;

    const clone = answerInner.cloneNode(true);

    // Remove buttons, tags, dials, and interactive elements
    clone.querySelectorAll('.code-copy-btn, button, .qa-tags-row, .drill-timer-hud, script, style').forEach(el => el.remove());

    // Replace code blocks and pre elements with a natural spoken notification
    clone.querySelectorAll('pre').forEach(preEl => {
        const replacement = document.createTextNode(' [A practical code snippet and configuration manifest is available in the answer reference sheet.] ');
        preEl.replaceWith(replacement);
    });

    clone.querySelectorAll('code').forEach(codeEl => {
        if (codeEl.textContent.length > 35) {
            const replacement = document.createTextNode(' [code example provided] ');
            codeEl.replaceWith(replacement);
        }
    });

    // Add conversational pauses before headings
    clone.querySelectorAll('h4, h5, h6').forEach(h => {
        const headingText = h.textContent.trim().replace(/:$/, '');
        h.textContent = `. Key Section: ${headingText}. `;
    });

    const rawAnswerText = clone.textContent || '';
    const cleanedAnswer = cleanTechTextForVoice(rawAnswerText);

    return `Question: ${questionText}. ... Core Answer: ${cleanedAnswer}`;
}

function attachTTSListeners() {
    document.querySelectorAll('.btn-tts-listen').forEach(btn => {
        if (btn._ttsBound) return;
        btn._ttsBound = true;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qid = btn.getAttribute('data-qid');
            const card = document.getElementById(qid);
            if (!card) return;

            // Toggle Stop if currently speaking this button
            if (btn === activeSpeakingBtn && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
                stopSpeechHeartbeat();
                window.speechSynthesis.cancel();
                resetTTSBtn(btn);
                activeSpeakingBtn = null;
                activeSpeechUtterance = null;
                return;
            }

            // Stop any currently running speech
            if (window.speechSynthesis) {
                stopSpeechHeartbeat();
                window.speechSynthesis.cancel();
            }
            if (activeSpeakingBtn) resetTTSBtn(activeSpeakingBtn);

            if (!('speechSynthesis' in window)) {
                showCyberToast('Speech synthesis not supported in this browser 🔇');
                return;
            }

            const spokenScript = prepareChatGPTSpokenScript(card);
            const utterance = new SpeechSynthesisUtterance(spokenScript);

            const bestVoice = getChatGPTLikeVoice();
            if (bestVoice) {
                utterance.voice = bestVoice;
            }

            // Pacing & Cadence: Deliberate, clear, articulate conversational speed
            utterance.rate = 0.96;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
                btn.classList.add('playing');
                const lbl = btn.querySelector('.tts-lbl');
                if (lbl) lbl.textContent = 'Stop';
                activeSpeakingBtn = btn;
                startSpeechHeartbeat();

                const vName = bestVoice ? bestVoice.name.replace(/Online \(Natural\)|Enhanced|Premium|Google/gi, '').trim() : 'Neural Voice';
                showCyberToast(`Playing clear voice reader (${vName}) 🎙️`);
            };

            utterance.onend = () => {
                stopSpeechHeartbeat();
                resetTTSBtn(btn);
                activeSpeakingBtn = null;
                activeSpeechUtterance = null;
            };

            utterance.onerror = (err) => {
                stopSpeechHeartbeat();
                resetTTSBtn(btn);
                activeSpeakingBtn = null;
                activeSpeechUtterance = null;
            };

            activeSpeechUtterance = utterance;
            window.speechSynthesis.speak(utterance);
        });
    });
}

function resetTTSBtn(btn) {
    if (!btn) return;
    btn.classList.remove('playing');
    const lbl = btn.querySelector('.tts-lbl');
    if (lbl) lbl.textContent = 'Listen';
}

/* ==========================================================================
   FEATURE 2: 2-Minute Interview Pressure Drill Timer
   ========================================================================== */
const drillTimers = {};

function attachDrillTimerListeners() {
    document.querySelectorAll('.btn-timer-toggle').forEach(btn => {
        if (btn._timerBound) return;
        btn._timerBound = true;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qid = btn.getAttribute('data-qid');
            const hud = document.getElementById(`drill-timer-${qid}`);
            if (!hud) return;

            const isOpen = hud.classList.toggle('open');
            btn.classList.toggle('active', isOpen);

            if (isOpen) {
                const card = document.getElementById(qid);
                if (card) card.classList.add('active');
            }
        });
    });
}

function toggleDrillTimer(qid) {
    const hud = document.getElementById(`drill-timer-${qid}`);
    if (!hud) return;

    if (!drillTimers[qid]) {
        drillTimers[qid] = { seconds: 120, interval: null, isRunning: false };
    }
    const timer = drillTimers[qid];
    const btn = document.getElementById(`btn-start-${qid}`);
    const status = document.getElementById(`timer-status-${qid}`);

    if (timer.isRunning) {
        clearInterval(timer.interval);
        timer.isRunning = false;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
        if (btn) btn.classList.remove('running');
        if (status) status.textContent = 'Timer paused. Click resume when ready.';
    } else {
        timer.isRunning = true;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        if (btn) btn.classList.add('running');
        if (status) status.textContent = 'Practice explaining aloud now!';

        timer.interval = setInterval(() => {
            timer.seconds--;
            updateDrillDisplay(qid);

            if (timer.seconds === 10) {
                playSynthSound('beep');
            }

            if (timer.seconds <= 0) {
                clearInterval(timer.interval);
                timer.isRunning = false;
                if (btn) btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restart';
                if (btn) btn.classList.remove('running');
                if (status) status.innerHTML = '<strong style="color:var(--neon-green);">⏱️ Time Up! Great response practice!</strong>';
                playSynthSound('mastered');
                launchCyberConfetti();
                showCyberToast('2-minute interview drill completed! ⏱️');
            }
        }, 1000);
    }
}

function updateDrillDisplay(qid) {
    const timer = drillTimers[qid];
    if (!timer) return;

    const dial = document.getElementById(`timer-dial-${qid}`);
    const dialBar = document.getElementById(`dial-bar-${qid}`);
    const dialNum = document.getElementById(`dial-num-${qid}`);

    const mins = Math.floor(timer.seconds / 60);
    const secs = timer.seconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (dialNum) dialNum.textContent = timeStr;

    const totalSecs = 120;
    const circumference = 113.1;
    const offset = circumference - (timer.seconds / totalSecs) * circumference;
    if (dialBar) dialBar.style.strokeDashoffset = offset;

    if (dial) {
        dial.classList.remove('warn', 'danger');
        if (timer.seconds <= 15) {
            dial.classList.add('danger');
        } else if (timer.seconds <= 45) {
            dial.classList.add('warn');
        }
    }
}

function resetDrillTimer(qid) {
    if (drillTimers[qid]) {
        clearInterval(drillTimers[qid].interval);
    }
    drillTimers[qid] = { seconds: 120, interval: null, isRunning: false };
    const btn = document.getElementById(`btn-start-${qid}`);
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        btn.classList.remove('running');
    }
    const status = document.getElementById(`timer-status-${qid}`);
    if (status) status.textContent = 'Explain this question aloud under 2 minutes';
    updateDrillDisplay(qid);
}

function closeDrillTimer(qid) {
    resetDrillTimer(qid);
    const hud = document.getElementById(`drill-timer-${qid}`);
    if (hud) hud.classList.remove('open');
    const toggleBtn = document.querySelector(`.btn-timer-toggle[data-qid="${qid}"]`);
    if (toggleBtn) toggleBtn.classList.remove('active');
}

window.toggleDrillTimer = toggleDrillTimer;
window.resetDrillTimer = resetDrillTimer;
window.closeDrillTimer = closeDrillTimer;

/* ==========================================================================
   FEATURE 3: Cyber Milestone & Mastery Confetti Particle Burst
   ========================================================================== */
function launchCyberConfetti() {
    let canvas = document.getElementById('cyber-confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'cyber-confetti-canvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#00f0ff', '#00ff88', '#a855f7', '#f59e0b', '#ec4899', '#ffffff'];
    const particles = Array.from({ length: 110 }).map(() => ({
        x: canvas.width / 2 + (Math.random() - 0.5) * 240,
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 16 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1
    }));

    let animId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = 0;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.38; // gravity
            p.vx *= 0.98; // air drag
            p.rotation += p.vr;
            p.life -= 0.012;
            p.opacity = Math.max(0, p.life);

            if (p.opacity > 0) {
                active++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });

        if (active > 0) {
            animId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animId);
        }
    }
    animate();
}
window.launchCyberConfetti = launchCyberConfetti;

/* ==========================================================================
   FEATURE 5: Offline PWA & Service Worker Manager
   ========================================================================== */
let deferredPwaPrompt = null;

function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then((reg) => {
                reg.update();
            }).catch((err) => {
                console.warn('SW registration failed:', err);
            });
        });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPwaPrompt = e;
        const pwaBtn = document.getElementById('pwa-install-nav-btn');
        if (pwaBtn) {
            pwaBtn.classList.add('visible');
            pwaBtn.addEventListener('click', () => {
                if (deferredPwaPrompt) {
                    deferredPwaPrompt.prompt();
                    deferredPwaPrompt.userChoice.then(() => {
                        deferredPwaPrompt = null;
                        pwaBtn.classList.remove('visible');
                        showCyberToast('DevOps Master Vault installed for offline study! 📲');
                    });
                }
            });
        }
    });
}
window.exportCurrentTopicMarkdown = exportTopicMarkdown;

