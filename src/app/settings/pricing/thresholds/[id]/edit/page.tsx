'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Ruler } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { sizeThresholdSchema } from '@/schemas/pricing.validation';
import { useSizeThresholdById } from '@/hooks/usePricing';
import { ProductType, DimensionType, ThresholdAction, productTypeOptions, dimensionTypeOptions, thresholdActionOptions } from '@/constants/pricing.constants';
import styles from './edit.module.scss';

export default function EditSizeThresholdPage() {
    const { id } = useParams();
    const thresholdId = Number(id);
    const { data: threshold, isLoading: fetchLoading } = useSizeThresholdById(thresholdId);

    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: sizeThresholdSchema,
        defaultValues: {
            productType: ProductType.CHAIR, dimensionType: DimensionType.WIDTH, thresholdValue: 100, action: ThresholdAction.WARNING, surchargeAmount: null, message: '',
        },
        onSubmit: async (data) => { await pricingService.updateSizeThreshold(thresholdId, data); },
        redirectUrl: '/settings/pricing?tab=thresholds'
    });

    const { register, control, reset, watch, formState: { errors: formErrors } } = form;
    const action = watch('action');

    useEffect(() => {
        if (threshold) {
            reset({ productType: threshold.productType, dimensionType: threshold.dimensionType, thresholdValue: threshold.thresholdValue, action: threshold.action, surchargeAmount: threshold.surchargeAmount, message: threshold.message || '' });
        }
    }, [threshold, reset]);

    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    if (fetchLoading) {
        return <FormPageLayout title="Chỉnh sửa Ngưỡng" subtitle="Đang tải..." icon={Ruler} backUrl="/settings/pricing"><div className={styles.card}><p>Đang tải...</p></div></FormPageLayout>;
    }

    return (
        <FormPageLayout title="Chỉnh sửa Ngưỡng Kích Thước" subtitle={`Cập nhật ngưỡng #${thresholdId}`} icon={Ruler} backUrl="/settings/pricing">
            <FormNotice type="success" message={success ? "Cập nhật thành công!" : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin ngưỡng</h3>

                        <FormField label="Loại sản phẩm" required>
                            <select {...register('productType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {productTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Loại chiều" required>
                            <select {...register('dimensionType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {dimensionTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Ngưỡng (cm)" required>
                            <input {...register('thresholdValue', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="Hành động" required>
                            <select {...register('action', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {thresholdActionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        {action === ThresholdAction.AUTO_SURCHARGE && (
                            <FormField label="Phụ phí">
                                <Controller name="surchargeAmount" control={control} render={({ field }) => (
                                    <CurrencyInput value={field.value || 0} onChange={field.onChange} className={styles.input} disabled={loading || success} />
                                )} />
                            </FormField>
                        )}

                        <FormField label="Thông báo">
                            <textarea {...register('message')} rows={3} className={styles.input} disabled={loading || success} />
                        </FormField>
                    </div>

                    <FormActions cancelUrl="/settings/pricing" submitText="Cập nhật" loading={loading} loadingText="Đang cập nhật..." disabled={success} />
                </form>
            </div>
        </FormPageLayout>
    );
}
