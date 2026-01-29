'use client';

import { Layers } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { MaterialSelect } from '@/components/selects/MaterialSelect';
import { useEntityForm } from '@/hooks/useEntityForm';
import { materialSurchargeSchema } from '@/schemas/pricing.validation';
import {
    SurchargeScope,
    productTypeOptions,
    surchargeScopeOptions,
} from '@/constants/pricing.constants';
import styles from './create.module.scss';

export default function CreateMaterialSurchargePage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: materialSurchargeSchema,
        defaultValues: {
            sourceMaterialId: 0,
            targetMaterialId: 0,
            scope: SurchargeScope.FULL,
            surchargeAmount: 0,
            productType: null,
        },
        onSubmit: async (data) => {
            await pricingService.createMaterialSurcharge(data);
        },
        redirectUrl: '/settings/pricing?tab=surcharges'
    });

    const { register, control, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Phụ Phí Vật Liệu"
            subtitle="Cấu hình phụ phí khi đổi vật liệu"
            icon={Layers}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Tạo phụ phí thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin phụ phí vật liệu</h3>

                        <Controller
                            name="sourceMaterialId"
                            control={control}
                            render={({ field }) => (
                                <MaterialSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={loading || success}
                                    required
                                    label="Vật liệu nguồn"
                                    placeholder="Chọn vật liệu nguồn"
                                    error={formErrors.sourceMaterialId?.message}
                                />
                            )}
                        />

                        <Controller
                            name="targetMaterialId"
                            control={control}
                            render={({ field }) => (
                                <MaterialSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={loading || success}
                                    required
                                    label="Vật liệu đích"
                                    placeholder="Chọn vật liệu đích"
                                    error={formErrors.targetMaterialId?.message}
                                />
                            )}
                        />

                        <FormField
                            label="Phạm vi áp dụng"
                            required
                            error={formErrors.scope?.message}
                        >
                            <select
                                {...register('scope', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                {surchargeScopeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Số tiền phụ phí"
                            required
                            helpText="Đơn vị: VND"
                            error={formErrors.surchargeAmount?.message}
                        >
                            <Controller
                                name="surchargeAmount"
                                control={control}
                                render={({ field }) => (
                                    <CurrencyInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={styles.input}
                                        disabled={loading || success}
                                        placeholder="Nhập số tiền phụ phí..."
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Loại sản phẩm"
                            helpText="Để trống nếu áp dụng cho tất cả"
                            error={formErrors.productType?.message}
                        >
                            <select
                                {...register('productType', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                <option value="">Tất cả loại sản phẩm</option>
                                {productTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/settings/pricing"
                        submitText="Tạo phụ phí"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
