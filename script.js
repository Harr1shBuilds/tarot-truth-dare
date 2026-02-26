document.addEventListener("DOMContentLoaded", function () {
    // ── Supabase Config ────────────────────────────────────────────
    const SUPABASE_URL = 'https://xkaozfnnosnrifewsvmh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYW96Zm5ub3NucmlmZXdzdm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjkzNDIsImV4cCI6MjA4NzYwNTM0Mn0.uF07fMYKbCc8hL9brhpVOUpnstWcx7ZdKcv2MqJ4Gvg';
    const { createClient } = supabase;
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    const cards = document.querySelectorAll('.tarot-card');
    const focusLayer = document.getElementById('focusLayer');
    const resetBtn = document.getElementById('resetBtn');

    // Audio
    const drawWhoosh = new Audio('sounds/whoosh.mp3');
    const revealChime = new Audio('sounds/chime.mp3');

    cards.forEach(card => {
        card.addEventListener('click', async () => {
            if (focusLayer.classList.contains('active')) return;

            // Optional: Dim other cards
            cards.forEach(c => { if (c !== card) c.classList.add('dim'); });

            // Fetch Data
            let draw;
            try {
                const { data, error } = await db.rpc('get_random_card', { card_type: 'truth' });
                if (data && data.length > 0) draw = data[0];
            } catch (e) { }

            // Update original card UI before cloning
            const textEl = card.querySelector('.ritual-text');
            if (textEl && draw) textEl.textContent = draw.text;

            // Clone and Focus
            const clone = card.cloneNode(true);
            clone.classList.remove('dim');
            clone.classList.add('flipped');

            focusLayer.innerHTML = "";
            focusLayer.appendChild(clone);
            focusLayer.classList.add('active');
            resetBtn.classList.add('visible');

            revealChime.play().catch(() => { });
        });
    });

    resetBtn.addEventListener('click', () => {
        focusLayer.classList.remove('active');
        focusLayer.innerHTML = "";
        resetBtn.classList.remove('visible');
        cards.forEach(card => card.classList.remove('dim', 'flipped'));
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
});
