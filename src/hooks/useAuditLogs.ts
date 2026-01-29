'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditLogService } from '@/services/audit-log.service';
import {
    AuditLog,
    AuditLogFilterParams,
    AuditLogStats
} from '@/types/audit-log';

export function useAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async (params?: AuditLogFilterParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await auditLogService.getLogs(params);

            setLogs(response.logs);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        logs,
        total,
        totalPages,
        loading,
        error,
        fetchLogs
    };
}

export function useAuditStats() {
    const [stats, setStats] = useState<AuditLogStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await auditLogService.getStats();
            setStats(data);
        } catch (err) {
            setError('Failed to fetch audit stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refreshStats: fetchStats };
}
