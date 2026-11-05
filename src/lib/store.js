import { supabase } from './supabase.js'
import { getOuds as defaults, COUNTRIES as DEFAULT_COUNTRIES } from '../data/oud.js'

const CACHE_KEY = 'asian_oud_store_v4'

export const COUNTRY_META_DEFAULTS = {
  Indonesia: {
    flag: '🇮🇩',
    label: 'Nusantara Wild Agarwood',
    desc: 'Wild agarwood collection from the interior rainforests of Kalimantan, Papua, and Sumatra, featuring dense dark resin and a world-renowned legendary aromatic profile.'
  },
  Cambodia: {
    flag: '🇰🇭',
    label: 'Pursat Royal Agarwood',
    desc: 'Rare agarwood from the ancient Pursat and Koh Kong forests, celebrated for its sweet honey, ripe fruit, and antique woody character.'
  },
  Thailand: {
    flag: '🇹🇭',
    label: 'Siam Heritage Agarwood',
    desc: 'Heritage Trat and Prachinburi forest agarwood, offering warm uplifting sweet notes and exceptional natural resin distillation.'
  },
  Vietnam: {
    flag: '🇻🇳',
    label: 'Nha Trang Kinam Agarwood',
    desc: 'Legendary Khanh Hoa & Nha Trang agarwood featuring rare Kinam/Kyara resin grades with an ethereal, heavenly cool aroma.'
  },
  Malaysia: {
    flag: '🇲🇾',
    label: 'Malacca & Borneo Agarwood',
    desc: 'Dense Peninsular and Sarawak rainforest agarwood with a long-lasting, deep aromatic herbal balsamic presence.'
  },
  Laos: {
    flag: '🇱🇦',
    label: 'Champasak Forest Agarwood',
    desc: 'Pure agarwood harvested from the ancient Champasak and Attapeu forests along the Mekong river, with serene, delicate woody notes.'
  }
}

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return { ouds: [], site: {} }
}

const cached = loadCache()
export const DB = { ouds: cached.ouds || [], site: cached.site || {} }

// S(key, default) — baca nilai CMS dari DB.site
export const S = (k, d) => DB.site[k] !== undefined ? DB.site[k] : d

// saveSite — simpan satu kunci CMS ke DB lokal (optimistic update)
export const saveSite = (k, v) => { DB.site[k] = v }

// Save all site to localStorage
export const persistSite = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ouds: DB.ouds, site: DB.site }))
  } catch (e) {}
}

// Mengambil daftar negara secara dinamis dari database (DB.ouds)
export const getCountries = () => {
  if (DB.ouds && DB.ouds.length > 0) {
    const set = new Set()
    DB.ouds.forEach(item => {
      if (item.country) set.add(item.country)
    })
    const list = Array.from(set)
    if (list.length > 0) return list
  }
  return DEFAULT_COUNTRIES
}

// Mengambil metadata negara (flag, label, deskripsi)
export const getCountryMeta = country => {
  return COUNTRY_META_DEFAULTS[country] || {
    flag: '🌏',
    label: `${country} Agarwood Collection`,
    desc: `Koleksi produk Agarwood pilihan bermutu tinggi dari ${country}.`
  }
}

// Mengambil daftar produk untuk negara tertentu langsung dari DB
export const getOuds = country => {
  const fromDb = (DB.ouds || []).filter(x => x.country === country).sort((a, b) => (a.slot || 0) - (b.slot || 0))
  if (fromDb.length > 0) {
    return fromDb.map((item, idx) => ({
      id: item.slot || (idx + 1),
      slot: item.slot || (idx + 1),
      country: item.country,
      name: item.name || `Collection #${idx + 1}`,
      sub: item.sub || `${country} Agarwood`,
      desc: item.descr || '',
      img: item.img || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
      badge: item.slot <= 2 ? 'Super Sinking' : 'Premium Grade',
      custom: true
    }))
  }
  return defaults(country)
}

// Load data real-time dari Supabase
export const load = async () => {
  try {
    const [o, s] = await Promise.all([
      supabase.from('ouds').select('*').order('slot', { ascending: true }),
      supabase.from('site').select('*')
    ])

    if (o.data && o.data.length > 0) {
      DB.ouds = o.data
    }
    if (s.data) {
      DB.site = Object.fromEntries(s.data.map(r => [r.key, r.value]))
    }

    persistSite()

    // Live DOM patch for brand
    const brandEl = document.getElementById('brand')
    if (brandEl) {
      brandEl.innerHTML = `<span class="brand-asian">ASIAN</span> <span class="brand-oud">OUD</span>`
    }
  } catch (err) {
    console.warn('Supabase sync notice:', err)
  }
}
