# Panduan Deploy Aplikasi ke Docker di VM Proxmox

## Prasyarat
- VM Proxmox dengan Docker dan Docker Compose terinstal
- Akses SSH ke VM
- Port yang diperlukan tersedia (3000, 8080, 3306)

## Langkah-langkah Deployment

### 1. Persiapan di Local (Windows)

#### A. Buat file .env
```bash
# Copy file .env.example menjadi .env
copy .env.example .env
```

Edit file `.env` dan sesuaikan dengan kebutuhan Anda:
```env
DB_ROOT_PASSWORD=password_root_yang_kuat
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=password_yang_kuat
DB_PORT=3306

BACKEND_PORT=8080
JWT_SECRET=ganti-dengan-secret-key-yang-panjang-dan-random

FRONTEND_PORT=3000

# PENTING: Ganti dengan IP VM Proxmox atau domain Anda
# Ini digunakan oleh frontend untuk mengakses backend API
VITE_API_URL=http://192.168.1.100:8080
```

**CATATAN PENTING**: 
- `VITE_API_URL` HARUS menggunakan IP VM yang bisa diakses dari browser Anda
- JANGAN gunakan `localhost` atau `127.0.0.1` untuk `VITE_API_URL`
- Jika menggunakan domain, ganti dengan URL domain Anda


### 2. Transfer File ke VM Proxmox

#### Opsi A: Menggunakan SCP (Linux/Mac/Git Bash)
```bash
# Compress folder project
tar -czf app-inventori.tar.gz .

# Upload ke VM
scp app-inventori.tar.gz user@ip-vm-proxmox:/home/user/

# SSH ke VM dan extract
ssh user@ip-vm-proxmox
cd /home/user
tar -xzf app-inventori.tar.gz
cd App-Inventori-Toko-Golang
```

#### Opsi B: Menggunakan WinSCP atau FileZilla
1. Buka WinSCP atau FileZilla
2. Connect ke VM Proxmox Anda
3. Upload seluruh folder project ke VM

#### Opsi C: Menggunakan Git (Recommended)
```bash
# Di VM Proxmox
cd /home/user
git clone https://github.com/yulius98/App-Inventori-Golang.git
cd App-Inventori-Golang

# Copy dan edit .env file
cp .env.example .env
nano .env  # Edit sesuai kebutuhan
```

### 3. Deploy di VM Proxmox

#### A. Masuk ke VM via SSH
```bash
ssh user@ip-vm-proxmox
```

#### B. Masuk ke folder project
```bash
cd /home/user/App-Inventori-Toko-Golang
```

#### C. Build dan jalankan container
```bash
# Build dan start semua service
docker-compose up -d --build

# Cek status container
docker-compose ps

# Lihat logs jika ada masalah
docker-compose logs -f
```

### 4. Akses Aplikasi

- **Frontend**: http://ip-vm-proxmox:3000
- **Backend API**: http://ip-vm-proxmox:8080
- **MySQL**: ip-vm-proxmox:3306

### 5. Perintah Docker yang Berguna

```bash
# Stop semua container
docker-compose down

# Stop dan hapus semua data (termasuk database)
docker-compose down -v

# Restart service tertentu
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db

# Lihat logs service tertentu
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Rebuild service tertentu
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Masuk ke dalam container
docker-compose exec backend sh
docker-compose exec db mysql -u inventory_user -p

# Lihat resource usage
docker stats
```

### 6. Update Aplikasi

Jika ada perubahan kode:

```bash
# Pull perubahan terbaru (jika menggunakan git)
git pull origin main

# Rebuild dan restart
docker-compose down
docker-compose up -d --build

# Atau rebuild service tertentu
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### 7. Backup Database

```bash
# Backup database
docker-compose exec db mysqldump -u inventory_user -p inventory_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T db mysql -u inventory_user -p inventory_db < backup_20250226.sql
```

### 8. Troubleshooting

#### Container tidak bisa start
```bash
# Cek logs
docker-compose logs -f

# Cek port yang konflik
netstat -tulpn | grep -E '3000|8080|3306'
```

#### Database connection error
```bash
# Cek database sudah ready
docker-compose exec db mysqladmin ping -h localhost -u root -p

# Cek environment variables
docker-compose exec backend env | grep DB_
```

#### Frontend tidak bisa akses backend
- Pastikan API endpoint di frontend mengarah ke IP VM, bukan localhost
- Edit file konfigurasi API di frontend jika diperlukan

### 9. Security (Production)

Untuk production, disarankan:

1. **Gunakan reverse proxy (Nginx/Traefik)**
2. **Setup SSL/TLS certificate**
3. **Ubah default ports**
4. **Gunakan strong passwords**
5. **Setup firewall**
6. **Regular backup database**

#### Contoh Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Network Configuration

Semua service berada dalam network yang sama (`inventory-network`) sehingga bisa saling berkomunikasi menggunakan nama service sebagai hostname:
- Backend bisa akses database dengan hostname `db`
- Frontend bisa akses backend dengan hostname `backend`

## Volume Persistence

Data MySQL disimpan dalam Docker volume `mysql_data` sehingga data tidak hilang saat container restart atau rebuild.

## Monitoring

```bash
# Monitor resource usage
docker stats

# Monitor logs real-time
docker-compose logs -f

# Monitor specific service
docker-compose logs -f backend
```

## Support

Jika ada masalah, hubungi tim development atau buat issue di repository.
