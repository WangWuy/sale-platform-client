'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/product.service';
import {
    Product,
    ProductListParams,
    ProductListResponse,
    CreateProductRequest,
    UpdateProductRequest
} from '@/types/product';

interface UseProductsReturn {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    fetchProducts: (params?: ProductListParams) => Promise<void>;
    createProduct: (data: CreateProductRequest) => Promise<Product | null>;
    updateProduct: (id: number, data: UpdateProductRequest) => Promise<Product | null>;
    deleteProduct: (id: number) => Promise<boolean>;
    refreshProducts: () => Promise<void>;
}

export function useProducts(initialParams?: ProductListParams): UseProductsReturn {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialParams?.page || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<ProductListParams | undefined>(initialParams);

    const fetchProducts = useCallback(async (params?: ProductListParams) => {
        setLoading(true);
        setError(null);

        try {
            const mergedParams = { ...currentParams, ...params };
            setCurrentParams(mergedParams);

            const response: ProductListResponse = await productService.getProducts(mergedParams);

            setProducts(response.products);
            setTotal(response.total);
            setPage(response.page);
            setTotalPages(response.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
            setError(errorMessage);
            console.error('Fetch products error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const createProduct = useCallback(async (data: CreateProductRequest): Promise<Product | null> => {
        setLoading(true);
        setError(null);

        try {
            const newProduct = await productService.createProduct(data);
            if (newProduct) {
                // Refresh list after create
                await fetchProducts(currentParams);
            }
            return newProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
            setError(errorMessage);
            console.error('Create product error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchProducts]);

    const updateProduct = useCallback(async (id: number, data: UpdateProductRequest): Promise<Product | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedProduct = await productService.updateProduct(id, data);
            if (updatedProduct) {
                // Update local state
                setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
            }
            return updatedProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
            setError(errorMessage);
            console.error('Update product error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await productService.deleteProduct(id);
            if (success) {
                // Remove from local state
                setProducts(prev => prev.filter(p => p.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
            setError(errorMessage);
            console.error('Delete product error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshProducts = useCallback(async () => {
        await fetchProducts(currentParams);
    }, [currentParams, fetchProducts]);

    // Initial fetch
    useEffect(() => {
        fetchProducts(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    return {
        products,
        total,
        page,
        totalPages,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshProducts
    };
}

// Hook for product stats
interface UseProductStatsReturn {
    stats: {
        totalProducts: number;
        lowStock: number;
        totalValue: number;
        categories: number;
    };
    loading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
}

export function useProductStats(): UseProductStatsReturn {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalValue: 0,
        categories: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await productService.getProductStats();
            setStats(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
            setError(errorMessage);
            console.error('Fetch stats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    return {
        stats,
        loading,
        error,
        refreshStats: fetchStats
    };
}
