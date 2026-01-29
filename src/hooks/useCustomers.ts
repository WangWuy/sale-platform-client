'use client';

import { useState, useEffect, useCallback } from 'react';
import { customerService } from '@/services/customer.service';
import {
    Customer,
    CustomerFilterParams,
    CustomerStats,
    CreateCustomerRequest,
    UpdateCustomerRequest
} from '@/types/customer';

interface UseCustomersReturn {
    customers: Customer[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    fetchCustomers: (params?: CustomerFilterParams) => Promise<void>;
    createCustomer: (data: CreateCustomerRequest) => Promise<Customer | null>;
    updateCustomer: (id: number, data: UpdateCustomerRequest) => Promise<Customer | null>;
    deleteCustomer: (id: number) => Promise<boolean>;
    restoreCustomer: (id: number) => Promise<Customer | null>;
}

export function useCustomers(initialParams?: CustomerFilterParams): UseCustomersReturn {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialParams?.page || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<CustomerFilterParams | undefined>(initialParams);

    const fetchCustomers = useCallback(async (params?: CustomerFilterParams) => {
        setLoading(true);
        setError(null);

        try {
            const mergedParams = { ...currentParams, ...params };
            setCurrentParams(mergedParams);

            const response = await customerService.getCustomers(mergedParams);

            setCustomers(response.customers);
            setTotal(response.total);
            setPage(response.page);
            setTotalPages(response.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
            setError(errorMessage);
            console.error('Fetch customers error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const createCustomer = useCallback(async (data: CreateCustomerRequest): Promise<Customer | null> => {
        setLoading(true);
        setError(null);

        try {
            const newCustomer = await customerService.createCustomer(data);
            if (newCustomer) {
                await fetchCustomers(currentParams);
            }
            return newCustomer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
            setError(errorMessage);
            console.error('Create customer error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCustomers]);

    const updateCustomer = useCallback(async (id: number, data: UpdateCustomerRequest): Promise<Customer | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedCustomer = await customerService.updateCustomer(id, data);
            if (updatedCustomer) {
                setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
            }
            return updatedCustomer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
            setError(errorMessage);
            console.error('Update customer error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCustomer = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await customerService.deleteCustomer(id);
            if (success) {
                setCustomers(prev => prev.filter(c => c.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
            setError(errorMessage);
            console.error('Delete customer error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const restoreCustomer = useCallback(async (id: number): Promise<Customer | null> => {
        setLoading(true);
        setError(null);

        try {
            const restoredCustomer = await customerService.restoreCustomer(id);
            if (restoredCustomer) {
                // Refresh the customer list to show the restored customer
                await fetchCustomers(currentParams);
            }
            return restoredCustomer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to restore customer';
            setError(errorMessage);
            console.error('Restore customer error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchCustomers]);

    useEffect(() => {
        fetchCustomers(initialParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        customers,
        total,
        page,
        totalPages,
        loading,
        error,
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        restoreCustomer
    };
}

export function useCustomerStats() {
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await customerService.getStats();
            setStats(data);
        } catch (err) {
            setError('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refreshStats: fetchStats };
}

/**
 * Hook to fetch customers by specific type
 * @param customerType - The type of customer to filter by
 * @example
 * ```tsx
 * const { customers, loading, error, refetch } = useCustomersByType('Quán cà phê');
 * ```
 */
export function useCustomersByType(customerType: string) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomersByType = useCallback(async () => {
        if (!customerType) {
            setCustomers([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await customerService.getCustomersByType(customerType);
            setCustomers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers by type';
            setError(errorMessage);
            console.error('Fetch customers by type error:', err);
        } finally {
            setLoading(false);
        }
    }, [customerType]);

    useEffect(() => {
        fetchCustomersByType();
    }, [fetchCustomersByType]);

    return {
        customers,
        loading,
        error,
        refetch: fetchCustomersByType
    };
}

