export const COUNTRIES = ['Indonesia', 'Thailand', 'Cambodia', 'Vietnam', 'Malaysia', 'Laos']

export const COUNTRY_META = {
  Indonesia: {
    flag: '🇮🇩',
    label: 'Wonderful Nusantara',
    desc: 'Dari magisnya pantai tersembunyi Bali & Nusa Penida, kemegahan naga purba Labuan Bajo Komodo, gugusan karang surga Raja Ampat, hingga matahari terbit di atas kaldera Gunung Bromo.'
  },
  Thailand: {
    flag: '🇹🇭',
    label: 'Amazing Siam',
    desc: 'Pesona kuil emas megah di Bangkok, surga bahari tebing kapur Phuket & Krabi, festival lampion Chiang Mai, hingga kuliner jalanan legendaris kelas dunia.'
  },
  Cambodia: {
    flag: '🇰🇭',
    label: 'Kingdom of Wonder',
    desc: 'Mahakarya arsitektur kuno terbesar dunia Angkor Wat di Siem Reap, ketenangan pesisir pulau Koh Rong, dan kemegahan istana kerajaan Phnom Penh.'
  },
  Vietnam: {
    flag: '🇻🇳',
    label: 'Timeless Charm',
    desc: 'Pelayaran perahu tradisional di antara ribuan karst Ha Long Bay, gemerlap ribuan lampion kota tua Hoi An, teras sawah berkabut Sapa, dan pesona Da Nang.'
  },
  Malaysia: {
    flag: '🇲🇾',
    label: 'Truly Asia',
    desc: 'Perpaduan modernitas Menara Kembar Petronas Kuala Lumpur, warisan sejarah kuliner UNESCO di Penang & Melaka, hingga surga tropis Langkawi & Borneo.'
  },
  Laos: {
    flag: '🇱🇦',
    label: 'Simply Beautiful',
    desc: 'Kedamaian spiritual kota pusaka Luang Prabang, ritual sedekah pagi para biksu, keajaiban air terjun bertingkat Kuang Si, dan pelayaran tenang di Sungai Mekong.'
  }
}

export const TRAVEL_PACKAGES = {
  Indonesia: [
    {
      sub: 'Bali & Nusa Penida Island Escape (4D3N)',
      badge: 'Best Seller',
      price: 'Rp 3.850.000 / Pax',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
      desc: 'Eksplorasi lengkap Kelingking T-Rex Cliff, Diamond Beach, Ubud Sacred Monkey Forest, Tegalalang Rice Terrace, dan menginap di villa private pool.'
    },
    {
      sub: 'Labuan Bajo & Komodo Liveaboard Luxury Phinisi (3D2N)',
      badge: 'Premium VIP',
      price: 'Rp 5.750.000 / Pax',
      img: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80',
      desc: 'Menginap di atas kapal Phinisi mewah, menyaksikan sunrise Puncak Padar, bersantai di Pink Beach, snorkeling bersama Manta Ray, dan tracking habitat Komodo.'
    },
    {
      sub: 'Raja Ampat Wayag & Misool Ultimate Paradise (5D4N)',
      badge: 'All-Inclusive',
      price: 'Rp 11.500.000 / Pax',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      desc: 'Petualangan eksklusif ke jantung segitiga karang dunia: Puncak Karst Wayag, Piaynemo Viewpoint, Danau Ubur-Ubur Misool, dan eco-resort tepi laut.'
    },
    {
      sub: 'Bromo Midnight & Ijen Blue Fire Adventure (3D2N)',
      badge: 'Favorit Traveler',
      price: 'Rp 2.450.000 / Pax',
      img: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=900&q=80',
      desc: 'Jelajah Jeep 4WD sunrise Bromo di Penanjakan, Lautan Pasir Berbisik, Kawah Bromo, dan pendakian malam menyaksikan api biru kawah Ijen yang langka.'
    },
    {
      sub: 'Yogyakarta Cultural & Borobudur Sunrise (3D2N)',
      badge: 'Warisan Budaya',
      price: 'Rp 2.150.000 / Pax',
      img: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyaksikan magisnya terbit matahari di Candi Borobudur, kemegahan Candi Prambanan, Keraton Kesultanan, dan petualangan Goa Pindul.'
    },
    {
      sub: 'Derawan & Maratua Stingless Jellyfish Island (4D3N)',
      badge: 'Bahari Eksotis',
      price: 'Rp 4.900.000 / Pax',
      img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
      desc: 'Berenang aman bersama jutaan ubur-ubur tanpa sengat di Danau Kakaban, snorkeling bersama penyu hijau raksasa di Sangalaki, dan danau Labuan Cermin.'
    },
    {
      sub: 'Tana Toraja Mystical Highlands (4D3N)',
      badge: 'Etnik Eksklusif',
      price: 'Rp 4.200.000 / Pax',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyelami warisan leluhur Toraja: Rumah Tongkonan kuno, kuburan tebing batu Lemo, pohon pemakaman Passiliran, dan perkebunan kopi Arabika pegunungan.'
    },
    {
      sub: 'Belitung Island Hopping & Granite Geopark (3D2N)',
      badge: 'Pantai Granit',
      price: 'Rp 2.650.000 / Pax',
      img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80',
      desc: 'Jelajah pulau batu granit raksasa khas film Laskar Pelangi: Mercusuar Pulau Lengkuas, Batu Berlayar, Danau Kaolin biru kristal, dan kuliner laut segar.'
    }
  ],
  Thailand: [
    {
      sub: 'Bangkok Grand Palace & Chao Phraya Cruise (4D3N)',
      badge: 'Best Seller',
      price: 'Rp 4.350.000 / Pax',
      img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
      desc: 'Kemegahan kuil emas Wat Arun dan Grand Palace, makan malam romantis di atas kapal pesiar Sungai Chao Phraya, serta wisata belanja Pratunam.'
    },
    {
      sub: 'Phuket & Phi Phi Maya Bay Speedboat (4D3N)',
      badge: 'Favorit Liburan',
      price: 'Rp 5.250.000 / Pax',
      img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyusuri teluk terindah dunia di Maya Bay, berenang di perairan toska laguna Pileh, mengunjungi Monkey Beach, dan hiburan malam seru di Patong.'
    },
    {
      sub: 'Chiang Mai Cultural & Elephant Sanctuary (4D3N)',
      badge: 'Pegunungan Sejuk',
      price: 'Rp 4.950.000 / Pax',
      img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
      desc: 'Interaksi etis memberi makan dan memandikan gajah di konservasi alam, kunjungan ke kuil sakral Doi Suthep, dan White Temple Chiang Rai.'
    },
    {
      sub: 'Krabi 4 Islands & Emerald Pool Expedition (3D2N)',
      badge: 'Hidden Gem',
      price: 'Rp 3.900.000 / Pax',
      img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
      desc: 'Tebing karst megah Pantai Railay, kolam air alami Emerald Pool di tengah hutan hujan, pemandian air panas alami, dan fenomena pasir timbul Talay Waek.'
    },
    {
      sub: 'Koh Samui & Ang Thong Marine Park (4D3N)',
      badge: 'Resort Tropis',
      price: 'Rp 6.100.000 / Pax',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
      desc: 'Liburan santai di resor pantai mewah Koh Samui, kayaking menyusuri 42 gugusan pulau karst taman laut Ang Thong, dan sunset sailing catamaran.'
    },
    {
      sub: 'Ayutthaya UNESCO Heritage & River Boat (2D1N)',
      badge: 'Sejarah Kuno',
      price: 'Rp 2.200.000 / Pax',
      img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
      desc: 'Melihat kepala Buddha legendaris yang terlilit akar pohon di Wat Mahathat, reruntuhan istana kuno Kerajaan Siam, dan wisata kuliner roti sai mai.'
    },
    {
      sub: 'Hua Hin Royal Seaside & Vineyard (3D2N)',
      badge: 'Keluarga & Santai',
      price: 'Rp 3.750.000 / Pax',
      img: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80',
      desc: 'Kota peristirahatan musim panas kerajaan dengan pantai pasir putih tenang, tur kebun anggur Monsoon Valley, dan pasar seni malam Cicada.'
    },
    {
      sub: 'Khao Sok Rainforest & Cheow Lan Floating Villa (3D2N)',
      badge: 'Jungle & Lake',
      price: 'Rp 4.600.000 / Pax',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      desc: 'Menginap di bungalow apung danau hijau zamrud Cheow Lan, safari perahu mencari satwa liar di hutan hujan tertua dunia, dan trekking gua stalaktit.'
    }
  ],
  Cambodia: [
    {
      sub: 'Angkor Wat Grand Sunrise & Siem Reap (4D3N)',
      badge: 'Best Seller',
      price: 'Rp 4.850.000 / Pax',
      img: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyaksikan matahari terbit spektakuler di Candi Angkor Wat, Kuil Bayon dengan 216 pahatan wajah tersenyum, dan kuil rimba Ta Prohm (Tomb Raider).'
    },
    {
      sub: 'Phnom Penh Royal Palace & Mekong River (3D2N)',
      badge: 'Ibukota Sejarah',
      price: 'Rp 3.650.000 / Pax',
      img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
      desc: 'Keagungan Istana Kerajaan Kamboja, Pagoda Perak berlapiskan 5.000 ubin perak, Monumen Kemerdekaan, dan pelayaran santai matahari terbenam Sungai Mekong.'
    },
    {
      sub: 'Koh Rong Sanloem White Sand Island (3D2N)',
      badge: 'Surga Tropis',
      price: 'Rp 3.950.000 / Pax',
      img: 'https://images.unsplash.com/photo-1510414842594-a61752afb394?auto=format&fit=crop&w=900&q=80',
      desc: 'Liburan bebas polusi di pulau berpasir putih sehalus tepung, bungalow tepi pantai Saracen Bay, dan perenang malam melihat kilauan plankton bercahaya.'
    },
    {
      sub: 'Battambang Bamboo Train & Bat Cave (3D2N)',
      badge: 'Autentik Tradisional',
      price: 'Rp 3.200.000 / Pax',
      img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
      desc: 'Sensasi seru menaiki kereta bambu tradisional Nori, menyaksikan jutaan kelelawar terbang serempak saat senja di Phnom Sampeau, dan arsitektur era Prancis.'
    },
    {
      sub: 'Banteay Srei & Phnom Kulen Holy Waterfall (3D2N)',
      badge: 'Ukiran Batu Halus',
      price: 'Rp 3.800.000 / Pax',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
      desc: 'Kuil batu pasir merah muda Banteay Srei dengan detail ukiran paling rumit di dunia, serta air terjun keramat dan relief dasar sungai Kbal Spean.'
    },
    {
      sub: 'Kampot Pepper Plantation & Kep Seafood (3D2N)',
      badge: 'Kuliner & Sungai',
      price: 'Rp 3.450.000 / Pax',
      img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
      desc: 'Menikmati kebun lada terbaik dunia di Kampot, perahu kunang-kunang di sungai saat malam, dan pesta kepiting lada hijau segar di Pasar Kep.'
    },
    {
      sub: 'Preah Vihear Mountain Clifftop Temple (2D1N)',
      badge: 'Puncak Spektakuler',
      price: 'Rp 4.100.000 / Pax',
      img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
      desc: 'Kuil kuno abad ke-9 yang bertengger gagah di tebing setinggi 525 meter di Pegunungan Dângrêk dengan panorama luas tanpa batas.'
    },
    {
      sub: 'Cardamom Rainforest Eco Safari Glamping (4D3N)',
      badge: 'Petualangan Rimba',
      price: 'Rp 5.800.000 / Pax',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
      desc: 'Menginap di tenda glamping mewah di tengah rimba Pegunungan Cardamom, kayaking di sungai berkabut, dan konservasi satwa liar bersama ranger.'
    }
  ],
  Vietnam: [
    {
      sub: 'Ha Long Bay 5-Star Luxury Cruise (3D2N)',
      badge: 'Best Seller',
      price: 'Rp 4.950.000 / Pax',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
      desc: 'Berlayar santai di antara 1.900 gugusan pulau batu kapur, eksplorasi Gua Sung Sot (Surprise Cave), kayaking laguna tersembunyi, dan santapan hidangan laut.'
    },
    {
      sub: 'Da Nang, Ba Na Hills & Golden Bridge (4D3N)',
      badge: 'Favorit Keluarga',
      price: 'Rp 4.750.000 / Pax',
      img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
      desc: 'Berjalan di atas Jembatan Tangan Emas raksasa Ba Na Hills, menikmati kereta gantung terpanjang di dunia, dan bersantai di pantai indah Da Nang.'
    },
    {
      sub: 'Hoi An Ancient Lantern Town & Cooking (3D2N)',
      badge: 'Kota Romantis',
      price: 'Rp 3.850.000 / Pax',
      img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyusuri jalanan kota tua warisan dunia bertabur ribuan lampion sutra warna-warni, naik perahu perahu keranjang kelapa Cam Thanh, dan kelas memasak Pho.'
    },
    {
      sub: 'Hanoi Heritage & Ninh Binh Trang An Boat (4D3N)',
      badge: 'Pesona Utara',
      price: 'Rp 4.450.000 / Pax',
      img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
      desc: 'Menelusuri 36 jalanan kuno Old Quarter Hanoi, Danau Pedang Hoan Kiem, serta naik perahu sampan melintasi gua-gua air di perbukitan karst Trang An.'
    },
    {
      sub: 'Sapa Valley, Rice Terraces & Fansipan (4D3N)',
      badge: 'Negeri di Atas Awan',
      price: 'Rp 4.650.000 / Pax',
      img: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=900&q=80',
      desc: 'Menaklukkan puncak tertinggi Indochina Fansipan (3.143 mdpl), trekking melintasi teras sawah terindah di Lembah Muong Hoa, dan kebudayaan suku Hmong.'
    },
    {
      sub: 'Ho Chi Minh City & Cu Chi Historical Tunnels (3D2N)',
      badge: 'Metropolitan & Sejarah',
      price: 'Rp 3.900.000 / Pax',
      img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
      desc: 'Menjelajahi terowongan gerilya bawah tanah Cu Chi sepanjang 250 km, Katedral Notre Dame Saigon, Kantor Pos Pusat Kolonial, dan pasar malam Ben Thanh.'
    },
    {
      sub: 'Phu Quoc Island Resort & Hon Thom Cable Car (4D3N)',
      badge: 'Resort Pulau Tropis',
      price: 'Rp 5.400.000 / Pax',
      img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=900&q=80',
      desc: 'Pasir putih pantai Bai Sao, kereta gantung lintas laut terpanjang dunia menuju Pulau Hon Thom, snorkeling terumbu karang An Thoi, dan sunset cocktail bar.'
    },
    {
      sub: 'Phong Nha Ke Bang & Paradise Cave Exploration (3D2N)',
      badge: 'Keajaiban Bawah Tanah',
      price: 'Rp 4.300.000 / Pax',
      img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
      desc: 'Eksplorasi sistem gua kapur terbesar di dunia: Gua Paradise dengan formasi stalaktit berkilau kristal spektakuler, dan petualangan zipline sungai biru.'
    }
  ],
  Malaysia: [
    {
      sub: 'Kuala Lumpur Skyline & Genting Highlands (3D2N)',
      badge: 'Best Seller',
      price: 'Rp 3.250.000 / Pax',
      img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
      desc: 'Foto spektakuler di Menara Kembar Petronas KLCC, tangga pelangi 272 anak tangga Batu Caves, kereta gantung kaca Awana, dan taman rekreasi Genting SkyWorlds.'
    },
    {
      sub: 'Penang George Town Heritage & Food Trail (3D2N)',
      badge: 'Kuliner Legendaris',
      price: 'Rp 3.450.000 / Pax',
      img: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyusuri lorong seni mural terkenal George Town, kemegahan kuil Buddha terbesar Kek Lok Si, puncak bukit Penang Hill, dan berburu jajanan kaki lima terenak.'
    },
    {
      sub: 'Langkawi Island SkyBridge & Mangrove Safari (3D2N)',
      badge: 'Pulau Bebas Bea',
      price: 'Rp 3.650.000 / Pax',
      img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
      desc: 'Berjalan di atas jembatan gantung melengkung Langkawi SkyBridge berketinggian 660m, tur boat hutan bakau Kilim Geoforest, dan pantai pasir putih Tanjung Rhu.'
    },
    {
      sub: 'Melaka UNESCO Historic City & River Cruise (2D1N)',
      badge: 'Warisan Kolonial',
      price: 'Rp 2.150.000 / Pax',
      img: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=80',
      desc: 'Menelusuri sejarah benteng Portugis A Famosa, bangunan merah The Stadthuys Belanda, suasana malam Jonker Street, dan pelayaran perahu Sungai Melaka.'
    },
    {
      sub: 'Kota Kinabalu, Kundasang & Mount Kinabalu (4D3N)',
      badge: 'Borneo Nature',
      price: 'Rp 5.100.000 / Pax',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
      desc: 'Pemandangan spektakuler Gunung Kinabalu tertinggi di Malaysia, peternakan ala Selandia Baru di Desa Dairy Farm Kundasang, dan snorkeling pulau Manukan.'
    },
    {
      sub: 'Cameron Highlands Tea Plantation & Farms (3D2N)',
      badge: 'Hawa Sejuk Pegunungan',
      price: 'Rp 2.850.000 / Pax',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
      desc: 'Menikmati teh hangat di tengah hamparan hijau perkebunan BOH Tea Estate, memetik buah stroberi segar sendiri di kebun, dan keajaiban hutan lumut Mossy Forest.'
    },
    {
      sub: 'Redang Island White Sand & Turtle Snorkeling (3D2N)',
      badge: 'Surga Snorkeling',
      price: 'Rp 4.400.000 / Pax',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      desc: 'Pesisir pantai dengan pasir terputih dan air terjernih di semenanjung Malaysia, berenang bersama penyu liar di habitat aslinya, dan resor bintang lima.'
    },
    {
      sub: 'Johor Bahru & Legoland Malaysia Resort (3D2N)',
      badge: 'Liburan Keluarga Ceria',
      price: 'Rp 3.350.000 / Pax',
      img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=80',
      desc: 'Keseruan tanpa batas di Legoland Theme Park dan Water Park internasional, pusat perbelanjaan barang branded Johor Premium Outlets, dan kuliner Danga Bay.'
    }
  ],
  Laos: [
    {
      sub: 'Luang Prabang UNESCO Heritage & Kuang Si (4D3N)',
      badge: 'Best Seller',
      price: 'Rp 4.950.000 / Pax',
      img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=900&q=80',
      desc: 'Air terjun bertingkat biru toska Kuang Si Waterfall yang spektakuler, upacara sedekah pagi para biksu Tak Bat yang sakral, dan matahari terbenam di Gunung Phousi.'
    },
    {
      sub: 'Vang Vieng Karst Valley & Hot Air Balloon (3D2N)',
      badge: 'Petualangan Spektakuler',
      price: 'Rp 3.850.000 / Pax',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      desc: 'Sensasi terbang dengan balon udara di atas lembah bukit karst yang megah, berenang menyegarkan diri di Blue Lagoon, dan menyusuri sungai tenang Nam Song.'
    },
    {
      sub: 'Vientiane Capital Temples & Mekong Sunset (3D2N)',
      badge: 'Ibukota Damai',
      price: 'Rp 3.450.000 / Pax',
      img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
      desc: 'Stupa emas megah Pha That Luang simbol kebanggaan Laos, monumen kemenangan Patuxai berarsitektur khas, dan jalan sore di tepian Sungai Mekong.'
    },
    {
      sub: 'Si Phan Don 4000 Islands & Mekong Dolphins (4D3N)',
      badge: 'Ketenangan Tropis',
      price: 'Rp 4.600.000 / Pax',
      img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
      desc: 'Kehidupan santai tanpa terburu-buru di gugusan 4000 pulau Sungai Mekong, melihat lumba-lumba air tawar Irrawaddy yang langka, dan gemuruh air terjun Khone.'
    },
    {
      sub: 'Pakse, Bolaven Plateau & Coffee Trail (3D2N)',
      badge: 'Dataran Tinggi Kopi',
      price: 'Rp 3.950.000 / Pax',
      img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyusuri air terjun kembar tertinggi Tad Fane (120m), perkebunan kopi organik terbaik di Dataran Tinggi Bolaven, dan kuil kuno Khmer Wat Phou.'
    },
    {
      sub: 'Nong Khiaw Cloud Peak & River Cruise (3D2N)',
      badge: 'Negeri Tersembunyi',
      price: 'Rp 3.700.000 / Pax',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
      desc: 'Desa terpencil diapit tebing kapur menjulang tinggi, mendaki viewpoint Sam Soum untuk melihat lautan kabut pagi, dan pelayaran perahu kayu Sungai Nam Ou.'
    },
    {
      sub: 'Plain of Jars Mystical Megalithic Site (3D2N)',
      badge: 'Misteri Megalitikum',
      price: 'Rp 4.250.000 / Pax',
      img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
      desc: 'Menyaksikan ribuan guci batu raksasa misterius berusia lebih dari 2.000 tahun yang tersebar di perbukitan Xieng Khouang, situs warisan dunia UNESCO.'
    },
    {
      sub: 'Bokeo Rainforest Gibbon Experience Treehouse (3D2N)',
      badge: 'Kanopi Rimba Liar',
      price: 'Rp 6.800.000 / Pax',
      img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
      desc: 'Tidur di rumah pohon tertinggi di dunia di kanopi hutan hujan lindung Bokeo, meluncur dengan zipline raksasa ratusan meter, dan mendengar panggilan siamang gibbon.'
    }
  ]
}

const DEFAULT_TOUR_PACKAGES = [
  'Grand Explorer Luxury Tour',
  'Tropical Island & Beach Retreat',
  'Cultural Heritage & Temple Trail',
  'Adventure Mountain & Highlands',
  'Rainforest & National Park Expedition',
  'Coastal Breeze & Sunset Sailing',
  'Historical Wonders & Ancient Cities',
  'Private Eco Lodge Sanctuary'
]

export const getOuds = c => {
  const customList = TRAVEL_PACKAGES[c]
  return (customList || DEFAULT_TOUR_PACKAGES).map((item, i) => {
    const isObj = typeof item === 'object'
    const sub = isObj ? item.sub : `Grade A+ Super Sinking Wild ${c} Agarwood`
    const badge = isObj ? item.badge : (i < 2 ? 'Super Sinking' : 'Premium Grade')
    const desc = isObj ? item.desc : `Rare authentic wild agarwood curated directly from the deep rainforests of ${c}. High natural resin density with an everlasting, transcendent aroma.`
    const img = isObj ? item.img : 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80'
    return {
      id: i + 1,
      name: `${c} Wild Agarwood #${i + 1}`,
      sub,
      badge,
      img,
      desc
    }
  })
}
