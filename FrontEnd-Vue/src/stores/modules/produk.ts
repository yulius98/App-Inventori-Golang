import { defineStore } from "pinia";
import { getProduk, createProduk, updateProduk, deleteProduk, type Produk, searchProduk } from "@/api/produkService";

export const useProdukStore = defineStore('produk',{
    state: ()=>({
        produkList:[] as Produk[],
        loading: false,
        error: '' as string | null
    }),

    actions: {
        async fetchProduk() {
            this.loading = true
            this.error = null
            try {
               this.produkList = await getProduk() 
            } catch (err) {
                this.error = 'Gagal mengambil data Produk'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async createProduk(newProduk: any) {
            this.loading = true
            this.error = null
            try {
                await createProduk(newProduk)
                await this.fetchProduk()
            } catch (err) {
                this.error = 'Gagal menambahkan Produk'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async updateProduk(id: number, data: Produk) {
            this.loading = true
            this.error = null
            try {
                await updateProduk(id, data)
                await this.fetchProduk()
            } catch (err) {
                this.error = 'Gagal edit Produk'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async deleteProduk(id: number) {
            this.loading = true
            this.error = null
            try {
                await deleteProduk(id)
                await this.fetchProduk()
            } catch (err) {
                this.error = 'Gagal delete Produk'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async fetchProdukById(id: number) {
            return this.produkList.find(p => p.id == id)
        },

        async smartSearch(query: string) {
            this.loading = true
            this.error = null
            try {
                // Cari berdasarkan nama terlebih dahulu
                let res = await searchProduk(query, '');
                
                // Jika data ditemukan di nama
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    
                    this.produkList = res.data.map((item: any) => ({
                        id: item.ID,
                        nama: item.nama,
                        id_kategori: item.id_kategori,
                        kategori: item.kategori,
                        keterangan: item.keterangan,
                        price: item.price
                    }));
                } else {
                    // Jika tidak ditemukan, cari berdasarkan kategori
                    
                    res = await searchProduk('', query);
                    
                    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                        
                        this.produkList = res.data.map((item: any) => ({
                            id: item.ID,
                            nama: item.nama,
                            id_kategori: item.id_kategori,
                            kategori: item.kategori,
                            keterangan: item.keterangan,
                            price: item.price
                        }));
                    } else {
                        // Jika tidak ditemukan di nama maupun kategori
                        
                        this.produkList = [];
                        this.error = 'Data tidak ditemukan';
                    }
                }
        
            } catch (err: any) {
                this.error = 'Gagal mencari'
                console.error('Search error:', err)
                console.error('Error response:', err.response)
            } finally {
                this.loading = false
            }
        },
    },

   
});