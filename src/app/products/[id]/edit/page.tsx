'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Package, Loader2 } from 'lucide-react';
import { productService } from '@/services/product.service';
import imageMatchingService from '@/services/image-matching.service';
import { Product, UpdateProductRequest } from '@/types/product';
import { formatCurrency } from '@/utils/formatters';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { ImageUploadGallery, DimensionsFormSection, PriceFormSection, UploadedImage } from '@/components/products';
import { CategorySelect, MaterialSelect } from '@/components/selects';
import styles from './edit.module.scss';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [existingImages, setExistingImages] = useState<UploadedImage[]>([]);
    const [newImages, setNewImages] = useState<UploadedImage[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [formData, setFormData] = useState<UpdateProductRequest>({
        name: '',
        categoryId: 0,
        materialId: 0,
        basePrice: 0,
        currentPrice: 0,
        description: '',
        notes: '',
        dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'cm'
        }
    });

    const [errors, setErrors] = useState<string[]>([]);

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
                setFormData({
                    name: data.name,
                    categoryId: data.categoryId,
                    materialId: data.materialId,
                    originalId: data.originalId || undefined,
                    feature: data.feature || undefined,
                    dimensions: data.dimensions || {
                        length: 0,
                        width: 0,
                        height: 0,
                        unit: 'cm'
                    },
                    basePrice: data.basePrice,
                    currentPrice: data.currentPrice,
                    description: data.description || '',
                    notes: data.notes || '',
                    status: data.status
                });
                // Map ProductImage to UploadedImage format
                setExistingImages((data.images || []).map(img => ({
                    id: img.imageId,
                    url: img.imageUrl
                })));
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



    const handleFilesSelected = useCallback(async (files: File[]) => {
        const imagePromises = files.map(file => {
            return new Promise<UploadedImage>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        id: '', // Will be set after upload
                        url: reader.result as string,
                        file
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        const images = await Promise.all(imagePromises);
        setNewImages(prev => [...prev, ...images]);
    }, []);

    const validateForm = (): boolean => {
        const validationErrors: string[] = [];

        if (!formData.name || !formData.name.trim()) {
            validationErrors.push('Tên sản phẩm không được để trống');
        } else if (formData.name.trim().length < 2) {
            validationErrors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
        }

        if (!formData.categoryId) {
            validationErrors.push('Vui lòng chọn danh mục');
        }

        if (!formData.materialId) {
            validationErrors.push('Vui lòng chọn vật liệu');
        }

        if ((formData.basePrice || 0) < 0) {
            validationErrors.push('Giá gốc không được âm');
        }

        if ((formData.currentPrice || 0) < 0) {
            validationErrors.push('Giá hiện tại không được âm');
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleInputChange = (field: keyof UpdateProductRequest, value: any) => {
        if (field === 'dimensions') {
            setFormData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, ...value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: field.includes('Price') || field.includes('Id') ? Number(value) : value
            }));
        }
        setError(null);
        setErrors([]);
    };

    const handlePriceChange = (field: 'basePrice' | 'currentPrice' | 'minPrice' | 'maxPrice', value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
        setErrors([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Upload new images
            const uploadedImageIds: string[] = [];
            if (newImages.length > 0) {
                setUploadingImages(true);
                for (const img of newImages) {
                    if (img.file) {
                        const result = await imageMatchingService.uploadImage(img.file, 'product-images');
                        uploadedImageIds.push(result.id);
                    }
                }
                setUploadingImages(false);
            }

            // Combine existing and new image IDs
            const existingImageIds = existingImages.map(img => img.id);
            const allImageIds = [...existingImageIds, ...uploadedImageIds];

            await productService.updateProduct(productId, {
                ...formData,
                imageIds: allImageIds
            });
            setSuccess(true);

            setTimeout(() => {
                router.push(`/products/${productId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update product');
            console.error('Update product error:', err);
        } finally {
            setSaving(false);
        }
    };

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

    if (error && !product) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="Không thể tải thông tin"
                icon={Package}
                backUrl="/products"
            >
                <FormNotice type="error" message={error} />
            </FormPageLayout>
        );
    }

    const isDisabled = saving || success;

    return (
        <FormPageLayout
            title="Chỉnh Sửa Sản Phẩm"
            subtitle="Cập nhật thông tin sản phẩm"
            icon={Package}
            backUrl="/products"
        >
            <FormNotice type="success" message={success ? "Cập nhật sản phẩm thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errors} />

            {/* Current Info */}
            {product && (
                <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>Thông tin hiện tại</h3>
                    <div className={styles.infoGrid}>
                        <div>
                            <span className={styles.infoLabel}>Tên:</span> {product.name}
                        </div>
                        <div>
                            <span className={styles.infoLabel}>Giá:</span> {formatCurrency(product.currentPrice || 0)}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Management */}
            <div className={styles.card}>
                <ImageUploadGallery
                    existingImages={existingImages}
                    onExistingImagesChange={setExistingImages}
                    newImages={newImages}
                    onNewImagesChange={setNewImages}
                    onFilesSelected={handleFilesSelected}
                    uploading={uploadingImages}
                    disabled={isDisabled}
                />
            </div>

            {/* Form */}
            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.gridTwo}>
                        {/* Basic Information */}
                        <div className={styles.fieldGroup}>
                            <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>

                            <FormField label="Tên sản phẩm" required>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={styles.input}
                                    placeholder="Nhập tên sản phẩm..."
                                    disabled={isDisabled}
                                />
                            </FormField>

                            <CategorySelect
                                value={formData.categoryId}
                                onChange={(value) => handleInputChange('categoryId', value)}
                                disabled={isDisabled}
                                required
                            />

                            <MaterialSelect
                                value={formData.materialId}
                                onChange={(value) => handleInputChange('materialId', value)}
                                disabled={isDisabled}
                                required
                            />

                            <FormField label="ID sản phẩm gốc">
                                <input
                                    type="number"
                                    value={formData.originalId || ''}
                                    onChange={(e) => handleInputChange('originalId', e.target.value)}
                                    className={styles.input}
                                    placeholder="ID sản phẩm gốc..."
                                    disabled={isDisabled}
                                />
                            </FormField>
                        </div>

                        {/* Pricing Information */}
                        <div className={styles.fieldGroup}>
                            <PriceFormSection
                                basePrice={formData.basePrice || 0}
                                currentPrice={formData.currentPrice || 0}
                                onChange={handlePriceChange}
                                disabled={isDisabled}
                                showMinMax={false}
                            />

                            <FormField label="Trạng thái">
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className={styles.select}
                                    disabled={isDisabled}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                    <option value="discontinued">Ngừng kinh doanh</option>
                                </select>
                            </FormField>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <DimensionsFormSection
                        dimensions={formData.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' }}
                        onChange={(dims) => handleInputChange('dimensions', dims)}
                        disabled={isDisabled}
                    />

                    <FormField label="Mô tả">
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className={styles.textarea}
                            placeholder="Nhập mô tả sản phẩm..."
                            disabled={isDisabled}
                        />
                    </FormField>

                    <FormField label="Ghi chú">
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={2}
                            className={styles.textarea}
                            placeholder="Nhập ghi chú..."
                            disabled={isDisabled}
                        />
                    </FormField>

                    <FormActions
                        cancelUrl="/products"
                        submitText="Lưu thay đổi"
                        loading={saving}
                        loadingText="Đang lưu..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
