/**
 * GENZPHOTO — Premium Photography & Camera Studio
 * Main JavaScript Controller
 * ═══════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────
   1. PAGE LOADER
─────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('pageLoader');
  const percentEl = document.getElementById('loaderPercent');
  const barEl = document.querySelector('.loader-bar');

  if (!loader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;

    if (percentEl) percentEl.textContent = `${progress}%`;
    if (barEl) barEl.style.width = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
          if (loader.parentNode) loader.style.display = 'none';
        }, 700);
      }, 300);
    }
  }, 40);
}

/* ──────────────────────────────────────────────
   2. NAVBAR — Scroll Behavior & Active Section
─────────────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function handleNavbar() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateActiveLink() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

window.addEventListener('scroll', () => {
  handleNavbar();
  updateActiveLink();
}, { passive: true });

/* ──────────────────────────────────────────────
   3. MOBILE HAMBURGER MENU
─────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  });

  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ──────────────────────────────────────────────
   4. SCROLL REVEAL ANIMATIONS
─────────────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => {
          el.classList.add('active');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────
   5. ANIMATED STAT COUNTERS
─────────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

/* ──────────────────────────────────────────────
   6. FLOATING PARTICLES (HERO)
─────────────────────────────────────────────── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 8 + 8;
    const opacity = Math.random() * 0.4 + 0.2;

    p.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      opacity: ${opacity};
    `;

    container.appendChild(p);
  }
}

/* ──────────────────────────────────────────────
   7. CURSOR GLOW
─────────────────────────────────────────────── */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ──────────────────────────────────────────────
   8. CART BUTTON FEEDBACK & TOAST
─────────────────────────────────────────────── */
function initCartButtons() {
  const cartBtns = document.querySelectorAll('.btn-cart');
  const toast    = document.getElementById('cartToast');
  const toastMsg = document.getElementById('cartToastMsg');
  let toastTimer = null;

  cartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productName = btn.dataset.name || 'Item';
      const originalHTML = btn.innerHTML;

      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Added';
      btn.style.background = 'linear-gradient(135deg, #D4AF37, #F9A826)';
      btn.style.color = '#0A0A0A';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.color = '';
      }, 1600);

      if (toast) {
        if (toastMsg) toastMsg.textContent = `${productName} added to cart!`;
        if (toastTimer) clearTimeout(toastTimer);
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
      }
    });
  });
}

/* ──────────────────────────────────────────────
   9. BACK TO TOP BUTTON
─────────────────────────────────────────────── */
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────
   10. SMOOTH SCROLL FOR ALL ANCHORS
─────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ──────────────────────────────────────────────
   11. CAMERA CARDS — 3D Tilt Effect
─────────────────────────────────────────────── */
function initTiltEffect() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.camera-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const xRot   = ((y / rect.height) - 0.5) * 6;
      const yRot   = ((x / rect.width) - 0.5) * -6;
      card.style.transform = `perspective(600px) rotateX(${xRot}deg) rotateY(${yRot}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

/* ──────────────────────────────────────────────
   12. KEYBOARD ACCESSIBILITY (ESC to close menu)
─────────────────────────────────────────────── */
function initA11y() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinksEl && navLinksEl.classList.contains('open')) {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ──────────────────────────────────────────────
   13. INITIALIZE ON DOM READY
─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  handleNavbar();
  updateActiveLink();
  initScrollReveal();
  initCounters();
  initParticles();
  initCursorGlow();
  initCartButtons();
  initBackTop();
  initSmoothScroll();
  initTiltEffect();
  initA11y();

  console.log(
    '%c GENZPHOTO %c Premium Studio Website Loaded ',
    'background:#D4AF37;color:#0A0A0A;font-weight:800;padding:4px 8px;border-radius:3px 0 0 3px;font-family:monospace',
    'background:#1A1A1A;color:#D4AF37;font-weight:600;padding:4px 8px;border-radius:0 3px 3px 0;font-family:monospace'
  );
});

/* Window Resize */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinksEl && navLinksEl.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  }
});
