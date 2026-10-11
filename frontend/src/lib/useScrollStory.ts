'use client';
import { useEffect } from 'react';
import { useParticleStore, type SceneMode } from './particleStore';
export const CHAPTERS: { id: string; label: string; mode: SceneMode }[] = [
  { id: 'number', label: 'البداية', mode: 'number' },
  { id: 'crowd', label: 'خارطة الذاكرة', mode: 'scatter' },
  { id: 'declaration', label: 'اسم واحد', mode: 'names' },
  { id: 'stats', label: 'شجرة الذاكرة', mode: 'stats' },
  { id: 'archive', label: 'الأسماء', mode: 'archive' },
  { id: 'archivist', label: 'حارس الأرشيف', mode: 'archivist' },
  { id: 'finale', label: 'ما يبقى', mode: 'finale' },
];

export function useScrollStory() {
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const vh = window.innerHeight;
      let active = CHAPTERS[0];
      for (const chapter of CHAPTERS) {
        const rect = document.getElementById(chapter.id)?.getBoundingClientRect();
        if (rect && rect.top <= vh * .4) active = chapter;
      }
      const section = document.getElementById(active.id);
      const rect = section?.getBoundingClientRect();
      const stage = section?.querySelector('[data-particle-stage]')?.getBoundingClientRect();
      const progress = rect ? Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - vh * .3))) : 0;
      const height = Math.max(1, document.documentElement.scrollHeight - vh);
      useParticleStore.setState({
        mode: active.mode, chapterProgress: progress,
        scrollProgress: Math.max(0, Math.min(1, window.scrollY / height)),
        stageWidth: stage?.width || 0, stageHeight: stage?.height || 0,
        stageX: stage ? stage.left + stage.width / 2 : window.innerWidth / 2,
        stageY: stage ? stage.top + stage.height / 2 : vh / 2,
        stageVisible: Boolean(stage && stage.bottom > 88 && stage.top < vh),
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    void document.fonts.ready.then(schedule);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, []);
}
