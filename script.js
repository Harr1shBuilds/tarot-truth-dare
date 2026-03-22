document.addEventListener("DOMContentLoaded", function () {
    // ── API Configuration ────────────────────────────────────────
    const API_ENDPOINT = '/api/get_card';

    // ── Repetition Prevention ────────────────────────────────────
    // Track recently shown card IDs (up to 5) to avoid immediate repeats
    const MAX_RECENT = 5;
    const recentCardIds = [];

    function trackCard(id) {
        if (!id) return;
        recentCardIds.push(id);
        if (recentCardIds.length > MAX_RECENT) {
            recentCardIds.shift();
        }
    }

    function getExcludeParam() {
        return recentCardIds.length > 0 ? recentCardIds.join(',') : '';
    }

    // ── DOM Elements ─────────────────────────────────────────────
    const cards = document.querySelectorAll('.tarot-card');
    const focusLayer = document.getElementById('focusLayer');
    const resetBtn = document.getElementById('resetBtn');

    // Audio
    const drawWhoosh = new Audio('sounds/whoosh.mp3');
    const revealChime = new Audio('sounds/chime.mp3');

    let cardDrawn = false;

    cards.forEach(card => {
        card.addEventListener('click', async () => {
            if (cardDrawn) return;
            cardDrawn = true;

            // Fetch card from the backend API
            let draw = null;
            try {
                const exclude = getExcludeParam();
                const url = `${API_ENDPOINT}?type=${gameState.type}${exclude ? '&exclude=' + exclude : ''}`;
                const response = await fetch(url);

                if (response.ok) {
                    const json = await response.json();
                    if (json.card) {
                        draw = json.card;
                        trackCard(draw.id);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch card:', e);
            }

            // Update card UI before flipping
            const textEl = card.querySelector('.ritual-text');
            if (textEl && draw) textEl.textContent = draw.text;

            // Ritual States
            card.classList.add('flipped');
            card.classList.add('active');

            cards.forEach(c => {
                if (c !== card) c.classList.add('dim');
            });

            resetBtn.classList.add('visible');
            revealChime.play().catch(() => { });
        });
    });

    // ── Safe Navigation (Dual Page System) ───────────────────
    const selectionPage = document.getElementById("selectionPage");
    const ritualPage = document.getElementById("ritualPage");
    const btnTruth = document.getElementById("btnTruth");
    const btnDare = document.getElementById("btnDare");

    const gameState = {
        type: 'truth'
    };

    function showRitual(type) {
        gameState.type = type;
        document.body.className = type + "-theme";

        selectionPage.classList.remove("active");
        ritualPage.classList.add("active");

        // Play whoosh for transition
        drawWhoosh.play().catch(() => { });
    }

    if (btnTruth && btnDare) {
        btnTruth.addEventListener("click", () => showRitual("truth"));
        btnDare.addEventListener("click", () => showRitual("dare"));
    }

    const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.addEventListener("click", () => {
            // Reset ritual state
            cardDrawn = false;

            cards.forEach(card => {
                card.classList.remove("flipped");
                card.classList.remove("active");
                card.classList.remove("dim");
            });

            resetBtn.classList.remove("visible");

            // Remove theme class
            document.body.classList.remove("truth-theme");
            document.body.classList.remove("dare-theme");

            // Switch pages
            ritualPage.classList.remove("active");
            selectionPage.classList.add("active");

            // Play whoosh for transition
            drawWhoosh.play().catch(() => { });
        });
    }

    resetBtn.addEventListener('click', () => {
        cardDrawn = false;
        resetBtn.classList.remove('visible');
        cards.forEach(card => {
            card.classList.remove('dim', 'flipped', 'active');
        });
        drawWhoosh.play().catch(() => { });
    });

    // Background Particles
    (function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        const pc = canvas.getContext('2d');
        let pts = [];
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        function spawn() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.5,
                v: 0.05 + Math.random() * 0.1,
                a: Math.random() * 0.6,
                p: Math.random() * Math.PI * 2
            };
        }
        for (let i = 0; i < 60; i++) pts.push(spawn());
        function draw() {
            pc.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.y -= p.v;
                if (p.y < -10) { Object.assign(p, spawn()); p.y = canvas.height + 10; }
                const alpha = p.a * (0.5 + Math.sin(Date.now() * 0.002 + p.p) * 0.5);
                pc.fillStyle = `rgba(212, 175, 55, ${alpha})`;
                pc.beginPath(); pc.arc(p.x, p.y, p.r, 0, Math.PI * 2); pc.fill();
            });
            requestAnimationFrame(draw);
        }
        draw();
    })();

    // Mystic Floating Symbols
    (function initMysticSymbols() {
        const layer = document.getElementById('symbolLayer');
        if (!layer) return;

        const symbols = ['🌙', '🔮', '🗝', '👁', '⚖️', '🕯', '✨', '🌑', '🕯️'];
        const count = 15;

        for (let i = 0; i < count; i++) {
            createSymbol();
        }

        function createSymbol() {
            const sym = document.createElement('div');
            sym.className = 'mystic-symbol';
            sym.textContent = symbols[Math.floor(Math.random() * symbols.length)];

            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;

            const tx = (Math.random() - 0.5) * 200;
            const ty = (Math.random() - 0.5) * 200;
            const tr = (Math.random() - 0.5) * 360;
            const duration = 10 + Math.random() * 20;
            const delay = Math.random() * 20;

            sym.style.left = `${startX}px`;
            sym.style.top = `${startY}px`;
            sym.style.setProperty('--tx', `${tx}px`);
            sym.style.setProperty('--ty', `${ty}px`);
            sym.style.setProperty('--tr', `${tr}deg`);
            sym.style.animation = `symbolFloat ${duration}s linear ${delay}s infinite`;

            layer.appendChild(sym);
        }
    })();
});
