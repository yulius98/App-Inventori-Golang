import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addKategori,
  deleteKategori,
  getAllKategori,
  getKategori,
  updateKategori,
  type Kategori,
  type NewKategori,
  type PaginatedResponse,
} from '@/lib/api';

interface KategoriState {
  items: Kategori[];
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
}

export function useKategori(initialPage = 1) {
  const [state, setState] = useState<KategoriState>({
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
      const res: PaginatedResponse<Kategori> = await getKategori(page);
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

  const create = useCallback(async (data: NewKategori) => {
    await addKategori(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: number, data: Partial<Kategori>) => {
    await updateKategori(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await deleteKategori(id);
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

export function useAllKategori() {
  const [items, setItems] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const list = await getAllKategori();
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
