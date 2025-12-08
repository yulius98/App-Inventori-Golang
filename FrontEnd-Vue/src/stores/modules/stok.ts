import { defineStore } from "pinia";
import { addStok, getStok } from "@/api/stokService";
import type { Stok } from "@/api/stokService";

export const useStokStore = defineStore('stok',{
    state: ()=>({
        stokList:[] as Stok[],
        loading: false,
        error: '' as string | null
    }),

    actions: {
        async fetchStok() {
            this.loading = true
            this.error = null
            try {
               this.stokList = await getStok()
            } catch (err) {
                this.error = 'Gagal mengambil data Stok'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async tambahStok(newStok: any) {
            this.loading = true
            this.error = null
            try {
                await addStok(newStok)
                // fetchStok akan dipanggil dari komponen setelah redirect jika diperlukan
            } catch (err) {
                this.error = 'Gagal menambahkan Stok'
                console.error(err)
                throw err
            } finally {
                this.loading = false
            }
        },
    },

   
});