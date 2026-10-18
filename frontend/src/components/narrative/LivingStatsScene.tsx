'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import { useParticleStore } from '@/lib/particleStore';
import DatasetNote from '@/components/DatasetNote';

interface Cohort {
  id: string;
  label: string;
  range: string;
  count: number;
  pct: number;
  note: string;
}

export default function LivingStatsScene() {
  const statistics = useParticleStore(s => s.statistics);
  const status = useParticleStore(s => s.dataStatus);
  const number = (n: number | null | undefined) => n == null ? '—' : n.toLocaleString('en-US');
  const age = (n: number | null | undefined) => n == null ? '—' : number(Math.round(n));
  const childPercent = statistics?.total ? Math.round(statistics.children_under_18 / statistics.total * 1000) / 10 : null;
  const [activeCohort, setActiveCohort] = useState<string | null>(null);

  const cohorts: Cohort[] = useMemo(() => (statistics?.cohorts || []).map(c => ({
    ...c,
    label: ({ infants: 'الرُضّع والأطفال دون 5 سنوات', children: 'أطفال المدارس واليافعون',
      youth: 'جيل الشباب والجامعات', adults: 'البالغون وسند العائلات',
      elders: 'شيوخ الأرض وشواهد الذاكرة' } as Record<string, string>)[c.id],
    pct: statistics?.total_with_age ? c.count / statistics.total_with_age * 100 : 0,
    note: `الأسماء المسجّلة ضمن الفئة العمرية ${c.range}؛ تُستبعد الأعمار غير المتاحة من التوزيع.`,
  })), [statistics]);

  const selectedData = cohorts.find(c => c.id === activeCohort);

  return (
    <section id="stats" className="chapter statistics-section" aria-labelledby="stats-title">
      <div className="stats-split-layout">
        {/* Dedicated Sidebar Column: Freeing the 3D space for the Olive Tree */}
        <div className="stats-editorial-sidebar">
          {/* Editorial Section Header */}
          <div className="stats-header-minimal">
            <span className="eyebrow">03 — شجرة الأجيال والذاكرة</span>
            <h2 id="stats-title">
              لم يكونوا أرقامًا،
              <br />
              بل <em>شجرة حياة</em> تمتد جذورها في الأرض.
            </h2>
            <p className="stats-poetic-lead">
              تتجمع الأرواح لتشكل شجرة زيتون فلسطين ثلاثية الأبعاد؛ مرر الفأرة فوق أوراقها وأغصانها للتعرف على أصحابها. التشكيل عيّنة من الأسماء المسجّلة.
            </p>
          </div>

          {/* 3 Striking Sculptural Metrics */}
          <div className="stats-trio-grid">
            {!statistics && <p className="feedback" role="status">{status === 'error' ? 'تعذّر تحميل الإحصاءات. أعد تحميل الصفحة للمحاولة.' : 'نستحضر بيانات الأرشيف…'}</p>}
            <article className="stat-trio-card accent-card">
              <span className="trio-badge">{number(childPercent)}٪ من الأسماء المسجّلة</span>
              <strong className="trio-number">{number(statistics?.children_under_18)}</strong>
              <h3 className="trio-title">طفلاً ويافعاً</h3>
              <p className="trio-desc">
                بينهم <strong>{number(statistics?.infants_under_1)} رضيعًا</strong> دون عام واحد.
              </p>
            </article>

            <article className="stat-trio-card">
              <span className="trio-badge">جيل في ريعان شبابه</span>
              <strong className="trio-number">{age(statistics?.average_age)}</strong>
              <h3 className="trio-title">عامًا متوسط الأعمار</h3>
              <p className="trio-desc">
                العمر الوسيط <strong>{age(statistics?.median_age)} عامًا</strong> بحسب الأعمار المسجّلة.
              </p>
            </article>

            <article className="stat-trio-card">
              <span className="trio-badge">أكبر عمر مسجّل</span>
              <strong className="trio-number">{age(statistics?.max_age)}</strong>
              <h3 className="trio-title">عامًا أكبر الشهداء سنًا</h3>
              <p className="trio-desc">
                الأعمار غير المتاحة: {number(statistics?.unknown_age)} سجل.
              </p>
            </article>
          </div>

          {/* Unified Generations Spectrum Bar */}
          <div className="generations-spectrum-container">
            <div className="spectrum-header">
              <span className="spectrum-title">توزيع الأجيال عبر شجرة الذاكرة</span>
              <span className="spectrum-hint">انقر على أي فئة للتركيز</span>
            </div>

            {/* Segmented Bar */}
            <div className="spectrum-track" aria-hidden="true">
              {cohorts.map(c => <span key={c.id} style={{ width: `${c.pct}%` }} />)}
            </div>
            <div className="spectrum-bar" role="group" aria-label="توزيع الفئات العمرية">
              {cohorts.map(c => {
                const isActive = activeCohort === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`spectrum-segment ${isActive ? 'active' : ''}`}
                    style={{ '--cohort-share': `${c.pct}%` } as CSSProperties}
                    onClick={() => setActiveCohort(isActive ? null : c.id)}
                    aria-pressed={isActive}
                    aria-label={`${c.label}: ${number(c.count)} اسمًا (${c.pct.toFixed(1)}٪)`}
                  >
                    <bdi className="segment-label">{c.range}</bdi>
                    <span className="segment-pct">{c.pct.toFixed(1)}٪</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Cohort Dynamic Note */}
            {selectedData && (
              <div className="spectrum-detail-box" dir="rtl" role="status">
                <strong>{selectedData.label} ({selectedData.count.toLocaleString('ar-EG')} شهيد):</strong>
                <span> {selectedData.note}</span>
              </div>
            )}
          </div>

          {/* Lineage & AI Agent Bridge */}
          <div className="stats-bottom-ribbon">
            <div className="lineage-tribute"><DatasetNote compact /></div>

            <a href="/archive" className="agent-shortcut-btn">
              <span>البحث في السجلات</span>
              <span className="btn-arrow" aria-hidden="true">↙</span>
            </a>
          </div>
        </div>
        <div className="stats-memory-column" data-particle-stage aria-hidden="true" />
      </div>
    </section>
  );
}
