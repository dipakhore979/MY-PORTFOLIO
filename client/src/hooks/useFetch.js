import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';

/**
 * Runs `fetcher(signal)` on mount and whenever `deps` change.
 * Returns { data, loading, error, status, refetch }.
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null, status: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null, status: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null, status: 200 }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState({
          data: null,
          loading: false,
          error: getErrorMessage(err),
          status: err?.response?.status ?? 0,
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, refetch };
}
