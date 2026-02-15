import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Download, FileText, Lock, Clock, Eye, AlertCircle, Home, Code } from 'lucide-react';
import { getContent } from '../utils/api';
import { formatFileSize, formatExpiryTime, copyToClipboard } from '../utils/helpers';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ViewContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [enableSyntaxHighlight, setEnableSyntaxHighlight] = useState(true);

    // Detect programming language from content
    const detectLanguage = (text) => {
        if (!text) return 'text';
        const content = text.toLowerCase();

        if (content.includes('function') || content.includes('const') || content.includes('let')) return 'javascript';
        if (content.includes('def ') || content.includes('import ')) return 'python';
        if (content.includes('public class') || content.includes('private ')) return 'java';
        if (content.includes('<?php')) return 'php';
        if (content.includes('#include') || content.includes('int main')) return 'cpp';
        if (content.includes('SELECT') || content.includes('INSERT')) return 'sql';
        if (content.includes('<html') || content.includes('<div')) return 'html';
        if (content.includes('{') && content.includes(':')) return 'json';

        return 'text';
    };

    const fetchContent = async (pwd = null) => {
        try {
            setLoading(true);
            setError(null);
            setPasswordError('');
            const data = await getContent(id, pwd);
            setContent(data);
            setRequiresPassword(false);
            setLoading(false); // Clear loading immediately on success
        } catch (err) {
            if (err.response?.data?.requiresPassword) {
                setRequiresPassword(true);
                setLoading(false);
            } else if (err.response?.status === 401 && pwd) {
                // Incorrect password for protected content
                setPasswordError(err.response?.data?.error || 'Incorrect password');
                setLoading(false);
            } else if (err.response?.status === 410 && pwd) {
                // Max views reached for password-protected content
                setError(err.response?.data?.error || 'This link has reached its maximum view count');
                setRequiresPassword(false);
                setLoading(false);
            } else {
                setError(err.response?.data?.error || 'Failed to load content');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchContent();
    }, [id]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            toast.error('Please enter a password');
            return;
        }
        setPasswordLoading(true);
        setPasswordError('');
        await fetchContent(password);
        setPasswordLoading(false);
    };

    const handleCopy = async () => {
        try {
            await copyToClipboard(content.content);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleDownload = () => {
        window.open(content.fileUrl, '_blank');
        toast.success('Download started');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading content...</p>
                </div>
            </div>
        );
    }

    if (requiresPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="glass rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <Lock className="w-16 h-16 mx-auto mb-4 text-primary-400" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Password Protected
                            </h2>
                            <p className="text-gray-400">
                                This content is password protected
                            </p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                            />

                            {passwordError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm text-center">{passwordError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50"
                            >
                                {passwordLoading ? 'Verifying...' : 'Unlock Content'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full py-3 glass-hover text-gray-300 font-medium rounded-lg transition-all"
                            >
                                <Home className="w-4 h-4 inline mr-2" />
                                Go Home
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="glass rounded-2xl p-8 shadow-2xl text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {error.includes('expired') ? 'Link Expired' :
                                error.includes('not found') ? 'Not Found' :
                                    error.includes('maximum') ? 'View Limit Reached' : 'Error'}
                        </h2>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg transition-all"
                        >
                            <Home className="w-4 h-4 inline mr-2" />
                            Create New Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-3xl animate-fade-in">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {content.link_name || (content.type === 'text' ? 'Shared Text' : 'Shared File')}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatExpiryTime(content.expiresAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {content.viewCount} {content.viewCount === 1 ? 'view' : 'views'}
                        </span>
                        {content.isOneTime && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                                One-time view
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Card */}
                <div className="glass rounded-2xl p-8 shadow-2xl">
                    {content.type === 'text' ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {content.link_name || 'Text Content'}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEnableSyntaxHighlight(!enableSyntaxHighlight)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${enableSyntaxHighlight
                                            ? 'bg-primary-600 text-white'
                                            : 'glass-hover text-gray-300'
                                            }`}
                                    >
                                        <Code className="w-4 h-4" />
                                        {enableSyntaxHighlight ? 'Syntax ON' : 'Syntax OFF'}
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-4 py-2 glass-hover text-gray-300 rounded-lg transition-all"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {enableSyntaxHighlight ? (
                                <SyntaxHighlighter
                                    language={detectLanguage(content.content)}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        maxHeight: '24rem',
                                    }}
                                    showLineNumbers
                                >
                                    {content.content}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="glass rounded-lg p-6 max-h-96 overflow-y-auto">
                                    <pre className="text-gray-300 whitespace-pre-wrap break-words font-mono text-sm">
                                        {content.content}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Download className="w-16 h-16 mx-auto mb-4 text-primary-400" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {content.fileName}
                            </h3>
                            <p className="text-gray-400 mb-1">
                                {formatFileSize(content.fileSize)}
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                {content.fileType}
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                Downloaded {content.downloadCount} {content.downloadCount === 1 ? 'time' : 'times'}
                            </p>

                            <button
                                onClick={handleDownload}
                                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg shadow-primary-600/50 transition-all"
                            >
                                <Download className="w-5 h-5 inline mr-2" />
                                Download File
                            </button>
                        </div>
                    )}

                    {content.isOneTime && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm text-center">
                                ⚠️ This is a one-time view link. It has been deleted and cannot be accessed again.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Home className="w-4 h-4 inline mr-2" />
                        Create your own secure link
                    </button>
                </div>
            </div>
        </div>
    );
}
