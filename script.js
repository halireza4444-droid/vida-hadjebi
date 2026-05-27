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
document.querySelectorAll('[data-vimeo-id]').forEach((tile) => {
  const button = tile.querySelector('.video-thumb');
  button?.addEventListener('click', () => {
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

// Interviews accordion — only one <details> open at a time
const allDetails = document.querySelectorAll('.interviews-list details');
allDetails.forEach((det) => {
  det.addEventListener('toggle', () => {
    if (det.open) {
      allDetails.forEach((other) => { if (other !== det) other.removeAttribute('open'); });
    }
  });
});

})();
