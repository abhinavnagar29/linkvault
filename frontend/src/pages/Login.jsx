import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Home, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-24 relative z-10">
            <div className="w-full max-w-md animate-fade-in">
                <div className="glass rounded-3xl p-10 shadow-2xl border border-white/10 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 blur-xl opacity-50 animate-pulse-slow" />
                                <LogIn className="relative w-16 h-16 mx-auto text-primary-400" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-gray-400 flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Login to manage your links
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-white/5 focus:border-primary-500/50"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-white/5 focus:border-primary-500/50"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-primary-600/50 hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                                    Register
                                </Link>
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
