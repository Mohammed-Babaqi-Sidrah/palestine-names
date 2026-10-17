'use client';
import { useEffect, useRef } from 'react';
import { useParticleStore } from '@/lib/particleStore';
export default function RecordDialog() {
  const record = useParticleStore(s => s.selectedRecord);
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropPress = useRef(false);
  useEffect(() => { backdropPress.current = false; if (record) dialog.current?.showModal(); else dialog.current?.close(); }, [record]);
  return <dialog ref={dialog} className="record-dialog" aria-labelledby="record-name" onClose={() => useParticleStore.setState({ selectedRecord: null })}
    onPointerDown={e => { backdropPress.current = e.target === e.currentTarget; }}
    onPointerCancel={() => { backdropPress.current = false; }}
    onClick={e => { if (backdropPress.current && e.target === e.currentTarget) e.currentTarget.close(); backdropPress.current = false; }}>
    {record && <article><div className="slip-heading"><span className="eyebrow">اسم محفوظ</span><form method="dialog" noValidate><button aria-label="إغلاق السجل" autoFocus>×</button></form></div><h2 id="record-name">{record.ar_name || record.en_name}</h2>{record.ar_name && record.en_name && <p lang="en" dir="ltr" className="record-english">{record.en_name}</p>}<dl>{record.age !== null && <div><dt>العمر</dt><dd>{record.age === 0 ? 'دون عام واحد' : record.age + ' عامًا'}</dd></div>}{record.sex && <div><dt>الجنس</dt><dd>{record.sex === 'f' ? 'أنثى' : 'ذكر'}</dd></div>}{record.dob && <div><dt>تاريخ الميلاد</dt><dd><bdi>{record.dob.slice(0, 10)}</bdi></dd></div>}<div><dt>رقم السجل</dt><dd><bdi>{record.id.startsWith('derived-') ? 'غير متاح في المصدر' : record.id}</bdi></dd></div></dl>{record.update && <p className="micro-copy">إصدار القائمة: <bdi>{record.update}</bdi></p>}<p className="micro-copy">كما ورد في قائمة Tech For Palestine للأسماء. إصدار القائمة ليس تاريخ الوفاة.</p></article>}
  </dialog>;
}
