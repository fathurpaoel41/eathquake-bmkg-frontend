# 🌏 Bhukampa - Sistem Pemantauan Gempa Bumi Indonesia

**Bhukampa** (dari bahasa Sanskerta yang berarti "gempa bumi") adalah sistem pemantauan gempa bumi real-time Indonesia yang menyediakan informasi terkini tentang aktivitas seismik di seluruh nusantara.

## ✨ Fitur Utama

### 🏠 Landing Page
- **Desain Modern**: UI/UX yang clean dan profesional dengan tema gelap
- **Animasi Interaktif**: Background dengan efek animasi yang menarik
- **Statistik Real-time**: Menampilkan jumlah gempa terkini dan gempa signifikan
- **Peta Interaktif**: Preview peta sebaran gempa menggunakan Leaflet.js
- **Notifikasi Push**: Permintaan izin notifikasi untuk peringatan dini

### 📊 Monitor Page
- **Tabel Data Lengkap**: Daftar gempa bumi dengan informasi detail
- **Peta Interaktif**: Visualisasi lokasi gempa dengan marker berdasarkan magnitudo
- **Auto-refresh**: Pembaruan data setiap 10 detik
- **Responsive Design**: Tampilan optimal di desktop dan mobile
- **Filter & Sort**: Fitur pencarian dan pengurutan data

### 🔔 Sistem Notifikasi
- **Notifikasi Real-time**: Alert untuk gempa M4.0+ dalam 10 menit terakhir
- **Zona Waktu WIB**: Semua waktu ditampilkan dalam GMT+7
- **Perbandingan Waktu**: Menampilkan selisih waktu dari kejadian gempa
- **Notifikasi Cerdas**: Mencegah duplikasi notifikasi

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Maps**: Leaflet.js
- **Icons**: Lucide React
- **API**: BMKG Indonesia + Fallback Local API

## 📋 Persyaratan Sistem

- Node.js 18+ 
- npm atau yarn
- Browser dengan dukungan Web Notifications API

## 🚀 Instalasi dan Menjalankan

### 1. Clone Repository
```bash
git clone <repository-url>
cd bhukampa
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Menjalankan Development Server
```bash
npm run dev
# atau
yarn dev
```

### 4. Buka di Browser
Akses aplikasi di `http://localhost:3000`

## 🗂️ Struktur Proyek

```
bhukampa/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── monitor/           
│   │   └── page.tsx       # Monitor page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── earthquake-header.tsx
│   ├── earthquake-list.tsx
│   ├── earthquake-map.tsx
│   ├── loading-skeleton.tsx
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utilities & services
│   ├── earthquake-api.ts # API functions
│   ├── notification-service.ts
│   └── utils.ts
├── types/                # TypeScript types
│   └── earthquake.ts
└── hooks/               # Custom React hooks
```

## 📡 API dan Data

### Sumber Data Utama
- **BMKG API**: `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
- **Fallback API**: Local development server

### Format Data
```typescript
interface ProcessedEarthquake {
  id: string;
  date: string;
  time: string;
  dateTime: Date;
  location: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  felt: string;
  coordinates: string;
}
```

## 🔔 Sistem Notifikasi

### Kriteria Notifikasi
- **Magnitudo**: ≥ 4.0 SR
- **Waktu**: Dalam 10 menit terakhir
- **Zona Waktu**: WIB (GMT+7)
- **Frekuensi**: Setiap 10 detik (monitoring page)

### Implementasi
```typescript
// Request permission
const permission = await notificationService.requestPermission();

// Check for recent earthquakes
notificationService.checkForRecentEarthquakes(earthquakes);

// Format notification
const title = `🚨 Gempa Bumi M${magnitude}`;
const body = `${location}\n📅 ${date} ${time}\n📏 Kedalaman: ${depth} km`;
```

## 🎨 Desain dan Styling

### Tema Warna
- **Primary**: Blue gradient (#3B82F6 → #8B5CF6)
- **Background**: Dark gradient (Slate 900 → Blue 900)
- **Accent**: Orange (#F97316), Green (#10B981)
- **Text**: White/Gray pada background gelap

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Keamanan dan Privacy

- **No Personal Data**: Tidak menyimpan data personal pengguna
- **Browser Permissions**: Hanya meminta izin notifikasi
- **Data Source**: Menggunakan data publik resmi BMKG
- **Local Storage**: Minimal usage untuk notification state

## 🚧 Pengembangan Selanjutnya

### Fitur yang Direncanakan
- [ ] Histori gempa bumi
- [ ] Export data ke CSV/Excel
- [ ] Grafik tren gempa
- [ ] Filter berdasarkan wilayah
- [ ] Integrasi dengan social media
- [ ] PWA (Progressive Web App)
- [ ] Dark/Light mode toggle
- [ ] Multi-language support

### Perbaikan Teknis
- [ ] Caching strategy
- [ ] Error boundary
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] SEO optimization

## 📖 Dokumentasi API

### Fetch Earthquake Data
```typescript
import { fetchEarthquakeData } from '@/lib/earthquake-api';

const earthquakes = await fetchEarthquakeData();
```

### Notification Service
```typescript
import { notificationService } from '@/lib/notification-service';

// Request permission
await notificationService.requestPermission();

// Check recent earthquakes
notificationService.checkForRecentEarthquakes(earthquakes);

// Get WIB time
const wibTime = notificationService.getWIBTime();
```

## 🐛 Troubleshooting

### Common Issues

1. **Map tidak muncul**
   - Pastikan koneksi internet stabil
   - Check browser console untuk error

2. **Notifikasi tidak muncul**
   - Pastikan permission sudah granted
   - Check browser notification settings

3. **Data tidak ter-update**
   - Check BMKG API status
   - Fallback ke local API jika perlu

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat feature branch
3. Commit changes
4. Submit pull request

## 📄 Lisensi

Proyek ini dibuat untuk tujuan edukasi dan informasi publik.

## 👨‍💻 Pembuat

**Muhammad Fathurachman**

Data gempa bumi bersumber dari **Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)** - Indonesia.

---

*Bhukampa - Memantau bumi, melindungi kehidupan* 🌏 