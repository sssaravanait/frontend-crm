import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/customers", label: "Customers" },
    { to: "/settings", label: "Settings" },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-cyan-900 text-white transition-transform duration-200 md:static md:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-6 text-xl font-bold">Mini CRM</div>

                <nav className="flex flex-col gap-1 px-3">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `rounded-lg px-4 py-2 transition-colors ${
                                    isActive ? "bg-cyan-700 font-medium" : "hover:bg-cyan-800"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}