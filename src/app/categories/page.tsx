'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    FolderTree,
    AlertCircle
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/category';
import { IconButton } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import styles from './categories.module.scss';

export default function CategoriesPage() {
    const { categories, total, loading, error, deleteCategory, fetchCategories } = useCategories();
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
            await deleteCategory(id);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<Category>[] = [
        {
            key: 'name',
            label: 'Tên danh mục',
            width: '40%',
            render: (category) => (
                <span className="font-medium text-gray-900">{category.name}</span>
            )
        },
        {
            key: 'description',
            label: 'Mô tả',
            width: '45%',
            render: (category) => (
                <div className="text-gray-600">
                    {category.description || <span className="text-gray-400 italic">Chưa có mô tả</span>}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '15%',
            render: (category) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/categories/${category.id}/edit`}>
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
                        onClick={() => handleDelete(category.id, category.name)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className={styles.categoriesPage}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage} role="alert">
                    <AlertCircle aria-hidden="true" />
                    <p>{error}</p>
                </div>
            )}

            {/* Table Wrapper - Scrollable Area */}
            <div className={styles.tableWrapper}>
                {/* Actions Bar */}
                <div className={styles.searchFiltersBar}>
                    {/* Create Button */}
                    <Link href="/categories/create" className={styles.createButton}>
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        Thêm mới
                    </Link>
                </div>

                {/* DataTable */}
                <DataTable
                    data={filteredCategories}
                    columns={columns}
                    loading={loading}
                    emptyMessage={searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}

                    searchPlaceholder="Tìm kiếm danh mục..."
                    onSearch={setSearchQuery}
                    defaultPageSize={20}
                />
            </div>
        </div>
    );
}
