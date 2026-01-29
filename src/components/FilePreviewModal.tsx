'use client';

import { useEffect } from 'react';
import {
    X,
    Download,
    Calendar,
    HardDrive,
    Tag,
    Folder,
    User,
    Eye,
    FileText,
    Image as ImageIcon,
    Video,
    File
} from 'lucide-react';
import { FileItem, FileType, formatFileSize } from '@/types/file';

interface FilePreviewModalProps {
    file: FileItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !file) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileTypeIcon = (type: FileType) => {
        switch (type) {
            case FileType.IMAGE:
                return <ImageIcon className="w-5 h-5" />;
            case FileType.VIDEO:
                return <Video className="w-5 h-5" />;
            case FileType.DOCUMENT:
                return <FileText className="w-5 h-5" />;
            default:
                return <File className="w-5 h-5" />;
        }
    };

    const getFileTypeColor = (type: FileType) => {
        switch (type) {
            case FileType.IMAGE:
                return 'bg-green-100 text-green-700 border-green-200';
            case FileType.VIDEO:
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case FileType.DOCUMENT:
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const renderPreview = () => {
        if (file.type === FileType.IMAGE) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    <img
                        src={file.url}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            );
        }

        if (file.type === FileType.VIDEO) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    <video
                        src={file.url}
                        controls
                        className="max-w-full max-h-full"
                    >
                        Trình duyệt không hỗ trợ video.
                    </video>
                </div>
            );
        }

        // For documents and other files, show a placeholder
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${getFileTypeColor(file.type)}`}>
                    {getFileTypeIcon(file.type)}
                </div>
                <p className="text-gray-600 font-medium mb-2">{file.originalName}</p>
                <p className="text-sm text-gray-500">{file.mimeType}</p>
                <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileTypeColor(file.type)}`}>
                            {getFileTypeIcon(file.type)}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 truncate max-w-md">{file.name}</h2>
                            <p className="text-sm text-gray-600">{file.originalName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={file.url}
                            download={file.originalName}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            Tải xuống
                        </a>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        {/* Preview Area */}
                        <div className="lg:col-span-2 min-h-[400px]">
                            {renderPreview()}
                        </div>

                        {/* Metadata Sidebar */}
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin file</h3>
                                <div className="space-y-3">
                                    {/* Size */}
                                    <div className="flex items-start gap-2">
                                        <HardDrive className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Kích thước</p>
                                            <p className="text-sm font-medium text-gray-900">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Loại file</p>
                                            <p className="text-sm font-medium text-gray-900">{file.mimeType}</p>
                                        </div>
                                    </div>

                                    {/* Visibility */}
                                    <div className="flex items-start gap-2">
                                        <Eye className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Trạng thái</p>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${file.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {file.isPublic ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Folder & Tags */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Phân loại</h3>
                                <div className="space-y-3">
                                    {/* Folder */}
                                    {file.folder && (
                                        <div className="flex items-start gap-2">
                                            <Folder className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600">Thư mục</p>
                                                <p className="text-sm font-medium text-gray-900">{file.folder}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {file.tags && file.tags.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <Tag className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600 mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {file.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử</h3>
                                <div className="space-y-3">
                                    {/* Created */}
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600">Ngày tải lên</p>
                                            <p className="text-xs font-medium text-gray-900">{formatDate(file.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Updated */}
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600">Cập nhật lần cuối</p>
                                            <p className="text-xs font-medium text-gray-900">{formatDate(file.updatedAt)}</p>
                                        </div>
                                    </div>

                                    {/* Uploaded By */}
                                    <div className="flex items-start gap-2">
                                        <User className="w-4 h-4 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600">Người tải lên</p>
                                            <p className="text-xs font-mono font-medium text-gray-900">User #{file.uploadedBy}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* URL */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">URL</h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-2">
                                    <p className="text-xs font-mono text-gray-600 break-all">{file.url}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
