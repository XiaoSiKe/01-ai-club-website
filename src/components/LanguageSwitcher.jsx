import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../Language';
import { LOCALES } from '../i18n/translate';
import SpecularButton from '../SpecularButton';

const LANGUAGE_DETAILS = {
  'zh-Hans': { symbol: '简', description: 'Simplified Chinese' },
  'zh-Hant': { symbol: '繁', description: 'Traditional Chinese' },
  en: { symbol: 'En' },
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const id = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const optionsRef = useRef([]);
  const openingIndex = useRef(0);
  const [open, setOpen] = useState(false);
  const [keyboardOpening, setKeyboardOpening] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 232 });
  const selectedIndex = LOCALES.findIndex(item => item.id === locale);
  const trigger = () => rootRef.current?.querySelector('button');
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger()?.focus({ preventScroll: true });
  };
  const show = (index = selectedIndex, keyboard = false) => {
    openingIndex.current = index;
    setKeyboardOpening(keyboard);
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    const placeMenu = () => {
      const button = trigger();
      if (!button) return;
      const rect = button.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) { setOpen(false); return; }
      const width = Math.min(232, window.innerWidth - 24);
      const height = menuRef.current?.offsetHeight || 208;
      setPosition({
        left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
        top: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - height - 12)),
        width,
      });
    };
    placeMenu();
    optionsRef.current[openingIndex.current]?.focus({ preventScroll: true });
    window.addEventListener('resize', placeMenu);
    window.addEventListener('scroll', placeMenu, true);
    return () => {
      window.removeEventListener('resize', placeMenu);
      window.removeEventListener('scroll', placeMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const dismissOutside = event => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
    };
  }, [open]);

  const handleMenuKeyDown = event => {
    const index = optionsRef.current.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % LOCALES.length;
    if (event.key === 'ArrowUp') next = (index - 1 + LOCALES.length) % LOCALES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = LOCALES.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      optionsRef.current[next]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === 'Tab') {
      // Continue the page's tab order from the trigger, rather than the portal.
      close(true);
    }
  };

  return <div ref={rootRef} className="language-switcher">
    <SpecularButton size="sm" className="language-switcher__trigger" id={`${id}-trigger`}
      ariaLabel={`${t('切换语言')} · ${LOCALES[selectedIndex].label}`}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined}
      data-keyboard={keyboardOpening || undefined}
      onClick={event => open ? close() : show(selectedIndex, event.detail === 0)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          show(event.key === 'ArrowUp' ? LOCALES.length - 1 : 0, true);
        }
      }}>
      <svg className="language-switcher__globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" />
      </svg>
      <span lang={locale}>{LOCALES[selectedIndex].label}</span>
      <svg className="language-switcher__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
    </SpecularButton>
    {open && createPortal(
      <div ref={menuRef} className="language-menu" id={`${id}-menu`} role="menu" aria-labelledby={`${id}-trigger`}
        data-keyboard={keyboardOpening || undefined} style={position} onKeyDown={handleMenuKeyDown}>
        <div className="language-menu__heading" aria-hidden="true">{t('切换语言')}</div>
        {LOCALES.map((item, index) => <button ref={node => { optionsRef.current[index] = node; }} key={item.id}
          className="language-menu__option" type="button" role="menuitemradio" aria-checked={locale === item.id}
          tabIndex={-1} onClick={() => { setLocale(item.id); close(true); }}>
          <span className="language-menu__symbol" aria-hidden="true">{LANGUAGE_DETAILS[item.id].symbol}</span>
          <span className="language-menu__copy"><span lang={item.id}>{item.label}</span>{LANGUAGE_DETAILS[item.id].description && <span lang="en">{LANGUAGE_DETAILS[item.id].description}</span>}</span>
          <svg className="language-menu__check" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>
        </button>)}
      </div>, document.body,
    )}
  </div>;
}
