'use client';
import { useParticleStore } from '@/lib/particleStore';
import styles from './FinaleWitnessNote.module.css';

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

      <div className={styles.note}>
        <svg className={styles.drop} width="12" height="19" viewBox="0 0 12 19" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M6 0C5 4.5 0 8.1 0 12.4A6 6 0 0 0 12 12.4C12 8.1 7 4.5 6 0Z" />
        </svg>
        <p>هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.</p>
      </div>

      {/* Minimalist Pro Colophon Bar */}
      <footer className="archive-colophon" role="contentinfo">
        <div className="colophon-col colophon-identity">
          <div className="colophon-badge">
            <span className="live-dot" aria-hidden="true" />
            <span>سِجل الذاكرة الوطنية المستقل</span>
          </div>
          <strong className="colophon-brand">أسماء لا تُنسى</strong>
          <p className="colophon-sub">
            {total !== null ? `${total.toLocaleString('ar-EG')} إنساناً موثقاً بالاسم.` : 'أرشيف تفاعلي تخليداً لأرواح شهداء فلسطين.'}
          </p>
        </div>

        <div className="colophon-col colophon-developer">
          <span className="dev-role-label">تطوير وهندسة المنصة</span>
          <strong className="dev-name" lang="en" dir="ltr">Mohammed Babaqi</strong>
          <div className="dev-social-pills" dir="ltr">
            <a
              href="https://github.com/MohammedBabaqi"
              target="_blank"
              rel="noopener noreferrer"
              className="pro-pill-btn"
              aria-label="Mohammed Babaqi on GitHub (opens in new tab)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span>GitHub</span>
              <span className="arrow-out" aria-hidden="true">↗</span>
            </a>

            <a
              href="https://www.linkedin.com/in/mohammedbabaqi/"
              target="_blank"
              rel="noopener noreferrer"
              className="pro-pill-btn"
              aria-label="Mohammed Babaqi on LinkedIn (opens in new tab)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span>LinkedIn</span>
              <span className="arrow-out" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="colophon-col colophon-action">
          <a className="pro-return-top" href="#number" aria-label="العودة إلى بداية الأرشيف">
            <span>العودة إلى البداية</span>
            <span className="top-arrow" aria-hidden="true">↑</span>
          </a>
          <span className="motto-en" lang="en" dir="ltr">
            TO REMEMBER · IS TO KEEP A NAME ALIVE
          </span>
        </div>
      </footer>
    </section>
  );
}
