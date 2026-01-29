'use client';

import { useParams } from 'next/navigation';
import { FolderTree, Loader2 } from 'lucide-react';
import { FormPageLayout, FormNotice, FormField, FormActions } from '@/components/ui/form-components';
import { useEntityForm } from '@/hooks/useEntityForm';
import { useCategoryQuery, useUpdateCategoryMutation } from '@/hooks/useCategoryQueries';
import { categorySchema } from '@/schemas/validation';
import styles from './edit.module.scss';

export default function EditCategoryPage() {
    const params = useParams();
    const categoryId = parseInt(params.id as string);

    // Fetch category data with TanStack Query
    const { data: category, isLoading: fetchLoading, error: fetchError } = useCategoryQuery(categoryId);

    // Update mutation
    const updateMutation = useUpdateCategoryMutation();

    const { form, onSubmit, loading, error, success } = useEntityForm({
        schema: categorySchema,
        defaultValues: {
            name: category?.name || '',
            description: category?.description || ''
        },
        onSubmit: async (data) => {
            await updateMutation.mutateAsync({
                id: categoryId,
                data: {
                    name: data.name.trim(),
                    description: data.description?.trim() || undefined
                }
            });
        },
        redirectUrl: `/categories/${categoryId}`
    });

    const { register, formState: { errors: formErrors }, reset } = form;
    const errorMessages = Object.values(formErrors).map(err => err.message).filter(Boolean) as string[];

    // Update form when category data loads
    if (category && !form.formState.isDirty) {
        reset({
            name: category.name,
            description: category.description || ''
        });
    }

    if (isNaN(categoryId)) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="ID không hợp lệ"
                icon={FolderTree}
                backUrl="/categories"
            >
                <FormNotice type="error" message="ID danh mục không hợp lệ" />
            </FormPageLayout>
        );
    }

    if (fetchLoading) {
        return (
            <FormPageLayout
                title="Đang tải..."
                subtitle="Vui lòng đợi"
                icon={FolderTree}
                backUrl="/categories"
            >
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} />
                    <p>Đang tải thông tin danh mục...</p>
                </div>
            </FormPageLayout>
        );
    }

    if (fetchError) {
        return (
            <FormPageLayout
                title="Lỗi"
                subtitle="Không thể tải dữ liệu"
                icon={FolderTree}
                backUrl="/categories"
            >
                <FormNotice type="error" message={`Lỗi: ${fetchError.message}`} />
            </FormPageLayout>
        );
    }

    return (
        <FormPageLayout
            title="Chỉnh Sửa Danh Mục"
            subtitle="Cập nhật thông tin danh mục"
            icon={FolderTree}
            backUrl="/categories"
        >
            <FormNotice type="success" message={success ? "Cập nhật danh mục thành công! Đang chuyển hướng..." : undefined} />
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
                        submitText="Lưu thay đổi"
                        loading={loading}
                        loadingText="Đang lưu..."
                        disabled={success}
                    />
                </form>
            </div>
        </FormPageLayout>
    );
}
