/** Contact page validation for BiteCraft demo. */
(function () {
  'use strict';
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

      if (!name || !email || !subject || !message) {
        status.textContent = 'Please fill in all required fields.';
        status.className = 'newsletter-status error';
        return;
      }
      if (!emailRegex.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'newsletter-status error';
        return;
      }

      status.textContent = 'Demo message submitted successfully. No message was sent to a real inbox.';
      status.className = 'newsletter-status success';
      form.reset();
      if (window.BiteCraft) BiteCraft.showToast('Demo contact form submitted', 'success');
    });
  }
  document.addEventListener('DOMContentLoaded', initContactForm);
})();
