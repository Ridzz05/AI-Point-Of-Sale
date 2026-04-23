# UI/UX ARCHITECTURE RULES: CLEAN MODERN SAAS (PRODUCTION-READY)

## 1. Core Philosophy (Clarity & Focus)
- **High Legibility:** Prioritaskan kemudahan membaca teks dan angka (terutama harga dan stok).
- **Subtle Hierarchy:** Gunakan bayangan (shadow) lembut dan border tipis untuk membedakan elemen, bukan garis hitam tebal.
- **Breathing Room:** Gunakan padding dan whitespace yang lega agar UI tidak terasa sesak.
- **Professionalism:** Desain harus terasa premium, seperti aplikasi enterprise modern (inspirasi: Stripe, Vercel, Linear).

## 2. Design Tokens & Variables (Tailwind Reference)

### Colors (Subtle & Professional)
- **Background App:** Light Gray yang sangat lembut (`bg-slate-50` atau `#F8FAFC`).
- **Surface/Card:** Pure White (`bg-white`).
- **Borders:** Sangat tipis dan transparan (`border-slate-200` atau `border-gray-200`).
- **Text Primary:** Dark Gray/Black (`text-slate-900`).
- **Text Secondary (Muted):** Medium Gray (`text-slate-500` untuk label, deskripsi).
- **Primary Accent:** Pilih satu warna profesional, misalnya Indigo (`bg-indigo-600`), Biru (`bg-blue-600`), atau Emerald/Teal untuk kesan "sukses/finansial". Jangan gunakan warna neon terang.
- **Destructive/Error:** Soft Red (`text-red-600`, `bg-red-50`).

### Typography
- **Font Family:** `Inter`, `SF Pro`, atau `Roboto`. (Tinggalkan font Monospace untuk elemen utama, gunakan Monospace HANYA untuk ID Transaksi, Hash, atau log terminal).
- **Casing:** Gunakan *Title Case* atau *Sentence case*. Hindari *ALL CAPS* kecuali untuk label berukuran sangat kecil (seperti tag `STATUS`).
- **Weights:** Gunakan `font-medium` untuk header tabel/label, `font-semibold` untuk nilai penting (Total Harga), dan `font-normal` untuk data lainnya.

### Spacing & Radius
- **Border Radius:** Gunakan sudut melengkung yang moderat. `rounded-lg` (8px) untuk tombol/input, dan `rounded-xl` atau `rounded-2xl` untuk Card/Container utama.
- **Shadows:** Gunakan `shadow-sm` untuk card standar, dan `shadow-md` atau `shadow-lg` dengan opasitas sangat rendah untuk modal/dropdown. Hapus semua *solid brutalist shadow*.

## 3. Component Rules (Strict Guidelines)

### A. Layout & Sidebar
- **Sidebar:** Background putih (`bg-white`) dengan border kanan tipis (`border-r border-slate-200`).
- **Active Menu:** Jangan gunakan garis bawah. Gunakan background highlight yang lembut (`bg-slate-100` atau `bg-indigo-50` dengan teks `text-indigo-600`) dan `rounded-md`.

### B. Cards & Dashboards (Dashboard Value)
- Card Total Harga: Background putih, `border border-slate-200`, `rounded-xl`, `shadow-sm`, padding `p-6`.
- Angka Rp 120,000 buat dengan ukuran teks besar (`text-4xl` atau `text-5xl`), font tebal, dan warna gelap utama (`text-slate-900`). Beri label kecil "Realtime Revenue" di atasnya dengan warna `text-slate-500`.

### C. Tables & Data Grids (Products/Transactions)
- **Container:** Masukkan tabel ke dalam kotak putih bersudut melengkung dengan border tipis (`bg-white rounded-xl border border-slate-200 overflow-hidden`).
- **Header Tabel (TH):** Background sangat terang (`bg-slate-50`), teks kecil, huruf kapital, font-medium, dan warna `text-slate-500`. Border bawah tipis.
- **Baris Tabel (TR):** Hapus border vertikal antar sel. Hanya gunakan border horizontal tipis di bagian bawah setiap baris (`border-b border-slate-100`).
- **Status Badges:** `rounded-full` (bentuk pil), background transparan dengan warna (misal: `bg-green-100 text-green-700` untuk ENABLED).

### D. Terminal / Voice Input (AI Cashier Core)
- Ubah kesan "Terminal Hacker" menjadi "Modern AI Assistant".
- **Container:** Background putih, `rounded-xl`, `border border-slate-200`.
- **Input Area:** Hilangkan border tebal hitam. Buat *input field* dengan background abu-abu sangat muda (`bg-slate-100`), `rounded-lg`, tanpa border nyata kecuali saat di-fokus (berikan `ring-2 ring-indigo-500`).
- **Voice Button:** Ikon mikrofon dalam lingkaran (`rounded-full`), warna abu-abu. Saat merekam (Active State), berikan efek *pulse* / *ping* berwarna biru atau merah lembut.

### E. Buttons & Inputs
- **Primary Button:** Background warna solid (misal Indigo), teks putih, `rounded-lg`, tanpa border. Efek hover: warna sedikit menggelap.
- **Inputs:** `rounded-lg`, `border border-slate-300`, background putih. Fokus: `ring-2 ring-indigo-500/20 border-indigo-500`.
