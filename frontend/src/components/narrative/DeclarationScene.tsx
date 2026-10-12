'use client';
import { useParticleStore } from '@/lib/particleStore';
export default function DeclarationScene() {
  const record = useParticleStore(s => s.records[0]);
  return <section id="declaration" className="chapter declaration" aria-labelledby="declaration-title">
    <div className="ambient-memory-stage" data-particle-stage aria-hidden="true" />
    <span className="eyebrow">02 — اسم واحد، حياة كاملة</span><h2 id="declaration-title">ولكل شخص <em>اسم.</em></h2>
    {record && <div className="one-record"><span className="record-rule"/><span className="micro-copy">اسم من بين آلاف الأسماء</span><button onClick={() => useParticleStore.setState({ selectedRecord: record })}>{record.ar_name || record.en_name}</button><p>{record.age !== null && <span>{record.age === 0 ? 'دون عام واحد' : record.age + ' عامًا'}</span>}<bdi>№ {record.id}</bdi></p></div>}
    <p className="declaration-note">نقرأ الاسم، كي يبقى الإنسان حاضرًا.</p>
  </section>;
}
