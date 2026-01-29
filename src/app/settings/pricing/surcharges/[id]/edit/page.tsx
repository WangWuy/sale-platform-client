'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layers } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { MaterialSelect } from '@/components/selects/MaterialSelect';
import { useEntityForm } from '@/hooks/useEntityForm';
import { materialSurchargeSchema } from '@/schemas/pricing.validation';
import { useMaterialSurchargeById } from '@/hooks/usePricing';
import {
    SurchargeScope,
    productTypeOptions,
    surchargeScopeOptions,
} from '@/constants/pricing.constants';
import styles from './edit.module.scss';

export default function EditMaterialSurchargePage() {
    const { id } = useParams();
    const surchargeId = Number(id);
    const { data: surcharge, isLoading: fetchLoading } = useMaterialSurchargeById(surchargeId);

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
            await pricingService.updateMaterialSurcharge(surchargeId, data);
        },
        redirectUrl: '/settings/pricing?tab=surcharges'
    });

    const { register, control, reset, formState: { errors: formErrors } } = form;

    useEffect(() => {
        if (surcharge) {
            reset({
                sourceMaterialId: surcharge.sourceMaterialId,
                targetMaterialId: surcharge.targetMaterialId,
                scope: surcharge.scope,
                surchargeAmount: surcharge.surchargeAmount,
                productType: surcharge.productType,
            });
        }
    }, [surcharge, reset]);

    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    if (fetchLoading) {
        return (
            <FormPageLayout
                title="Chỉnh sửa Phụ Phí"
                subtitle="Đang tải dữ liệu..."
                icon={Layers}
                backUrl="/settings/pricing"
            >
                <div className={styles.card}><p>Đang tải...</p></div>
            </FormPageLayout>
        );
    }

    return (
        <FormPageLayout
            title="Chỉnh sửa Phụ Phí Vật Liệu"
            subtitle={`Cập nhật phụ phí #${surchargeId}`}
            icon={Layers}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Cập nhật thành công!" : undefined} />
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
                                    error={formErrors.targetMaterialId?.message}
                                />
                            )}
                        />

                        <FormField label="Phạm vi" required error={formErrors.scope?.message}>
                            <select {...register('scope', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                {surchargeScopeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Phụ phí" required error={formErrors.surchargeAmount?.message}>
                            <Controller name="surchargeAmount" control={control} render={({ field }) => (
                                <CurrencyInput value={field.value} onChange={field.onChange} className={styles.input} disabled={loading || success} />
                            )} />
                        </FormField>

                        <FormField label="Loại sản phẩm" error={formErrors.productType?.message}>
                            <select {...register('productType', { valueAsNumber: true })} className={styles.input} disabled={loading || success}>
                                <option value="">Tất cả</option>
                                {productTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormActions cancelUrl="/settings/pricing" submitText="Cập nhật" loading={loading} loadingText="Đang cập nhật..." disabled={success} />
                </form>
            </div>
        </FormPageLayout>
    );
}
