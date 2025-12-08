<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">{{ 'Tambah Kategori' }}</h1>
    
    <el-form :model="form" label-width="120px" class="max-w-xl">
      <el-form-item label="Kategori">
        <el-input v-model="form.kategori" />
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
import { useKategoriStore } from '@/stores/modules/kategori'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useProdukStore()
const kategoriStore = useKategoriStore()
const stokStore = useStokStore()
const { stokList } = storeToRefs(stokStore)
const { kategoriList } = storeToRefs(kategoriStore)


const props = defineProps({
  produk: {
    type: Object,
    default: null
  },
})

const emit = defineEmits(['cancel', 'success'])

const loading = ref(false)
const form = ref({
  id: null,
  kategori: ''
})


const simpan = async () => {
  loading.value = true
  
  try {
    await kategoriStore.createKategori(form.value)
    ElMessage.success('Kategori berhasil ditambahkan')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Gagal tambah kategori')
  } finally {
    loading.value = false
  }
}
</script>
