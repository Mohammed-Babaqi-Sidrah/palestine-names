'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useParticleStore } from '@/lib/particleStore';
import type { AgentResponse } from '@/lib/types';
import ArchivalSeal from './ArchivalSeal';

const suggestions = [
  'كم عدد الأطفال المسجلين في الأرشيف؟',
  'من هم أصغر الأطفال؟ رتبهم حسب العمر',
  'ابحث لي عن اسم عائلة النجار',
  'ما هو متوسط الأعمار وأكبر عمر مسجل؟'
];

/**
 * Animated Peace Dove (حمامة السلام) carrying an olive branch.
 * Pure GPU-accelerated vector SVG with fluttering wings and gentle glide.
 * Lightweight, zero-dependency, ultra-smooth 60fps animation.
 */
function PeaceDoveAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`peace-dove-container ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="peace-dove-svg"
      >
        {/* Olive Branch in Beak */}
        <g className="dove-olive-branch">
          <path
            d="M 68 34 Q 78 30 85 24 Q 79 27 73 31"
            stroke="#436148"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse cx="78" cy="27" rx="3.5" ry="1.8" transform="rotate(-30 78 27)" fill="#436148" />
          <ellipse cx="84" cy="23" rx="3" ry="1.5" transform="rotate(-40 84 23)" fill="#587e5e" />
          <ellipse cx="73" cy="29" rx="3.2" ry="1.6" transform="rotate(-15 73 29)" fill="#354d39" />
        </g>

        {/* Dove Back Wing */}
        <path
          className="dove-wing-back"
          d="M 38 36 C 30 22 36 10 46 6 C 44 14 41 24 43 33 Z"
          fill="#DDD9CD"
          stroke="#B5B0A0"
          strokeWidth="1.2"
        />

        {/* Dove Body & Tail */}
        <path
          className="dove-body"
          d="M 12 50 C 18 48 25 46 32 44 C 38 42 46 41 54 39 C 60 37 66 33 68 35 C 70 37 68 41 64 44 C 58 48 50 52 42 53 C 34 54 22 55 12 50 Z"
          fill="#FAF8F2"
          stroke="#948F82"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Dove Front Wing (fluttering) */}
        <path
          className="dove-wing-front"
          d="M 44 38 C 36 20 45 4 58 2 C 54 13 49 26 49 38 Z"
          fill="#FFFFFF"
          stroke="#8A8578"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Eye */}
        <circle cx="64" cy="36" r="1.4" fill="#292D28" />
      </svg>
    </div>
  );
}

export default function ArchivistLetterScene() {
  const [query, setQuery] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const busy = useRef(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const followupInput = useRef<HTMLInputElement>(null);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy.current) return;
    busy.current = true;
    setLastQuestion(q);
    setLoading(true);
    setError(false);
    setResponse(null);

    try {
      const res = await api.chatWithArchivist(q);
      setResponse(res);
      setQuery('');
      if (res.records && res.records.length > 0) {
        useParticleStore.setState({
          archiveRecords: res.records,
          highlightIds: new Set(res.records.map(r => r.id))
        });
      }
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  const resetView = () => {
    setResponse(null);
    setLastQuestion('');
    setQuery('');
    setError(false);
  };

  const isDialogue = Boolean(response || loading || error);

  return (
    <section id="archivist" className="chapter archivist" aria-labelledby="archivist-title">
      <div className="archivist-heading">

        <h2 id="archivist-title">اسأل حارس الأرشيف.</h2>
        <p className="micro-copy">
          مساعد اختياري لقراءة الأسماء والإحصاءات. يمكنك البحث في الأرشيف مباشرة دون استخدام المساعد.
        </p>
      </div>

      {!isDialogue ? (
        /* ─── State 1: Dignified Archival Dossier Folio & Inscription Desk ─── */
        <div className="archivist-folio">
          {/* Visual / Archival Column: Authentic Embossed Archival Dossier Plate */}
          <div className="folio-dossier-col">
            <div className="folio-dossier-card">
              <div className="dossier-header-badge">
                <span className="dossier-flag-mark" aria-hidden="true">🇵🇸</span>
                <span className="dossier-header-title">أسماء لا تُنسى</span>
              </div>

              {/* Handcrafted Vector Archival Seal */}
              <div className="dossier-seal-showcase">
                <ArchivalSeal size={135} />
              </div>

              <div className="dossier-credentials">
                <div className="dossier-ref-row">
                  <span className="dossier-ref-label">الأرشيف:</span>
                  <span className="dossier-ref-val">PALESTINE · NAMES ARCHIVE</span>
                </div>
                <div className="dossier-ref-row">
                  <span className="dossier-ref-label">حالة التوثيق:</span>
                  <span className="dossier-ref-status">قائمة أسماء موثقة</span>
                </div>
              </div>

              <blockquote className="folio-archivist-quote">
                «النسيان فناءٌ مؤجل، والذاكرة بقاءٌ حيّ. كُلّ اسمٍ هنا ليس رقماً في إحصاء، بل إنسانٌ له قصة وأهل وأرض.»
              </blockquote>

              <div className="folio-live-status">
                <span className="status-live-beacon" aria-hidden="true" />
                <span>البيانات من Tech For Palestine</span>
              </div>
            </div>
          </div>

          {/* Interactive Column: The Archival Query Desk Console */}
          <div className="folio-desk-col">
            <form noValidate className="folio-form" onSubmit={e => { e.preventDefault(); ask(query); }}>
              <div className="folio-form-header">
                <span className="folio-form-tag">سجل الاستعلام الأرشيفي المباشر</span>
                <bdi className="folio-form-id">FOLIO INQUIRY · LIVE ARCHIVE</bdi>
              </div>

              <label htmlFor="archivist-query" className="folio-label">
                ماذا تريد أن تستحضر من سجلات الشهداء وعائلاتهم؟
              </label>

              <div className="folio-textarea-wrap">
                <textarea
                  ref={textarea}
                  id="archivist-query"
                  className="resize-none"
                  style={{ resize: 'none' }}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="اكتب اسم شهيد أو عائلة، أو اسأل عن الرضّع، أو اطلب إحصاءات عائلة معينة في الأرشيف…"
                  maxLength={400}
                />
              </div>

              <div className="folio-action-bar">
                <button
                  type="submit"
                  className={`folio-send-btn ${loading ? 'is-loading' : ''}`}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <>
                      <span className="btn-loading-dot" aria-hidden="true" />
                      <span>جارٍ استحضار السجلات…</span>
                    </>
                  ) : (
                    <>
                      <span>اسأل الأرشيف</span>
                      <span className="send-arrow" aria-hidden="true">←</span>
                    </>
                  )}
                </button>
                <span className="folio-privacy-note">إجابة آلية · راجع السجلات ومصدر البيانات</span>
              </div>
            </form>

            <div className="folio-prompts-tray" aria-label="نماذج استفسارات أرشيفية">
              <span className="prompts-tag">استفسارات مقترحة لاستكشاف الأرشيف:</span>
              <div className="prompts-list">
                {suggestions.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    className="folio-prompt-pill"
                    disabled={loading}
                    onClick={() => {
                      setQuery(prompt);
                      textarea.current?.focus();
                      ask(prompt);
                    }}
                  >
                    <span>{prompt}</span>
                    <span className="pill-arrow" aria-hidden="true">↖</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── State 2: Dedicated Archival Dialogue Sheet Mode with Peace Dove Responder ─── */
        <div className="archivist-dialogue-sheet">
          <div className="dialogue-header">
            <div className="dialogue-archivist-badge">
              <div className={`dialogue-avatar ${loading ? 'is-responding' : ''}`}>
                {loading ? (
                  <PeaceDoveAnimation className="avatar-dove-anim" />
                ) : (
                  <ArchivalSeal size={46} className="avatar-seal-mini" />
                )}
              </div>
              <div className="dialogue-badge-text">
                <strong>{loading ? 'حمامة الذاكرة تبحث في السجلات…' : 'إجابة حارس الأرشيف'}</strong>
                <span>{loading ? 'استحضار وتوثيق قيود الشهداء' : 'إجابة آلية مستندة إلى بيانات الأرشيف'}</span>
              </div>
            </div>
            <button type="button" disabled={loading} className="dialogue-reset-btn" onClick={resetView}>
              ↺ استعلام جديد / العودة للمكتب
            </button>
          </div>

          {lastQuestion && (
            <div className="dialogue-user-query">
              <span className="query-tag">استفسارك الأرشيفي:</span>
              <p>«{lastQuestion}»</p>
            </div>
          )}

          <div className="dialogue-document" aria-live="polite" aria-busy={loading}>
            {loading && (
              <div className="page-working dove-working-banner">
                <PeaceDoveAnimation />
                <div className="dove-working-prose">
                  <strong>حمامة الذاكرة تطوف بين سجلات الخلود…</strong>
                  <span>نستحضر بيانات الأرشيف لتوثيق الإجابة بوقار ودقة</span>
                </div>
              </div>
            )}

            {error && (
              <div className="feedback error">
                تعذّر استرجاع الرد الأرشيفي حالياً. يمكنك إعادة المحاولة بالضغط على الزر أدناه.
                <button type="button" className="text-link" onClick={() => ask(lastQuestion)}>
                  إعادة المحاولة ↺
                </button>
              </div>
            )}

            {response && (
              <div className="dialogue-content"><p className="agent-mode-note">{response.fallback_used ? 'قراءة محلية من البيانات · خدمة الذكاء الاصطناعي غير متاحة' : 'إجابة بمساعدة الذكاء الاصطناعي · راجع المصدر'}</p>
                <div className="agent-meta">
                  <span className="eyebrow">قراءة من الأرشيف</span>
                  {response.tools_used?.length > 0 && (
                    <div className="agent-tools">
                      {response.tools_used.map((t, i) => (
                        <span key={i} className="tool-chip">
                          {t.tool === 'search_by_name' && '🔍 استعلام دقيق بالاسم'}
                          {t.tool === 'search_by_age' && '🎯 فرز السجلات بالفئة العمرية'}
                          {t.tool === 'sort_by_age' && '⚡ تصنيف زمني وتدقيق الأعمار'}
                          {t.tool === 'sort_by_name' && '🔤 فهرسة هجائية للعائلات'}
                          {t.tool === 'get_archive_statistics' && '📊 بيان الإحصاءات الأرشيفية'}
                          {t.execution_time_ms !== undefined && (
                            <bdi> ({t.execution_time_ms} ms)</bdi>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="agent-prose">
                  {response.answer}
                </div>

                {response.records && response.records.length > 0 && (
                  <div className="agent-records-tray">
                    <span className="tray-title">قيود حقيقية استُحضرت في هذا التوثيق (اضغط لقراءة السجل الكامل):</span>
                    <div className="tray-items">
                      {response.records.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          className="tray-record-btn"
                          onClick={() => useParticleStore.setState({ selectedRecord: r })}
                        >
                          <strong>{r.ar_name || r.en_name}</strong>
                          <span>{r.age === null ? 'غير مسجل' : r.age === 0 ? 'دون عام' : `${r.age} عاماً`} ↗</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="technical-note" dir="rtl">
                  هذا مساعد آلي، وليس وثيقة رسمية. يمكنك مراجعة الأسماء في الأرشيف ومصدر البيانات.
                </p>
              </div>
            )}
          </div>

          {/* Follow-up Inquiry Bar */}
          <form noValidate className="dialogue-followup-form" onSubmit={e => { e.preventDefault(); ask(query); }}>
            <input
              ref={followupInput}
              aria-label="سؤال تالٍ لحارس الأرشيف"
              maxLength={400}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="اسأل سؤالاً تالياً، أو اطلب تفاصيل إضافية عن السجلات…"
              disabled={loading}
            />
            <button
              type="submit"
              className="dialogue-submit-btn"
              disabled={loading || !query.trim()}
            >
              <span>إرسال</span>
              <span aria-hidden="true">←</span>
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
