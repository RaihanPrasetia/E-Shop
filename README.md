

# Laravel + React Project

Proyek ini menggunakan **Laravel** sebagai backend (REST API) dan **React.js** untuk frontend. Pastikan Anda telah menginstal semua dependency dan tools yang dibutuhkan sebelum menjalankan aplikasi.

---

## 🧰 Requirements

### Backend (Laravel)

* PHP >= 8.1
* Composer
* MySQL / PostgreSQL / SQLite
* Node.js & npm (untuk Vite jika digunakan)
* Laravel CLI (`composer global require laravel/installer`)

### Frontend (React)

* Node.js >= 18.x
* npm atau yarn

---

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/project-name.git
cd project-name
```

### 2. Setup Backend (Laravel)

```bash
cd backend    # masuk ke folder laravel
cp .env.example .env
composer install
php artisan key:generate
```

Lalu ubah konfigurasi `.env` sesuai database yang Anda gunakan:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

Lanjutkan dengan migrasi database dan seeding data (jika ada):

```bash
php artisan migrate --seed
```

Jalankan server backend:

```bash
php artisan serve
```

### 3. Setup Frontend (React)

```bash
cd ../frontend    # masuk ke folder react
npm install
```

Sesuaikan file `.env` di frontend jika menggunakan variabel API URL:

```
VITE_API_URL=http://127.0.0.1:8000
```

Jalankan server frontend:

```bash
npm run dev
```

---

## 🚀 Akses Aplikasi

* **Frontend (React)**: `http://localhost:5173`
* **Backend API (Laravel)**: `http://127.0.0.1:8000/api`

---

## 🧪 Testing

Untuk menjalankan unit test Laravel:

```bash
php artisan test
```

---

## 📝 Catatan

* Pastikan backend dan frontend mengizinkan akses CORS jika berjalan di port berbeda.
* Anda dapat menggunakan Laravel Sanctum atau Passport untuk autentikasi jika dibutuhkan.

---
