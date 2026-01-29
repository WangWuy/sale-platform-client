'use client';

import { FolderTree } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { categorySchema } from '@/schemas/validation';
import styles from './create.module.scss';

export default function CreateCategoryPage() {
    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: categorySchema,
        defaultValues: {
            name: '',
            description: ''
        },
        onSubmit: async (data) => {
            await categoryService.createCategory({
                name: data.name.trim(),
                description: data.description?.trim() || undefined
            });
        },
        redirectUrl: '/categories'
    });

    const { register, formState: { errors: formErrors } } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    return (
        <FormPageLayout
            title="Tạo Danh Mục Mới"
            subtitle="Thêm danh mục mới vào hệ thống"
            icon={FolderTree}
            backUrl="/categories"
        >
            <FormNotice type="success" message={success ? "Tạo danh mục thành công! Đang chuyển hướng..." : undefined} />
            <FormNotice type="error" message={error || undefined} />
            <FormNotice type="warning" errors={errorMessages} />

            <div className={styles.card}>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div>
                        <h3 className={styles.sectionTitle}>Thông tin danh mục</h3>

                        <FormField
                            label="Tên danh mục"
                            required
                            helpText="2-50 ký tự"
                            error={formErrors.name?.message}
                        >
                            <input
                                {...register('name')}
                                type="text"
                                className={styles.input}
                                placeholder="Nhập tên danh mục..."
                                disabled={loading || success}
                                maxLength={50}
                            />
                        </FormField>

                        <FormField
                            label="Mô tả"
                            helpText="Tối đa 500 ký tự"
                            error={formErrors.description?.message}
                        >
                            <textarea
                                {...register('description')}
                                rows={4}
                                className={styles.input}
                                placeholder="Nhập mô tả danh mục..."
                                disabled={loading || success}
                                maxLength={500}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>
                    </div>

                    <FormActions
                        cancelUrl="/categories"
                        submitText="Tạo danh mục"
                        loading={loading}
                        loadingText="Đang tạo..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
