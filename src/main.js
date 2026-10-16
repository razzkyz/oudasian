import './styles/main.css'
import { load } from './lib/store.js'
import { home } from './pages/home.js'
import { detail } from './pages/detail.js'
import { cek } from './pages/cek.js'
import { admin } from './pages/admin.js'
import { contact } from './pages/contact.js'

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

const route = async () => {
  // Pastikan menu tertutup saat navigasi
  const sidebar = document.getElementById('mobileSidebar')
  const overlay = document.getElementById('navOverlay')
  if (sidebar) sidebar.classList.remove('open')
  if (overlay) overlay.classList.remove('open')
  document.body.style.overflow = ''

  const [,p,c,id] = location.hash.split('/')
  window.scrollTo(0,0)
 
 if(p==='oud'&&c&&id){
  detail(c,id)
 }else if(p==='cek'){
  cek()
 }else if(p==='admin'){
  admin()
 }else if(p==='contact'){
  contact()
 }else{
  home()
 }
 
 // Re-setup menu after route change
 setTimeout(setupMenu,100)
}

addEventListener('hashchange',route)

// Initialize immediately (0ms instant paint from cache/defaults)
route()
setupMenu()

// Background sync from Supabase (updates CMS changes seamlessly)
load().then(()=>{
 const [,p]=location.hash.split('/')
 if(!p || p==='oud'){
  route()
 }
}).catch(err=>{
 console.warn('Background sync error:', err)
})

