/**
 * @param {string} email
 */
export function initContactForm(email) {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement)) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('from_name') || '').trim();
    const from = String(data.get('email_id') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (name.length < 2 || !from.includes('@') || message.length < 10) {
      status.textContent = 'Please fill in a name, a valid email, and a short message.';
      return;
    }
    status.textContent = 'Opening your mail client...';
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n${from}`);
    globalThis.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    globalThis.setTimeout(() => {
      status.textContent = 'If nothing opened, email me directly at ' + email;
    }, 1200);
  });
}
