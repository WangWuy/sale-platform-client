'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Truck,
    AlertCircle,
    Mail,
    Phone,
    MapPin,
    User,
    Loader2,
    Edit,
    Calendar,
    Package
} from 'lucide-react';
import { supplierService } from '@/services/supplier.service';
import { Supplier } from '@/types/supplier';
import { formatDate } from '@/utils/formatters';

export default function SupplierDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supplierId = parseInt(params.id as string);

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const data = await supplierService.getSupplierById(supplierId);
                setSupplier(data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin nhà cung cấp');
                console.error('Fetch supplier error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (supplierId) {
            fetchSupplier();
        }
    }, [supplierId]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải thông tin nhà cung cấp...</p>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error || 'Không tìm thấy nhà cung cấp'}</p>
                </div>
                <Link href="/suppliers" className="text-indigo-600 hover:text-indigo-700">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Link href="/suppliers">
                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                                <ArrowLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                        </Link>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                                <p className="text-gray-600">Chi tiết nhà cung cấp</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Link href={`/suppliers/${supplierId}/edit`}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Tên nhà cung cấp</p>
                                    <p className="text-base font-medium text-gray-900">{supplier.name}</p>
                                </div>
                            </div>

                            {/* Contact Person */}
                            {supplier.contact && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Người liên hệ</p>
                                        <p className="text-base font-medium text-gray-900">{supplier.contact}</p>
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            {supplier.email && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Email</p>
                                        <a
                                            href={`mailto:${supplier.email}`}
                                            className="text-base font-medium text-green-600 hover:text-green-700 hover:underline"
                                        >
                                            {supplier.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {supplier.phone && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <a
                                            href={`tel:${supplier.phone}`}
                                            className="text-base font-medium text-purple-600 hover:text-purple-700 hover:underline"
                                        >
                                            {supplier.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {supplier.address && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="text-base font-medium text-gray-900 whitespace-pre-line">{supplier.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                    {/* Timestamps Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h2>

                        <div className="space-y-4">
                            {/* Created At */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">Ngày tạo</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {formatDate(supplier.createdAt)}
                                </p>
                            </div>

                            {/* Updated At */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {formatDate(supplier.updatedAt)}
                                </p>
                            </div>

                            {/* Supplier ID */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">ID</p>
                                </div>
                                <p className="text-sm font-mono font-medium text-gray-900 ml-6">
                                    #{supplier.id}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thao tác nhanh</h3>
                        <div className="space-y-2">
                            <Link href={`/suppliers/${supplierId}/edit`}>
                                <button className="w-full flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border border-gray-200">
                                    <Edit className="w-4 h-4" />
                                    <span className="text-sm font-medium">Chỉnh sửa thông tin</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
