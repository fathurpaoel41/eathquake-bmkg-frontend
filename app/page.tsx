'use client';

import { useState, useEffect } from 'react';
import { ProcessedEarthquake } from '@/types/earthquake';
import { fetchEarthquakeData } from '@/lib/earthquake-api';
import { notificationService } from '@/lib/notification-service';
import { EarthquakeMap } from '@/components/earthquake-map';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Globe2, TrendingUp, Clock, Bell, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [earthquakes, setEarthquakes] = useState<ProcessedEarthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadEarthquakeData();
    checkNotificationPermission();
  }, []);

  const loadEarthquakeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEarthquakeData();
      setEarthquakes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earthquake data');
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      // Check for recent earthquakes immediately after permission is granted
      if (earthquakes.length > 0) {
        notificationService.checkForRecentEarthquakes(earthquakes);
      }
    }
  };

  const recentEarthquakes = earthquakes.slice(0, 3);
  const majorEarthquakes = earthquakes.filter(eq => eq.magnitude >= 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center items-center mb-8">
                <div className="relative">
                  <Globe2 className="w-16 h-16 text-blue-400 animate-pulse" />
                  <div className="absolute -top-2 -right-2">
                    <AlertTriangle className="w-8 h-8 text-orange-400 animate-bounce" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Bhukampa
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                Sistem Pemantauan Gempa Bumi Real-time Indonesia
              </p>
              
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Pantau aktivitas seismik terkini dengan data resmi dari BMKG. 
                Dapatkan informasi akurat dan notifikasi cepat untuk gempa bumi di seluruh Indonesia.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{earthquakes.length}</div>
                  <div className="text-gray-300">Gempa Terkini</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{majorEarthquakes.length}</div>
                  <div className="text-gray-300">Gempa Signifikan</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">Real-time</div>
                  <div className="text-gray-300">Pembaruan Data</div>
                </div>
              </div>

              {/* Notification Permission */}
              {notificationPermission === 'default' && (
                <div className="mb-8 max-w-md mx-auto">
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-sm text-orange-200 mb-3">
                      Izinkan notifikasi untuk mendapatkan peringatan gempa bumi terkini
                    </p>
                    <Button 
                      onClick={requestNotificationPermission}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Izinkan Notifikasi
                    </Button>
                  </div>
                </div>
              )}

              {notificationPermission === 'granted' && (
                <div className="mb-8 max-w-md mx-auto">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Bell className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-200 text-sm">Notifikasi Aktif</span>
                    </div>
                    <p className="text-xs text-green-300">
                      Anda akan menerima notifikasi untuk gempa M4.0+ dalam 10 menit terakhir
                    </p>
                  </div>
                </div>
              )}

              {/* Main CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/monitor">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Telusuri Gempa Bumi
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-300 text-gray-200 bg-transparent text-gray-200 px-8 py-4 text-lg rounded-xl"
                  onClick={() => document.getElementById('recent-earthquakes')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Lihat Data Terkini
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earthquakes Section */}
      <div id="recent-earthquakes" className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Gempa Bumi Terkini</h2>
            <p className="text-gray-400">Aktivitas seismik terbaru dari seluruh Indonesia</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSkeleton />
            </div>
          ) : error ? (
            <div className="text-center text-red-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p className="mb-4">{error}</p>
              <Button 
                onClick={loadEarthquakeData}
                className="bg-red-500 hover:bg-red-600"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Earthquakes List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">3 Gempa Terbaru</h3>
                {recentEarthquakes.length > 0 ? recentEarthquakes.map((earthquake) => (
                  <div key={earthquake.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            earthquake.magnitude >= 5 ? 'bg-red-500' : 
                            earthquake.magnitude >= 4 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-white font-semibold">
                            M {earthquake.magnitude.toFixed(1)}
                          </span>
                        </div>
                        <h4 className="text-white font-medium mb-1">{earthquake.location}</h4>
                        <p className="text-gray-400 text-sm">
                          {earthquake.date} • {earthquake.time}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Kedalaman: {earthquake.depth} km • {earthquake.felt}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Tidak ada data gempa bumi terkini</p>
                  </div>
                )}
              </div>

              {/* Map Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Peta Sebaran Gempa</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  {earthquakes.length > 0 ? (
                    <EarthquakeMap earthquakes={earthquakes} />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Globe2 className="w-12 h-12 mx-auto mb-2" />
                        <p>Peta akan ditampilkan setelah data tersedia</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Earthquake Information Section */}
      <div className="py-16 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Informasi Gempa Bumi</h2>
            <p className="text-gray-400">Pahami lebih dalam tentang fenomena gempa bumi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Basic Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Apa Itu Gempa Bumi?</h3>
              <div className="space-y-4 text-gray-300">
                <p>Gempa bumi adalah getaran atau guncangan yang terjadi di permukaan bumi akibat pelepasan energi secara tiba-tiba dari dalam bumi.</p>
                <p>Penyebab utama gempa bumi:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pergerakan lempeng tektonik</li>
                  <li>Aktivitas vulkanik</li>
                  <li>Runtuhan batuan</li>
                </ul>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Tips Keselamatan</h3>
              <div className="space-y-4 text-gray-300">
                <p>Yang harus dilakukan saat gempa terjadi:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Jangan panik, cari tempat berlindung yang aman</li>
                  <li>Lindungi kepala dengan tangan atau benda keras</li>
                  <li>Jauhi jendela, rak, atau benda yang mungkin jatuh</li>
                  <li>Jika di luar, jauhi bangunan dan tiang listrik</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Pertanyaan Umum</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Apa yang dimaksud dengan magnitudo gempa?</h4>
                <p className="text-gray-400">Magnitudo adalah ukuran kekuatan gempa yang dihitung berdasarkan energi yang dilepaskan. Skala Richter adalah yang paling umum digunakan.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Mengapa Indonesia sering mengalami gempa?</h4>
                <p className="text-gray-400">Indonesia terletak di pertemuan tiga lempeng tektonik utama (Eurasia, Indo-Australia, dan Pasifik) yang aktif bergerak.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Bagaimana cara membedakan gempa tektonik dan vulkanik?</h4>
                <p className="text-gray-400">Gempa tektonik disebabkan pergerakan lempeng, sedangkan vulkanik terkait aktivitas gunung berapi. Gempa vulkanik biasanya lebih lokal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              Dibuat oleh <span className="text-white font-semibold">Muhammad Fathurachman</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Data gempa bumi bersumber dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
