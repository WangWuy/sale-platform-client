'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { productTemplateService } from '@/services/product-template.service';
import { categoryService } from '@/services/category.service';
import { materialService, Material } from '@/services/material.service';
import { ProductTemplate, UpdateTemplateRequest, DefaultMaterial } from '@/types/product-template';
import { ProductType, PRODUCT_TYPE_NAMES } from '@/types/pricing';
import { Category } from '@/types/category';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import styles from './edit.module.scss';

export default function EditProductTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const templateId = Number(params.id);

    const [template, setTemplate] = useState<ProductTemplate | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<MultiSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingMaterials, setLoadingMaterials] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<Omit<UpdateTemplateRequest, 'defaultMaterials'>>({
        name: '',
        categoryId: 0,
        productType: ProductType.TABLE,
        basePrice: 0,
        baseSize: '',
        baseSizeValue: 0,
        description: '',
        isActive: true
    });

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templateData, categoriesResponse, materialsData] = await Promise.all([
                    productTemplateService.getTemplateById(templateId),
                    categoryService.getCategories({ limit: 100 }),
                    materialService.getMaterials()
                ]);

                setTemplate(templateData);
                setCategories(categoriesResponse.categories || []);
                setMaterials(materialsData);

                if (templateData) {
                    setFormData({
                        name: templateData.name,
                        categoryId: templateData.categoryId,
                        productType: templateData.productType,
                        basePrice: parseFloat(templateData.basePrice),
                        baseSize: templateData.baseSize,
                        baseSizeValue: templateData.baseSizeValue,
                        description: templateData.description || '',
                        isActive: templateData.isActive
                    });

                    if (templateData.defaultMaterials && templateData.defaultMaterials.length > 0) {
                        setSelectedMaterials(
                            templateData.defaultMaterials.map(m => ({
                                id: m.materialId,
                                name: m.name
                            }))
                        );
                    }
                }
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin mẫu sản phẩm');
                console.error('Fetch template error:', err);
            } finally {
                setLoadingTemplate(false);
                setLoadingCategories(false);
                setLoadingMaterials(false);
            }
        };

        fetchData();
    }, [templateId]);

    const materialOptions: MultiSelectOption[] = materials.map(m => ({
        id: m.id,
        name: m.name
    }));

    const validateForm = (): boolean => {
        const validationErrors: string[] = [];

        if (!formData.name || !formData.name.trim()) {
            validationErrors.push('Tên mẫu không được để trống');
        } else if (formData.name.trim().length < 2) {
            validationErrors.push('Tên mẫu phải có ít nhất 2 ký tự');
        } else if (formData.name.trim().length > 200) {
            validationErrors.push('Tên mẫu không được vượt quá 200 ký tự');
        }

        if (!formData.categoryId || formData.categoryId === 0) {
            validationErrors.push('Vui lòng chọn danh mục');
        }

        if (!formData.basePrice || formData.basePrice <= 0) {
            validationErrors.push('Giá cơ bản phải lớn hơn 0');
        }

        if (!formData.baseSize || !formData.baseSize.trim()) {
            validationErrors.push('Kích thước cơ bản không được để trống');
        }

        if (!formData.baseSizeValue || formData.baseSizeValue <= 0) {
            validationErrors.push('Giá trị kích thước phải lớn hơn 0');
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
            const defaultMaterials: DefaultMaterial[] | undefined = selectedMaterials.length > 0
                ? selectedMaterials.map(m => ({ materialId: m.id, name: m.name }))
                : undefined;

            const payload: UpdateTemplateRequest = {
                name: formData.name?.trim(),
                categoryId: formData.categoryId,
                productType: formData.productType,
                basePrice: formData.basePrice,
                baseSize: formData.baseSize?.trim(),
                baseSizeValue: formData.baseSizeValue,
                description: formData.description?.trim() || undefined,
                isActive: formData.isActive,
                defaultMaterials
            };

            await productTemplateService.updateTemplate(templateId, payload);
            setSuccess(true);

            setTimeout(() => {
                router.push('/product-templates');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Không thể cập nhật mẫu sản phẩm');
            console.error('Update product template error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingTemplate) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <span className={styles.loadingText}>Đang tải thông tin mẫu sản phẩm...</span>
            </div>
        );
    }

    if (!template) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="Không tìm thấy mẫu sản phẩm"
                icon={FileText}
                backUrl="/product-templates"
            >
                <FormNotice type="error" message="Không tìm thấy mẫu sản phẩm" />
            </FormPageLayout>
        );
    }

    return (
        <FormPageLayout
            title="Chỉnh Sửa Mẫu Sản Phẩm"
            subtitle={`Cập nhật thông tin: ${template.name}`}
            icon={FileText}
            backUrl="/product-templates"
        >
            <FormNotice type="success" message={success ? "Cập nhật mẫu sản phẩm thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errors} />

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>

                        <FormField
                            label="Tên mẫu"
                            required
                            helpText="2-200 ký tự"
                        >
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={styles.input}
                                placeholder="Nhập tên mẫu sản phẩm..."
                                disabled={loading || success}
                                maxLength={200}
                            />
                        </FormField>

                        <div className={styles.gridTwo}>
                            <FormField
                                label="Danh mục"
                                required
                            >
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                                    className={styles.input}
                                    disabled={loading || success || loadingCategories}
                                >
                                    <option value={0}>-- Chọn danh mục --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Loại sản phẩm"
                                required
                            >
                                <select
                                    value={formData.productType}
                                    onChange={(e) => handleInputChange('productType', Number(e.target.value) as ProductType)}
                                    className={styles.input}
                                    disabled={loading || success}
                                >
                                    {Object.entries(PRODUCT_TYPE_NAMES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Giá & Kích thước</h3>

                        <FormField
                            label="Giá cơ bản (VNĐ)"
                            required
                        >
                            <CurrencyInput
                                value={formData.basePrice || 0}
                                onChange={(value) => handleInputChange('basePrice', value)}
                                className={styles.input}
                                placeholder="Nhập giá..."
                                disabled={loading || success}
                            />
                        </FormField>

                        <div className={styles.gridTwo}>
                            <FormField
                                label="Kích thước cơ bản"
                                required
                            >
                                <input
                                    type="text"
                                    value={formData.baseSize}
                                    onChange={(e) => handleInputChange('baseSize', e.target.value)}
                                    className={styles.input}
                                    placeholder="VD: 120x60x75 cm"
                                    disabled={loading || success}
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField
                                label="Giá trị kích thước"
                                required
                                helpText="Giá trị số để tính toán (m², m³, etc.)"
                            >
                                <input
                                    type="number"
                                    value={formData.baseSizeValue || ''}
                                    onChange={(e) => handleInputChange('baseSizeValue', e.target.value ? Number(e.target.value) : 0)}
                                    className={styles.input}
                                    placeholder="0"
                                    disabled={loading || success}
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Vật liệu mặc định</h3>
                        <FormField helpText="Các vật liệu sẽ được áp dụng mặc định cho mẫu sản phẩm này">
                            <MultiSelect
                                label="Chọn vật liệu mặc định"
                                options={materialOptions}
                                selectedValues={selectedMaterials}
                                onChange={setSelectedMaterials}
                                placeholder="Chọn vật liệu..."
                                loading={loadingMaterials}
                                disabled={loading || success}
                                searchable={true}
                            />
                        </FormField>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Mô tả</h3>
                        <FormField
                            label="Mô tả chi tiết"
                            helpText="Tối đa 1000 ký tự"
                        >
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className={styles.input}
                                placeholder="Nhập mô tả mẫu sản phẩm..."
                                disabled={loading || success}
                                maxLength={1000}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>
                    </div>

                    <div className={styles.activeBox}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className={styles.checkbox}
                            disabled={loading || success}
                        />
                        <label htmlFor="isActive" className={styles.checkboxLabel}>
                            Mẫu đang hoạt động
                        </label>
                    </div>

                    <FormActions
                        cancelUrl="/product-templates"
                        submitText="Cập nhật mẫu"
                        loading={loading}
                        loadingText="Đang cập nhật..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
