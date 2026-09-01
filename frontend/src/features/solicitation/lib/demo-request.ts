/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { BARANGAY_OPTIONS } from './barangay-list';
import type { RequesterIdentity, SolicitationKind } from '../types/solicitation';

export const DEMO_REQUEST_KIND: SolicitationKind = 'burial';

export function demoRequesterIdentity(): RequesterIdentity {
  return {
    firstName: 'Rosa',
    middleName: 'Dela',
    lastName: 'Mendoza',
    suffix: '',
    noMiddleName: false,
    requesterIsBeneficiary: true,
    beneficiary: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      noMiddleName: false,
    },
    beneficiaryRelation: '',
    beneficiaryRelationOther: '',
    mobile: '09175550101',
    telephone: '8888-0101',
    email: 'rosa.mendoza@example.com',
    building: 'Blk 1 Lot 2',
    street: 'Real Street',
    subdivision: 'Villa Zapote',
    barangay: BARANGAY_OPTIONS[0] ?? 'Almanza Uno',
    idType: 'philsys',
    idNumber: 'PSN-4412',
    idPhotoName: '',
    idPhoto: '',
    idPhotoBackName: '',
    idPhotoBack: '',
  };
}

export const DEMO_REQUEST_NOTES = 'Funeral assistance for a family member. Demo request for desk review.';
