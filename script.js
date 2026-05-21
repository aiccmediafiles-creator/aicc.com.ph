/* ═══════════════════════════════════════════════════════
   AICC – Almeria International Construction Corporation
   script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Preloader ──────────────────────────────────────────
   Hide after bar animation (~2.2s fill + 0.6s buffer)    */
(function initPreloader() {
  document.body.classList.add('preloading');

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hide = () => {
    preloader.classList.add('pre-out');
    document.body.classList.remove('preloading');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1000);
  };

  // Dismiss after bar fills (2.2s fill + 1.3s delay + 0.5s buffer)
  const timer = setTimeout(hide, 4200);

  // Also dismiss as soon as everything is loaded
  window.addEventListener('load', () => {
    clearTimeout(timer);
    setTimeout(hide, 2800);
  });
})();


/* ── Navbar: solid on scroll ────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ── Mobile hamburger menu ──────────────────────────── */
(function initMobileMenu() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ── Smooth scroll for anchor links ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── Scroll-reveal observer ─────────────────────────── */
(function initReveal() {
  // Mark all section children for reveal
  const selectors = [
    '.section-header',
    '.video-section-header',
    '.video-player-wrap',
    '.video-stats-row',
    '.about-grid > *',
    '.svc-card',
    '.proj-card',
    '.accred-card',
    '.accred-left',
    '.contact-info',
    '.contact-form-wrap',
    '.mv-card',
    '.ci',
    '.footer-col',
    '.footer-brand',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings
      const delay = Math.min(i * 0.08, 0.5);
      el.style.transitionDelay = delay + 's';
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ── Animated number counters ───────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]:not(.hs-num)');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = (el, target, duration = 1800) => {
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animate(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ── Company Video Player ───────────────────────────── */
(function initVideoPlayer() {
  const video    = document.getElementById('companyVideo');
  const overlay  = document.getElementById('videoOverlay');
  const playBtn  = document.getElementById('videoPlayBtn');
  const controls = document.getElementById('videoControls');
  const vcPlay   = document.getElementById('vcPlayPause');
  const vcFill   = document.getElementById('vcProgressFill');
  const vcThumb  = document.getElementById('vcProgressThumb');
  const vcWrap   = document.getElementById('vcProgressWrap');
  const vcTime   = document.getElementById('vcTime');
  const vcMute   = document.getElementById('vcMute');
  const vcFS     = document.getElementById('vcFullscreen');
  const wrap     = document.getElementById('videoWrap');

  if (!video) return;

  const fmt = s => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ── Play from overlay ──
  const startPlay = () => {
    video.play();
    overlay.classList.add('hidden');
    controls.classList.add('visible');
    vcPlay.querySelector('.icon-play').style.display  = 'none';
    vcPlay.querySelector('.icon-pause').style.display = '';
  };

  overlay.addEventListener('click', startPlay);
  playBtn.addEventListener('click', e => { e.stopPropagation(); startPlay(); });

  // ── Play / Pause toggle ──
  const togglePlay = () => {
    if (video.paused) {
      video.play();
      vcPlay.querySelector('.icon-play').style.display  = 'none';
      vcPlay.querySelector('.icon-pause').style.display = '';
    } else {
      video.pause();
      vcPlay.querySelector('.icon-play').style.display  = '';
      vcPlay.querySelector('.icon-pause').style.display = 'none';
    }
  };

  vcPlay.addEventListener('click', togglePlay);
  video.addEventListener('click',  togglePlay);

  // Show overlay again when video ends
  video.addEventListener('ended', () => {
    overlay.classList.remove('hidden');
    controls.classList.remove('visible');
    vcPlay.querySelector('.icon-play').style.display  = '';
    vcPlay.querySelector('.icon-pause').style.display = 'none';
    vcFill.style.width = '0%';
    vcThumb.style.right = '0px';
  });

  // ── Progress ──
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    vcFill.style.width = pct + '%';
    vcTime.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
    // Move thumb
    const barW = vcFill.parentElement.offsetWidth;
    vcThumb.style.left  = (pct / 100) * barW + 'px';
    vcThumb.style.right = 'auto';
  });

  video.addEventListener('loadedmetadata', () => {
    vcTime.textContent = '0:00 / ' + fmt(video.duration);
  });

  // Seek on progress bar click
  vcWrap.addEventListener('click', e => {
    const rect = vcWrap.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });

  // ── Mute ──
  vcMute.addEventListener('click', () => {
    video.muted = !video.muted;
    vcMute.style.opacity = video.muted ? '0.4' : '';
  });

  // ── Fullscreen ──
  vcFS.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrap.requestFullscreen && wrap.requestFullscreen();
    }
  });

  // Hide controls after 3s of inactivity
  let hideTimer;
  wrap.addEventListener('mousemove', () => {
    if (overlay.classList.contains('hidden')) {
      controls.classList.add('visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!video.paused) controls.classList.remove('visible');
      }, 3000);
    }
  });
})();


/* ── Contact form ───────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate send (replace with actual endpoint)
    setTimeout(() => {
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#22c55e';
      form.reset();

      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1400);
  });
})();


/* ── Parallax on hero ───────────────────────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.setProperty('--parallax-y', y * 0.25 + 'px');
  }, { passive: true });
})();


/* ── Active nav link highlight ──────────────────────── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ── Project Photo Gallery Lightbox ─────────────────── */
(function initGallery() {
  const modal    = document.getElementById('lbModal');
  const backdrop = document.getElementById('lbBackdrop');
  const img      = document.getElementById('lbImg');
  const titleEl  = document.getElementById('lbTitle');
  const counter  = document.getElementById('lbCounter');
  const dotsWrap = document.getElementById('lbDots');
  const btnClose = document.getElementById('lbClose');
  const btnPrev  = document.getElementById('lbPrev');
  const btnNext  = document.getElementById('lbNext');
  if (!modal) return;

  let photos = [];
  let idx    = 0;

  /* ── Open ── */
  const open = (photoArr, title, startIdx) => {
    photos = photoArr;
    idx    = startIdx || 0;
    titleEl.textContent = title;
    buildDots();
    showPhoto(idx, false);
    modal.classList.add('lb-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  /* ── Close ── */
  const close = () => {
    modal.classList.remove('lb-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /* ── Show photo ── */
  const showPhoto = (i, animate = true) => {
    if (animate) {
      img.classList.add('lb-fade');
      setTimeout(() => {
        img.src = photos[i];
        img.classList.remove('lb-fade');
      }, 160);
    } else {
      img.src = photos[i];
    }
    counter.textContent = (i + 1) + ' / ' + photos.length;
    btnPrev.disabled = (i === 0);
    btnNext.disabled = (i === photos.length - 1);
    updateDots(i);
  };

  /* ── Dots ── */
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    photos.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'lb-dot' + (i === idx ? ' active' : '');
      d.setAttribute('aria-label', 'Photo ' + (i + 1));
      d.addEventListener('click', () => { idx = i; showPhoto(i); });
      dotsWrap.appendChild(d);
    });
  };
  const updateDots = i => {
    dotsWrap.querySelectorAll('.lb-dot').forEach((d, j) => {
      d.classList.toggle('active', j === i);
    });
  };

  /* ── Nav ── */
  btnPrev.addEventListener('click', () => { if (idx > 0) showPhoto(--idx); });
  btnNext.addEventListener('click', () => { if (idx < photos.length - 1) showPhoto(++idx); });

  /* ── Close triggers ── */
  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('lb-open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft'  && idx > 0)                showPhoto(--idx);
    if (e.key === 'ArrowRight' && idx < photos.length - 1) showPhoto(++idx);
  });

  /* ── Wire up all pgcards ── */
  document.querySelectorAll('.pgcard').forEach(card => {
    const photoArr = JSON.parse(card.dataset.photos || '[]');
    const title    = card.dataset.title || '';

    // Cover click
    const cover = card.querySelector('.pgcard-cover');
    if (cover) {
      cover.addEventListener('click', () => open(photoArr, title, 0));
    }

    // Thumb clicks
    card.querySelectorAll('.pg-thumb').forEach(thumb => {
      const i = parseInt(thumb.dataset.idx, 10) || 0;
      thumb.addEventListener('click', e => {
        e.stopPropagation();
        open(photoArr, title, i);
      });
    });
  });

  /* ── Wire up event gallery items ── */
  document.querySelectorAll('.ev-gallery').forEach(gallery => {
    const photoArr = JSON.parse(gallery.dataset.photos || '[]');
    const title    = gallery.dataset.title || 'Event Gallery';
    gallery.querySelectorAll('.ev-photo').forEach(photo => {
      photo.addEventListener('click', () => {
        const i = parseInt(photo.dataset.idx, 10) || 0;
        open(photoArr, title, i);
      });
    });
  });

  /* ── Wire up office gallery items ── */
  const officePhotos = (() => {
    const featured = document.querySelector('.og-feature');
    if (!featured) return [];
    try { return JSON.parse(featured.dataset.photos || '[]'); } catch { return []; }
  })();
  document.querySelectorAll('.og-item').forEach(item => {
    item.addEventListener('click', () => {
      const i = parseInt(item.dataset.idx, 10) || 0;
      const title = item.dataset.title || 'AICC Office';
      open(officePhotos, title, i);
    });
  });

  /* ── Wire up certificate cards ── */
  document.querySelectorAll('.cert-card').forEach(card => {
    const photoArr = JSON.parse(card.dataset.photos || '[]');
    const title    = card.dataset.title || '';
    card.addEventListener('click', () => open(photoArr, title, 0));
  });

  /* ── Drag-to-scroll on cert strip ── */
  const scrollWrap = document.querySelector('.certs-scroll-wrap');
  if (scrollWrap) {
    let isDown = false, startX, scrollLeft;
    scrollWrap.addEventListener('mousedown', e => {
      isDown = true; startX = e.pageX - scrollWrap.offsetLeft;
      scrollLeft = scrollWrap.scrollLeft;
    });
    scrollWrap.addEventListener('mouseleave', () => isDown = false);
    scrollWrap.addEventListener('mouseup',    () => isDown = false);
    scrollWrap.addEventListener('mousemove',  e => {
      if (!isDown) return;
      e.preventDefault();
      scrollWrap.scrollLeft = scrollLeft - (e.pageX - scrollWrap.offsetLeft - startX);
    });
  }
})();
