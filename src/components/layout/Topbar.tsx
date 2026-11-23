import { Button } from "antd";
import { useAuth } from "../../auth/useAuth";

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { user, logout } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
                <Button className="md:hidden" onClick={onMenuClick} aria-label="Open menu">
                    ☰
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <span className="hidden text-sm text-gray-600 sm:block">{user?.name}</span>
                {/* ProtectedRoute redirects automatically once isAuthenticated becomes false */}
                <Button onClick={logout}>Logout</Button>
            </div>
        </header>
    );
}