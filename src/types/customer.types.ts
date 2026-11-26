import type { ApiEnvelope } from "./api.types";
import type { CustomerStatus } from "../constants/customer.constants";

/** Shape the backend returns (mirrors backend customerResponseSchema) */
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: CustomerStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

/** What the backend sends for GET /customers (paginatedCustomersResponseSchema) */
export interface CustomersPage {
    customers: Customer[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export type CustomersPageResponse = ApiEnvelope<CustomersPage>;
export type CustomerResponse = ApiEnvelope<{ customer: Customer }>;

/** Fields the user edits in the shared create/edit form.
 *  `phone`/`company`/`notes` are `string | undefined` on Customer but the form
 *  always holds strings (empty input = ""), so the form uses its own type. */
export interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    status: CustomerStatus;
    notes: string;
}

/** Query params GET /customers accepts (mirrors listCustomersQuerySchema) */
export type CustomerSort = "createdAt" | "-createdAt" | "name" | "-name";

export interface ListCustomersQuery {
    page: number;
    limit: number;
    search?: string;
    sort?: CustomerSort;
}
