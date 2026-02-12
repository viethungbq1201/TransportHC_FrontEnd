import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Truck, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username || !form.password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(form);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-blue-900/90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Logistics Port"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 contrast-125 saturate-0 mix-blend-overlay"
                />

                {/* Branding Content */}
                <div className="relative z-20 p-12 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                            <Truck className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">TransportHC</h1>
                        <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                            Comprehensive transport & logistics management system. Optimize processes, improve operational efficiency.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-3xl font-bold text-blue-400">12K+</h3>
                            <p className="text-blue-200 text-sm mt-1">Orders</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-blue-400">50+</h3>
                            <p className="text-blue-200 text-sm mt-1">Fleet</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-blue-400">200+</h3>
                            <p className="text-blue-200 text-sm mt-1">Routes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 w-full flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-[440px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
                        <p className="text-slate-500">Enter your credentials to access the management system.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">⚠️</div>
                            <div>{error}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-900">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter username"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-900">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-400">Demo: admin / admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
