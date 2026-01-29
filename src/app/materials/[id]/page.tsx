'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Layers,
    AlertCircle,
    User,
    DollarSign,
    Calendar,
    FileText,
    Loader2
} from 'lucide-react';
import { materialService, Material } from '@/services/material.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getMaterialGroupLabel, getMaterialTierLabel, getMaterialUnitLabel } from '@/constants/material.constants';
import styles from './detail.module.scss';

export default function MaterialDetailPage() {
    const router = useRouter();
    const params = useParams();
    const materialId = parseInt(params.id as string);

    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (isNaN(materialId)) {
            setError('ID vật liệu không hợp lệ');
            setLoading(false);
            return;
        }

        fetchMaterial();
    }, [materialId]);

    const fetchMaterial = async () => {
        try {
            const data = await materialService.getMaterialById(materialId);
            if (data) {
                setMaterial(data);
            } else {
                setError('Không tìm thấy vật liệu');
            }
        } catch (err) {
            setError('Không thể tải thông tin vật liệu');
            console.error('Fetch material error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc muốn xóa vật liệu này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setDeleteLoading(true);
        try {
            await materialService.deleteMaterial(materialId);
            router.push('/materials');
        } catch (err: any) {
            setError(err.message || 'Không thể xóa vật liệu');
            setDeleteLoading(false);
            console.error('Delete material error:', err);
        }
    };


    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                <span className={styles.loadingText}>Đang tải thông tin vật liệu...</span>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className={styles.page}>
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error || 'Không tìm thấy vật liệu'}</p>
                </div>
                <Link href="/materials">
                    <button className={styles.backLink}>
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                </Link>
            </div>
        );
    }

    const hasSupplier = material.supplierId !== null && material.supplierId !== undefined;
    const formatCostForQuantity = (quantity: number) => formatCurrency(material.costPerUnit * quantity);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <Link href="/materials">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerBadge}>
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className={styles.title}>{material.name}</h1>
                            <p className={styles.subtitle}>Chi tiết vật liệu</p>
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Link href={`/materials/${material.id}/edit`}>
                        <button className={styles.buttonEdit}>
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className={styles.buttonDelete}
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

            {/* Error Message */}
            {error && (
                <div className={`${styles.notice} ${styles.noticeError}`}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error}</p>
                </div>
            )}

            {/* Material Details */}
            <div className={styles.detailGrid}>
                {/* Main Info */}
                <div className={styles.mainColumn}>
                    {/* Basic Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <Layers className="w-5 h-5 text-cyan-600" />
                            Thông tin cơ bản
                        </h2>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <label>Tên vật liệu</label>
                                <p className={styles.infoValue}>{material.name}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Nhóm vật liệu</label>
                                <p className={styles.infoValue}>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                        {getMaterialGroupLabel(material.materialGroup)}
                                    </span>
                                </p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phân khúc</label>
                                <p className={styles.infoValue}>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {getMaterialTierLabel(material.tier)}
                                    </span>
                                </p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Đơn vị tính</label>
                                <p className={styles.infoValue}>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getMaterialUnitLabel(material.unit)}
                                    </span>
                                </p>
                            </div>
                            {material.description && (
                                <div className={styles.infoItem}>
                                    <label>Mô tả</label>
                                    <p className={styles.infoDescription}>{material.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Thông tin giá
                        </h2>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <label>Giá mỗi {getMaterialUnitLabel(material.unit)}</label>
                                <p className={styles.priceMain}>{formatCurrency(material.costPerUnit)}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Chi phí cho 10 {getMaterialUnitLabel(material.unit)}</label>
                                <p className={styles.priceSecondary}>{formatCostForQuantity(10)}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Chi phí cho 100 {getMaterialUnitLabel(material.unit)}</label>
                                <p className={styles.priceSecondary}>{formatCostForQuantity(100)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    {/* Supplier Information */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <User className="w-5 h-5 text-blue-600" />
                            Nhà cung cấp
                        </h2>
                        {hasSupplier ? (
                            <div className={styles.supplierInfo}>
                                <p>ID: <span className={styles.supplierId}>#{material.supplierId}</span></p>
                                <p className={styles.supplierNote}>Vật liệu có nhà cung cấp</p>
                            </div>
                        ) : (
                            <div className={styles.supplierEmpty}>
                                <p>Chưa có nhà cung cấp</p>
                                <p className={styles.supplierNote}>Vật liệu chưa được gán nhà cung cấp</p>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Thời gian
                        </h2>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <label>Ngày tạo</label>
                                <p className={styles.infoValue}>{formatDate(material.createdAt)}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Cập nhật lần cuối</label>
                                <p className={styles.infoValue}>{formatDate(material.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <FileText className="w-5 h-5 text-orange-600" />
                            Thao tác nhanh
                        </h2>
                        <div className={styles.quickActions}>
                            <Link href={`/materials/${material.id}/edit`}>
                                <button className={styles.quickActionEdit}>
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa thông tin
                                </button>
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className={styles.quickActionDelete}
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Xóa vật liệu
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
