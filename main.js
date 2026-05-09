/* ========================================
   EMPIRE SHOWCASE | design + theme engine
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const DESIGNS = ['spatial','type','slides','terminal','zine','zen','split','os','deutsche','organic'];  // 10 distinct identities
  const THEMES = ['minimalist','brutalist','glass','terminal','swiss','cyberpunk','editorial','mono','nature','bauhaus'];

  const KEY_DESIGN = 'empire-design';
  const KEY_THEME = 'empire-theme';
  const body = document.body;

  // ---- SWITCHER ENGINE ----
  const designBtns = document.querySelectorAll('[data-type="design"]');
  const themeBtns = document.querySelectorAll('[data-type="theme"]');
  const currentDesignEl = document.querySelector('.switcher-current-design');
  const currentThemeEl = document.querySelector('.switcher-current-theme');

  const names = {
    designs: {
      spatial: 'Spatial', type: 'Type', slides: 'Slides',
      terminal: 'Terminal', zine: 'Zine', zen: 'Zen',
      split: 'Split', os: 'OS', deutsche: 'Deutsche', organic: 'Organic'
    },
    themes: {
      minimalist: 'Minimal', brutalist: 'Brutal', glass: 'Glass',
      terminal: 'Terminal', swiss: 'Swiss', cyberpunk: 'Cyber',
      editorial: 'Editorial', mono: 'Mono', nature: 'Nature', bauhaus: 'Bauhaus'
    }
  };

  let currentDesign = localStorage.getItem(KEY_DESIGN) || 'spatial';
  let currentTheme = localStorage.getItem(KEY_THEME) || 'minimalist';  // keep default theme same

  const apply = (type, value, animate = true) => {
    if (!animate) body.classList.add('switching');

    if (type === 'design') {
      DESIGNS.forEach(d => body.classList.remove('design-' + d));
      body.classList.add('design-' + value);
      currentDesign = value;
      localStorage.setItem(KEY_DESIGN, value);
      designBtns.forEach(btn => {
        btn.setAttribute('aria-selected', (btn.dataset.value === value).toString());
      });
      if (currentDesignEl) currentDesignEl.textContent = names.designs[value] || value;
    } else if (type === 'theme') {
      THEMES.forEach(t => body.classList.remove('theme-' + t));
      body.classList.add('theme-' + value);
      currentTheme = value;
      localStorage.setItem(KEY_THEME, value);
      themeBtns.forEach(btn => {
        btn.setAttribute('aria-selected', (btn.dataset.value === value).toString());
      });
      if (currentThemeEl) currentThemeEl.textContent = names.themes[value] || value;
    }

    document.dispatchEvent(new CustomEvent('empire-switch', { detail: { design: currentDesign, theme: currentTheme } }));

    if (!animate) requestAnimationFrame(() => body.classList.remove('switching'));
  };

  // Button clicks
  designBtns.forEach(btn => btn.addEventListener('click', () => apply('design', btn.dataset.value)));
  themeBtns.forEach(btn => btn.addEventListener('click', () => apply('theme', btn.dataset.value)));

  // Keyboard navigation
  const switcher = document.querySelector('.switcher');
  if (switcher) {
    switcher.setAttribute('tabindex', '0');
    switcher.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = DESIGNS.indexOf(currentDesign);
        apply('design', DESIGNS[(idx - 1 + DESIGNS.length) % DESIGNS.length]);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const idx = THEMES.indexOf(currentTheme);
        apply('theme', THEMES[(idx + 1) % THEMES.length]);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = THEMES.indexOf(currentTheme);
        apply('theme', THEMES[(idx - 1 + THEMES.length) % THEMES.length]);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = DESIGNS.indexOf(currentDesign);
        apply('design', DESIGNS[(idx + 1) % DESIGNS.length]);
      }
    });
  }

  // Apply saved state
  apply('design', currentDesign, false);
  apply('theme', currentTheme, false);

  // ---- CURSOR ----
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    let cx = 0, cy = 0, mx = 0, my = 0, visible = false;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; cursor.classList.add('visible'); }
    });
    document.addEventListener('mouseleave', () => { visible = false; cursor.classList.remove('visible'); });
    (function follow() {
      cx += (mx - cx) * .12; cy += (my - cy) * .12;
      cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .agent-card, .map-card, .pipeline-step').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // ---- SCROLL REVEALS ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.hero-title, .pipeline-step, .agent-card, .map-card').forEach(el => revealObserver.observe(el));

  // ---- HERO DOTS ----
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.hero-dot')) {
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement('span');
      dot.className = 'hero-dot';
      dot.style.cssText = `top: ${Math.random()*100}%; left: ${Math.random()*100}%; opacity: ${.2+Math.random()*.4}; animation-delay: ${Math.random()*4}s; animation-duration: ${6+Math.random()*8}s;`;
      hero.appendChild(dot);
    }
  }

  // ---- COUNTER ----
  const counterEl = document.getElementById('counter');
  if (counterEl) {
    let counted = false;
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          let cur = 0; const step = Math.ceil(2026 / 60);
          const interval = setInterval(() => {
            cur += step;
            if (cur >= 2026) { cur = 2026; clearInterval(interval); }
            counterEl.textContent = String(cur).padStart(4, '0');
          }, 24);
        }
      });
    }, { threshold: .5 }).observe(counterEl);
  }

  // ---- STAT COUNTERS ----
  const stats = [
    { el: document.getElementById('stat-origins'), target: 12 },
    { el: document.getElementById('stat-roasts'), target: 47 },
    { el: document.getElementById('stat-countries'), target: 3 },
  ].filter(s => s.el);

  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const s = stats[parseInt(entry.target.dataset.idx)];
        let cur = 0; const step = Math.max(1, Math.ceil(s.target / 40));
        const interval = setInterval(() => { cur += step; if (cur >= s.target) { cur = s.target; clearInterval(interval); } s.el.textContent = cur; }, 20);
        statObs.unobserve(entry.target);
      }
    });
  }, { threshold: .5 });

  stats.forEach((s, i) => { s.el.dataset.idx = i; statObs.observe(s.el); });

  // ---- REDUCED MOTION ----
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.hero-dot').forEach(el => el.remove());
  }
});
