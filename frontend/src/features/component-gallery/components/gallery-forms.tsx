/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { GallerySection } from './gallery-section';

export function GalleryForms() {
  return (
    <GallerySection id="forms" title="Forms" description="Inputs, select, textarea, checkbox, and switch.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gallery-email">Email</Label>
          <Input id="gallery-email" type="email" placeholder="owner@river.tech" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gallery-role">Role</Label>
          <Select defaultValue="owner">
            <SelectTrigger id="gallery-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="gallery-notes">Notes</Label>
          <Textarea id="gallery-notes" placeholder="Optional notes for this workspace." />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="gallery-terms" defaultChecked />
          <Label htmlFor="gallery-terms">Accept terms</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="gallery-notify" defaultChecked />
          <Label htmlFor="gallery-notify">Email notifications</Label>
        </div>
      </div>
    </GallerySection>
  );
}
