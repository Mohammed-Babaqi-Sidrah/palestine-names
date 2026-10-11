'use client';
import { useParticleStore } from '@/lib/particleStore';

export default function LivingCrowdScene() {
  const webgl = useParticleStore(s => s.webglReady);
  return (
    <section id="crowd" className="chapter crowd" aria-labelledby="crowd-title">
      <div className="chapter-heading">
        <h2 id="crowd-title">
          حين تنظر للأرض،
          <br />
          ترى <em>أرواحهم.</em>
        </h2>
        <p>
          تتشكّل خارطة فلسطين من هيئات بشرية تمثّل عيّنة من الأسماء المحفوظة؛ من البحر إلى النهر.
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
          <span>عيّنة مرئية من سجلات الأرشيف</span>
        </div>
        <div className="crowd-tag">
          <span className="tag-dot" aria-hidden="true" />
          <span>كل هيئة مرتبطة باسم في السجل</span>
        </div>
      </div>

      <blockquote className="crowd-poetic-quote" dir="rtl">
        «على هذه الأرض ما يستحق الحياة..
        <br />
        كانت تسمى فلسطين، صارت تسمى فلسطين.»
        <cite>— محمود درويش</cite>
      </blockquote>

      <figure className="crowd-visual"><div className="particle-stage map-stage" data-particle-stage aria-hidden="true">{!webgl && <span className="stage-fallback">فلسطين · الذاكرة</span>}</div><figcaption>تشكيل تذكاري، لا يعبّر عن أماكن الأفراد.<br/><a className="text-link" href="#archive">اقرأ الأسماء</a></figcaption></figure>
    </section>
  );
}
