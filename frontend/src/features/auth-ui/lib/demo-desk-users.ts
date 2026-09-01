/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * Demo desk login roster. Passwords match backend/functions desk-seed-users.ts.
 */
export type DemoDeskLogin = {
  username: string;
  password: string;
  email: string;
  uid: string;
  displayName: string;
};

export const DEMO_OWNER_LOGIN: DemoDeskLogin = {
  username: 'admin',
  password: 'DeskOwner2026',
  email: 'admin@kawanihub.ph',
  uid: 'demo-owner',
  displayName: 'Admin Owner',
};

export const DEMO_DESK_LOGINS: DemoDeskLogin[] = [
  DEMO_OWNER_LOGIN,
  {
    username: 'maria.santos',
    password: 'DeskMaria2026',
    email: 'maria.santos@kawanihub.ph',
    uid: 'desk-maria-santos',
    displayName: 'Maria Santos',
  },
  {
    username: 'rico.bilang',
    password: 'DeskRico2026',
    email: 'rico.bilang@kawanihub.ph',
    uid: 'staff-rico',
    displayName: 'Rico Bilang',
  },
  {
    username: 'ana.kawani',
    password: 'DeskAna2026',
    email: 'ana.kawani@kawanihub.ph',
    uid: 'staff-ana',
    displayName: 'Ana Kawani',
  },
  {
    username: 'miguel.reyes',
    password: 'DeskMiguel2026',
    email: 'miguel.reyes@kawanihub.ph',
    uid: 'desk-miguel-reyes',
    displayName: 'Miguel Reyes',
  },
  {
    username: 'carla.mendoza',
    password: 'DeskCarla2026',
    email: 'carla.mendoza@kawanihub.ph',
    uid: 'desk-carla-mendoza',
    displayName: 'Carla Mendoza',
  },
  {
    username: 'jun.delacruz',
    password: 'DeskJun2026',
    email: 'jun.delacruz@kawanihub.ph',
    uid: 'desk-jun-delacruz',
    displayName: 'Jun Dela Cruz',
  },
  {
    username: 'sofia.ramos',
    password: 'DeskSofia2026',
    email: 'sofia.ramos@kawanihub.ph',
    uid: 'desk-sofia-ramos',
    displayName: 'Sofia Ramos',
  },
  {
    username: 'paolo.navarro',
    password: 'DeskPaolo2026',
    email: 'paolo.navarro@kawanihub.ph',
    uid: 'desk-paolo-navarro',
    displayName: 'Paolo Navarro',
  },
  {
    username: 'elena.gutierrez',
    password: 'DeskElena2026',
    email: 'elena.gutierrez@kawanihub.ph',
    uid: 'desk-elena-gutierrez',
    displayName: 'Elena Gutierrez',
  },
];

export function findDemoLogin(username: string, password: string): DemoDeskLogin | undefined {
  const normalized = username.trim().toLowerCase();
  return DEMO_DESK_LOGINS.find(
    (row) =>
      (row.username === normalized || row.email.toLowerCase() === normalized) && row.password === password,
  );
}
