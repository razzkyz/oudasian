import { supabase } from './supabase.js'
import { getOuds as defaults } from '../data/oud.js'

const CACHE_KEY = 'oud_asean_store_v1'

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

export const load = async () => {
  try {
    const [o, s] = await Promise.all([
      supabase.from('ouds').select('*'),
      supabase.from('site').select('*')
    ])

    if (o.data) DB.ouds = o.data
    if (s.data) DB.site = Object.fromEntries(s.data.map(r => [r.key, r.value]))

    persistSite()

    // Live DOM patch for brand & footer
    const footerEl = document.querySelector('.footer-tagline')
    if (footerEl && DB.site['lp_footer_tagline']) {
      footerEl.textContent = DB.site['lp_footer_tagline']
    }
    const brandEl = document.getElementById('brand')
    if (brandEl) {
      let b = (DB.site['lp_brand'] || 'OUD ASEAN').replace(/^[✈️\s]+/, '').trim()
      if (b.toLowerCase().includes('asean travel')) b = 'OUD ASEAN'
      const span = brandEl.querySelector('span')
      if (span) span.textContent = b
    }
  } catch (err) {
    console.warn('Supabase sync notice:', err)
  }
}

export const getOuds = c => defaults(c).map((d, i) => {
  const r = DB.ouds.find(x => x.country === c && x.slot === i + 1) || {}
  const hasCustomEdit = r.name || r.sub || r.descr || r.img
  return {
    ...d,
    name: r.name || d.name,
    sub: r.sub || d.sub,
    desc: r.descr || d.desc,
    img: r.img || d.img,
    price: d.price || 'Rp 3.850.000 / Pax',
    badge: d.badge || 'Verified Tour',
    custom: !!hasCustomEdit
  }
})
