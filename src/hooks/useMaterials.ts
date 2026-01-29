import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService, CreateMaterialRequest, UpdateMaterialRequest } from '@/services/material.service';

// Query keys
export const materialKeys = {
    all: ['materials'] as const,
    lists: () => [...materialKeys.all, 'list'] as const,
    list: (filters: string) => [...materialKeys.lists(), { filters }] as const,
    details: () => [...materialKeys.all, 'detail'] as const,
    detail: (id: number) => [...materialKeys.details(), id] as const,
    stats: () => [...materialKeys.all, 'stats'] as const
};

// Fetch all materials
export function useMaterials(page = 1, limit = 10, search = '') {
    return useQuery({
        queryKey: materialKeys.list(`page=${page}&limit=${limit}&search=${search}`),
        queryFn: async () => {
            const materials = await materialService.getMaterials();
            return materials;
        }
    });
}

// Fetch single material
export function useMaterial(id: number) {
    return useQuery({
        queryKey: materialKeys.detail(id),
        queryFn: () => materialService.getMaterialById(id),
        enabled: !!id && !isNaN(id)
    });
}

// Fetch material stats - TODO: Implement when API is ready
// export function useMaterialStats() {
//     return useQuery({
//         queryKey: materialKeys.stats(),
//         queryFn: () => materialService.getMaterialStatistics()
//     });
// }

// Create material mutation
export function useCreateMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMaterialRequest) => materialService.createMaterial(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
        }
    });
}

// Update material mutation
export function useUpdateMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMaterialRequest }) =>
            materialService.updateMaterial(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
        }
    });
}

// Delete material mutation
export function useDeleteMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialService.deleteMaterial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
        }
    });
}
