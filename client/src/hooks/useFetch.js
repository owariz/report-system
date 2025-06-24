import { useState, useEffect } from 'react';

export default function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchFn()
      .then(res => setData(res))
      .catch(setError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, deps);

  return { data, loading, error };
} 