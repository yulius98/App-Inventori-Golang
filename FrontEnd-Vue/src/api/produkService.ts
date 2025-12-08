import { api } from "@/helper/api_url";

export const getProduk = async () => {
    const res = await api.get('/produk');
    return res.data.data;
}

export interface Produk {
    id: number;
    nama: string;
    id_kategori: number;
    kategori: string;
    keterangan: string;
    price: number;
}

export interface AddProduk {
    id: number;
    nama: string;
    id_kategori: number;
    keterangan: string;
    price: number;
}

export const createProduk = (data: AddProduk) => api.post('/produk',data);
export const updateProduk = (id: number, data: Produk) => api.put(`/produk/${id}`,data);
export const deleteProduk = (id: number) => api.delete(`/produk/${id}`);
export const searchProduk = (nama: string, kategori: string) => {
  const params = new URLSearchParams();
  if (nama) params.append('nama', nama);
  if (kategori) params.append('kategori', kategori);
  return api.get(`/produk/search?${params.toString()}`);
}