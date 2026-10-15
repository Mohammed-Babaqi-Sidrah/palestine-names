'use client';
import { useParticleStore } from '@/lib/particleStore';

export default function LivingCrowdScene() {
  const sampleSize = useParticleStore(s => s.particleCount);
  return (
    <section id="crowd" className="chapter crowd" aria-labelledby="crowd-title">
      <div className="chapter-heading">
        <span className="eyebrow">01 — خارطة الذاكرة الحية</span>
        <h2 id="crowd-title">
          حين تنظر للأرض،
          <br />
          ترى <em>أرواحهم.</em>
        </h2>
        <p>
          تتشكّل حدود فلسطين التاريخية من آلاف الهيئات البشرية؛ من رأس الناقورة إلى خليج العقبة، ومن البحر إلى النهر.
          لم يكونوا أرقاماً عابرة، بل كانوا شعباً، وأرضاً، وهوية.
        </p>
      </div>

      <div className="crowd-memorial-tags" aria-label="أبعاد الخارطة التذكارية">
        <div className="crowd-tag">
          <span className="tag-dot" aria-hidden="true" />
          <span>خارطة فلسطين التاريخية كاملة</span>
        </div>
        <div className="crowd-tag">
          <span className="tag-dot" aria-hidden="true" />
          <span>{sampleSize ? `${sampleSize.toLocaleString('en-US')} هيئة بشرية تمثل عيّنة من السجلات` : 'التشكيل عيّنة من الأسماء المسجّلة'}</span>
        </div>
        <div className="crowd-tag">
          <span className="tag-dot" aria-hidden="true" />
          <span>كل نقطة توثق إنساناً وحياة سُلبت</span>
        </div>
      </div>

      <blockquote className="crowd-poetic-quote" dir="rtl">
        «على هذه الأرض ما يستحق الحياة..
        <br />
        كانت تسمى فلسطين، صارت تسمى فلسطين.»
        <cite>— محمود درويش</cite>
      </blockquote>

      <div className="crowd-memory-stage" data-particle-stage aria-hidden="true" />
      <p className="scene-footnote">
        خارطة فلسطين تتجسّد من آلاف الهيئات ثلاثية الأبعاد؛ كل هيئة مرتبطة بسجل فعلي موثق.
      </p>
    </section>
  );
}
