import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Indonesia Earthquake Monitor | Real-time Seismic Activity',
  description: 'Monitor real-time earthquake activity in Indonesia with interactive maps and detailed seismic data from BMKG.',
  keywords: 'earthquake, Indonesia, BMKG, seismic activity, real-time monitoring, gempa bumi',
  authors: [{ name: 'Indonesia Earthquake Monitor' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Indonesia Earthquake Monitor',
    description: 'Real-time earthquake monitoring for Indonesia with interactive maps and BMKG data',
    type: 'website',
    locale: 'id_ID',
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