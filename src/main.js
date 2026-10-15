import './styles/main.css'
import { load } from './lib/store.js'
import { home } from './pages/home.js'
import { detail } from './pages/detail.js'
import { cek } from './pages/cek.js'
import { admin } from './pages/admin.js'
import { contact } from './pages/contact.js'

// Mobile menu toggle
const setupMenu=()=>{
 const menuToggle=document.getElementById('menuToggle')
 const navLinks=document.getElementById('navLinks')
 if(!menuToggle||!navLinks)return
 
 menuToggle.addEventListener('click',()=>{
  menuToggle.classList.toggle('active')
  navLinks.classList.toggle('active')
 })
 
 navLinks.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',()=>{
   menuToggle.classList.remove('active')
   navLinks.classList.remove('active')
  })
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
 
 setupMenu()
}

addEventListener('hashchange',route)

// Initialize
load().then(()=>{
 route()
})
