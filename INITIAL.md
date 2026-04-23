# SmartPOS - AI-Integrated Point of Sales

SmartPOS adalah sistem manajemen penjualan modern yang menggabungkan kemudahan antarmuka kasir konvensional dengan kekuatan **AI Automation**. Sistem ini memungkinkan pengguna untuk melakukan input transaksi hanya melalui perintah teks (Natural Language) yang diproses menggunakan AI.



## 🛠️ Tech Stack

- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** Next.js (React) - *Planned*
- **Database:** PostgreSQL / MySQL
- **AI Engine:** OpenRouter API (Accessing GPT/Claude/Gemini)
- **UI/UX Style:** Clean Modern Interface dengan Tailwind CSS & Shadcn/UI.

## 🚀 Fitur Utama (MVP)

1. **AI Command Center (Core):**
   - Integrasi prompt untuk input transaksi otomatis.
   - Contoh: *"Input jual Americano 2 dan Croissant 1"* -> Sistem otomatis memproses ID produk dan qty.
2. **Manajemen Inventaris:**
   - Tracking stok secara real-time.
   - Manajemen kategori, harga, dan deskripsi produk.
3. **Sistem Transaksi:**
   - Checkout cepat dengan verifikasi hasil AI.
   - Cetak struk digital/fisik.
4. **Analitik Penjualan:**
   - Dashboard ringkasan harian dan bulanan.

## 📁 Struktur Inisialisasi Project



- `app/Http/Controllers/Api/`: Tempat logic API untuk integrasi AI dan Frontend.
- `app/Services/AI/`: Service khusus untuk menangani request ke OpenRouter.
- `database/migrations/`: Skema database untuk products, transactions, dan users.

## ⚙️ Setup Integrasi AI (OpenRouter)

Untuk menjalankan fitur automasi, pastikan `OPENROUTER_API_KEY` sudah terpasang di file `.env`:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=google/gemini-pro-1.5-flash # Contoh model cepat & murah