# Quick Start - Docker Deployment

## Langkah Cepat Deploy ke VM Proxmox

### 1. Di VM Proxmox, Clone Repository
```bash
git clone https://github.com/yulius98/App-Inventori-Golang.git
cd App-Inventori-Golang
```

### 2. Buat File .env
```bash
cp .env.example .env
nano .env
```

**PENTING**: Edit file `.env` dan ganti `VITE_API_URL` dengan IP VM Anda:
```env
# Ganti 192.168.1.100 dengan IP VM Proxmox Anda
VITE_API_URL=http://192.168.1.100:8080

# Ganti password default
DB_ROOT_PASSWORD=password_kuat_123
DB_PASSWORD=password_kuat_456
JWT_SECRET=secret_key_yang_panjang_dan_random_123456
```

### 3. Jalankan Docker Compose
```bash
# Build dan start semua service
docker-compose up -d --build

# Tunggu beberapa saat, lalu cek status
docker-compose ps

# Lihat logs
docker-compose logs -f
```

### 4. Akses Aplikasi
- **Frontend**: http://IP-VM-ANDA:3000
- **Backend API**: http://IP-VM-ANDA:8080

## Jika Ada Update Kode

```bash
# Pull update
git pull origin main

# Rebuild dan restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Frontend tidak bisa akses backend
Pastikan `VITE_API_URL` di file `.env` menggunakan IP VM yang bisa diakses dari browser Anda, BUKAN `localhost` atau `127.0.0.1`.

```bash
# Edit .env
nano .env

# Ubah menjadi:
VITE_API_URL=http://IP-VM-ANDA:8080

# Rebuild frontend
docker-compose up -d --build frontend
```

### Cek Logs Jika Ada Error
```bash
# Logs semua service
docker-compose logs -f

# Logs service tertentu
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Perintah Berguna

```bash
# Stop semua
docker-compose down

# Restart service
docker-compose restart backend

# Rebuild service tertentu
docker-compose up -d --build backend

# Backup database
docker-compose exec db mysqldump -u inventory_user -pinventory_password inventory_db > backup.sql
```

---

Untuk panduan lengkap, lihat [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
