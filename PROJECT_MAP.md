# Saintce Project Map

Dokumen ini jadi peta teknis project `Saintce`, biar gampang lihat fitur, struktur, dan fungsi tiap file penting di repo.

## 1. Ringkasan Sistem

Saintce adalah website company profile premium dengan admin panel internal dan CMS section-based.

Fitur utama yang sudah ada:
- Landing page skeuomorphic dengan section `Hero`, `About`, `Process`, dan `CTA`
- Page `Clients` dengan live registry dan search
- Page `Contact` dengan form inquiry ke email via Resend
- Admin panel untuk overview, client management, dan section CMS
- Auth admin via Supabase Auth + tabel `admin_users`
- Content public dibaca dari Supabase dengan fallback default
- Realtime update untuk client registry
- Supabase migration untuk schema production
- Performance hardening untuk render, animation, dan touch-device behavior

## 2. Stack

- Framework: Next.js 16 App Router
- UI: React 19 + Tailwind CSS v4
- Motion: Framer Motion + Lenis
- Backend service: Supabase
- Email delivery: Resend
- Language: TypeScript

## 3. Top-Level Files

### [package.json](/C:/Users/Administrator/OneDrive/Desktop/saintce/package.json)
- Menyimpan metadata package `saintce`
- Menyediakan script `dev`, `build`, `start`, dan `lint`
- Menentukan dependency inti project

### [package-lock.json](/C:/Users/Administrator/OneDrive/Desktop/saintce/package-lock.json)
- Lockfile dependency npm untuk install yang konsisten

### [README.md](/C:/Users/Administrator/OneDrive/Desktop/saintce/README.md)
- README bawaan Next.js
- Belum jadi dokumentasi utama project

### [PROJECT_MAP.md](/C:/Users/Administrator/OneDrive/Desktop/saintce/PROJECT_MAP.md)
- Dokumentasi struktur dan fitur project

### [next.config.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/next.config.ts)
- Konfigurasi Next.js
- Saat ini masih minimal/default

### [tsconfig.json](/C:/Users/Administrator/OneDrive/Desktop/saintce/tsconfig.json)
- Konfigurasi TypeScript
- Sudah pakai alias import `@/*`

### [eslint.config.mjs](/C:/Users/Administrator/OneDrive/Desktop/saintce/eslint.config.mjs)
- Konfigurasi linting project

### [postcss.config.mjs](/C:/Users/Administrator/OneDrive/Desktop/saintce/postcss.config.mjs)
- Konfigurasi PostCSS untuk Tailwind

### [next-env.d.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/next-env.d.ts)
- Type helper bawaan Next.js

### [.env.local](/C:/Users/Administrator/OneDrive/Desktop/saintce/.env.local)
- Menyimpan env lokal seperti Supabase, Resend, dan site URL
- Jangan di-share ke publik

### [.gitignore](/C:/Users/Administrator/OneDrive/Desktop/saintce/.gitignore)
- File/folder yang diabaikan Git

### [proxy.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/proxy.ts)
- Proxy/middleware untuk route legacy `/ajx-core`
- Mengecek header `x-admin-key` terhadap `ADMIN_SECRET`
- Kalau tidak cocok, route dibikin `404`

## 4. App Router

### [app/layout.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/layout.tsx)
- Root layout seluruh app
- Load font `Cormorant Garamond`, `DM Sans`, dan `DM Mono`
- Inject global background canvas, mouse light, dan smooth scroll
- Menyimpan metadata dasar app dan Apple web app title

### [app/globals.css](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/globals.css)
- Design system global Saintce
- Menyimpan color token, panel styles, hero shell, input/button styles, marquee, background canvas
- Berisi hardening CSS untuk compositing, overscroll, dan backdrop stability

### [app/manifest.json](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/manifest.json)
- Web app manifest untuk PWA/browser install behavior

### [app/favicon.ico](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/favicon.ico)
- Favicon utama browser

### [app/apple-icon.png](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/apple-icon.png)
- Apple touch icon

### [app/icon0.svg](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/icon0.svg)
- Asset icon app

### [app/icon1.png](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/icon1.png)
- Asset icon app

### [app/(site)/layout.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/(site)/layout.tsx)
- Layout untuk public site
- Mount `Navbar`, route transition, dan `Footer`
- Footer content diambil dari CMS section Supabase

### [app/(site)/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/(site)/page.tsx)
- Homepage utama
- Menyusun section `Hero`, `Marquee`, `About`, `Process`, dan `CTA`
- Ambil content dynamic dari `site_content_sections`

### [app/(site)/clients/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/(site)/clients/page.tsx)
- Public clients page
- Fetch clients live dari Supabase
- Search client dengan deferred filtering
- Subscribe realtime ke perubahan table `clients`

### [app/(site)/contact/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/(site)/contact/page.tsx)
- Contact page
- Render form inquiry

### [app/admin/layout.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/admin/layout.tsx)
- Shell admin panel
- Sidebar menu `Overview`, `Sections`, `Clients`
- Active nav indicator pakai Framer Motion

### [app/admin/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/admin/page.tsx)
- Dashboard overview admin
- Menampilkan ringkasan client, status About, recent clients, dan summary refactor
- Cek akses admin sebelum masuk

### [app/admin/about/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/admin/about/page.tsx)
- Route legacy admin about
- Sekarang redirect ke `/admin/sections`

### [app/admin/clients/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/admin/clients/page.tsx)
- Client registry manager untuk admin
- Bisa create, edit, delete client
- Menampilkan statistik total/live/private/archived
- Subscribe realtime untuk refresh data client

### [app/admin/sections/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/admin/sections/page.tsx)
- CMS utama untuk homepage sections
- Bisa edit `Hero`, `About`, `Process`, `CTA`, dan `Footer`
- Save semua section sekaligus ke Supabase

### [app/ajx-core/layout.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/ajx-core/layout.tsx)
- Redirect route legacy `/ajx-core` ke `/admin`

### [app/api/contact/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/contact/route.ts)
- API route untuk kirim inquiry contact form
- Validasi field wajib
- Sanitasi HTML
- Kirim email pakai Resend ke email Saintce

### [app/login/page.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/login/page.tsx)
- Login admin via GitHub OAuth Supabase
- Redirect login success ke `/admin`
- Kasih hint soal bootstrap `admin_users`

## 5. Components

## 5.1 Client Components

### [components/clients/ClientCard.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/clients/ClientCard.tsx)
- Card tampilan client di public page
- Ada style badge berdasarkan status `live`, `beta`, `private`, `archived`
- Project `private` tidak bisa dibuka link-nya

### [components/clients/ClientSearch.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/clients/ClientSearch.tsx)
- Input search untuk clients page

## 5.2 Effects

### [components/effects/BackgroundCanvas.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/effects/BackgroundCanvas.tsx)
- Layer background global fixed
- Menampilkan glow dan grid visual

### [components/effects/MouseLight.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/effects/MouseLight.tsx)
- Update CSS variable posisi mouse
- Menggerakkan glow interaktif di desktop
- Otomatis nonaktif di device tanpa hover pointer halus

## 5.3 Forms

### [components/forms/ContactForm.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/forms/ContactForm.tsx)
- Form inquiry untuk contact page
- Validasi required fields
- Anti double submit
- Cleanup timeout saat unmount
- Redirect ke homepage setelah submit sukses

## 5.4 Layouts

### [components/layouts/Footer.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/layouts/Footer.tsx)
- Footer public site
- Description dan copyright diambil dari CMS

### [components/layouts/Navbar.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/layouts/Navbar.tsx)
- Navbar public site
- Ada mode normal, mode back button, dan mobile menu
- Mengambil menu link dari `siteConfig.navigation`

## 5.5 Providers

### [components/providers/SiteRouteTransition.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/providers/SiteRouteTransition.tsx)
- Wrapper transisi antar route public
- Pakai opacity + translateY yang GPU-friendly

### [components/providers/SmoothScroll.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/providers/SmoothScroll.tsx)
- Menyalakan Lenis smooth scroll global
- Otomatis mati di device touch dan reduced-motion
- Sudah cleanup RAF loop saat unmount

## 5.6 Sections

### [components/sections/About.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/sections/About.tsx)
- About section homepage
- Ambil content live dari `about_section`

### [components/sections/CTA.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/sections/CTA.tsx)
- CTA section homepage
- Tombol utama ke route `/contact`
- Secondary contact via `mailto`

### [components/sections/Hero.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/sections/Hero.tsx)
- Hero section homepage
- Menampilkan title, description, tombol, dan info panel kanan
- Content-nya full dari CMS section

### [components/sections/Process.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/sections/Process.tsx)
- Process section homepage
- Menampilkan 4 langkah proses dari CMS

## 5.7 UI Building Blocks

### [components/ui/Button.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/ui/Button.tsx)
- Reusable button wrapper dengan varian `primary` dan `ghost`

### [components/ui/Container.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/ui/Container.tsx)
- Wrapper lebar konten konsisten untuk layout editorial

### [components/ui/Marquee.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/ui/Marquee.tsx)
- Marquee strip pada homepage
- Menampilkan keyword brand/feature Saintce

### [components/ui/Section.tsx](/C:/Users/Administrator/OneDrive/Desktop/saintce/components/ui/Section.tsx)
- Wrapper spacing section
- Bisa menambah divider dan subtle background

## 6. Lib

### [lib/site-config.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/site-config.ts)
- Konfigurasi brand utama
- Menyimpan nama brand, admin name, tagline, contact email, SEO copy, dan navigation
- `getBaseUrl()` fallback ke domain Vercel

### [lib/supabase.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/supabase.ts)
- Inisialisasi Supabase client browser/app

### [lib/site-sections.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/site-sections.ts)
- Data contract untuk section CMS
- Menyediakan default content
- Mapping row Supabase ke object section frontend
- Menyediakan fetch public, fetch admin, dan upsert section
- Public fetch pakai `cache: "no-store"` supaya update CMS cepat kelihatan

### [lib/about.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/about.ts)
- CRUD sederhana untuk `about_section`
- Bisa fetch, ensure singleton row, dan update About

### [lib/about-server.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/about-server.ts)
- Server-side fetch public About content dari REST Supabase
- Punya fallback jika env atau request gagal
- Pakai `cache: "no-store"`

### [lib/about-content.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/about-content.ts)
- Menyimpan fallback copy About
- Menormalisasi data About agar selalu lengkap walau ada field kosong

### [lib/clients.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/clients.ts)
- Shared client data layer
- Fetch clients public/admin
- Save, remove, update status
- Hitung summary statistik client
- Realtime subscribe helper

### [lib/admin-auth.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/admin-auth.ts)
- Guard akses admin
- Cek user login Supabase
- Cek row aktif di `admin_users`
- Ada fallback ke email admin utama di config

### [lib/animation.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/animation.ts)
- Token timing, easing, dan spring animation global

### [lib/errors.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/errors.ts)
- Normalisasi error ke message yang lebih readable
- Dipakai admin biar error Supabase/RLS kebaca lebih jelas

### [lib/utils.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/utils.ts)
- File util umum
- Saat ini jadi helper slot untuk utility tambahan project

## 7. Public Assets

### [public/web-app-manifest-192x192.png](/C:/Users/Administrator/OneDrive/Desktop/saintce/public/web-app-manifest-192x192.png)
- Asset icon manifest ukuran 192

### [public/web-app-manifest-512x512.png](/C:/Users/Administrator/OneDrive/Desktop/saintce/public/web-app-manifest-512x512.png)
- Asset icon manifest ukuran 512

## 8. Supabase

### [supabase/README.md](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/README.md)
- Catatan setup Supabase
- Menjelaskan migration baseline dan reset production
- Ada query bootstrap owner admin

### [supabase/migrations/20260405_000001_create_saintce_core.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000001_create_saintce_core.sql)
- Migration baseline awal untuk Saintce core

### [supabase/migrations/20260405_000002_reset_saintce_core_production.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000002_reset_saintce_core_production.sql)
- Full destructive rebuild schema production
- Membuat `admin_users`, `clients`, `about_section`, `site_content_sections`, dan `audit_logs`
- Menambahkan trigger, RLS, publication realtime, dan seed awal

### [supabase/migrations/20260405_000003_add_saintce_site_sections.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000003_add_saintce_site_sections.sql)
- Migration additive untuk CMS sections homepage
- Menambahkan atau memastikan row default section tersedia

### [supabase/migrations/20260405_000004_remove_saintce_metrics.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000004_remove_saintce_metrics.sql)
- Migration cleanup untuk menghapus row `metrics`
- Dipakai setelah section `Metrics` dibuang dari sistem

## 9. Fitur yang Aktif Saat Ini

- Public homepage dengan CMS-driven sections
- Public clients archive dengan realtime sync
- Public contact form ke email
- Admin login via GitHub OAuth
- Admin overview dashboard
- Admin client CRUD
- Admin section CMS
- About CMS live
- Supabase RLS + admin table
- Realtime clients
- Favicon / manifest / Apple app title support

## 10. Catatan Penting

- File `README.md` root masih template bawaan Next.js, jadi dokumentasi project yang bener sekarang ada di file ini
- Folder build seperti `.next` dan dependency `node_modules` tidak didokumentasikan satu-satu karena generated
- Route `/admin/about` dan `/ajx-core` sekarang hanya route legacy/redirect
- Auth admin yang benar untuk write Supabase tetap bergantung pada tabel `public.admin_users`

## 11. Billing Platform Expansion (2026-04-05)

Upgrade baru yang sudah ditambahkan tanpa mengubah visual design Saintce:

- Modul admin baru:
  - `/admin/billing-overview`
  - `/admin/projects`
  - `/admin/services`
  - `/admin/subscriptions`
  - `/admin/invoices`
  - `/admin/payments`
- Struktur modular baru di `lib/`:
  - [lib/clients](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/clients)
  - [lib/projects](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/projects)
  - [lib/services](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/services)
  - [lib/subscriptions](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/subscriptions)
  - [lib/invoices](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/invoices)
  - [lib/payments](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/payments)
  - [lib/billing](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/billing)
  - [lib/notifications](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/notifications)
- Clients sekarang diperluas dengan `email`, `company_name`, `phone`, dan `notes`
- Entity baru yang aktif di arsitektur:
  - `projects`
  - `services`
  - `subscriptions`
  - `invoices`
  - `payments`
- Migration baru:
  - [20260405_000005_add_saintce_billing_platform.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000005_add_saintce_billing_platform.sql)

### Billing Automation Foundation

Migration billing menambahkan function database berikut:
- `public.get_next_invoice_number()`
- `public.create_manual_invoice()`
- `public.record_payment_and_sync()`
- `public.sync_project_and_service_access()`
- `public.can_access_project()`
- `public.run_billing_automation()`

### Catatan Status Saat Ini

- UI visual existing tetap dipertahankan
- Admin shell tetap Saintce style
- Fondasi automation sudah ada di layer database dan service
- Module pages sudah siap untuk operasi inti admin
- PROJECT_MAP ini harus terus di-update tiap ada perubahan baru berikutnya

### Automation Layer Added

Server-side automation dan integration endpoint yang baru:
- [lib/supabase-admin.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/supabase-admin.ts)
  - Supabase service-role client untuk cron, webhook, dan server automation
- [lib/billing/server.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/billing/server.ts)
  - Server-only billing automation executor
  - Notification candidate resolver
  - Invoice issued/reminder email dispatcher
- [app/api/billing/run/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/billing/run/route.ts)
  - Endpoint cron/manual admin trigger untuk jalankan billing automation + kirim notifikasi invoice
  - Bisa authorize via cron secret atau admin bearer token
- [app/api/payments/webhook/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/payments/webhook/route.ts)
  - Webhook endpoint payment success
  - Sync payment -> invoice -> subscription -> service/project access

### New Env Requirements

Untuk production billing automation, env berikut sekarang dibutuhkan:
- `SUPABASE_SERVICE_ROLE_KEY`
- `BILLING_CRON_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- `RESEND_API_KEY`

### Billing Flow Status

Flow yang sekarang sudah tersedia:
- Admin create project
- Admin create service
- Admin create subscription
- Admin generate invoice manual
- Admin record payment
- Payment webhook update invoice/subscription/project access
- Cron endpoint jalankan billing automation
- Invoice issued/reminder email dispatch via Resend

Yang masih bisa dilanjutkan di fase berikutnya:
- scheduler provider deployment nyata di Vercel cron / external runner
- gateway-specific webhook adapter (Midtrans, Xendit, Stripe, dll)
- invoice PDF / branded attachment
- reminder escalation multi-step

### Stripe Integration Added

Integrasi Stripe-native yang baru:
- dependency resmi Stripe SDK sudah ditambahkan di [package.json](/C:/Users/Administrator/OneDrive/Desktop/saintce/package.json)
- [lib/stripe-server.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/lib/stripe-server.ts)
  - create one-time checkout session per invoice
  - create recurring checkout session per subscription
  - create Stripe Billing Portal session per subscription client
  - ensure Stripe customer, product, dan recurring price
  - verify Stripe webhook signature
  - apply idempotency lock untuk event webhook Stripe
  - sync event Stripe ke payment / invoice / subscription internal
- [app/api/payments/stripe/checkout/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/payments/stripe/checkout/route.ts)
  - create Stripe checkout session dari invoice internal atau recurring subscription internal
- [app/api/payments/stripe/portal/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/payments/stripe/portal/route.ts)
  - create Stripe Billing Portal session dari subscription internal
- [app/api/payments/webhook/route.ts](/C:/Users/Administrator/OneDrive/Desktop/saintce/app/api/payments/webhook/route.ts)
  - sekarang dipakai untuk Stripe webhook signature-verified dengan duplicate guard
- [20260405_000006_add_stripe_billing_mapping.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000006_add_stripe_billing_mapping.sql)
  - menambah mapping field Stripe di clients, subscriptions, invoices, dan payments
- [20260405_000007_add_stripe_service_product_mapping.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000007_add_stripe_service_product_mapping.sql)
  - menambah mapping `services.stripe_product_id` untuk recurring catalog Stripe
- [20260405_000008_add_stripe_webhook_events.sql](/C:/Users/Administrator/OneDrive/Desktop/saintce/supabase/migrations/20260405_000008_add_stripe_webhook_events.sql)
  - menambah tabel idempotency + audit log untuk event webhook Stripe

### Stripe Env Requirements

Env Stripe yang sekarang dibutuhkan:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Catatan:
- route `/api/payments/webhook` sekarang verifikasi signature Stripe langsung
- duplicate event Stripe dicatat di `stripe_webhook_events` lalu di-skip secara aman
- `PAYMENT_WEBHOOK_SECRET` tidak dipakai lagi untuk route Stripe ini

### Stripe Flow Saat Ini

Flow Stripe yang sekarang sudah ada:
- admin generate invoice internal
- admin klik `Stripe link` dari invoice manager untuk one-time invoice payment
- admin klik `Stripe recurring` dari subscription manager untuk recurring checkout
- admin klik `Billing portal` dari subscription manager untuk buka Stripe Customer Portal
- system ensure Stripe customer, product, dan recurring price sebelum create session
- Stripe webhook verifikasi signature
- duplicate webhook event di-skip via lock idempotency database
- `checkout.session.completed` mode subscription menyimpan `stripe_subscription_id` ke internal subscription
- `invoice.paid` Stripe akan mirror invoice recurring ke internal invoice lalu record payment
- event payment success sync ke `payments`, `invoices`, `subscriptions`, dan access state
- event payment failed tandai subscription `past_due`
- event subscription updated/deleted dari Stripe update status internal via mapping `stripe_subscription_id`
