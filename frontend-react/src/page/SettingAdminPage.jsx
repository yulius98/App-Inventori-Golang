import React, { useState, useEffect, useRef } from 'react'
import Api from '../service/Api'
import { SideBar } from '../components/SideBar'
import TopBar from '../components/TopBar'
import { useTheme } from '../context/ThemeContext'
import {
    PlusIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon,
    UserCircleIcon,
    SwatchIcon,
} from '@heroicons/react/24/outline'

const SettingAdminPage = () => {
    const { isDark, toggleTheme } = useTheme()
    const [user, setUser] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [totaluser, setTotalUser] = useState(0)
    const [, setTotalPage] = useState(1)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        password: '',
        role: '',
    })

    const fetchUserRef = useRef()

    // GET User
    useEffect(() => {
        let isMounted = true

        const fetchUser = async () => {
        try {
            const response = await Api.get(`/user?page=${page}&limit=${limit}`)

            if (!isMounted) return

            setUser(response.data.data || [])
            setTotalUser(response.data.total)
            setTotalPage(response.data.totalPages)
            setError("")
        } catch {
            if (isMounted) {
            setError("Gagal mengambil data user")
            }
        }
        }

        fetchUserRef.current = fetchUser;
        fetchUser()

        return () => {
        isMounted = false;
        }
    }, [page, limit])


    // CREATE
    const handleCreate = async (e) => {
        e.preventDefault()
        try {
        // Tampilkan data yang akan dikirim ke backend
        const dataToSend = {
            'user_name' : formData.user_name,
            'email': formData.email,
            'password' : formData.password,
            'role' : formData.role
        };
        await Api.post("/user", dataToSend)
        setShowForm(false)
        setFormData({
            user_name: '',
            email:'',
            password: '',
            role: '',
            
        })
        // Refresh produk table after create
        if (fetchUserRef.current) fetchUserRef.current()
        } catch (err) {
        setError("Gagal menambah user")
        // Tampilkan error detail dari backend jika ada
        console.log('Error response:', err)
        }
    };

    // Edit button (password dikosongkan; isi hanya jika user ingin mengubah)
    const handleEdit = (item) => {
        setEditId(item.id)
        setFormData({
            user_name: item.user_name || '',
            email: item.email || '',
            password: '',
            role: item.role || '',
        })
        setShowForm(true)
    }

    // UPDATE
    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
        const dataToSend = {
            'user_name' : formData.user_name,
            'email': formData.email,
            'password' : formData.password,
            'role' : formData.role
        }
        await Api.put(`/user/${editId}`, dataToSend)

        setShowForm(false)
        setEditId(null)
        setFormData({
            user_name: '',
            email:'',
            password: '',
            role: '',
            
        })
        
        if (fetchUserRef.current) fetchUserRef.current()
        } catch {
        setError("Gagal mengedit user")
        }
    }

    // DELETE
    const handleDelete = async (id) => {
        console.log ("user id yanng dihapus" ,id )
        if (!window.confirm(`Yakin hapus data ini?`)) return;
        try {
        
        await Api.delete(`/user/${id}`);

        setShowForm(false);
        setEditId(null);
        setFormData({
            user_name: '',
            email:'',
            password: '',
            role: '',
            
        });
        
        if (fetchUserRef.current) fetchUserRef.current();
        } catch {
        setError("Gagal menghapus user");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev,[name]:value}))
    }

    const totalPages = Math.max(1, Math.ceil(totaluser / limit))

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <SideBar />
            <div className="flex-1 ml-[200px] mt-16">
                <TopBar />

                <main className="p-6 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight flex items-center gap-2">
                            <UserCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            Daftar User
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola akun user dan pengaturan tampilan aplikasi.
                        </p>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Card: Toggle Tema */}
                    <div className="mb-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <SwatchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Tema Tampilan
                            </h2>
                        </div>
                        <div className="p-6 flex flex-wrap items-center justify-center sm:justify-between gap-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Pilih mode:
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${!isDark ? 'bg-amber-400 text-gray-900 ring-2 ring-amber-500 shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    title="Mode terang"
                                >
                                    <span aria-hidden>☀️</span>
                                    Terang
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isDark ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    title="Mode gelap"
                                >
                                    <span aria-hidden>🌙</span>
                                    Gelap
                                </button>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {isDark ? 'Gelap aktif' : 'Terang aktif'}
                            </span>
                        </div>
                    </div>

                    {/* Card: Form Tambah/Edit User */}
                    <div className="mb-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {editId ? 'Edit User' : 'Form User'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(!showForm)
                                    setEditId(null)
                                    setFormData({
                                        user_name: '',
                                        email: '',
                                        password: '',
                                        role: '',
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
                                        Tambah User
                                    </>
                                )}
                            </button>
                        </div>
                        {showForm && (
                            <form
                                onSubmit={editId ? handleUpdate : handleCreate}
                                className="p-6 pt-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            User Name
                                        </label>
                                        <input
                                            type="text"
                                            id="user_name"
                                            name="user_name"
                                            value={formData.user_name}
                                            onChange={handleChange}
                                            placeholder="Nama pengguna"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@contoh.com"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Password {editId && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={editId ? '••••••••' : 'Min. 6 karakter'}
                                            required={!editId}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="">Pilih Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                                    >
                                        {editId ? 'Simpan Perubahan' : 'Tambah User'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Card: Tabel User */}
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Daftar User
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Total: <span className="font-medium text-gray-700 dark:text-gray-300">{totaluser}</span> user
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full" id="tabel_produk">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700/50">
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-14">
                                            No
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            User Name
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                                            Password
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                                            Role
                                        </th>
                                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {user.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                                            >
                                                Belum ada data user. Klik &quot;Tambah User&quot; untuk menambah.
                                            </td>
                                        </tr>
                                    ) : (
                                        user.map((item, nourut) => (
                                            <tr
                                                key={item.id}
                                                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                                    {(page - 1) * limit + nourut + 1}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.user_name}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.email}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                                    ••••••
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                                        {item.role}
                                                    </span>
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
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {totaluser} user
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

export default SettingAdminPage
