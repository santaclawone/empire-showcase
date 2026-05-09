/* ========================================
   EMPIRE SHOWCASE | scroll + interaction
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

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

    // Smooth follower
    const follow = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(follow);
    };
    follow();

    // Scale up on clickables
    document.querySelectorAll('a, button, .agent-card, .map-card, .pipeline-step').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // ---- SCROLL REVEAL (IntersectionObserver) ----
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

  // ---- COUNTER ANIMATION ----
  const counterEl = document.getElementById('counter');
  if (counterEl) {
    const target = 2026;
    let current = 0;
    const step = Math.ceil(target / 60);
    const startObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
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

  // ---- RANDOM DOT PATTERN for hero ----
  const hero = document.querySelector('.hero');
  if (hero) {
    const dotCount = 20;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('span');
      dot.className = 'hero-dot';
      dot.style.cssText = `
        position: absolute; width: 2px; height: 2px; border-radius: 50%;
        background: var(--gray-700); pointer-events: none;
        top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
        opacity: ${0.2 + Math.random() * 0.4};
        animation: dot-float ${6 + Math.random() * 8}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 4}s;
      `;
      hero.appendChild(dot);
    }
  }

  // ---- COLOR-SCHEME TOGGLE (prefers reduced motion check) ----
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.hero-dot').forEach(el => el.remove());
  }
});
