/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/features/locale';
import { cn } from '@/lib/utils';
import { getPublicSolicitationCopy, PUBLIC_STEP_IDS, type PublicStepId } from '../lib/public-solicitation-copy';
import {
  PictogramClaim,
  PictogramDesk,
  PictogramWrite,
  SceneClaim,
  SceneDesk,
  SceneWrite,
} from './public-solicit-pictograms';

const STEP_MS = 3000;

const stepIcons = {
  write: PictogramWrite,
  desk: PictogramDesk,
  claim: PictogramClaim,
} as const;

const stepScenes = {
  write: SceneWrite,
  desk: SceneDesk,
  claim: SceneClaim,
} as const;

export function PublicSolicitSteps() {
  const { locale } = useLocale();
  const copy = getPublicSolicitationCopy(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const active = PUBLIC_STEP_IDS[activeIndex];
  const Preview = stepScenes[active];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % PUBLIC_STEP_IDS.length);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  function showStep(id: PublicStepId) {
    setActiveIndex(PUBLIC_STEP_IDS.indexOf(id));
    setPaused(true);
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby="solicitation-steps"
      onMouseLeave={() => setPaused(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <h2 id="solicitation-steps" className="sr-only">
        {copy.stepsTitle}
      </h2>
      <ol className="grid grid-cols-3 gap-3">
        {PUBLIC_STEP_IDS.map((id, index) => {
          const Icon = stepIcons[id];
          const selected = active === id;
          return (
            <li key={id} className="solicit-step-enter" style={{ animationDelay: `${index * 80}ms` }}>
              <button
                type="button"
                aria-pressed={selected}
                aria-controls="solicitation-step-preview"
                onClick={() => showStep(id)}
                onMouseEnter={() => showStep(id)}
                onFocus={() => showStep(id)}
                className={cn(
                  'flex w-full flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all duration-300',
                  selected
                    ? 'scale-[1.03] border-primary bg-primary text-primary-foreground shadow-md'
                    : 'bg-card hover:border-primary/50 hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    selected ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
                  )}
                >
                  {index + 1}
                </span>
                <Icon className="size-12" />
                <span className="text-base font-semibold">{copy.steps[id]}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id="solicitation-step-preview"
        role="region"
        aria-live="polite"
        className="overflow-hidden rounded-3xl border bg-card shadow-sm"
        onMouseEnter={() => setPaused(true)}
      >
        <div key={active} className="solicit-preview-enter flex flex-col items-center gap-4 px-5 py-6 md:flex-row md:gap-8 md:px-8 md:py-8">
          <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-primary/10 text-primary md:h-44 md:w-[22rem] md:shrink-0">
            <Preview className="h-28 w-full max-w-xs md:h-32" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-bold text-primary">
              {activeIndex + 1} / {PUBLIC_STEP_IDS.length}
            </p>
            <p className="text-2xl font-bold tracking-tight">{copy.steps[active]}</p>
            <p className="text-lg text-muted-foreground">{copy.stepPreviews[active]}</p>
          </div>
        </div>
        {reduceMotion ? null : (
          <div className="h-1 bg-primary/15">
            <div key={active} data-paused={paused} className="solicit-progress h-full bg-primary" />
          </div>
        )}
      </div>
    </section>
  );
}