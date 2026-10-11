'use client';
import { useEffect, useRef, useState } from 'react';
import { useParticleStore } from '@/lib/particleStore';
import { CHAPTERS } from '@/lib/useScrollStory';
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const mode = useParticleStore(s => s.mode);
  const progress = useParticleStore(s => s.scrollProgress);
  const reduced = useParticleStore(s => s.reducedMotion);
  const chapter = CHAPTERS.find(c => c.mode === mode) || CHAPTERS[0];
  const toggleMotion = () => {
    useParticleStore.setState({ reducedMotion: !reduced });
    try { localStorage.setItem('memorial-motion-paused', String(!reduced)); } catch { /* Pause still works for this visit. */ }
  };
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
    <header className="masthead">
      <a className="wordmark" href="#number" aria-label="أسماء لا تُنسى — البداية"><span className="memory-mark" aria-hidden="true">ا</span><span>أسماء <strong>لا تُنسى</strong><small lang="en" dir="ltr">NAMES, NOT NUMBERS</small></span></a>
      <span className="masthead-context"><span className="header-dot" aria-hidden="true" />فلسطين · الذاكرة</span>
      <div className="header-actions"><a className="header-search" href="#archive">ابحث عن اسم</a><button className="motion-toggle" onClick={toggleMotion} aria-pressed={reduced}><span className="motion-symbol" aria-hidden="true">{reduced ? '▷' : 'Ⅱ'}</span>{reduced ? 'تشغيل الحركة' : 'إيقاف الحركة'}</button><button ref={toggle} className="index-toggle" aria-expanded={open} aria-controls="chapter-index" onClick={() => setOpen(!open)}>الفهرس <span aria-hidden="true">{open ? '−' : '+'}</span></button></div>
      <span className="header-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    </header>
    {open && <nav ref={menu} id="chapter-index" className="chapter-index" aria-label="فصول الحكاية">
      <p className="index-heading">من أرقام إلى أسماء <span>الحكاية والأسماء ومصدر البيانات</span></p>
      {CHAPTERS.map((c, i) => <a href={'#' + c.id} key={c.id} aria-current={chapter.id === c.id ? 'location' : undefined} onClick={() => setOpen(false)}><span>{c.label}</span><bdi>{String(i + 1).padStart(2, '0')}</bdi></a>)}
    </nav>}
    <aside className="reading-rail" aria-label="الفصل الحالي"><span className="rail-line"><i style={{ transform: 'scaleY(' + progress + ')' }} /></span><span className="rail-label">{chapter.label}</span><span className="folio" dir="ltr">{String(CHAPTERS.indexOf(chapter) + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span></aside>
  </>;
}
