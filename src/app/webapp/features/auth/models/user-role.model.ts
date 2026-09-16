export const USER_ROLES = ['resident', 'paid_resident', 'contractor', 'admin', 'super_admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
