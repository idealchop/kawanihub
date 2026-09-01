/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import {
  FULL_ADMIN_ACCESS,
  permissionsFromAccess,
  solicitRoleFromAccess,
  type MemberAccess,
} from '../members/members-access';
import type { MemberRecord } from '../members/members-types';

type DemoUserSeed = {
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: MemberRecord['role'];
  access: MemberAccess;
  status?: MemberRecord['status'];
  label: string;
};

function domainAdminAccess(domain: keyof MemberAccess): MemberAccess {
  return {
    media: domain === 'media' ? 'admin' : 'none',
    solicitation: domain === 'solicitation' ? 'admin' : 'none',
    assistant: domain === 'assistant' ? 'admin' : 'none',
    legislative: domain === 'legislative' ? 'admin' : 'none',
  };
}

export const DEMO_DESK_USERS: DemoUserSeed[] = [
  {
    uid: 'desk-maria-santos',
    username: 'maria.santos',
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '09171230001',
    email: 'maria.santos@kawanihub.ph',
    password: 'DeskMaria2026',
    role: 'admin',
    access: FULL_ADMIN_ACCESS,
    label: 'Admin overall',
  },
  {
    uid: 'staff-rico',
    username: 'rico.bilang',
    firstName: 'Rico',
    lastName: 'Bilang',
    phone: '09171230002',
    email: 'rico.bilang@kawanihub.ph',
    password: 'DeskRico2026',
    role: 'admin',
    access: FULL_ADMIN_ACCESS,
    label: 'Admin overall',
  },
  {
    uid: 'staff-ana',
    username: 'ana.kawani',
    firstName: 'Ana',
    lastName: 'Kawani',
    phone: '09171230003',
    email: 'ana.kawani@kawanihub.ph',
    password: 'DeskAna2026',
    role: 'admin',
    access: domainAdminAccess('solicitation'),
    label: 'Admin solicitation',
  },
  {
    uid: 'desk-miguel-reyes',
    username: 'miguel.reyes',
    firstName: 'Miguel',
    lastName: 'Reyes',
    phone: '09171230004',
    email: 'miguel.reyes@kawanihub.ph',
    password: 'DeskMiguel2026',
    role: 'admin',
    access: domainAdminAccess('solicitation'),
    label: 'Admin solicitation',
  },
  {
    uid: 'desk-carla-mendoza',
    username: 'carla.mendoza',
    firstName: 'Carla',
    lastName: 'Mendoza',
    phone: '09171230005',
    email: 'carla.mendoza@kawanihub.ph',
    password: 'DeskCarla2026',
    role: 'admin',
    access: domainAdminAccess('media'),
    label: 'Admin media',
  },
  {
    uid: 'desk-jun-delacruz',
    username: 'jun.delacruz',
    firstName: 'Jun',
    lastName: 'Dela Cruz',
    phone: '09171230006',
    email: 'jun.delacruz@kawanihub.ph',
    password: 'DeskJun2026',
    role: 'admin',
    access: domainAdminAccess('media'),
    label: 'Admin media',
  },
  {
    uid: 'desk-sofia-ramos',
    username: 'sofia.ramos',
    firstName: 'Sofia',
    lastName: 'Ramos',
    phone: '09171230007',
    email: 'sofia.ramos@kawanihub.ph',
    password: 'DeskSofia2026',
    role: 'admin',
    access: domainAdminAccess('assistant'),
    label: 'Admin assistant',
  },
  {
    uid: 'desk-paolo-navarro',
    username: 'paolo.navarro',
    firstName: 'Paolo',
    lastName: 'Navarro',
    phone: '09171230008',
    email: 'paolo.navarro@kawanihub.ph',
    password: 'DeskPaolo2026',
    role: 'admin',
    access: domainAdminAccess('legislative'),
    label: 'Admin legislative',
  },
  {
    uid: 'desk-elena-gutierrez',
    username: 'elena.gutierrez',
    firstName: 'Elena',
    lastName: 'Gutierrez',
    phone: '09171230009',
    email: 'elena.gutierrez@kawanihub.ph',
    password: 'DeskElena2026',
    role: 'admin',
    access: domainAdminAccess('legislative'),
    label: 'Admin legislative',
  },
];

export function buildDemoDeskUsers(workspaceId: string, actorUid: string, now: string): MemberRecord[] {
  return DEMO_DESK_USERS.map((user) => {
    const displayName = `${user.firstName} ${user.lastName}`.trim();
    return {
      id: randomUUID(),
      workspaceId,
      uid: user.uid,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      displayName,
      role: user.role,
      access: user.access,
      solicitRole: solicitRoleFromAccess(user.access),
      permissions: permissionsFromAccess(user.access, user.role),
      status: user.status ?? 'active',
      createdBy: actorUid,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function buildDemoOwner(
  workspaceId: string,
  actorUid: string,
  now: string,
): MemberRecord & { password: string } {
  return {
    id: randomUUID(),
    workspaceId,
    uid: actorUid,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'Owner',
    phone: '09170000000',
    email: 'admin@kawanihub.ph',
    displayName: 'Admin Owner',
    role: 'owner',
    access: FULL_ADMIN_ACCESS,
    solicitRole: 'admin',
    permissions: permissionsFromAccess(FULL_ADMIN_ACCESS, 'owner'),
    status: 'active',
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
    password: 'DeskOwner2026',
  };
}

export function demoUserPasswords(): Array<Pick<DemoUserSeed, 'username' | 'email' | 'password' | 'label'>> {
  return DEMO_DESK_USERS.map(({ username, email, password, label }) => ({ username, email, password, label }));
}
