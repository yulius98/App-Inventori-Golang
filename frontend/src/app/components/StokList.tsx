'use client';
import { forwardRef, useImperativeHandle } from 'react';
import { getStokId, type Stok } from '@/lib/api';
import { useStok } from '@/hooks/useStok';
import { useApiConnection } from '@/hooks/useApiConnection';
import Pagination from './Pagination';
import ApiConnectionBadge from './ApiConnectionBadge';

export interface StokListProps {
    onEdit?: (stok: Stok) => void;
}

export interface StokListRef {
  refreshItems: () => void;
}

const StokList = forwardRef<StokListRef, StokListProps>(function StokList(props, ref) {
  const status = useApiConnection();
  const { items, page, totalPages, totalItems, itemsPerPage, loading, error, setPage, refresh } = useStok(1);

  // Expose refresh method through ref
  useImperativeHandle(ref, () => ({
    refreshItems: refresh,
  }));

  const handlePageChange = (toPage: number) => {
    if (toPage >= 1 && toPage <= totalPages) {
      setPage(toPage);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <ApiConnectionBadge status={status} />
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading stok data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ApiConnectionBadge status={status} />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Pagination Component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      <table className="min-w-full border-collapse border border-gray-200 mt-2">
        <thead>
          <tr>
            <th className="border p-2">Category</th>
            <th className="border p-2">Product</th>
            <th className="border p-2">Total Stock</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr>
              <td colSpan={4} className="border p-4 text-center text-gray-500">
                No stock data available
              </td>
            </tr>
          ) : (
            items.map((stok, index) => {
              const stokId = getStokId(stok);
              return (
                <tr key={stokId ?? `temp-${index}`}>
                  <td className="border p-2">{stok.kategori}</td>
                  <td className="border p-2">{stok.produk}</td>
                  <td className="border p-2">{stok.total_stock}</td>
                  <td className="border p-2">Rp{stok.price.toLocaleString('id-ID')}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

export default StokList;