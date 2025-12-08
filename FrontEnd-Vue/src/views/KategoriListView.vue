<template>
  <NavBar/>
  <div class=" min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold mb-4">Daftar Kategori</h1>
          
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <el-button type="primary" @click="drawerKategori = true">
                <el-icon><Plus/></el-icon>
                Tambah Kategori
              </el-button>
            </div>
            
            <!-- Modal drawer Kategori-->
            <el-drawer v-model="drawerKategori" direction="rtl" size="50%">
              <AddKategori @success="handleKategoriSuccess" @cancel="drawerKategori = false"/>
            </el-drawer>
          
          </div>
        </div>

      </div>
      <el-alert v-if="error" title="Error" type="error" class="mb-4" :closable="false"> {{ error }}</el-alert>
      <el-table v-loading="loading" :data="kategoriList" class="max-w-xs mx-auto" style="width: auto; padding-top: 0.2cm" border >
        <el-table-column label="No" width="50" align="center">
          <template #default="scope">
            {{ scope.$index+1 }}
          </template>
        </el-table-column>
        <el-table-column prop="kategori" label="Kategori" width="150" sortable />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKategoriStore } from '@/stores/modules/kategori'
import { useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import NavBar from '@/components/NavBar.vue'
import AddKategori from '@/components/AddKategori.vue'


const store = useKategoriStore()
const { kategoriList, loading, error } = storeToRefs(store)
const drawerKategori = ref(false)

const handleKategoriSuccess = () => {
  drawerKategori.value = false
  store.fetchKategori()
}

onMounted(async () => {
    store.fetchKategori()
    console.log("data kategor",store.fetchKategori)
})


</script>