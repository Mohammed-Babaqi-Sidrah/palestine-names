'use client';
import { useEffect, useRef, useState } from 'react';
import { useParticleStore } from '@/lib/particleStore';
import { CHAPTERS } from '@/lib/useScrollStory';
import styles from './Navbar.module.css';
export default function Navbar({ storyPath = '' }: { storyPath?: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const mode = useParticleStore(s => s.mode);
  const progress = useParticleStore(s => s.scrollProgress);
  const chapter = CHAPTERS.find(c => c.mode === mode) || CHAPTERS[0];
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !toggle.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <>
    <header className={`masthead ${styles.masthead}`}>
      <a className="wordmark" href={storyPath + '#number'} aria-label="أسماء لا تُنسى — البداية"><span className="memory-mark" aria-hidden="true">ا</span><span>أسماء <strong>لا تُنسى</strong><small lang="en" dir="ltr">NAMES, NOT NUMBERS</small></span></a>
      <p className={styles.remembrance}>هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.</p>
      <div className="header-actions"><button ref={toggle} className="index-toggle" aria-expanded={open} aria-controls="chapter-index" onClick={() => setOpen(!open)}>الفهرس <span aria-hidden="true">{open ? '−' : '+'}</span></button></div>
      <span className="header-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    </header>
    {open && <nav ref={menu} id="chapter-index" className={`chapter-index ${styles.chapterIndex}`} aria-label="فصول الحكاية">
      <p className="index-heading">من أرقام إلى أسماء <span>ستة فصول للذاكرة</span></p>
      {CHAPTERS.map((c, i) => <a href={storyPath + '#' + c.id} key={c.id} aria-current={chapter.id === c.id ? 'location' : undefined} onClick={() => setOpen(false)}><span>{c.label}</span><bdi>{String(i + 1).padStart(2, '0')}</bdi></a>)}
    </nav>}
    <aside className="reading-rail" aria-label="الفصل الحالي"><span className="rail-line"><i style={{ transform: 'scaleY(' + progress + ')' }} /></span><span className="rail-label">{chapter.label}</span><span className="folio" dir="ltr">{String(CHAPTERS.indexOf(chapter) + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span></aside>
  </>;
}
