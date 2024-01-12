/* =========================================================
   New Sichuan — Gallery
   No dependencies. Editorial-monograph interactions.
   ========================================================= */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initNumbering();
    initStickyNav();
    initChipSync();
    initReveal();
    initLightbox();
  });

  /* ---------- Numbering: assign global 001..NNN to every tile ---------- */
  function initNumbering() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, i) => {
      const num = String(i + 1).padStart(3, '0');
      tile.dataset.number = num;
      const cap = tile.querySelector('.tile__cap');
      if (cap) cap.dataset.number = num;
    });
  }

  /* ---------- Sticky utility nav: toggle .has-stuck-nav on body ----------
     Body gets the class once the masthead has scrolled out of viewport.
     The utility-nav fades + slides in via CSS based on that class. */
  function initStickyNav() {
    const masthead = document.getElementById('masthead');
    if (!masthead || !('IntersectionObserver' in window)) {
      document.body.classList.add('has-stuck-nav');
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('has-stuck-nav', !entry.isIntersecting);
    }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });
    io.observe(masthead);
  }

  /* ---------- Active section underline on utility-nav chips ---------- */
  function initChipSync() {
    const sections = Array.from(document.querySelectorAll('main .section'));
    if (sections.length === 0) return;

    const allLinks = Array.from(document.querySelectorAll('.util-chip'));
    const linksByHash = new Map();
    allLinks.forEach((a) => {
      const hash = a.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      if (!linksByHash.has(hash)) linksByHash.set(hash, []);
      linksByHash.get(hash).push(a);
    });

    const setActive = (id) => {
      allLinks.forEach((a) => a.classList.remove('is-active'));
      const links = linksByHash.get('#' + id);
      if (!links) return;
      links.forEach((a) => a.classList.add('is-active'));

      // Keep the active chip in view on mobile when the utility-nav scrolls
      const chip = links[0];
      if (!chip) return;
      const container = chip.parentElement && chip.parentElement.parentElement;
      if (container && container.scrollWidth > container.clientWidth) {
        const cRect = container.getBoundingClientRect();
        const lRect = chip.getBoundingClientRect();
        const offset = (lRect.left - cRect.left) - (container.clientWidth / 2 - chip.offsetWidth / 2);
        container.scrollBy({ left: offset, behavior: reduced ? 'auto' : 'smooth' });
      }
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      if (visible.length > 0) setActive(visible[0].target.id);
    }, {
      rootMargin: '-25% 0px -60% 0px',
      threshold: 0,
    });

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Tile reveal on scroll, with stagger capped at 6 per section ---------- */
  function initReveal() {
    const tiles = document.querySelectorAll('.tile');
    if (tiles.length === 0) return;

    if (reduced || !('IntersectionObserver' in window)) {
      tiles.forEach((t) => t.classList.add('no-anim'));
      return;
    }

    // Assign per-section staggered transition-delay, capped at 6 tiles
    document.querySelectorAll('.section').forEach((section) => {
      const sectionTiles = section.querySelectorAll('.tile');
      sectionTiles.forEach((tile, i) => {
        const capped = Math.min(i, 6);
        tile.style.transitionDelay = (capped * 70) + 'ms';
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    tiles.forEach((t) => io.observe(t));
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const dialog = document.getElementById('lightbox');
    if (!dialog) return;

    const imgEl = dialog.querySelector('.lightbox__img');
    const numEl = dialog.querySelector('.lightbox__num');
    const titleEl = dialog.querySelector('.lightbox__title');
    const sectionEl = dialog.querySelector('.lightbox__section');
    const btnClose = dialog.querySelector('.lightbox__close');
    const btnPrev = dialog.querySelector('.lightbox__nav--prev');
    const btnNext = dialog.querySelector('.lightbox__nav--next');

    let currentList = [];
    let currentIndex = 0;
    let lastFocus = null;

    const decodeEntities = (s) => {
      const d = document.createElement('textarea');
      d.innerHTML = s || '';
      return d.value;
    };

    const render = () => {
      const tile = currentList[currentIndex];
      if (!tile) return;
      const img = tile.querySelector('img');
      const caption = decodeEntities(tile.dataset.caption || (img && img.alt) || '');
      const section = decodeEntities(tile.dataset.section || '');
      const num = tile.dataset.number || '';

      imgEl.src = img ? img.src : '';
      imgEl.alt = caption;
      titleEl.textContent = caption;
      sectionEl.textContent = section;
      numEl.textContent = num;
    };

    const open = (tile) => {
      const section = tile.closest('.section');
      currentList = section
        ? Array.from(section.querySelectorAll('.tile'))
        : [tile];
      currentIndex = currentList.indexOf(tile);
      if (currentIndex < 0) currentIndex = 0;

      lastFocus = document.activeElement;
      render();

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      if (dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
    };

    const step = (delta) => {
      if (currentList.length === 0) return;
      currentIndex = (currentIndex + delta + currentList.length) % currentList.length;
      render();
    };

    document.addEventListener('click', (e) => {
      const tile = e.target.closest && e.target.closest('.tile');
      if (tile) {
        e.preventDefault();
        open(tile);
      }
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));

    dialog.addEventListener('click', (e) => {
      const figure = dialog.querySelector('.lightbox__figure');
      if (!figure) return;
      const r = figure.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      const onImg = e.target === imgEl;
      const onControl = e.target.closest('.lightbox__close, .lightbox__nav');
      if (!inside || (inside && !onImg && !onControl && !e.target.closest('.lightbox__cap'))) {
        close();
      }
    });

    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
    });

    const onKey = (e) => {
      if (!dialog.open && !dialog.hasAttribute('open')) return;
      if (e.key === 'Escape')     { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    };
    document.addEventListener('keydown', onKey);
    dialog.addEventListener('keydown', onKey);

    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    dialog.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
    }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      touchActive = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        step(dx > 0 ? -1 : 1);
      } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        close();
      }
    }, { passive: true });
  }
})();
