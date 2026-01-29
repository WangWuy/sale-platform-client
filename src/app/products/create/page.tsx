'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { productService } from '@/services/product.service';
import { CreateProductRequest } from '@/types/product';
import imageMatchingService from '@/services/image-matching.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { ImageUploadGallery, DimensionsFormSection, PriceFormSection, UploadedImage } from '@/components/products';
import { CategorySelect, MaterialSelect } from '@/components/selects';
import styles from './create.module.scss';

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<CreateProductRequest>({
        name: '',
        categoryId: 0,
        materialId: 0,
        basePrice: 0,
        currentPrice: 0,
        minPrice: 0,
        maxPrice: 0,
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

    const handleFilesSelected = useCallback(async (files: File[]) => {
        setUploading(true);
        try {
            for (const file of files) {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const uploadResult = await imageMatchingService.uploadImage(file, 'product-images');
                        setUploadedImages(prev => [...prev, {
                            id: uploadResult.id,
                            url: reader.result as string,
                            file
                        }]);
                    } catch (error) {
                        console.error('Upload failed:', error);
                        alert(`Upload ảnh ${file.name} thất bại`);
                    }
                };
                reader.readAsDataURL(file);
            }
        } finally {
            setUploading(false);
        }
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

        if (formData.basePrice < 0) {
            validationErrors.push('Giá gốc không được âm');
        }

        if (formData.currentPrice < 0) {
            validationErrors.push('Giá hiện tại không được âm');
        }

        if ((formData.minPrice || 0) < 0) {
            validationErrors.push('Giá tối thiểu không được âm');
        }

        if ((formData.maxPrice || 0) < 0) {
            validationErrors.push('Giá tối đa không được âm');
        }

        if ((formData.minPrice || 0) > (formData.maxPrice || 0)) {
            validationErrors.push('Giá tối thiểu không được lớn hơn giá tối đa');
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
        if (field === 'dimensions') {
            setFormData(prev => ({
                ...prev,
                dimensions: { ...prev.dimensions, ...value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: field.includes('Price') || field.includes('originalId') ? Number(value) : value
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

        setLoading(true);
        setError(null);

        try {
            const imageIds = uploadedImages.map(img => img.id);

            await productService.createProduct({
                ...formData,
                imageIds
            });
            setSuccess(true);

            setTimeout(() => {
                router.push('/products');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create product');
            console.error('Create product error:', err);
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = loading || success;

    return (
        <FormPageLayout
            title="Tạo Sản Phẩm Mới"
            subtitle="Thêm sản phẩm mới vào danh mục"
            icon={Package}
            backUrl="/products"
        >
            <FormNotice type="success" message={success ? "Tạo sản phẩm thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errors} />

            {/* Image Upload Section */}
            <div className={styles.card}>
                <ImageUploadGallery
                    newImages={uploadedImages}
                    onNewImagesChange={setUploadedImages}
                    onFilesSelected={handleFilesSelected}
                    uploading={uploading}
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
                                basePrice={formData.basePrice}
                                currentPrice={formData.currentPrice}
                                minPrice={formData.minPrice}
                                maxPrice={formData.maxPrice}
                                onChange={handlePriceChange}
                                disabled={isDisabled}
                                showMinMax={true}
                            />
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
                        submitText="Tạo sản phẩm"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
