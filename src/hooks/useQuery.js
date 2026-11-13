import { useCallback, useEffect, useRef, useState } from 'react';

// Loads data; reloads when deps change or after any save (rebuild:data event).
export function useQuery(fn, deps = []) {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  const seq = useRef(0);
  const run = useCallback(async () => {
    const my = ++seq.current;
    try { const data = await fn(); if (my === seq.current) setS({ data, loading: false, error: null }); }
    catch (e) { if (my === seq.current) setS((p) => ({ ...p, loading: false, error: e.message })); }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setS({ data: null, loading: true, error: null }); run(); }, [run]);
  useEffect(() => {
    const h = () => run();
    window.addEventListener('rebuild:data', h);
    return () => window.removeEventListener('rebuild:data', h);
  }, [run]);
  return { ...s, reload: run };
}
