'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService } from '@/services/pricing.service';
import type {
    PricingRule,
    CreatePricingRuleRequest,
    UpdatePricingRuleRequest,
    MaterialSurcharge,
    CreateMaterialSurchargeRequest,
    UpdateMaterialSurchargeRequest,
    QuantityTier,
    CreateQuantityTierRequest,
    UpdateQuantityTierRequest,
    SizeThreshold,
    CreateSizeThresholdRequest,
    UpdateSizeThresholdRequest,
} from '@/services/pricing.service';
import {
    PriceCalculationRequest,
    PriceCalculationResult,
    PriceRangeRequest,
    PriceRange,
    MaterialOptionsParams,
    MaterialOptions,
    QuantityTiersResponse,
    ProductTypeInfo,
    SurchargeScopeInfo,
    ProductType
} from '@/types/pricing';

// =====================================================
// QUERY KEYS
// =====================================================

export const pricingKeys = {
    all: ['pricing'] as const,
    rules: () => [...pricingKeys.all, 'rules'] as const,
    materialSurcharges: (filters?: object) => [...pricingKeys.all, 'material-surcharges', filters] as const,
    quantityTiers: (productType?: number) => [...pricingKeys.all, 'quantity-tiers', productType] as const,
    sizeThresholds: (filters?: object) => [...pricingKeys.all, 'size-thresholds', filters] as const,
};

// =====================================================
// LEGACY HOOK (for backward compatibility)
// =====================================================

export function usePricing() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculatePrice = useCallback(async (data: PriceCalculationRequest): Promise<PriceCalculationResult | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.calculatePrice(data);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to calculate price';
            setError(errorMessage);
            console.error('Calculate price error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const calculatePriceRange = useCallback(async (data: PriceRangeRequest): Promise<PriceRange | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.calculatePriceRange(data);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to calculate price range';
            setError(errorMessage);
            console.error('Calculate price range error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMaterialOptions = useCallback(async (params: MaterialOptionsParams): Promise<MaterialOptions | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.getMaterialOptions(params);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get material options';
            setError(errorMessage);
            console.error('Get material options error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getQuantityTiers = useCallback(async (productType?: ProductType): Promise<QuantityTiersResponse | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.getQuantityTiers(productType);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get quantity tiers';
            setError(errorMessage);
            console.error('Get quantity tiers error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getProductTypes = useCallback(async (): Promise<ProductTypeInfo[]> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.getProductTypes();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get product types';
            setError(errorMessage);
            console.error('Get product types error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getSurchargeScopes = useCallback(async (): Promise<SurchargeScopeInfo[]> => {
        setLoading(true);
        setError(null);
        try {
            const result = await pricingService.getSurchargeScopes();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get surcharge scopes';
            setError(errorMessage);
            console.error('Get surcharge scopes error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        calculatePrice,
        calculatePriceRange,
        getMaterialOptions,
        getQuantityTiers,
        getProductTypes,
        getSurchargeScopes
    };
}

// =====================================================
// PRICING RULES HOOKS (TanStack Query)
// =====================================================

export function usePricingRules() {
    return useQuery({
        queryKey: pricingKeys.rules(),
        queryFn: () => pricingService.getPricingRules(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreatePricingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePricingRuleRequest) => pricingService.createPricingRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.rules() });
        },
    });
}

export function useUpdatePricingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePricingRuleRequest }) =>
            pricingService.updatePricingRule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.rules() });
        },
    });
}

export function useDeletePricingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.deletePricingRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.rules() });
        },
    });
}

export function useTogglePricingRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.togglePricingRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.rules() });
        },
    });
}

// =====================================================
// MATERIAL SURCHARGES HOOKS (TanStack Query)
// =====================================================

export function useMaterialSurcharges(filters?: { sourceMaterialId?: number; targetMaterialId?: number; productType?: number }) {
    return useQuery({
        queryKey: pricingKeys.materialSurcharges(filters),
        queryFn: () => pricingService.getMaterialSurcharges(filters),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateMaterialSurcharge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMaterialSurchargeRequest) => pricingService.createMaterialSurcharge(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useUpdateMaterialSurcharge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateMaterialSurchargeRequest }) =>
            pricingService.updateMaterialSurcharge(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useDeleteMaterialSurcharge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.deleteMaterialSurcharge(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useToggleMaterialSurcharge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.toggleMaterialSurcharge(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

// =====================================================
// QUANTITY TIERS HOOKS (TanStack Query)
// =====================================================

export function useQuantityTiersQuery(productType?: number) {
    return useQuery({
        queryKey: pricingKeys.quantityTiers(productType),
        queryFn: () => pricingService.getQuantityTiers(productType),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateQuantityTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateQuantityTierRequest) => pricingService.createQuantityTier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useUpdateQuantityTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateQuantityTierRequest }) =>
            pricingService.updateQuantityTier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useDeleteQuantityTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.deleteQuantityTier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useToggleQuantityTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.toggleQuantityTier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

// =====================================================
// SIZE THRESHOLDS HOOKS (TanStack Query)
// =====================================================

export function useSizeThresholds(filters?: { productType?: number; dimensionType?: number; action?: number }) {
    return useQuery({
        queryKey: pricingKeys.sizeThresholds(filters),
        queryFn: () => pricingService.getSizeThresholds(filters),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateSizeThreshold() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSizeThresholdRequest) => pricingService.createSizeThreshold(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useUpdateSizeThreshold() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSizeThresholdRequest }) =>
            pricingService.updateSizeThreshold(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useDeleteSizeThreshold() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.deleteSizeThreshold(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

export function useToggleSizeThreshold() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => pricingService.toggleSizeThreshold(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.all });
        },
    });
}

// =====================================================
// GET BY ID HOOKS (for Edit Pages)
// =====================================================

export function usePricingRuleById(id: number) {
    return useQuery({
        queryKey: [...pricingKeys.rules(), id],
        queryFn: async () => {
            const rules = await pricingService.getPricingRules();
            return rules.find(r => r.id === id);
        },
        enabled: !!id,
    });
}

export function useMaterialSurchargeById(id: number) {
    return useQuery({
        queryKey: [...pricingKeys.materialSurcharges(), id],
        queryFn: async () => {
            const surcharges = await pricingService.getMaterialSurcharges();
            return surcharges.find(s => s.id === id);
        },
        enabled: !!id,
    });
}

export function useQuantityTierById(id: number) {
    return useQuery({
        queryKey: [...pricingKeys.quantityTiers(), id],
        queryFn: async () => {
            const response = await pricingService.getQuantityTiers();
            const tiers: QuantityTier[] = Array.isArray(response) ? response : (response as any)?.tiers || [];
            return tiers.find(t => t.id === id);
        },
        enabled: !!id,
    });
}

export function useSizeThresholdById(id: number) {
    return useQuery({
        queryKey: [...pricingKeys.sizeThresholds(), id],
        queryFn: async () => {
            const thresholds = await pricingService.getSizeThresholds();
            return thresholds.find(t => t.id === id);
        },
        enabled: !!id,
    });
}

