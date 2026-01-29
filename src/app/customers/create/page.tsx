'use client';

import { Users } from 'lucide-react';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { customerSchema } from '@/schemas/validation';
import { CUSTOMER_TYPES } from '@/types/customer';
import { customerService } from '@/services/customer.service';
import styles from './create.module.scss';

export default function CreateCustomerPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: customerSchema,
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            customerType: CUSTOMER_TYPES[0],
            notes: ''
        },
        onSubmit: async (data) => {
            await customerService.createCustomer({
                name: data.name.trim(),
                email: data.email?.trim() || undefined,
                phone: data.phone?.trim() || undefined,
                address: data.address?.trim() || undefined,
                customerType: data.customerType,
                notes: data.notes?.trim() || undefined
            });
        },
        redirectUrl: '/customers'
    });

    const { register, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Thêm Khách Hàng Mới"
            subtitle="Tạo thông tin khách hàng mới trong hệ thống"
            icon={Users}
            backUrl="/customers"
        >
            <FormNotice type="success" message={success ? "Tạo khách hàng thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
                        <div className={styles.gridTwo}>
                            <FormField
                                label="Tên khách hàng"
                                required
                                error={formErrors.name?.message}
                            >
                                <input
                                    {...register('name')}
                                    type="text"
                                    className={styles.input}
                                    placeholder="Nhập tên khách hàng..."
                                    disabled={loading || success}
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField
                                label="Loại khách hàng"
                                error={formErrors.customerType?.message}
                            >
                                <select
                                    {...register('customerType')}
                                    className={styles.select}
                                    disabled={loading || success}
                                >
                                    {CUSTOMER_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
                        <div className={styles.gridTwo}>
                            <FormField
                                label="Email"
                                error={formErrors.email?.message}
                            >
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={styles.input}
                                    placeholder="email@example.com"
                                    disabled={loading || success}
                                />
                            </FormField>

                            <FormField
                                label="Số điện thoại"
                                error={formErrors.phone?.message}
                            >
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className={styles.input}
                                    placeholder="0901234567"
                                    disabled={loading || success}
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Địa chỉ"
                            error={formErrors.address?.message}
                        >
                            <input
                                {...register('address')}
                                type="text"
                                className={styles.input}
                                placeholder="Nhập địa chỉ..."
                                disabled={loading || success}
                                maxLength={500}
                            />
                        </FormField>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Ghi chú</h3>
                        <FormField
                            label="Ghi chú thêm"
                            error={formErrors.notes?.message}
                        >
                            <textarea
                                {...register('notes')}
                                className={styles.input}
                                placeholder="Thêm ghi chú về khách hàng..."
                                rows={4}
                                disabled={loading || success}
                                maxLength={1000}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/customers"
                        submitText="Tạo khách hàng"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
