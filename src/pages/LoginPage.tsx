import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from 'antd';
import type { FormProps } from 'antd';

import type { LoginFormData } from "../types/auth.types";
import { loginUser } from "../services/auth.service";
import { useAuth } from "../auth/useAuth";

type LoginRedirectState = {
    from?: {
        pathname?: string;
    };
};

export default function LoginPage() {

    const [form] = Form.useForm<LoginFormData>();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleServerError = (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            message.error("Something went wrong. Please try again.");
            return;
        }

        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 422 && data?.errors) {
            // Map server field errors onto the form
            form.setFields(
                Object.entries(data.errors).map(([field, errors]) => ({
                    name: field as keyof LoginFormData,
                    errors: Array.isArray(errors)
                        ? errors.filter((error): error is string => typeof error === "string")
                        : [],
                })),
            );
            return;
        }

        // Network errors (no response), 5xx, and anything else
        message.error(data?.error?.message ?? data?.message ?? (error.response ? "Login failed" : "Network error. Check your connection."));
    };

    const onFinish = async (values: LoginFormData) => {
        setSubmitting(true);

        try {
            const response = await loginUser({
                email: values.email.trim().toLowerCase(),
                password: values.password.trim(),
            });

            if (!response.success) {
                message.error(response.error?.message ?? "Login failed");
                return;
            }

            if (!response.data?.token || !response.data.user) {
                message.error("Login response is missing the token or user.");
                return;
            }

            login(response.data.token, response.data.user);
            form.resetFields();
            message.success("Login successful!");
            const redirectState = location.state as LoginRedirectState | null;
            navigate(redirectState?.from?.pathname ?? "/dashboard", { replace: true });

        } catch (error) {
            handleServerError(error);
        } finally {
            setSubmitting(false);
        }
    }

    const onFinishFailed: FormProps<LoginFormData>['onFinishFailed'] = ({ errorFields }) => {
        message.warning(`Please fix ${errorFields.length} field${errorFields.length > 1 ? "s" : ""} to continue`);
        if (errorFields[0]?.name) {
            form.scrollToField(errorFields[0].name);
        }
    }

    return (
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
            {/* Left: branding */}
            <section className="flex flex-col items-center justify-center bg-gradient-to-br from-cyan-600 to-cyan-800 p-10 text-center text-white">
                <h1 className="text-4xl font-bold">Welcome to Admin Panel</h1>
                <p className="mt-3 text-lg opacity-90">This is the Mini CRM admin panel.</p>
            </section>

            {/* Right: form */}
            <section className="flex items-center justify-center bg-gray-50 p-6 md:p-10">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                    <h2 className="mb-6 text-2xl font-semibold text-gray-800 text-center">Login</h2>

                    <Form<LoginFormData>
                        form={form}
                        layout="vertical"
                        name="loginForm"
                        size="large"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        scrollToFirstError
                    >
                        <Form.Item<LoginFormData>
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Enter a valid email" },
                            ]}
                        >
                            <Input placeholder="you@example.com" />
                        </Form.Item>

                        <Form.Item<LoginFormData>
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: "Password is required" }
                            ]}
                        >
                            <Input.Password placeholder="••••••••" />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button type="primary" htmlType="submit" block loading={submitting}>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </section>
        </div>
    );
}