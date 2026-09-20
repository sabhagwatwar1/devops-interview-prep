/**
 * DEVOPS & SRE INTERVIEW PLATFORM - CYBER APP ENGINE
 * Matrix Starfield Canvas, Audio Synthesizer, Live CLI Terminal, Mastery Tracker, and 3D Flashcards
 * + 12 Improvements: Global Search, Progress Dashboard, Mock Interview, Bookmarks, Deep-links, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioSynth();
    initCyberCanvas();
    initThemeMatrix();
    initMobileSidebarDrawer();   // #4 — replaces old mobile nav
    initMobileNav();
    initAOSAndMermaid();
    initInteractiveRipples();
    initCard3DTilt();
    initScrollToTop();            // #9
    initKeyboardShortcuts();      // #3
    initGlobalSearch();           // #2
    initMockInterview();          // #5
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
            const matchesSaved = activeFilter !== 'saved' || isQuestionBookmarked(q.id);
            const matchesSearch = !currentSearch || 
                q.question.toLowerCase().includes(currentSearch.toLowerCase()) || 
                q.answer.toLowerCase().includes(currentSearch.toLowerCase());
            return (activeFilter === 'saved' ? matchesSaved : matchesLevel) && matchesSearch;
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
        attachBookmarkListeners(topicKey, render);
        attachShareListeners();
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
    const isBookmarked = isQuestionBookmarked(item.id);

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
                <div class="qa-actions-row">
                    <button class="btn-bookmark-q ${isBookmarked ? 'bookmarked' : ''}" data-qid="${item.id}" title="${isBookmarked ? 'Remove bookmark' : 'Bookmark question'}">
                        <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-star"></i>
                    </button>
                    <button class="btn-share-q" data-qid="${item.id}" title="Copy link to this question">
                        <i class="fa-solid fa-link"></i>
                    </button>
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
                    <input type="text" id="global-search-input" placeholder="Search all 1326+ questions across 12 topics..." autocomplete="off">
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
                <span class="cyber-logo" style="font-size:1rem;">DEVOPS.SRE <span class="logo-tag">VAULT</span></span>
                <button class="sidebar-close-btn" onclick="closeSidebar()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="sidebar-nav-links">
                ${navLinks.map(l => `<a href="${l.href}" class="${currentPage === l.href ? 'active' : ''}"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`).join('')}
            </div>
            <div class="sidebar-footer">DevOps SRE Vault 2026 • 1326+ Questions</div>`;
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
    { key: 'kubernetes',   label: 'Kubernetes',      total: 162, color: '#326ce5' },
    { key: 'terraform',    label: 'Terraform',       total: 115, color: '#844fba' },
    { key: 'aws',          label: 'AWS',             total: 112, color: '#ff9900' },
    { key: 'networking',   label: 'Networking',      total: 103, color: '#00d4ff' },
    { key: 'gitops',       label: 'GitOps',          total: 102, color: '#ef6b73' },
    { key: 'observability',label: 'Observability',   total: 103, color: '#00ff88' },
    { key: 'security',     label: 'Security',        total: 102, color: '#a855f7' },
    { key: 'scenario',     label: 'Scenarios',       total: 107, color: '#facc15' },
];
const TOTAL_QUESTIONS = 1326;

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

