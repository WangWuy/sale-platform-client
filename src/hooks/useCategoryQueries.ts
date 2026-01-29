import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

// Query keys
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...categoryKeys.details(), id] as const,
    stats: () => [...categoryKeys.all, 'stats'] as const
};

// Fetch all categories
export function useCategoriesQuery(page = 1, limit = 10, search = '') {
    return useQuery({
        queryKey: categoryKeys.list(`page=${page}&limit=${limit}&search=${search}`),
        queryFn: () => categoryService.getCategories({ page, limit, search })
    });
}

// Fetch single category
export function useCategoryQuery(id: number) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => categoryService.getCategoryById(id),
        enabled: !!id && !isNaN(id)
    });
}

// Fetch category stats - Uncomment when getCategoryStatistics is added to categoryService
// export function useCategoryStatsQuery() {
//     return useQuery({
//         queryKey: categoryKeys.stats(),
//         queryFn: () => categoryService.getCategoryStatistics()
//     });
// }

// Create category mutation
export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
        }
    });
}

// Update category mutation
export function useUpdateCategoryMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
            categoryService.updateCategory(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
        }
    });
}

// Delete category mutation
export function useDeleteCategoryMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
        }
    });
}
