import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseEntityFormOptions<TSchema extends z.ZodType<any, any>> {
    schema: TSchema;
    defaultValues?: z.infer<TSchema>;
    onSubmit: (data: z.infer<TSchema>) => Promise<void>;
    redirectUrl?: string;
    redirectDelay?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseEntityFormReturn<TSchema extends z.ZodType<any, any>> {
    form: UseFormReturn<z.infer<TSchema>>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
    setError: (error: string | null) => void;
}

/**
 * Generic form hook với react-hook-form + zod validation
 * 
 * @example
 * const { form, onSubmit, loading, error, success } = useEntityForm({
 *   schema: materialSchema,
 *   defaultValues: { name: '', costPerUnit: 0 },
 *   onSubmit: async (data) => {
 *     await materialService.createMaterial(data);
 *   },
 *   redirectUrl: '/materials'
 * });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEntityForm<TSchema extends z.ZodType<any, any>>({
    schema,
    defaultValues,
    onSubmit: onSubmitCallback,
    redirectUrl,
    redirectDelay = 1500
}: UseEntityFormOptions<TSchema>): UseEntityFormReturn<TSchema> {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<TSchema>>({
        // @ts-expect-error - zod/react-hook-form type compatibility issue
        resolver: zodResolver(schema),
        defaultValues,
        mode: 'onBlur'
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        setLoading(true);
        setError(null);

        try {
            // @ts-expect-error - zod inferred type compatibility
            await onSubmitCallback(data);
            setSuccess(true);

            if (redirectUrl) {
                setTimeout(() => {
                    router.push(redirectUrl);
                }, redirectDelay);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.message || 'Đã có lỗi xảy ra');
            console.error('Form submit error:', err);
        } finally {
            setLoading(false);
        }
    });

    return {
        // @ts-expect-error - UseFormReturn type compatibility
        form,
        onSubmit: handleSubmit,
        loading,
        error,
        success,
        setError
    };
}
