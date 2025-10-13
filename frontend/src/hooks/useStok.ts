'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStok, type Stok, type PaginatedResponse } from '@/lib/api';

export function useStok(initialPage: number = 1) {
  const [items, setItems] = useState<Stok[]>([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedResponse<Stok> = await getStok(pageNum);
      
      setItems(response.data || []);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setItemsPerPage(response.limit);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setItems([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    fetchItems(page);
  }, [page, fetchItems]);

  // Initial fetch
  useEffect(() => {
    fetchItems(initialPage);
  }, [fetchItems, initialPage]);

  const refresh = useCallback(() => {
    fetchItems(page);
  }, [fetchItems, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return {
    items,
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    loading,
    error,
    setPage: goToPage,
    refresh,
  };
}