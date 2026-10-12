'use client';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import OpeningNumberScene from '@/components/narrative/OpeningNumberScene';
import LivingCrowdScene from '@/components/narrative/LivingCrowdScene';
import DeclarationScene from '@/components/narrative/DeclarationScene';
import LivingStatsScene from '@/components/narrative/LivingStatsScene';
import ArchivistLetterScene from '@/components/narrative/ArchivistLetterScene';
import QuietFinaleScene from '@/components/narrative/QuietFinaleScene';
import RecordDialog from '@/components/archive/RecordDialog';
import { useScrollStory } from '@/lib/useScrollStory';
import { useMemorialData } from '@/lib/useMemorialData';
const HumanParticleCanvas = dynamic(() => import('@/components/particles/HumanParticleCanvas'), { ssr: false });
export default function Home() {
  useScrollStory();
  useMemorialData();
  return <>
    <a className="skip-link" href="#stats">انتقل إلى الإحصاء التوثيقي</a>
    <HumanParticleCanvas /><Navbar />
    <main id="main-content">
      <OpeningNumberScene />
      <LivingCrowdScene />
      <DeclarationScene />
      <LivingStatsScene />
      <ArchivistLetterScene />
      <QuietFinaleScene />
    </main>
    <RecordDialog />
  </>;
}
