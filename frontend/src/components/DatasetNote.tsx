'use client';
import { useParticleStore } from '@/lib/particleStore';

export default function DatasetNote({ compact = false }: { compact?: boolean }) {
  const dataset = useParticleStore(s => s.dataset);
  if (!dataset) return null;
  const checked = dataset.checked_at ? new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dataset.checked_at)) : null;
  return <div className="dataset-note">
    <div className="dataset-source"><a href="https://data.techforpalestine.org/docs/killed-in-gaza/" target="_blank" rel="noopener noreferrer" lang="en" dir="ltr">Tech For Palestine ↗</a>
      <span className={`dataset-status ${dataset.status}`}>{dataset.status === 'fresh' ? 'تم التحقق من المصدر' : dataset.status === 'stale' ? 'تعذّر التحديث · آخر نسخة محفوظة' : 'نسخة محفوظة · لم يُتحقق من تحديثها'}</span>
    </div>
    <p>{checked ? <>آخر تحقق ناجح: <time dateTime={dataset.checked_at!}>{checked}</time>.</> : 'تُعرض النسخة المرفقة بالمشروع حتى ينجح الاتصال بالمصدر.'} {dataset.source_revision !== null && <>إصدار القائمة: <bdi>{dataset.source_revision}</bdi>.</>}</p>
    {!compact && <p>نتحقق من المصدر يوميًا؛ تتغير الأسماء عند صدور قائمة جديدة. هذه قائمة أسماء موثقة، وليست الحصيلة اليومية الكاملة.</p>}
  </div>;
}
