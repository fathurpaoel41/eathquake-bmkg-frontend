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
- **Multiple Data Sources**: Dropdown untuk memilih 4 sumber data BMKG yang berbeda
- **Tabel Data Lengkap**: Daftar gempa bumi dengan informasi detail
- **Peta Interaktif**: Visualisasi lokasi gempa dengan marker berdasarkan magnitudo
- **Auto-refresh**: Pembaruan data setiap 10 detik dengan loading state yang granular
- **Responsive Design**: Tampilan optimal di desktop dan mobile
- **Enhanced Statistics**: Dashboard statistik dengan info jumlah dan magnitudo
- **Granular Loading**: Loading state terpisah untuk data dan peta tanpa mempengaruhi header

### 🔔 Sistem Notifikasi
- **Notifikasi Real-time**: Alert untuk gempa M4.0+ dalam 10 menit terakhir
- **Zona Waktu WIB**: Semua waktu ditampilkan dalam GMT+7
- **Perbandingan Waktu**: Menampilkan selisih waktu dari kejadian gempa
- **Notifikasi Cerdas**: Mencegah duplikasi notifikasi

### 📡 Multiple Data Sources
1. **Latest Earthquake**: Gempa terbaru (single record)
2. **Latest 15 Earthquakes**: 15 gempa terbaru
3. **Felt Earthquakes**: Gempa yang dirasakan masyarakat
4. **All Earthquake Data**: Gabungan semua jenis data gempa

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Maps**: Leaflet.js
- **Icons**: Lucide React
- **API**: 4 BMKG Indonesia Endpoints + Fallback Local API

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
│   │   └── page.tsx       # Monitor page dengan dropdown API
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── earthquake-header.tsx  # Header dengan dropdown API
│   ├── earthquake-list.tsx    # List dengan loading states
│   ├── earthquake-map.tsx     # Map dengan marker loading
│   ├── loading-skeleton.tsx   # Loading components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utilities & services
│   ├── earthquake-api.ts # API functions dengan 4 endpoints
│   ├── notification-service.ts
│   └── utils.ts
├── types/                # TypeScript types
│   └── earthquake.ts     # Enhanced types dengan optional fields
└── hooks/               # Custom React hooks
```

## 📡 API dan Data

### 4 Sumber Data BMKG
1. **Latest Earthquake**: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
   - Single gempa terbaru
2. **Latest 15 Earthquakes**: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
   - 15 gempa terbaru
3. **Felt Earthquakes**: `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
   - Gempa yang dirasakan masyarakat
4. **All Earthquake Data**: `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
   - Data gabungan semua jenis gempa

### Enhanced Data Format
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
  // Optional fields dari API berbeda
  potensi?: string;    // Untuk gempa dirasakan
  shakemap?: string;   // URL shakemap jika tersedia
}
```

### API Functions
```typescript
// Fetch data berdasarkan sumber yang dipilih
const earthquakes = await fetchEarthquakeDataBySource('latest-15');

// Sumber yang tersedia:
// 'latest' | 'latest-15' | 'felt' | 'all'
```

## 🔄 Loading States System

### Granular Loading Implementation
- **Initial Loading**: `loading` - Saat pertama kali memuat
- **Data Loading**: `dataLoading` - Saat refresh data dari API
- **Map Loading**: `mapLoading` - Saat memuat marker di peta

### Loading Indicators
```typescript
// Header selalu terlihat selama update
// Loading overlay hanya pada section data
// Progress indicators untuk map markers
{loading ? (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="text-white">Updating data...</div>
  </div>
) : null}
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

### Enhanced UI Components
- **Dropdown API**: Styled select dengan deskripsi setiap endpoint
- **Loading Overlays**: Semi-transparent dengan progress indicators
- **Statistics Cards**: Enhanced dengan count dan magnitude info
- **Responsive Map**: Auto-fit bounds dengan marker clustering

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Keamanan dan Privacy

- **No Personal Data**: Tidak menyimpan data personal pengguna
- **Browser Permissions**: Hanya meminta izin notifikasi
- **Data Source**: Menggunakan 4 endpoint data publik resmi BMKG
- **Local Storage**: Minimal usage untuk notification state

## ⚡ Performance Optimizations

### Efficient Data Handling
- **Cursor-based queries**: Untuk dataset besar (future enhancement)
- **Granular loading**: Mencegah re-render seluruh halaman
- **Map optimization**: Cleanup markers dan auto-fit bounds
- **API fallback**: Multiple endpoints dengan error handling

### Memory Management
- **Cleanup effects**: Proper cleanup di useEffect
- **Marker management**: Clear previous markers before adding new ones
- **State optimization**: Separate loading states untuk performa optimal

## 🚧 Pengembangan Selanjutnya

### Fitur yang Direncanakan
- [x] Multiple API endpoints dengan dropdown
- [x] Granular loading states
- [x] Enhanced statistics dashboard
- [ ] Histori gempa bumi
- [ ] Export data ke CSV/Excel
- [ ] Grafik tren gempa
- [ ] Filter berdasarkan wilayah
- [ ] Integrasi dengan social media
- [ ] PWA (Progressive Web App)
- [ ] Dark/Light mode toggle
- [ ] Multi-language support

### Perbaikan Teknis
- [ ] Caching strategy untuk API responses
- [ ] Error boundary components
- [ ] Performance monitoring
- [ ] Accessibility improvements
- [ ] SEO optimization

## 📖 Dokumentasi API

### Fetch Earthquake Data by Source
```typescript
import { fetchEarthquakeDataBySource } from '@/lib/earthquake-api';

// Pilih sumber data
const earthquakes = await fetchEarthquakeDataBySource('latest-15');

// Available sources:
// 'latest' - Single latest earthquake
// 'latest-15' - 15 most recent earthquakes
// 'felt' - Earthquakes that were felt
// 'all' - Combined all earthquake data
```

### Loading States Management
```typescript
// Dalam component
const [loading, setLoading] = useState(true);
const [dataLoading, setDataLoading] = useState(false);
const [mapLoading, setMapLoading] = useState(false);

// Saat refresh data
setDataLoading(true);
const data = await fetchEarthquakeDataBySource(selectedSource);
setDataLoading(false);
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

1. **Map markers tidak muncul**
   - Check data validation dan coordinates
   - Pastikan cleanup markers berjalan dengan baik
   - Check browser console untuk error

2. **Loading state tidak hilang**
   - Pastikan semua async operations memiliki proper cleanup
   - Check onLoadingComplete callback di map component

3. **Dropdown tidak update data**
   - Pastikan selectedSource state ter-update dengan benar
   - Check API endpoint accessibility

4. **Notifikasi tidak muncul**
   - Pastikan permission sudah granted
   - Check browser notification settings
   - Verify earthquake data memenuhi kriteria notifikasi

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