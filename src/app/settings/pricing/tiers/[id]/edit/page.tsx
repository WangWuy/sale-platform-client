'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { quantityTierSchema } from '@/schemas/pricing.validation';
import { useQuantityTierById } from '@/hooks/usePricing';
import { PriceLevel, productTypeOptions, priceLevelOptions } from '@/constants/pricing.constants';
import styles from './edit.module.scss';

export default function EditQuantityTierPage() {
    const { id } = useParams();
    const tierId = Number(id);
    const { data: tier, isLoading: fetchLoading } = useQuantityTierById(tierId);

    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: quantityTierSchema,
        defaultValues: {
            templateId: null, productType: null, minQuantity: 1, maxQuantity: null, discountPercent: 0, priceLevel: PriceLevel.RETAIL,
        },
        onSubmit: async (data) => { await pricingService.updateQuantityTier(tierId, data); },
        redirectUrl: '/settings/pricing?tab=tiers'
    });

    const { register, reset, formState: { errors: formErrors } } = form;

    useEffect(() => {
        if (tier) {
            reset({ templateId: tier.templateId, productType: tier.productType, minQuantity: tier.minQuantity, maxQuantity: tier.maxQuantity, discountPercent: tier.discountPercent, priceLevel: tier.priceLevel });
        }
    }, [tier, reset]);

    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    if (fetchLoading) {
        return <FormPageLayout title="Chỉnh sửa Bậc Số Lượng" subtitle="Đang tải..." icon={Package} backUrl="/settings/pricing"><div className={styles.card}><p>Đang tải...</p></div></FormPageLayout>;
    }

    return (
        <FormPageLayout title="Chỉnh sửa Bậc Số Lượng" subtitle={`Cập nhật bậc #${tierId}`} icon={Package} backUrl="/settings/pricing">
            <FormNotice type="success" message={success ? "Cập nhật thành công!" : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin bậc số lượng</h3>

                        <FormField label="Loại sản phẩm">
                            <select {...register('productType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                <option value="">Tất cả</option>
                                {productTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="SL tối thiểu" required error={formErrors.minQuantity?.message}>
                            <input {...register('minQuantity', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="SL tối đa">
                            <input {...register('maxQuantity', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="% Giảm giá" required error={formErrors.discountPercent?.message}>
                            <input {...register('discountPercent', { valueAsNumber: true })} type="number" min={0} max={100} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="Mức giá" required error={formErrors.priceLevel?.message}>
                            <select {...register('priceLevel', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {priceLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormActions cancelUrl="/settings/pricing" submitText="Cập nhật" loading={loading} loadingText="Đang cập nhật..." disabled={success} />
                </form>
            </div>
        </FormPageLayout>
    );
}
