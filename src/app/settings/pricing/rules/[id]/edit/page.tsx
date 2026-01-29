'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { pricingRuleSchema } from '@/schemas/pricing.validation';
import { usePricingRuleById } from '@/hooks/usePricing';
import {
    PricingCondition,
    productTypeOptions,
    pricingConditionOptions,
    materialModifierOptions,
} from '@/constants/pricing.constants';
import styles from './edit.module.scss';

export default function EditPricingRulePage() {
    const { id } = useParams();
    const ruleId = Number(id);
    const { data: rule, isLoading: fetchLoading } = usePricingRuleById(ruleId);

    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: pricingRuleSchema,
        defaultValues: {
            templateId: null,
            productType: null,
            condition: PricingCondition.SIZE_INCREMENT,
            incrementUnit: 5,
            surchargeAmount: 0,
            materialModifier: null,
            priority: 1,
        },
        onSubmit: async (data) => {
            await pricingService.updatePricingRule(ruleId, data);
        },
        redirectUrl: '/settings/pricing'
    });

    const { register, control, reset, formState: { errors: formErrors } } = form;

    // Pre-fill form when data loads
    useEffect(() => {
        if (rule) {
            reset({
                templateId: rule.templateId,
                productType: rule.productType,
                condition: rule.condition,
                incrementUnit: rule.incrementUnit,
                surchargeAmount: rule.surchargeAmount,
                materialModifier: rule.materialModifier,
                priority: rule.priority,
            });
        }
    }, [rule, reset]);

    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    if (fetchLoading) {
        return (
            <FormPageLayout
                title="Chỉnh sửa Quy Tắc Giá"
                subtitle="Đang tải dữ liệu..."
                icon={DollarSign}
                backUrl="/settings/pricing"
            >
                <div className={styles.card}>
                    <p>Đang tải...</p>
                </div>
            </FormPageLayout>
        );
    }

    return (
        <FormPageLayout
            title="Chỉnh sửa Quy Tắc Giá"
            subtitle={`Cập nhật quy tắc #${ruleId}`}
            icon={DollarSign}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Cập nhật thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin quy tắc giá</h3>

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

                        <FormField
                            label="Điều kiện áp dụng"
                            required
                            error={formErrors.condition?.message}
                        >
                            <select
                                {...register('condition', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                {pricingConditionOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Đơn vị tăng (cm)"
                            required
                            error={formErrors.incrementUnit?.message}
                        >
                            <input
                                {...register('incrementUnit', { valueAsNumber: true })}
                                type="number"
                                min={1}
                                className={styles.input}
                                disabled={loading || success}
                            />
                        </FormField>

                        <FormField
                            label="Số tiền phụ phí"
                            required
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
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Áp dụng vật liệu"
                            error={formErrors.materialModifier?.message}
                        >
                            <select
                                {...register('materialModifier', { valueAsNumber: true })}
                                className={styles.input}
                                disabled={loading || success}
                            >
                                <option value="">Không áp dụng</option>
                                {materialModifierOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Độ ưu tiên"
                            required
                            error={formErrors.priority?.message}
                        >
                            <input
                                {...register('priority', { valueAsNumber: true })}
                                type="number"
                                min={1}
                                max={100}
                                className={styles.input}
                                disabled={loading || success}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/settings/pricing"
                        submitText="Cập nhật"
                        loading={loading}
                        loadingText="Đang cập nhật..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
