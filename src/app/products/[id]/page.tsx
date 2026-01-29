'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    AlertCircle,
    DollarSign,
    Calendar,
    Loader2,
    Tag,
    Layers
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { ProductStatus, Product } from '@/types/product';
import { formatCurrency, formatDimensions, formatDate } from '@/utils/formatters';
import styles from './detail.module.scss';

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (isNaN(productId)) {
            setError('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }

        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(productId);
            if (data) {
                setProduct(data);
            } else {
                setError('Không tìm thấy sản phẩm');
            }
        } catch (err) {
            setError('Failed to fetch product');
            console.error('Fetch product error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setDeleteLoading(true);
        try {
            await productService.deleteProduct(productId);
            router.push('/products');
        } catch (err: any) {
            setError(err.message || 'Failed to delete product');
            setDeleteLoading(false);
            console.error('Delete product error:', err);
        }
    };


    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.APPROVED:
                return 'bg-green-100 text-green-700 border-green-200';
            case ProductStatus.PENDING:
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case ProductStatus.REJECTED:
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.APPROVED:
                return 'Đã duyệt';
            case ProductStatus.PENDING:
                return 'Chờ duyệt';
            case ProductStatus.REJECTED:
                return 'Từ chối';
            default:
                return 'N/A';
        }
    };

    const getDimensionsString = (dimensions: any) => formatDimensions(dimensions);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang tải thông tin sản phẩm...
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.page}>
                <div className={styles.headerLeft}>
                    <Link href="/products">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                </div>
                <div className={styles.notice}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error || 'Không tìm thấy sản phẩm'}</p>
                </div>
            </div>
        );
    }


    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/products">
                        <button className={styles.backLink}>
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </Link>
                    <div className={styles.divider}></div>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerBadge}>
                            <Package className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className={styles.title}>{product.name}</h1>
                            <p className={styles.subtitle}>Chi tiết sản phẩm</p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Link href={`/products/${product.id}/edit`}>
                        <button className={styles.buttonPrimary}>
                            <Edit className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className={styles.buttonDanger}
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
                <div className={styles.notice}>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p>{error}</p>
                </div>
            )}

            {/* Product Details */}
            <div className={styles.layoutGrid}>
                {/* Main Info */}
                <div className={styles.stack}>
                    {/* Product Images */}
                    {product.images && product.images.length > 0 && (
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>
                                <Package className="w-5 h-5 text-indigo-600" />
                                Hình ảnh sản phẩm
                            </h2>
                            <div className="space-y-4">
                                {/* Primary Image */}
                                {product.images[0] && (
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={product.images[0].imageUrl || '/placeholder.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Thumbnail Gallery */}
                                {product.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.images.slice(1).map((img: any, index: number) => (
                                            <div
                                                key={index}
                                                className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-primary-400 transition cursor-pointer"
                                            >
                                                <img
                                                    src={img.imageUrl || '/placeholder.png'}
                                                    alt={`${product.name} ${index + 2}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>
                            <Package className="w-5 h-5 text-purple-600" />
                            Thông tin cơ bản
                        </h2>
                        <div className={styles.infoStack}>
                            <div>
                                <label className={styles.label}>Mã sản phẩm</label>
                                <p className={styles.value}>{product.code}</p>
                            </div>
                            <div>
                                <label className={styles.label}>Tên sản phẩm</label>
                                <p className={styles.value}>{product.name}</p>
                            </div>
                            {product.description && (
                                <div>
                                    <label className={styles.label}>Mô tả</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
                                </div>
                            )}
                            {product.notes && (
                                <div>
                                    <label className={styles.label}>Ghi chú</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{product.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category & Material */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>
                            <Tag className="w-5 h-5 text-blue-600" />
                            Phân loại
                        </h2>
                        <div className={styles.gridTwo}>
                            <div>
                                <label className={styles.label}>Danh mục</label>
                                <p className={styles.valueMuted}>
                                    {product.categoryInfo?.name || `Danh mục #${product.categoryId}`}
                                </p>
                            </div>
                            <div>
                                <label className={styles.label}>Vật liệu</label>
                                <p className={styles.valueMuted}>
                                    {product.materialInfo?.name || `Vật liệu #${product.materialId}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Thông tin giá
                        </h2>
                        <div className={styles.infoStack}>
                            <div className={styles.gridTwo}>
                                <div>
                                    <label className={styles.label}>Giá gốc</label>
                                    <p className={styles.priceStrong}>{formatCurrency(product.basePrice)}</p>
                                </div>
                                <div>
                                    <label className={styles.label}>Giá hiện tại</label>
                                    <p className={styles.priceAccent}>{formatCurrency(product.currentPrice)}</p>
                                </div>
                            </div>
                            {(product.minPrice > 0 || product.maxPrice > 0) && (
                                <div className={styles.gridTwo}>
                                    <div>
                                        <label className={styles.label}>Giá tối thiểu</label>
                                        <p className={styles.priceMin}>{formatCurrency(product.minPrice)}</p>
                                    </div>
                                    <div>
                                        <label className={styles.label}>Giá tối đa</label>
                                        <p className={styles.priceMax}>{formatCurrency(product.maxPrice)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dimensions */}
                    {product.dimensions && (
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>
                                <Layers className="w-5 h-5 text-orange-600" />
                                Kích thước
                            </h2>
                            <div>
                                <label className={styles.label}>Kích thước</label>
                                <p className={styles.value}>{getDimensionsString(product.dimensions)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className={styles.stack}>
                    {/* Status */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>Trạng thái</h2>
                        <div className={`${styles.statusBadge} ${getStatusColor(product.status)}`}>
                            {getStatusLabel(product.status)}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Thời gian
                        </h2>
                        <div className={styles.infoStack}>
                            <div>
                                <label className={styles.label}>Ngày tạo</label>
                                <p className={styles.valueMuted}>{product.createdAt ? formatDate(product.createdAt) : 'N/A'}</p>
                            </div>
                            <div>
                                <label className={styles.label}>Cập nhật lần cuối</label>
                                <p className={styles.valueMuted}>{product.updatedAt ? formatDate(product.updatedAt) : 'N/A'}</p>
                            </div>
                            {product.approvedAt && (
                                <div>
                                    <label className={styles.label}>Ngày duyệt</label>
                                    <p className={styles.valueMuted}>{formatDate(product.approvedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
