import english from './en.json' with { type: 'json' };
import traditional from './zh-Hant.json' with { type: 'json' };

export const LOCALE_STORAGE_KEY = '01ai-locale';
export const LOCALES = [
  { id: 'zh-Hans', label: '简体中文' },
  { id: 'zh-Hant', label: '繁體中文' },
  { id: 'en', label: 'English' },
];

export function normalizeLocale(value) {
  if (typeof value !== 'string') return null;
  const locale = value.toLowerCase();
  if (['zh-hans', 'zh-cn', 'zh-sg'].includes(locale)) return 'zh-Hans';
  if (['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'].includes(locale)) return 'zh-Hant';
  if (locale === 'en' || locale.startsWith('en-')) return 'en';
  return null;
}

export function initialLocale() {
  const requested = normalizeLocale(new URLSearchParams(window.location.search).get('lang'));
  if (requested) return requested;
  try { return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY)) || 'zh-Hans'; }
  catch { return 'zh-Hans'; }
}

export function createTranslator(locale) {
  const dictionary = locale === 'en' ? english : locale === 'zh-Hant' ? traditional : null;
  const translate = (value, parameters = []) => {
    if (typeof value !== 'string') return value;
    const key = value.trim();
    const message = dictionary && Object.hasOwn(dictionary, key) ? value.replace(key, () => dictionary[key]) : value;
    return message.replace(/\{(\d+)\}/g, (token, index) => parameters[index] === undefined ? token : String(translate(parameters[index])));
  };
  return translate;
}

// Search keeps matching when the visitor changes the display language.
export function localizedSearchText(value = '') {
  return [value, ...[english, traditional].map(messages => Object.hasOwn(messages, value) ? messages[value] : '')].join(' ');
}
