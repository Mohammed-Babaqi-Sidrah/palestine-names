'use client';
import { useEffect } from 'react';
import { useParticleStore, type SceneMode } from './particleStore';
export const CHAPTERS: { id: string; label: string; mode: SceneMode }[] = [
  { id: 'number', label: 'البداية', mode: 'number' },
  { id: 'crowd', label: 'خارطة الذاكرة', mode: 'scatter' },
  { id: 'declaration', label: 'اسم واحد', mode: 'names' },
  { id: 'stats', label: 'شجرة الذاكرة', mode: 'stats' },
  { id: 'archivist', label: 'حارس الأرشيف', mode: 'archivist' },
  { id: 'finale', label: 'ما يبقى', mode: 'finale' },
];

export function useScrollStory() {
  useEffect(() => {
    let frame = 0;
    let disposed = false;
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
      // The souls stay suspended in the viewport while chapters scroll behind them.
      const vw = window.innerWidth;
      const mobile = vw < 760;
      let x = .5, y = .5, width = 1, height = .8, visible = true;
      if (active.mode === 'scatter') {
        x = mobile ? .5 : .37; y = .53; width = mobile ? .9 : .58; height = .84;
      } else if (active.mode === 'stats') {
        x = mobile ? .5 : .27; y = .53; width = mobile ? .9 : .55; height = .88;
      } else if (active.mode === 'finale') {
        // Original main-branch centre: calligraphy stands behind the closing prose.
        y = mobile ? .54 : .51; height = .5;
        const footer = section?.querySelector('.archive-colophon')?.getBoundingClientRect();
        if (footer) {
          const halfCalligraphy = vw * (mobile ? 1.05 : .88) * .375 / 2;
          y = Math.min(y, (footer.top-halfCalligraphy-24)/vh);
          const mastheadBottom = document.querySelector('header.masthead')?.getBoundingClientRect().bottom || 0;
          visible = footer.top > mastheadBottom+24;
        }
      }
      const progress = rect ? Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - vh * .3))) : 0;
      const scrollHeight = Math.max(1, document.documentElement.scrollHeight - vh);
      useParticleStore.setState({
        mode: active.mode, chapterProgress: progress,
        scrollProgress: Math.max(0, Math.min(1, window.scrollY / scrollHeight)),
        scrollY: window.scrollY,
        stageWidth: vw * width, stageHeight: vh * height,
        stageX: vw * x, stageY: vh * y,
        stageVisible: visible,
      });
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(sync); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    void document.fonts.ready.then(schedule);
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, []);
}
