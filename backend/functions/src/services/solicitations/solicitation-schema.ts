/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';
import { ADDRESS_ID_TYPES, ATTENTION_MARKS, BENEFICIARY_RELATIONS, NAME_SUFFIXES, RELATIVE_RELATIONS, SOLICITATION_KINDS } from './solicitation-types';

export const relativeSchema = z.object({
  name: z.string().min(1).max(80),
  relation: z.enum(RELATIVE_RELATIONS),
});

export const requirementPatchSchema = z.object({
  id: z.string().min(1),
  submitted: z.boolean().optional(),
  validated: z.boolean().optional(),
  photo: z.string().max(1_200_000).optional(),
  photoName: z.string().max(160).optional(),
  note: z.string().max(2000).optional(),
});

const emailField = z
  .string()
  .max(80)
  .optional()
  .default('')
  .refine((value) => !value || z.string().email().safeParse(value).success, { message: 'Invalid email' });

export const personNameSchema = z.object({
  firstName: z.string().max(40).optional().default(''),
  middleName: z.string().max(40).optional().default(''),
  lastName: z.string().max(40).optional().default(''),
  suffix: z.string().max(10).optional().default('').refine((value) => !value || NAME_SUFFIXES.includes(value as (typeof NAME_SUFFIXES)[number]), {
    message: 'Invalid suffix',
  }),
  noMiddleName: z.boolean().optional().default(false),
});

export const requesterIdentitySchema = z.object({
  firstName: z.string().max(40).optional().default(''),
  middleName: z.string().max(40).optional().default(''),
  lastName: z.string().max(40).optional().default(''),
  suffix: z.string().max(10).optional().default('').refine((value) => !value || NAME_SUFFIXES.includes(value as (typeof NAME_SUFFIXES)[number]), {
    message: 'Invalid suffix',
  }),
  noMiddleName: z.boolean().optional().default(false),
  requesterIsBeneficiary: z.boolean().optional().default(true),
  beneficiary: personNameSchema.optional().default({ firstName: '', middleName: '', lastName: '', suffix: '', noMiddleName: false }),
  beneficiaryRelation: z.union([z.enum(BENEFICIARY_RELATIONS), z.literal('')]).optional().default(''),
  beneficiaryRelationOther: z.string().max(80).optional().default(''),
  mobile: z.string().max(20).optional().default(''),
  telephone: z.string().max(20).optional().default(''),
  email: emailField,
  building: z.string().max(80).optional().default(''),
  street: z.string().max(80).optional().default(''),
  subdivision: z.string().max(80).optional().default(''),
  barangay: z.string().max(80).optional().default(''),
  idType: z.enum(ADDRESS_ID_TYPES).optional().default('philsys'),
  idNumber: z.string().max(40).optional().default(''),
  idPhotoName: z.string().max(160).optional().default(''),
  idPhoto: z.string().max(1_200_000).optional().default(''),
  idPhotoBackName: z.string().max(160).optional().default(''),
  idPhotoBack: z.string().max(1_200_000).optional().default(''),
});

export const solicitationWriteSchema = z
  .object({
    requesterName: z.string().max(80).optional().default(''),
    beneficiaryName: z.string().max(80).optional().default(''),
    barangay: z.string().max(80).optional().default(''),
    contact: z.string().max(80).optional().default(''),
    idNumber: z.string().max(40).optional().default(''),
    identity: requesterIdentitySchema.optional(),
    kind: z.enum(SOLICITATION_KINDS).optional().default('burial'),
    notes: z.string().max(2000).optional().default(''),
    relatives: z.array(relativeSchema).optional().default([]),
    requirements: z.array(requirementPatchSchema).optional(),
    findingNote: z.string().max(2000).optional(),
    attentionMarks: z.array(z.enum(ATTENTION_MARKS)).optional(),
    adminFindingNote: z.string().max(2000).optional(),
    accountantNote: z.string().max(2000).optional(),
    fundAmount: z.number().min(0).max(99_999_999).optional(),
  });

export const publicSolicitationWriteSchema = solicitationWriteSchema;

export const publicRequirementsSchema = z.object({
  requirements: z
    .array(
      z.object({
        id: z.string().min(1),
        photo: z.string().min(32).max(1_200_000),
        photoName: z.string().max(160).optional().default(''),
      }),
    )
    .min(1),
});

export const solicitationClaimSchema = z.object({
  controlNumber: z.string().min(1).max(40),
  claimantName: z.string().min(1).max(80),
  claimPhoto: z.string().min(32).max(1_200_000),
  claimPhotoName: z.string().max(160).optional().default(''),
  acknowledged: z.literal(true),
});

export const solicitationTrackSchema = z.object({
  controlNumber: z.string().min(1).max(40),
});

export const solicitationRejectSchema = z.object({
  reason: z.string().min(8).max(2000),
});

export const solicitationAssignSchema = z.object({
  reviewerUid: z.string().max(80).optional().default(''),
  accountantUid: z.string().max(80).optional().default(''),
});

export const solicitationMissingSchema = z.object({
  note: z.string().min(4).max(2000),
  extraLabel: z.string().max(120).optional().default(''),
});

export const solicitationEscalateSchema = z.object({
  note: z.string().min(4).max(2000),
});

export const solicitationFlagSchema = z.object({
  type: z.enum(['suspicious_request', 'suspicious_requester', 'suspicious_beneficiary']),
  message: z.string().min(4).max(240),
});

export const solicitationApproveSchema = z.object({
  override: z.boolean().optional().default(false),
});
