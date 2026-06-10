// Vida Hajebi — biography site interactions
// Wrapped in IIFE so identifiers are scoped and cannot collide on duplicate loads.
(() => {

// Mobile menu (single morphing toggle, full-screen overlay, <600px)
const navToggle  = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const setMenu = (open) => {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.toggle('is-open', open);
  navToggle.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  document.body.classList.toggle('menu-open', open);
};

navToggle?.addEventListener('click', () => {
  setMenu(!mobileMenu.classList.contains('is-open'));
});

// Close on any link click inside the menu
mobileMenu?.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => setMenu(false));
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) setMenu(false);
});

// Slider controls — scroll the configured target horizontally on prev/next.
// In RTL, "next" shows content further from the start (left visually),
// "prev" returns toward the start (right visually).
// Uses event delegation on the .slider-controls container so handlers survive
// any DOM reshuffling of the inner buttons.
document.querySelectorAll('.slider-controls[data-target]').forEach((controls) => {
  const target = document.querySelector(controls.dataset.target);
  if (!target) return;

  // One image per click: width of the first child + gap between items.
  const step = () => {
    const first = target.children[0];
    if (!first) return 280;
    const gap = parseFloat(getComputedStyle(target).columnGap || getComputedStyle(target).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const updateDisabled = () => {
    const max = target.scrollWidth - target.clientWidth;
    const x = target.scrollLeft;
    const atStart = Math.abs(x) < 1;
    const atEnd   = Math.abs(Math.abs(x) - max) < 1;
    controls.querySelectorAll('.slider-btn').forEach((b) => {
      const dir = b.dataset.dir;
      b.disabled = (dir === 'prev' && atStart) || (dir === 'next' && atEnd);
    });
  };

  controls.addEventListener('click', (e) => {
    const btn = e.target.closest('.slider-btn');
    if (!btn || btn.disabled) return;
    const dir = btn.dataset.dir;
    const delta = step();
    target.scrollBy({
      left: dir === 'next' ? -delta : delta,    // RTL: next scrolls toward more-negative
      behavior: 'smooth',
    });
  });

  target.addEventListener('scroll', updateDisabled, { passive: true });
  window.addEventListener('resize', updateDisabled);
  updateDisabled();
});

// Click-to-play Vimeo embeds
// If data-vimeo-external is set the video opens in a new tab (privacy-restricted videos).
document.querySelectorAll('[data-vimeo-id]').forEach((tile) => {
  const button = tile.querySelector('.video-thumb');
  button?.addEventListener('click', () => {
    const externalUrl = tile.dataset.vimeoExternal;
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener');
      return;
    }
    const id = tile.dataset.vimeoId;
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${id}?autoplay=1&byline=0&portrait=0&title=0`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = 'ویدیو';
    tile.replaceChildren(iframe);
  });
});

// Smooth scroll for in-page nav
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Biography hero — push hero below header via paddingTop (desktop only)
const bioHero = document.querySelector('.bio-hero');
if (bioHero) {
  const header = document.querySelector('.site-header');
  const updateHeroPadding = () => {
    if (!header) return;
    if (window.innerWidth > 768) {
      bioHero.style.paddingTop = (header.getBoundingClientRect().bottom + 68) + 'px';
    } else {
      bioHero.style.paddingTop = '';
    }
  };
  updateHeroPadding();
  window.addEventListener('load', updateHeroPadding);
  window.addEventListener('resize', updateHeroPadding);
}

// Interviews accordion — smooth animated open/close, one open at a time
const allDetails = document.querySelectorAll('.interviews-list details');

const EASE_OPEN  = 'height 0.32s cubic-bezier(0.0,0.0,0.2,1), padding-top 0.32s cubic-bezier(0.0,0.0,0.2,1), padding-bottom 0.32s cubic-bezier(0.0,0.0,0.2,1)';
const EASE_CLOSE = 'height 0.25s cubic-bezier(0.4,0.0,1,1), padding-top 0.25s cubic-bezier(0.4,0.0,1,1), padding-bottom 0.25s cubic-bezier(0.4,0.0,1,1)';

const clearBodyStyles = (body) => {
  body.style.height = '';
  body.style.paddingTop = '';
  body.style.paddingBottom = '';
  body.style.transition = '';
};

const closeDetail = (det) => {
  const body = det.querySelector('.iv-body');
  const cs = getComputedStyle(body);
  body.style.transition = EASE_CLOSE;
  body.style.height = body.scrollHeight + 'px';
  body.style.paddingTop = cs.paddingTop;
  body.style.paddingBottom = cs.paddingBottom;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    body.style.height = '0px';
    body.style.paddingTop = '0px';
    body.style.paddingBottom = '0px';
  }));
  const onEnd = (e) => {
    if (e.propertyName !== 'height') return;
    body.removeEventListener('transitionend', onEnd);
    det.removeAttribute('open');
    clearBodyStyles(body);
  };
  body.addEventListener('transitionend', onEnd);
};

const openDetail = (det) => {
  det.setAttribute('open', '');
  const body = det.querySelector('.iv-body');
  const cs = getComputedStyle(body);
  const targetH = body.scrollHeight + 'px';
  const targetPT = cs.paddingTop;
  const targetPB = cs.paddingBottom;
  body.style.transition = EASE_OPEN;
  body.style.height = '0px';
  body.style.paddingTop = '0px';
  body.style.paddingBottom = '0px';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    body.style.height = targetH;
    body.style.paddingTop = targetPT;
    body.style.paddingBottom = targetPB;
  }));
  const onEnd = (e) => {
    if (e.propertyName !== 'height') return;
    body.removeEventListener('transitionend', onEnd);
    clearBodyStyles(body);
  };
  body.addEventListener('transitionend', onEnd);
};

allDetails.forEach((det) => {
  det.querySelector('summary').addEventListener('click', (e) => {
    e.preventDefault();
    if (det.open) {
      closeDetail(det);
    } else {
      allDetails.forEach((other) => { if (other !== det && other.open) closeDetail(other); });
      openDetail(det);
    }
  });
});

// Video Modal
const videoModal  = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoModalPlayer');

if (videoModal && videoPlayer) {
  const openVideoModal = (src) => {
    videoPlayer.src = src;
    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    videoPlayer.play().catch(() => {});
  };

  const closeVideoModal = () => {
    videoPlayer.pause();
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { videoPlayer.src = ''; }, 300);
  };

  videoModal.querySelector('.video-modal-overlay').addEventListener('click', closeVideoModal);
  videoModal.querySelector('.video-modal-close').addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('is-open')) closeVideoModal();
  });

  document.querySelectorAll('[data-video-src]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal(btn.dataset.videoSrc);
    });
  });
}

// ── Language switching ────────────────────────────────────────────────────────

const applyLang = (lang) => {
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('dir', lang === 'fr' ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'fa');
  localStorage.setItem('vida-lang', lang);
};

const initLang = async () => {
  // 1. Check saved user preference
  const saved = localStorage.getItem('vida-lang');
  if (saved) { applyLang(saved); return; }

  // 2. Try IP geolocation
  try {
    const res = await fetch('https://ipapi.co/country/', { signal: AbortSignal.timeout(3000) });
    const country = (await res.text()).trim();
    if (country === 'FR') { applyLang('fr'); return; }
  } catch (_) {}

  // 3. Fall back to browser language
  if (navigator.language?.startsWith('fr')) { applyLang('fr'); }
};

initLang();

// Toggle button
document.getElementById('langToggle')?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-lang') || 'fa';
  applyLang(current === 'fa' ? 'fr' : 'fa');
});

// ── Google Analytics event tracking ──────────────────────────────────────────

const gaEvent = (name, params) => {
  if (typeof gtag === 'function') gtag('event', name, params);
};

// PDF downloads
document.querySelectorAll('a[href$=".pdf"]').forEach((a) => {
  a.addEventListener('click', () => {
    const file = a.getAttribute('href').split('/').pop();
    gaEvent('file_download', { file_name: file, file_extension: 'pdf', link_url: a.href });
  });
});

// SoundCloud clicks
document.querySelectorAll('a[href*="soundcloud.com"]').forEach((a) => {
  a.addEventListener('click', () => {
    gaEvent('audio_play', { content_type: 'soundcloud', link_url: a.href });
  });
});

// Video modal plays (Ashkan Noroozkhani)
document.querySelectorAll('[data-video-src]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const src = btn.dataset.videoSrc.split('/').pop();
    gaEvent('video_play', { content_type: 'modal', video_title: src });
  });
});

// Ramin Vimeo click
document.querySelectorAll('[data-vimeo-id]').forEach((tile) => {
  tile.querySelector('.video-thumb')?.addEventListener('click', () => {
    const id = tile.dataset.vimeoId;
    const external = !!tile.dataset.vimeoExternal;
    gaEvent('video_play', { content_type: external ? 'vimeo_external' : 'vimeo_embed', video_id: id });
  });
});

// Interview external links (مطالعه متن / شنیدن صوت / دیدن ویدیو)
document.querySelectorAll('.iv-actions a[href]').forEach((a) => {
  a.addEventListener('click', () => {
    const title = a.closest('details')?.querySelector('.iv-title')?.textContent?.trim();
    gaEvent('interview_click', { link_url: a.href, interview_title: title });
  });
});

// Book page opens
document.querySelectorAll('.book-card a[href]').forEach((a) => {
  a.addEventListener('click', () => {
    const book = a.getAttribute('href').replace('.html', '');
    gaEvent('book_open', { book_id: book });
  });
});

})();
