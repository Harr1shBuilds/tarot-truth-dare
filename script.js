document.addEventListener("DOMContentLoaded", function () {
    /* ============================================================
       script.js — Mystical Tarot (Ritual Version)
       3D Card Ritual + Path Selection + Ambient FX
       ============================================================ */

    // ── Supabase Config ────────────────────────────────────────────
    const SUPABASE_URL = 'https://xkaozfnnosnrifewsvmh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYW96Zm5ub3NucmlmZXdzdm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjkzNDIsImV4cCI6MjA4NzYwNTM0Mn0.uF07fMYKbCc8hL9brhpVOUpnstWcx7ZdKcv2MqJ4Gvg';

    const { createClient } = supabase;
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    // ── 🧠 1. Pure State Management ────────────────────────────────
    const gameState = {
        type: 'truth',     // 'truth' | 'dare'
        isFlipping: false,
        revealedCount: 0,
        lastCardId: null
    };

    // ── DOM Refs ───────────────────────────────────────────────────
    const body = document.body;
    const pageSelect = document.getElementById('page-select');
    const pageRitual = document.getElementById('page-ritual');
    const btnTruth = document.getElementById('choose-truth');
    const btnDare = document.getElementById('choose-dare');
    const btnBack = document.getElementById('btn-back');

    const cards = document.querySelectorAll('.tarot-card');
    const btnAgain = document.getElementById('btn-again');
    const drawHint = document.getElementById('draw-hint');

    // ── 🔊 Ambient Audio ──────────────────────────────────────────
    const drawWhoosh = new Audio('sounds/whoosh.mp3');
    const revealChime = new Audio('sounds/chime.mp3');

    [drawWhoosh, revealChime].forEach(s => s.preload = "auto");
    drawWhoosh.volume = 0.5;
    revealChime.volume = 0.6;

    function playWhoosh() {
        drawWhoosh.currentTime = 0;
        drawWhoosh.play().catch(() => { });
    }

    function playChime() {
        revealChime.currentTime = 0;
        revealChime.play().catch(() => { });
    }

    function triggerHaptic(type = 'short') {
        if (!navigator.vibrate) return;
        if (type === 'short') navigator.vibrate(30);
        else if (type === 'impact') navigator.vibrate([20, 40, 20]);
    }

    // ── 🔮 2. Navigation Logic ────────────────────────────────────
    function switchToRitual(mode) {
        // Reset lastCardId when switching paths (Moon vs Flame)
        if (gameState.type !== mode) {
            gameState.lastCardId = null;
        }

        gameState.type = mode;
        body.className = `${mode}-theme`;

        playWhoosh();
        pageSelect.classList.remove('active');

        // Reset spread for re-emergence
        cards.forEach(card => {
            card.classList.remove('flipped', 'active', 'dim');
            const typeEl = card.querySelector('.ritual-type');
            const textEl = card.querySelector('.ritual-text');
            if (typeEl) typeEl.textContent = '';
            if (textEl) textEl.textContent = 'Waiting for the draw...';
        });
        btnAgain.classList.remove('visible');
        gameState.revealedCount = 0;
        gameState.isFlipping = false;

        setTimeout(() => {
            pageRitual.classList.add('active');
        }, 300);
    }

    function switchToSelect() {
        playWhoosh();
        pageRitual.classList.remove('active');
        setTimeout(() => {
            pageSelect.classList.add('active');
        }, 300);
    }

    btnTruth.addEventListener('click', () => switchToRitual('truth'));
    btnDare.addEventListener('click', () => switchToRitual('dare'));
    btnBack.addEventListener('click', switchToSelect);

    // ── 🔮 3. The Ritual (Cinematic Fullscreen) ───────────────────
    cards.forEach((card, index) => {
        card.addEventListener('click', async () => {
            if (gameState.isFlipping || card.classList.contains('flipped') || card.classList.contains('fullscreen')) return;
            gameState.isFlipping = true;

            // 1. Chosen One Focus
            cards.forEach(c => {
                if (c !== card) c.classList.add('dim');
            });
            body.classList.add('ritual-focus');

            triggerHaptic('short');
            playWhoosh();

            // 2. Fetch Ritual Data from Ether
            let draw;
            let retryCount = 0;
            while (retryCount < 3) {
                const { data, error } = await db.rpc('get_random_card', { card_type: gameState.type });
                if (error || !data || data.length === 0) break;
                draw = data[0];
                if (draw.id !== gameState.lastCardId) break;
                retryCount++;
            }

            const cardReveal = card.querySelector('.reveal-content');
            const typeEl = cardReveal?.querySelector('.ritual-type');
            const textEl = cardReveal?.querySelector('.ritual-text');

            if (textEl) {
                if (!draw) {
                    textEl.textContent = "The ether is silent...";
                } else {
                    gameState.lastCardId = draw.id;
                    if (typeEl) typeEl.textContent = gameState.type.toUpperCase();
                    textEl.textContent = draw.text;
                }
            }

            // 3. The Grand Reveal (Delay for Drama)
            setTimeout(() => {
                card.classList.add('flipped');
                card.classList.add('fullscreen'); // Cinematic Growth
                playChime();
                triggerHaptic('impact');
                gameState.revealedCount++;
                gameState.isFlipping = false;

                // Show reset after first reveal
                if (gameState.revealedCount >= 1) {
                    btnAgain.classList.add('visible');
                }
            }, 200); // Quick transition as requested
        });
    });

    btnAgain.addEventListener('click', () => {
        playWhoosh();
        body.classList.remove('ritual-focus');
        cards.forEach(card => {
            card.classList.remove('fullscreen', 'dim', 'flipped');
        });
        btnAgain.classList.remove('visible');
        gameState.revealedCount = 0;
        gameState.isFlipping = false;
    });

    // ── 🌌 4. Background Particles (Arcane Dust & Stars) ───────────
    (function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        const pc = canvas.getContext('2d');
        let pts = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function spawn() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.5,
                v: 0.05 + Math.random() * 0.1,
                a: Math.random() * 0.6,
                type: Math.random() > 0.8 ? 'star' : 'dust', // 20% stars
                p: Math.random() * Math.PI * 2 // pulse phase
            };
        }

        for (let i = 0; i < 60; i++) pts.push(spawn());

        function drawShape(p) {
            pc.beginPath();
            if (p.type === 'star') {
                // Draw a tiny cross/star
                const s = p.r * 2;
                pc.moveTo(p.x - s, p.y);
                pc.lineTo(p.x + s, p.y);
                pc.moveTo(p.x, p.y - s);
                pc.lineTo(p.x, p.y + s);
            } else {
                pc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            }
            // Twinkle effect
            const alpha = p.a * (0.5 + Math.sin(Date.now() * 0.002 + p.p) * 0.5);
            pc.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            pc.fillStyle = `rgba(184, 134, 11, ${alpha})`;
            p.type === 'star' ? pc.stroke() : pc.fill();
        }

        function draw() {
            pc.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.y -= p.v;
                if (p.y < -10) {
                    Object.assign(p, spawn());
                    p.y = canvas.height + 10;
                }
                drawShape(p);
            });
            requestAnimationFrame(draw);
        }
        draw();
    })();
});
