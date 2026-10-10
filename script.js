const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('is-open');
    }
  });
}

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => {
    item.classList.add('will-reveal');
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  const EMAILJS_PUBLIC_KEY = 'JAEPMxwER5ygiNpP5';
  const EMAILJS_SERVICE_ID = 'service_1xhr9aw';
  const EMAILJS_TEMPLATE_ID = 'template_7ol1lgc';
  const successMessage = document.querySelector('#form-success');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const serviceField = contactForm.elements.service;
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get('service');
  const emailJsConfigured = [EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID]
    .every((value) => value && !value.startsWith('YOUR_'));

  if (emailJsConfigured && window.emailjs) {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  if (requestedService) {
    const matchingOption = Array.from(serviceField.options).find((option) =>
      option.text.toLowerCase().includes(requestedService.toLowerCase())
    );
    if (matchingOption) serviceField.value = matchingOption.value || matchingOption.text;
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    successMessage.hidden = true;
    successMessage.classList.remove('is-error');

    const fields = Array.from(contactForm.querySelectorAll('input, select, textarea'));
    let firstInvalidField;

    fields.forEach((field) => {
      const error = field.parentElement.querySelector('.field-error');
      field.removeAttribute('aria-invalid');
      error.textContent = '';

      if (!field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        error.textContent = field.validity.valueMissing
          ? 'Please complete this field.'
          : field.validity.typeMismatch
            ? 'Enter a valid email address.'
            : `Please enter at least ${field.minLength} characters.`;
        firstInvalidField ||= field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    if (!emailJsConfigured) {
      successMessage.textContent = 'EmailJS is not configured. Add your public key, service ID, and template ID in script.js.';
      successMessage.classList.add('is-error');
      successMessage.hidden = false;
      return;
    }

    if (!window.emailjs) {
      successMessage.textContent = 'EmailJS could not load. Check your internet connection and try again.';
      successMessage.classList.add('is-error');
      successMessage.hidden = false;
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');

    try {
      await window.emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);
      successMessage.textContent = 'Thanks for reaching out. Your message has been sent.';
      successMessage.hidden = false;
      contactForm.reset();
    } catch (error) {
      console.error('EmailJS could not send the contact form.', error);
      successMessage.textContent = 'Your message could not be sent. Please email nithinvs4554@gmail.com directly.';
      successMessage.classList.add('is-error');
      successMessage.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });

  contactForm.addEventListener('input', (event) => {
    const field = event.target;
    if (!field.matches('input, select, textarea')) return;
    const error = field.parentElement.querySelector('.field-error');
    if (field.checkValidity()) {
      field.removeAttribute('aria-invalid');
      error.textContent = '';
    }
  });
}