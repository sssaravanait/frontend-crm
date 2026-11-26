import { apiClient } from "../api/axiosClient";
import type {
    Customer,
    CustomerFormData,
    CustomerResponse,
    CustomersPageResponse,
    ListCustomersQuery,
} from "../types/customer.types";

/**
 * Thin data-access layer: one function per endpoint, types in types/customer.types.ts.
 * Components never call apiClient directly (same rule the auth service follows).
 * Throws ApiError (via toApiError in components) on any failure.
 */

/** GET /customers — server-side pagination, search and sort */
export const listCustomers = async (query: ListCustomersQuery): Promise<CustomersPageResponse> => {
    const { data } = await apiClient.get<CustomersPageResponse>("/customers", { params: query });
    return data;
};

/** GET /customers/:id — used by the edit form to hydrate fields */
export const getCustomer = async (id: string): Promise<Customer> => {
    const { data } = await apiClient.get<CustomerResponse>(`/customers/${id}`);
    // Defensive: a 200 with success:false or no customer is a contract violation
    if (!data.success || !data.data?.customer) {
        throw new Error("Customer response is missing the customer data.");
    }
    return data.data.customer;
};

const toPayload = (values: CustomerFormData) => ({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() || undefined, // empty string -> omitted, backend expects optional
    company: values.company.trim() || undefined,
    status: values.status,
    notes: values.notes.trim() || undefined,
});

export const createCustomer = async (values: CustomerFormData): Promise<Customer> => {
    const { data } = await apiClient.post<CustomerResponse>("/customers", toPayload(values));
    if (!data.success || !data.data?.customer) {
        throw new Error("Create response is missing the customer data.");
    }
    return data.data.customer;
};

export const updateCustomer = async (id: string, values: CustomerFormData): Promise<Customer> => {
    const { data } = await apiClient.patch<CustomerResponse>(`/customers/${id}`, toPayload(values));
    if (!data.success || !data.data?.customer) {
        throw new Error("Update response is missing the customer data.");
    }
    return data.data.customer;
};

/** DELETE /customers/:id — backend answers 204 with no body */
export const deleteCustomer = async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
};
