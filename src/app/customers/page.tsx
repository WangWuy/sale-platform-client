'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    AlertCircle,
    Mail,
    Phone,
    X
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, CUSTOMER_TYPES, CustomerType } from '@/types/customer';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import styles from './customers.module.scss';

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');

    const {
        customers,
        total,
        loading,
        error,
        deleteCustomer
    } = useCustomers({
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const handleDelete = async (id: number) => {
        if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
            await deleteCustomer(id);
        }
    };

    const getCustomerTypeLabel = (type?: string | null) => {
        return type || 'N/A'; // Already in Vietnamese
    };

    const getCustomerTypeColor = (type?: string | null) => {
        // Simple color mapping based on type
        if (!type) return 'bg-gray-100 text-gray-700 border-gray-200';
        const colorMap: Record<string, string> = {
            'Quán cà phê': 'bg-amber-100 text-amber-700 border-amber-200',
            'Nhà hàng': 'bg-orange-100 text-orange-700 border-orange-200',
            'Văn phòng': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Khách sạn': 'bg-pink-100 text-pink-700 border-pink-200',
            'Cửa hàng nội thất': 'bg-green-100 text-green-700 border-green-200',
            'Căn hộ': 'bg-blue-100 text-blue-700 border-blue-200',
            'Biệt thự': 'bg-purple-100 text-purple-700 border-purple-200',
            'Showroom': 'bg-teal-100 text-teal-700 border-teal-200'
        };
        return colorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = !typeFilter || customer.customerType === typeFilter;

        return matchesSearch && matchesType;
    });

    const columns: Column<Customer>[] = [
        {
            key: 'customer',
            label: 'Khách hàng',
            width: '30%',
            render: (customer) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.customerType || 'Chưa phân loại'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Liên hệ',
            width: '25%',
            render: (customer) => (
                <div className="space-y-1">
                    {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {customer.email}
                        </div>
                    )}
                    {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {customer.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'type',
            label: 'Loại',
            width: '15%',
            render: (customer) => (
                <Badge variant="outline" className={getCustomerTypeColor(customer.customerType)}>
                    {getCustomerTypeLabel(customer.customerType)}
                </Badge>
            )
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            width: '20%',
            render: (customer) => (
                <p className="text-sm text-gray-600 line-clamp-2">
                    {customer.address || 'N/A'}
                </p>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '10%',
            render: (customer) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/customers/${customer.id}`}>
                        <IconButton
                            icon={Eye}
                            variant="ghost"
                            title="Xem chi tiết"
                        />
                    </Link>
                    <Link href={`/customers/${customer.id}/edit`}>
                        <IconButton
                            icon={Edit}
                            variant="primary"
                            title="Chỉnh sửa"
                        />
                    </Link>
                    <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Xóa"
                        onClick={() => handleDelete(customer.id)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className={styles.customersPage}>
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
                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.filterSelect}
                        aria-label="Filter by customer type"
                    >
                        <option value="">Tất cả loại</option>
                        {CUSTOMER_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters Button */}
                    {typeFilter && (
                        <button
                            onClick={() => setTypeFilter('')}
                            className={styles.clearFilters}
                            aria-label="Clear filters"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Create Button */}
                    <Link href="/customers/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable */}
                <DataTable
                    data={filteredCustomers}
                    columns={columns}
                    loading={loading}
                    emptyMessage={searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}

                    searchPlaceholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
                    onSearch={setSearchQuery}
                    defaultPageSize={20}
                />
            </div>
        </div>
    );
}
