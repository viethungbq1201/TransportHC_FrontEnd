import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Users, Truck, Route, FolderTree, Package,
    Warehouse, FileText, CalendarClock, Tag, DollarSign, ClipboardList,
    BarChart3, Search, Bell, ChevronLeft, ChevronDown, LogOut, Settings,
    Menu, X
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'User Management', icon: Users },
    { path: '/trucks', label: 'Truck Management', icon: Truck },
    { path: '/routes', label: 'Route Management', icon: Route },
    { path: '/categories', label: 'Category Management', icon: FolderTree },
    { path: '/products', label: 'Product Management', icon: Package },
    { path: '/inventory', label: 'Inventory Management', icon: Warehouse },
    { path: '/transactions', label: 'Transaction Management', icon: FileText },
    { path: '/schedules', label: 'Schedule Management', icon: CalendarClock },
    { path: '/cost-types', label: 'Cost Type', icon: Tag },
    { path: '/costs', label: 'Cost Management', icon: DollarSign },
    { path: '/salary-reports', label: 'Salary Report', icon: ClipboardList },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
];

const AppLayout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                </div>
                {!collapsed && <span className="text-lg font-bold text-slate-900 tracking-tight">TransportHC</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive(path)
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Collapse button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center gap-2 px-5 py-4 border-t border-slate-200 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
                <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                {!collapsed && <span>Collapse</span>}
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white shadow-xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700">
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <div className="flex-1 max-w-lg">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Notification bell */}
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                        </button>

                        {/* User profile */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-slate-900">{user?.username || user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500">{user?.role || 'Admin'}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                            <Settings className="w-4 h-4" /> Settings
                                        </button>
                                        <hr className="my-1 border-slate-100" />
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
