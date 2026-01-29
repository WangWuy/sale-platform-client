'use client';

import { useState, useCallback } from 'react';
import { supplierService } from '@/services/supplier.service';
import {
    Supplier,
    SupplierFilterParams,
    CreateSupplierRequest,
    UpdateSupplierRequest
} from '@/types/supplier';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = useCallback(async (params?: SupplierFilterParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await supplierService.getSuppliers(params);

            setSuppliers(response.suppliers);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = useCallback(async (data: CreateSupplierRequest) => {
        setLoading(true);
        try {
            const newSupplier = await supplierService.createSupplier(data);
            setSuppliers(prev => [...prev, newSupplier]);
            return newSupplier;
        } catch (err) {
            setError('Failed to create supplier');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSupplier = useCallback(async (id: number, data: UpdateSupplierRequest) => {
        setLoading(true);
        try {
            const updated = await supplierService.updateSupplier(id, data);
            setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
            return updated;
        } catch (err) {
            setError('Failed to update supplier');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteSupplier = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const success = await supplierService.deleteSupplier(id);
            if (success) {
                setSuppliers(prev => prev.filter(s => s.id !== id));
            }
            return success;
        } catch (err) {
            setError('Failed to delete supplier');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        suppliers,
        total,
        totalPages,
        loading,
        error,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier
    };
}
