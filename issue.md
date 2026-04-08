# Fitur Registrasi User Baru (API)

Dokumen ini berisi panduan dan tahapan implementasi fitur pendaftaran (registrasi) user baru. Silakan ikuti instruksi di bawah ini secara sistematis.

## 1. Pembuatan Schema Database

Buat definisi tabel `users` menggunakan Drizzle ORM (pada file schema yang sudah ada, misalnya `src/db/schema.ts`).

**Struktur Tabel `users`:**
- `id`: integer, auto increment, primary key
- `name`: varchar (panjang 255), not null
- `email`: varchar (panjang 255), not null, unique
- `password`: varchar (panjang 255), not null. **PENTING:** Password harus di-hash menggunakan `bcrypt` sebelum dimasukkan ke database. Jangan pernah menyimpan plain-text password.
- `created_at`: timestamp, default `current_timestamp`

*Setelah schema dibuat, jangan lupa jalankan command untuk men-generate dan mem-push schema ke database.*

---

## 2. Struktur Folder & Controller/Service

Pastikan atau buat struktur folder berikut di dalam direktori `src`:
- `src/routes`: Direktori ini khusus untuk menangani routing/endpoint web menggunakan ElysiaJS.
- `src/services`: Direktori ini khusus berisi *business logic*, seperti manipulasi data, interaksi ke database, dan hashing password.

**Format Penamaan File:**
Gunakan penamaan file dengan format kebab-case. Contoh:
- Route: `src/routes/users-route.ts`
- Service: `src/services/users-service.ts`

---

## 3. Spesifikasi Endpoint API

Buat API endpoint untuk registrasi user baru dengan spesifikasi berikut:

- **Metode HTTP:** `POST`
- **Endpoint:** `/api/users`

### Request Body (JSON)
Pastikan API dapat menerima format berikut:
```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password"
}
```

### Response Sukses (HTTP 2xx)
Jika registrasi berhasil:
```json
{
    "message": "User created successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
        "created_at": "2022-01-01T00:00:00.000Z"
    }
}
```
*(Catatan: Jangan mengembalikan string/field `password` di response body)*

### Response Error (HTTP 400/409)
Jika email user sudah terdaftar di database:
```json
{
    "message": "User already exists",
    "error": "User already exists"
}
```

---

## 4. Tahapan Implementasi Terperinci (Panduan Eksekusi)

Berikut adalah langkah-langkah *(step-by-step)* pengerjaannya:

1. **Definisikan Schema:**
   - Buka file schema Drizzle (biasanya `src/db/schema.ts`).
   - Tambahkan skema tabel `users` sesuai spesifikasi di atas.
   - Buat migration dan push schema ke MySQL.

2. **Buat Service (`users-service.ts`):**
   - Buat file `src/services/users-service.ts`.
   - Install dependency `bcrypt` dan `@types/bcrypt` (jika menggunakan TypeScript) menggunakan `bun add bcrypt` dan `bun add -d @types/bcrypt`. Atau gunakan library hashing bawaan Bun yaitu `Bun.password`. (Direkomendasikan menggunakan `bun add bcrypt` sesuai spesifikasi).
   - Buat fungsi (misal: `registerUser(payload)`).
   - Di dalam fungsi tersebut:
     - Cari apakah user dengan email tersebut sudah ada di database.
     - Jika ada, kembalikan/lemparkan error "User already exists".
     - Jika tidak, hash password menggunakan `bcrypt`.
     - Simpan data (name, email, hashed password) ke tabel `users`.
     - Kembalikan data user yang baru saja terbuat (tanpa field password).

3. **Buat Route (`users-route.ts`):**
   - Buat file `src/routes/users-route.ts`.
   - Inisialisasi routing Elysia, buat endpoint `POST /api/users`.
   - Ambil data `body` dari request. Opsional: tambahkan validasi input menggunakan `t.Object` dari Elysia.
   - Panggil fungsi `registerUser` dari *users-service*.
   - Return response JSON sukses jika berhasil.
   - Tangkap error dengan block `try-catch` (atau mekanisme error Elysia), lalu return pesan error "User already exists" apabila ada error duplikasi data.

4. **Registrasi Route ke Server Utama:**
   - Buka file main entry point `src/index.ts`.
   - Import route dari `users-route.ts`.
   - Pasang (use) route tersebut ke instance Elysia utama.
   - Uji coba API menggunakan alat seperti Postman, Insomnia, atau cURL.
