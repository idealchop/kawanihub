/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type GalleryTableRow = {
  id: string;
  name: string;
  owner: string;
  kind: 'product' | 'template';
  status: 'open' | 'done' | 'archived';
  updated: string;
};

export const galleryTableRows: GalleryTableRow[] = [
  { id: '1', name: 'River Kit', owner: 'River Tech', kind: 'template', status: 'open', updated: '2026-08-22' },
  { id: '2', name: 'Workspace A', owner: 'Ada Cruz', kind: 'product', status: 'done', updated: '2026-08-18' },
  { id: '3', name: 'Sales Portal', owner: 'River Tech', kind: 'product', status: 'open', updated: '2026-08-20' },
  { id: '4', name: 'AquaDesk', owner: 'Mina Reyes', kind: 'product', status: 'archived', updated: '2026-07-30' },
  { id: '5', name: 'Field Ops', owner: 'Leo Santos', kind: 'product', status: 'done', updated: '2026-08-12' },
  { id: '6', name: 'Onboarding Kit', owner: 'River Tech', kind: 'template', status: 'open', updated: '2026-08-21' },
  { id: '7', name: 'Billing Hub', owner: 'Ada Cruz', kind: 'product', status: 'open', updated: '2026-08-09' },
  { id: '8', name: 'Support Inbox', owner: 'Mina Reyes', kind: 'product', status: 'done', updated: '2026-08-05' },
  { id: '9', name: 'Partner Portal', owner: 'Leo Santos', kind: 'template', status: 'archived', updated: '2026-06-14' },
  { id: '10', name: 'Inventory Lite', owner: 'River Tech', kind: 'template', status: 'open', updated: '2026-08-16' },
  { id: '11', name: 'Dispatch Board', owner: 'Ada Cruz', kind: 'product', status: 'done', updated: '2026-08-11' },
  { id: '12', name: 'Member Hub', owner: 'Mina Reyes', kind: 'product', status: 'open', updated: '2026-08-19' },
];
