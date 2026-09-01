/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import { getDueDiligence } from '../services/solicitation-api';
import {
  RELATIVE_RELATIONS,
  type DueDiligenceMatch,
  type DueDiligenceRecord,
  type RelativeRelation,
  type Solicitation,
} from '../types/solicitation';

type CopyText = ReturnType<typeof getSolicitationCopy>;

const COOLDOWN_DAYS = 90;

function withinCooldown(requestedAt: string, status: DueDiligenceRecord['status']): boolean {
  if (status === 'rejected') return false;
  const date = new Date(requestedAt);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

function personKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatDate(value: string, empty: string): string {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return empty;
  return date.toLocaleDateString();
}

function roleLabel(copy: CopyText, asRequestor: boolean, asBeneficiary: boolean): string {
  if (asRequestor && asBeneficiary) return copy.bothRoles;
  if (asRequestor) return copy.requestorRole;
  if (asBeneficiary) return copy.beneficiaryRole;
  return '';
}

function isCurrentParty(name: string, row: Pick<Solicitation, 'requesterName' | 'beneficiaryName'>): boolean {
  const key = personKey(name);
  if (!key) return false;
  if (key === personKey(row.requesterName)) return true;
  return Boolean(row.beneficiaryName.trim()) && key === personKey(row.beneficiaryName);
}

function RecordRow({
  record,
  copy,
  cooldown,
  onViewDetails,
}: {
  record: DueDiligenceRecord;
  copy: CopyText;
  cooldown?: boolean;
  onViewDetails?: (id: string) => void;
}) {
  const role = roleLabel(copy, record.asRequestor, record.asBeneficiary);
  return (
    <li className="rounded-xl border bg-background px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          {cooldown ? (
            <p className="flex items-center gap-1 font-medium text-destructive">
              <Flag className="size-3.5" aria-hidden />
              {copy.cooldownShort}
            </p>
          ) : null}
          <p className="font-medium">{record.controlNumber || copy.unassigned}</p>
          <p className="text-muted-foreground">
            {copy.kinds[record.kind]} · {copy.statuses[record.status]}
            {role ? ` · ${role}` : ''}
          </p>
          <p className="text-muted-foreground">
            {copy.dateRequested}: {formatDate(record.requestedAt, copy.unassigned)}
          </p>
          <p className="text-muted-foreground">
            {copy.dateReceived}: {formatDate(record.receivedAt, copy.unassigned)}
          </p>
        </div>
        {onViewDetails ? (
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => onViewDetails(record.id)}>
            {copy.viewDetails}
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function MatchCard({
  match,
  copy,
  pending,
  canTag,
  picked,
  onPick,
  onTag,
}: {
  match: DueDiligenceMatch;
  copy: CopyText;
  pending: boolean;
  canTag: boolean;
  picked: RelativeRelation | '';
  onPick: (relation: RelativeRelation | '') => void;
  onTag: () => void;
}) {
  const role = roleLabel(copy, match.asRequestor, match.asBeneficiary);
  const samePerson = match.confidence >= 100;
  const tagged = !samePerson && match.taggedRelative && match.relation ? copy.relations[match.relation] : '';
  const subtitle = [samePerson ? copy.samePersonTag : '', role, tagged].filter(Boolean).join(' · ');

  return (
    <details className="group rounded-2xl border bg-card">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-start gap-2">
          <ChevronRight className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{match.name}</span>
            {subtitle ? <span className="mt-0.5 block text-sm text-muted-foreground">{subtitle}</span> : null}
          </span>
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {match.confidence} {copy.confidenceLabel}
        </span>
      </summary>
      <div className="space-y-3 border-t px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.recordsLabel}</p>
        {match.records.length ? (
          <ul className="space-y-2">
            {match.records.map((record) => (
              <RecordRow key={record.id} record={record} copy={copy} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.recordsEmpty}</p>
        )}
        {samePerson ? null : match.taggedRelative && tagged ? (
          <p className="text-sm text-muted-foreground">
            {copy.taggedRelative}: {tagged}
          </p>
        ) : canTag ? (
          <div
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <label className="sr-only" htmlFor={`relation-${personKey(match.name).replace(/\s+/g, '-')}`}>
              {copy.relationLabel}
            </label>
            <select
              id={`relation-${personKey(match.name).replace(/\s+/g, '-')}`}
              className="w-full rounded-md border bg-background px-2 py-2 text-sm sm:max-w-48"
              value={picked}
              disabled={pending}
              onChange={(event) => onPick(event.target.value as RelativeRelation | '')}
            >
              <option value="">{copy.unassigned}</option>
              {RELATIVE_RELATIONS.map((relation) => (
                <option key={relation} value={relation}>
                  {copy.relations[relation]}
                </option>
              ))}
            </select>
            <Button variant="outline" disabled={pending || !picked} onClick={onTag}>
              {copy.tagRelative}
            </Button>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function SolicitHistoryList({
  matches,
  empty,
  copy,
  onViewDetails,
}: {
  matches: DueDiligenceMatch[];
  empty: string;
  copy: CopyText;
  onViewDetails?: (id: string) => void;
}) {
  const records = [...new Map(matches.flatMap((match) => match.records).map((record) => [record.id, record])).values()].sort(
    (left, right) => right.requestedAt.localeCompare(left.requestedAt),
  );
  if (!records.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {records.map((record) => (
        <RecordRow
          key={record.id}
          record={record}
          copy={copy}
          cooldown={withinCooldown(record.requestedAt, record.status)}
          onViewDetails={onViewDetails}
        />
      ))}
    </ul>
  );
}

function isSamePerson(match: DueDiligenceMatch): boolean {
  return match.confidence >= 100;
}

function isTaggedRelative(match: DueDiligenceMatch): boolean {
  return !isSamePerson(match) && match.taggedRelative;
}

function MatchList({
  matches,
  empty,
  copy,
  pending,
  canTag,
  picked,
  row,
  onPick,
  onTagRelative,
}: {
  matches: DueDiligenceMatch[];
  empty: string;
  copy: CopyText;
  pending: boolean;
  canTag: boolean;
  picked: Record<string, RelativeRelation | ''>;
  row: Solicitation;
  onPick: (name: string, relation: RelativeRelation | '') => void;
  onTagRelative: (name: string, relation: RelativeRelation) => Promise<unknown> | void;
}) {
  if (!matches.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <MatchCard
          key={personKey(match.name)}
          match={match}
          copy={copy}
          pending={pending}
          canTag={canTag && !isSamePerson(match) && !match.taggedRelative && !isCurrentParty(match.name, row)}
          picked={picked[personKey(match.name)] ?? ''}
          onPick={(relation) => onPick(match.name, relation)}
          onTag={() => {
            const relation = picked[personKey(match.name)];
            if (!relation) return;
            void onTagRelative(match.name, relation);
          }}
        />
      ))}
    </div>
  );
}

export function SolicitationDueDiligence({
  row,
  copy,
  pending,
  canTag,
  onTagRelative,
  onViewDetails,
}: {
  row: Solicitation;
  copy: CopyText;
  pending: boolean;
  canTag: boolean;
  onTagRelative: (name: string, relation: RelativeRelation) => Promise<unknown> | void;
  onViewDetails?: (id: string) => void;
}) {
  const [matches, setMatches] = useState<DueDiligenceMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, RelativeRelation | ''>>({});
  const { locale } = useLocale();
  const chrome = getLocaleCopy(locale);
  const relativesKey = row.relatives.map((relative) => `${relative.name}:${relative.relation}`).join('|');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getDueDiligence(row.id)
      .then((payload) => {
        if (cancelled) return;
        setMatches(payload.matches);
      })
      .catch((err) => {
        if (cancelled) return;
        setMatches([]);
        setError(err instanceof Error ? err.message : copy.dueDiligenceLoadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [copy.dueDiligenceLoadError, relativesKey, row.id]);

  const history = matches.filter(isSamePerson);
  const relatives = matches.filter(isTaggedRelative);
  const triage = matches.filter((match) => !isSamePerson(match) && !isTaggedRelative(match));

  function listProps(rows: DueDiligenceMatch[], empty: string, allowTag: boolean) {
    return {
      matches: rows,
      empty,
      copy,
      pending,
      canTag: allowTag && canTag,
      picked,
      row,
      onPick: (name: string, relation: RelativeRelation | '') => {
        setPicked((current) => ({ ...current, [personKey(name)]: relation }));
      },
      onTagRelative,
    };
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <p className="text-sm font-medium">{copy.dueDiligenceLabel}</p>
      {loading ? (
        <p className="text-sm text-muted-foreground">{chrome.loading}</p>
      ) : error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : (
        <Tabs defaultValue="triage">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="triage" className="whitespace-normal px-1.5 text-center leading-tight">
              {copy.triageTab}
            </TabsTrigger>
            <TabsTrigger value="history" className="whitespace-normal px-1.5 text-center leading-tight">
              {copy.solicitHistoryTab}
            </TabsTrigger>
            <TabsTrigger value="relative" className="whitespace-normal px-1.5 text-center leading-tight">
              {copy.relativeTab}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="triage">
            <MatchList {...listProps(triage, copy.triageEmpty, true)} />
          </TabsContent>
          <TabsContent value="history">
            <SolicitHistoryList matches={history} empty={copy.historyEmpty} copy={copy} onViewDetails={onViewDetails} />
          </TabsContent>
          <TabsContent value="relative">
            <MatchList {...listProps(relatives, copy.relativeEmpty, false)} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
