'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FolderTree,
    AlertCircle,
    Calendar,
    FileText,
    Loader2,
    Package
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types/category';
import { formatDate } from '@/utils/formatters';

export default function CategoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = parseInt(params.id as string);

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (isNaN(categoryId)) {
            setError('ID danh mục không hợp lệ');
            setLoading(false);
            return;
        }

        fetchCategory();
    }, [categoryId]);

    const fetchCategory = async () => {
        try {
            const data = await categoryService.getCategoryById(categoryId);
            setCategory(data);
        } catch (err) {
            setError('Failed to fetch category');
            console.error('Fetch category error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setDeleteLoading(true);
        try {
            await categoryService.deleteCategory(categoryId);
            router.push('/categories');
        } catch (err: any) {
            setError(err.message || 'Failed to delete category');
            setDeleteLoading(false);
            console.error('Delete category error:', err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang tải thông tin danh mục...
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="p-8">
                <div className="mb-6">
                    <Link href="/categories">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error || 'Không tìm thấy danh mục'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/categories">
                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                                <ArrowLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                        </Link>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <FolderTree className="w-7 h-7 text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                <p className="text-gray-600">Chi tiết danh mục</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/categories/${category.id}/edit`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <Edit className="w-4 h-4" />
                                Chỉnh sửa
                            </button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Category Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-amber-600" />
                            Thông tin cơ bản
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tên danh mục</label>
                                <p className="text-gray-900 font-medium text-lg">{category.name}</p>
                            </div>
                            {category.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Mô tả</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{category.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Thống kê
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium">Số sản phẩm</p>
                                <p className="text-2xl font-bold text-blue-900">0</p>
                                <p className="text-xs text-blue-500">Sản phẩm trong danh mục</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-medium">Trạng thái</p>
                                <p className="text-lg font-semibold text-green-900">Hoạt động</p>
                                <p className="text-xs text-green-500">Danh mục đang được sử dụng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhanh</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <FolderTree className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ID danh mục</p>
                                    <p className="font-medium text-gray-900">#{category.id}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tên danh mục</label>
                                <p className="text-gray-900 font-medium">{category.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Thời gian
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                                <p className="text-gray-900">{formatDate(category.createdAt)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                                <p className="text-gray-900">{formatDate(category.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-600" />
                            Thao tác nhanh
                        </h2>
                        <div className="space-y-2">
                            <Link href={`/categories/${category.id}/edit`}>
                                <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa thông tin
                                </button>
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Xóa danh mục
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
