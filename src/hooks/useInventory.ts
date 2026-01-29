import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/services/inventory.service';
import {
    Inventory,
    InventoryStats,
    InventoryFilterParams,
    AdjustInventoryRequest,
    CreateInventoryRequest,
    UpdateInventoryRequest
} from '@/types/inventory';

export function useInventory(initialParams?: InventoryFilterParams) {
    const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialParams?.page || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<InventoryFilterParams | undefined>(initialParams);

    const fetchInventory = useCallback(async (params?: InventoryFilterParams) => {
        setLoading(true);
        setError(null);

        try {
            const mergedParams = { ...currentParams, ...params };
            setCurrentParams(mergedParams);

            const response = await inventoryService.getInventory(mergedParams);

            setInventoryList(response.inventory);
            setTotal(response.total);
            setPage(response.page);
            setTotalPages(response.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory';
            setError(errorMessage);
            console.error('Fetch inventory error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const getInventoryByProduct = useCallback(async (productId: number): Promise<Inventory | null> => {
        setLoading(true);
        setError(null);
        try {
            const inventory = await inventoryService.getInventoryByProductId(productId);
            return inventory;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product inventory';
            setError(errorMessage);
            console.error('Fetch product inventory error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrUpdateInventory = useCallback(async (data: CreateInventoryRequest): Promise<Inventory | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await inventoryService.createOrUpdateInventory(data);
            if (result) {
                await fetchInventory(currentParams);
            }
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create/update inventory';
            setError(errorMessage);
            console.error('Create/update inventory error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchInventory]);

    const adjustStock = useCallback(async (data: AdjustInventoryRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const result = await inventoryService.adjustInventory(data);
            if (result) {
                await fetchInventory(currentParams);
            }
            return !!result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to adjust stock';
            setError(errorMessage);
            console.error('Adjust stock error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchInventory]);

    const updateInventory = useCallback(async (id: number, data: UpdateInventoryRequest): Promise<Inventory | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await inventoryService.updateInventory(id, data);
            if (result) {
                setInventoryList(prev => prev.map(inv => inv.id === id ? result : inv));
            }
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory';
            setError(errorMessage);
            console.error('Update inventory error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteInventory = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const success = await inventoryService.deleteInventory(id);
            if (success) {
                setInventoryList(prev => prev.filter(inv => inv.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory';
            setError(errorMessage);
            console.error('Delete inventory error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        inventoryList,
        total,
        page,
        totalPages,
        loading,
        error,
        fetchInventory,
        getInventoryByProduct,
        createOrUpdateInventory,
        adjustStock,
        updateInventory,
        deleteInventory
    };
}

export function useInventoryStats() {
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getStats();
            setStats(data);
        } catch (err) {
            setError('Failed to fetch inventory stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refreshStats: fetchStats };
}
