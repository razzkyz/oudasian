import './styles/main.css'
import { load } from './lib/store.js'
import { home } from './pages/home.js'
import { detail } from './pages/detail.js'
import { cek } from './pages/cek.js'
import { admin } from './pages/admin.js'
import { contact } from './pages/contact.js'

// Mobile menu toggle - Setup globally
const setupMenu=()=>{
 const menuToggle=document.getElementById('menuToggle')
 const navLinks=document.getElementById('navLinks')
 
 if(!menuToggle||!navLinks)return
 
 // Remove old listeners to prevent duplicates
 menuToggle.replaceWith(menuToggle.cloneNode(true))
 const newMenuToggle=document.getElementById('menuToggle')
 const newNavLinks=document.getElementById('navLinks')
 
 newMenuToggle.addEventListener('click',()=>{
  newMenuToggle.classList.toggle('active')
  newNavLinks.classList.toggle('active')
 })
 
 // Close menu when clicking a link
 newNavLinks.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',()=>{
   newMenuToggle.classList.remove('active')
   newNavLinks.classList.remove('active')
  })
 })
 
 // Close menu when clicking outside
 document.addEventListener('click',(e)=>{
  if(!newMenuToggle.contains(e.target)&&!newNavLinks.contains(e.target)){
   newMenuToggle.classList.remove('active')
   newNavLinks.classList.remove('active')
  }
 })
}

const route=async()=>{
 const [,p,c,id]=location.hash.split('/')
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

// Initialize
load().then(()=>{
 route()
 setupMenu()
})
