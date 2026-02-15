import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Copy, Check, Home, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';

export default function Success() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/view/${id}`;

    const handleCopy = async () => {
        try {
            await copyToClipboard(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleVisit = () => {
        window.open(shareUrl, '_blank');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="w-full max-w-2xl animate-fade-in">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Link Created Successfully!
                    </h1>
                    <p className="text-gray-400">
                        Your content has been uploaded and is ready to share
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass rounded-2xl p-8 shadow-2xl space-y-6">
                    {/* Share Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Shareable Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-3 glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 select-all"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                                    }`}
                            >
                                {copied ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-4">
                            Or scan this QR code to share
                        </p>
                        <div className="inline-block p-4 bg-white rounded-lg">
                            <QRCodeSVG value={shareUrl} size={200} />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleVisit}
                            className="flex items-center justify-center gap-2 px-6 py-3 glass-hover text-gray-300 font-medium rounded-lg transition-all"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Visit Link
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-lg shadow-lg transition-all"
                        >
                            <Home className="w-5 h-5" />
                            Create Another
                        </button>
                    </div>

                    {/* Important Notice */}
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 text-sm text-center">
                            Save this link! Once you leave this page, you won't be able to retrieve it again.
                        </p>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-8 glass rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                        Sharing Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-primary-400 mt-1">•</span>
                            <span>Share this link via email, messaging apps, or social media</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-400 mt-1">•</span>
                            <span>The link will automatically expire after the set time</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-400 mt-1">•</span>
                            <span>If you set a password, make sure to share it separately</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-400 mt-1">•</span>
                            <span>One-time view links will be deleted after the first access</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
