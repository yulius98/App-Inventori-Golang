import React, { useState, useEffect, useRef } from 'react'
import Api from '../service/Api'
import { SideBar } from '../components/SideBar'
import TopBar from '../components/TopBar'
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const TambahStokBarangAdminPage = () => {

  const [error, setError] = useState("")
  const [stok, setStok] = useState([])
  const [totalStok, setTotalStok] = useState(0)
  const [page, setPage] = useState(1)
  const [, setTotalPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [keyword, setKeyword] = useState("")
  //const [id_produk, setIDProduk] = useState()
  //const [id_kategori, setIDKategori] = useState()
  const [formData, setFormData] = useState({
    kategori:'',
    produk:'',
    stok:'',
    price:'',
  })
  const [showForm, setShowForm] = useState(false)
  const [idproduk, setIDProduk] = useState(0)
  const [idkategori, setIDKategori] = useState(0)

  const fetchStokRef = useRef()
  const searchTimeout = useRef();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
  const dd = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${yyyy}-${mm}-${dd}`;

  
  
  useEffect(() => {
    let isMounted = true
    const fetchStok = async () => {
      try {
        const stok = await Api.get(`/stok?page=${page}&limit=${limit}`)

        if (!isMounted) return
        setStok(stok.data.data || [])
        setTotalStok(stok.data.total)
        setTotalPage(stok.data.totalPages)
        setError("")
      } catch {
        if (isMounted) {
          setError("Gagal menampilkan Daftar Produk")
        }
      }
    }
    fetchStokRef.current = fetchStok
    fetchStok()

    return() => {
      isMounted = false
    }
  },[page,limit])

  // Add Stok
  const handleAdd = async() => {
    try {
      const dataToSend = {
        'tgl_trx':formattedDate,
        'id_produk': idproduk,
        'id_kategori': idkategori,
        'movement_type':'IN',
        'quantity': Number(formData.stok),
      }
      console.log('data yang dikirim :',dataToSend)
      await Api.post(`/stok`,dataToSend)
      setShowForm(false)
      if (fetchStokRef.current) fetchStokRef.current()
    } catch {
      setError("Gagal tambah stok")
    }
  }




  // SEARCH
  const handleSearch = async (keyword) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setKeyword(keyword);
    searchTimeout.current = setTimeout(() => {
      if (keyword !== "") {
        searchStok(keyword);
      } else {
        // Jika kosong, tampilkan data default
        if (fetchStokRef.current) fetchStokRef.current();
      }
    }, 500);
  }

  const searchStok = async(keyword) => {
    try {
      const res =  await Api.get(`/stok/search/?produk=${keyword}`)
      console.log('Hasil search:', res.data);
      setStok(res.data || []);
      setTotalStok(res.data.total || 0);
      setTotalPage(res.data.totalPages || 1);
      setError("");

    } catch {
      setError("Gagal mencari produk")
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalStok / limit))
  const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar />
      <div className="flex-1 ml-[200px] mt-16">
        <TopBar />

        <main className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Tambah Stok Barang
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cari produk dan tambahkan stok masuk ke inventori.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Card: Daftar Produk & Tabel */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Daftar Produk
              </h2>
              <div className="relative w-full sm:w-80">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  id="search-dropdown"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Cari produk..."
                  value={keyword}
                  onChange={e => {
                    setKeyword(e.target.value)
                    handleSearch(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" id="tabel_produk">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                      Stok
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-36">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stok.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                      >
                        {keyword ? 'Tidak ada produk ditemukan.' : 'Belum ada data produk.'}
                      </td>
                    </tr>
                  ) : (
                    stok.map((item, nourut) => (
                      <tr
                        key={item.id_produk || nourut}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                          {(page - 1) * limit + nourut + 1}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                          {item.kategori}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.produk}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
                          {item.total_stock}
                        </td>
                        <td className="py-4 px-6 text-sm text-right text-gray-700 dark:text-gray-300 tabular-nums">
                          {formatRupiah(item.price)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(true)
                              setFormData({
                                kategori: item.kategori,
                                produk: item.produk,
                                stok: '',
                                price: item.price,
                                id_kategori: item.id_kategori,
                                id_produk: item.id_produk
                              })
                              setIDKategori(item.id_kategori)
                              setIDProduk(item.id_produk)
                              setError('')
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                            title="Tambah Stok"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Tambah Stok
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tampil per halaman:
                </span>
                <select
                  value={limit}
                  onChange={e => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 10, 20, 50].map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {totalStok} produk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>

          {/* Form Tambah Stok */}
          {showForm && (
            <div className="mt-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Tambah Stok
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ kategori: '', produk: '', stok: '', price: '' })
                    setError('')
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                  aria-label="Tutup form"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleAdd()
                }}
                className="p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Kategori
                    </label>
                    <input
                      type="text"
                      id="kategori"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      value={formData.kategori}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      id="produk"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      value={formData.produk}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Harga
                    </label>
                    <input
                      type="text"
                      id="price"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      value={formatRupiah(formData.price)}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="stok" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Jumlah Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="stok"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.stok}
                      placeholder="0"
                      min={1}
                      required
                      onChange={e => setFormData({ ...formData, stok: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Simpan Stok
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default TambahStokBarangAdminPage
