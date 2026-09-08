import { useEffect, useState } from "react";

export function useFetch<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    loader().then((value) => active && setData(value)).catch((reason) => active && setError(reason.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error, loading };
}
