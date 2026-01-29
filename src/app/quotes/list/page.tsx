'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Download,
    Eye,
    Trash2,
    X
} from 'lucide-react';
import { quoteService } from '@/services/quote.service';
import { Quote, QuoteFilterParams, QuoteStatus } from '@/types/quote';
import { formatCurrency } from '@/utils/formatters';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import styles from './quotes-list.module.scss';

export default function QuoteListPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchQuotes();
    }, []);

    useEffect(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const nextFiltered = quotes.filter((quote) => {
            const matchesStatus = filterStatus === 'all' ? true : quote.status === Number(filterStatus);
            if (!matchesStatus) return false;
            if (!normalizedSearch) return true;
            const codeMatch = quote.code?.toLowerCase().includes(normalizedSearch);
            const nameMatch = quote.customerName?.toLowerCase().includes(normalizedSearch);
            const phoneMatch = quote.customerPhone?.toLowerCase().includes(normalizedSearch);
            return Boolean(codeMatch || nameMatch || phoneMatch);
        });

        setFilteredQuotes(nextFiltered);
    }, [quotes, filterStatus, searchQuery]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const params: QuoteFilterParams = {
                page: 1,
                limit: 100,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
            const response = await quoteService.getQuotes(params);
            setQuotes(response.quotes || []);
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa báo giá này?')) return;

        try {
            await quoteService.deleteQuote(id);
            fetchQuotes();
        } catch (error) {
            console.error('Failed to delete quote:', error);
            alert('Xóa báo giá thất bại');
        }
    };



    // Define columns for DataTable
    const columns: Column<Quote>[] = [
        {
            key: 'code',
            label: 'Mã báo giá',
            width: '15%',
            render: (quote) => (
                <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <FileText className="w-5 h-5 text-primary-500" />
                    <span className="font-semibold text-gray-900">{quote.code}</span>
                </div>
            )
        },
        {
            key: 'customerName',
            label: 'Khách hàng',
            width: '20%',
            render: (quote) => <span className="text-gray-700">{quote.customerName || '-'}</span>
        },
        {
            key: 'customerPhone',
            label: 'Số điện thoại',
            width: '15%',
            render: (quote) => <span className="text-gray-600">{quote.customerPhone || '-'}</span>
        },
        {
            key: 'finalAmount',
            label: 'Tổng tiền',
            width: '15%',
            render: (quote) => (
                <span className="font-semibold text-green-600">{formatCurrency(quote.finalAmount)}</span>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '15%',
            render: (quote) => <QuoteStatusBadge status={quote.status} />
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            width: '12%',
            render: (quote) => (
                <span className="text-gray-600">
                    {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '8%',
            render: (quote) => (
                <div className="flex items-center justify-end" style={{ gap: '0.5rem' }}>
                    <Link
                        href={`/quotes/${quote.id}`}
                        className="hover:bg-gray-100 rounded-lg transition"
                        style={{ padding: '0.5rem' }}
                        title="Xem"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button
                        onClick={() => handleDelete(quote.id)}
                        className="hover:bg-red-50 rounded-lg transition"
                        style={{ padding: '0.5rem' }}
                        title="Xóa"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.quotesPage}>
            <div className={styles.tableWrapper}>
                {/* Filters & Actions Bar */}
                <div className={styles.searchFiltersBar}>
                    <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                        aria-label="Filter by status"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value={QuoteStatus.DRAFT}>Nháp</option>
                        <option value={QuoteStatus.SENT}>Đã báo khách</option>
                        <option value={QuoteStatus.ACCEPTED}>Khách chấp nhận</option>
                        <option value={QuoteStatus.REJECTED}>Khách từ chối</option>
                    </select>

                    {filterStatus !== 'all' && (
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={styles.clearFilters}
                            aria-label="Clear filters"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    <div style={{ flex: 1 }} />

                    <button className={styles.excelButton}>
                        <Download className="w-5 h-5" aria-hidden="true" />
                        Xuất Excel
                    </button>
                </div>

                {/* DataTable */}
                <DataTable
                    data={filteredQuotes}
                    columns={columns}
                    loading={loading}
                    emptyMessage={searchQuery ? 'Không tìm thấy báo giá nào' : 'Chưa có báo giá nào'}

                    searchPlaceholder="Tìm kiếm theo mã báo giá, tên khách hàng..."
                    onSearch={setSearchQuery}
                    defaultPageSize={20}
                />
            </div>
        </div>
    );
}
