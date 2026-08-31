export const USER_ROLES = ['resident', 'paid_resident', 'contractor', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
