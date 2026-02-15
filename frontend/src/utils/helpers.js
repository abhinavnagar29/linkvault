import { formatDistanceToNow, format } from 'date-fns';

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatExpiryTime(expiresAt) {
    const expiryDate = new Date(expiresAt);
    const now = new Date();

    if (expiryDate < now) {
        return 'Expired';
    }

    return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
}

export function formatDateTime(date) {
    return format(new Date(date), 'PPpp');
}

export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}
