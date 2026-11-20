/* New Year season decorations: header light garland and page snowfall. */
(() => {
  document.body.classList.add('season-ny');

  /* Light garland */
  const garland = document.querySelector('.ny-garland');
  const COLORS = [['#ffd98a', 'rgba(255,217,138,.75)'], ['#f4f1ea', 'rgba(244,241,234,.7)'], ['#9cc8ff', 'rgba(156,200,255,.7)'], ['#e2b866', 'rgba(226,184,102,.75)']];
  function hangBulbs() {
    if (!garland) return;
    const n = Math.ceil(garland.clientWidth / 90);
    garland.replaceChildren(...Array.from({ length: n }, (_, i) => {
      const b = document.createElement('span');
      const [c, g] = COLORS[i % COLORS.length];
      b.className = 'ny-bulb';
      b.style.cssText = `left:${i * 90 + 41}px;--c:${c};--g:${g};--d:${(1.8 + (i % 5) * 0.35).toFixed(2)}s;--delay:${(-(i % 7) * 0.4).toFixed(1)}s`;
      return b;
    }));
  }
  hangBulbs();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(hangBulbs, 150); });

  /* Snowfall */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'nySnow';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, dpr, flakes = [];
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(35, w / 18)));
    flakes = Array.from({ length: count }, () => newFlake(true));
  }
  function newFlake(anywhere) {
    const r = Math.random() * 2.2 + 0.8;
    return { x: Math.random() * w, y: anywhere ? Math.random() * h : -10, r, vy: 0.25 + r * 0.22, sway: Math.random() * Math.PI * 2, o: 0.35 + Math.random() * 0.5 };
  }
  let last = 0, running = true;
  function tick(t) {
    if (!running) return;
    const dt = Math.min(48, t - last || 16) / 16; last = t;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.sway += 0.012 * dt;
      f.y += f.vy * dt;
      f.x += Math.sin(f.sway) * 0.35 * dt;
      if (f.y > h + 10) Object.assign(f, newFlake(false));
      ctx.globalAlpha = f.o;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  size();
  addEventListener('resize', () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(tick); }
  });
  requestAnimationFrame(tick);
})();
