'use client';
import Navbar from '@/components/Navbar';
import LivingArchiveScene from '@/components/narrative/LivingArchiveScene';
import RecordDialog from '@/components/archive/RecordDialog';
import { useMemorialData } from '@/lib/useMemorialData';

export default function ArchivePage() {
  useMemorialData();
  return <>
    <a className="skip-link" href="#archive-title">انتقل إلى البحث في الأسماء</a>
    <Navbar storyPath="/" />
    <main className="archive-route"><LivingArchiveScene /></main>
    <RecordDialog />
  </>;
}
