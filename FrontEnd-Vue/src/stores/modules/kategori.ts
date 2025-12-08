import { defineStore } from "pinia";
import { getKategori, createKategori } from "@/api/kategoriService";
import type { Kategori } from "@/api/kategoriService";

export const useKategoriStore = defineStore('kategori',{
    state: ()=>({
        kategoriList:[] as Kategori[],
        loading: false,
        error: '' as string | null
    }),

    actions: {
        async fetchKategori() {
            this.loading = true
            this.error = null
            try {
               this.kategoriList = await getKategori()
            } catch (err) {
                this.error = 'Gagal mengambil data Kategori'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async createKategori(newKategori: any) {
            this.loading = true
            this.error = null
            try {
                await createKategori(newKategori)
                await this.fetchKategori()
            } catch (err) {
                this.error = 'Gagal menambahkan Produk'
                console.error(err)
            } finally {
                this.loading = false
            }
        },
    },

   
});