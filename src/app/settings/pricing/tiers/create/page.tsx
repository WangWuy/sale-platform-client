'use client';

import { Package } from 'lucide-react';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { quantityTierSchema } from '@/schemas/pricing.validation';
import { PriceLevel, productTypeOptions, priceLevelOptions } from '@/constants/pricing.constants';
import styles from './create.module.scss';

export default function CreateQuantityTierPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: quantityTierSchema,
        defaultValues: {
            templateId: null,
            productType: null,
            minQuantity: 1,
            maxQuantity: null,
            discountPercent: 0,
            priceLevel: PriceLevel.RETAIL,
        },
        onSubmit: async (data) => {
            await pricingService.createQuantityTier(data);
        },
        redirectUrl: '/settings/pricing?tab=tiers'
    });

    const { register, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Bậc Số Lượng"
            subtitle="Cấu hình chiết khấu theo số lượng đặt hàng"
            icon={Package}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Tạo bậc số lượng thành công!" : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin bậc số lượng</h3>

                        <FormField label="Loại sản phẩm" helpText="Để trống nếu áp dụng cho tất cả">
                            <select {...register('productType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                <option value="">Tất cả loại sản phẩm</option>
                                {productTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Số lượng tối thiểu" required error={formErrors.minQuantity?.message}>
                            <input {...register('minQuantity', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="Số lượng tối đa" helpText="Để trống nếu không giới hạn">
                            <input {...register('maxQuantity', { valueAsNumber: true })} type="number" min={1} className={styles.input} disabled={loading || success} placeholder="Không giới hạn" />
                        </FormField>

                        <FormField label="% Giảm giá" required error={formErrors.discountPercent?.message}>
                            <input {...register('discountPercent', { valueAsNumber: true })} type="number" min={0} max={100} step={0.1} className={styles.input} disabled={loading || success} />
                        </FormField>

                        <FormField label="Mức giá" required error={formErrors.priceLevel?.message}>
                            <select {...register('priceLevel', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {priceLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormActions cancelUrl="/settings/pricing" submitText="Tạo bậc số lượng" loading={loading} loadingText="Đang tạo..." disabled={success} />
                </form>
            </div>
        </FormPageLayout>
    );
}
