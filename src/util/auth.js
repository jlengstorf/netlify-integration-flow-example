import { v4 as uuid } from 'uuid';

export function generateCsrfToken() {
  return uuid();
}

function parseHash(hash) {
  if (!hash) return {};

  const querystring = hash.replace(/^#/, '');
  return Object.fromEntries(new URLSearchParams(querystring).entries());
}

function removeHash() {
  window.history.pushState(
    '',
    document.title,
    window.location.pathname + window.location.search,
  );
}

export function validateHash(hash) {
  const response = parseHash(hash);

  // protect against CSRF by checking the CSRF token
  // for details, see https://owasp.org/www-community/attacks/csrf
  if (response.token && !localStorage.getItem(response.csrf)) {
    throw new Error('Invalid token. Please retry logging in.');
  }

  // if we get here, the CSRF is valid and we can clean up after ourselves
  localStorage.removeItem(response.csrf);

  // remove the hash from the URL so no one accidentally copy-pastes it
  removeHash();

  return response;
}
