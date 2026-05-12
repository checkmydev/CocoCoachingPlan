document.addEventListener('DOMContentLoaded', () => {
  const nav       = document.querySelector('.nav');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('nav-overlay');
  const closeBtn  = document.getElementById('nav-overlay-close');

  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__overlay a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  const closeOverlay = () => {
    overlay?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    overlay?.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  closeBtn?.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });
  overlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeOverlay));
});
