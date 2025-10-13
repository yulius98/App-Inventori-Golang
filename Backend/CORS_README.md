# CORS Configuration untuk Aplikasi Inventori Backend

## Perubahan yang Dibuat

### 1. Middleware CORS (`middleware/cors.go`)
- **Fungsi**: Menangani CORS headers dan preflight requests (OPTIONS method)
- **Headers yang diset**:
  - `Access-Control-Allow-Origin: *` (dalam production, ganti dengan domain spesifik Next.js)
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin`
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Max-Age: 86400` (cache preflight untuk 24 jam)
  - `Content-Type: application/json`

### 2. Handler OPTIONS (`handlers/options_handler.go`)
- Handler khusus untuk menangani preflight OPTIONS requests
- Mengembalikan status 200 OK untuk semua OPTIONS requests

### 3. Routes Update (`routes/routes.go`)
- Menambahkan middleware CORS ke semua routes
- Menambahkan handler OPTIONS untuk setiap endpoint
- Menggunakan `r.Use(middleware.CORSMiddleware)` untuk menerapkan CORS ke semua routes

### 4. Handler Improvements
Semua handlers telah diperbaiki dengan:
- Error handling yang lebih baik
- HTTP status codes yang tepat (200, 201, 404, 400, 500)
- Penghapusan duplikasi Content-Type headers
- Validasi input yang lebih robust

## Endpoints yang Tersedia

### Produk
- `GET /produk` - Mengambil semua produk dengan join kategori
- `POST /produk` - Membuat produk baru
- `GET /produk/search?nama={nama}` - Mencari produk berdasarkan nama
- `PUT /produk/{id}` - Update produk
- `DELETE /produk/{id}` - Hapus produk
- `OPTIONS /produk` - Preflight request untuk endpoint produk
- `OPTIONS /produk/search` - Preflight request untuk search produk
- `OPTIONS /produk/{id}` - Preflight request untuk update/delete produk

### Kategori
- `GET /kategori` - Mengambil semua kategori
- `POST /kategori` - Membuat kategori baru
- `PUT /kategori/{id}` - Update kategori
- `DELETE /kategori/{id}` - Hapus kategori
- `OPTIONS /kategori` - Preflight request untuk endpoint kategori
- `OPTIONS /kategori/{id}` - Preflight request untuk update/delete kategori

### Stok
- `GET /stok` - Mengambil data stok dengan join produk dan kategori
- `POST /stok` - Membuat entry stok baru
- `GET /stok/search?id_produk={id}` - Mencari stok berdasarkan ID produk
- `PUT /stok/{id}` - Update stok
- `DELETE /stok/{id}` - Hapus stok
- `OPTIONS /stok` - Preflight request untuk endpoint stok
- `OPTIONS /stok/search` - Preflight request untuk search stok
- `OPTIONS /stok/{id}` - Preflight request untuk update/delete stok

## Penggunaan dengan Next.js Frontend

### 1. Fetch API
```javascript
// GET request
const response = await fetch('http://localhost:8080/produk', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

// POST request
const response = await fetch('http://localhost:8080/produk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nama: 'Produk Baru',
    id_kategori: 1,
    keterangan: 'Deskripsi produk',
    price: 10000
  }),
});

// PUT request
const response = await fetch('http://localhost:8080/produk/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nama: 'Produk Updated',
    id_kategori: 1,
    keterangan: 'Deskripsi updated',
    price: 15000
  }),
});

// DELETE request
const response = await fetch('http://localhost:8080/produk/1', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Axios (jika digunakan)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET
const produk = await api.get('/produk');

// POST
const newProduk = await api.post('/produk', {
  nama: 'Produk Baru',
  id_kategori: 1,
  keterangan: 'Deskripsi',
  price: 10000
});

// PUT
const updated = await api.put('/produk/1', {
  nama: 'Updated',
  price: 15000
});

// DELETE
await api.delete('/produk/1');
```

## Konfigurasi untuk Production

### 1. Update CORS Origin
Dalam production, ganti `Access-Control-Allow-Origin: *` dengan domain spesifik Next.js:

```go
// Di middleware/cors.go, ganti baris ini:
w.Header().Set("Access-Control-Allow-Origin", "*")

// Dengan domain spesifik:
w.Header().Set("Access-Control-Allow-Origin", "https://yourdomain.com")
```

### 2. Environment Variables
Pertimbangkan untuk menggunakan environment variables untuk konfigurasi CORS:

```go
allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
if allowedOrigin == "" {
    allowedOrigin = "*" // fallback untuk development
}
w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
```

## Cara Menjalankan Server

```bash
cd "c:\Users\yuliu\OneDrive\Documents\Programku\App Inventori Golang\Backend"
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## Testing CORS

### 1. Test Preflight Request
```bash
curl -X OPTIONS http://localhost:8080/produk \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 2. Test GET Request dengan CORS
```bash
curl -X GET http://localhost:8080/produk \
  -H "Origin: http://localhost:3000" \
  -v
```

### 3. Test POST Request dengan CORS
```bash
curl -X POST http://localhost:8080/produk \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test Product","id_kategori":1,"keterangan":"Test","price":10000}' \
  -v
```

## Struktur File yang Diubah/Ditambah

```
Backend/
├── middleware/
│   └── cors.go (BARU)
├── handlers/
│   ├── options_handler.go (BARU)
│   ├── categori_handlers.go (DIPERBARUI)
│   ├── produk_handlers.go (DIPERBARUI)
│   └── stok_handlers.go (DIPERBARUI)
├── routes/
│   └── routes.go (DIPERBARUI)
└── main.go (TIDAK BERUBAH)
```