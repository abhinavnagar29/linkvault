import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, FileText, Lock, Shield, Zap, Link2, User, ChevronDown, Sparkles } from 'lucide-react';
import { uploadContent } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [uploadType, setUploadType] = useState('text');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [expiryPreset, setExpiryPreset] = useState('1hour');
    const [customExpiry, setCustomExpiry] = useState('');
    const [maxViews, setMaxViews] = useState('');
    const [showCustomViews, setShowCustomViews] = useState(false);
    const [linkName, setLinkName] = useState('');
    const [isOneTime, setIsOneTime] = useState(false);
    const [previousMaxViews, setPreviousMaxViews] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Auto-set max views to 1 when self-destruct is enabled, restore previous value when disabled
    useEffect(() => {
        if (isOneTime) {
            // Save current max views before setting to 1
            setPreviousMaxViews(maxViews);
            setMaxViews('1');
            setShowCustomViews(false);
        } else {
            // Restore previous max views when self-destruct is disabled
            if (previousMaxViews !== undefined) {
                setMaxViews(previousMaxViews);
            }
        }
    }, [isOneTime]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadType('file');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const calculateExpiryDate = () => {
        if (expiryPreset === 'custom' && customExpiry) {
            return new Date(customExpiry).toISOString();
        }

        const now = new Date();
        const presets = {
            '10min': 10 * 60 * 1000,
            '1hour': 60 * 60 * 1000,
            '10hour': 10 * 60 * 60 * 1000,
            'day': 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
        };

        return new Date(now.getTime() + (presets[expiryPreset] || presets['10hour'])).toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploadType === 'text' && !content.trim()) {
            toast.error('Please enter some text');
            return;
        }

        if (uploadType === 'file' && !file) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);

        try {
            const data = {
                type: uploadType,
                content: uploadType === 'text' ? content : undefined,
                file: uploadType === 'file' ? file : undefined,
                password: password || undefined,
                expiresAt: calculateExpiryDate(),
                maxViews: maxViews ? parseInt(maxViews) : undefined,
                isOneTime,
                linkName: linkName || undefined,
            };

            const result = await uploadContent(data);

            // If not logged in, save to local storage for potential claiming later
            if (!isAuthenticated) {
                const anonymousLinks = JSON.parse(localStorage.getItem('anonymousLinks') || '[]');
                if (!anonymousLinks.includes(result.uniqueId)) {
                    anonymousLinks.push(result.uniqueId);
                    localStorage.setItem('anonymousLinks', JSON.stringify(anonymousLinks));
                }
            }

            toast.success('Content uploaded successfully!');
            navigate(`/success/${result.uniqueId}`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error || 'Failed to upload content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
                {/* Main Card */}
                <div className="card-main rounded-3xl shadow-2xl overflow-hidden relative">
                    {/* Header Bar */}
                    <div className="bg-gradient-to-r from-slate-700/40 to-slate-800/40 px-8 py-5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center p-1">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="shieldGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00F2FF" />
                                            <stop offset="100%" stopColor="#00A3FF" />
                                        </linearGradient>
                                        <filter id="neonGlowHome" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <g filter="url(#neonGlowHome)">
                                        <path d="M48 12 L22 26 L22 45 L32 40 L32 30 L48 21 Z" fill="url(#shieldGradientHome)" />
                                        <path d="M52 12 L78 26 L78 45 L68 40 L68 30 L52 21 Z" fill="url(#shieldGradientHome)" />
                                        <path d="M22 55 L22 74 L48 88 L48 78 L32 70 L32 60 Z" fill="url(#shieldGradientHome)" />
                                        <path d="M78 55 L78 74 L52 88 L52 78 L68 70 L68 60 Z" fill="url(#shieldGradientHome)" />
                                        <path d="M50 38 L62 50 L50 62 L38 50 Z" fill="url(#shieldGradientHome)" />
                                    </g>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">LinkVault</span>
                        </div>
                        <div className="flex items-center gap-5">
                            {isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => navigate('/my-links')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 text-sm font-medium"
                                    >
                                        <FileText className="w-4 h-4" />
                                        My Links
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 text-sm font-medium"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <div className="flex items-center gap-2.5 text-gray-200 text-sm">
                                        <User className="w-4 h-4" />
                                        <span>{user?.email}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            window.location.href = '/login';
                                        }}
                                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-300 text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 text-sm font-medium"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-blue-300 text-sm font-medium"
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-12 py-10">
                        {/* Title Section */}
                        <div className="mb-8">
                            <h1 className="text-6xl font-bold text-white mb-2">LinkVault</h1>
                            <p className="text-gray-300 text-lg mb-5">Upload once. Share securely.</p>
                            <div className="flex items-center gap-5 text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    <span className="text-sm">Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-sm">Private</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-sm">Fast</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle with Gradient */}
                            <div className="flex justify-center mb-6">
                                <div className="flex gap-0 rounded-full overflow-hidden border-2 border-slate-600/50">
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('text')}
                                        className={`px-12 py-3 font-semibold transition-all ${uploadType === 'text'
                                            ? 'toggle-active-text text-white'
                                            : 'toggle-inactive'
                                            }`}
                                    >
                                        Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadType('file')}
                                        className={`px-12 py-3 font-semibold transition-all ${uploadType === 'file'
                                            ? 'toggle-active-file text-white'
                                            : 'toggle-inactive'
                                            }`}
                                    >
                                        File
                                    </button>
                                </div>
                            </div>

                            {/* Content Input */}
                            {uploadType === 'text' ? (
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Paste your text here..."
                                        className="w-full h-32 px-5 py-4 input-field rounded-2xl transition-all resize-none text-base font-medium"
                                        required={uploadType === 'text'}
                                    />
                                    <div className="absolute bottom-4 right-5 text-gray-500 text-sm flex items-center gap-3">
                                        <span>{content.length} characters</span>
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-500'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        required={uploadType === 'file'}
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        {file ? (
                                            <p className="text-white font-medium">{file.name}</p>
                                        ) : (
                                            <p className="text-gray-400">Drop file or click to browse</p>
                                        )}
                                    </label>
                                </div>
                            )}

                            {/* Expiry Time */}
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 rounded-full border-2 border-emerald-400/60 text-emerald-300 font-medium text-sm"
                                    >
                                        Expiry Time
                                    </button>
                                    {[
                                        { value: '10min', label: '10 mins' },
                                        { value: '1hour', label: '1 hour' },
                                        { value: '1day', label: '1 day' },
                                        { value: '1week', label: '1 week' },
                                        { value: 'custom', label: 'Custom' },
                                    ].map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setExpiryPreset(preset.value)}
                                            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${expiryPreset === preset.value
                                                ? 'pill-button-active'
                                                : 'pill-button'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                {expiryPreset === 'custom' && (
                                    <input
                                        type="datetime-local"
                                        value={customExpiry}
                                        onChange={(e) => setCustomExpiry(e.target.value)}
                                        className="w-full px-4 py-3 input-field rounded-xl mb-4 text-sm font-medium"
                                        required
                                    />
                                )}
                                <div className="flex justify-end gap-3">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10 my-6"></div>

                            {/* Optional Settings */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center justify-between text-base">
                                    Optional Settings
                                    <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password Protection (Optional)"
                                                className="w-full pl-11 pr-4 py-3 input-field rounded-xl text-sm font-medium"
                                            />
                                        </div>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={linkName}
                                                onChange={(e) => setLinkName(e.target.value)}
                                                placeholder="Link Name (Optional)"
                                                className="w-full pl-11 pr-4 py-3 input-field rounded-xl text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={showCustomViews ? 'custom' : (maxViews || 'placeholder')}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === 'unlimited' || value === 'placeholder') {
                                                    setMaxViews('');
                                                    setShowCustomViews(false);
                                                } else if (value === 'custom') {
                                                    setShowCustomViews(true);
                                                } else {
                                                    setMaxViews(value);
                                                    setShowCustomViews(false);
                                                }
                                            }}
                                            className="w-full px-4 py-3 dropdown-field rounded-xl text-sm font-medium pr-10"
                                        >
                                            <option value="placeholder" disabled>Maximum Views (Optional)</option>
                                            <option value="1">1 view</option>
                                            <option value="5">5 views</option>
                                            <option value="10">10 views</option>
                                            <option value="custom">Custom...</option>
                                            <option value="unlimited">Unlimited</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                    {showCustomViews && (
                                        <input
                                            type="number"
                                            value={maxViews}
                                            onChange={(e) => setMaxViews(e.target.value)}
                                            placeholder="Enter custom max views"
                                            className="w-full px-4 py-3 input-field rounded-xl text-sm font-medium"
                                            min="1"
                                        />
                                    )}
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <span className="text-gray-200 text-sm font-medium">Self-destruct after first view</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsOneTime(!isOneTime)}
                                            className={`relative w-16 h-8 rounded-full transition-all ${isOneTime ? 'toggle-switch-active' : 'toggle-switch-inactive'
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-lg ${isOneTime ? 'translate-x-8' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 btn-primary text-white font-bold rounded-2xl disabled:opacity-50 text-lg mt-6"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate Secure Link'
                                )}
                            </button>
                        </form>
                    </div>


                </div>
            </div>
        </div>
    );
}
