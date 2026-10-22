(() => {
  const hint = document.querySelector('.project-scroll-hint');
  const mobile = window.matchMedia('(max-width: 767px)');
  const firstPhoto = document.querySelector('.gallery img');
  if (!hint || !mobile.matches || window.scrollY > 20 || !firstPhoto ||
      firstPhoto.getBoundingClientRect().top < window.innerHeight) return;

  hint.hidden = false;
  let timer;
  const dismiss = () => {
    hint.classList.add('is-dismissed');
    window.clearTimeout(timer);
    window.removeEventListener('scroll', dismiss);
    mobile.removeEventListener('change', dismiss);
    window.setTimeout(() => { hint.hidden = true; }, 220);
  };
  window.addEventListener('scroll', dismiss, { passive: true, once: true });
  mobile.addEventListener('change', dismiss, { once: true });
  timer = window.setTimeout(dismiss, 5000);
})();
