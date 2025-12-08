<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Produk' : 'Tambah Produk' }}</h1>
    
    <el-form :model="form" label-width="120px" class="max-w-xl">
      <el-form-item label="Nama Produk">
        <el-input v-model="form.nama" placeholder="Masukkan nama produk" />
      </el-form-item>
      
      <el-form-item label="Kategori">
        <el-select 
          v-model="form.id_kategori"
          placeholder="-- Pilih Kategori --">
          <el-option 
            v-for="kat in kategoriList" 
            :key="kat.id" 
            :label="kat.kategori" 
            :value="kat.id" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Keterangan">
        <el-input 
          v-model="form.keterangan" 
          type="textarea" 
          :rows="3"
          placeholder="Masukkan keterangan produk" 
        />
        
      </el-form-item>
      
      <el-form-item label="Harga">
        <el-input 
          v-model.number="form.price" 
          type="number" 
          placeholder="Masukkan harga"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="simpan" :loading="loading">
          {{ isEdit ? 'Update' : 'Simpan' }}
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
import { useKategoriStore } from '@/stores/modules/kategori'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useProdukStore()
const kategoriStore = useKategoriStore()
const { kategoriList } = storeToRefs(kategoriStore)


const props = defineProps({
  produk: {
    type: Object,
    default: null
  }
})

const loading = ref(false)
const form = ref({
  id: null,
  nama: '',
  id_kategori: '',
  kategori: '',
  keterangan: '',
  price: 0
})

// Watch agar form terisi otomatis saat edit
watch(() => props.produk, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  } else {
    form.value = {
      id: null,
      nama: '',
      id_kategori: '',
      kategori: '',
      keterangan: '',
      price: 0
    }
  }
}, { immediate: true })

const isEdit = computed(() => !!props.produk)

onMounted(async () => {
  // Load kategori list
  await kategoriStore.fetchKategori()
  
  if (isEdit.value) {
    // Load data produk untuk edit
    const id = Number(route.params.id)
    const produk = await store.fetchProdukById(id)
    if (produk) {
      form.value = { ...produk }
    }
  }
})

const simpan = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await store.updateProduk(form.value.id, form.value)
      ElMessage.success('Produk berhasil diupdate')
    } else {
      await store.createProduk(form.value)
      ElMessage.success('Produk berhasil ditambahkan')
    }
    router.push('/')
  } catch (error) {
    console.error(error);
    ElMessage.error('Gagal menyimpan produk')
  } finally {
    loading.value = false
  }
}
</script>
