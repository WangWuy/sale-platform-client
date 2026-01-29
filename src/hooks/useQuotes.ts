import { useState, useCallback } from 'react';
import { quoteService } from '@/services/quote.service';
import {
    Quote,
    QuoteWithItems,
    CreateQuoteDTO,
    CreateQuoteItemDTO,
    PriceCalculationRequest,
    PriceCalculationResult,
    QuoteFilterParams,
    QuoteItem
} from '@/types/quote';

export function useQuotes(initialParams?: QuoteFilterParams) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<QuoteFilterParams | undefined>(initialParams);

    const fetchQuotes = useCallback(async (params?: QuoteFilterParams) => {
        setLoading(true);
        setError(null);

        try {
            const mergedParams = { ...currentParams, ...params };
            setCurrentParams(mergedParams);

            const response = await quoteService.getQuotes(mergedParams);
            setQuotes(response.quotes);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotes';
            setError(errorMessage);
            console.error('Fetch quotes error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const getQuoteById = useCallback(async (id: number): Promise<QuoteWithItems | null> => {
        setLoading(true);
        setError(null);

        try {
            const quote = await quoteService.getQuoteById(id);
            return quote;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
            setError(errorMessage);
            console.error('Fetch quote error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createQuote = useCallback(async (data: CreateQuoteDTO): Promise<Quote | null> => {
        setLoading(true);
        setError(null);

        try {
            const newQuote = await quoteService.createQuote(data);
            if (newQuote) {
                await fetchQuotes(currentParams);
            }
            return newQuote;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create quote';
            setError(errorMessage);
            console.error('Create quote error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentParams, fetchQuotes]);

    const updateQuote = useCallback(async (id: number, data: Partial<CreateQuoteDTO>): Promise<Quote | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedQuote = await quoteService.updateQuote(id, data);
            if (updatedQuote) {
                setQuotes(prev => prev.map(q => q.id === id ? updatedQuote : q));
            }
            return updatedQuote;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update quote';
            setError(errorMessage);
            console.error('Update quote error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteQuote = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await quoteService.deleteQuote(id);
            if (success) {
                setQuotes(prev => prev.filter(q => q.id !== id));
                setTotal(prev => prev - 1);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete quote';
            setError(errorMessage);
            console.error('Delete quote error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const calculatePrice = useCallback(async (data: PriceCalculationRequest): Promise<PriceCalculationResult | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await quoteService.calculatePrice(data);
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

    const addItem = useCallback(async (quoteId: number, data: CreateQuoteItemDTO): Promise<QuoteItem | null> => {
        setLoading(true);
        setError(null);

        try {
            const newItem = await quoteService.addItem(quoteId, data);
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
            setError(errorMessage);
            console.error('Add item error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const bulkAddItems = useCallback(async (quoteId: number, items: CreateQuoteItemDTO[]): Promise<QuoteItem[] | null> => {
        setLoading(true);
        setError(null);

        try {
            const newItems = await quoteService.bulkAddItems(quoteId, items);
            return newItems;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to bulk add items';
            setError(errorMessage);
            console.error('Bulk add items error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateItem = useCallback(async (quoteId: number, itemId: number, data: Partial<CreateQuoteItemDTO>): Promise<QuoteItem | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedItem = await quoteService.updateItem(quoteId, itemId, data);
            return updatedItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
            setError(errorMessage);
            console.error('Update item error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteItem = useCallback(async (quoteId: number, itemId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const success = await quoteService.deleteItem(quoteId, itemId);
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
            setError(errorMessage);
            console.error('Delete item error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        quotes,
        total,
        totalPages,
        loading,
        error,
        fetchQuotes,
        getQuoteById,
        createQuote,
        updateQuote,
        deleteQuote,
        calculatePrice,
        addItem,
        bulkAddItems,
        updateItem,
        deleteItem
    };
}
