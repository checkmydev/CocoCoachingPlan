const SUPPORTED_LANGS = ['fr', 'en', 'es'];
let _t = {};

async function loadLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'fr';
  try {
    const res = await fetch(`/i18n/${lang}.json`);
    _t = await res.json();
  } catch (e) {
    console.error(`Failed to load i18n/${lang}.json`, e);
    return;
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = _get(_t, el.dataset.i18n);
    if (val != null) el.textContent = val;
  });
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function _get(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function t(key) {
  const val = _get(_t, key);
  return val !== undefined ? val : key;
}

document.addEventListener('DOMContentLoaded', () => {
  const saved   = localStorage.getItem('lang');
  const browser = (navigator.language || '').slice(0, 2);
  const lang    = SUPPORTED_LANGS.includes(saved)   ? saved
                : SUPPORTED_LANGS.includes(browser) ? browser : 'fr';
  loadLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => loadLang(btn.dataset.lang));
  });
});
