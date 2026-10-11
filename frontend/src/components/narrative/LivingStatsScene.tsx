'use client';
import { useState } from 'react';
import { useParticleStore } from '@/lib/particleStore';
const labels: { [id: string]: string } = {
  infants: 'الأطفال دون الخامسة', children: 'الأطفال من ٥ إلى ١٤ عامًا', youth: 'من ١٥ إلى ٢٤ عامًا',
  adults: 'من ٢٥ إلى ٤٩ عامًا', elders: 'من ٥٠ عامًا فأكثر',
};
const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('ar-u-nu-arab');
export default function LivingStatsScene() {
  const statistics = useParticleStore(s => s.statistics);
  const status = useParticleStore(s => s.dataStatus);
  const webgl = useParticleStore(s => s.webglReady);
  const [selected, setSelected] = useState<string | null>(null);
  const cohort = statistics?.cohorts.find(c => c.id === selected);
  const percent = statistics?.total ? statistics.children_under_18 / statistics.total * 100 : 0;
  return <section id="stats" className="chapter statistics-section" aria-labelledby="stats-title">
    <div className="stats-split-layout">
      <div className="stats-editorial-sidebar">
        <h2 id="stats-title">أجيالٌ،<br/><em>من جذرٍ واحد.</em></h2>
        <p className="stats-poetic-lead">نقرأ الأعمار المسجّلة، ونرى أجيالًا يجمعها اسم هذه الأرض. شجرة الذاكرة تشكيل تذكاري؛ والأعداد أدناه محسوبة من الأرشيف.</p>
        {!statistics ? <p className="feedback" role="status">{status === 'error' ? 'تعذّر تحميل الإحصاءات. أعد تحميل الصفحة للمحاولة.' : 'نقرأ الأعمار المسجّلة…'}</p> : <>
          <dl className="memorial-metrics">
            <div><dt>أطفال دون الثامنة عشرة</dt><dd>{number(statistics.children_under_18)}</dd><p>{number(Math.round(percent * 10) / 10)}٪ من الأسماء المسجّلة؛ بينهم {number(statistics.infants_under_1)} دون عام.</p></div>
            <div><dt>متوسط العمر المسجّل</dt><dd>{number(statistics.average_age)} <span>عامًا</span></dd><p>العمر الوسيط: {number(statistics.median_age)} عامًا.</p></div>
            <div><dt>أكبر عمر مسجّل</dt><dd>{number(statistics.max_age)} <span>عامًا</span></dd><p>العمر غير متاح في {number(statistics.unknown_age)} سجل.</p></div>
          </dl>
          <div className="cohort-ledger" role="group" aria-label="الفئات العمرية">
            <h3>الأجيال في السجل</h3>
            {statistics.cohorts.map(c => <button key={c.id} type="button" aria-pressed={selected === c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}>
              <bdi>{c.range}</bdi><span className="cohort-track" aria-hidden="true"><i style={{ width: `${statistics.total_with_age ? c.count / statistics.total_with_age * 100 : 0}%` }}/></span><strong>{number(c.count)}</strong>
              <span className="sr-only">{labels[c.id]}</span>
            </button>)}
            <p className="cohort-detail" role="status">{cohort ? `${labels[cohort.id]}: ${number(cohort.count)} اسمًا.` : 'اختر فئة لقراءة عدد الأسماء. تُستبعد الأعمار غير المسجّلة من التوزيع.'}</p>
          </div>
        </>}
        <a className="text-link" href="#archive">اقرأ الأسماء في الأرشيف <span aria-hidden="true">←</span></a>
      </div>
      <figure className="stats-visual">
        <div className="particle-stage tree-stage" data-particle-stage aria-hidden="true">{!webgl && <span className="stage-fallback">شجرة الذاكرة</span>}</div>
        <figcaption>شجرة من هيئات بشرية تمثّل عيّنة من الأسماء.<br/>كلّ اسم متاح للقراءة في الأرشيف.</figcaption>
      </figure>
    </div>
  </section>;
}
