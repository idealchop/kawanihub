/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const SOLICITATION_KINDS = ['burial', 'education', 'medical', 'events', 'financial', 'daily'] as const;
export const SOLICITATION_STATUSES = [
  'under_review',
  'pending_validation',
  'rejected',
  'eligible',
  'ready_to_claim',
  'claimed',
] as const;
export const RELATIVE_RELATIONS = ['spouse', 'parent', 'child', 'sibling'] as const;
export const BENEFICIARY_RELATIONS = ['spouse', 'parent', 'child', 'sibling', 'relative', 'guardian', 'other'] as const;
export const ATTENTION_MARKS = ['special', 'odd', 'conflict', 'government_event'] as const;
export const ADDRESS_ID_TYPES = ['philsys', 'drivers_license', 'umid', 'voters', 'postal', 'barangay_id'] as const;
export const NAME_SUFFIXES = ['Jr', 'Sr', 'I', 'II', 'III', 'IV', 'V'] as const;

export type SolicitationKind = (typeof SOLICITATION_KINDS)[number];
export type SolicitationStatus = (typeof SOLICITATION_STATUSES)[number];
export type RelativeRelation = (typeof RELATIVE_RELATIONS)[number];
export type BeneficiaryRelation = (typeof BENEFICIARY_RELATIONS)[number];
export type AttentionMark = (typeof ATTENTION_MARKS)[number];
export type AddressIdType = (typeof ADDRESS_ID_TYPES)[number];
export type NameSuffix = (typeof NAME_SUFFIXES)[number];
export type PolicyFlagType =
  | 'cooldown'
  | 'relative'
  | 'suspicious_request'
  | 'suspicious_requester'
  | 'suspicious_beneficiary';
export const SUSPICIOUS_FLAG_TYPES = [
  'suspicious_request',
  'suspicious_requester',
  'suspicious_beneficiary',
] as const;

export type PersonName = {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  noMiddleName: boolean;
};

export type RequesterIdentity = PersonName & {
  requesterIsBeneficiary: boolean;
  beneficiary: PersonName;
  beneficiaryRelation: BeneficiaryRelation | '';
  beneficiaryRelationOther: string;
  mobile: string;
  telephone: string;
  email: string;
  building: string;
  street: string;
  subdivision: string;
  barangay: string;
  idType: AddressIdType;
  idNumber: string;
  idPhotoName: string;
  idPhoto: string;
  idPhotoBackName: string;
  idPhotoBack: string;
};

export function composePersonName(firstName: string, middleName = '', lastName = '', suffix = ''): string {
  return [firstName, middleName, lastName, suffix].map((part) => part.trim()).filter(Boolean).join(' ');
}

export function composePersonNameFrom(name: Pick<PersonName, 'firstName' | 'middleName' | 'lastName' | 'suffix'>): string {
  return composePersonName(name.firstName, name.middleName, name.lastName, name.suffix);
}

export type RequirementItem = {
  id: string;
  label: string;
  submitted: boolean;
  validated: boolean;
  photo: string;
  photoName: string;
  note: string;
};

export type FirstFamilyRelative = {
  name: string;
  relation: RelativeRelation;
};

export type PolicyFlag = {
  type: PolicyFlagType;
  message: string;
  relatedSolicitationId?: string;
};

export type SolicitationRecord = {
  id: string;
  workspaceId: string;
  requesterName: string;
  beneficiaryName: string;
  barangay: string;
  contact: string;
  idNumber: string;
  identity?: RequesterIdentity;
  kind: SolicitationKind;
  notes: string;
  status: SolicitationStatus;
  requirements: RequirementItem[];
  relatives: FirstFamilyRelative[];
  flags: PolicyFlag[];
  cooldownBlocked: boolean;
  assignedReviewerUid: string;
  assignedReviewerName: string;
  assignedAccountantUid: string;
  assignedAccountantName: string;
  expedited: boolean;
  escalated: boolean;
  escalateNote: string;
  reviewerFeedback: string;
  rejectReason: string;
  findingNote: string;
  attentionMarks: AttentionMark[];
  findingByUid: string;
  findingByName: string;
  findingAt: string;
  adminFindingNote: string;
  adminFindingByUid: string;
  adminFindingByName: string;
  adminFindingAt: string;
  accountantNote: string;
  fundAmount: number;
  accountantByUid: string;
  accountantByName: string;
  accountantAt: string;
  missingNote: string;
  overrideUsed: boolean;
  controlNumber: string;
  controlIssuedAt: string;
  claimedAt: string;
  claimedByName: string;
  claimPhoto: string;
  claimPhotoName: string;
  acknowledged: boolean;
  acknowledgedAt: string;
  acknowledgedByName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export function emptyDeskState(): Pick<
  SolicitationRecord,
  | 'assignedReviewerUid'
  | 'assignedReviewerName'
  | 'assignedAccountantUid'
  | 'assignedAccountantName'
  | 'expedited'
  | 'escalated'
  | 'escalateNote'
  | 'reviewerFeedback'
  | 'rejectReason'
  | 'findingNote'
  | 'attentionMarks'
  | 'findingByUid'
  | 'findingByName'
  | 'findingAt'
  | 'adminFindingNote'
  | 'adminFindingByUid'
  | 'adminFindingByName'
  | 'adminFindingAt'
  | 'accountantNote'
  | 'fundAmount'
  | 'accountantByUid'
  | 'accountantByName'
  | 'accountantAt'
  | 'missingNote'
  | 'overrideUsed'
  | 'claimPhoto'
  | 'claimPhotoName'
  | 'acknowledged'
  | 'acknowledgedAt'
  | 'acknowledgedByName'
> {
  return {
    assignedReviewerUid: '',
    assignedReviewerName: '',
    assignedAccountantUid: '',
    assignedAccountantName: '',
    expedited: false,
    escalated: false,
    escalateNote: '',
    reviewerFeedback: '',
    rejectReason: '',
    findingNote: '',
    attentionMarks: [],
    findingByUid: '',
    findingByName: '',
    findingAt: '',
    adminFindingNote: '',
    adminFindingByUid: '',
    adminFindingByName: '',
    adminFindingAt: '',
    accountantNote: '',
    fundAmount: 0,
    accountantByUid: '',
    accountantByName: '',
    accountantAt: '',
    missingNote: '',
    overrideUsed: false,
    claimPhoto: '',
    claimPhotoName: '',
    acknowledged: false,
    acknowledgedAt: '',
    acknowledgedByName: '',
  };
}

export function withDeskDefaults(row: SolicitationRecord): SolicitationRecord {
  const merged = { ...emptyDeskState(), ...row };
  return {
    ...merged,
    requirements: (merged.requirements ?? []).map((item) => ({
      ...item,
      photo: item.photo ?? '',
      photoName: item.photoName ?? '',
      note: item.note ?? '',
    })),
    findingNote: merged.findingNote ?? '',
    attentionMarks: merged.attentionMarks ?? [],
    findingByUid: merged.findingByUid ?? '',
    findingByName: merged.findingByName ?? '',
    findingAt: merged.findingAt ?? '',
    adminFindingNote: merged.adminFindingNote ?? '',
    adminFindingByUid: merged.adminFindingByUid ?? '',
    adminFindingByName: merged.adminFindingByName ?? '',
    adminFindingAt: merged.adminFindingAt ?? '',
    accountantNote: merged.accountantNote ?? '',
    fundAmount: typeof merged.fundAmount === 'number' && Number.isFinite(merged.fundAmount) ? merged.fundAmount : 0,
    accountantByUid: merged.accountantByUid ?? '',
    accountantByName: merged.accountantByName ?? '',
    accountantAt: merged.accountantAt ?? '',
  };
}

export const COOLDOWN_DAYS = 90;
export const PUBLIC_ACTOR_UID = 'public-requester';
export const DESK_OWNER_UID = 'demo-owner';

export type PublicSolicitation = {
  id: string;
  requesterName: string;
  beneficiaryName: string;
  barangay: string;
  kind: SolicitationKind;
  status: SolicitationStatus;
  controlNumber: string;
  requirements: { id: string; label: string; submitted: boolean; photo: string; photoName: string }[];
  flags: { type: PolicyFlagType; message: string }[];
  cooldownBlocked: boolean;
  rejectReason: string;
  missingNote: string;
  reviewerFeedback: string;
  claimedAt: string;
  acknowledged: boolean;
};
