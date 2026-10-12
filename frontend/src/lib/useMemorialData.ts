'use client';
import { useEffect } from 'react';
import { api } from './api';
import { useParticleStore } from './particleStore';

export function useMemorialData() {
  useEffect(() => {
    let alive = true;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => useParticleStore.setState({ reducedMotion: media.matches });
    update();
    media.addEventListener('change', update);
    const controller = new AbortController();
    const load = () => api.getMemorial(controller.signal).then(({ records, statistics, dataset }) => {
      if (alive) useParticleStore.setState({ total: statistics.total, records, statistics, dataset, dataStatus: 'ready' });
    }).catch(() => { if (alive && !useParticleStore.getState().statistics) useParticleStore.setState({ dataStatus: 'error' }); });
    void load();
    const timer = setInterval(() => { if (!document.hidden) void load(); }, 5 * 60 * 1000);
    return () => { alive = false; controller.abort(); clearInterval(timer); media.removeEventListener('change', update); };
  }, []);
}
