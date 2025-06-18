import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bhukampa - Sistem Pemantauan Gempa Bumi Indonesia',
  description: 'Pantau aktivitas gempa bumi real-time di Indonesia dengan data resmi dari BMKG. Dapatkan notifikasi cepat untuk gempa signifikan.',
  keywords: ['gempa bumi', 'BMKG', 'seismik', 'Indonesia', 'pemantauan gempa', 'notifikasi gempa', 'bhukampa', 'data gempa'],
  authors: [{ name: 'Muhammad Fathurachman' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Bhukampa - Sistem Pemantauan Gempa Bumi Indonesia',
    description: 'Pantau aktivitas gempa bumi real-time di Indonesia dengan data resmi dari BMKG',
    url: 'https://bhukampa.vercel.app',
    siteName: 'Bhukampa',
    images: [
      {
        url: 'https://bhukampa.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bhukampa - Pemantauan Gempa Bumi',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhukampa - Sistem Pemantauan Gempa Bumi Indonesia',
    description: 'Pantau aktivitas gempa bumi real-time di Indonesia dengan data resmi dari BMKG',
    images: ['https://bhukampa.vercel.app/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://bhukampa.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
