'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    Globe,
    Monitor,
    Hash,
    Tag,
    FileCode,
    Clock
} from 'lucide-react';
import { auditLogService } from '@/services/audit-log.service';
import { AuditLog } from '@/types/audit-log';
import { formatDate } from '@/utils/formatters';

export default function AuditLogDetailPage() {
    const params = useParams();
    const logId = parseInt(params.id as string);

    const [log, setLog] = useState<AuditLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const data = await auditLogService.getLogById(logId);
                setLog(data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin log');
                console.error('Fetch audit log error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (logId) {
            fetchLog();
        }
    }, [logId]);

    const getActionBadgeColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELETE':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'RESTORE':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const renderJsonDiff = (oldValue: any, newValue: any, changedFields?: string[] | null) => {
        if (!oldValue && !newValue) {
            return <p className="text-gray-500 italic">Không có dữ liệu thay đổi</p>;
        }

        // For CREATE action, only show new value
        if (!oldValue && newValue) {
            return (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-700">Dữ liệu mới:</h4>
                    <pre className="bg-green-50 border border-green-200 rounded-lg p-4 overflow-x-auto text-xs">
                        {JSON.stringify(newValue, null, 2)}
                    </pre>
                </div>
            );
        }

        // For DELETE action, only show old value
        if (oldValue && !newValue) {
            return (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-700">Dữ liệu đã xóa:</h4>
                    <pre className="bg-red-50 border border-red-200 rounded-lg p-4 overflow-x-auto text-xs">
                        {JSON.stringify(oldValue, null, 2)}
                    </pre>
                </div>
            );
        }

        // For UPDATE action, show diff
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-700">Giá trị cũ:</h4>
                    <pre className="bg-red-50 border border-red-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96">
                        {JSON.stringify(oldValue, null, 2)}
                    </pre>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-700">Giá trị mới:</h4>
                    <pre className="bg-green-50 border border-green-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96">
                        {JSON.stringify(newValue, null, 2)}
                    </pre>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải thông tin log...</p>
                </div>
            </div>
        );
    }

    if (error || !log) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error || 'Không tìm thấy log'}</p>
                </div>
                <Link href="/audit-logs" className="text-blue-600 hover:text-blue-700">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/audit-logs">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chi Tiết Audit Log</h1>
                            <p className="text-gray-600">Log ID: #{log.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Log Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Entity Type */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Loại đối tượng</p>
                                    <p className="text-base font-medium text-gray-900">{log.entityType}</p>
                                </div>
                            </div>

                            {/* Entity ID */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Hash className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">ID đối tượng</p>
                                    <p className="text-base font-mono font-medium text-gray-900">#{log.entityId}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileCode className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Hành động</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getActionBadgeColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Thời gian</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(log.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Changed Fields */}
                        {log.changedFields && log.changedFields.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Các trường đã thay đổi:</p>
                                <div className="flex flex-wrap gap-2">
                                    {log.changedFields.map((field, index) => (
                                        <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        {log.reason && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Lý do:</p>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{log.reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Data Changes Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thay đổi dữ liệu</h2>
                        {renderJsonDiff(log.oldValue, log.newValue, log.changedFields)}
                    </div>
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Người thực hiện</h2>

                        <div className="space-y-4">
                            {/* User ID */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">User ID</p>
                                </div>
                                <p className="text-sm font-mono font-medium text-gray-900 ml-6">
                                    #{log.performedBy}
                                </p>
                            </div>

                            {/* IP Address */}
                            {log.ipAddress && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-500">Địa chỉ IP</p>
                                    </div>
                                    <p className="text-sm font-mono font-medium text-gray-900 ml-6">
                                        {log.ipAddress}
                                    </p>
                                </div>
                            )}

                            {/* User Agent */}
                            {log.userAgent && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Monitor className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-500">Trình duyệt</p>
                                    </div>
                                    <p className="text-xs text-gray-700 ml-6 break-words">
                                        {log.userAgent}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Info Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin hệ thống</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Log ID:</span>
                                <span className="font-mono font-medium text-gray-900">#{log.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Action Code:</span>
                                <span className="font-mono font-medium text-gray-900">{log.actionCode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
