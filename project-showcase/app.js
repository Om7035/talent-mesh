document.addEventListener('DOMContentLoaded', () => {

    const sections = [
        'landing', 'highlights', 'architecture', 'database', 'tech-stack',
        'roles', 'journey', 'lifecycle', 'escrow', 'recommendations', 'messaging'
    ];

    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const toggleNavBtn = document.getElementById('toggle-nav-btn');
    const sidebar = document.getElementById('sidebar');

    function navigateTo(targetId) {
        const index = sections.indexOf(targetId);
        if (index === -1) return;

        navLinks.forEach(link => link.classList.toggle('active', link.dataset.target === targetId));
        contentSections.forEach(section => section.classList.toggle('active', section.id === targetId));
        window.location.hash = targetId;
        triggerSectionAnimations(targetId);
    }

    toggleNavBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); navigateTo(link.dataset.target); });
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && sections.includes(hash)) navigateTo(hash);
    });

    const initialHash = window.location.hash.replace('#', '');
    navigateTo((initialHash && sections.includes(initialHash)) ? initialHash : 'landing');

    function triggerSectionAnimations(sectionId) {
        if (sectionId === 'landing') {
            gsap.fromTo('.hero-content h1', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        } else if (sectionId === 'highlights') initHighlights();
        else if (sectionId === 'architecture') initArch();
        else if (sectionId === 'database') initDB();
        else if (sectionId === 'tech-stack') initTech();
        else if (sectionId === 'roles') initRoles();
        else if (sectionId === 'journey') initJourney();
        else if (sectionId === 'lifecycle') initLifecycle();
        else if (sectionId === 'escrow') initEscrow();
    }

    // ==========================================
    // HIGHLIGHTS
    // ==========================================
    function initHighlights() {
        const grid = document.getElementById('highlights-grid');
        if (grid.children.length > 0) return;

        const highlights = [
            { icon: 'fa-store', title: 'Marketplace', problem: 'Students lack real-world experience.', tech: 'Next.js, NestJS', benefit: 'Connects students directly to industry projects.' },
            { icon: 'fa-vault', title: 'Secure Escrow', problem: 'Freelance payment disputes.', tech: 'Razorpay, Webhooks', benefit: 'Locks funds until work is approved.' },
            { icon: 'fa-comments', title: 'Messaging', problem: 'Fragmented communication.', tech: 'Socket.IO, Redis', benefit: 'Real-time project collaboration.' },
            { icon: 'fa-wand-magic-sparkles', title: 'Recommendations', problem: 'Hard to find the right talent.', tech: 'Custom Algorithm', benefit: 'AI ranks students by skills and reputation.' },
            { icon: 'fa-user-check', title: 'Verification', problem: 'Fake student profiles.', tech: 'TPO Approval', benefit: 'Ensures only genuine students access the platform.' },
            { icon: 'fa-chart-pie', title: 'Admin Dashboard', problem: 'Lack of platform oversight.', tech: 'Chart.js, React Admin', benefit: 'Comprehensive analytics for admins and TPOs.' }
        ];

        highlights.forEach((h, i) => {
            const el = document.createElement('div');
            el.className = 'highlight-card glass-panel';
            el.innerHTML = `
                <div class="hc-icon"><i class="fa-solid ${h.icon}"></i></div>
                <h3>${h.title}</h3>
                <div class="h-stat"><strong>Problem:</strong> ${h.problem}</div>
                <div class="h-stat"><strong>Tech:</strong> ${h.tech}</div>
                <div class="h-stat" style="color: var(--primary);"><strong>Benefit:</strong> ${h.benefit}</div>
            `;
            grid.appendChild(el);
            gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.1 });
        });
    }

    // ==========================================
    // ARCHITECTURE (Tooltip Hover)
    // ==========================================
    function initArch() {
        // Architecture hover tooltips logic
        const components = document.querySelectorAll('.arch-component');
        components.forEach(comp => {
            comp.addEventListener('mouseenter', (e) => {
                let tooltip = document.getElementById('arch-tooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.id = 'arch-tooltip';
                    tooltip.className = 'arch-tooltip';
                    document.body.appendChild(tooltip);
                }
                tooltip.innerHTML = comp.dataset.info;
                tooltip.style.opacity = '1';
                
                const rect = comp.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = rect.top - 10 + 'px';
            });
            comp.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById('arch-tooltip');
                if (tooltip) tooltip.style.opacity = '0';
            });
        });
    }

    // ==========================================
    // DATABASE MODULES
    // ==========================================
    function initDB() {
        const grid = document.getElementById('db-modules-grid');
        if (grid.children.length > 0) return;

        const modules = [
            { name: 'User Management', color: '#2383e2', tables: ['User', 'Student', 'Client', 'Recruiter', 'TPO', 'College'], desc: 'Identity and RBAC.' },
            { name: 'Marketplace', color: '#0f7b6c', tables: ['Project', 'Application', 'Contract', 'Category', 'Skill'], desc: 'Project posting and hiring.' },
            { name: 'Finance & Escrow', color: '#9065b0', tables: ['Wallet', 'Transaction', 'Escrow', 'Withdrawal'], desc: 'Secure payment tracking.' },
            { name: 'Communication', color: '#d9730d', tables: ['Conversation', 'Message', 'Notification'], desc: 'Chat and system alerts.' },
            { name: 'Trust System', color: '#eb5757', tables: ['Review', 'VerificationRequest', 'Dispute'], desc: 'Ratings and moderation.' }
        ];

        modules.forEach((m, i) => {
            const el = document.createElement('div');
            el.className = 'db-module-card glass-panel';
            el.style.borderTop = `4px solid ${m.color}`;
            el.innerHTML = `
                <h3 style="color: ${m.color}">${m.name}</h3>
                <p>${m.desc}</p>
                <div class="db-tables">
                    ${m.tables.map(t => `<span class="db-table-tag">${t}</span>`).join('')}
                </div>
            `;
            grid.appendChild(el);
            gsap.fromTo(el, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, delay: i * 0.1 });
        });
    }

    // ==========================================
    // TECH STACK
    // ==========================================
    function initTech() {
        const grid = document.getElementById('tech-cards-grid');
        if (grid.children.length > 0) return;

        const tech = [
            { category: 'Frontend', name: 'Next.js 14', icon: 'fa-react', purpose: 'UI Rendering (SSR/SSG)', why: 'SEO, fast loading, great React ecosystem.' },
            { category: 'Backend', name: 'NestJS', icon: 'fa-node-js', purpose: 'API Gateway & Services', why: 'Enterprise architecture, TypeScript support.' },
            { category: 'Database', name: 'PostgreSQL', icon: 'fa-database', purpose: 'Primary Data Store', why: 'Relational integrity for financial transactions.' },
            { category: 'Authentication', name: 'JWT & Passport', icon: 'fa-key', purpose: 'Security', why: 'Stateless, secure role-based access control.' },
            { category: 'Real-time', name: 'Socket.IO', icon: 'fa-plug', purpose: 'Messaging', why: 'Instant bidirectional communication.' },
            { category: 'Payments', name: 'Razorpay', icon: 'fa-credit-card', purpose: 'Escrow Funding', why: 'Reliable payment gateway with webhooks.' },
            { category: 'Caching', name: 'Redis', icon: 'fa-memory', purpose: 'Session & Rate Limits', why: 'In-memory speed for fast access.' }
        ];

        tech.forEach((t, i) => {
            const el = document.createElement('div');
            el.className = 'tech-card glass-panel';
            el.innerHTML = `
                <div class="tc-header">
                    <i class="fa-brands ${t.icon}" style="font-size: 24px; color: var(--primary);"></i>
                    <div>
                        <span class="tc-cat">${t.category}</span>
                        <h3>${t.name}</h3>
                    </div>
                </div>
                <div class="tc-body">
                    <p><strong>Purpose:</strong> ${t.purpose}</p>
                    <p><strong>Why Chosen:</strong> ${t.why}</p>
                </div>
            `;
            grid.appendChild(el);
            gsap.fromTo(el, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, delay: i * 0.08 });
        });
    }

    // ==========================================
    // USER ROLES JOURNEYS
    // ==========================================
    function initRoles() {
        const list = document.getElementById('roles-journeys-list');
        if (list.children.length > 0) return;

        const roles = [
            { name: 'Student', icon: 'fa-user-graduate', color: '#2383e2', steps: ['Register', 'Apply', 'Work', 'Earn', 'Get Rated'] },
            { name: 'Client', icon: 'fa-building', color: '#d9730d', steps: ['Post Project', 'Review', 'Hire', 'Fund Escrow', 'Approve Work'] },
            { name: 'Admin', icon: 'fa-shield-halved', color: '#eb5757', steps: ['Monitor', 'Review Disputes', 'Resolve', 'Refund/Release'] },
            { name: 'TPO', icon: 'fa-school', color: '#0f7b6c', steps: ['Login', 'Review Students', 'Verify Identities', 'View Placements'] },
            { name: 'Recruiter', icon: 'fa-user-tie', color: '#9065b0', steps: ['Search', 'Filter Verified', 'View Projects', 'Contact Student'] }
        ];

        roles.forEach((r, i) => {
            const el = document.createElement('div');
            el.className = 'role-journey-card glass-panel';
            
            const stepsHtml = r.steps.map((s, idx) => `
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="padding:8px 14px; background:${r.color}15; color:${r.color}; border-radius:6px; font-weight:700; font-size:14px; border:1px solid ${r.color}30;">${s}</div>
                    ${idx < r.steps.length - 1 ? `<div style="color:var(--text-secondary); font-size:20px;">→</div>` : ''}
                </div>
            `).join('');

            el.innerHTML = `
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                    <div style="width:50px; height:50px; background:${r.color}15; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid ${r.icon}" style="font-size:24px; color:${r.color};"></i>
                    </div>
                    <h3 style="font-size:22px; font-weight:800; color:var(--text-primary);">${r.name} Workflow</h3>
                </div>
                <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
                    ${stepsHtml}
                </div>
            `;
            list.appendChild(el);
            gsap.fromTo(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.1 });
        });
    }

    // ==========================================
    // PROJECT JOURNEY (Interactive Stepper)
    // ==========================================
    function initJourney() {
        const stepsContainer = document.getElementById('journey-stepper');
        const detailsContainer = document.getElementById('journey-step-details');
        if (stepsContainer.children.length > 0) return;

        const journey = [
            { step: '1', title: 'Apply', pages: '/projects/[id]', api: 'POST /applications', db: 'Application' },
            { step: '2', title: 'Review', pages: '/client/dashboard', api: 'GET /applications', db: 'Application, Student' },
            { step: '3', title: 'Hire', pages: '/contract/new', api: 'PATCH /applications/[id]', db: 'Contract' },
            { step: '4', title: 'Escrow', pages: '/contract/[id]', api: 'POST /payments', db: 'Escrow, Transaction' },
            { step: '5', title: 'Work', pages: '/workspace', api: 'POST /messages', db: 'Message' },
            { step: '6', title: 'Approval', pages: '/contract/review', api: 'POST /escrow/release', db: 'Escrow, Wallet' },
            { step: '7', title: 'Ratings', pages: '/reviews/new', api: 'POST /reviews', db: 'Review' }
        ];

        journey.forEach((j, i) => {
            const el = document.createElement('div');
            el.className = 'js-node';
            el.innerHTML = `<div class="js-circle">${j.step}</div><div class="js-title">${j.title}</div>`;
            
            el.addEventListener('click', () => {
                document.querySelectorAll('.js-node').forEach(n => n.classList.remove('active'));
                el.classList.add('active');
                
                detailsContainer.innerHTML = `
                    <h3 style="color:var(--primary); margin-bottom:20px; font-size:24px; font-weight:800;">Step ${j.step}: ${j.title}</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px;">
                        <div class="js-detail-box"><strong>Next.js Page:</strong><br>${j.pages}</div>
                        <div class="js-detail-box"><strong>NestJS API:</strong><br>${j.api}</div>
                        <div class="js-detail-box"><strong>PostgreSQL Tables:</strong><br>${j.db}</div>
                    </div>
                `;
            });

            stepsContainer.appendChild(el);
            gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3, delay: i * 0.05 });
        });
    }

    // ==========================================
    // LIFECYCLE
    // ==========================================
    function initLifecycle() {
        const flow = document.getElementById('lifecycle-flow');
        if (flow.children.length > 0) return;

        const stages = [
            { label: 'Draft', role: 'Client' },
            { label: 'Published', role: 'System' },
            { label: 'Applications', role: 'Students' },
            { label: 'Selected', role: 'Client' },
            { label: 'Funded', role: 'Escrow' },
            { label: 'In Progress', role: 'Student' },
            { label: 'Submitted', role: 'Student' },
            { label: 'Approved', role: 'Client' },
            { label: 'Completed', role: 'System' }
        ];

        stages.forEach((s, i) => {
            const el = document.createElement('div');
            el.className = 'lc-stage glass-panel';
            el.innerHTML = `<h4>${s.label}</h4><p>By: ${s.role}</p>`;
            flow.appendChild(el);
            if (i < stages.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'lc-arrow';
                arrow.innerHTML = '→';
                flow.appendChild(arrow);
            }
            gsap.fromTo(el, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.3, delay: i * 0.05 });
        });
    }

    // ==========================================
    // ESCROW ANIMATION (Refined Workflow)
    // ==========================================
    function initEscrow() {
        const coin  = document.getElementById('e-coin');
        const msg   = document.getElementById('e-msg');
        const cBal  = document.getElementById('client-bal');
        const eBal  = document.getElementById('escrow-bal');
        const sBal  = document.getElementById('student-bal');
        const lockIcon = document.getElementById('escrow-lock-icon');
        const escrowBox = document.getElementById('e-escrow');

        // STATE MACHINE
        // ASSIGNED → FUNDED → SUBMITTED → RELEASED
        //                   ↘ DISPUTED → REFUNDED
        let state = 'ASSIGNED';

        const STATES = {
            ASSIGNED:  { fund:true,  work:false, release:false, dispute:false, refund:false },
            FUNDED:    { fund:false, work:true,  release:false, dispute:true,  refund:false },
            SUBMITTED: { fund:false, work:false, release:true,  dispute:true,  refund:false },
            RELEASED:  { fund:false, work:false, release:false, dispute:false, refund:false },
            DISPUTED:  { fund:false, work:false, release:false, dispute:false, refund:true  },
            REFUNDED:  { fund:false, work:false, release:false, dispute:false, refund:false },
        };

        const applyState = (s) => {
            state = s;
            const S = STATES[s];
            document.getElementById('btn-escrow-fund').disabled    = !S.fund;
            document.getElementById('btn-escrow-work').disabled    = !S.work;
            document.getElementById('btn-escrow-release').disabled = !S.release;
            document.getElementById('btn-escrow-dispute').disabled = !S.dispute;
            document.getElementById('btn-escrow-refund').disabled  = !S.refund;

            // Lock icon reflects whether funds are locked
            const locked = ['FUNDED','SUBMITTED','DISPUTED'].includes(s);
            lockIcon.className = locked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
            lockIcon.style.color = locked ? '#ef4444' : '#0f7b6c';
        };

        const updateStep = (step) => {
            for (let i = 1; i <= 5; i++) {
                const el = document.getElementById(`et-${i}`);
                if (el) el.classList.toggle('active', i <= step);
            }
        };

        const setMsg = (text, cls) => {
            msg.textContent = text;
            msg.className = 'e-msg ' + cls;
        };

        const animateCoin = (fromPct, toPct, color, onDone) => {
            gsap.killTweensOf(coin);
            gsap.set(coin, { left: fromPct, backgroundColor: color, opacity: 1 });
            gsap.to(coin, {
                left: toPct, duration: 1.2, ease: 'power2.inOut',
                onComplete: () => { gsap.to(coin, { opacity:0, duration:0.25 }); if(onDone) onDone(); }
            });
        };

        // ── FUND ──
        document.getElementById('btn-escrow-fund').onclick = () => {
            if (state !== 'ASSIGNED') return;
            animateCoin('12%','46%','#f59e0b', () => {
                cBal.textContent = '₹0';
                eBal.textContent = '₹50,000';
            });
            setMsg('₹50,000 locked securely in Escrow. Student may now start work.', 'success');
            updateStep(2);
            applyState('FUNDED');
        };

        // ── SUBMIT WORK ──
        document.getElementById('btn-escrow-work').onclick = () => {
            if (state !== 'FUNDED') return;
            gsap.to(escrowBox, { scale:1.04, yoyo:true, repeat:1, duration:0.2 });
            setMsg('Work submitted by Student. Awaiting Client approval or dispute.', 'warning');
            updateStep(3);
            applyState('SUBMITTED');
        };

        // ── APPROVE & RELEASE ──
        document.getElementById('btn-escrow-release').onclick = () => {
            if (state !== 'SUBMITTED') return;
            animateCoin('46%','80%','#10b981', () => {
                eBal.textContent = '₹0';
                sBal.textContent = '₹50,000';
            });
            setMsg('Work approved! Funds instantly released to Student Wallet.', 'success');
            updateStep(5);
            applyState('RELEASED');
        };

        // ── DISPUTE ──
        document.getElementById('btn-escrow-dispute').onclick = () => {
            if (!['FUNDED','SUBMITTED'].includes(state)) return;
            gsap.to(escrowBox, { borderColor:'#ef4444', backgroundColor:'#fef2f2', duration:0.3 });
            setMsg('Dispute raised! Funds frozen. Admin reviews messaging history & contracts.', 'error');
            applyState('DISPUTED');
        };

        // ── REFUND ──
        document.getElementById('btn-escrow-refund').onclick = () => {
            if (state !== 'DISPUTED') return;
            animateCoin('46%','12%','#ef4444', () => {
                eBal.textContent = '₹0';
                cBal.textContent = '₹50,000';
                gsap.to(escrowBox, { borderColor:'#0f7b6c', backgroundColor:'#e1f3ed', duration:0.4 });
            });
            setMsg('Admin resolved. Funds refunded to Client Wallet.', '');
            updateStep(1);
            applyState('REFUNDED');
        };

        // ── RESET ──
        document.getElementById('btn-escrow-reset').onclick = () => {
            gsap.killTweensOf(coin);
            gsap.set(coin, { opacity:0, left:'12%' });
            gsap.to(escrowBox, { borderColor:'#0f7b6c', backgroundColor:'#e1f3ed', color:'#0f7b6c', duration:0.3 });
            cBal.textContent = '₹50,000';
            eBal.textContent = '₹0';
            sBal.textContent = '₹0';
            setMsg('Contract Created. Awaiting Client Funding.', '');
            updateStep(1);
            applyState('ASSIGNED');
        };

        // Boot
        applyState('ASSIGNED');
        updateStep(1);
    }

    // ==========================================
    // RECOMMENDATION ENGINE (Real Math Logic)
    // ==========================================
    const recSkill = document.getElementById('rec-skill');
    if (recSkill) {
        const updateRec = () => {
            const s = parseInt(recSkill.value);
            const r = parseInt(document.getElementById('rec-rep').value);
            const d = parseInt(document.getElementById('rec-diff').value);
            const t = parseFloat(document.getElementById('rec-tier').value);

            recSkill.nextElementSibling.textContent = s + '%';
            document.getElementById('rec-rep').nextElementSibling.textContent = r + '%';
            document.getElementById('rec-diff').nextElementSibling.textContent = d + '%';

            // Actual algorithm from codebase
            const p_skill = s * 0.50;
            const p_rep = r * 0.30;
            const p_diff = d * 0.20;
            
            let rawScore = p_skill + p_rep + p_diff + (t * 100);
            let finalScore = Math.min(100, Math.round(rawScore));

            // Update Progress Circle
            const progress = document.getElementById('rec-progress');
            const offset = 282.7 - (finalScore / 100) * 282.7;
            progress.style.strokeDasharray = '282.7';
            progress.style.strokeDashoffset = offset;

            let color = '#ef4444';
            let status = 'Poor Match';
            if (finalScore >= 60) { color = '#f97316'; status = 'Average Match'; }
            if (finalScore >= 80) { color = '#10b981'; status = 'Excellent Match'; }
            
            progress.style.stroke = color;
            document.getElementById('rec-score-text').textContent = finalScore;
            document.getElementById('rec-score-text').style.color = color;

            // Update Breakdown Bars (No numerical values shown to keep it simple)
            document.getElementById('bb-skill').style.width = p_skill + '%';
            document.getElementById('bb-rep').style.width = p_rep + '%';
            document.getElementById('bb-diff').style.width = p_diff + '%';

            const tierBonus = t * 100;
            document.getElementById('bb-tier').style.width = (tierBonus) + '%';

            let checkmarks = `
                <div style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> Skills match the project requirements (${s}%)</div>
                <div style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> Strong past client ratings</div>
                <div style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> Experience matches project difficulty</div>
            `;
            
            if (t > 0) {
                const tierName = t === 0.15 ? 'College Verified Elite' : t === 0.10 ? 'Top Performer' : 'Active Student';
                checkmarks += `<div style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> Profile holds <strong>${tierName}</strong> status</div>`;
            }

            document.getElementById('why-text').innerHTML = checkmarks;
        };
        ['rec-skill', 'rec-rep', 'rec-diff'].forEach(id => document.getElementById(id).addEventListener('input', updateRec));
        document.getElementById('rec-tier').addEventListener('change', updateRec);
        updateRec();
    }

    // ==========================================
    // K-MEANS CLUSTER VISUAL
    // ==========================================
    const kmTier = document.getElementById('rec-tier');
    if (kmTier) {
        const updateKMeans = () => {
            const t = parseFloat(kmTier.value);
            const tiers = [
                { id: 'km-tier-0', val: 0 },
                { id: 'km-tier-1', val: 0.05 },
                { id: 'km-tier-2', val: 0.10 },
                { id: 'km-tier-3', val: 0.15 },
            ];
            tiers.forEach(({ id, val }) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (val === t) {
                    el.classList.add('km-active');
                } else {
                    el.classList.remove('km-active');
                }
            });
        };
        kmTier.addEventListener('change', updateKMeans);
        updateKMeans();
    }
});
