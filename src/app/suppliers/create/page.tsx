'use client';

import { Truck } from 'lucide-react';
import { supplierService } from '@/services/supplier.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { supplierSchema } from '@/schemas/validation';
import styles from './create.module.scss';

export default function CreateSupplierPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: supplierSchema,
        defaultValues: {
            name: '',
            contact: '',
            address: '',
            phone: '',
            email: ''
        },
        onSubmit: async (data) => {
            await supplierService.createSupplier({
                name: data.name.trim(),
                contact: data.contact?.trim() || undefined,
                address: data.address?.trim() || undefined,
                phone: data.phone?.trim() || undefined,
                email: data.email?.trim() || undefined
            });
        },
        redirectUrl: '/suppliers'
    });

    const { register, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Nhà Cung Cấp Mới"
            subtitle="Thêm nhà cung cấp mới vào hệ thống"
            icon={Truck}
            backUrl="/suppliers"
        >
            <FormNotice type="success" message={success ? "Tạo nhà cung cấp thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin nhà cung cấp</h3>

                        <FormField
                            label="Tên nhà cung cấp"
                            required
                            helpText="2-100 ký tự"
                            error={formErrors.name?.message}
                        >
                            <input
                                {...register('name')}
                                type="text"
                                className={styles.input}
                                placeholder="Nhập tên nhà cung cấp..."
                                disabled={loading || success}
                                maxLength={100}
                            />
                        </FormField>

                        <FormField
                            label="Người liên hệ"
                            helpText="Tối đa 100 ký tự"
                            error={formErrors.contact?.message}
                        >
                            <input
                                {...register('contact')}
                                type="text"
                                className={styles.input}
                                placeholder="Nhập tên người liên hệ..."
                                disabled={loading || success}
                                maxLength={100}
                            />
                        </FormField>

                        <FormField
                            label="Địa chỉ"
                            helpText="Tối đa 500 ký tự"
                            error={formErrors.address?.message}
                        >
                            <textarea
                                {...register('address')}
                                rows={3}
                                className={styles.input}
                                placeholder="Nhập địa chỉ..."
                                disabled={loading || success}
                                maxLength={500}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>

                        <FormField
                            label="Số điện thoại"
                            helpText="Ít nhất 8 ký tự"
                            error={formErrors.phone?.message}
                        >
                            <input
                                {...register('phone')}
                                type="tel"
                                className={styles.input}
                                placeholder="Nhập số điện thoại..."
                                disabled={loading || success}
                            />
                        </FormField>

                        <FormField
                            label="Email"
                            helpText="Địa chỉ email hợp lệ"
                            error={formErrors.email?.message}
                        >
                            <input
                                {...register('email')}
                                type="email"
                                className={styles.input}
                                placeholder="Nhập email..."
                                disabled={loading || success}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/suppliers"
                        submitText="Tạo nhà cung cấp"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
