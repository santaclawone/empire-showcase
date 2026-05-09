/* ========================================
   EMPIRE SHOWCASE | theme engine + scroll
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const THEMES = ['minimalist','brutalist','glass','terminal','swiss','cyberpunk','editorial','mono','nature','bauhaus'];
  const THEME_KEY = 'empire-theme';

  // ---- THEME ENGINE ----
  const body = document.body;
  const switcherBtns = document.querySelectorAll('[data-theme]');
  const switcherName = document.querySelector('.switcher-name');
  const prevBtn = document.querySelector('.switcher-arrow--prev');
  const nextBtn = document.querySelector('.switcher-arrow--next');

  let currentTheme = localStorage.getItem(THEME_KEY) || 'minimalist';

  const applyTheme = (theme, animate = true) => {
    if (!THEMES.includes(theme)) return;

    // Remove all theme classes
    THEMES.forEach(t => body.classList.remove('theme-' + t));

    if (!animate) body.classList.add('switching');

    body.classList.add('theme-' + theme);
    currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);

    // Update switcher buttons
    switcherBtns.forEach(btn => {
      const isActive = btn.dataset.theme === theme;
      btn.setAttribute('aria-selected', isActive.toString());
    });

    // Update name
    if (switcherName) {
      const names = {
        minimalist: 'Minimal', brutalist: 'Brutal', glass: 'Glass',
        terminal: 'Terminal', swiss: 'Swiss', cyberpunk: 'Cyber',
        editorial: 'Editorial', mono: 'Mono', nature: 'Nature', bauhaus: 'Bauhaus'
      };
      switcherName.textContent = names[theme] || theme;
    }

    // Dispatch custom event for other handlers
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

    if (!animate) {
      requestAnimationFrame(() => body.classList.remove('switching'));
    }
  };

  // Button clicks
  switcherBtns.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // Arrow navigation
  const getAdjacent = (dir) => {
    const idx = THEMES.indexOf(currentTheme);
    const next = (idx + dir + THEMES.length) % THEMES.length;
    return THEMES[next];
  };

  if (prevBtn) prevBtn.addEventListener('click', () => applyTheme(getAdjacent(-1)));
  if (nextBtn) nextBtn.addEventListener('click', () => applyTheme(getAdjacent(1)));

  // Keyboard: left/right arrows when focused on switcher
  const switcher = document.querySelector('.switcher');
  if (switcher) {
    switcher.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); applyTheme(getAdjacent(-1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); applyTheme(getAdjacent(1)); }
    });
    // Make switcher focusable
    switcher.setAttribute('tabindex', '0');
  }

  // Apply saved theme on load (no animation)
  applyTheme(currentTheme, false);

  // ---- CURSOR FOLLOWER ----
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    let cx = 0, cy = 0, mx = 0, my = 0;
    let cursorVisible = false;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursor.classList.add('visible');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursorVisible = false;
      cursor.classList.remove('visible');
    });

    const follow = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(follow);
    };
    follow();

    document.querySelectorAll('a, button, .agent-card, .map-card, .pipeline-step').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // ---- SCROLL REVEAL ----
  const revealElements = document.querySelectorAll('.hero-title, .pipeline-step, .agent-card, .map-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));

  // ---- HERO DOT GENERATOR ----
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.hero-dot')) {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'hero-dot';
      dot.style.cssText = `
        top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
        opacity: ${0.2 + Math.random() * 0.4};
        animation-delay: ${Math.random() * 4}s;
        animation-duration: ${6 + Math.random() * 8}s;
      `;
      hero.appendChild(dot);
    }
  }

  // ---- COUNTER ANIMATION ----
  const counterEl = document.getElementById('counter');
  if (counterEl) {
    const target = 2026;
    let counted = false;
    const startObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          let current = 0;
          const step = Math.ceil(target / 60);
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            counterEl.textContent = String(current).padStart(3, '0');
          }, 24);
          startObserver.unobserve(counterEl);
        }
      });
    }, { threshold: 0.5 });
    startObserver.observe(counterEl);
  }

  // ---- STAT COUNTERS ----
  const stats = [
    { el: document.getElementById('stat-projects'), target: 74 },
    { el: document.getElementById('stat-nations'), target: 48 },
    { el: document.getElementById('stat-tournaments'), target: 23 },
  ].filter(s => s.el);

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.idx);
        animateStat(stats[idx]);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const animateStat = (stat) => {
    let current = 0;
    const step = Math.max(1, Math.ceil(stat.target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= stat.target) {
        current = stat.target;
        clearInterval(interval);
      }
      stat.el.textContent = current;
    }, 20);
  };

  stats.forEach((stat, i) => {
    stat.el.dataset.idx = i;
    statObserver.observe(stat.el);
  });

  // ---- REDUCED MOTION ----
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.hero-dot').forEach(el => el.remove());
  }
});
