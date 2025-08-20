document.addEventListener('DOMContentLoaded', function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rootEl = document.documentElement;
  const animationsEnabledSetting = rootEl.getAttribute('data-anim-enabled');
  const animationsEnabled = animationsEnabledSetting !== 'false';
  const intensity = Math.max(0, Math.min(100, parseInt(rootEl.getAttribute('data-anim-intensity') || '60', 10)));

  function initScrollReveal() {
    if (prefersReduced || !animationsEnabled) return;
    const targets = document.querySelectorAll('.collection-product-card, .similar-products__card, .hero-poster, .featured-collection, .reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('reveal');
          // Stagger per element index with intensity scaling
          const base = parseFloat(el.dataset.revealDelay || 0);
          const scale = intensity / 100 * 0.06; // up to +60ms
          el.style.transitionDelay = (base + (idx * (0.02 + scale))) + 's';
          requestAnimationFrame(() => el.classList.add('is-visible'));
          obs.unobserve(el);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    targets.forEach((el, i) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      el.classList.add('reveal');
      el.dataset.revealDelay = (i % 10) * 0.02; // base stagger
      observer.observe(el);
    });
  }

  function initParallax() {
    if (prefersReduced || !animationsEnabled) return;
    const sections = document.querySelectorAll('[data-parallax]');
    if (!sections.length) return;
    function update() {
      sections.forEach(sec => {
        const speed = parseFloat(sec.getAttribute('data-parallax')) || 0.05;
        const img = sec.querySelector('[data-parallax-img]');
        if (!img) return;
        const rect = sec.getBoundingClientRect();
        const viewH = window.innerHeight || document.documentElement.clientHeight;
        const visible = rect.top < viewH && rect.bottom > 0;
        if (!visible) return;
        const center = rect.top + rect.height / 2 - viewH / 2;
        const translate = -center * speed * (0.5 + intensity / 100);
        img.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0) scale(${(1.02 + intensity/100*0.02).toFixed(2)})`;
      });
      raf = requestAnimationFrame(update);
    }
    let raf = requestAnimationFrame(update);
    window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
  }

  function initRipple() {
    const rippleTargets = document.querySelectorAll('.collection-add-to-cart-btn, .featured-collection__cta, .product-section__add-to-cart');
    rippleTargets.forEach(target => {
      if (target.dataset.rippleBound) return;
      target.dataset.rippleBound = '1';
      target.classList.add('btn-ripple');
      target.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  function initCardTilt() {
    if (prefersReduced || !animationsEnabled) return;
    const tiltTargets = document.querySelectorAll('.collection-product-card, .featured-collection');
    tiltTargets.forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = '1';
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';
      const maxDeg = 3 + (intensity / 100) * 4; // 3deg..7deg
      function onMove(e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotateY = Math.max(Math.min(dx * maxDeg, maxDeg), -maxDeg);
        const rotateX = Math.max(Math.min(-dy * maxDeg, maxDeg), -maxDeg);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      function onLeave() {
        card.style.transform = '';
      }
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    function toggle() {
      if (window.scrollY > 600) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggle();
  }

  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const progress = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.transform = `scaleX(${progress / 100})`;
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  initScrollReveal();
  initRipple();
  initCardTilt();
  initParallax();
  initBackToTop();
  initScrollProgress();
});

