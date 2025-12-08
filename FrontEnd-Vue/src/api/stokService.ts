import { api } from "@/helper/api_url";

export const getStok = async () => {
    const res = await api.get('/stok');
    return res.data;
}

export interface Stok {
    id: number;
    tgl_trx: string;
    id_produk: number;
    id_kategori: number;
    movement_type: string;
    quantity: number; 
}

export const addStok = (data: Stok) => api.post('/stok',data);