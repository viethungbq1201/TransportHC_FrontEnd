import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { canAccessNavItem } from '@/constants/permissions';
import scheduleService from '@/services/scheduleService';
import transactionService from '@/services/transactionService';
import {
    LayoutDashboard, Users, Truck, Route, FolderTree, Package,
    Warehouse, FileText, CalendarClock, Tag, DollarSign, ClipboardList,
    BarChart3, Search, Bell, ChevronLeft, ChevronDown, ChevronRight, LogOut, Settings,
    Menu, X, ListOrdered
} from 'lucide-react';

/* ──── Navigation structure ──── */
const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/trucks', label: 'Trucks', icon: Truck },
    { path: '/routes', label: 'Routes', icon: Route },
    {
        label: 'Products', icon: Package,
        children: [
            { path: '/categories', label: 'Categories', icon: FolderTree },
            { path: '/products', label: 'Products', icon: Package },
        ],
    },
    { path: '/inventory', label: 'Inventory', icon: Warehouse },
    {
        label: 'Transactions', icon: FileText,
        children: [
            { path: '/transactions', label: 'Transactions', icon: FileText },
            { path: '/transaction-details', label: 'Transaction Details', icon: ListOrdered },
        ],
    },
    { path: '/schedules', label: 'Schedules', icon: CalendarClock },
    {
        label: 'Costs', icon: DollarSign,
        children: [
            { path: '/cost-types', label: 'Cost Types', icon: Tag },
            { path: '/costs', label: 'Costs', icon: DollarSign },
        ],
    },
    {
        label: 'Reports', icon: BarChart3,
        children: [
            { path: '/salary-reports', label: 'Salary Reports', icon: ClipboardList },
            { path: '/reports', label: 'Reports', icon: BarChart3 },
        ],
    },
];

/* ──── Sidebar nav item (leaf) ──── */
const NavLink = ({ path, label, icon: Icon, collapsed, onMobileClose }) => {
    const location = useLocation();
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
        <Link
            to={path}
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'}`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
};

/* ──── Sidebar group (dropdown) ──── */
const NavGroup = ({ label, icon: Icon, children, collapsed, onMobileClose }) => {
    const location = useLocation();
    const isChildActive = children.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
    const [open, setOpen] = useState(isChildActive);
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => collapsed && setHovered(true)}
            onMouseLeave={() => collapsed && setHovered(false)}
        >
            <button
                onClick={() => !collapsed && setOpen(!open)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isChildActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'}
                    ${collapsed ? 'justify-center' : ''}`}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                    <>
                        <span className="truncate flex-1 text-left">{label}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                    </>
                )}
            </button>

            {/* Expanded mode: inline dropdown */}
            {!collapsed && open && (
                <div className="ml-4 pl-3 border-l border-slate-200 dark:border-slate-700 mt-0.5 space-y-0.5">
                    {children.map(child => (
                        <NavLink key={child.path} {...child} collapsed={false} onMobileClose={onMobileClose} />
                    ))}
                </div>
            )}

            {/* Collapsed mode: floating popover on hover */}
            {collapsed && hovered && (
                <div className="absolute left-full top-0 pl-2 z-50">
                    <div className="w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-2">
                        <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                        <div className="space-y-0.5 px-1">
                            {children.map(child => (
                                <NavLink key={child.path} {...child} collapsed={false} onMobileClose={onMobileClose} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ──── Layout ──── */
const AppLayout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        setMounted(true);
        loadNotifications();
    }, [user]); // Reload when user changes

    const loadNotifications = async () => {
        if (!user) return;
        try {
            // Only fetch if admin for system-wide alerts, or you could filter by creatorId if available
            const [schedules, transactions] = await Promise.all([
                scheduleService.getAllSchedules().catch(() => []),
                transactionService.getAllTransactions().catch(() => [])
            ]);

            const newNotifs = [];
            let idCounter = 1;

            const pendingSchedules = schedules.filter(s => s.status === 'PENDING' || s.approveStatus === 'PENDING');
            if (pendingSchedules.length > 0) {
                newNotifs.push({
                    id: idCounter++,
                    title: 'Pending Schedules',
                    desc: `There are ${pendingSchedules.length} schedules that require your approval.`,
                    time: 'Action Required',
                    unread: true
                });
            }

            const pendingTransactions = transactions.filter(t => t.status === 'PENDING' || t.approveStatus === 'PENDING');
            if (pendingTransactions.length > 0) {
                newNotifs.push({
                    id: idCounter++,
                    title: 'Pending Transactions',
                    desc: `There are ${pendingTransactions.length} transactions waiting for approval.`,
                    time: 'Action Required',
                    unread: true
                });
            }

            setNotifications(newNotifs);
        } catch (err) {
            console.error('Failed to load notifications', err);
        }
    };

    const markAllAsRead = () => {
        setNotifications([]);
    };

    const closeMobile = () => setMobileOpen(false);

    // Filter nav items based on user permissions
    const filteredNavItems = useMemo(() => {
        return navItems
            .map(item => {
                if (item.children) {
                    // Filter children, keep group only if at least one child is accessible
                    const accessibleChildren = item.children.filter(child =>
                        canAccessNavItem(user, child.path)
                    );
                    if (accessibleChildren.length === 0) return null;
                    return { ...item, children: accessibleChildren };
                }
                // Leaf item
                return canAccessNavItem(user, item.path) ? item : null;
            })
            .filter(Boolean);
    }, [user]);

    // Flatten accessible nav items for global search
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const term = searchQuery.toLowerCase();
        const results = [];
        filteredNavItems.forEach(item => {
            if (item.children) {
                item.children.forEach(child => {
                    if (child.label.toLowerCase().includes(term)) results.push(child);
                });
            } else if (item.label.toLowerCase().includes(term)) {
                results.push(item);
            }
        });
        return results;
    }, [searchQuery, filteredNavItems]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 transition-colors duration-200">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 dark:border-slate-800/50">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-5 h-5 text-white" />
                </div>
                {!collapsed && <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">TransportHC</span>}
            </div>

            {/* Navigation — filtered by user permissions */}
            <nav className={`flex-1 py-3 px-3 space-y-1 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                {filteredNavItems.map((item) =>
                    item.children ? (
                        <NavGroup key={item.label} {...item} collapsed={collapsed} onMobileClose={closeMobile} />
                    ) : (
                        <NavLink key={item.path} {...item} collapsed={collapsed} onMobileClose={closeMobile} />
                    )
                )}
            </nav>

            {/* Collapse button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800/50 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
                <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                {!collapsed && <span>Collapse</span>}
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800/50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeMobile} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-slate-950 shadow-xl transition-transform">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Taskbar */}
                <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 px-6 py-3 flex items-center gap-4 transition-colors duration-200 z-10">
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 max-w-lg min-w-0">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all shadow-sm"
                            />
                            {/* Super lightweight search visual feedback for UX */}
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {/* Search Results Dropdown */}
                            {searchFocused && searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
                                    {searchResults.length > 0 ? (
                                        <div className="py-1">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={result.path}
                                                    to={result.path}
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setSearchFocused(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                                                >
                                                    <result.icon className="w-4 h-4 text-indigo-500" />
                                                    <span>{result.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                                            No pages found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 ml-auto">

                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                                className="relative p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 transform origin-top-right transition-all">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                                            {notifications.length > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline focus:outline-none">
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center">
                                                    <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="px-4 py-3 cursor-pointer transition-colors bg-indigo-50/30 dark:bg-indigo-500/5 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0 bg-indigo-500"></div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
                                                                <p className="text-[10px] font-medium text-slate-400 mt-1.5">{n.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                            >
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-white dark:ring-slate-950">
                                    {(user?.username || user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.username || user?.name || 'Admin User'}</p>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{user?.roles?.[0] || 'ADMIN'}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 transform origin-top-right transition-all">
                                        <div className="px-4 py-2 mb-1 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username || user?.name || 'Admin User'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.roles?.[0] || 'ADMIN'}</p>
                                        </div>
                                        <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <Settings className="w-4 h-4" /> Account Settings
                                        </button>
                                        <hr className="my-1.5 border-slate-100 dark:border-slate-800" />
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
