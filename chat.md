sekarang dalam page monitor tampilkan data apa yang ingin di tampilkan di disitu nanti di fetch ulang

1. apinya seperti ini 
http://localhost:4000/api/v1/earthquake/latest 
method get
response body seperti ini
{
  "status": true,
  "message": "Berhasil mengambil data gempa bumi terbaru",
  "data": {
    "Tanggal": "17 Jun 2025",
    "Jam": "21:51:49 WIB",
    "DateTime": "2025-06-17T14:51:49+00:00",
    "Coordinates": "-4.23,122.60",
    "Lintang": "4.23 LS",
    "Bujur": "122.60 BT",
    "Magnitude": "2.6",
    "Kedalaman": "5 km",
    "Wilayah": "Pusat gempa berada di darat 3 km BaratDaya Moramo, Konawe Selatan",
    "Potensi": "Gempa ini dirasakan untuk diteruskan pada masyarakat",
    "Dirasakan": "III Konawe Selatan",
    "Shakemap": "20250617215149.mmi.jpg"
  }
}

2. http://localhost:4000/api/v1/earthquake/latest-15
method get
{
  "status": true,
  "message": "Berhasil mengambil data 15 gempa bumi terbaru",
  "data": [
    {
      "Tanggal": "17 Jun 2025",
      "Jam": "13:25:35 WIB",
      "DateTime": "2025-06-17T06:25:35+00:00",
      "Coordinates": "2.21,126.59",
      "Lintang": "2.21 LU",
      "Bujur": "126.59 BT",
      "Magnitude": "5.1",
      "Kedalaman": "50 km",
      "Wilayah": "132 km BaratDaya PULAUDOI-MALUT",
      "Potensi": "Tidak berpotensi tsunami"
    },

3. http://localhost:4000/api/v1/earthquake/felt

method get
{
  "status": true,
  "message": "Berhasil mengambil data gempa bumi yang dirasakan",
  "data": [
    {
      "Tanggal": "17 Jun 2025",
      "Jam": "21:51:49 WIB",
      "DateTime": "2025-06-17T14:51:49+00:00",
      "Coordinates": "-4.23,122.60",
      "Lintang": "4.23 LS",
      "Bujur": "122.60 BT",
      "Magnitude": "2.6",
      "Kedalaman": "5 km",
      "Wilayah": "Pusat gempa berada di darat 3 km BaratDaya Moramo, Konawe Selatan",
      "Dirasakan": "III Konawe Selatan"
    },
    {
      "Tanggal": "17 Jun 2025",
      "Jam": "21:21:12 WIB",
      "DateTime": "2025-06-17T14:21:12+00:00",
      "Coordinates": "-8.44,117.90",
      "Lintang": "8.44 LS",
      "Bujur": "117.90 BT",
      "Magnitude": "4.1",
      "Kedalaman": "10 km",
      "Wilayah": "Pusat gempa berada di laut 53 km Timurlaut SUMBAWA",
      "Dirasakan": "III Sumbawa, III Dompu"
    },
    {
      "Tanggal": "17 Jun 2025",
      "Jam": "21:06:16 WIB",
      "DateTime": "2025-06-17T14:06:16+00:00",
      "Coordinates": "-4.59,102.14",
      "Lintang": "4.59 LS",
      "Bujur": "102.14 BT",
      "Magnitude": "4.3",
      "Kedalaman": "22 km",
      "Wilayah": "Pusat gempa berada di laut 74 km Baratdaya SELUMA",
      "Dirasakan": "II - III Seluma"
    },

4. 'http://localhost:4000/api/v1/earthquake/all'
{
  "status": true,
  "message": "Berhasil mengambil semua data gempa bumi",
  "data": {
    "latest": {
      "Tanggal": "17 Jun 2025",
      "Jam": "21:51:49 WIB",
      "DateTime": "2025-06-17T14:51:49+00:00",
      "Coordinates": "-4.23,122.60",
      "Lintang": "4.23 LS",
      "Bujur": "122.60 BT",
      "Magnitude": "2.6",
      "Kedalaman": "5 km",
      "Wilayah": "Pusat gempa berada di darat 3 km BaratDaya Moramo, Konawe Selatan",
      "Potensi": "Gempa ini dirasakan untuk diteruskan pada masyarakat",
      "Dirasakan": "III Konawe Selatan",
      "Shakemap": "20250617215149.mmi.jpg"
    },
    "latest15": [
      {
        "Tanggal": "17 Jun 2025",
        "Jam": "13:25:35 WIB",
        "DateTime": "2025-06-17T06:25:35+00:00",
        "Coordinates": "2.21,126.59",
        "Lintang": "2.21 LU",
        "Bujur": "126.59 BT",
        "Magnitude": "5.1",
        "Kedalaman": "50 km",
        "Wilayah": "132 km BaratDaya PULAUDOI-MALUT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "13 Jun 2025",
        "Jam": "09:28:06 WIB",
        "DateTime": "2025-06-13T02:28:06+00:00",
        "Coordinates": "-10.94,119.33",
        "Lintang": "10.94 LS",
        "Bujur": "119.33 BT",
        "Magnitude": "5.2",
        "Kedalaman": "59 km",
        "Wilayah": "118 km BaratDaya KARERA-SUMBATIMUR-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "12 Jun 2025",
        "Jam": "21:23:26 WIB",
        "DateTime": "2025-06-12T14:23:26+00:00",
        "Coordinates": "-5.97,130.41",
        "Lintang": "5.97 LS",
        "Bujur": "130.41 BT",
        "Magnitude": "5.1",
        "Kedalaman": "138 km",
        "Wilayah": "243 km BaratLaut TANIMBAR",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "12 Jun 2025",
        "Jam": "16:41:23 WIB",
        "DateTime": "2025-06-12T09:41:23+00:00",
        "Coordinates": "-3.25,130.35",
        "Lintang": "3.25 LS",
        "Bujur": "130.35 BT",
        "Magnitude": "5.0",
        "Kedalaman": "10 km",
        "Wilayah": "22 km BaratDaya SERAMBAGIANTIMUR-MALUKU",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "09 Jun 2025",
        "Jam": "23:55:06 WIB",
        "DateTime": "2025-06-09T16:55:06+00:00",
        "Coordinates": "-8.08,108.72",
        "Lintang": "8.08 LS",
        "Bujur": "108.72 BT",
        "Magnitude": "5.0",
        "Kedalaman": "47 km",
        "Wilayah": "48 km Tenggara KAB-PANGANDARAN-JABAR",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "05 Jun 2025",
        "Jam": "17:05:08 WIB",
        "DateTime": "2025-06-05T10:05:08+00:00",
        "Coordinates": "4.33,125.83",
        "Lintang": "4.33 LU",
        "Bujur": "125.83 BT",
        "Magnitude": "5.0",
        "Kedalaman": "76 km",
        "Wilayah": "88 km TimurLaut TAHUNA-KEP.SANGIHE-SULUT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "04 Jun 2025",
        "Jam": "10:43:11 WIB",
        "DateTime": "2025-06-04T03:43:11+00:00",
        "Coordinates": "-3.18,131.12",
        "Lintang": "3.18 LS",
        "Bujur": "131.12 BT",
        "Magnitude": "5.3",
        "Kedalaman": "58 km",
        "Wilayah": "70 km Tenggara SERAMBAGIANTIMUR-MALUKU",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "31 Mei 2025",
        "Jam": "22:21:18 WIB",
        "DateTime": "2025-05-31T15:21:18+00:00",
        "Coordinates": "-9.13,124.04",
        "Lintang": "9.13 LS",
        "Bujur": "124.04 BT",
        "Magnitude": "5.1",
        "Kedalaman": "60 km",
        "Wilayah": "71 km BaratLaut TIMORTENGAHUT-NTT",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "29 Mei 2025",
        "Jam": "06:36:27 WIB",
        "DateTime": "2025-05-28T23:36:27+00:00",
        "Coordinates": "-1.87,140.09",
        "Lintang": "1.87 LS",
        "Bujur": "140.09 BT",
        "Magnitude": "5.0",
        "Kedalaman": "10 km",
        "Wilayah": "86 km BaratLaut KAB-JAYAPURA-PAPUA",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "27 Mei 2025",
        "Jam": "07:55:05 WIB",
        "DateTime": "2025-05-27T00:55:05+00:00",
        "Coordinates": "-10.41,110.25",
        "Lintang": "10.41 LS",
        "Bujur": "110.25 BT",
        "Magnitude": "5.7",
        "Kedalaman": "10 km",
        "Wilayah": "265 km BaratDaya PACITAN-JATIM",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "23 Mei 2025",
        "Jam": "02:52:37 WIB",
        "DateTime": "2025-05-22T19:52:37+00:00",
        "Coordinates": "-4.17,102.17",
        "Lintang": "4.17 LS",
        "Bujur": "102.17 BT",
        "Magnitude": "6.3",
        "Kedalaman": "10 km",
        "Wilayah": "43 km BaratDaya BENGKULU-BENGKULU",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "20 Mei 2025",
        "Jam": "04:36:10 WIB",
        "DateTime": "2025-05-19T21:36:10+00:00",
        "Coordinates": "-11.05,111.07",
        "Lintang": "11.05 LS",
        "Bujur": "111.07 BT",
        "Magnitude": "5.1",
        "Kedalaman": "10 km",
        "Wilayah": "319 km BaratDaya PACITAN-JATIM",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "18 Mei 2025",
        "Jam": "11:53:55 WIB",
        "DateTime": "2025-05-18T04:53:55+00:00",
        "Coordinates": "-10.54,116.16",
        "Lintang": "10.54 LS",
        "Bujur": "116.16 BT",
        "Magnitude": "5.2",
        "Kedalaman": "10 km",
        "Wilayah": "204 km BaratDaya LOMBOKTENGAH-NTB",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "15 Mei 2025",
        "Jam": "07:50:49 WIB",
        "DateTime": "2025-05-15T00:50:49+00:00",
        "Coordinates": "-7.32,126.30",
        "Lintang": "7.32 LS",
        "Bujur": "126.30 BT",
        "Magnitude": "5.9",
        "Kedalaman": "515 km",
        "Wilayah": "189 km BaratLaut MALUKUBRTDAYA",
        "Potensi": "Tidak berpotensi tsunami"
      },
      {
        "Tanggal": "12 Mei 2025",
        "Jam": "10:09:39 WIB",
        "DateTime": "2025-05-12T03:09:39+00:00",
        "Coordinates": "1.11,98.81",
        "Lintang": "1.11 LU",
        "Bujur": "98.81 BT",
        "Magnitude": "5.3",
        "Kedalaman": "88 km",
        "Wilayah": "59 km BaratDaya PADANGSIDEMPUAN-SUMUT",
        "Potensi": "Tidak berpotensi tsunami"
      }
    ],
    "felt": [
      {
        "Tanggal": "17 Jun 2025",
        "Jam": "21:51:49 WIB",
        "DateTime": "2025-06-17T14:51:49+00:00",
        "Coordinates": "-4.23,122.60",
        "Lintang": "4.23 LS",
        "Bujur": "122.60 BT",
        "Magnitude": "2.6",
        "Kedalaman": "5 km",
        "Wilayah": "Pusat gempa berada di darat 3 km BaratDaya Moramo, Konawe Selatan",
        "Dirasakan": "III Konawe Selatan"
      },
      {
        "Tanggal": "17 Jun 2025",
        "Jam": "21:21:12 WIB",
        "DateTime": "2025-06-17T14:21:12+00:00",
        "Coordinates": "-8.44,117.90",
        "Lintang": "8.44 LS",
        "Bujur": "117.90 BT",
        "Magnitude": "4.1",
        "Kedalaman": "10 km",
        "Wilayah": "Pusat gempa berada di laut 53 km Timurlaut SUMBAWA",
        "Dirasakan": "III Sumbawa, III Dompu"
      },
      {
        "Tanggal": "17 Jun 2025",
        "Jam": "21:06:16 WIB",
        "DateTime": "2025-06-17T14:06:16+00:00",
        "Coordinates": "-4.59,102.14",
        "Lintang": "4.59 LS",
        "Bujur": "102.14 BT",
        "Magnitude": "4.3",
        "Kedalaman": "22 km",
        "Wilayah": "Pusat gempa berada di laut 74 km Baratdaya SELUMA",
        "Dirasakan": "II - III Seluma"
      },
      {
        "Tanggal": "17 Jun 2025",
        "Jam": "06:05:26 WIB",
        "DateTime": "2025-06-16T23:05:26+00:00",
        "Coordinates": "-4.09,121.66",
        "Lintang": "4.09 LS",
        "Bujur": "121.66 BT",
        "Magnitude": "2.9",
        "Kedalaman": "5 km",
        "Wilayah": "Pusat gempa berada di darat 2 km timurlaut Wundulako, Kolaka",
        "Dirasakan": "II-III Kolaka"
      },
      {
        "Tanggal": "16 Jun 2025",
        "Jam": "18:45:03 WIB",
        "DateTime": "2025-06-16T11:45:03+00:00",
        "Coordinates": "-1.08,129.68",
        "Lintang": "1.08 LS",
        "Bujur": "129.68 BT",
        "Magnitude": "4.2",
        "Kedalaman": "13 km",
        "Wilayah": "Pusat gempa berada di laut 148 km barat daya Raja Ampat",
        "Dirasakan": "II Raja Ampat"
      },
      {
        "Tanggal": "16 Jun 2025",
        "Jam": "10:51:02 WIB",
        "DateTime": "2025-06-16T03:51:02+00:00",
        "Coordinates": "-2.52,121.12",
        "Lintang": "2.52 LS",
        "Bujur": "121.12 BT",
        "Magnitude": "3.6",
        "Kedalaman": "2 km",
        "Wilayah": "Pusat gempa berada di darat 9 km barat laut Luwu Timur",
        "Dirasakan": "III Malili"
      },
      {
        "Tanggal": "16 Jun 2025",
        "Jam": "10:09:01 WIB",
        "DateTime": "2025-06-16T03:09:01+00:00",
        "Coordinates": "0.73,118.68",
        "Lintang": "0.73 LU",
        "Bujur": "118.68 BT",
        "Magnitude": "4.8",
        "Kedalaman": "10 km",
        "Wilayah": "Pusat gempa berada di laut 149 km timur laut Bontang",
        "Dirasakan": "II - III Tarakan, II-III Sandaran, II-III Biduk - Biduk"
      },
      {
        "Tanggal": "15 Jun 2025",
        "Jam": "23:31:16 WIB",
        "DateTime": "2025-06-15T16:31:16+00:00",
        "Coordinates": "-8.18,107.64",
        "Lintang": "8.18 LS",
        "Bujur": "107.64 BT",
        "Magnitude": "4.8",
        "Kedalaman": "10 km",
        "Wilayah": "Pusat gempa berada di laut 104 km baratdaya Kab. Tasikmalaya",
        "Dirasakan": "II-III Pangandaran, II-III Tasikmalaya"
      },
      {
        "Tanggal": "15 Jun 2025",
        "Jam": "18:28:23 WIB",
        "DateTime": "2025-06-15T11:28:23+00:00",
        "Coordinates": "4.81,96.11",
        "Lintang": "4.81 LU",
        "Bujur": "96.11 BT",
        "Magnitude": "4.4",
        "Kedalaman": "5 km",
        "Wilayah": "Pusat gempa berada di darat 27 km baratdaya Kab. Pidie Jaya",
        "Dirasakan": "II-III Lamno, Aceh Jaya, III Mane, Pidie"
      },
      {
        "Tanggal": "15 Jun 2025",
        "Jam": "14:42:14 WIB",
        "DateTime": "2025-06-15T07:42:14+00:00",
        "Coordinates": "-8.24,112.99",
        "Lintang": "8.24 LS",
        "Bujur": "112.99 BT",
        "Magnitude": "3.1",
        "Kedalaman": "15 km",
        "Wilayah": "Pusat gempa berada di darat 28 km BaratDaya Lumajang",
        "Dirasakan": "II - III Lumajang"
      },
      {
        "Tanggal": "15 Jun 2025",
        "Jam": "13:49:45 WIB",
        "DateTime": "2025-06-15T06:49:45+00:00",
        "Coordinates": "-3.52,102.51",
        "Lintang": "3.52 LS",
        "Bujur": "102.51 BT",
        "Magnitude": "3.5",
        "Kedalaman": "6 km",
        "Wilayah": "Pusat gempa berada di darat 5 km BaratDaya REJANGLEBONG",
        "Dirasakan": "III Curup"
      },
      {
        "Tanggal": "15 Jun 2025",
        "Jam": "11:08:44 WIB",
        "DateTime": "2025-06-15T04:08:44+00:00",
        "Coordinates": "-3.36,129.16",
        "Lintang": "3.36 LS",
        "Bujur": "129.16 BT",
        "Magnitude": "3.3",
        "Kedalaman": "10 km",
        "Wilayah": "Pusat gempa berada di darat 26 km timur Masohi, Maluku tengah",
        "Dirasakan": "III Amahai"
      },
      {
        "Tanggal": "14 Jun 2025",
        "Jam": "11:58:00 WIB",
        "DateTime": "2025-06-14T04:58:00+00:00",
        "Coordinates": "-5.40,104.67",
        "Lintang": "5.40 LS",
        "Bujur": "104.67 BT",
        "Magnitude": "3.7",
        "Kedalaman": "5 km",
        "Wilayah": "Pusat gempa berada di darat 9 km barat laut Tanggamus",
        "Dirasakan": "III Kota Agung, II Ulu Belu"
      },
      {
        "Tanggal": "14 Jun 2025",
        "Jam": "05:31:53 WIB",
        "DateTime": "2025-06-13T22:31:53+00:00",
        "Coordinates": "-6.84,107.11",
        "Lintang": "6.84 LS",
        "Bujur": "107.11 BT",
        "Magnitude": "2.5",
        "Kedalaman": "6 km",
        "Wilayah": "Pusat gempa berada di darat 3 km baratdaya Kab. Cianjur",
        "Dirasakan": "II-III Nagrak, II-III WarungKondang, II Mekarsari, II-III Cilaku"
      },
      {
        "Tanggal": "13 Jun 2025",
        "Jam": "00:49:43 WIB",
        "DateTime": "2025-06-12T17:49:43+00:00",
        "Coordinates": "-7.87,113.76",
        "Lintang": "7.87 LS",
        "Bujur": "113.76 BT",
        "Magnitude": "3.6",
        "Kedalaman": "2 km",
        "Wilayah": "Pusat gempa berada di darat 20 km barat laut Bondowoso",
        "Dirasakan": "III-IV Situbondo"
      }
    ]
  }
}

tolong disesuaikan nanti akan ada dropdown jadi user mau ambil data yang mana saja