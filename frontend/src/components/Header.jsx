import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Link as LinkIcon, Home, Sparkles } from 'lucide-react';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00F2FF" />
                                            <stop offset="100%" stopColor="#00A3FF" />
                                        </linearGradient>
                                        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <g filter="url(#neonGlow)">
                                        <path d="M48 12 L22 26 L22 45 L32 40 L32 30 L48 21 Z" fill="url(#shieldGradient)" />
                                        <path d="M52 12 L78 26 L78 45 L68 40 L68 30 L52 21 Z" fill="url(#shieldGradient)" />
                                        <path d="M22 55 L22 74 L48 88 L48 78 L32 70 L32 60 Z" fill="url(#shieldGradient)" />
                                        <path d="M78 55 L78 74 L52 88 L52 78 L68 70 L68 60 Z" fill="url(#shieldGradient)" />
                                        <path d="M50 38 L62 50 L50 62 L38 50 Z" fill="url(#shieldGradient)" />
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
                            LinkVault
                        </span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/my-links"
                                    className="flex items-center gap-2 px-4 py-2 glass-hover text-gray-200 rounded-lg transition-all hover:text-white"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-medium">My Links</span>
                                </Link>
                                <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-primary-500/20">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <User className="w-4 h-4 text-primary-400" />
                                    <span className="text-sm text-gray-200 max-w-[150px] truncate">{user?.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 glass-hover text-gray-300 rounded-lg transition-all hover:text-red-400 hover:border-red-500/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-5 py-2 glass-hover text-gray-200 rounded-lg transition-all font-medium hover:text-white"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg shadow-primary-600/30 transition-all"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
