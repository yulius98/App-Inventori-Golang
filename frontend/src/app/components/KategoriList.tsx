'use client';
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getKategoriId, type Kategori } from '@/lib/api';
import { useKategori } from '@/hooks/useKategori';
import { useApiConnection } from '@/hooks/useApiConnection';
import Pagination from './Pagination';
import ApiConnectionBadge from './ApiConnectionBadge';

interface KategoriListProps {
    onEdit: (kategori: Kategori) => void; 
}

export interface KategoriListRef {
    refreshItems: () => void;
}

const KategoriList = forwardRef<KategoriListRef, KategoriListProps>(function KategoriList({ onEdit }, ref) {
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const status = useApiConnection();
    const { items, page, totalPages, totalItems, itemsPerPage, setPage, refresh, remove } = useKategori(1);
    
    // Fetch categories with pagination
    const fetchItems = useCallback(async () => {
        try {
            await refresh();
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to fetch categories: ${errorMessage}`);
        }
    }, [refresh]);

    useImperativeHandle(ref, () => ({
        refreshItems: fetchItems
    }));

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // connection handled by useApiConnection

    const handleDelete = async (id: number) => {
        
        if (!id || id === null || id === undefined) {
          setError('Invalid ID: Category ID is missing or invalid');
          return;
        }
        
        // Validate ID is a positive number
        if (typeof id !== 'number' || id <= 0 || !Number.isInteger(id)) {
          setError(`Invalid ID format: ${id} (type: ${typeof id})`);
          return;
        }
        
        if (confirm(`Are you sure you want to delete category with ID: ${id}?`)) {
          setIsDeleting(true);
          try {
            setError(null); // Clear previous errors
            
            await remove(id);
            await fetchItems();
            
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            const fullErrorMessage = `Failed to delete category with ID ${id}: ${errorMessage}`;
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

    const handleEdit = (kategori: Kategori) => {
        console.log('Editing category:', kategori); // Debug log
        onEdit(kategori); // Pass to parent component
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
                            <th className="border p-2">Kategori</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((kategori) => {
                            const kategoriId = getKategoriId(kategori);
                            if (!kategoriId) {
                                console.warn('Kategori without ID found:', kategori);
                                return null;
                            }
                            return (
                                <tr key={kategoriId}>
                                    <td className="border p-2">{kategori.kategori}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleEdit(kategori)}
                                            className="bg-yellow-500 text-white p-1 mr-2 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(kategoriId)}
                                            disabled={isDeleting}
                                            className={`text-white p-1 rounded ${
                                                isDeleting
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600'
                                            }`}
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

export default KategoriList;

