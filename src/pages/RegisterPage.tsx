import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Form, Input, Button, Checkbox, message } from "antd";
import type { FormProps } from 'antd';

import type { RegisterFormData } from "../types/auth.types";
import { registerUser } from '../services/auth.service';

export default function RegisterPage() {

    const [form] = Form.useForm<RegisterFormData>();
    const navigate = useNavigate();
    const [ submitting, setSubmitting ] = useState(false);

    const handleServerError = (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            message.error("Something went wrong. Please try again.");
            return;
        }

        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 409) {
            // Duplicate email
            form.setFields([{ name: "email", errors: [data?.error?.message ?? "Email is already registered"] }]);
            return;
        }

        if (status === 422 && data?.errors) {
            // Map server field errors onto the form
            form.setFields(
                Object.entries(data.errors).map(([field, errors]) => ({
                    name: field as keyof RegisterFormData,
                    errors: Array.isArray(errors)
                        ? errors.filter((error): error is string => typeof error === "string")
                        : [],
                })),
            );
            return;
        }

        // Network errors (no response), 5xx, and anything else
        message.error(data?.error?.message ?? data?.message ?? (error.response ? "Registration failed" : "Network error. Check your connection."));
    };

    const onFinish = async (values: RegisterFormData) => {
        const payload: RegisterFormData = {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password
        }

        setSubmitting(true);
        
        try {
            const response = await registerUser(payload);
            if (!response.success) {
                message.error(response.error?.message ?? "Registration failed");
                return;
            }

            form.resetFields();
            message.success("Registration successful. Please log in.");
            navigate('/login');
        } catch (error) {
            handleServerError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const onFinishFailed: FormProps<RegisterFormData>["onFinishFailed"] = ({ errorFields }) => {
        message.warning(`Please fix ${errorFields.length} field${errorFields.length > 1 ? "s" : ""} to continue`);
        if (errorFields[0]?.name) {
            form.scrollToField(errorFields[0].name);
        }
    };

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
                    <h2 className="mb-6 text-2xl font-semibold text-gray-800 text-center">Create an account</h2>

                    <Form<RegisterFormData>
                        form={form}
                        layout="vertical"
                        name="signupForm"
                        size="large"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        scrollToFirstError
                    >
                        <Form.Item<RegisterFormData>
                            label="Name"
                            name="name"
                            rules={[
                                { required: true, message: "Name is required" },
                                { whitespace: true, message: "Name cannot be blank" }
                            ]}
                        >
                            <Input placeholder="John Doe" />
                        </Form.Item>

                        <Form.Item<RegisterFormData>
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Enter a valid email" },
                            ]}
                        >
                            <Input placeholder="you@example.com" />
                        </Form.Item>

                        <Form.Item<RegisterFormData>
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: "Password is required" },
                                { min: 8, message: "Password must be at least 8 characters" },
                                { max: 16, message: "Password must be at most 16 characters" }
                            ]}
                        >
                            <Input.Password placeholder="••••••••" />
                        </Form.Item>

                        <Form.Item 
                            name="accept" 
                            valuePropName="checked" 
                            className="mb-4"
                            rules={[{
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error("You must accept the terms")),
                            }]}
                        >
                            <Checkbox>I accept the Terms & Conditions</Checkbox>
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button type="primary" htmlType="submit" block loading={submitting}>
                                Register
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </section>
        </div>
    );
}