/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function pictogram(props: IconProps) {
  return {
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function PictogramWrite(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <rect x="10" y="8" width="32" height="42" rx="3" />
      <path d="M16 18h20M16 26h16M16 34h12" />
      <path d="M38 40 52 26l6 6-14 14h-6v-6Z" />
    </svg>
  );
}

export function PictogramTicket(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <path d="M8 22h48v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V22Z" />
      <path d="M8 22c4 0 4-6 8-6h32c4 0 4 6 8 6" />
      <circle cx="22" cy="34" r="4" />
      <path d="M32 30h16M32 38h12" />
    </svg>
  );
}

export function PictogramPapers(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <rect x="18" y="10" width="28" height="36" rx="2" />
      <rect x="12" y="16" width="28" height="36" rx="2" />
      <path d="M18 26h16M18 34h12" />
    </svg>
  );
}

export function PictogramDesk(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <circle cx="32" cy="18" r="8" />
      <path d="M18 50v-8a14 14 0 0 1 28 0v8" />
      <path d="M44 36 50 42l10-12" />
    </svg>
  );
}

export function PictogramCode(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <rect x="8" y="16" width="48" height="32" rx="4" />
      <path d="M18 28h8M18 36h14M36 26h14v16H36z" />
      <path d="M40 32h6M40 38h4" />
    </svg>
  );
}

export function PictogramClaim(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <circle cx="20" cy="18" r="7" />
      <circle cx="44" cy="18" r="7" />
      <path d="M8 50v-6a12 12 0 0 1 20-8" />
      <path d="M56 50v-6a12 12 0 0 0-20-8" />
      <path d="M26 42h12v8H26z" />
    </svg>
  );
}

export function PictogramHome(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <path d="M8 30 32 10l24 20" />
      <path d="M14 26v26h36V26" />
      <path d="M26 52V36h12v16" />
    </svg>
  );
}

export function PictogramMedical(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <rect x="26" y="8" width="12" height="48" rx="2" />
      <rect x="8" y="26" width="48" height="12" rx="2" />
    </svg>
  );
}

export function PictogramBurial(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <path d="M32 10c8 10 16 16 16 26a16 16 0 0 1-32 0c0-10 8-16 16-26Z" />
      <path d="M32 28v18M24 36h16" />
    </svg>
  );
}

export function PictogramEducation(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <path d="M8 26 32 14l24 12-24 12L8 26Z" />
      <path d="M16 30v12c6 4 26 4 32 0V30" />
      <path d="M56 26v16" />
    </svg>
  );
}

export function PictogramEvents(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <rect x="10" y="14" width="44" height="40" rx="4" />
      <path d="M10 26h44M20 10v8M44 10v8M22 36h8M34 36h8M22 44h8" />
    </svg>
  );
}

export function PictogramFinancial(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <circle cx="32" cy="32" r="20" />
      <path d="M32 18v28M24 24c4-4 12-4 16 0s-4 8-16 8 12 8 16 4" />
    </svg>
  );
}

export function PictogramDaily(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <circle cx="32" cy="32" r="10" />
      <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6" />
    </svg>
  );
}

export function PictogramCamera(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <path d="M10 22h44v30a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V22Z" />
      <path d="M20 22 24 12h16l4 10" />
      <circle cx="32" cy="36" r="9" />
    </svg>
  );
}

export function PictogramOk(props: IconProps) {
  return (
    <svg {...pictogram(props)}>
      <circle cx="32" cy="32" r="22" />
      <path d="m20 34 8 8 16-18" />
    </svg>
  );
}

function scene(props: IconProps) {
  return {
    viewBox: '0 0 160 96',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function SceneWrite(props: IconProps) {
  return (
    <svg {...scene(props)}>
      <rect x="18" y="16" width="70" height="64" rx="6" />
      <path d="M30 32h46M30 44h38M30 56h28" />
      <circle cx="118" cy="28" r="10" />
      <path d="M100 84v-12a18 18 0 0 1 36 0v12" />
      <path d="M96 62 124 40l8 8-28 22h-8v-8Z" />
    </svg>
  );
}

export function ScenePapers(props: IconProps) {
  return (
    <svg {...scene(props)}>
      <circle cx="42" cy="24" r="10" />
      <path d="M24 84v-14a18 18 0 0 1 36 0v14" />
      <rect x="88" y="18" width="36" height="48" rx="3" />
      <rect x="80" y="26" width="36" height="48" rx="3" />
      <rect x="72" y="34" width="36" height="48" rx="3" />
      <path d="M80 48h20M80 58h14" />
    </svg>
  );
}

export function SceneDesk(props: IconProps) {
  return (
    <svg {...scene(props)}>
      <circle cx="48" cy="22" r="10" />
      <path d="M30 78v-12a18 18 0 0 1 36 0v12" />
      <path d="M16 78h128" />
      <rect x="96" y="36" width="44" height="28" rx="4" />
      <path d="M106 50h24M106 58h16" />
      <path d="M118 20 128 30l18-18" />
    </svg>
  );
}

export function SceneCode(props: IconProps) {
  return (
    <svg {...scene(props)}>
      <rect x="28" y="22" width="104" height="56" rx="8" />
      <circle cx="56" cy="50" r="10" />
      <path d="M78 40h40M78 52h32M78 64h24" />
    </svg>
  );
}

export function SceneClaim(props: IconProps) {
  return (
    <svg {...scene(props)}>
      <circle cx="36" cy="22" r="10" />
      <circle cx="124" cy="22" r="10" />
      <path d="M18 84v-12a20 20 0 0 1 36-10" />
      <path d="M142 84v-12a20 20 0 0 0-36-10" />
      <rect x="64" y="48" width="32" height="28" rx="4" />
      <path d="M70 48v-8h20v8" />
    </svg>
  );
}
