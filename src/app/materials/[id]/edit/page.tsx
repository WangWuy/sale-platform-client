'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layers, Loader2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { SupplierSelect } from '@/components/selects/SupplierSelect';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { useMaterial, useUpdateMaterial } from '@/hooks/useMaterials';
import { materialSchema } from '@/schemas/validation';
import { materialGroupOptions, materialTierOptions, materialUnitOptions } from '@/constants/material.constants';
import styles from './edit.module.scss';

export default function EditMaterialPage() {
    const params = useParams();
    const materialId = parseInt(params.id as string);

    // Fetch material data with TanStack Query
    const { data: material, isLoading: fetchLoading, error: fetchError } = useMaterial(materialId);

    // Update mutation
    const updateMutation = useUpdateMaterial();

    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: materialSchema,
        defaultValues: {
            name: material?.name || '',
            supplierId: material?.supplierId || null,
            materialGroup: material?.materialGroup || 2,
            tier: material?.tier || 2,
            costPerUnit: material?.costPerUnit || 0,
            unit: material?.unit || 'piece',
            description: material?.description || ''
        },
        onSubmit: async (data) => {
            await updateMutation.mutateAsync({ id: materialId, data });
        },
        redirectUrl: `/materials/${materialId}`
    });

    const { register, control, formState: { errors: formErrors }, reset } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    // Update form when material data loads
    useEffect(() => {
        if (material) {
            reset({
                name: material.name,
                supplierId: material.supplierId || null,
                materialGroup: material.materialGroup,
                tier: material.tier,
                costPerUnit: material.costPerUnit,
                unit: material.unit,
                description: material.description || ''
            });
        }
    }, [material, reset]);

    if (isNaN(materialId)) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="ID không hợp lệ"
                icon={Layers}
                backUrl="/materials"
            >
                <FormNotice type="error" message="ID vật liệu không hợp lệ" />
            </FormPageLayout>
        );
    }

    if (fetchLoading) {
        return (
            <FormPageLayout
                title="Đang tải..."
                subtitle="Vui lòng đợi"
                icon={Layers}
                backUrl="/materials"
            >
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} />
                    <p>Đang tải thông tin vật liệu...</p>
                </div>
            </FormPageLayout>
        );
    }

    if (fetchError) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="Không thể tải dữ liệu"
                icon={Layers}
                backUrl="/materials"
            >
                <FormNotice type="error" message={`Lỗi: ${fetchError.message}`} />
            </FormPageLayout>
        );
    }

    return (
        <FormPageLayout
            title="Chỉnh Sửa Vật Liệu"
            subtitle="Cập nhật thông tin vật liệu"
            icon={Layers}
            backUrl="/materials"
        >
            <FormNotice type="success" message={success ? "Cập nhật vật liệu thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin vật liệu</h3>

                        <FormField
                            label="Tên vật liệu"
                            required
                            helpText="2-100 ký tự"
                            error={formErrors.name?.message}
                        >
                            <input
                                {...register('name')}
                                type="text"
                                className={styles.input}
                                placeholder="Nhập tên vật liệu..."
                                disabled={loading || success}
                                maxLength={100}
                            />
                        </FormField>

                        <FormField
                            label="Nhóm vật liệu"
                            required
                            error={formErrors.materialGroup?.message}
                        >
                            <select
                                {...register('materialGroup', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                {materialGroupOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Phân khúc"
                            required
                            error={formErrors.tier?.message}
                        >
                            <select
                                {...register('tier', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                {materialTierOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Giá mỗi đơn vị"
                            required
                            helpText="Đơn vị: VND"
                            error={formErrors.costPerUnit?.message}
                        >
                            <Controller
                                name="costPerUnit"
                                control={control}
                                render={({ field }) => (
                                    <CurrencyInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={styles.input}
                                        disabled={loading || success}
                                        placeholder="Nhập giá..."
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Đơn vị tính"
                            required
                            error={formErrors.unit?.message}
                        >
                            <select
                                {...register('unit')}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                {materialUnitOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <Controller
                            name="supplierId"
                            control={control}
                            render={({ field }) => (
                                <SupplierSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={loading || success}
                                    required={false}
                                    label="Nhà cung cấp"
                                    placeholder="Chọn nhà cung cấp"
                                    error={formErrors.supplierId?.message}
                                    allowNull={true}
                                />
                            )}
                        />

                        <FormField
                            label="Mô tả"
                            helpText="Tối đa 1000 ký tự"
                            error={formErrors.description?.message}
                        >
                            <textarea
                                {...register('description')}
                                rows={4}
                                className={styles.input}
                                placeholder="Nhập mô tả vật liệu..."
                                disabled={loading || success}
                                maxLength={1000}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/materials"
                        submitText="Lưu thay đổi"
                        loading={loading}
                        loadingText="Đang lưu..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
