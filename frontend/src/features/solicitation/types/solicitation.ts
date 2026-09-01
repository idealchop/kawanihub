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
export const SOLICIT_ROLES = ['admin', 'reviewer', 'accountant'] as const;
export const SUSPICIOUS_FLAG_TYPES = [
  'suspicious_request',
  'suspicious_requester',
  'suspicious_beneficiary',
] as const;
export const RELATIVE_RELATIONS = ['spouse', 'parent', 'child', 'sibling'] as const;
export const BENEFICIARY_RELATIONS = ['spouse', 'parent', 'child', 'sibling', 'relative', 'guardian', 'other'] as const;
export const ATTENTION_MARKS = ['special', 'odd', 'conflict', 'government_event'] as const;
export const ADDRESS_ID_TYPES = ['philsys', 'drivers_license', 'umid', 'voters', 'postal', 'barangay_id'] as const;
export const NAME_SUFFIXES = ['Jr', 'Sr', 'I', 'II', 'III', 'IV', 'V'] as const;

export type SolicitationKind = (typeof SOLICITATION_KINDS)[number];
export type SolicitationStatus = (typeof SOLICITATION_STATUSES)[number];
export type SolicitRole = (typeof SOLICIT_ROLES)[number];
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

export type IdPhotoSide = 'front' | 'back';

export function hasBothIdPhotos(identity: Pick<RequesterIdentity, 'idPhoto' | 'idPhotoBack'>): boolean {
  return identity.idPhoto.length >= 32 && identity.idPhotoBack.length >= 32;
}

export function composePersonName(firstName: string, middleName = '', lastName = '', suffix = ''): string {
  return [firstName, middleName, lastName, suffix].map((part) => part.trim()).filter(Boolean).join(' ');
}

export function composePersonNameFrom(name: Pick<PersonName, 'firstName' | 'middleName' | 'lastName' | 'suffix'>): string {
  return composePersonName(name.firstName, name.middleName, name.lastName, name.suffix);
}

export function emptyPersonName(): PersonName {
  return { firstName: '', middleName: '', lastName: '', suffix: '', noMiddleName: false };
}

export function missingMiddleName(name: Pick<PersonName, 'middleName' | 'noMiddleName'>): boolean {
  return !name.noMiddleName && !name.middleName.trim();
}

export function formatBeneficiaryRelation(
  relation: BeneficiaryRelation | '' | undefined,
  other: string | undefined,
  labels: Record<BeneficiaryRelation, string>,
): string {
  if (!relation) return '';
  if (relation === 'other') return other?.trim() || labels.other;
  return labels[relation];
}

export function emptyRequesterIdentity(): RequesterIdentity {
  return {
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    noMiddleName: false,
    requesterIsBeneficiary: true,
    beneficiary: emptyPersonName(),
    beneficiaryRelation: '',
    beneficiaryRelationOther: '',
    mobile: '',
    telephone: '',
    email: '',
    building: '',
    street: '',
    subdivision: '',
    barangay: '',
    idType: 'philsys',
    idNumber: '',
    idPhotoName: '',
    idPhoto: '',
    idPhotoBackName: '',
    idPhotoBack: '',
  };
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

export type DueDiligenceRecord = {
  id: string;
  controlNumber: string;
  status: SolicitationStatus;
  kind: SolicitationKind;
  requestedAt: string;
  receivedAt: string;
  asRequestor: boolean;
  asBeneficiary: boolean;
};

export type DueDiligenceMatch = {
  name: string;
  confidence: number;
  asRequestor: boolean;
  asBeneficiary: boolean;
  taggedRelative: boolean;
  relation: RelativeRelation | '';
  records: DueDiligenceRecord[];
};

export type DueDiligenceResponse = {
  matches: DueDiligenceMatch[];
};

export type PolicyFlag = {
  type: PolicyFlagType;
  message: string;
  relatedSolicitationId?: string;
};

export type Solicitation = {
  id: string;
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

export type SolicitationListResponse = {
  solicitations: Solicitation[];
  deskRole?: SolicitRole;
};

export type SolicitationWriteInput = {
  requesterName: string;
  beneficiaryName?: string;
  barangay?: string;
  contact?: string;
  idNumber?: string;
  identity?: RequesterIdentity;
  kind?: SolicitationKind;
  notes?: string;
  relatives?: FirstFamilyRelative[];
  requirements?: { id: string; submitted?: boolean; validated?: boolean; photo?: string; photoName?: string; note?: string }[];
  findingNote?: string;
  attentionMarks?: AttentionMark[];
  adminFindingNote?: string;
  accountantNote?: string;
  fundAmount?: number;
};

export type SolicitationClaimInput = {
  controlNumber: string;
  claimantName: string;
  claimPhoto: string;
  claimPhotoName?: string;
  acknowledged: true;
};

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

export function publicPapersOpen(row: PublicSolicitation): boolean {
  if (row.status !== 'under_review') return false;
  if (row.missingNote) return true;
  return row.requirements.some((item) => !item.submitted || !item.photo);
}

export function toSolicitationWrite(row: Solicitation): SolicitationWriteInput {
  return {
    requesterName: row.requesterName,
    beneficiaryName: row.beneficiaryName,
    barangay: row.barangay,
    contact: row.contact,
    idNumber: row.idNumber,
    identity: row.identity,
    kind: row.kind,
    notes: row.notes,
    relatives: row.relatives,
    requirements: row.requirements.map((item) => ({
      id: item.id,
      submitted: item.submitted,
      validated: item.validated,
      photo: item.photo,
      photoName: item.photoName,
      note: item.note ?? '',
    })),
    findingNote: row.findingNote,
    attentionMarks: row.attentionMarks,
    adminFindingNote: row.adminFindingNote,
    accountantNote: row.accountantNote,
    fundAmount: row.fundAmount,
  };
}
