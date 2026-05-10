# Rencana Implementasi AdminCRM-Kita

Rencana ini merinci langkah-langkah untuk membangun sistem CRM yang fokus pada efisiensi tim Marketing, Client Handler, dan Developer.

## 1. Arsitektur Database (Schema)

### Tabel: `customers`
- `id` (Primary Key)
- `name` (string)
- `email` (string, unique)
- `phone` (string, nullable)
- `address` (text, nullable)
- `status` (enum: 'Lead', 'Active', 'Past') - *Penting untuk segmentasi marketing*
- `timestamps`

### Tabel: `projects`
- `id` (Primary Key)
- `customer_id` (Foreign Key -> customers)
- `name` (string)
- `description` (text, nullable)
- `status` (enum: 'Planning', 'In Progress', 'Completed', 'On Hold')
- `deadline` (date, nullable)
- `progress` (integer, default: 0) - *Untuk metrik "Project Progress"*
- `timestamps`

### Tabel: `transactions`
- `id` (Primary Key)
- `project_id` (Foreign Key -> projects, nullable) - *Relasi ke proyek jangka panjang*
- `customer_id` (Foreign Key -> customers)
- `amount` (decimal, 15, 2)
- `status` (enum: 'Pending', 'Paid', 'Cancelled')
- `invoice_url` (string, nullable) - *Untuk Client Handler mengirim dokumen*
- `attachment_path` (string, nullable) - *Bukti bayar/dokumen*
- `timestamps`

## 2. Rencana Frontend (React + shadcn/ui)

### Halaman & Komponen
- **Dashboard**: Menggunakan `Recharts` untuk visualisasi omzet dan progres proyek.
- **Customers Index**: Menggunakan `DataTable` shadcn/ui dengan filter berdasarkan `status`.
- **Projects Index**: List proyek dengan progress bar dan indikator deadline.
- **Transactions Index**: List transaksi dengan akses cepat ke invoice/attachment.

## 3. Langkah Eksekusi (Roadmap)
- [ ] Tahap 1: Pembuatan Migrasi & Model (Backend Foundation).
- [ ] Tahap 2: Pembuatan Controller & API/Inertia Routes.
- [ ] Tahap 3: Implementasi UI Customers (CRUD).
- [ ] Tahap 4: Implementasi UI Projects & Transactions.
- [ ] Tahap 5: Dashboard Analytics dengan Recharts.

---
*Catatan: Semua rute akan diatur agar dapat diakses langsung tanpa login sesuai permintaan sebelumnya.*
