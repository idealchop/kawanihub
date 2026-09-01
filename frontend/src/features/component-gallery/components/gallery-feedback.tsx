/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { GallerySection } from './gallery-section';

export function GalleryFeedback() {
  return (
    <GallerySection id="feedback" title="Feedback" description="Badges, alerts, avatars, progress, skeleton, toast.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Workspace ready</AlertTitle>
            <AlertDescription>Demo mode is on. Connect Firebase when you ship.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>Start the API with npm run dev:local.</AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar>
            <AvatarFallback>RT</AvatarFallback>
          </Avatar>
          <div className="w-40 space-y-2">
            <Progress value={64} />
            <Skeleton className="h-4 w-full" />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('Saved to workspace.')}>
            Show toast
          </Button>
        </div>
      </div>
    </GallerySection>
  );
}
