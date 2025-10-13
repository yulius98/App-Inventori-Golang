'use client';
import { useState, useRef } from 'react';
import ProdukForm from '../components/ProdukForm';
import ProdukList, { type ProdukListRef } from '../components/ProdukList';
import { type Produk, addProduk, updateProduk, getProductId } from '@/lib/api';


export default function ProdukPage() {
  const [editingItem, setEditingItem] = useState<Produk | null>(null);
  const productListRef = useRef<ProdukListRef>(null);

  const handleSubmit = async (data: Produk) => {
    try {
      if (editingItem) {
        // Mode edit - update existing product
        const productId = getProductId(editingItem);
        if (productId) {
          const itemWithId = { 
            ...data, 
            id: productId,
            ID: productId 
          };
          await updateProduk(productId, itemWithId);
          alert('Product updated successfully!');
          setEditingItem(null); // Reset edit mode
          
          // Refresh the product list
          if (productListRef.current) {
            productListRef.current.refreshItems();
          }
        } else {
          throw new Error('Product ID is missing - cannot update item.');
        }
      } else {
        // Mode create - add new product
  await addProduk(data);
        alert('Product created successfully!');
        
        // Refresh the product list
        if (productListRef.current) {
          productListRef.current.refreshItems();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      if (error instanceof Error) {
        alert(`Error saving product: ${error.message}`);
      } else {
        alert('Unknown error occurred while saving product');
      }
    }
  };

  const handleEdit = (produk: Produk) => {
    console.log('Editing product:', produk);
    setEditingItem(produk);
  };

  const handleCancelEdit = () => {
    console.log('Cancelling edit');
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Produk Management</h1>
      
      <div className="mb-6">
        <ProdukForm 
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
      
  <ProdukList ref={productListRef} onEdit={handleEdit} />
    </div>
  );
}
