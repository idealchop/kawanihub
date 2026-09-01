/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { useMembers } from '@/features/users/hooks/use-members';
import { cn } from '@/lib/utils';
import { ContentTypeIcon } from '../lib/content-type-icons';
import { getMediaCopy } from '../lib/media-copy';
import { assignableMembers } from '../lib/piece-person';
import { statusFromDates } from '../lib/status-from-dates';
import { MemberMultiSelect } from './member-multi-select';
import { isActiveContentType, type MediaContentType } from '../types/media-content-type';
import {
  MEDIA_STATUSES,
  type MediaDateField,
  type MediaPiece,
  type MediaPieceWriteInput,
  type MediaStatus,
} from '../types/media-piece';

const FORM_ID = 'media-piece-form';

function Field({
  htmlFor,
  label,
  hint,
  className,
  children,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function hasDetails(piece: MediaPiece | null) {
  return Boolean(piece?.caption || piece?.subs || piece?.driveUrl || piece?.fbUrl);
}

function PieceForm({
  piece,
  types,
  lockedType,
  defaultDate,
  defaultDateField,
  onSave,
  onClose,
}: {
  piece: MediaPiece | null;
  types: MediaContentType[];
  lockedType?: string;
  defaultDate?: string;
  defaultDateField?: MediaDateField;
  onSave: (input: MediaPieceWriteInput) => Promise<unknown>;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { members } = useMembers();
  const people = assignableMembers(members);
  const isCreate = !piece;
  const initialShoot = piece?.shootDate ?? (defaultDateField === 'shoot' ? (defaultDate ?? '') : '');
  const initialPublish = piece?.publishDate ?? (defaultDateField === 'publish' ? (defaultDate ?? '') : '');
  const [title, setTitle] = useState(piece?.title ?? '');
  const [type, setType] = useState<string | null>(piece?.type ?? lockedType ?? null);
  const [shootDate, setShootDate] = useState(initialShoot);
  const [publishDate, setPublishDate] = useState(initialPublish);
  const [status, setStatus] = useState<MediaStatus>(
    piece?.status ?? statusFromDates(initialShoot, initialPublish),
  );
  const [caption, setCaption] = useState(piece?.caption ?? '');
  const [editorUids, setEditorUids] = useState<string[]>(
    piece?.editorUids ?? (piece?.editorUid || piece?.personUid ? [piece.editorUid || piece.personUid] : []),
  );
  const [reviewerUids, setReviewerUids] = useState<string[]>(
    piece?.reviewerUids ?? (piece?.reviewerUid ? [piece.reviewerUid] : []),
  );
  const [deployedUids, setDeployedUids] = useState<string[]>(piece?.deployedUids ?? []);
  const [driveUrl, setDriveUrl] = useState(piece?.driveUrl ?? '');
  const [fbUrl, setFbUrl] = useState(piece?.fbUrl ?? '');
  const [episode, setEpisode] = useState(piece?.episode ?? '');
  const [subs, setSubs] = useState(piece?.subs ?? '');
  const [showDetails, setShowDetails] = useState(() => hasDetails(piece));
  const [pending, setPending] = useState(false);
  const typeOptions = types.filter((row) => isActiveContentType(row) || row.slug === type);

  function applyDates(nextShoot: string, nextPublish: string) {
    setShootDate(nextShoot);
    setPublishDate(nextPublish);
    if (isCreate) setStatus(statusFromDates(nextShoot, nextPublish));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!type) return;
    setPending(true);
    try {
      await onSave({
        title,
        type,
        status,
        caption,
        editorUids,
        reviewerUids,
        deployedUids,
        shootDate,
        publishDate,
        driveUrl,
        fbUrl,
        episode,
        subs,
      });
      toast.success(piece ? mediaCopy.updated : mediaCopy.created);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DialogHeader className="px-8 py-5">
        <DialogTitle>{piece ? mediaCopy.editTitle : mediaCopy.addTitle}</DialogTitle>
        <DialogDescription>{piece ? mediaCopy.formDescription : mediaCopy.composeDescription}</DialogDescription>
      </DialogHeader>
      <DialogBody className="px-8 py-8">
        <form id={FORM_ID} onSubmit={onSubmit} className="grid gap-8">
          <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_8rem]">
              {lockedType ? (
                <Field htmlFor="media-piece-title" label={mediaCopy.nameLabel}>
                  <Input
                    id="media-piece-title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </Field>
              ) : (
                <Field htmlFor="media-piece-type" label={mediaCopy.typePickerLabel}>
                  <Select value={type ?? undefined} onValueChange={setType}>
                    <SelectTrigger id="media-piece-type" className="h-10">
                      <SelectValue placeholder={mediaCopy.typePickerLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((row) => (
                        <SelectItem key={row.id} value={row.slug}>
                          <span className="inline-flex items-center gap-2">
                            <ContentTypeIcon icon={row.icon} className="size-3.5" />
                            {row.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field htmlFor="media-piece-episode" label={mediaCopy.episodeLabel}>
                <Input
                  id="media-piece-episode"
                  className="h-10"
                  value={episode}
                  onChange={(event) => setEpisode(event.target.value)}
                />
              </Field>
            </div>
            {lockedType ? null : (
              <Field htmlFor="media-piece-title" label={mediaCopy.nameLabel}>
                <Input
                  id="media-piece-title"
                  required
                  className="h-10"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field htmlFor="media-piece-shoot" label={mediaCopy.shootLabel}>
              <Input
                id="media-piece-shoot"
                type="date"
                className="h-10"
                value={shootDate}
                onChange={(event) => applyDates(event.target.value, publishDate)}
              />
            </Field>
            <Field htmlFor="media-piece-publish" label={mediaCopy.publishLabel}>
              <Input
                id="media-piece-publish"
                type="date"
                className="h-10"
                value={publishDate}
                onChange={(event) => applyDates(shootDate, event.target.value)}
              />
            </Field>
            <Field
              htmlFor="media-piece-status"
              label={mediaCopy.statusLabel}
              hint={isCreate ? mediaCopy.statusFollowsDates : undefined}
              className="sm:col-span-2"
            >
              <Select value={status} onValueChange={(value) => setStatus(value as MediaStatus)}>
                <SelectTrigger id="media-piece-status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {MEDIA_STATUSES.map((key) => (
                    <SelectItem key={key} value={key}>
                      {mediaCopy.statuses[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <MemberMultiSelect
              id="media-piece-editor"
              label={mediaCopy.editorLabel}
              people={people}
              value={editorUids}
              onChange={setEditorUids}
              emptyLabel={mediaCopy.emptyField}
            />
            <MemberMultiSelect
              id="media-piece-reviewer"
              label={mediaCopy.reviewerLabel}
              people={people}
              value={reviewerUids}
              onChange={setReviewerUids}
              emptyLabel={mediaCopy.emptyField}
            />
            <MemberMultiSelect
              id="media-piece-deployed"
              label={mediaCopy.deployedLabel}
              people={people}
              value={deployedUids}
              onChange={setDeployedUids}
              emptyLabel={mediaCopy.emptyField}
              className="sm:col-span-2"
            />
          </div>

          <div className="grid gap-6">
            <button
              type="button"
              className="flex items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowDetails((open) => !open)}
              aria-expanded={showDetails}
            >
              <ChevronDown className={cn('size-4 shrink-0 transition-transform', showDetails && 'rotate-180')} />
              <span>{mediaCopy.detailsToggle}</span>
              <span className="text-xs">{mediaCopy.optionalLabel}</span>
            </button>
            {showDetails ? (
              <div className="grid gap-6">
                <Field htmlFor="media-piece-caption" label={mediaCopy.captionLabel}>
                  <Textarea
                    id="media-piece-caption"
                    value={caption}
                    rows={4}
                    onChange={(event) => setCaption(event.target.value)}
                  />
                </Field>
                <Field htmlFor="media-piece-subs" label={mediaCopy.subsLabel}>
                  <Textarea
                    id="media-piece-subs"
                    value={subs}
                    rows={3}
                    onChange={(event) => setSubs(event.target.value)}
                  />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field htmlFor="media-piece-drive" label={mediaCopy.driveUrlLabel}>
                    <Input
                      id="media-piece-drive"
                      className="h-10"
                      value={driveUrl}
                      placeholder={mediaCopy.linkPlaceholder}
                      onChange={(event) => setDriveUrl(event.target.value)}
                    />
                  </Field>
                  <Field htmlFor="media-piece-fb" label={mediaCopy.fbUrlLabel}>
                    <Input
                      id="media-piece-fb"
                      className="h-10"
                      value={fbUrl}
                      placeholder={mediaCopy.linkPlaceholder}
                      onChange={(event) => setFbUrl(event.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </DialogBody>
      <DialogFooter className="px-8 py-5">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          {mediaCopy.cancel}
        </Button>
        <Button type="submit" form={FORM_ID} disabled={pending || !type}>
          {pending ? chrome.saving : mediaCopy.save}
        </Button>
      </DialogFooter>
    </>
  );
}

export function MediaPieceDialog({
  piece,
  types,
  lockedType,
  defaultDate,
  defaultDateField,
  open,
  onOpenChange,
  onCreate,
  onUpdate,
}: {
  piece: MediaPiece | null;
  types: MediaContentType[];
  lockedType?: string;
  defaultDate?: string;
  defaultDateField?: MediaDateField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: MediaPieceWriteInput) => Promise<unknown>;
  onUpdate: (pieceId: string, input: MediaPieceWriteInput) => Promise<unknown>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        {open ? (
          <PieceForm
            key={piece?.id ?? `${lockedType ?? 'new'}:${defaultDateField ?? ''}:${defaultDate ?? ''}`}
            piece={piece}
            types={types}
            lockedType={lockedType}
            defaultDate={defaultDate}
            defaultDateField={defaultDateField}
            onSave={(input) => (piece ? onUpdate(piece.id, input) : onCreate(input))}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
