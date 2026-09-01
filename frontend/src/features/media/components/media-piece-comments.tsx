/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getLocaleCopy, useLocale } from '@/features/locale';
import type { Member } from '@/features/users/types/member';
import { cn } from '@/lib/utils';
import { formatActivityWhen } from '../lib/format-history-event';
import { getMediaCopy } from '../lib/media-copy';
import { personNames } from '../lib/piece-person';
import { useMediaComments } from '../hooks/use-media-comments';
import { MEDIA_REACTION_EMOJIS } from '../types/media-comment';
import { MediaActivityPager } from './media-activity-pager';

export function MediaPieceComments({
  pieceId,
  members,
  actorUid,
  compact,
}: {
  pieceId: string;
  members: Member[];
  actorUid?: string;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { comments, page, pageSize, total, loading, error, setPage, addComment, reactToComment } =
    useMediaComments(pieceId);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = body.trim();
    if (!next) return;
    setSaving(true);
    try {
      await addComment(next);
      setBody('');
      toast.success(mediaCopy.commentPosted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-4 border-t pt-8" aria-labelledby={`media-comments-${pieceId}`}>
      <div>
        <h3 id={`media-comments-${pieceId}`} className="text-sm font-medium">
          {mediaCopy.commentsTitle}
        </h3>
        {compact ? null : <p className="text-xs text-muted-foreground">{mediaCopy.commentsDescription}</p>}
      </div>
      <form className="grid gap-2" onSubmit={(event) => void onSubmit(event)}>
        <Textarea
          id={`media-comment-${pieceId}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={mediaCopy.commentPlaceholder}
          maxLength={800}
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={saving || !body.trim()}>
            {mediaCopy.commentPost}
          </Button>
        </div>
      </form>
      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!loading && !error && comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{mediaCopy.commentsEmpty}</p>
      ) : null}
      <ul className="grid gap-3">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-lg border bg-card p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{comment.authorName || comment.authorUid}</p>
              <p className="text-xs text-muted-foreground">{formatActivityWhen(comment.createdAt, locale)}</p>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
            <div className="mt-2 flex flex-wrap gap-1" aria-label={mediaCopy.reactLabel}>
              {MEDIA_REACTION_EMOJIS.map((emoji) => {
                const uids = comment.reactions[emoji] ?? [];
                const active = Boolean(actorUid && uids.includes(actorUid));
                return (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 px-2 text-xs', active && 'bg-accent')}
                    aria-pressed={active}
                    title={uids.length ? personNames(members, uids, '') : mediaCopy.reactLabel}
                    onClick={() => void reactToComment(comment.id, emoji)}
                  >
                    {emoji}
                    {uids.length ? <span className="text-muted-foreground">{uids.length}</span> : null}
                  </Button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <MediaActivityPager page={page} pageSize={pageSize} total={total} onPage={setPage} />
    </section>
  );
}
