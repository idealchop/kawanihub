/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSolicitationCopy } from '@/features/solicitation/lib/solicitation-copy';
import { useSolicitations } from '@/features/solicitation/hooks/use-solicitations';
import {
  SOLICITATION_KINDS,
  SOLICITATION_STATUSES,
  type Solicitation,
  type SolicitationKind,
} from '@/features/solicitation/types/solicitation';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { queueHref } from '../lib/las-pinas-districts';
import {
  KIND_COLORS,
  OPEN_DESK_STATUSES,
  STATUS_COLORS,
  buildLasPinasMap,
  loadFill,
  loadLabelTone,
} from '../lib/las-pinas-map-model';
import {
  buildDailyKindSeries,
  countByBarangay,
  filterBriefingRows,
  localDayKey,
  shiftDay,
  type KindFilter,
  type StatusFilter,
} from '../lib/map-briefing';
import type { AppLocale } from '@/lib/locale';
import { DailyKindChart } from './daily-kind-chart';
import { MixBar } from './mix-bar';

const NAME_AREA = 4200;

export function LasPinasBarangayMap({ locale }: { locale: AppLocale }) {
  const dashboardCopy = getDashboardCopy(locale);
  const solicitationCopy = getSolicitationCopy(locale);
  const { solicitations } = useSolicitations();
  const { shapes, width, height } = useMemo(() => buildLasPinasMap(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [from, setFrom] = useState(() => shiftDay(localDayKey(), -13));
  const [to, setTo] = useState(() => localDayKey());
  const [status, setStatus] = useState<StatusFilter>('open');
  const [kind, setKind] = useState<KindFilter>('all');

  const filtered = useMemo(
    () => filterBriefingRows(solicitations, { from, to, status, kind }),
    [solicitations, from, to, status, kind],
  );
  const counts = useMemo(() => countByBarangay(filtered), [filtered]);
  const max = Math.max(1, ...Object.values(counts), 0);
  const chartRows = useMemo(
    () => (selected ? filtered.filter((row) => row.barangay === selected) : filtered),
    [filtered, selected],
  );
  const selectedRows = selected ? chartRows : [];
  const series = useMemo(() => buildDailyKindSeries(chartRows, from, to), [chartRows, from, to]);
  const typeItems = SOLICITATION_KINDS.map((code) => ({
    key: code,
    label: solicitationCopy.kinds[code],
    value: chartRows.filter((row) => row.kind === code).length,
    color: KIND_COLORS[code],
  }));
  const pipelineCodes =
    status === 'all' ? SOLICITATION_STATUSES : status === 'open' ? OPEN_DESK_STATUSES : [status];
  const pipelineItems = pipelineCodes.map((code) => ({
    key: code,
    label: solicitationCopy.statuses[code],
    value: chartRows.filter((row) => row.status === code).length,
    color: STATUS_COLORS[code],
  }));
  const hoverShape = shapes.find((shape) => shape.name === hovered);

  function toggleBarangay(name: string) {
    setSelected((current) => (current === name ? null : name));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <FilterField id="map-from" label={dashboardCopy.filterFrom}>
          <Input id="map-from" type="date" value={from} onChange={(event) => event.target.value && setFrom(event.target.value)} />
        </FilterField>
        <FilterField id="map-to" label={dashboardCopy.filterTo}>
          <Input id="map-to" type="date" value={to} onChange={(event) => event.target.value && setTo(event.target.value)} />
        </FilterField>
        <FilterField id="map-status" label={dashboardCopy.filterStatus}>
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger id="map-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">{dashboardCopy.filterOpen}</SelectItem>
              <SelectItem value="all">{dashboardCopy.filterAll}</SelectItem>
              {SOLICITATION_STATUSES.map((code) => (
                <SelectItem key={code} value={code}>
                  {solicitationCopy.statuses[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField id="map-type" label={dashboardCopy.filterType}>
          <Select value={kind} onValueChange={(value) => setKind(value as KindFilter)}>
            <SelectTrigger id="map-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dashboardCopy.filterAll}</SelectItem>
              {SOLICITATION_KINDS.map((code) => (
                <SelectItem key={code} value={code}>
                  {solicitationCopy.kinds[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MixSummary
          title={selected ? dashboardCopy.pipelineMixIn(selected) : dashboardCopy.pipelineMix}
          items={pipelineItems}
          empty={dashboardCopy.noBreakdown}
        />
        <MixSummary
          title={selected ? dashboardCopy.typeMixIn(selected) : dashboardCopy.typeMix}
          items={typeItems}
          empty={dashboardCopy.noBreakdown}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start">
        <div className="relative overflow-visible rounded-2xl border bg-[#f6f8fb] p-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full overflow-visible [&_path]:outline-none [&_path]:ring-0 [&_path]:shadow-none [&_path:focus]:outline-none [&_path:focus-visible]:outline-none [&_path:focus-visible]:ring-0"
            role="group"
            aria-label={dashboardCopy.barangayLoad}
            onMouseLeave={() => setHovered(null)}
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            {[...shapes]
              .sort((left, right) => Number(left.name === selected) - Number(right.name === selected))
              .map((shape) => {
                const count = counts[shape.name] ?? 0;
                const active = selected === shape.name;
                const tone = loadLabelTone(count, max);
                const showName = shape.area >= NAME_AREA;
                const dimmed = Boolean(selected) && !active;
                const { x, y } = shape.centroid;
                return (
                  <g
                    key={shape.name}
                    onMouseEnter={() => setHovered(shape.name)}
                    onFocus={() => setHovered(shape.name)}
                    className="outline-none"
                    style={{
                      outline: 'none',
                      transformBox: 'view-box',
                      transformOrigin: `${x}px ${y}px`,
                      transform: active ? 'scale(1.28)' : hovered === shape.name ? 'scale(1.06)' : 'scale(1)',
                      transition: 'transform 220ms ease, filter 220ms ease, opacity 220ms ease',
                      opacity: dimmed && hovered !== shape.name ? 0.4 : 1,
                      filter: active
                        ? 'drop-shadow(0 14px 22px rgb(15 76 129 / 0.35))'
                        : dimmed
                          ? hovered === shape.name
                            ? 'blur(1px)'
                            : 'blur(2.8px)'
                          : undefined,
                    }}
                  >
                    <path
                      d={shape.path}
                      fill={loadFill(count, max)}
                      stroke={active ? '#0F4C81' : '#fff'}
                      strokeWidth={active ? 2.2 : 1.1}
                      className="cursor-pointer"
                      style={{ outline: 'none' }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      aria-label={`${shape.name}, ${count}`}
                      onClick={() => toggleBarangay(shape.name)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          toggleBarangay(shape.name);
                        }
                      }}
                    />
                    <text
                      x={shape.centroid.x}
                      y={shape.centroid.y + (showName ? 7 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      fill={tone === 'light' ? '#f8fafc' : '#1e293b'}
                      fontSize={showName ? 15 : 12}
                      fontWeight="700"
                    >
                      {count}
                    </text>
                    {showName ? (
                      <text
                        x={shape.centroid.x}
                        y={shape.centroid.y - 10}
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                        fill={tone === 'light' ? '#e2e8f0' : '#475569'}
                        fontSize="9"
                        fontWeight="600"
                      >
                        {shape.name}
                      </text>
                    ) : null}
                  </g>
                );
              })}
          </svg>
          {hoverShape ? (
            <div
              className="pointer-events-none absolute z-10 min-w-40 rounded-xl border bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
              style={{
                left: `${Math.min(72, Math.max(4, (hoverShape.centroid.x / width) * 100))}%`,
                top: `${Math.min(78, Math.max(6, (hoverShape.centroid.y / height) * 100))}%`,
              }}
            >
              <p className="text-sm font-medium">{hoverShape.name}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {dashboardCopy.openInBarangay(counts[hoverShape.name] ?? 0)}
              </p>
            </div>
          ) : null}
          <div className="pointer-events-none absolute right-3 top-3 z-20 w-[min(17rem,calc(100%-1.5rem))] rounded-xl border bg-white/95 p-3 shadow-md backdrop-blur">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
              {status === 'open' ? dashboardCopy.legendTitle : dashboardCopy.casesLabel}
            </p>
            <LoadLegend max={max} lowLabel={dashboardCopy.legendLow} highLabel={dashboardCopy.legendHigh} />
          </div>
        </div>

        <div className="space-y-3">
          {selected ? (
            <BarangayCaseList
              barangay={selected}
              rows={selectedRows}
              emptyBarangay={dashboardCopy.mapEmptyBarangay}
              openInQueue={dashboardCopy.openInQueue}
              showAll={dashboardCopy.showAll}
              onShowAll={() => setSelected(null)}
              casesLabel={dashboardCopy.casesLabel}
              statusLabels={solicitationCopy.statuses}
              kindLabels={solicitationCopy.kinds}
            />
          ) : null}
          <div className="rounded-2xl border bg-card px-4 py-3">
            <DailyKindChart
              points={series}
              kindLabels={solicitationCopy.kinds}
              empty={dashboardCopy.dailyChartEmpty}
              title={selected ? dashboardCopy.dailyChartIn(selected) : dashboardCopy.dailyChart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MixSummary({
  title,
  items,
  empty,
}: {
  title: string;
  items: { key: string; label: string; value: number; color: string }[];
  empty: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      {items.some((item) => item.value > 0) ? (
        <MixBar items={items} legendClassName="grid-cols-2 lg:grid-cols-2" />
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function FilterField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function LoadLegend({ max, lowLabel, highLabel }: { max: number; lowLabel: string; highLabel: string }) {
  const stops = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <span className="shrink-0 font-medium text-muted-foreground">{lowLabel}</span>
      <div className="flex h-3.5 min-w-0 flex-1 overflow-hidden rounded-full border">
        {stops.map((stop) => (
          <div key={stop} className="h-full flex-1" style={{ backgroundColor: loadFill(Math.round(stop * max), max) }} />
        ))}
      </div>
      <span className="shrink-0 font-semibold tabular-nums">{highLabel(max)}</span>
    </div>
  );
}

function BarangayCaseList({
  barangay,
  rows,
  emptyBarangay,
  openInQueue,
  showAll,
  onShowAll,
  casesLabel,
  statusLabels,
  kindLabels,
}: {
  barangay: string;
  rows: Solicitation[];
  emptyBarangay: string;
  openInQueue: string;
  showAll: string;
  onShowAll: () => void;
  casesLabel: string;
  statusLabels: Record<string, string>;
  kindLabels: Record<SolicitationKind, string>;
}) {
  return (
    <div className="flex max-h-[22rem] flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="font-medium tracking-tight">{barangay}</p>
          <p className="text-sm tabular-nums text-muted-foreground">{rows.length}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={onShowAll}>
            {showAll}
          </button>
          <Link href={queueHref({ barangay })} className="text-sm font-medium text-primary hover:underline">
            {openInQueue}
          </Link>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyBarangay}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{casesLabel}</p>
            <ul className="divide-y rounded-xl border">
              {rows.map((row) => (
                <li key={row.id} className="px-3 py-2.5">
                  <p className="text-sm font-medium">{row.requesterName}</p>
                  <p className="text-xs text-muted-foreground">
                    {kindLabels[row.kind]} · {statusLabels[row.status]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
