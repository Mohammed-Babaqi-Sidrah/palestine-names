'use client';
import Image from 'next/image';
import { useParticleStore } from '@/lib/particleStore';
import styles from './SourceAcknowledgement.module.css';

export default function QuietFinaleScene() {
  const total = useParticleStore(s => s.total);
  const calligraphy = useParticleStore(s => s.calligraphyReady && s.webglReady);

  return (
    <section id="finale" className="chapter finale" aria-labelledby="finale-title">
      <div className="finale-lead-block">
        <span className="eyebrow">05 — ما يبقى</span>
        <p className="finale-verse">لم يكونوا أرقامًا.. كانوا حيواتٍ وأحلاماً.</p>
        <h2 id="finale-title">
          ولكل إنسان <em>اسمٌ وخلود.</em>
        </h2>
      </div>

      {/* ─── Quote — Palestinian Flag Colors ─── */}
      <blockquote className="flag-quote" aria-label="اقتباس محمود درويش">
        <p className="flag-quote-text">
          <span className="fq-green">النسيان هو الموت المشتهى،</span>{' '}
          <span className="fq-white">ولكن الذاكرة</span>{' '}
          <span className="fq-red">لا تموت.</span>
        </p>
        <footer className="flag-quote-attr">
          <span className="fq-dash" aria-hidden="true" />
          <cite>محمود درويش</cite>
        </footer>
      </blockquote>

      {/* Breathing space for the 3D Palestine calligraphy formed by the martyrs */}
      <div className="finale-calligraphy-stage" data-particle-stage aria-hidden="true">{!calligraphy && <span className="calligraphy-fallback">فلسطين</span>}</div>

      <footer className={`archive-colophon ${styles.footer}`} role="contentinfo">
        <div className={styles.header}>
          <div className={styles.identity}>
            <strong>أسماء لا تُنسى</strong>
            <p>{total !== null ? `${total.toLocaleString('ar-EG')} إنساناً موثقاً بالاسم.` : 'أرشيف تفاعلي تخليداً لأرواح شهداء فلسطين.'}</p>
          </div>
        </div>

        <div className={styles.body}>
          <section className={styles.source} aria-labelledby="names-source-title">
            <div className={styles.sourceBrand}>
              <a className={styles.logoFrame} href="https://data.techforpalestine.org/docs/killed-in-gaza/" target="_blank" rel="noopener noreferrer" aria-label="Tech For Palestine">
                <Image className={styles.logo} src="/logos/tech-for-palestine.svg" width={1920} height={1080} alt="شعار Tech For Palestine" unoptimized />
              </a>
              <div><h3 id="names-source-title">مصدر الأسماء</h3><bdi lang="en" dir="ltr">Tech For Palestine</bdi></div>
            </div>
            <p>تعتمد أسماء هذا الأرشيف على قوائم وزارة الصحة في غزة، كما يتيحها مشروع بيانات <bdi lang="en" dir="ltr">Tech For Palestine</bdi>.</p>
            <p className={styles.thanks}>شكرًا للقائمين على المشروع ولكلّ مَن يسهم في توثيق الأسماء وصون الذاكرة.</p>
            <a className={styles.repository} href="https://github.com/TechForPalestine/palestine-datasets" target="_blank" rel="noopener noreferrer">مستودع البيانات المفتوح</a>
          </section>

          <div className={styles.developer}>
            <span className={styles.label}>تطوير وهندسة المنصة</span>
            <strong lang="en" dir="ltr">Mohammed Babaqi</strong>
            <a className={styles.website} href="https://babaqi.io" target="_blank" rel="noopener noreferrer" dir="ltr">
              babaqi.io
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
            </a>
            <div className={styles.socials} dir="ltr">
              <a href="https://github.com/MohammedBabaqi" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/mohammedbabaqi/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span lang="en" dir="ltr">TO REMEMBER · IS TO KEEP A NAME ALIVE</span>
          <a className={styles.returnTop} href="#number" aria-label="العودة إلى بداية الأرشيف">
            العودة إلى البداية
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6" /></svg>
          </a>
        </div>
      </footer>
    </section>
  );
}
