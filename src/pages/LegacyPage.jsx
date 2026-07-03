import { useEffect, useMemo, useRef } from 'react';
import { translateLegacyHtml } from '../i18n/legacyTranslations.js';
import { useLanguage } from '../state/LanguageContext.jsx';

function rewriteInternalLinks(html) {
  return html
    .replace(/href="\.\/index\.html"/g, 'href="#/"')
    .replace(/href="\.\/about\.html"/g, 'href="#/about"')
    .replace(/href="\.\/activities\.html"/g, 'href="#/activities"')
    .replace(/href="\.\/poli-statements\.html"/g, 'href="#/statements"')
    .replace(/href="\.\/payments\.html"/g, 'href="#/payments"')
    .replace(/href="\.\/contact\.html"/g, 'href="#/contact"')
    .replace(/href="\.\/donate\.html"/g, 'href="#/donate"')
    .replace(/href="\.\/region\.html"/g, 'href="#/region"')
    .replace(/href="\.\/poli\.html"/g, 'href="#/poli"');
}

function toggleDisclosure(trigger) {
  const targetId = trigger.getAttribute('data-toggle');
  if (!targetId) return;
  const box = document.getElementById(targetId);
  if (!box) return;
  const nextOpen = !box.classList.contains('is-open');
  box.classList.toggle('is-open', nextOpen);
  box.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
  trigger.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
}

export function LegacyPage({ html, pageKey }) {
  const { language } = useLanguage();
  const rootRef = useRef(null);
  const rewrittenHtml = useMemo(() => rewriteInternalLinks(html), [html]);
  const translatedHtml = useMemo(
    () => translateLegacyHtml(rewrittenHtml, language),
    [rewrittenHtml, language]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const onClick = (event) => {
      const trigger = event.target.closest('[data-toggle]');
      if (!trigger || !root.contains(trigger)) return;
      if (trigger.tagName === 'A') event.preventDefault();
      toggleDisclosure(trigger);
    };

    const onKeyDown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const trigger = event.target.closest('[data-toggle]');
      if (!trigger || !root.contains(trigger)) return;
      event.preventDefault();
      toggleDisclosure(trigger);
    };

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [pageKey, language]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const track = root.querySelector('[data-slide-track]');
    if (!track) return undefined;
    const slides = Array.from(track.children);
    if (slides.length <= 1) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, 4500);

    return () => window.clearInterval(timer);
  }, [pageKey, language]);



  return (
    <div
      ref={rootRef}
      className={`legacy-page legacy-page-${pageKey}`}
      dangerouslySetInnerHTML={{ __html: translatedHtml }}
    />
  );
}
