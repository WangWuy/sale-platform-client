'use client';

import { Ruler } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { sizeThresholdSchema } from '@/schemas/pricing.validation';
import {
    ProductType,
    DimensionType,
    ThresholdAction,
    productTypeOptions,
    dimensionTypeOptions,
    thresholdActionOptions,
} from '@/constants/pricing.constants';
import styles from './create.module.scss';

export default function CreateSizeThresholdPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: sizeThresholdSchema,
        defaultValues: {
            productType: ProductType.CHAIR,
            dimensionType: DimensionType.WIDTH,
            thresholdValue: 100,
            action: ThresholdAction.WARNING,
            surchargeAmount: null,
            message: '',
        },
        onSubmit: async (data) => {
            await pricingService.createSizeThreshold(data);
        },
        redirectUrl: '/settings/pricing?tab=thresholds'
    });

    const { register, control, watch, formState: { errors: formErrors } } = form;
    const action = watch('action');
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Ngưỡng Kích Thước"
            subtitle="Cấu hình cảnh báo và phụ phí khi vượt ngưỡng kích thước"
            icon={Ruler}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Tạo ngưỡng thành công!" : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin ngưỡng kích thước</h3>

                        <FormField label="Loại sản phẩm" required error={formErrors.productType?.message}>
                            <select {...register('productType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {productTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Loại chiều" required error={formErrors.dimensionType?.message}>
                            <select {...register('dimensionType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {dimensionTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Ngưỡng (cm)" required error={formErrors.thresholdValue?.message}>
                            <input {...register('thresholdValue', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="Hành động khi vượt ngưỡng" required error={formErrors.action?.message}>
                            <select {...register('action', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {thresholdActionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        {action === ThresholdAction.AUTO_SURCHARGE && (
                            <FormField label="Phụ phí" helpText="Số tiền tự động cộng thêm">
                                <Controller name="surchargeAmount" control={control} render={({ field }) => (
                                    <CurrencyInput value={field.value || 0} onChange={field.onChange} className={styles.input} disabled={loading || success} />
                                )} />
                            </FormField>
                        )}

                        <FormField label="Thông báo" helpText="Nội dung hiển thị cho khách hàng">
                            <textarea {...register('message')} rows={3} className={styles.input} disabled={loading || success} placeholder="Nhập thông báo..." />
                        </FormField>
                    </div>

                    <FormActions cancelUrl="/settings/pricing" submitText="Tạo ngưỡng" loading={loading} loadingText="Đang tạo..." disabled={success} />
                </form>
            </div>
        </FormPageLayout>
    );
}
