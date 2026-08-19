import { useEffect, useState } from 'react';

export function useJsonResource(url, cacheKey, normalize) {
  const [state, setState] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return { status: 'success', data: normalize(JSON.parse(cached)), error: null, cached: true };
      }
    } catch {
      // Ignore unavailable or invalid cache.
    }
    return { status: 'loading', data: null, error: null, cached: false };
  });

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: current.data ? 'success' : 'loading' }));

    fetch(url, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(payload));
        } catch {
          // Ignore unavailable storage.
        }
        if (!cancelled) {
          setState({ status: 'success', data: normalize(payload), error: null, cached: false });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState((current) => ({
            status: current.data ? 'success' : 'error',
            data: current.data,
            error,
            cached: Boolean(current.data)
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, cacheKey, normalize]);

  return state;
}
