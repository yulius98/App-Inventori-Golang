'use client';
import { useState, useRef } from 'react';
import KategoriForm from '../components/KategoriForm';
import KategoriList, { KategoriListRef } from '../components/KategoriList';
import { type Kategori, type NewKategori, addKategori, updateKategori, getKategoriId } from '@/lib/api';


export default function CategoryPage() {
    const [editingItem, setEditingItem] = useState<Kategori | null>(null);
    const kategoriListRef = useRef<KategoriListRef>(null);

  const handleSubmit = async (data: Kategori) => {
    try {
      if (editingItem) {
        const id = getKategoriId(editingItem);
        if (!id) throw new Error('Category ID is missing - cannot update.');
        await updateKategori(id, { kategori: data.kategori });
        setEditingItem(null);
        alert('Category updated successfully!');
      } else {
        // Create
        const newKategori: NewKategori = { kategori: data.kategori };
        await addKategori(newKategori);
        alert('Category created successfully!');
      }

      // Refresh the list after create/update
      kategoriListRef.current?.refreshItems();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error instanceof Error) {
        alert(`Error saving category: ${error.message}`);
      } else {
        alert('Unknown error occurred while saving category');
      }
    }
  };

  const handleEdit = (kategori: Kategori) => {
    console.log('Editing kategori:', kategori);
    setEditingItem(kategori);
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Kategori Management</h1>
      
      <div className="mb-6">
        <KategoriForm 
          onSubmit={handleSubmit} 
          initialData={editingItem || undefined}
        />
        {editingItem && (
          <button 
            onClick={handleCancelEdit} 
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 mt-2 rounded"
          >
            Cancel Edit
          </button>
        )}
      </div>
      
      {/* Display list of categories using KategoriList component */}
      <div className="mt-6">
        <h2 className="text-xl mb-4">Categories List</h2>
        <KategoriList 
          ref={kategoriListRef}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
