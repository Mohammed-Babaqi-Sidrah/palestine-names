'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useParticleStore } from '@/lib/particleStore';
import type { AgentResponse } from '@/lib/types';
import ArchivalSeal from './ArchivalSeal';
const ArchiveMarkdown = dynamic(() => import('./ArchiveMarkdown'), {
  loading: () => <p className="archive-working" role="status">نهيّئ الإجابة…</p>,
});

export default function ArchivistLetterScene() {
  const [query, setQuery] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const total = useParticleStore(s => s.total);

  useEffect(() => () => request.current?.abort(), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLastQuestion(q);
    setLoading(true);
    setError(false);
    setResponse(null);
    try {
      const res = await api.chatWithArchivist(q, undefined, controller.signal);
      if (controller.signal.aborted) return;
      setResponse(res);
      if (res.records?.length) {
        useParticleStore.setState({ archiveRecords: res.records, highlightIds: new Set(res.records.map(r => r.id)) });
      }
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      request.current = null;
    }
  };

  return (
    <section id="archivist" className="chapter archivist" aria-labelledby="archivist-title">
      <div className="ambient-memory-stage" data-particle-stage aria-hidden="true" />
      <div className="archivist-heading">
        <span className="eyebrow">04 — سِجل الذاكرة الحيّة</span>
        <h2 id="archivist-title">استنطاق وثائق الذاكرة.</h2>
        <p className="micro-copy">ابحث بالاسم أو العائلة، واسأل عن الأعمار والإحصاءات في السجل.</p>
      </div>
      <div className="archivist-folio archive-desk">
        <aside className="folio-dossier-col" aria-label="عن حارس الأرشيف">
          <div className="dossier-seal-showcase"><ArchivalSeal size={156} /></div>
          <div className="archive-desk-identity">
            <h3>حارس الأرشيف</h3>
            <p>كل اسمٍ هنا حياة.<br />نستحضر الأسماء، ونحفظ أثرها.</p>
          </div>
          <div className="archive-desk-source">
            {total !== null && <p><bdi>{total.toLocaleString('ar')}</bdi> اسم في السجل</p>}
            <a href="https://data.techforpalestine.org/docs/killed-in-gaza/" target="_blank" rel="noopener noreferrer">مصدر الأسماء <span aria-hidden="true">↗</span></a>
          </div>
        </aside>
        <div className="folio-desk-col">
          <form noValidate className="folio-form" onSubmit={e => { e.preventDefault(); void ask(query); }}>
            <label htmlFor="archivist-query" className="folio-label">سؤالك لحارس الأرشيف</label>
            <div className="folio-textarea-wrap">
              <textarea id="archivist-query" className="resize-none" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="اكتب اسمًا أو سؤالًا عن السجل…" rows={3} maxLength={400}
                aria-describedby="archivist-query-hint" />
            </div>
            <p id="archivist-query-hint" className="archive-desk-hint">مثل: ابحث عن عائلة النجار، أو كم عدد الأطفال في السجل؟</p>
            <div className="folio-action-bar">
              <button type="submit" className="folio-send-btn" disabled={loading || !query.trim()}>
                <span>{loading ? 'جارٍ البحث…' : 'اسأل حارس الأرشيف'}</span><span className="send-arrow" aria-hidden="true">←</span>
              </button>
            </div>
          </form>
          <div className="archive-desk-answer" aria-live="polite" aria-busy={loading}>
            {lastQuestion && <div className="dialogue-user-query"><span className="query-tag">سؤالك</span><p>{lastQuestion}</p></div>}
            {loading && <p className="archive-working" role="status">نبحث في الأسماء والسجلات…</p>}
            {error && <div className="feedback error">تعذّر تحميل الإجابة. سؤالك محفوظ.
              <button type="button" className="text-link" onClick={() => void ask(lastQuestion)}>إعادة المحاولة</button>
            </div>}
            {response && <>
              <ArchiveMarkdown answer={response.answer} />
              {response.records?.length > 0 && <div className="agent-records-tray">
                <span className="tray-title">الأسماء الواردة في الإجابة</span>
                <div className="tray-items">{response.records.map(r => <button key={r.id} type="button" className="tray-record-btn"
                  onClick={() => useParticleStore.setState({ selectedRecord: r })}>
                  <strong>{r.ar_name || <bdi lang="en" dir="ltr">{r.en_name}</bdi>}</strong>
                  <span>{r.age === null ? 'العمر غير مسجل' : r.age === 0 ? 'دون عام' : `${r.age} عامًا`} ↗</span>
                </button>)}</div>
              </div>}
              <p className="agent-mode-note">{response.fallback_used ? 'إجابة محلية من البيانات · خدمة الذكاء الاصطناعي غير متاحة' : 'إجابة بمساعدة الذكاء الاصطناعي · راجع الأسماء ومصدر البيانات'}</p>
            </>}
          </div>
          {!response && <p className="folio-privacy-note">مساعد آلي لقراءة البيانات، وليس وثيقة رسمية.</p>}
        </div>
      </div>
    </section>
  );
}
