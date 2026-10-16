import { useCallback, useEffect, useState } from 'react';
import { repo } from './index';
import type { Spot } from '../types';

/** Live list of spots that re-fetches whenever the repository changes. */
export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await repo.list();
    setSpots(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    return repo.subscribe(load);
  }, [load]);

  return { spots, loading, reload: load };
}
