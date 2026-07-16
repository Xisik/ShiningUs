import { useEffect, useState } from 'react';

const htmlRouteMap = {
  '': '/',
  'index.html': '/',
  'about.html': '/about',
  'activities.html': '/activities',
  'poli-statements.html': '/statements',
  'payments.html': '/payments',
  'contact.html': '/contact',
  'donate.html': '/donate',
  'organization.html': '/organization',
  'region.html': '/region'
};

function normalizeHash(hash) {
  const raw = (hash || '').replace(/^#/, '').trim();
  if (!raw || raw === '/') return '/';
  const withoutQuery = raw.split('?')[0].split('&')[0].replace(/^\/+/, '');
  if (htmlRouteMap[withoutQuery]) return htmlRouteMap[withoutQuery];
  return `/${withoutQuery}`.replace(/\/+$/, '') || '/';
}

function parseRoute() {
  const normalized = normalizeHash(window.location.hash);
  const parts = normalized.split('/').filter(Boolean);

  if (parts[0] === 'activities') {
    return { path: '/activities', params: { slug: parts[1] || null } };
  }
  if (parts[0] === 'statements') {
    return { path: '/statements', params: { slug: parts[1] || null } };
  }
  if (!parts.length) return { path: '/', params: {} };
  return { path: `/${parts[0]}`, params: {} };
}

export function toHash(path) {
  return `#${path}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
