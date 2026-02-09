# 📦 Aplikasi Inventori Toko Golang

Aplikasi manajemen inventori toko modern yang dibangun menggunakan **Go (Golang)** untuk backend dan **React** untuk frontend. Aplikasi ini menyediakan sistem Point of Sale (POS), manajemen inventori lengkap, serta fitur multi-user dengan autentikasi berbasis JWT.

## 🚀 Fitur Utama

### 🔐 Autentikasi & Otorisasi
- **Login System**: Sistem login dengan JWT (JSON Web Token)
- **Multi-Role Access**: Support untuk role Admin dan Kasir dengan akses berbeda
- **Secure Authentication**: Password terenkripsi menggunakan bcrypt

### 👥 Manajemen User
- ✅ Tambah, edit, dan hapus user
- 🔍 Pencarian user
- 👤 Kelola role user (Admin/Kasir)

### 📦 Manajemen Produk
- ✅ Tambah, edit, hapus, dan lihat daftar produk
- 🔍 Pencarian produk berdasarkan nama
- 💰 Kelola harga produk
- 📝 Tambahkan keterangan produk
- 🏷️ Kategorisasi produk

### 📂 Manajemen Kategori
- ✅ Tambah, edit, dan hapus kategori
- 🔍 Pencarian kategori
- 📊 Lihat total barang per kategori
- 📋 Organisasi produk berdasarkan kategori

### 📊 Manajemen Stok
- ✅ Tambah, edit, dan hapus transaksi stok
- 🔍 Pencarian transaksi stok
- 📈 Tracking stok masuk (IN)
- 📉 Tracking stok keluar (OUT)
- 🔄 Tracking adjustment dan transfer
- 📅 Riwayat transaksi berdasarkan tanggal
- ✔️ Status transaksi (done/pending)

### 💳 Sistem Kasir (POS)
- 🛒 Keranjang belanja
- 💵 Proses pembayaran transaksi
- 🔍 Pencarian produk untuk kasir
- 👤 Pencarian belanja berdasarkan user
- 📊 Real-time stock update saat transaksi

### 📈 Dashboard & Laporan
- 📊 Dashboard admin dengan visualisasi data
- 📋 Data penjualan
- 📈 Laporan total barang per kategori

### 🎨 User Interface
- 📱 **Responsive Design**: Interface yang dapat diakses dari berbagai perangkat
- 🌙 **Theme Support**: Dark mode dan light mode
- 🎯 **Modern UI**: Design modern dengan Tailwind CSS
- 📊 **Charts & Visualization**: Visualisasi data dengan ApexCharts

## 🛠 Teknologi yang Digunakan

### Backend
- **Go (Golang)** - Programming language
- **Gorilla Mux** - HTTP router dan URL matcher
- **GORM** - ORM untuk operasi database
- **MySQL** - Database relasional
- **JWT (JSON Web Token)** - Autentikasi
- **Bcrypt** - Enkripsi password
- **godotenv** - Environment variable management
- **CORS Middleware** - Cross-Origin Resource Sharing

### Frontend
- **React 19.2.0** - Library JavaScript untuk UI
- **React Router DOM 7.13.0** - Routing untuk React
- **Vite 7.2.4** - Build tool dan dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Axios 1.13.4** - HTTP client untuk API calls
- **ApexCharts 5.3.6** - Library untuk chart dan visualisasi
- **Headless UI 2.2.9** - Komponen UI tanpa styling
- **Heroicons 2.2.0** - Icon set dari Tailwind

## 📋 Prasyarat

Pastikan Anda telah menginstall:

- [Go](https://golang.org/dl/) versi 1.20 atau lebih baru
- [Node.js](https://nodejs.org/) versi 20 atau lebih baru
- [MySQL](https://dev.mysql.com/downloads/) versi 8.0 atau lebih baru
- [Git](https://git-scm.com/) untuk clone repository

## 🚀 Cara Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/yulius98/App-Inventori-Golang.git
cd "App Inventori Toko Golang"
```

### 2. Setup Database MySQL

1. Pastikan MySQL server sudah berjalan

2. Buat file `.env` di folder `Backend/`:

**Windows (PowerShell):**
```powershell
cd Backend
New-Item .env -ItemType File
```

**Windows (Command Prompt):**
```cmd
cd Backend
type nul > .env
```

**Linux/Mac:**
```bash
cd Backend
touch .env
```

3. Isi file `.env` dengan konfigurasi database Anda:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_db
```

> **Catatan:** Database `inventory_db` akan dibuat secara otomatis saat pertama kali menjalankan aplikasi

### 3. Setup Backend (Go)

```bash
# Masuk ke direktori Backend
cd Backend

# Download dependencies
go mod download

# Jalankan aplikasi (database akan dibuat otomatis)
go run main.go
```

Backend akan berjalan di `http://localhost:8080`

**Output yang diharapkan:**
```
Connecting to MySQL server...
Creating database 'inventory_db' if not exists...
Database 'inventory_db' created or already exists
Connecting to database...
Database connected successfully!
Running AutoMigrate...
AutoMigrate completed successfully!
Server starting on :8080
```

### 4. Setup Frontend (React)

Buka terminal baru:

```bash
# Masuk ke direktori frontend-react
cd frontend-react

# Install dependencies
npm install
```

**Konfigurasi API URL (Opsional)**

Jika backend berjalan di port berbeda, edit file API configuration:

[frontend-react/src/service/Api.jsx](frontend-react/src/service/Api.jsx)
```javascript
const BASE_URL = 'http://localhost:8080'; // Sesuaikan dengan port backend Anda
```

```bash
# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (default Vite port)

## 🔧 Cara Menggunakan Aplikasi

### 1. Login ke Aplikasi

1. Buka browser dan akses `http://localhost:5173`
2. Anda akan diarahkan ke halaman login
3. Masukkan email dan password

**Default User (Anda perlu membuat user terlebih dahulu melalui API atau database):**

Untuk membuat user pertama, Anda bisa menggunakan API endpoint atau langsung melalui database MySQL:

```sql
-- Buat user admin pertama (password: admin123)
-- Password hash untuk "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMye5IcR6SbgLZG.1kR3gQgx.1kR3gQgxXy
INSERT INTO users (user_name, email, password, role, created_at, updated_at) 
VALUES ('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye5IcR6SbgLZG.1kR3gQgx.1kR3gQgxXy', 'admin', NOW(), NOW());
```

**Atau gunakan API:**
```bash
curl -X POST http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Navigasi Aplikasi

#### 👨‍💼 Untuk Admin:

Setelah login sebagai admin, Anda akan memiliki akses ke:

1. **Dashboard** (`/dashboard`)
   - Lihat ringkasan data inventori
   - Visualisasi data dengan chart
   - Statistik produk dan kategori

2. **Inventory Management** (`/inventory`)
   - Lihat daftar semua produk
   - Tambah produk baru
   - Edit detail produk (nama, harga, kategori, keterangan)
   - Hapus produk
   - Cari produk

3. **Kategori Management** (`/kategori`)
   - Lihat daftar kategori
   - Tambah kategori baru
   - Edit kategori
   - Hapus kategori
   - Cari kategori
   - Lihat total barang per kategori

4. **Manage Stok** (`/addstok`)
   - Tambah transaksi stok baru
   - Input stok masuk (IN)
   - Input stok keluar (OUT)
   - Adjustment stok
   - Transfer stok
   - Lihat riwayat transaksi stok
   - Edit dan hapus transaksi

5. **Settings** (`/setting`)
   - Kelola user
   - Tambah user baru (admin/kasir)
   - Edit user
   - Hapus user
   - Cari user

#### 👨‍💻 Untuk Kasir:

Setelah login sebagai kasir, Anda akan memiliki akses ke:

1. **Kasir/POS** (`/kasir`)
   - Lihat daftar produk yang tersedia
   - Cari produk untuk dijual
   - Tambah produk ke keranjang belanja
   - Proses pembayaran
   - Cetak atau simpan struk transaksi

### 3. Workflow Umum

#### Mengelola Inventory:

```
1. Tambah Kategori → 2. Tambah Produk → 3. Input Stok Masuk → 4. Siap Dijual
```

**Langkah detail:**

1. **Setup Kategori**
   - Buka menu Kategori
   - Klik "Tambah Kategori"
   - Masukkan nama kategori (contoh: "Makanan", "Minuman", "Elektronik")
   - Simpan

2. **Tambah Produk**
   - Buka menu Inventory
   - Klik "Tambah Produk"
   - Isi form:
     - Nama produk
     - Kategori (pilih dari dropdown)
     - Harga jual
     - Keterangan (opsional)
   - Simpan

3. **Input Stok**
   - Buka menu Manage Stok
   - Klik "Tambah Stok"
   - Isi form:
     - Tanggal transaksi
     - Produk (pilih dari dropdown)
     - Tipe pergerakan: pilih "IN" untuk stok masuk
     - Jumlah/quantity
     - Status: "done" atau "pending"
   - Simpan

#### Transaksi Penjualan (Kasir):

```
1. Cari Produk → 2. Tambah ke Keranjang → 3. Proses Pembayaran → 4. Selesai
```

**Langkah detail:**

1. **Login sebagai Kasir**
   - Login dengan akun role "kasir"

2. **Pilih Produk**
   - Gunakan search bar untuk mencari produk
   - Atau scroll list produk yang tersedia

3. **Tambah ke Keranjang**
   - Klik produk yang ingin dijual
   - Masukkan jumlah/quantity
   - Produk akan masuk ke keranjang belanja

4. **Proses Pembayaran**
   - Review items di keranjang
   - Pastikan jumlah dan total harga benar
   - Klik "Bayar" atau "Process Payment"
   - Transaksi selesai, stok akan otomatis berkurang

### Menjalankan Aplikasi (Development)

**Terminal 1 - Backend:**
```bash
cd Backend
go run main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm run dev
```

Akses aplikasi di browser: `http://localhost:5173`

### Build untuk Production

#### Backend:
```bash
cd Backend
go build -o inventory-backend.exe main.go
# Jalankan
./inventory-backend.exe
```

#### Frontend:
```bash
cd frontend-react
npm run build
# Preview build
npm run preview
```

## 📖 API Endpoints

### 🔐 Authentication
- `POST /login` - Login user (mendapatkan JWT token)

### 👤 User Management
- `GET /user` - Ambil semua user
- `POST /user` - Tambah user baru
- `PUT /user/{id}` - Update user
- `DELETE /user/{id}` - Hapus user
- `GET /user/search/` - Cari user

### 📦 Produk
- `GET /produk` - Ambil semua produk
- `POST /produk` - Tambah produk baru
- `PUT /produk/{id}` - Update produk
- `DELETE /produk/{id}` - Hapus produk
- `GET /produk/search/` - Cari produk

### 📂 Kategori
- `GET /kategori` - Ambil semua kategori (dengan pagination)
- `GET /allkategori` - Ambil semua kategori (tanpa pagination)
- `POST /kategori` - Tambah kategori baru
- `PUT /kategori/{id}` - Update kategori
- `DELETE /kategori/{id}` - Hapus kategori
- `GET /kategori/search/` - Cari kategori
- `GET /kategori/total-barang` - Ambil total barang per kategori

### 📊 Stok
- `GET /stok` - Ambil semua transaksi stok
- `POST /stok` - Tambah transaksi stok baru
- `PUT /stok/{id}` - Update transaksi stok
- `DELETE /stok/{id}` - Hapus transaksi stok
- `GET /stok/search/` - Cari transaksi stok

### 💳 Kasir
- `GET /kasir` - Ambil semua produk untuk kasir
- `GET /kasir/search` - Cari produk di kasir
- `GET /belanja/user/{name}` - Ambil belanja berdasarkan username
- `PUT /kasir/bayar/{username}` - Proses pembayaran transaksi

### 📈 Data Penjualan
- `GET /penjualan/` - Ambil data penjualan

### 🔒 Protected Route
- `GET /profile` - Endpoint yang memerlukan JWT token (contoh)

### Contoh Request dengan JWT:
```bash
# Login terlebih dahulu
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response akan berisi token
# {
#   "message": "Login berhasil",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# Gunakan token untuk akses protected routes
curl -X GET http://localhost:8080/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📁 Struktur Proyek

```
App Inventori Toko Golang/
├── README.md                    # Dokumentasi proyek
├── Backend/                     # Backend API (Golang)
│   ├── main.go                 # Entry point aplikasi
│   ├── go.mod                  # Go modules dependencies
│   ├── CORS_README.md          # Dokumentasi CORS configuration
│   ├── .env                    # Environment variables (buat manual)
│   ├── controllers/            # Controllers untuk business logic
│   │   └── auth_controller.go # Authentication controller
│   ├── database/               # Database configuration
│   │   └── db.go              # Database connection & auto-migration
│   ├── handlers/               # HTTP request handlers
│   │   ├── categori_handlers.go          # Kategori CRUD
│   │   ├── data_penjualan_handlers.go    # Data penjualan
│   │   ├── kasir_handlers.go             # Kasir/POS handlers
│   │   ├── options_handler.go            # CORS preflight handler
│   │   ├── produk_handlers.go            # Produk CRUD
│   │   ├── stok_handlers.go              # Stok management
│   │   ├── total_barang_per_kategori.go  # Reporting handler
│   │   └── user_handlers.go              # User management
│   ├── middleware/             # HTTP middlewares
│   │   ├── cors.go            # CORS middleware
│   │   └── jwt_middleware.go  # JWT authentication middleware
│   ├── models/                 # Data models
│   │   └── inventory.go       # Database models (User, Produk, Stock, Category)
│   ├── routes/                 # Routing configuration
│   │   └── routes.go          # API routes definition
│   └── utils/                  # Utility functions
│       └── jwt.go             # JWT token generation & validation
│
└── frontend-react/             # Frontend UI (React)
    ├── index.html             # HTML template
    ├── package.json           # NPM dependencies
    ├── vite.config.js         # Vite configuration
    ├── eslint.config.js       # ESLint configuration
    ├── README.md              # Frontend documentation
    ├── TODO.md                # Todo list
    ├── public/                # Static assets
    ├── src/                   # Source code
    │   ├── main.jsx          # Entry point React
    │   ├── App.jsx           # Root component & routing
    │   ├── index.css         # Global styles
    │   ├── components/       # Reusable React components
    │   │   ├── SideBar.jsx          # Sidebar navigation
    │   │   ├── TopBar.jsx           # Top bar untuk admin
    │   │   └── TopBarKasir.jsx      # Top bar untuk kasir
    │   ├── context/          # React Context
    │   │   └── ThemeContext.jsx     # Theme management (dark/light mode)
    │   ├── page/             # Page components
    │   │   ├── LoginPage.jsx                    # Halaman login
    │   │   ├── DashboardAdminPage.jsx          # Dashboard admin
    │   │   ├── InventoryAdminPage.jsx          # Manajemen produk
    │   │   ├── KategoriAdminPage.jsx           # Manajemen kategori
    │   │   ├── TambahStokBarangAdminPage.jsx   # Manajemen stok
    │   │   ├── SettingAdminPage.jsx            # Settings & user management
    │   │   └── CashierPage.jsx                 # Halaman kasir/POS
    │   └── service/          # API services
    │       └── Api.jsx       # Axios configuration & API calls
```

## 🗄️ Database Schema

### Table: users
```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),      -- Encrypted with bcrypt
  role VARCHAR(50),           -- 'admin' or 'kasir'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Table: produks
```sql
CREATE TABLE produks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255),          -- Nama produk
  id_kategori INT,            -- Foreign key ke categories
  user_name VARCHAR(255),     -- User yang input
  keterangan TEXT,            -- Deskripsi produk
  price DECIMAL(10,2),        -- Harga jual
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Table: categories
```sql
CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kategori VARCHAR(255),      -- Nama kategori
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Table: stocks
```sql
CREATE TABLE stocks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tgl_trx TIMESTAMP,          -- Tanggal transaksi
  id_produk INT,              -- Foreign key ke produks
  id_kategori INT,            -- Foreign key ke categories
  user_name VARCHAR(255),     -- User yang input
  movement_type VARCHAR(50),  -- 'IN', 'OUT', 'ADJUST', 'TRANSFER'
  quantity INT,               -- Jumlah barang
  status VARCHAR(50),         -- 'done', 'pending'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

## 🐛 Troubleshooting

### Masalah Umum & Solusi

#### 1. **Database Connection Error**

**Error:** `Failed to connect to MySQL server`

**Solusi:**
- Pastikan MySQL server sedang berjalan
- Periksa konfigurasi di file `.env` 
- Test koneksi MySQL dengan command:
  ```bash
  mysql -u root -p
  ```
- Pastikan username dan password di `.env` benar
- Cek apakah port 3306 tidak diblokir firewall

#### 2. **Port Already in Use**

**Error Backend:** `bind: address already in use`
```bash
# Windows - Cek port 8080
netstat -ano | findstr :8080
# Kill process
taskkill /PID <PID_NUMBER> /F
```

**Error Frontend:** `Port 5173 is in use`
- Vite akan otomatis mencari port lain
- Atau ubah port di `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000  // Ganti dengan port yang diinginkan
  }
})
```

#### 3. **CORS Issues**

**Error:** `Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solusi:**
- Pastikan CORS middleware sudah dikonfigurasi di backend
- Periksa [Backend/middleware/cors.go](Backend/middleware/cors.go)
- CORS middleware harus diterapkan ke semua routes
- Restart backend setelah perubahan CORS

#### 4. **JWT Token Error**

**Error:** `Token invalid` atau `Unauthorized`

**Solusi:**
- Pastikan token JWT disimpan dengan benar di frontend
- Cek apakah token di-attach ke header request:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```
- Token mungkin expired, login ulang
- Periksa secret key di [Backend/utils/jwt.go](Backend/utils/jwt.go)

#### 5. **Dependencies Error**

**Backend Error:** `package not found`
```bash
cd Backend
go mod tidy
go mod download
```

**Frontend Error:** `Cannot find module`
```bash
cd frontend-react
rm -rf node_modules
rm package-lock.json
npm install
```

#### 6. **Auto Migration Fail**

**Error:** `AutoMigrate failed`

**Solusi:**
- Pastikan database `inventory_db` sudah dibuat
- Cek koneksi database
- Manual create database:
  ```sql
  CREATE DATABASE IF NOT EXISTS inventory_db 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Periksa privilege user MySQL:
  ```sql
  GRANT ALL PRIVILEGES ON inventory_db.* TO 'your_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

#### 7. **Build Error Frontend**

**Error:** Build fails

**Solusi:**
```bash
cd frontend-react
# Clear cache
rm -rf node_modules/.vite
npm run build
```

#### 8. **Environment Variables Not Loaded**

**Error:** Database config kosong

**Solusi:**
- Pastikan file `.env` ada di folder `Backend/`
- Pastikan format file `.env` benar (tidak ada spasi extra)
- Restart aplikasi setelah mengubah `.env`
- Cek apakah package `godotenv` terinstall:
  ```bash
  go get github.com/joho/godotenv
  ```

## 🔐 Keamanan

⚠️ **Penting untuk Production:**

1. **Ganti JWT Secret Key**
   - Edit [Backend/utils/jwt.go](Backend/utils/jwt.go)
   - Gunakan secret key yang kuat dan unik
   - Jangan hard-code, gunakan environment variable

2. **Gunakan HTTPS**
   - Setup SSL/TLS certificate
   - Gunakan reverse proxy (nginx, apache)

3. **Database Security**
   - Jangan gunakan `root` user untuk aplikasi
   - Buat dedicated user dengan privilege minimal
   - Gunakan strong password

4. **Environment Variables**
   - Jangan commit file `.env` ke git
   - Tambahkan `.env` ke `.gitignore`
   - Gunakan secret management untuk production

5. **CORS Configuration**
   - Di production, set specific origin, jangan gunakan wildcard `*`
   - Contoh:
   ```go
   w.Header().Set("Access-Control-Allow-Origin", "https://yourdomain.com")
   ```

## 🚀 Deployment

### Backend (Golang)

**Build:**
```bash
cd Backend
go build -o inventory-backend.exe main.go
```

**Deploy ke server:**
- Upload binary `inventory-backend.exe` dan file `.env`
- Setup systemd service (Linux) atau Windows Service
- Gunakan reverse proxy (nginx)

### Frontend (React)

**Build:**
```bash
cd frontend-react
npm run build
```

File build ada di folder `dist/`. Upload ke:
- Static hosting (Netlify, Vercel, GitHub Pages)
- Web server (nginx, apache)
- CDN

**Nginx config example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

## 📚 Dokumentasi Tambahan

- [CORS Configuration](Backend/CORS_README.md)
- [Frontend TODO](frontend-react/TODO.md)
- [React Documentation](https://react.dev/)
- [Go Documentation](https://golang.org/doc/)
- [GORM Documentation](https://gorm.io/)

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

**Guideline:**
- Ikuti style code yang ada
- Tambahkan test jika diperlukan
- Update dokumentasi jika menambah fitur
- Gunakan commit message yang jelas

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Authentication dengan JWT
- ✅ Multi-role system (Admin, Kasir)
- ✅ CRUD User, Produk, Kategori, Stok
- ✅ Sistem Kasir/POS
- ✅ Dashboard dengan visualisasi data
- ✅ Dark/Light theme
- ✅ Responsive design

## 📄 Lisensi

Proyek ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Author

**Yulius**
- GitHub: [@yulius98](https://github.com/yulius98)
- Repository: [App-Inventori-Golang](https://github.com/yulius98/App-Inventori-Golang)

## 📞 Support

Jika Anda memiliki pertanyaan, saran, atau menemukan bug:

1. Buat [Issue](https://github.com/yulius98/App-Inventori-Golang/issues) di GitHub
2. Sertakan detail error/masalah
3. Lampirkan screenshot jika perlu

## 🙏 Acknowledgments

- [Go](https://golang.org/) - Backend programming language
- [React](https://react.dev/) - Frontend library
- [GORM](https://gorm.io/) - ORM library
- [Gorilla Mux](https://github.com/gorilla/mux) - HTTP router
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [ApexCharts](https://apexcharts.com/) - Charting library

---

**📦 Happy Coding! 🚀**

*Dibuat dengan ❤️ menggunakan Go dan React*