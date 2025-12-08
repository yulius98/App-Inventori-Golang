import { createRouter, createWebHistory } from 'vue-router'
import ProdukListView from '@/views/ProdukListView.vue';
import ProdukFormView from '@/views/ProdukFormView.vue';
import KategoriListView from '@/views/KategoriListView.vue';

const routes = [
    { path: '/', component: ProdukListView },
    { path: '/produk', component: ProdukListView },
    { path: '/produk/add', component: ProdukFormView },
    { path: '/produk/edit/:id', component: ProdukFormView },
    { path: '/produk/search', component: ProdukListView},
    { path: '/kategori', component: KategoriListView},
]

const router = createRouter ({
    history: createWebHistory(),
    routes
})

export default router;
