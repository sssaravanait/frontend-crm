// Mirrors backend src/constants/customer.constant.ts — frontend can't import backend code,
// so the allowed values are duplicated here on purpose (single place to update on API change).
export const CUSTOMER_STATUSES = ["lead", "active", "inactive"] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

/** Label + Ant Tag color per status, shared by the table and the form */
export const CUSTOMER_STATUS_META: Record<CustomerStatus, { label: string; color: string }> = {
    lead: { label: "Lead", color: "gold" },
    active: { label: "Active", color: "green" },
    inactive: { label: "Inactive", color: "default" },
};
