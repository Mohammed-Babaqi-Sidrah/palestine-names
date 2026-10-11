'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import OpeningNumberScene from '@/components/narrative/OpeningNumberScene';
import LivingCrowdScene from '@/components/narrative/LivingCrowdScene';
import DeclarationScene from '@/components/narrative/DeclarationScene';
import LivingArchiveScene from '@/components/narrative/LivingArchiveScene';
import LivingStatsScene from '@/components/narrative/LivingStatsScene';
import ArchivistLetterScene from '@/components/narrative/ArchivistLetterScene';
import QuietFinaleScene from '@/components/narrative/QuietFinaleScene';
import RecordDialog from '@/components/archive/RecordDialog';
import { useScrollStory } from '@/lib/useScrollStory';
import { useParticleStore } from '@/lib/particleStore';
import { api } from '@/lib/api';
const HumanParticleCanvas = dynamic(() => import('@/components/particles/HumanParticleCanvas'), { ssr: false });
export default function Home() {
  useScrollStory();
  useEffect(() => {
    let alive = true;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      let preference: string | null = null;
      try { preference = localStorage.getItem('memorial-motion-paused'); } catch { /* OS preference remains usable. */ }
      useParticleStore.setState({ reducedMotion: preference === null ? media.matches : preference === 'true' });
    };
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
  return <>
    <a className="skip-link" href="#archive">انتقل إلى البحث في الأسماء</a>
    <HumanParticleCanvas /><Navbar />
    <main id="main-content">
      <OpeningNumberScene />
      <LivingCrowdScene />
      <DeclarationScene />
      <LivingStatsScene />
      <LivingArchiveScene />
      <ArchivistLetterScene />
      <QuietFinaleScene />
    </main>
    <RecordDialog />
  </>;
}
