# 📦 Aplikasi Inventori Golang

Aplikasi manajemen inventori modern yang dibangun menggunakan **Go** untuk backend dan **Vue.js** untuk frontend. Aplikasi ini menyediakan fitur lengkap untuk mengelola produk, kategori, dan stok barang.

## 🚀 Fitur Utama

- ✅ **Manajemen Produk**: Tambah, edit, hapus, dan lihat daftar produk
- 📂 **Manajemen Kategori**: Organisasi produk berdasarkan kategori
- 📊 **Manajemen Stok**: Pantau stok barang dengan transaksi pembelian dan penjualan
- 🔄 **Real-time Updates**: Interface yang responsif dengan update data real-time
- 🌐 **RESTful API**: Backend API yang terstruktur dan mudah digunakan
- 📱 **Responsive Design**: Interface yang dapat diakses dari berbagai perangkat

## 🛠 Teknologi yang Digunakan

### Backend
- **Go 1.25.1**
- **Gorilla Mux** - HTTP router
- **GORM** - ORM untuk database operations
- **MySQL** - Database
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **Vue.js 3.5.25** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vue Router 4.6.3** - Official router for Vue.js
- **Pinia 3.0.4** - State management
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios 1.13.2** - HTTP client
- **Element Plus 2.11.9** - UI component library

## 📋 Prasyarat

Pastikan Anda telah menginstall:

- [Go](https://golang.org/dl/) versi 1.20 atau lebih baru
- [Node.js](https://nodejs.org/) versi 20 atau lebih baru
- [MySQL](https://dev.mysql.com/downloads/) versi 8.0 atau lebih baru
- [Git](https://git-scm.com/) untuk clone repository

## 🚀 Cara Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd "App Inventori Golang"
```

### 2. Setup Database MySQL

1. Buka MySQL dan buat database baru:
```sql
CREATE DATABASE inventory_db;
```

2. Buat file `.env` di folder `Backend/`:
```bash
cd Backend
touch .env
```

3. Isi file `.env` dengan konfigurasi database:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_db
```

### 3. Setup Backend (Go)

```bash
# Masuk ke direktori Backend
cd Backend

# Download dependencies
go mod download

# Jalankan migrasi database (otomatis saat pertama kali run)
go run main.go
```

Backend akan berjalan di `http://localhost:8080`

### 4. Setup Frontend (Vue.js)

Buka terminal baru:

```bash
# Masuk ke direktori frontend
cd FrontEnd-Vue

# Install dependencies
npm install
# atau menggunakan yarn
yarn install

# Jalankan development server
npm run dev
# atau menggunakan yarn
yarn dev
```

Frontend akan berjalan di `http://localhost:5173` (default Vite port)

## 🔧 Penggunaan

### Menjalankan Aplikasi

1. **Jalankan Backend:**
```bash
cd Backend
go run main.go
```

2. **Jalankan Frontend:** (di terminal terpisah)
```bash
cd FrontEnd-Vue
npm run dev
```

3. Buka browser dan akses `http://localhost:5173`

### Build untuk Production

#### Backend:
```bash
cd Backend
go build -o inventory-backend main.go
./inventory-backend
```

#### Frontend:
```bash
cd FrontEnd-Vue
npm run build
npm run preview
```

## 📖 API Endpoints

### Produk
- `GET /api/produk` - Ambil semua produk
- `POST /api/produk` - Tambah produk baru
- `PUT /api/produk/{id}` - Update produk
- `DELETE /api/produk/{id}` - Hapus produk

### Kategori
- `GET /api/kategori` - Ambil semua kategori
- `POST /api/kategori` - Tambah kategori baru
- `PUT /api/kategori/{id}` - Update kategori
- `DELETE /api/kategori/{id}` - Hapus kategori

### Stok
- `GET /api/stok` - Ambil semua transaksi stok
- `POST /api/stok/beli` - Transaksi pembelian (tambah stok)
- `POST /api/stok/jual` - Transaksi penjualan (kurangi stok)

## 📁 Struktur Proyek

```
App Inventori Golang/
├── Backend/
│   ├── main.go              # Entry point aplikasi
│   ├── go.mod               # Go modules
│   ├── CORS_README.md       # Dokumentasi CORS
│   ├── database/
│   │   └── db.go           # Konfigurasi database
│   ├── handlers/            # Handler untuk setiap endpoint
│   │   ├── produk_handlers.go
│   │   ├── categori_handlers.go
│   │   ├── stok_handlers.go
│   │   └── options_handler.go
│   ├── middleware/
│   │   └── cors.go         # CORS middleware
│   ├── models/
│   │   └── inventory.go    # Model database
│   └── routes/
│       └── routes.go       # Routing konfigurasi
└── FrontEnd-Vue/
    ├── src/
    │   ├── App.vue          # Root component
    │   ├── main.ts          # Entry point
    │   ├── style.css        # Global styles
    │   ├── api/             # API service layer
    │   │   ├── kategoriService.ts
    │   │   ├── produkService.ts
    │   │   └── stokService.ts
    │   ├── components/      # Reusable Vue components
    │   │   ├── AddKategori.vue
    │   │   ├── AddStok.vue
    │   │   ├── FormProduk.vue
    │   │   ├── NavBar.vue
    │   │   └── SalesOrder.vue
    │   ├── helper/
    │   │   └── api_url.ts  # API URL configuration
    │   ├── router/
    │   │   └── index.ts    # Vue Router configuration
    │   ├── stores/          # Pinia state management
    │   │   ├── counter.ts
    │   │   └── modules/
    │   │       ├── kategori.ts
    │   │       ├── produk.ts
    │   │       └── stok.ts
    │   └── views/           # Page components
    │       ├── KategoriListView.vue
    │       ├── ProdukFormView.vue
    │       └── ProdukListView.vue
    ├── public/              # Static assets
    ├── package.json
    ├── vite.config.ts       # Vite configuration
    ├── tailwind.config.ts   # Tailwind CSS config
    └── tsconfig.json        # TypeScript configuration
```

## 🐛 Troubleshooting

### Masalah Umum

1. **Database Connection Error:**
   - Pastikan MySQL server berjalan
   - Periksa konfigurasi di file `.env`
   - Pastikan database `inventory_db` sudah dibuat

2. **Port Already in Use:**
   - Backend: Ubah port di `main.go` jika port 8080 sudah digunakan
   - Frontend: Vite akan otomatis mencari port yang tersedia (default 5173)

3. **CORS Issues:**
   - Pastikan backend CORS sudah dikonfigurasi dengan benar
   - Periksa file `middleware/cors.go`

4. **Dependencies Error:**
   - Backend: Jalankan `go mod tidy`
   - Frontend: Hapus `node_modules` dan jalankan `npm install` lagi

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Kontak

Jika Anda memiliki pertanyaan atau saran, silakan buat issue di repository ini.

---

**Happy Coding! 🎉**