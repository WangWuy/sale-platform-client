'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    AlertCircle,
    X,
    Plus,
    Edit,
    Trash2,
    RotateCcw,
    User,
    Calendar,
    Activity,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLog, AuditActionLabels, AuditAction } from '@/types/audit-log';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './audit-logs.module.scss';

export default function AuditLogsPage() {
    const {
        logs,
        total,
        totalPages,
        loading,
        error,
        fetchLogs
    } = useAuditLogs();

    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchLogs({
            page: currentPage,
            limit: pageSize,
            entityType: entityTypeFilter || undefined,
            action: actionFilter ? Number(actionFilter) as AuditAction : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, entityTypeFilter, actionFilter, fromDate, toDate]);

    const toggleRowExpansion = (logId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

    const getActionBadge = (action: AuditAction) => {
        switch (action) {
            case AuditAction.CREATE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border-green-200" variant="outline">
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        {AuditActionLabels[action]}
                    </Badge>
                );
            case AuditAction.UPDATE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                        <Edit className="w-4 h-4" aria-hidden="true" />
                        {AuditActionLabels[action]}
                    </Badge>
                );
            case AuditAction.DELETE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 border-red-200" variant="outline">
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        {AuditActionLabels[action]}
                    </Badge>
                );
            case AuditAction.RESTORE:
                return (
                    <Badge className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border-amber-200" variant="outline">
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        {AuditActionLabels[action]}
                    </Badge>
                );
        }
    };

    const entityTypes = ['Product', 'Category', 'User', 'Supplier', 'Inventory', 'Template', 'Tag'];

    const columns: Column<AuditLog>[] = [
        {
            key: 'expand',
            label: '',
            width: '5%',
            render: (log) => (
                <button
                    onClick={() => toggleRowExpansion(log.id)}
                    className="p-1 hover:bg-gray-100 rounded transition"
                    aria-label={expandedRows.has(log.id) ? 'Collapse row' : 'Expand row'}
                >
                    {expandedRows.has(log.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
            )
        },
        {
            key: 'entityType',
            label: 'Entity',
            width: '15%',
            render: (log) => (
                <div>
                    <p className="font-semibold text-gray-900">{log.entityType}</p>
                    <p className="text-sm text-gray-500 font-mono">ID: {log.entityId}</p>
                </div>
            )
        },
        {
            key: 'action',
            label: 'Hành động',
            width: '12%',
            render: (log) => getActionBadge(log.actionCode)
        },
        {
            key: 'performedBy',
            label: 'Người thực hiện',
            width: '12%',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span className="font-mono text-gray-700">User #{log.performedBy}</span>
                </div>
            )
        },
        {
            key: 'changedFields',
            label: 'Trường thay đổi',
            width: '20%',
            render: (log) => {
                if (!log.changedFields || log.changedFields.length === 0) {
                    return <span className="text-gray-400">N/A</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {log.changedFields.slice(0, 3).map((field, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-mono"
                            >
                                {field}
                            </span>
                        ))}
                        {log.changedFields.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                +{log.changedFields.length - 3}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'ipAddress',
            label: 'IP Address',
            width: '12%',
            render: (log) => (
                <span className="font-mono text-sm text-gray-600">
                    {log.ipAddress || <span className="text-gray-400">N/A</span>}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Thời gian',
            width: '18%',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span className="text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                </div>
            )
        }
    ];

    const calculatedTotalPages = Math.ceil(total / pageSize);

    return (
        <div className={styles.auditLogsPage}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle aria-hidden="true" />
                    <p>{error}</p>
                </div>
            )}

            {/* Table Wrapper - Scrollable Area */}
            <div className={styles.tableWrapper}>
                {/* Filters & Actions Bar */}
                <div className={styles.searchFiltersBar}>
                    {/* Entity Type Filter */}
                    <select
                        value={entityTypeFilter}
                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                        className={styles.filterSelect}
                        aria-label="Filter by entity type"
                    >
                        <option value="">Tất cả entity types</option>
                        {entityTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {/* Action Filter */}
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value ? Number(e.target.value) as AuditAction : '')}
                        className={styles.filterSelect}
                        aria-label="Filter by action"
                    >
                        <option value="">Tất cả hành động</option>
                        {Object.entries(AuditActionLabels).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>

                    {/* Date Range */}
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className={styles.filterInput}
                        aria-label="From date"
                        placeholder="Từ ngày"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className={styles.filterInput}
                        aria-label="To date"
                        placeholder="Đến ngày"
                    />

                    {/* Clear Filters */}
                    {(entityTypeFilter || actionFilter !== '' || fromDate || toDate) && (
                        <button
                            onClick={() => {
                                setEntityTypeFilter('');
                                setActionFilter('');
                                setFromDate('');
                                setToDate('');
                            }}
                            className={styles.clearFilters}
                            aria-label="Clear all filters"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />
                </div>

                {/* DataTable or Skeleton */}
                {loading && (!logs || logs.length === 0) ? (
                    <TableSkeleton rows={5} columns={7} />
                ) : (
                    <div>
                        <DataTable
                            data={logs || []}
                            columns={columns}
                            loading={loading}
                            emptyMessage="Chưa có log nào"

                            defaultPageSize={pageSize}
                        />

                        {/* Expanded Row Details */}
                        {logs.map((log) =>
                            expandedRows.has(log.id) && (
                                <div key={`expanded-${log.id}`} className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Old Value */}
                                        {log.oldValue && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Giá trị cũ:</h4>
                                                <div className={styles.jsonViewer}>
                                                    <pre>{JSON.stringify(log.oldValue, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}

                                        {/* New Value */}
                                        {log.newValue && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Giá trị mới:</h4>
                                                <div className={styles.jsonViewer}>
                                                    <pre>{JSON.stringify(log.newValue, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Agent & Reason */}
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {log.userAgent && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <strong>User Agent:</strong>
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono break-all">{log.userAgent}</p>
                                            </div>
                                        )}
                                        {log.reason && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Lý do:</strong>
                                                </p>
                                                <p className="text-sm text-gray-700">{log.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Pagination */}
                {calculatedTotalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} logs
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={styles.paginationButton}
                                aria-label="Previous page"
                            >
                                Trước
                            </button>
                            {Array.from({ length: Math.min(5, calculatedTotalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`${styles.paginationButton} ${currentPage === pageNum ? styles.paginationButtonActive : ''
                                            }`}
                                        aria-label={`Go to page ${pageNum}`}
                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(calculatedTotalPages, p + 1))}
                                disabled={currentPage === calculatedTotalPages}
                                className={styles.paginationButton}
                                aria-label="Next page"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
