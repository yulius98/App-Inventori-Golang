import { useCallback, useEffect, useMemo, useState } from 'react';
import { addProduk, deleteProduk, getAllProduk, getProduk, updateProduk, type Produk, type PaginatedResponse } from '@/lib/api';

interface ProdukState {
  items: Produk[];
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
}

export function useProduk(initialPage = 1) {
  const [state, setState] = useState<ProdukState>({
    items: [],
    page: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    loading: false,
    error: null,
  });

  const fetchPage = useCallback(async (page: number) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res: PaginatedResponse<Produk> = await getProduk(page);
      setState((s) => ({
        ...s,
        items: res.data,
        page: res.page,
        totalPages: res.totalPages,
        totalItems: res.total,
        itemsPerPage: res.limit,
        loading: false,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    fetchPage(state.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page]);

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page }));
  }, []);

  const refresh = useCallback(() => fetchPage(state.page), [fetchPage, state.page]);

  type CreateProduk = Omit<Produk, 'id' | 'ID' | 'created_at' | 'updated_at'>;

  const create = useCallback(async (data: CreateProduk) => {
    await addProduk(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: number, data: Partial<Produk>) => {
    await updateProduk(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await deleteProduk(id);
    await refresh();
  }, [refresh]);

  return useMemo(() => ({
    ...state,
    setPage,
    refresh,
    create,
    update,
    remove,
  }), [state, setPage, refresh, create, update, remove]);
}

export function useAllProduk() {
  const [items, setItems] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const list = await getAllProduk();
        if (!mounted) return;
        setItems(list);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        if (!mounted) return;
        setError(msg);
        setItems([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  return { items, loading, error };
}
