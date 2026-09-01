/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type CountMap = Record<string, number>;

export type AnalyticsSnapshot = {
  generatedAt: string;
  solicitations: {
    total: number;
    open: number;
    byStatus: CountMap;
    byKind: CountMap;
    openByBarangay: CountMap;
    openByKind: CountMap;
    fund: {
      allotted: number;
      claimed: number;
      readyToClaim: number;
      remaining: number;
    };
    needsRequirements: number;
    readyToReview: number;
    readyToClaim: number;
    claimedThisMonth: number;
    cooldownFlags: number;
    relativeFlags: number;
    missingRequirements: number;
    requirementsComplete: number;
    expedited: number;
    escalated: number;
    suspiciousFlags: number;
  };
  documents: { total: number; byStatus: CountMap; byKind: CountMap };
  events: { total: number; upcoming: number; byKind: CountMap };
  members: { total: number; byRole: CountMap };
  notifications: { total: number; unread: number };
  activity: { total: number };
};
