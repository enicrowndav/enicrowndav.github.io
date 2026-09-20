const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

const closeMenu = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menu?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 })
  : null;
document.querySelectorAll('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('is-visible'));

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImage = dialog?.querySelector('img');
document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
  if (!dialog || !dialogImage) return;
  dialogImage.src = button.dataset.lightbox;
  dialogImage.alt = button.querySelector('img')?.alt || 'Facility image';
  dialog.showModal();
}));
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

const form = document.querySelector('[data-appointment-form]');
const formStatus = document.querySelector('[data-form-status]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  form.querySelectorAll('.field').forEach((field) => field.classList.remove('has-error'));
  if (!form.checkValidity()) {
    form.querySelectorAll(':invalid').forEach((control) => control.closest('.field')?.classList.add('has-error'));
    form.querySelector(':invalid')?.focus();
    if (formStatus) formStatus.textContent = 'Please complete the highlighted fields.';
    return;
  }
  const data = new FormData(form);
  const request = [
    `Appointment request for ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email') || 'Not supplied'}`,
    `Service: ${data.get('service')}`,
    `Message: ${data.get('message') || 'No additional message'}`
  ].join('\n');
  navigator.clipboard?.writeText(request).catch(() => {});
  if (formStatus) formStatus.textContent = 'Your request has been prepared and copied. The hospital’s contact channel must be added before this website goes live.';
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
