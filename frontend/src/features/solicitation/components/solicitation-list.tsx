/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, FileDown, FileSpreadsheet, FileText, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { useMembers } from '@/features/users/hooks/use-members';
import { useSolicitations } from '../hooks/use-solicitations';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import type { SolicitationReportFormat } from '../services/solicitation-api';
import {
  SolicitationActionCell,
  SolicitationAssignCell,
  SolicitationDetailsCell,
  SolicitationQueueRow,
  SolicitationStatusCell,
} from './solicitation-queue-row';
import { SolicitationWorkDialog, type CasePane } from './solicitation-work-dialog';
import {
  SOLICITATION_KINDS,
  type Solicitation,
  type SolicitationKind,
  type SolicitationStatus,
} from '../types/solicitation';
import { BARANGAY_OPTIONS } from '../lib/barangay-list';
import { STATUS_COLORS } from '@/features/dashboard/lib/las-pinas-map-model';

const UNASSIGNED_FILTER = '__unassigned__';
const LIVE_STATUS_FILTER_ORDER: SolicitationStatus[] = [
  'under_review',
  'pending_validation',
  'rejected',
  'eligible',
  'ready_to_claim',
];
const KPI_STATUS_ORDER: SolicitationStatus[] = [
  'under_review',
  'pending_validation',
  'eligible',
  'ready_to_claim',
];

export function SolicitationList() {
  const { locale } = useLocale();
  const copy = getSolicitationCopy(locale);
  const chrome = getLocaleCopy(locale);
  const {
    solicitations,
    loading,
    error,
    deskRole,
    reviewSolicitation,
    assignSolicitation,
    updateSolicitation,
    approveSolicitation,
    markReadyToClaim,
    rejectSolicitation,
    downloadSolicitationReport,
  } = useSolicitations();
  const { members } = useMembers();
  const searchParams = useSearchParams();
  const [openCase, setOpenCase] = useState<{ id: string; pane: CasePane } | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const selected = solicitations.find((row) => row.id === openCase?.id) ?? null;
  const canAssign = deskRole === 'admin';

  async function generateReport(format: SolicitationReportFormat) {
    setReportBusy(true);
    try {
      await downloadSolicitationReport(format);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.reportError);
    } finally {
      setReportBusy(false);
    }
  }

  async function assignCase(id: string, input: { reviewerUid: string; accountantUid: string }) {
    setAssigningId(id);
    try {
      await assignSolicitation(id, input);
      toast.success(copy.assigned);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setAssigningId(null);
    }
  }

  const columns: DataTableColumn<Solicitation>[] = [
    {
      id: 'details',
      header: copy.detailsLabel,
      accessor: (row) => row.requesterName,
      sortable: true,
      className: 'min-w-52 py-4',
      render: (row) => <SolicitationDetailsCell row={row} copy={copy} />,
    },
    {
      id: 'reviewer',
      header: copy.reviewerLabel,
      accessor: (row) => row.assignedReviewerName,
      sortable: true,
      className: 'min-w-36 py-4',
      render: (row) => (
        <SolicitationAssignCell
          row={row}
          copy={copy}
          members={members}
          canEdit={canAssign}
          pending={assigningId === row.id}
          role="reviewer"
          onAssign={(input) => void assignCase(row.id, input)}
        />
      ),
    },
    {
      id: 'accountant',
      header: copy.accountantLabel,
      accessor: (row) => row.assignedAccountantName,
      sortable: true,
      className: 'min-w-36 py-4',
      render: (row) => (
        <SolicitationAssignCell
          row={row}
          copy={copy}
          members={members}
          canEdit={canAssign}
          pending={assigningId === row.id}
          role="accountant"
          onAssign={(input) => void assignCase(row.id, input)}
        />
      ),
    },
    {
      id: 'status',
      header: copy.statusLabel,
      accessor: (row) => row.status,
      sortable: true,
      className: 'min-w-36 py-4',
      render: (row) => <SolicitationStatusCell row={row} copy={copy} />,
    },
    {
      id: 'action',
      header: copy.actionLabel,
      accessor: (row) => row.status,
      className: 'w-12 py-4 text-right',
      render: (row) => (
        <SolicitationActionCell
          row={row}
          copy={copy}
          deskRole={deskRole}
          onViewDetails={() => setOpenCase({ id: row.id, pane: 'details' })}
          onReview={() => setOpenCase({ id: row.id, pane: 'review' })}
          onLogs={() => setOpenCase({ id: row.id, pane: 'logs' })}
        />
      ),
    },
    {
      id: 'updatedAt',
      header: copy.statusLabel,
      accessor: (row) => Date.parse(row.updatedAt) || 0,
      sortable: true,
      hidden: true,
    },
  ];

  const sharedFilters: DataTableFilter<Solicitation>[] = [
    {
      id: 'kind',
      label: copy.kindFilter,
      options: SOLICITATION_KINDS.map((value: SolicitationKind) => ({
        value,
        label: copy.kinds[value],
      })),
      getValue: (row) => row.kind,
    },
    {
      id: 'barangay',
      label: copy.barangayLabel,
      options: BARANGAY_OPTIONS.map((name) => ({ value: name, label: name })),
      getValue: (row) => row.barangay,
    },
    {
      id: 'assignTo',
      label: copy.assignToFilter,
      options: [
        { value: UNASSIGNED_FILTER, label: copy.unassigned },
        ...members
          .filter((member) => member.status === 'active')
          .map((member) => ({ value: member.uid, label: member.displayName })),
      ],
      getValue: (row) => row.assignedReviewerUid,
      matches: (row, selected) => {
        if (selected === UNASSIGNED_FILTER) {
          return !row.assignedReviewerUid && !row.assignedAccountantUid;
        }
        return row.assignedReviewerUid === selected || row.assignedAccountantUid === selected;
      },
    },
  ];
  const liveFilters: DataTableFilter<Solicitation>[] = [
    {
      id: 'status',
      label: copy.statusLabel,
      options: LIVE_STATUS_FILTER_ORDER.map((value) => ({
        value,
        label: copy.statuses[value],
      })),
      getValue: (row) => row.status,
    },
    ...sharedFilters,
  ];
  const liveRows = solicitations.filter((row) => row.status !== 'claimed');
  const archivedRows = solicitations.filter((row) => row.status === 'claimed');
  const openCount = liveRows.length;
  const queueKpis = KPI_STATUS_ORDER.map((status) => ({
    status,
    label: copy.nextActions[status],
    value: liveRows.filter((row) => row.status === status).length,
    color: STATUS_COLORS[status],
  }));
  const statusParam = searchParams.get('status') ?? '';
  const barangayParam = searchParams.get('barangay') ?? '';
  const liveStatusFilter = LIVE_STATUS_FILTER_ORDER.find((value) => value === statusParam);
  const barangayFilter = BARANGAY_OPTIONS.find((value) => value === barangayParam);
  const liveDefaultFilters = {
    ...(liveStatusFilter ? { status: liveStatusFilter } : {}),
    ...(barangayFilter ? { barangay: barangayFilter } : {}),
  };

  function renderTable(
    rows: Solicitation[],
    filters: DataTableFilter<Solicitation>[],
    emptyTitle: string,
    defaultFilters?: Record<string, string>,
    tableKey?: string,
  ) {
    return (
      <DataTable
        key={tableKey}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder={copy.searchPlaceholder}
        searchValue={(row) =>
          `${row.requesterName} ${row.beneficiaryName} ${row.barangay} ${row.controlNumber} ${row.idNumber} ${row.relatives.map((item) => item.name).join(' ')}`
        }
        filters={filters}
        defaultFilters={defaultFilters}
        defaultSort={{ columnId: 'updatedAt', direction: 'desc' }}
        pageSize={8}
        pageSizeOptions={[8, 16, 32]}
        emptyTitle={emptyTitle}
        onRowClick={(row) => setOpenCase({ id: row.id, pane: 'details' })}
        renderCard={(row) => (
          <SolicitationQueueRow
            row={row}
            copy={copy}
            deskRole={deskRole}
            members={members}
            assignPending={assigningId === row.id}
            onViewDetails={() => setOpenCase({ id: row.id, pane: 'details' })}
            onReview={() => setOpenCase({ id: row.id, pane: 'review' })}
            onLogs={() => setOpenCase({ id: row.id, pane: 'logs' })}
            onAssign={(input) => void assignCase(row.id, input)}
          />
        )}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
        {deskRole === 'admin' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={reportBusy}>
                <FileDown />
                {copy.report}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" onSelect={() => void generateReport('xlsx')}>
                <FileSpreadsheet className="size-4" />
                {copy.reportExcel}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={() => void generateReport('csv')}>
                <FileText className="size-4" />
                {copy.reportCsv}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={() => void generateReport('pdf')}>
                <ScrollText className="size-4" />
                {copy.reportPdf}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {queueKpis.map((kpi) => {
              const width = openCount > 0 ? Math.round((kpi.value / openCount) * 100) : 0;
              return (
                <Link key={kpi.status} href={`/solicitation?status=${kpi.status}`} className="block min-w-0">
                  <Card className="h-full overflow-hidden transition-colors hover:bg-accent/40">
                    <div className="h-1" style={{ backgroundColor: kpi.color }} />
                    <CardHeader className="p-3.5 sm:p-4">
                      <CardDescription className="text-xs leading-snug">{kpi.label}</CardDescription>
                      <CardTitle className="text-2xl tabular-nums tracking-tight">{kpi.value}</CardTitle>
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: kpi.color }} />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">{copy.queueTab}</TabsTrigger>
            <TabsTrigger value="archived">{copy.archived}</TabsTrigger>
          </TabsList>
          <TabsContent value="queue">
            {renderTable(liveRows, liveFilters, copy.empty, liveDefaultFilters, `queue:${statusParam}:${barangayParam}`)}
          </TabsContent>
          <TabsContent value="archived">{renderTable(archivedRows, sharedFilters, copy.emptyArchived, undefined, 'archived')}</TabsContent>
        </Tabs>
        </>
      ) : null}

      <SolicitationWorkDialog
        row={selected}
        open={Boolean(selected)}
        initialPane={openCase?.pane ?? 'details'}
        onOpenChange={(next) => {
          if (!next) setOpenCase(null);
        }}
        deskRole={deskRole}
        onReview={reviewSolicitation}
        onUpdate={updateSolicitation}
        onApprove={approveSolicitation}
        onMarkReady={markReadyToClaim}
        onReject={rejectSolicitation}
        onViewCase={(id) => setOpenCase({ id, pane: 'details' })}
      />
    </div>
  );
}
