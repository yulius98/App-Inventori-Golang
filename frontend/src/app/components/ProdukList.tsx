'use client';
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getKategori, getProductId, type Produk, type Kategori } from '@/lib/api';
import { useProduk } from '@/hooks/useProduk';
import { useApiConnection } from '@/hooks/useApiConnection';
import Pagination from './Pagination';
import ApiConnectionBadge from './ApiConnectionBadge';

interface ProdukListProps {
  onEdit: (produk: Produk) => void;
}

export interface ProdukListRef {
  refreshItems: () => void;
}

const ProdukList = forwardRef<ProdukListRef, ProdukListProps>(function ProdukList({ onEdit }, ref) {
  const [error, setError] = useState<string | null>(null);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const status = useApiConnection();
  const { items, page, totalPages, totalItems, itemsPerPage, setPage, refresh, remove } = useProduk(1);

  const fetchKategoris = async () => {
    try {
      const kategoriResponse = await getKategori();
      setKategoris(kategoriResponse.data);
    } catch {
      // Error handling for categories fetch
    }
  };

  const getKategoriName = (id_kategori: number): string => {
    const kategori = kategoris.find(k => k.ID === id_kategori);
    return kategori ? kategori.kategori : `ID: ${id_kategori}`;
  };

  const fetchItems = useCallback(async () => {
    try {
      await refresh();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch items: ${errorMessage}`);
    }
  }, [refresh]);

  // Expose refreshItems function to parent component
  useImperativeHandle(ref, () => ({
    refreshItems: fetchItems
  }));

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchKategoris();
  }, []);

  const handleDelete = async (id: number) => {
    
    if (!id || id === null || id === undefined) {
      setError('Invalid ID: Product ID is missing or invalid');
      return;
    }
    
    // Validate ID is a positive number
    if (typeof id !== 'number' || id <= 0 || !Number.isInteger(id)) {
      setError(`Invalid ID format: ${id} (type: ${typeof id})`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete product with ID: ${id}?`)) {
      setIsDeleting(true);
      try {
        setError(null); // Clear previous errors
        
  await remove(id);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        const fullErrorMessage = `Failed to delete product with ID ${id}: ${errorMessage}`;
        setError(fullErrorMessage);
        
        // Try to refresh the list to see current state
        try {
          await fetchItems();
        } catch {
          // Silent fail on refresh error
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (produk: Produk) => {
    onEdit(produk);
  };

  const handlePageChange = (toPage: number) => {
    if (toPage >= 1 && toPage <= totalPages) {
      setPage(toPage);
    }
  };

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
            
            <th className="border p-2">Nama</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((produk, index) => {
            const productId = getProductId(produk);
            return (
              <tr key={productId ?? `temp-${index}`}>
                
                <td className="border p-2">{produk.nama}</td>
                <td className="border p-2">{produk.kategori || (produk.id_kategori ? getKategoriName(produk.id_kategori) : 'No Category')}</td>
                <td className="border p-2">{produk.keterangan}</td>
                <td className="border p-2">Rp{produk.price.toLocaleString('id-ID')}</td>
                <td className="border p-2">
                  <button 
                    onClick={() => handleEdit(produk)} 
                    className="bg-yellow-500 text-white p-1 mr-2 rounded">Edit</button>
                  <button 
                    onClick={() => {
                      if (productId) {
                        handleDelete(productId);
                      } else {
                        setError('Product ID is missing - cannot delete');
                      }
                    }} 
                    disabled={isDeleting}
                    className={`text-white p-1 rounded ${isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    );
});

export default ProdukList;