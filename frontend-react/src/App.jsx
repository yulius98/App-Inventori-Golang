import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import InventoryAdminPage from './page/InventoryAdminPage'
import DashboardAdminPage from './page/DashboardAdminPage'
import TambahStokBarangAdminPage from './page/TambahStokBarangAdminPage'
import KategoriAdminPage from './page/KategoriAdminPage'
import SettingAdminPage from './page/SettingAdminPage'
import LoginPage from './page/LoginPage'
import CashierPage from './page/CashierPage'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/kategori' element={<KategoriAdminPage />} />
        <Route path='/inventory' element={<InventoryAdminPage />} />
        <Route path='/dashboard' element={<DashboardAdminPage/>} />
        <Route path='/addstok' element={<TambahStokBarangAdminPage/>}/>
        <Route path='/setting' element={<SettingAdminPage/>}/>
        <Route path='/kasir' element={<CashierPage/>}/>
        {/* Tambahkan route lain di sini jika diperlukan */}
      </Routes>
        
    </Router>
  )
}

export default App
