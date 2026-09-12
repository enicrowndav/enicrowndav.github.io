/* Progressive enhancement: profile, projects and publications remain readable without JavaScript. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const config = window.PORTFOLIO_CONFIG || {
    email: 'eniadetreasure@gmail.com',
    cvPath: ''
  };
  const email = config.email;
  const emailLink = document.querySelector('.contact-email');
  if (emailLink) {
    emailLink.href = `mailto:${email}`;
    emailLink.firstChild.textContent = `${email} `;
  }
  document.querySelector('.dialog-email').textContent = email;
  document.querySelector('#copyright-year').textContent = new Date().getFullYear();
  if (config.cvPath) {
    const cv = document.querySelector('.cv-link');
    cv.href = config.cvPath;
    cv.download = '';
    cv.hidden = false;
  }

  const menu = document.querySelector('#main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  function closeMenu() {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 941px)').addEventListener('change', closeMenu);
  if ('IntersectionObserver' in window) {
    const navLinks = [...menu.querySelectorAll('a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('.section-anchor').forEach(section => observer.observe(section));
  }

  const publications = [...document.querySelectorAll('.publication')];
  const filters = [...document.querySelectorAll('.filter')];
  document.querySelector('.research-controls').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    const topic = button.dataset.filter;
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    publications.forEach(publication => {
      const visible = topic === 'all' || publication.dataset.topics.split(' ').includes(topic);
      publication.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector('#publication-count').textContent = `${count} selected publication${count === 1 ? '' : 's'}`;
  }));

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* Continue to the local-file/permission fallback. */ }
    const active = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('aria-label', 'Text to copy');
    field.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
    (document.querySelector('dialog[open]') || document.body).append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    active?.focus({ preventScroll: true });
    return copied;
  }
  const copyEmail = document.querySelector('.copy-email');
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    const copied = await copyText(email);
    document.querySelector('.copy-status').textContent = copied ? 'Email address copied.' : `Please select and copy: ${email}`;
  });

  const form = document.querySelector('#enquiry-form');
  const dialog = document.querySelector('#enquiry-dialog');
  const preview = document.querySelector('#enquiry-preview');
  const status = document.querySelector('#enquiry-status');
  if (typeof dialog.showModal === 'function') form.hidden = false;
  document.querySelectorAll('.service-cta').forEach(link => {
    link.addEventListener('click', () => {
      form.elements.interest.value = link.dataset.interest;
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const message = String(data.get('message')).trim();
    // Native required validation accepts whitespace; reject it before preparing the email.
    for (const [fieldName, value] of [['name', name], ['message', message]]) {
      const field = form.elements[fieldName];
      field.setCustomValidity(value ? '' : 'Please enter a little more detail.');
      if (!value) { field.reportValidity(); return; }
    }
    const subject = `Project enquiry: ${data.get('interest')}`;
    const body = `Hello Olanrewaju,\n\nI would like to discuss ${String(data.get('interest')).toLowerCase()}.\n\nName: ${name}\nEmail: ${String(data.get('email')).trim()}\nPreferred timeline: ${data.get('timeline')}\n\nAbout my project:\n${message}\n\nBest wishes,\n${name}`;
    preview.value = `To: ${email}\nSubject: ${subject}\n\n${body}`;
    document.querySelector('#open-email').href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = '';
    dialog.showModal();
  });
  form.addEventListener('input', event => event.target.setCustomValidity?.(''));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    const copied = await copyText(preview.value);
    status.textContent = copied ? 'Enquiry copied. Paste it into your email service to send.' : 'Copy was unavailable. Select the message above and copy it manually.';
    if (!copied) { preview.focus(); preview.select(); }
  });
  document.querySelector('#open-email').addEventListener('click', () => {
    status.textContent = 'Finish sending in your email app. If it does not open, use Copy enquiry.';
  });
})();
