/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GallerySection } from './gallery-section';

export function GalleryOverlays() {
  return (
    <GallerySection id="overlays" title="Overlays" description="Dialog (header + scroll body + footer), menu, tabs, tooltip.">
      <TooltipProvider>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create workspace</DialogTitle>
                  <DialogDescription>Header and footer stay; the body scrolls.</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p className="text-sm text-muted-foreground">
                    Use this contract for every modal. Long copy belongs here so chrome never moves.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover tip</Button>
              </TooltipTrigger>
              <TooltipContent>Copyright River Tech</TooltipContent>
            </Tooltip>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-muted-foreground">
              Tabs keep related views on one screen.
            </TabsContent>
            <TabsContent value="settings" className="text-sm text-muted-foreground">
              Put workspace settings in the second pane.
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </GallerySection>
  );
}
