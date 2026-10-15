'use client';
import { useId } from 'react';

interface ArchivalSealProps {
  className?: string;
  size?: number;
}

/** Archive stamp drawn directly with SVG paths and locally served Arabic type. */
export default function ArchivalSeal({ className = '', size = 140 }: ArchivalSealProps) {
  const id = useId();
  return (
    <div className={`archival-seal-wrap ${className}`} style={{ width: size, height: size }}
      role="img" aria-label="ختم حارس الأرشيف — أسماء لا تُنسى">
      <svg viewBox="0 0 200 200" width={size} height={size} fill="none"
        xmlns="http://www.w3.org/2000/svg" className="archival-seal-svg" aria-hidden="true">
        <defs>
          <path id={id + '-top'} d="M 28 100 A 72 72 0 0 1 172 100" />
          <path id={id + '-bottom'} d="M 28 100 A 72 72 0 0 0 172 100" />
        </defs>
        <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth=".8" opacity=".5" />
        <text direction="rtl" className="seal-svg-text-primary" fill="currentColor">
          <textPath href={'#' + id + '-top'} startOffset="50%" textAnchor="middle">أسماء لا تُنسى</textPath>
        </text>
        <text direction="rtl" className="seal-svg-text-secondary" fill="currentColor">
          <textPath href={'#' + id + '-bottom'} startOffset="50%" textAnchor="middle">حارس الأرشيف</textPath>
        </text>
        <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Open folio: two page contours and a single central spine. */}
          <path d="M100 97Q84 87 63 90V124Q83 121 100 136Q117 121 137 124V90Q116 87 100 97Z" />
          <path d="M100 97V136M73 101Q84 100 93 106M73 110Q84 109 93 115M73 119Q84 118 93 124M107 106Q116 100 127 101M107 115Q116 109 127 110M107 124Q116 118 127 119" strokeWidth="1.5" />
          {/* The olive sprig rises from the binding, keeping a clear small-size silhouette. */}
          <path d="M100 91C102 79 114 66 130 57" strokeWidth="1.7" />
        </g>
        <g fill="currentColor">
          <path d="M107 79C97 79 95 73 97 70C105 69 110 73 107 79Z" />
          <path d="M112 72C113 62 120 58 124 59C125 67 120 73 112 72Z" />
          <path d="M117 65C109 61 108 56 111 53C119 52 122 58 117 65Z" />
          <path d="M124 61C124 52 130 48 136 49C137 56 132 61 124 61Z" />
          <circle cx="25" cy="100" r="1.7" />
          <circle cx="175" cy="100" r="1.7" />
        </g>
      </svg>
    </div>
  );
}
