# Fitur Logout User (API)

Dokumen ini berisi spesifikasi kebutuhan dan panduan implementasi langkah demi langkah untuk fitur **Logout User**. Panduan ini difokuskan agar mudah dijalankan secara runtut oleh programmer.

## Spesifikasi Endpoint API

- **Fungsi:** Mengakhiri sesi pengguna yang sedang login (Logout).
- **Endpoint yang diminta:** `DELETE /api/users/current`

### Headers yang Diperlukan:
- `Authorization: Bearer <token>`
*(Keterangan: `<token>` adalah token string yang ada dan valid di dalam spesifik tabel users/sessions)*.

### Response Sukses (HTTP 200)
Jika token berhasil divalidasi dan sesi berhasil diakhiri/dihapus:
```json
{
    "data": "OK"
}
```

### Business Logic Constraint Utama
**PENTING:** Jika operasi logout dinyatakan sukses, maka **data session dengan token tersebut harus dihapus dari database (tabel session)**.

### Response Error (HTTP 401)
Jika terjadi kegagalan dari sisi autentikasi (misal token kosong, salah, atau session tidak valid), berikan respon error berikut:
```json
{
    "error": "Unauthorized"
}
```

---

## Aturan Struktur Folder & Penamaan

Mohon gunakan lokasi dan *pattern* nama *file* yang telah diberlakukan di dalam folder `src`:
- **Routes (`src/routes/`)** : Fungsinya berisi deklarasi rute/URL menggunakan *framework* Elysia JS. Standar contoh penamaan *file*: `users-route.ts`.
- **Services (`src/services/`)** : Fungsinya berisi seluruh logika pengolahan *business rules* aplikasi dan komunikasi database (Drizzle ORM). Standar contoh penamaan *file*: `users-service.ts`.

---

## Tahapan Implementasi (Panduan Urutan Eksekusi)

Langkah-langkah berikut menjabarkan tahapan kerja *step-by-step* untuk menyelesaikan fitur ini:

### Langkah 1: Modifikasi Layer "Service"
1. Buka berkas `src/services/users-service.ts`.
2. Bikin *method*/fungsi baru (misal: `logoutUser(token: string)`).
3. Awali dengan melakukan pencarian (*query select/findFirst*) pada tabel database tempat token tersebut berada.
4. Apabila token tidak diketemukan (berarti *session* palsu atau sudah *expired*), hentikan *flow* dengan cara *throw Error* (misal pesan errornya: "Unauthorized").
5. Sebaliknya, apabila data tersebut valid dan ditemukan, tulis *query* Drizzle ORM untuk men-*delete* (menghapus) rekam jejak (*record*) row dari tabel *sessions* dengan kondisi (`WHERE`) nilai kolom token-nya sama dengan teks token parameter di atas.
6. Kembalikan balikan *success state* apabila operasi delete database ini eksekusinya telah selesai.

### Langkah 2: Modifikasi Layer "Routes"
1. Buka berkas yang memuat rute API, yaitu `src/routes/users-route.ts`.
2. Selipkan / tambahkan HTTP request handler untuk mengolah rute yang diarahkan (yaitu `.delete('/current', ...)`).
3. Pada blok handler tersebut, akses elemen `headers` yang ditangkap HTTP request. Cari yang *key*-nya `authorization` atau `Authorization`.
4. Jika ternyata tidak ada *Authorization* header yang ikut dikirim, atau tidak ada *prefix* kata "Bearer "-nya, abaikan *request*, *set status* menjadi 401, lalu *return error* json `{ "error": "Unauthorized" }`.
5. Apabila ada, lakukan manipulasi *string array / substring / split* untuk hanya memisahkan *string token murni* tanpa pelengkap awalan Bearer. 
6. Dengan menggunakan blok `try { ... } catch (e) { ... }`:
    - Di dalam asrama blok `try`, panggil fungsi *service* yang telah di buat di Langkah 1 (misal `await usersService.logoutUser(tokenMurni)`).
    - Jika *method* service tidak mendeteksi galat (*error*), berikan jawaban dengan me-return: `{ "data": "OK" }`.
    - Di dalam blok `catch`, jika *error* tertangkap artinya ada kesalahan sesi. Timpa status respons dengan http kode `401` lalu beri nilai kembalian `{ "error": "Unauthorized" }`.

### Langkah 3: Tes Percobaan API (Verification)
1. Nyalakan layanan dev server lokal berbasis bun Anda.
2. Gunakan *software tools* uji coba API semacam cURL, Postman Web, ThunderClient, atau Insomnia.
3. Jalankan prosedur Login API terlebih dahulu untuk mencetak token sesi baru secara absah (*sah*).
4. Selanjutnya oper URL Endpoint Logout ini, cantumkan HTTP Header `Authorization: Bearer <TOKEN_VALID_BARU>` lalu tekan tombol eksekusi (*Send*).
5. Buktikan hasil awalannya menayangkan teks JSON `"data": "OK"`.
6. Terakhir, tekan lagi berulang kali tombol eksekusi yang sama persis (`DELETE target endpoint yang sama dengan Header token lama` ini). Buktikan di operasi berikutan ini HTTP merespon struktur terproteksi `"error": "Unauthorized"` dikarenakan hak privilese *session* sudah dilebur dari dalam database di pencetakan perdana.
