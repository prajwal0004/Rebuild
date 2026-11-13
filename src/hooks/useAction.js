import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

// Runs a save with duplicate-submit protection and toasts. Resolves true on success.
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (fn, successMsg) => {
    if (busy) return false;
    setBusy(true);
    try { await fn(); if (successMsg) toast.success(successMsg); return true; }
    catch (e) { toast.error(e.message || 'Something went wrong. Please try again.'); return false; }
    finally { setBusy(false); }
  };
  return { busy, run };
}
