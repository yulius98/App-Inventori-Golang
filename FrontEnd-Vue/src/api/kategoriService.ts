import { api } from "@/helper/api_url";

export const getKategori = async () => {
    const res = await api.get('/allkategori');
    return res.data;
}

export interface Kategori {
    id: number;
    kategori: string;
}

export const createKategori = (data: Kategori) => api.post('/kategori',data);