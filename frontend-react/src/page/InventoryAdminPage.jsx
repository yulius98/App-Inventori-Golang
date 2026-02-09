import React, { useState, useEffect, useRef } from 'react'
import Api from '../service/Api'
import { SideBar } from '../components/SideBar'
import TopBar from '../components/TopBar'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const InventoryAdminPage = () => {

  const [produk, setProduk] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    id_kategori:'',
    kategori: '',
    price: '',
    keterangan:'',
  });
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [, setTotalPage ] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalproduk, setTotalProduk] = useState(0);

  // Ref to store fetchProduk so it can be called from anywhere
  const fetchProdukRef = useRef();

  // Edit button
  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      nama: item.nama || "",
      id_kategori: item.id_kategori || "",
      kategori: item.kategori || "",
      price: item.price || "",
      keterangan: item.keterangan || "",


    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == 'kategori' ) {
      setFormData(prev => ({ ...prev, kategori: value, id_kategori: value }));
    } else {
      setFormData(prev => ({ ...prev,[name]:value}));
    }
    
  };
 
  // Fetch produk function, can be called from anywhere
  useEffect(() => {
    let isMounted = true;

    const fetchProduk = async () => {
      try {
        const response = await Api.get(`/produk?page=${page}&limit=${limit}`);

        if (!isMounted) return;

        setProduk(response.data.data || []);
        setTotalProduk(response.data.total);
        setTotalPage(response.data.totalPages);
        setError("");
      } catch {
        if (isMounted) {
          setError("Gagal mengambil data Produk");
        }
      }
    };

    fetchProdukRef.current = fetchProduk;
    fetchProduk();

    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const resKategori = await Api.get(`/allkategori`);
        setKategori(resKategori.data);
        setError("");  
      } catch {
        setError("Gagal mengambil data Kategori");    
      }
    };
    fetchKategori();
  },[]);

  // CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Tampilkan data yang akan dikirim ke backend
      const dataToSend = {
        'nama' : formData.nama,
        'id_kategori': Number(formData.id_kategori),
        'keterangan' : formData.keterangan,
        'price' : Number(formData.price)
      };
      await Api.post("/produk", dataToSend);
      setShowForm(false);
      setFormData({
        nama: '',
        id_kategori:'',
        kategori: '',
        price: '',
        keterangan:'',
      });
      // Refresh produk table after create
      if (fetchProdukRef.current) fetchProdukRef.current();
    } catch (err) {
      setError("Gagal menambah produk");
      // Tampilkan error detail dari backend jika ada
      console.log('Error response:', err);
    }
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        'nama' : formData.nama,
        'id_kategori': Number(formData.id_kategori),
        'keterangan' : formData.keterangan,
        'price' : Number(formData.price)
      };
      await Api.put(`/produk/id=${editId}`, dataToSend);

      setShowForm(false);
      setEditId(null);
      setFormData({
        nama: '',
        id_kategori:'',
        kategori: '',
        price: '',
        keterangan:'',
        
      });
      
      if (fetchProdukRef.current) fetchProdukRef.current();
    } catch {
      setError("Gagal mengedit produk");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      
      await Api.delete(`/produk/${id}`);

      setShowForm(false);
      setEditId(null);
      setFormData({
        nama: '',
        id_kategori:'',
        kategori: '',
        price: '',
        keterangan:'',
        
      });
      
      if (fetchProdukRef.current) fetchProdukRef.current();
    } catch {
      setError("Gagal menghapus produk");
    }
  };



  const totalPages = Math.max(1, Math.ceil(totalproduk / limit))
  const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar />
      <div className="flex-1 ml-[200px] mt-16">
        <TopBar />

        <main className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Daftar Barang
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola produk: tambah, edit, atau hapus barang inventori.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Card: Form Tambah/Edit */}
          <div className="mb-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Edit Barang' : 'Form Barang'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(!showForm)
                  setEditId(null)
                  setFormData({
                    nama: '',
                    id_kategori: '',
                    kategori: '',
                    price: '',
                    keterangan: '',
                  })
                  setError('')
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              >
                {showForm ? (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    Tutup Form
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Tambah Barang
                  </>
                )}
              </button>
            </div>
            {showForm && (
              <form
                onSubmit={editId ? handleUpdate : handleCreate}
                className="p-6 pt-4"
              >
                <input
                  type="number"
                  id="id_kategori"
                  name="id_kategori"
                  value={formData.id_kategori}
                  onChange={handleChange}
                  className="hidden"
                  aria-hidden
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Kategori
                    </label>
                    <select
                      id="kategori"
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Pilih Kategori</option>
                      {kategori.map((item) => (
                        <option key={item.id} value={item.id}>{item.kategori}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Contoh: Buku Tulis"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      id="keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      placeholder="Opsional"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    {editId ? 'Simpan Perubahan' : 'Tambah Barang'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Card: Tabel Barang */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Daftar Barang
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-medium text-gray-700 dark:text-gray-300">{totalproduk}</span> barang
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" id="tabel_produk">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-14">
                      No
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                      Kategori
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                      Nama Produk
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                      Harga
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                      Keterangan
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-36">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {produk.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                      >
                        Belum ada data barang. Klik &quot;Tambah Barang&quot; untuk menambah.
                      </td>
                    </tr>
                  ) : (
                    produk.map((item, nourut) => (
                      <tr
                        key={item.id}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                          {(page - 1) * limit + nourut + 1}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-100">
                          {item.kategori}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.nama}
                        </td>
                        <td className="py-4 px-6 text-sm text-right tabular-nums text-gray-700 dark:text-gray-300">
                          {formatRupiah(item.price)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={item.keterangan || ''}>
                          {item.keterangan || '–'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              title="Hapus"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Hapus
                            </button>
                          </div>
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
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {totalproduk} barang
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default InventoryAdminPage

