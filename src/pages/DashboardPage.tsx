import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.name}</h1>
            <p className="mt-2 text-gray-500">Here is an overview of your CRM.</p>
        </div>
    );
}