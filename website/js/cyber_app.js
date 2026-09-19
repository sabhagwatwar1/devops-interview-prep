/**
 * DEVOPS & SRE INTERVIEW PLATFORM - CYBER APP ENGINE
 * Matrix Starfield Canvas, Audio Synthesizer, Live CLI Terminal, Mastery Tracker, and 3D Flashcards
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioSynth();
    initCyberCanvas();
    initThemeMatrix();
    initMobileNav();
    initAOSAndMermaid();
    initInteractiveRipples();
    initCard3DTilt();

    const currentTopic = document.body.getAttribute('data-topic');

    if (currentTopic === 'hub') {
        initLiveTerminal();
        initStatsCounter();
        initMasterContactForm();
    } else if (currentTopic === 'community') {
        initCommunityPortal();
    } else if (currentTopic && window.allQuestionsData && window.allQuestionsData[currentTopic]) {
        initTopicFeed(currentTopic);
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

        let charIdx = 0;
        const typeTimer = setInterval(() => {
            if (charIdx < item.cmd.length) {
                typedCmdEl.textContent += item.cmd[charIdx];
                charIdx++;
            } else {
                clearInterval(typeTimer);
                setTimeout(() => {
                    outputEl.textContent = item.output;
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

    function render() {
        const mastered = getMasteredList();

        const filtered = allQuestions.filter(q => {
            const matchesLevel = activeFilter === 'all' || q.level === activeFilter;
            const matchesSearch = !currentSearch || 
                q.question.toLowerCase().includes(currentSearch.toLowerCase()) || 
                q.answer.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesLevel && matchesSearch;
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
                    <p style="color: var(--text-muted);">Try adjusting your level filter or search keyword.</p>
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

    render();
}

function renderAccordionCard(item, isMastered) {
    const badgeClass = `badge-${item.level}`;
    const levelLabel = item.level === 'junior' ? 'Junior (0-2y)' : (item.level === 'mid' ? 'Mid-Level (2-5y)' : 'Senior / Staff (5+y)');
    const tagsHtml = (item.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join(' ');

    return `
        <div class="cyber-qa-item ${isMastered ? 'mastered-card' : ''}" id="${item.id}">
            <div class="qa-header-row">
                <div style="flex-grow: 1;">
                    <div class="qa-left-meta">
                        <span class="badge-level ${badgeClass}">${levelLabel}</span>
                        ${item.source ? `<span class="q-source-tag"><i class="fa-solid fa-book-bookmark"></i> ${item.source}</span>` : ''}
                        <label class="mastered-checkbox-wrap" title="Mark as Mastered">
                            <input type="checkbox" class="q-mastery-chk" data-qid="${item.id}" ${isMastered ? 'checked' : ''}>
                            <span>${isMastered ? 'Mastered' : 'Mark Learned'}</span>
                        </label>
                    </div>
                    <h4 class="qa-question-title">${item.question}</h4>
                </div>
                <i class="fa-solid fa-chevron-right qa-toggle-icon"></i>
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
            
            if (chk.checked) {
                if (!mastered.includes(qid)) mastered.push(qid);
                chk.nextElementSibling.textContent = 'Mastered';
                playSynthSound('mastered');
                showCyberToast('Question marked as Mastered!');
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

            const allQ = window.allQuestionsData[topicKey] || [];
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
   7. Master Hub Contact Form (WhatsApp & Email Automation)
   ========================================================================== */
function initMasterContactForm() {
    const form = document.getElementById('master-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const topic = document.getElementById('contact-topic').value;
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !message) return;

        const payload = `🚀 *DevOps & SRE Interview Doubt*\n\n*Name:* ${name}\n*Email:* ${email}\n*Target Domain:* ${topic}\n\n*Question / Doubt:*\n${message}\n\n--- Sent from DevOps Master Vault ---`;

        const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(payload)}`;
        const mailUrl = `mailto:shriram.devops@example.com?subject=DevOps Doubt [${encodeURIComponent(topic)}] from ${encodeURIComponent(name)}&body=${encodeURIComponent(payload)}`;

        const openWhatsApp = confirm(`Question prepared for Shriram!\n\nClick OK to send directly via WhatsApp now.\nClick Cancel to send via Email.`);
        if (openWhatsApp) {
            window.open(waUrl, '_blank');
        } else {
            window.location.href = mailUrl;
        }

        form.reset();
        showCyberToast('Doubt dispatched successfully!');
    });
}

/* ==========================================================================
   8. Community Forum Portal
   ========================================================================== */
const DEFAULT_COMMUNITY_FEED = [
    {
        id: "comm_1",
        author: "DevOps_Alex",
        tag: "Kubernetes",
        question: "How do you resolve CrashLoopBackOff on a Pod when kubectl logs --previous returns nothing because the container exits before writing logs?",
        timestamp: "1 hour ago",
        upvotes: 18,
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
        replies: [
            {
                author: "IaC_Architect",
                text: "Use the <code>moved { from = aws_s3_bucket.old to = module.storage.aws_s3_bucket.this }</code> block (introduced in Terraform 1.1+) or run <code>terraform state mv</code>. This refactors the state address without triggering destruction.",
                timestamp: "2 hours ago"
            }
        ]
    }
];

function initCommunityPortal() {
    const form = document.getElementById('community-portal-form');
    const feed = document.getElementById('community-feed-container');
    const countBadge = document.getElementById('comm-count-badge');

    if (!localStorage.getItem('cyber_community_posts')) {
        localStorage.setItem('cyber_community_posts', JSON.stringify(DEFAULT_COMMUNITY_FEED));
    }

    function renderFeed() {
        const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
        if (countBadge) countBadge.textContent = `${posts.length} Active Doubts`;

        if (!feed) return;
        if (posts.length === 0) {
            feed.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No questions yet. Be the first to post!</p>';
            return;
        }

        feed.innerHTML = posts.map(post => `
            <div class="community-card-post" id="${post.id}">
                <div class="comm-post-header">
                    <div class="comm-author-box">
                        <div class="author-avatar">${escapeHtml(post.author[0].toUpperCase())}</div>
                        <div>
                            <strong>${escapeHtml(post.author)}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${post.timestamp} &bull; <span class="hud-tag">${post.tag}</span></div>
                        </div>
                    </div>
                    <button class="comm-upvote-btn" onclick="upvotePost('${post.id}')">
                        <i class="fa-solid fa-thumbs-up"></i> ${post.upvotes}
                    </button>
                </div>
                <div style="font-size: 1.05rem; font-weight: 600; color: #fff;">
                    ${escapeHtml(post.question)}
                </div>
                <div class="comm-replies-list">
                    ${(post.replies || []).map(r => `
                        <div class="comm-reply-item">
                            <div class="comm-reply-header">
                                <i class="fa-solid fa-reply"></i> <strong>${escapeHtml(r.author)}</strong> &bull; <span>${r.timestamp}</span>
                            </div>
                            <div>${r.text}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="reply-input-row">
                    <input type="text" placeholder="Write an expert solution / answer..." id="reply-in-${post.id}">
                    <button class="cyber-btn btn-outline" style="padding: 0.5rem 1rem;" onclick="addReply('${post.id}')">Reply</button>
                </div>
            </div>
        `).join('');
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('comm-author').value.trim();
            const tag = document.getElementById('comm-tag').value;
            const question = document.getElementById('comm-question').value.trim();

            if (!author || !question) return;

            const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
            posts.unshift({
                id: 'comm_' + Date.now(),
                author: author,
                tag: tag,
                question: question,
                timestamp: 'Just now',
                upvotes: 1,
                replies: []
            });

            localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
            form.reset();
            renderFeed();
            showCyberToast('Question posted to community!');
        });
    }

    renderFeed();
}

window.upvotePost = function(postId) {
    const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
    const target = posts.find(p => p.id === postId);
    if (target) {
        target.upvotes += 1;
        localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
        initCommunityPortal();
        playSynthSound('beep');
    }
};

window.addReply = function(postId) {
    const input = document.getElementById(`reply-in-${postId}`);
    if (!input || !input.value.trim()) return;

    const posts = JSON.parse(localStorage.getItem('cyber_community_posts') || '[]');
    const target = posts.find(p => p.id === postId);
    if (target) {
        if (!target.replies) target.replies = [];
        target.replies.push({
            author: 'Engineer',
            text: escapeHtml(input.value.trim()),
            timestamp: 'Just now'
        });
        localStorage.setItem('cyber_community_posts', JSON.stringify(posts));
        initCommunityPortal();
        showCyberToast('Answer submitted!');
    }
};

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
