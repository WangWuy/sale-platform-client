'use client';

import { Layers } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { materialService } from '@/services/material.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { SupplierSelect } from '@/components/selects/SupplierSelect';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { materialSchema } from '@/schemas/validation';
import { materialGroupOptions, materialTierOptions, materialUnitOptions, MaterialGroup, MaterialTier, MaterialUnit } from '@/constants/material.constants';
import styles from './create.module.scss';

export default function CreateMaterialPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: materialSchema,
        defaultValues: {
            name: '',
            supplierId: null,
            materialGroup: MaterialGroup.STRUCTURE,
            tier: MaterialTier.STANDARD,
            costPerUnit: 0,
            unit: MaterialUnit.PIECE,
            description: ''
        },
        onSubmit: async (data) => {
            await materialService.createMaterial(data);
        },
        redirectUrl: '/materials'
    });

    const { register, control, formState: { errors: formErrors } } = form;

    // Convert form errors to array for FormNotice
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Vật Liệu Mới"
            subtitle="Thêm vật liệu mới vào hệ thống"
            icon={Layers}
            backUrl="/materials"
        >
            <FormNotice type="success" message={success ? "Tạo vật liệu thành công! Đang chuyển hướng..." : undefined} />
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
                        submitText="Tạo vật liệu"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
