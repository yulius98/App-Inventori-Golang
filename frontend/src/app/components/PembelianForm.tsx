'use client';
import { useForm } from "react-hook-form";
import { type NewStok, getProductId, getKategoriId } from "@/lib/api";
import { useAllKategori } from "@/hooks/useKategori";
import { useAllProduk } from "@/hooks/useProduk";

interface Props {
  onSubmit: (data: NewStok) => void;
}

export default function PembelianForm({ onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewStok>({
    defaultValues: {
      id_produk: 0,
      id_kategori: 0,
      tgl_trx: new Date().toISOString().split('T')[0], // Default ke tanggal hari ini
      qty_in: 0,
      qty_out: 0
    },
  });
  
  const { items: kategoris, loading: loadingKategori } = useAllKategori();
  const { items: produks, loading: loadingProduk } = useAllProduk();

  const handleFormSubmit = (data: NewStok) => {
    // Format data sesuai dengan requirement
    // Mengkonversi tanggal ke format ISO dengan timezone Z
    const formattedData: NewStok = {
      id_produk: Number(data.id_produk),
      id_kategori: Number(data.id_kategori),
      tgl_trx: new Date(data.tgl_trx).toISOString(),
      qty_in: Number(data.qty_in),
      qty_out: 0 // Selalu 0 untuk pembelian
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-md mx-auto p-4 border border-gray-300 rounded">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium">Pembelian Stok</h3>
      </div>
      
      <div>
        <label className="block font-medium mb-1">Tanggal Transaksi</label>
        <input 
          type="date"
          {...register('tgl_trx', { required: true })} 
          className="border p-2 w-full"
          suppressHydrationWarning={true}
        />
        {errors.tgl_trx && <p className="text-red-500 text-sm">Tanggal transaksi is required</p>}
      </div>
      
      <div>
        <label className="block font-medium mb-1">Kategori</label>
        <select 
          {...register('id_kategori', { required: true, valueAsNumber: true })} 
          className="border p-2 w-full"
          suppressHydrationWarning={true}
          disabled={loadingKategori}
        >
          <option value={0}>
            {loadingKategori ? 'Loading categories...' : 'Select Category'}
          </option>
          {Array.isArray(kategoris) && kategoris.map((kategori) => (
            <option key={getKategoriId(kategori)} value={getKategoriId(kategori)}>
              {kategori.kategori}
            </option>
          ))}
        </select>
        {errors.id_kategori && <p className="text-red-500 text-sm">Category is required</p>}
      </div>
      
      <div>
        <label className="block font-medium mb-1">Produk</label>
        <select 
          {...register('id_produk', { required: true, valueAsNumber: true })} 
          className="border p-2 w-full"
          suppressHydrationWarning={true}
          disabled={loadingProduk}
        >
          <option value={0}>
            {loadingProduk ? 'Loading products...' : 'Select Product'}
          </option>
          {Array.isArray(produks) && produks.map((produk) => (
            <option key={getProductId(produk)} value={getProductId(produk)}>
              {produk.nama}
            </option>
          ))}
        </select>
        {errors.id_produk && <p className="text-red-500 text-sm">Product is required</p>}
      </div>
      
      <div>
        <label className="block font-medium mb-1">Jumlah Produk yang Dibeli</label>
        <input 
          type="number" 
          {...register('qty_in', { required: true, min: 1 })} 
          placeholder="Jumlah" 
          className="border p-2 w-full"
          suppressHydrationWarning={true}
        />
        {errors.qty_in && <p className="text-red-500 text-sm">Quantity is required and must be greater than 0</p>}
      </div>
      
      <button 
        type="submit" 
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 w-full rounded font-medium transition-colors"
        suppressHydrationWarning={true}
      >
        ➕ Add Stok
      </button>
    </form>
  );
}