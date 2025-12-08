<template>
  <NavBar/>
  <div class=" min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold mb-4 justify-between">{{ isSalesOrder? 'Sales Order' : 'Daftar Produk' }}</h1>
          
          <div class="flex items-center justify-between gap-2">
            
            <div class="flex items-center gap-2" v-if="!isSalesOrder">
              <el-button type="primary" @click="drawer = true">
                <el-icon><Plus/></el-icon>
                Tambah Produk
              </el-button>  
              <!--
              <router-link to="/Produk/add">
                <button class="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 rounded-lg shadow-md transition">
                  <el-icon><Plus /></el-icon>
                  Tambah Produk
                </button>
              </router-link>
              -->
            </div>
            
            <!-- Modal drawer Produk-->
            <el-drawer v-model="drawer" direction="rtl" size="50%">
              <FormProduk :produk="produkEdit" @success="handleSuccess" @cancel="drawer = false"/>
            </el-drawer>

            <!-- Modal drawer Stok-->
            <el-drawer v-model="drawerStok" direction="rtl" size="50%">
              <AddStok :produk="produkStok" @success="handleStokSuccess" @cancel="drawerStok = false" />
            </el-drawer>

            <!-- Modal Sales Order -->
            <el-drawer v-model="drawerSalesOrder" direction="rtl" size="50%">
              <SalesOrder :produk="produkSalesOrder" @success="handleSalesOrderSuccess" @cancel="drawerSalesOrder = false" />
            </el-drawer>



            <div class="flex items-center gap-2 mr-2">
              <el-input 
                v-model="query.Search" 
                style="width: 240px" 
                placeholder="Cari Produk atau Kategori..." 
                clearable
                @input="debouncedSearch"
                @clear="debouncedSearch">
                <template #prefix>
                  <el-icon><Search/></el-icon>
              </template>
              </el-input>
            </div>
          
          </div>
        </div>

      </div>
      <el-alert v-if="error" title="Error" type="error" class="mb-4" :closable="false"> {{ error }}</el-alert>
      <el-table v-loading="loading" :data="produkList" style="width: 100%; padding-top: 0.2cm" border >
        <el-table-column label="No" width="45">
          <template #default="scope">
            {{ scope.$index+1 }}
          </template>
        </el-table-column>
        <el-table-column prop="kategori" label="Kategori" width="150" sortable />
        <el-table-column prop="nama" label="Nama Produk" width="250" sortable />
        <el-table-column prop="stok" label="Stock" width="100" sortable />
        <el-table-column prop="keterangan" label="Keterangan" width="350" />
        <el-table-column prop="price" label="Harga" width="150" sortable >
          <template #default="scope">
              {{ formatRupiah(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="250">
          <template #default="scope">
            <!--
            <router-link :to="`/produk/edit/${scope.row.id}`">
              <el-button size="small" type="warning">Edit</el-button>
            </router-link>
            -->
            <el-button v-if="isSalesOrder" size="small" type="primary" @click="openSalesOder(scope.row)">Sales Order</el-button>
            <el-button v-if="!isSalesOrder" size="small" type="primary" @click="openAddStok(scope.row)">Add Stok</el-button>
            <el-button v-if="!isSalesOrder" size="small" type="warning" @click="editProduk(scope.row)">Edit</el-button>
            <el-button v-if="!isSalesOrder" size="small" type="danger" @click="hapus(scope.row.id)">Hapus</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProdukStore } from '@/stores/modules/produk'
import { ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import ProdukFormView from './ProdukFormView.vue'
import FormProduk from '@/components/FormProduk.vue'
import AddStok from '@/components/AddStok.vue'
import NavBar from '@/components/NavBar.vue'
import SalesOrder from '@/components/SalesOrder.vue'


const store = useProdukStore()
const { produkList, loading, error } = storeToRefs(store)
const route = useRoute()
const input = ref('')
const query = ref({ Search: '' })
const drawer = ref(false)
const drawerStok = ref(false)
const drawerSalesOrder = ref(false)
const produkEdit = ref(null)
const produkStok = ref(null)
const produkSalesOrder = ref(null)
const isSalesOrder = computed(() => route.query.isSalesOrder === 'true' )

const editProduk = (row) => {
  produkEdit.value = { ...row }
  drawer.value = true
}

const openAddStok = (row) => {
  produkStok.value = { ...row}
  drawerStok.value = true
}

const openSalesOder = (row) => {
  produkSalesOrder.value = { ...row}
  drawerSalesOrder.value = true
}

const handleSuccess = () => {
  drawer.value = false
  store.fetchProduk()
}

const handleStokSuccess = () => {
  drawerStok.value = false
  store.fetchProduk()
}

const handleSalesOrderSuccess = () => {
  drawerSalesOrder.value = false
  store.fetchProduk()
}


// Debounced search function
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (query.value.Search.trim()) {
      // Use smart search: search nama first, then kategori if not found
      store.smartSearch(query.value.Search)
    } else {
      store.fetchProduk()
    }
  }, 500)
}

onMounted(async () => {
  if (route.query.nama || route.query.kategori) {
    const nama = route.query.nama || ''
    const kategori = route.query.kategori || ''
    await store.searchProduk(nama, kategori)
  } else {
    store.fetchProduk()
  }
})

const hapus = (id) => {
  ElMessageBox.confirm('Yakin ingin menghapus produk ini?', 'Konfirmasi', {
    type: 'warning'
  }).then(() => {
    store.deleteProduk(id)
  })
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(angka)
}
</script>