import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Select, Spin, message } from "antd";
import type { FormProps } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import type { CustomerFormData } from "../types/customer.types";
import { CUSTOMER_STATUS_META, CUSTOMER_STATUSES } from "../constants/customer.constants";
import { createCustomer, getCustomer, updateCustomer } from "../services/customer.service";
import { toApiError } from "../utils/apiError";

const MAX_LENGTHS = { name: 120, email: 254, phone: 30, company: 120, notes: 2000 };

export default function CustomerFormPage() {
    // undefined in create mode (/customers/new), set in edit mode (/customers/:id/edit)
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form] = Form.useForm<CustomerFormData>();
    const navigate = useNavigate();

    // Edit mode fetches the customer first, so loading starts true there.
    // Computed initial state avoids a synchronous setState in the effect below.
    const [loading, setLoading] = useState(isEdit);
    const [pageError, setPageError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    /**
     * Edit mode only: load the record and hydrate the form.
     * Why fetch instead of reading router state: refresh and deep links work —
     * router state dies on reload, the URL does not.
     *
     * `cancelled` handles unmount (user navigates away mid-fetch): the flag is
     * cheaper than a request counter when a page does exactly one request.
     * All setState calls are after `await` (same rule as the list page).
     */
    useEffect(() => {
        if (!id) return; // create mode: nothing to load

        let cancelled = false;
        void (async () => {
            try {
                const customer = await getCustomer(id);
                if (cancelled) return;
                // Optional fields are string|undefined on Customer but the form
                // always holds strings — normalize to "" so inputs are controlled
                form.setFieldsValue({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone ?? "",
                    company: customer.company ?? "",
                    status: customer.status,
                    notes: customer.notes ?? "",
                });
                setLoading(false);
            } catch (error) {
                if (cancelled) return;
                setPageError(toApiError(error).message);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, form]);

    /** Map backend field errors (422 validation, 409 duplicate email) onto
     *  the matching form fields — same pattern the auth pages use. */
    const applyFieldErrors = (fieldErrors: Record<string, string[]> | undefined) => {
        if (!fieldErrors) return false;
        const entries = Object.entries(fieldErrors).filter(([field]) => field in MAX_LENGTHS);
        if (entries.length === 0) return false;
        form.setFields(
            entries.map(([name, errors]) => ({ name: name as keyof CustomerFormData, errors })),
        );
        return true;
    };

    const onFinish = async (values: CustomerFormData) => {
        setSubmitting(true);
        try {
            if (id) {
                await updateCustomer(id, values);
            } else {
                await createCustomer(values);
            }
            message.success(isEdit ? "Customer updated" : "Customer created");
            // replace: back button from the list shouldn't return to the form
            navigate("/customers", { replace: true });
        } catch (error) {
            const apiError = toApiError(error);
            if (!applyFieldErrors(apiError.fieldErrors)) {
                message.error(apiError.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onFinishFailed: FormProps<CustomerFormData>["onFinishFailed"] = ({ errorFields }) => {
        message.warning(`Please fix ${errorFields.length} field${errorFields.length > 1 ? "s" : ""} to continue`);
        if (errorFields[0]?.name) {
            form.scrollToField(errorFields[0].name);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spin size="large" />
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="mx-auto max-w-xl">
                <Alert
                    type="error"
                    showIcon
                    message="Could not load customer"
                    description={pageError}
                    action={<Link to="/customers"><Button>Back to customers</Button></Link>}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full">
            <div className="mb-4 flex items-center gap-3">
                <Link to="/customers">
                    <Button icon={<ArrowLeftOutlined />} aria-label="Back to customers" />
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">
                    {isEdit ? "Edit Customer" : "New Customer"}
                </h1>
            </div>

            <Card>
                <Form<CustomerFormData>
                    form={form}
                    layout="vertical"
                    name="customerForm"
                    /* status defaults to "lead" on create; on edit setFieldsValue
                       replaces it after the fetch, so no conflict between the two */
                    initialValues={{ status: "lead" }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    scrollToFirstError
                >
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                        <Form.Item<CustomerFormData>
                            label="Name"
                            name="name"
                            rules={[
                                { required: true, message: "Name is required" },
                                { whitespace: true, message: "Name cannot be blank" },
                                { max: MAX_LENGTHS.name, message: `Name must be at most ${MAX_LENGTHS.name} characters` },
                            ]}
                        >
                            <Input placeholder="Acme Corp contact" />
                        </Form.Item>

                        <Form.Item<CustomerFormData>
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Enter a valid email" },
                            ]}
                        >
                            <Input placeholder="you@example.com" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                        <Form.Item<CustomerFormData>
                            label="Phone"
                            name="phone"
                            rules={[{ max: MAX_LENGTHS.phone, message: `Phone must be at most ${MAX_LENGTHS.phone} characters` }]}
                        >
                            <Input placeholder="+1 555 010 2030" />
                        </Form.Item>

                        <Form.Item<CustomerFormData>
                            label="Company"
                            name="company"
                            rules={[{ max: MAX_LENGTHS.company, message: `Company must be at most ${MAX_LENGTHS.company} characters` }]}
                        >
                            <Input placeholder="Acme Corp" />
                        </Form.Item>
                    </div>

                    <Form.Item<CustomerFormData>
                        label="Status"
                        name="status"
                        rules={[{ required: true, message: "Status is required" }]}
                    >
                        <Select
                            options={CUSTOMER_STATUSES.map((status) => ({
                                value: status,
                                label: CUSTOMER_STATUS_META[status].label,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item<CustomerFormData>
                        label="Notes"
                        name="notes"
                        rules={[{ max: MAX_LENGTHS.notes, message: `Notes must be at most ${MAX_LENGTHS.notes} characters` }]}
                    >
                        <Input.TextArea rows={4} placeholder="Anything worth remembering about this customer" />
                    </Form.Item>

                    <div className="flex gap-3">
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {isEdit ? "Save changes" : "Create customer"}
                        </Button>
                        <Link to="/customers">
                            <Button disabled={submitting}>Cancel</Button>
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
