/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import {
  Activity,
  Bell,
  Clapperboard,
  Landmark,
  LayoutDashboard,
  ListChecks,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const APP_MODULES = [
  'dashboard',
  'solicitation',
  'media',
  'legislative',
  'assistant',
  'users',
  'notifications',
  'activity',
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export type NavItem = {
  href: string;
  module: AppModule;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: '/dashboard', module: 'dashboard', icon: LayoutDashboard },
  { href: '/queue', module: 'solicitation', icon: ListChecks },
  { href: '/media', module: 'media', icon: Clapperboard },
  { href: '/legislative', module: 'legislative', icon: Landmark },
  { href: '/assistant', module: 'assistant', icon: UserRound },
  { href: '/users', module: 'users', icon: Users },
  { href: '/notifications', module: 'notifications', icon: Bell },
  { href: '/activity', module: 'activity', icon: Activity },
];
