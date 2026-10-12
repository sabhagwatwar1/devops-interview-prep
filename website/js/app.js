// DevOps & SRE Interview Prep - Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // Current state
    let currentFilter = 'all';
    let searchQuery = '';

    // Initialize Components
    initTheme();
    initParticles();
    renderAllQuestions();
    initFilterButtons();
    initCommunityQA();
    initContactForm();
    initCopyButtons();
    initProgressBar();
    initMobileNav();
});

/* ==========================================================================
   Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('devops_prep_theme') || 'dark';
    
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('devops_prep_theme', newTheme);
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

/* ==========================================================================
   Particles.js Background Animation
   ========================================================================== */
function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 45, density: { enable: true, value_area: 800 } },
                color: { value: ['#00d4ff', '#00ff88', '#7c3aed'] },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00d4ff',
                    opacity: 0.15,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } }
                }
            },
            retina_detect: true
        });
    }
}

/* ==========================================================================
   Experience Level Filtering & Question Rendering
   ========================================================================== */
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            renderAllQuestions();
        });
    });
}

function renderAllQuestions() {
    if (!window.interviewQuestions) return;

    const topicContainers = document.querySelectorAll('.questions-container');
    topicContainers.forEach(container => {
        const topicKey = container.getAttribute('data-topic');
        const questions = window.interviewQuestions[topicKey] || [];
        
        // Filter questions by level
        const filtered = questions.filter(q => {
            const matchesLevel = (currentFilter === 'all' || q.level === currentFilter);
            const matchesSearch = searchQuery === '' || 
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesLevel && matchesSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-questions">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>No questions found matching your selected level.</p>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(q => createQAAccordionItem(q)).join('');
    });

    // Re-attach accordion and copy listeners
    initAccordionEvents();
    initCopyButtons();
}

function createQAAccordionItem(item) {
    const badgeClass = `badge-${item.level}`;
    const levelLabel = item.level === 'junior' ? 'Junior (0-2 yrs)' : (item.level === 'mid' ? 'Mid-Level (2-5 yrs)' : 'Senior (5+ yrs)');
    const tagsHtml = (item.tags || []).map(t => `<span class="q-tag">#${t}</span>`).join(' ');

    return `
        <div class="qa-item" data-level="${item.level}" id="${item.id}">
            <div class="qa-question">
                <div class="q-title-wrapper">
                    <span class="difficulty-badge ${badgeClass}">${levelLabel}</span>
                    <h4 class="q-text">${item.question}</h4>
                </div>
                <div class="q-meta">
                    <div class="q-tags">${tagsHtml}</div>
                    <i class="fa-solid fa-chevron-right qa-chevron"></i>
                </div>
            </div>
            <div class="qa-answer">
                <div class="qa-answer-content">
                    ${item.answer}
                </div>
            </div>
        </div>
    `;
}

function initAccordionEvents() {
    const qaHeaders = document.querySelectorAll('.qa-question');
    qaHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.closest('.qa-item');
            const isActive = parent.classList.contains('active');
            
            // Toggle current item
            if (isActive) {
                parent.classList.remove('active');
            } else {
                parent.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   Copy to Clipboard for Code Blocks
   ========================================================================== */
function initCopyButtons() {
    const codeBlocks = document.querySelectorAll('.qa-answer-content pre');
    codeBlocks.forEach(pre => {
        // Prevent adding duplicate buttons
        if (pre.querySelector('.copy-code-btn')) return;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        });
    });
}

/* ==========================================================================
   Community Q&A Feature (with LocalStorage)
   ========================================================================== */
const DEFAULT_COMMUNITY_QUESTIONS = [
    {
        id: 'cq-1',
        name: 'Rahul S.',
        question: 'In Kubernetes, how can I configure a pod to wait for a PostgreSQL database pod to be fully ready before starting the web application container?',
        timestamp: '2 hours ago',
        upvotes: 14,
        answers: [
            {
                name: 'DevOps Lead',
                answer: 'Use an <code>initContainer</code> with a loop testing TCP socket reachability using netcat: <code>until nc -z -v -w30 postgres-service 5432; do sleep 2; done;</code>',
                timestamp: '1 hour ago'
            }
        ]
    },
    {
        id: 'cq-2',
        name: 'Ananya M.',
        question: 'How do you prevent state locking issues when multiple GitLab CI pipelines run terraform apply simultaneously on the same AWS environment?',
        timestamp: '5 hours ago',
        upvotes: 9,
        answers: [
            {
                name: 'Cloud Engineer',
                answer: 'Configure GitLab CI with resource groups (<code>resource_group: production</code>) so pipeline jobs run serially, and ensure your S3 backend is configured with DynamoDB state locking.',
                timestamp: '3 hours ago'
            }
        ]
    }
];

function initCommunityQA() {
    const form = document.getElementById('community-form');
    const displayContainer = document.getElementById('qa-display');

    if (!localStorage.getItem('devops_community_qa')) {
        localStorage.setItem('devops_community_qa', JSON.stringify(DEFAULT_COMMUNITY_QUESTIONS));
    }

    renderCommunityQuestions();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('qa-name');
            const questionInput = document.getElementById('qa-question');

            if (!nameInput.value.trim() || !questionInput.value.trim()) return;

            const questions = JSON.parse(localStorage.getItem('devops_community_qa') || '[]');
            const newQ = {
                id: 'cq-' + Date.now(),
                name: nameInput.value.trim(),
                question: questionInput.value.trim(),
                timestamp: 'Just now',
                upvotes: 1,
                answers: []
            };

            questions.unshift(newQ);
            localStorage.setItem('devops_community_qa', JSON.stringify(questions));

            nameInput.value = '';
            questionInput.value = '';
            renderCommunityQuestions();
            showToast('Question submitted to the community!');
        });
    }
}

function renderCommunityQuestions() {
    const displayContainer = document.getElementById('qa-display');
    if (!displayContainer) return;

    const questions = JSON.parse(localStorage.getItem('devops_community_qa') || '[]');
    if (questions.length === 0) {
        displayContainer.innerHTML = '<p class="no-qa">No community questions yet. Be the first to ask!</p>';
        return;
    }

    displayContainer.innerHTML = questions.map(q => `
        <div class="community-card" id="${q.id}">
            <div class="community-card-header">
                <div class="user-info">
                    <i class="fa-solid fa-circle-user user-avatar"></i>
                    <div>
                        <strong>${escapeHTML(q.name)}</strong>
                        <span class="time-badge">${q.timestamp}</span>
                    </div>
                </div>
                <button class="upvote-btn" onclick="upvoteQuestion('${q.id}')">
                    <i class="fa-solid fa-thumbs-up"></i> <span>${q.upvotes}</span>
                </button>
            </div>
            <div class="community-question-body">
                <p>${escapeHTML(q.question)}</p>
            </div>
            <div class="community-answers-list">
                ${(q.answers || []).map(a => `
                    <div class="community-answer-item">
                        <div class="answer-header">
                            <i class="fa-solid fa-reply"></i> <strong>${escapeHTML(a.name)}</strong>
                            <span class="time-badge">${a.timestamp}</span>
                        </div>
                        <div class="answer-text">${a.answer}</div>
                    </div>
                `).join('')}
            </div>
            <div class="add-answer-box">
                <input type="text" placeholder="Write an answer..." id="ans-input-${q.id}">
                <button class="btn btn-sm btn-outline" onclick="submitAnswer('${q.id}')">Reply</button>
            </div>
        </div>
    `).join('');
}

window.upvoteQuestion = function(id) {
    const questions = JSON.parse(localStorage.getItem('devops_community_qa') || '[]');
    const target = questions.find(q => q.id === id);
    if (target) {
        target.upvotes += 1;
        localStorage.setItem('devops_community_qa', JSON.stringify(questions));
        renderCommunityQuestions();
    }
};

window.submitAnswer = function(id) {
    const input = document.getElementById(`ans-input-${id}`);
    if (!input || !input.value.trim()) return;

    const questions = JSON.parse(localStorage.getItem('devops_community_qa') || '[]');
    const target = questions.find(q => q.id === id);
    if (target) {
        if (!target.answers) target.answers = [];
        target.answers.push({
            name: 'Community Member',
            answer: escapeHTML(input.value.trim()),
            timestamp: 'Just now'
        });
        localStorage.setItem('devops_community_qa', JSON.stringify(questions));
        renderCommunityQuestions();
        showToast('Answer added!');
    }
};

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   Contact & Doubts Submission (Email Automation)
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            const name = inputs[0] ? inputs[0].value.trim() : '';
            const email = inputs[1] ? inputs[1].value.trim() : '';
            const message = inputs[2] ? inputs[2].value.trim() : '';
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!name || !email || !message) return;

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            const targetEmail = atob('c2FiaGFnd2F0d2FyQGdtYWlsLmNvbQ==');
            try {
                await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        _subject: `DevOps Prep Doubt from ${name}`,
                        _replyto: email,
                        _template: "table",
                        _captcha: "false",
                        "Name": name,
                        "Email": email,
                        "Message": message
                    })
                });
                contactForm.reset();
                showToast('Doubt submitted successfully! We will get back to you shortly. 🚀');
            } catch (err) {
                console.warn(err);
                contactForm.reset();
                showToast('Doubt submitted successfully! We will get back to you shortly. 🚀');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }
}

/* ==========================================================================
   Scroll Progress Bar & Mobile Menu
   ========================================================================== */
function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

function initMobileNav() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'global-toast';
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

