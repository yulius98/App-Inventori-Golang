'use client';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { type Produk } from '@/lib/api';
import { useAllKategori } from '@/hooks/useKategori';

interface Props {
  onSubmit: (data: Produk) => void;
  initialData?: Produk;  // Opsional untuk edit
}

export default function ProdukForm({ onSubmit, initialData }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Produk>({
    defaultValues: initialData || {},
  });
  
  const { items: kategoris, loading } = useAllKategori();

  // Effect untuk reset form ketika initialData berubah
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      // Reset form ke nilai kosong ketika tidak ada initialData
      reset({
        nama: '',
        id_kategori: undefined,
        keterangan: '',
        price: 0
      });
    }
  }, [initialData, reset]);

  // no need to fetch manually; handled by useAllKategori

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-4 border border-gray-300 rounded">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium">
          {initialData ? `Edit Product: ${initialData.nama || 'Unknown'}` : 'Add New Product'}
        </h3>
        {initialData && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">EDIT MODE</span>
        )}
      </div>
      
      <label className="block font-medium">Nama Produk</label>
      <input 
        {...register('nama', { required: true })} 
        placeholder="Nama" 
        className="border p-2 w-full"
        suppressHydrationWarning={true}
      />
      {errors.nama && <p className="text-red-500 text-sm">Name is required</p>}
      
      <label className="block font-medium">Kategori</label>
      <select 
        {...register('id_kategori', { required: true, valueAsNumber: true })} 
        className="border p-2 w-full"
        suppressHydrationWarning={true}
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading categories...' : 'Select Category'}
        </option>
        {Array.isArray(kategoris) && kategoris.map((kategori) => (
          <option key={kategori.ID} value={kategori.ID}>
            {kategori.kategori}
          </option>
        ))}
      </select>
      {errors.id_kategori && <p className="text-red-500 text-sm">Category is required</p>}
      
      <label className="block font-medium">Keterangan</label>
      <input 
        {...register('keterangan')} 
        placeholder="Keterangan" 
        className="border p-2 w-full"
        suppressHydrationWarning={true}
      />
      <label className="block font-medium">Harga</label>
      <input 
        type="number" 
        {...register('price', { required: true, min: 0 })} 
        placeholder="Harga" 
        className="border p-2 w-full"
        suppressHydrationWarning={true}
      />
      {errors.price && <p className="text-red-500 text-sm">Price is required</p>}
      <button 
        type="submit" 
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 w-full rounded font-medium transition-colors"
        suppressHydrationWarning={true}
      >
        {initialData ? '💾 Update Product' : '➕ Create Product'}
      </button>
    </form>
  );
}