import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import authService from '@/services/auth.service';

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Email hoặc số điện thoại là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginLogic() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formMethods = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login({
                identifier: data.identifier,
                password: data.password,
            });

            if (result) {
                // Đăng nhập thành công, redirect về trang chủ dashboard
                router.push('/dashboard');
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        router,
        showPassword,
        setShowPassword,
        isLoading,
        error,
        formMethods,
        onSubmit: formMethods.handleSubmit(onSubmit),
    };
}
