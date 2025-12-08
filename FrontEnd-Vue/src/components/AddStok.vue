<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">{{ 'Tambah Stock' }}</h1>
    
    <el-form :model="form" label-width="120px" class="max-w-xl">
      <el-form-item label="Tanggal Transaksi">
        <el-input v-model="form.tgl_trx" readonly />
      </el-form-item>  
      
      <el-form-item label="Nama Produk">
        <el-input v-model="form.nama" placeholder="Masukkan nama produk" readonly />
      </el-form-item>
      
      <el-form-item label="ID Produk" hidden>
        <el-input v-model="form.id_produk" hidden />
      </el-form-item>
      
      <el-form-item label="ID Kategori" hidden>
        <el-input v-model="form.id_kategori" hidden />
      </el-form-item>     
      
      
      <el-form-item label="Add Stock">
        <el-input 
          v-model.number="form.quantity" 
          type="number" 
          placeholder="Masukkan jumlah Stok"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="simpan" :loading="loading">
          Simpan
        </el-button>
        <el-button @click="$emit('cancel')">Batal</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProdukStore } from '@/stores/modules/produk'
import { useStokStore } from '@/stores/modules/stok'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useProdukStore()
const stokStore = useStokStore()
const { stokList } = storeToRefs(stokStore)


const props = defineProps({
  produk: {
    type: Object,
    default: null
  },
})

const emit = defineEmits(['cancel', 'success'])

const loading = ref(false)
const today = new Date();
const tgl_trx = today.toISOString().slice(0, 10); // format YYYY-MM-DD
const form = ref({
  id: null,
  nama: '',
  id_kategori: '',
  price: 0,
  tgl_trx: tgl_trx,
  id_produk: '',
  quantity: 0
})

// Watch agar form terisi otomatis saat edit
watch(() => props.produk, (newVal) => {
  if (newVal) {
    form.value = {
      ...form.value,
      ...newVal,
      id_produk: newVal.id || newVal.id_produk || '',
      id_kategori: newVal.id_kategori || '',
      nama: newVal.nama || '',
      kategori: newVal.kategori || '',
      keterangan: newVal.keterangan || '',
      price: newVal.price || 0,
      quantity: 0
    }
  } else {
    form.value = {
      id: null,
      nama: '',
      id_kategori: '',
      kategori: '',
      keterangan: '',
      price: 0,
      tgl_trx: tgl_trx,
      id_produk: '',
      quantity: 0
    }
  }
}, { immediate: true })

onMounted(async () => {
  const id = Number(route.params.id)
  const produk = await store.fetchProdukById(id)
  if (produk) {
    form.value = { ...produk }
  }
  
})


const simpan = async () => {
  loading.value = true
  // Ambil data terbaru dari form
  const payload = {
    id_kategori: Number(form.value.id_kategori),
    id_produk: Number(form.value.id_produk),
    movement_type: 'IN',
    quantity: Number(form.value.quantity),
    tgl_trx: form.value.tgl_trx
  }
  try {
    await stokStore.tambahStok(payload)
    ElMessage.success('Stok produk berhasil ditambahkan')
    emit('success')
  } catch (error) {
    //console.error('Error details:', error)
    //console.error('Response data:', error.response?.data)
    //console.error('Response status:', error.response?.status)
    ElMessage.error(error.response?.data?.message || 'Gagal tambah stok')
  } finally {
    loading.value = false
  }
}
</script>
