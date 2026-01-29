'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { IconButton } from './Button';
import styles from './DataTable.module.scss';

export interface Column<T> {
    key: string;
    label: React.ReactNode;
    width?: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    defaultPageSize?: number;
    hideSearch?: boolean;
}

import { EmptyDataIllustration } from './EmptyState';

export function DataTable<T extends { id: number | string }>({
    data = [],
    columns,
    loading = false,
    emptyMessage = 'Không có dữ liệu',
    emptyIcon = <EmptyDataIllustration />,
    searchPlaceholder = 'Tìm kiếm...',
    onSearch,
    defaultPageSize = 20,
    hideSearch = false
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Ensure data is always an array
    const safeData = data || [];

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        if (onSearch) {
            onSearch(value);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(safeData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = safeData.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className={styles.dataTable}>
            {/* Search Bar */}
            <div className={styles.searchBar}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 />
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className={styles.emptyState}>
                        {emptyIcon}
                        <p className={styles.emptyMessage}>{emptyMessage}</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead className={styles.tableHead}>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        style={{ width: column.width }}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={styles.tableBody}>
                            {paginatedData.map((item) => (
                                <tr key={item.id}>
                                    {columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render
                                                ? column.render(item)
                                                : (item as any)[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!loading && paginatedData.length > 0 && (
                <div className={styles.footer}>
                    {/* Page Size Selector */}
                    <div className={styles.pageSizeSelector}>
                        <span className={styles.label}>Hiển thị:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className={styles.info}>
                            ({startIndex + 1} - {Math.min(endIndex, safeData.length)} của {safeData.length})
                        </span>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <IconButton
                            icon={ChevronLeft}
                            variant="ghost"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            title="Trang trước"
                        />
                        <span className={styles.pageInfo}>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <IconButton
                            icon={ChevronRight}
                            variant="ghost"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            title="Trang sau"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
