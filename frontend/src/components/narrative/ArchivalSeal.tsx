'use client';
import { useId } from 'react';

interface ArchivalSealProps {
  className?: string;
  size?: number;
}

/**
 * Handcrafted Archival Seal & Heritage Medallion (ختم السجل الوطني الفلسطيني)
 * Pure GPU-accelerated vector SVG — 0 byte raster dependencies, infinitely sharp,
 * dignified and historical archival aesthetic.
 */
export default function ArchivalSeal({ className = '', size = 140 }: ArchivalSealProps) {
  const id = useId();
  return (
    <div
      className={`archival-seal-wrap ${className}`}
      style={{ width: size, height: size }}
      role="img" aria-label="ختم حارس الأرشيف — أسماء لا تُنسى"
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="archival-seal-svg"
      >
        <defs>
          {/* Curved paths for text wrapping */}
          <path
            id={id + "-top"}
            d="M 28 100 A 72 72 0 0 1 172 100"
            fill="none"
          />
          <path
            id={id + "-bottom"}
            d="M 28 100 A 72 72 0 0 0 172 100"
            fill="none"
          />
          <path
            id={id + "-inner-top"}
            d="M 38 100 A 62 62 0 0 1 162 100"
            fill="none"
          />
          <path
            id={id + "-inner-bottom"}
            d="M 162 100 A 62 62 0 0 1 38 100"
            fill="none"
          />
        </defs>

        {/* Outer Fine Border */}
        <circle cx="100" cy="100" r="96" stroke="#436148" strokeWidth="1" strokeOpacity="0.4" />
        
        {/* Outer Beaded / Millgrained Ring */}
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke="#436148"
          strokeWidth="1.6"
          strokeDasharray="2 3.5"
          strokeOpacity="0.8"
        />

        {/* Primary Structural Ring */}
        <circle cx="100" cy="100" r="86" stroke="#436148" strokeWidth="1.4" strokeOpacity="0.75" />

        {/* Inner Border Ring */}
        <circle cx="100" cy="100" r="62" stroke="#436148" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="100" cy="100" r="58" stroke="#436148" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeOpacity="0.6" />

        {/* Top Arc Typography: Arabic Memorial Seal Title */}
        <text direction="rtl" className="seal-svg-text-primary" fill="#2d3f31">
          <textPath
            href={"#" + id + "-top"}
            startOffset="50%"
            textAnchor="middle"
          >
            أسماء لا تُنسى
          </textPath>
        </text>

        {/* Bottom Arc Typography: Archival Foundation & Scope */}
        <text direction="rtl" className="seal-svg-text-secondary" fill="#436148">
          <textPath
            href={"#" + id + "-bottom"}
            startOffset="50%"
            textAnchor="middle"
          >
            حارس الأرشيف
          </textPath>
        </text>

        {/* Left and Right Rosette Stars */}
        <g transform="translate(26, 100) scale(0.7)">
          <path d="M 0 -5 L 1.5 -1.5 L 5 0 L 1.5 1.5 L 0 5 L -1.5 1.5 L -5 0 L -1.5 -1.5 Z" fill="#436148" />
        </g>
        <g transform="translate(174, 100) scale(0.7)">
          <path d="M 0 -5 L 1.5 -1.5 L 5 0 L 1.5 1.5 L 0 5 L -1.5 1.5 L -5 0 L -1.5 -1.5 Z" fill="#436148" />
        </g>

        {/* Center Field: Olive Wreath + Emblematic Inscription */}
        {/* Left Olive Branch */}
        <g className="seal-olive-left" stroke="#436148" strokeLinecap="round">
          <path d="M 72 136 C 60 120 60 92 74 76" strokeWidth="1.2" fill="none" />
          {/* Leaves */}
          <ellipse cx="64" cy="120" rx="4.5" ry="2" transform="rotate(-35 64 120)" fill="#436148" opacity="0.85" />
          <ellipse cx="60" cy="105" rx="4.5" ry="2" transform="rotate(-20 60 105)" fill="#436148" opacity="0.85" />
          <ellipse cx="64" cy="90" rx="4.5" ry="2" transform="rotate(-5 64 90)" fill="#436148" opacity="0.85" />
          <ellipse cx="72" cy="78" rx="4" ry="1.8" transform="rotate(15 72 78)" fill="#436148" opacity="0.85" />
        </g>

        {/* Right Olive Branch */}
        <g className="seal-olive-right" stroke="#436148" strokeLinecap="round">
          <path d="M 128 136 C 140 120 140 92 126 76" strokeWidth="1.2" fill="none" />
          {/* Leaves */}
          <ellipse cx="136" cy="120" rx="4.5" ry="2" transform="rotate(35 136 120)" fill="#436148" opacity="0.85" />
          <ellipse cx="140" cy="105" rx="4.5" ry="2" transform="rotate(20 140 105)" fill="#436148" opacity="0.85" />
          <ellipse cx="136" cy="90" rx="4.5" ry="2" transform="rotate(5 136 90)" fill="#436148" opacity="0.85" />
          <ellipse cx="128" cy="78" rx="4" ry="1.8" transform="rotate(-15 128 78)" fill="#436148" opacity="0.85" />
        </g>

        {/* Center Typography: «فلسطين» and «سِجل الخلود» */}
        <text
          x="100"
          y="92"
          textAnchor="middle"
          direction="rtl" className="seal-center-title"
          fill="#1c261e"
        >
          فلسطين
        </text>
        <text
          x="100"
          y="108"
          textAnchor="middle"
          direction="rtl" className="seal-center-sub"
          fill="#436148"
        >
          ذاكرة حيّة
        </text>

        {/* Fine Underline and Archival Dot */}
        <line x1="84" y1="115" x2="116" y2="115" stroke="#436148" strokeWidth="0.8" strokeOpacity="0.6" />
        <circle cx="100" cy="121" r="1.5" fill="#436148" opacity="0.8" />
      </svg>
    </div>
  );
}
