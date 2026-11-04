import './styles/main.css'
import { load } from './lib/store.js'
import { home, resetHomeCountry } from './pages/home.js'
import { detail } from './pages/detail.js'
import { cek } from './pages/cek.js'
import { admin } from './pages/admin.js'
import { contact } from './pages/contact.js'

// Parse route cleanly regardless of trailing slash, query params, or hash format
const parseHash = () => {
  const raw = location.hash || ''
  // e.g. '#/cek?phone=0812' -> 'cek?phone=0812'
  const clean = raw.replace(/^#\/?/, '')
  const [pathOnly] = clean.split('?')
  const parts = pathOnly.split('/').filter(Boolean)
  return {
    page: parts[0] || '',
    country: parts[1] || '',
    id: parts[2] || ''
  }
}

// Navigasi ke halaman awal (home/katalog) dan refresh tampilan
export const goToHome = (smooth = true) => {
  resetHomeCountry()
  if (location.hash !== '#/' && location.hash !== '') {
    location.hash = '#/'
  }
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
  home(true)
}

// Mobile sidebar drawer setup
const setupMenu = () => {
  const menuToggle = document.getElementById('menuToggle')
  const sidebar = document.getElementById('mobileSidebar')
  const overlay = document.getElementById('navOverlay')
  const closeBtn = document.getElementById('sidebarCloseBtn')
  
  if (!menuToggle || !sidebar) return
  
  const openMenu = () => {
    sidebar.classList.add('open')
    if (overlay) overlay.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  
  const closeMenu = () => {
    sidebar.classList.remove('open')
    if (overlay) overlay.classList.remove('open')
    document.body.style.overflow = ''
  }
  
  menuToggle.onclick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    openMenu()
  }
  
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault()
      closeMenu()
    }
  }
  
  if (overlay) {
    overlay.onclick = closeMenu
  }
  
  sidebar.querySelectorAll('a').forEach(a => {
    a.onclick = closeMenu
  })
}

// Attach listener to all Katalog & Logo links so clicking them always reloads to home
const setupKatalogLinks = () => {
  // Semua link yang mengarah ke home/katalog atau logo brand
  document.querySelectorAll('a[href="#/"], a[href="#"], a[href="#/katalog"], .logo, .sidebar-logo-text, .footer-logo').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault()
      const sidebar = document.getElementById('mobileSidebar')
      const overlay = document.getElementById('navOverlay')
      if (sidebar) sidebar.classList.remove('open')
      if (overlay) overlay.classList.remove('open')
      document.body.style.overflow = ''
      goToHome(true)
    }
  })
}

const route = async () => {
  // Pastikan menu tertutup saat navigasi
  const sidebar = document.getElementById('mobileSidebar')
  const overlay = document.getElementById('navOverlay')
  if (sidebar) sidebar.classList.remove('open')
  if (overlay) overlay.classList.remove('open')
  document.body.style.overflow = ''

  const { page, country, id } = parseHash()
  window.scrollTo(0, 0)
 
  if (page === 'oud' && country && id) {
    detail(country, id)
  } else if (page === 'cek') {
    cek()
  } else if (page === 'admin') {
    admin()
  } else if (page === 'contact') {
    contact()
  } else {
    // page === '' atau 'katalog' atau apapun -> kembali ke home
    home()
  }
 
  setTimeout(() => {
    setupMenu()
    setupKatalogLinks()
  }, 100)
}

addEventListener('hashchange', route)

// Initialize immediately (0ms instant paint from cache/defaults)
route()
setupMenu()
setupKatalogLinks()

// Background sync from Supabase (updates CMS changes seamlessly)
load().then(() => {
  const { page } = parseHash()
  if (!page || page === 'katalog' || page === 'oud') {
    route()
  }
}).catch(err => {
  console.warn('Background sync error:', err)
})
