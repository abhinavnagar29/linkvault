import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyLinks, deleteContent } from '../utils/api';
import { Link as LinkIcon, FileText, File, Copy, Trash2, Home, Clock, Eye, Search, Filter } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import toast from 'react-hot-toast';

export default function MyLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const data = await getMyLinks();
            setLinks(data.links);
        } catch (error) {
            toast.error('Failed to load links');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (uniqueId) => {
        const url = `${window.location.origin}/view/${uniqueId}`;
        copyToClipboard(url);
        toast.success('Link copied to clipboard!');
    };

    const handleDelete = async (uniqueId) => {
        if (!confirm('Are you sure you want to delete this link?')) return;

        try {
            await deleteContent(uniqueId);
            toast.success('Link deleted successfully');
            setLinks(links.filter(link => link.uniqueId !== uniqueId));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete link');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    // Filter and sort links
    const filteredLinks = useMemo(() => {
        let filtered = [...links];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(link =>
                (link.link_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (link.type === 'text' && link.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (link.fileName?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(link => link.type === typeFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            const now = new Date();
            if (statusFilter === 'active') {
                filtered = filtered.filter(link => !link.expires_at || new Date(link.expires_at) > now);
            } else if (statusFilter === 'expired') {
                filtered = filtered.filter(link => link.expires_at && new Date(link.expires_at) <= now);
            }
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'most_viewed':
                    return (b.view_count || 0) - (a.view_count || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [links, searchQuery, typeFilter, statusFilter, sortBy]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 relative z-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">My Links</h1>
                            <p className="text-gray-400">
                                Logged in as <span className="text-primary-400">{user?.email}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-4 py-2 glass-hover text-gray-300 rounded-lg transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-4 py-2 glass-hover text-gray-300 rounded-lg transition-all"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search links..."
                                className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-white/5"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-white/5 appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="text">Text</option>
                                <option value="file">File</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all border border-white/5 appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Sort by:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy('newest')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'newest'
                                    ? 'bg-primary-600 text-white'
                                    : 'glass text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                Newest
                            </button>
                            <button
                                onClick={() => setSortBy('oldest')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'oldest'
                                    ? 'bg-primary-600 text-white'
                                    : 'glass text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                Oldest
                            </button>
                            <button
                                onClick={() => setSortBy('most_viewed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'most_viewed'
                                    ? 'bg-primary-600 text-white'
                                    : 'glass text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                Most Viewed
                            </button>
                        </div>
                        <span className="text-gray-400 text-sm ml-auto">
                            {filteredLinks.length} of {links.length} links
                        </span>
                    </div>
                </div>

                {/* Links List */}
                {filteredLinks.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <LinkIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {links.length === 0 ? 'No links yet' : 'No links match your filters'}
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Upload your first text or file to get started
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg transition-all"
                        >
                            Create Link
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLinks.map((link) => (
                            <div key={link.uniqueId} className="glass rounded-xl p-6 hover:bg-white/5 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {link.type === 'text' ? (
                                                <FileText className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                            ) : (
                                                <File className="w-5 h-5 text-accent-400 flex-shrink-0" />
                                            )}
                                            <Link
                                                to={`/view/${link.uniqueId}`}
                                                className="group-hover/link:text-primary-400 transition-colors block min-w-0"
                                            >
                                                <h3 className="text-lg font-semibold text-white truncate hover:text-primary-400 transition-colors">
                                                    {link.link_name || (link.type === 'text' ? 'Text Content' : link.fileName)}
                                                </h3>
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Expires: {formatDate(link.expiresAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {link.viewCount} views
                                            </div>
                                            {link.type === 'file' && (
                                                <div>{formatFileSize(link.fileSize)}</div>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Created: {formatDate(link.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopyLink(link.uniqueId)}
                                            className="p-2 glass-hover text-gray-300 rounded-lg transition-all"
                                            title="Copy link"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.uniqueId)}
                                            className="p-2 glass-hover text-red-400 rounded-lg transition-all hover:bg-red-500/10"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
