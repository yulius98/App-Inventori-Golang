<template>
  <el-menu
    :default-active="activeIndex2"
    class="el-menu-demo flex justify-center items-center"
    mode="horizontal"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleSelect"
  >
    <router-link to="/">
      <el-menu-item index="2">Daftar Produk</el-menu-item>
    </router-link>
    <router-link to="/kategori">
      <el-menu-item index="2">Kategori</el-menu-item>
    </router-link>
    <router-link :to="{ path: '/produk', query: { isSalesOrder: 'true' } }">
      <el-menu-item index="3">Sales Order</el-menu-item>
    </router-link>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

//const activeIndex = ref('1')
const activeIndex2 = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}



</script>

