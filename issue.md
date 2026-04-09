# Fitur Get Current User (API)

Dokumen ini berisi panduan perencanaan dan tahapan implementasi API untuk mengambil data user saat ini yang sedang *login*. Instruksi ini disusun agar dapat dikerjakan secara sistematis dan bertahap.

## Spesifikasi API

- **Fungsi:** Mendapatkan data user saat ini yang sedang login.
- **Metode HTTP:** `GET`
- **Endpoint:** `/api/users/current`

### URL & Headers
Akses ke endpoint ini membutuhkan Token (sebagai autentikasi).
- **Header:** `Authorization: Bearer <token>`
*(Keterangan: `<token>` adalah string token yang ada dan valid di sistem/database).*

### Response Sukses
Apabila token dikirim, valid, dan user ditemukan di sistem, kembalikan response seperti berikut:
```json
{
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "[EMAIL_ADDRESS]",
        "created_at": "timestamp"
    }
}
```

### Response Error
Apabila token tidak ada di header, token salah/kadaluarsa, atau user tidak dikenali, kembalikan response seperti berikut (gunakan HTTP status 401 Unauthorized):
```json
{
    "error": "Unauthorized"
}
```

---

## Struktur Folder & Penamaan

Gunakan struktur folder yang telah ada di dalam direktori `src`:
- **Routes (`src/routes/`)** : Direktori ini berisi definisi rute/endpoint HTTP dari aplikasi yang menggunakan framework **Elysia JS**. Gunakan format penamaan file seperti `users-route.ts`.
- **Services (`src/services/`)** : Direktori ini berisi logic bisnis aplikasi dan interaksi dengan database (menggunakan Drizzle ORM). Gunakan format penamaan file seperti `users-service.ts`.

---

## Tahapan Implementasi (Langkah per Langkah)

Berikut adalah panduan pengerjaan yang harus diikuti untuk mengimplementasikan fitur ini:

### 1. Pengembangan Logic di Layer "Service"
1. Buka file `src/services/users-service.ts`.
2. Buat fungsi baru dengan nama yang merepresentasikan aksi, contohnya: `getCurrentUser(token: string)`.
3. Di dalam fungsi tersebut, implementasikan query *Drizzle ORM* ke database untuk mencari siapa pemilik/pengguna dari token tersebut (sesuaikan dengan tabel tempat relasi token tersimpan, baik tabel `users` atau `sessions` join `users`).
4. Ambil dan seleksi kolom milik user: `id`, `name`, `email`, dan `created_at`.
5. Jika query database tidak menemukan token yang cocok, *throw* error dengan pesan "Unauthorized".
6. Jika data user ditemukan, *return* (kembalikan) nilai objek atau *record* user tersebut dari fungsi.

### 2. Pemasangan Endpoint API di Layer "Routes"
1. Buka file routing API Elysia, yakni `src/routes/users-route.ts`.
2. Daftarkan *(register)* endpoint baru menggunakan method `.get('/current', ...)` yang mana akan melengkapi prefix `/api/users`.
3. Di dalam *handler* endpoint tersebut, tangkap nilai dari header HTTP, khusus di bagian header `authorization` atau `Authorization`.
4. String header ini biasanya berformat `Bearer <token_berupa_string>`. Lakukan pembersihan string/pemisahan (split) untuk mengekstrak string *token murni* (hilangkan kata awalan "Bearer ").
5. Jika header Authorization tidak ada atau tidak valid bentuknya, langsung set HTTP response code ke `401` dan return JSON dengan struktur `{ "error": "Unauthorized" }`.
6. Jika *token murni* didapat, panggil fungsi `getCurrentUser(token)` yang dibuat pada step sebelumnya ke dalam sebuah *try-catch block*.
7. Apabila pemanggilan data *smooth* dan ada hasilnya, bungkus hasil tersebut di dalam format JSON dengan kunci "data" (sesuai spesifikasi Response Sukses).
8. Pada blok `catch`, kalau mendeteksi pengecualian/Error, atur HTTP Code menjadi `401` dan kembalikan pesan JSON `{ "error": "Unauthorized" }`.

### 3. Pengujian Fungsi (Testing)
1. Jalankan development server lokal.
2. Pertama, lakukan proses login *yang sudah di-develop sebelumnya* untuk memperoleh token valid terbaru.
3. Melalui software *API Client* seperti Postman, Bruno, atau Insomnia; lakukan *GET request* ke `http://localhost:<PORT>/api/users/current`.
4. Sematkan token tersebut di header **Authorization: Bearer <token_anda>**.
5. Pastikan memunculkan struktur objek Response Data JSON, lengkap dengan id, nama, email dan status created.
6. Lakukan pengujian tambahan dengan mengirim token *ngawur/random*. Pastikan merespons error dengan struktur pesan JSON `Unauthorized` serta Http status 401 dan aplikasi server *tidak crash*.
