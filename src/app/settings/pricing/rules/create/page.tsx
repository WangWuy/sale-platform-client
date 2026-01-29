'use client';

import { DollarSign } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { pricingService } from '@/services/pricing.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useEntityForm } from '@/hooks/useEntityForm';
import { pricingRuleSchema } from '@/schemas/pricing.validation';
import {
    PricingCondition,
    productTypeOptions,
    pricingConditionOptions,
    materialModifierOptions,
} from '@/constants/pricing.constants';
import styles from './create.module.scss';

export default function CreatePricingRulePage() {
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
            await pricingService.createPricingRule(data);
        },
        redirectUrl: '/settings/pricing'
    });

    const { register, control, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Quy Tắc Giá"
            subtitle="Thêm quy tắc định giá mới vào hệ thống"
            icon={DollarSign}
            backUrl="/settings/pricing"
        >
            <FormNotice type="success" message={success ? "Tạo quy tắc thành công! Đang chuyển hướng..." : undefined} />
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
                            helpText="Mỗi X cm sẽ tính thêm phụ phí"
                            error={formErrors.incrementUnit?.message}
                        >
                            <input
                                {...register('incrementUnit', { valueAsNumber: true })}
                                type="number"
                                min={1}
                                className={styles.input}
                                placeholder="Nhập đơn vị tăng..."
                                disabled={loading || success}
                            />
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
                            label="Áp dụng vật liệu"
                            helpText="Chỉ tính phụ phí cho loại vật liệu cụ thể"
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
                            helpText="Số càng cao càng ưu tiên xử lý trước"
                            error={formErrors.priority?.message}
                        >
                            <input
                                {...register('priority', { valueAsNumber: true })}
                                type="number"
                                min={1}
                                max={100}
                                className={styles.input}
                                placeholder="1"
                                disabled={loading || success}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/settings/pricing"
                        submitText="Tạo quy tắc"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
