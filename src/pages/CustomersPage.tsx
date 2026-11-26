import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Modal, Space, Table, Tag, message } from "antd";
import type { TableProps } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

import type { Customer, CustomerSort } from "../types/customer.types";
import { CUSTOMER_STATUS_META } from "../constants/customer.constants";
import { deleteCustomer, listCustomers } from "../services/customer.service";
import { toApiError } from "../utils/apiError";

interface TableParams {
    page: number;
    pageSize: number;
    sort: CustomerSort;
    search: string;
}

const DEFAULT_PARAMS: TableParams = { page: 1, pageSize: 10, sort: "-createdAt", search: "" };
const SEARCH_DEBOUNCE_MS = 400;
const SORTABLE_FIELDS = new Set(["name", "createdAt"]);

export default function CustomersPage() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    // Starts true so the first paint shows the loading state before any fetch resolves
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [params, setParams] = useState<TableParams>(DEFAULT_PARAMS);

    // Anti-race token: only the latest request may update state. Classic pitfall:
    // fast typing or quick page flips fire several requests; a slow earlier
    // response would otherwise overwrite the newer one.
    const requestIdRef = useRef(0);

    /**
     * Single fetch path for initial load, pagination, sorting and search.
     * The effect depends on the `params` object: every change (page, sort,
     * search) creates a new params object, so one effect covers all triggers.
     *
     * All setState calls happen AFTER `await` — they run in the promise
     * continuation, not synchronously during render commit, which keeps
     * effects free of cascading renders (react-hooks/set-state-in-effect).
     * "Loading on" for user-triggered refetches lives in the handlers instead.
     */
    useEffect(() => {
        const requestId = ++requestIdRef.current;

        void (async () => {
            try {
                const response = await listCustomers({
                    page: params.page,
                    limit: params.pageSize,
                    sort: params.sort,
                    search: params.search || undefined,
                });
                if (requestId !== requestIdRef.current) return; // a newer request won

                if (!response.success || !response.data) {
                    message.error(response.error?.message ?? "Failed to load customers.");
                    return;
                }
                setCustomers(response.data.customers);
                setTotal(response.data.meta.total);
            } catch (error) {
                if (requestId !== requestIdRef.current) return;
                const apiError = toApiError(error);
                // Network errors (offline/timeout) are usually transient; the
                // axios interceptor already redirects on 401. Toast only real API errors.
                if (!apiError.isNetworkError) message.error(apiError.message);
            } finally {
                if (requestId === requestIdRef.current) setLoading(false);
            }
        })();
    }, [params]);

    const goToPage = (page: number, pageSize: number) => {
        setLoading(true);
        setParams((prev) => ({ ...prev, page, pageSize }));
    };

    /** Ant's sorter reports ascend/descend plus the column's dataIndex. The API's
     *  sort tokens are exactly `${field}` / `-${field}`, so mapping is a string
     *  concat. Clearing a sort returns to the server default (-createdAt).
     *  A new order always restarts at page 1. */
    const handleSortChange: TableProps<Customer>["onChange"] = (_pagination, _filters, sorter) => {
        const active = Array.isArray(sorter) ? sorter[0] : sorter;
        const field = typeof active?.field === "string" ? active.field : undefined;

        const sort: CustomerSort =
            !active?.order || !field || !SORTABLE_FIELDS.has(field)
                ? DEFAULT_PARAMS.sort
                : `${active.order === "descend" ? "-" : ""}${field}` as CustomerSort;

        setLoading(true);
        setParams((prev) => ({ ...prev, page: 1, sort }));
    };

    // Debounced search: the input updates local state on every keystroke (typing
    // stays instant), but only the stopped-typing timer updates `params` — which
    // is what actually triggers the fetch. Without it, one keystroke = one API call.
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setLoading(true);
            setParams((prev) => ({ ...prev, search: value, page: 1 }));
        }, SEARCH_DEBOUNCE_MS);
    };
    // Clear the pending timer on unmount so it can't setState after the page is gone
    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteCustomer(deleteTarget.id);
            message.success("Customer deleted");
            setDeleteTarget(null);
            // Refetch the current page; if it just became empty, step back one
            const lastPage = Math.max(1, Math.ceil((total - 1) / params.pageSize));
            goToPage(Math.min(params.page, lastPage), params.pageSize);
        } catch (error) {
            const apiError = toApiError(error);
            if (!apiError.isNetworkError) message.error(apiError.message);
        } finally {
            setDeleting(false);
        }
    };

    const columns: TableProps<Customer>["columns"] = [
        { title: "Name", dataIndex: "name", key: "name", sorter: true },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Company", dataIndex: "company", key: "company", render: (v?: string) => v ?? "—" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: Customer["status"]) => (
                <Tag color={CUSTOMER_STATUS_META[status].color}>
                    {CUSTOMER_STATUS_META[status].label}
                </Tag>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: true,
            render: (value: string) => new Date(value).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => navigate(`/customers/${record.id}/edit`)}>
                        Edit
                    </Button>
                    <Button size="small" danger onClick={() => setDeleteTarget(record)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
                <Space>
                    <Input
                        allowClear
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search name, email or company"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="w-72"
                        aria-label="Search customers"
                    />
                    <Link to="/customers/new">
                        <Button type="primary" icon={<PlusOutlined />}>New Customer</Button>
                    </Link>
                </Space>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
                <Table<Customer>
                    rowKey="id"
                    columns={columns}
                    dataSource={customers}
                    loading={loading}
                    scroll={{ x: true }}
                    onChange={handleSortChange}
                    locale={{ emptyText: "No customers found" }}
                    pagination={{
                        current: params.page,
                        pageSize: params.pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} customer${t === 1 ? "" : "s"}`,
                        onChange: goToPage,
                    }}
                />
            </div>

            {/* Delete confirmation modal — lives at page level so it can trigger
                the refetch (via goToPage) after a successful delete */}
            <Modal
                open={deleteTarget !== null}
                title="Delete customer"
                okText="Delete"
                okButtonProps={{ danger: true, loading: deleting }}
                cancelText="Cancel"
                cancelButtonProps={{ disabled: deleting }}
                onOk={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            >
                <p>
                    Delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
