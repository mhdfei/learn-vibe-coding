# Fitur Login User & Manajemen Session (API)

Dokumen ini berisi panduan dan tahapan implementasi fitur login user beserta pembuatan session token. Silakan ikuti instruksi di bawah ini secara sistematis.

## 1. Pembuatan Schema Database

Buat definisi tabel `sessions` menggunakan Drizzle ORM (tambahkan pada file schema yang sudah ada, misalnya `src/db/schema.ts`).

**Struktur Tabel `sessions`:**
- `id`: integer, auto increment, primary key
- `token`: varchar (panjang 255), not null. Nilai dari field ini berupa UUID yang akan di-generate saat user berhasil login.
- `user_id`: integer. Foreign Key (FK) yang mereferensikan kolom `id` pada tabel `users`.
- `created_at`: timestamp, default `current_timestamp`.

*Setelah schema dibuat, jangan lupa jalankan command untuk men-generate dan mem-push schema ke database.*

---

## 2. Struktur Folder & Controller/Service

Gunakan struktur folder yang sudah ada di dalam `src`:
- `src/routes`: Untuk menangani routing/endpoint web menggunakan ElysiaJS.
- `src/services`: Berisi *business logic*, seperti pengecekan password, pembuatan token, dan interaksi database.

**Format Penamaan File:**
Gunakan/lanjutkan pada file yang sudah ada atau buat baru dengan format:
- Route: `src/routes/users-route.ts`
- Service: `src/services/users-service.ts`

---

## 3. Spesifikasi Endpoint API

Buat API endpoint untuk proses login user dengan spesifikasi berikut:

- **Metode HTTP:** `POST`
- **Endpoint:** `/api/users/login`

### Request Body (JSON)
Sesuai spesifikasi, API menerima request body dengan format berikut:
*(Catatan: Meskipun umumnya login hanya membutuhkan email dan password, pastikan endpoint dapat menerima struktur ini sesuai request)*
```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password"
}
```

### Response Sukses (HTTP 200)
Jika login berhasil dan password sesuai:
```json
{
    "message": "Login successful",
    "data": "123e4567-e89b-12d3-a456-426614174000" 
}
```
*(Catatan: `data` berisi string UUID token yang baru di-generate)*

### Response Error (HTTP 400/401)
Jika kredensial salah, gagal login, atau user tidak ditemukan:
```json
{
    "message": "Invalid email or password",
    "error": "Invalid credentials"
}
```

---

## 4. Tahapan Implementasi Terperinci (Panduan Eksekusi)

Berikut adalah langkah-langkah *(step-by-step)* pengerjaannya:

1. **Update Schema Database:**
   - Buka file schema Drizzle (`src/db/schema.ts`).
   - Tambahkan skema tabel `sessions` dengan field `id`, `token`, `user_id`, dan `created_at`.
   - Pastikan mendefinisikan relasi (Foreign Key) `user_id` ke tabel `users`.
   - Buat migration dan push schema ke MySQL (misal menggunakan rutin perintah Drizzle yang ada di package.json).

2. **Update Service (`users-service.ts`):**
   - Buka file `src/services/users-service.ts`.
   - Buat fungsi baru (misal: `loginUser(payload)`).
   - Di dalam fungsi tersebut:
     - Cari data user di database berdasarkan `email` yang dikirim.
     - Jika user tidak ditemukan, throw error (misal: "Invalid credentials").
     - Jika ditemukan, komparasi (bandingkan) password plain-text dari request dengan password hash di database menggunakan library `bcryptjs` (method `compare`).
     - Jika password tidak cocok, throw error.
     - Jika cocok, generate UUID baru menggunakan library standard bawaan `crypto.randomUUID()` (Tersedia native di Bun/Node).
     - Simpan data session baru (token UUID, dan `user_id` dari user yang bersangkutan) ke dalam tabel `sessions`.
     - Kembalikan nilai token UUID tersebut sebagai output fungsi.

3. **Update Route (`users-route.ts`):**
   - Buka file `src/routes/users-route.ts`.
   - Tambahkan endpoint baru: `.post('/login', ...)` (berada di bawah prefix `/api/users`).
   - Ambil data `body` dari request.
   - Panggil fungsi `loginUser` dari *users-service* di dalam block `try-catch`.
   - Return response JSON sukses yang berisi token jika berhasil.
   - Jika gagal, tangkap error di blok `catch` dan kembalikan struktur response JSON error.

4. **Uji Coba (Testing):**
   - Jalankan server lokal.
   - Kirimkan request `POST` ke `/api/users/login` menggunakan Postman/Bruno/cURL.
   - Pastikan response sukses mengembalikan string token.
   - Periksa database (tabel `sessions`) untuk memastikan data token dan `user_id` benar-benar tersimpan secara persisten.
