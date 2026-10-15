import { supabase } from '../lib/supabase.js'
import { getOuds } from '../lib/store.js'
import { esc, norm, toast } from '../lib/utils.js'
import { home } from './home.js'
const app=document.getElementById('app')

export const detail=(c,id)=>{
 const o=getOuds(c)[id-1]
 if(!o)return home()
 
 // Generate 4 gallery images
 const galleryImages=[
  o.img,
  `https://picsum.photos/seed/${c}${id}a/800/800`,
  `https://picsum.photos/seed/${c}${id}b/800/800`,
  `https://picsum.photos/seed/${c}${id}c/800/800`
 ]
 
 // Generate 4 related products
 const relatedOuds=getOuds(c).filter((_,i)=>i+1!==+id).slice(0,4)
 
 let currentImage=0
 
 app.innerHTML=`
 <a class="back" href="#/">← Back to ${c}</a>
 
 <!-- Detail Hero -->
 <div class="detail-hero">
  <div class="detail-gallery">
   <div class="gallery-thumbs">
    ${galleryImages.map((img,i)=>`
     <div class="gallery-thumb ${i===0?'active':''}" data-index="${i}">
      <img src="${img}" alt="Photo ${i+1}"/>
     </div>
    `).join('')}
   </div>
   <div class="gallery-main">
    <img id="mainImage" src="${galleryImages[0]}" alt="${esc(o.name)}"/>
    <button class="gallery-prev" id="prevBtn">‹</button>
    <button class="gallery-next" id="nextBtn">›</button>
   </div>
  </div>
  
  <div class="detail-hero-content">
   <div class="detail-badge">${esc(o.sub)}</div>
   <h1 class="detail-title">${esc(o.name)}</h1>
   <p class="detail-location">📍 ${c}</p>
   <p class="detail-desc">${esc(o.desc)}</p>
   
   <div class="detail-features">
    <div class="detail-feature-item">
     <span class="feature-icon">🌟</span>
     <span>Top Rated</span>
    </div>
    <div class="detail-feature-item">
     <span class="feature-icon">✓</span>
     <span>Verified</span>
    </div>
    <div class="detail-feature-item">
     <span class="feature-icon">🚀</span>
     <span>Fast Booking</span>
    </div>
   </div>
  </div>
 </div>
 
 <!-- Booking Form Section -->
 <div class="booking-section">
  <h2 class="booking-title">Book This Experience</h2>
  <p class="booking-subtitle">Fill in your details and we'll get back to you shortly</p>
  
  <form id="f" class="booking-form">
   <div class="form-group">
    <label>Full Name</label>
    <input name="nama" placeholder="Enter your full name" required/>
   </div>
   
   <div class="form-group">
    <label>Email Address</label>
    <input name="email" type="email" placeholder="your@email.com" required/>
   </div>
   
   <div class="form-group">
    <label>Phone Number</label>
    <input name="phone" type="tel" placeholder="08xx xxxx xxxx" required/>
   </div>
   
   <div class="form-group">
    <label>Gender</label>
    <select name="gender" required>
     <option value="">Select</option>
     <option>Male</option>
     <option>Female</option>
    </select>
   </div>
   
   <button class="btn btn-booking">Book Now</button>
  </form>
 </div>
 
 <!-- Related Section -->
 ${relatedOuds.length>0?`
 <div class="related-section">
  <h3 class="related-title">More from ${c}</h3>
  <div class="related-grid">
   ${relatedOuds.map(ro=>`
    <a class="related-card" href="#/oud/${c}/${ro.id}">
     <img src="${ro.img}" alt="${esc(ro.name)}"/>
     <div class="related-info">
      <b>${esc(ro.name)}</b>
      <small>${esc(ro.sub)}</small>
     </div>
    </a>
   `).join('')}
  </div>
 </div>
 `:''}
 `
 
 // Gallery functionality
 const mainImg=document.getElementById('mainImage')
 const thumbs=document.querySelectorAll('.gallery-thumb')
 const prevBtn=document.getElementById('prevBtn')
 const nextBtn=document.getElementById('nextBtn')
 
 const updateGallery=(index)=>{
  currentImage=index
  mainImg.src=galleryImages[index]
  thumbs.forEach((t,i)=>{
   t.classList.toggle('active',i===index)
  })
 }
 
 thumbs.forEach((thumb,i)=>{
  thumb.onclick=()=>updateGallery(i)
 })
 
 prevBtn.onclick=()=>{
  const newIndex=currentImage===0?galleryImages.length-1:currentImage-1
  updateGallery(newIndex)
 }
 
 nextBtn.onclick=()=>{
  const newIndex=currentImage===galleryImages.length-1?0:currentImage+1
  updateGallery(newIndex)
 }
 
 // Form submit
 document.getElementById('f').onsubmit=async e=>{
  e.preventDefault()
  const btn=e.target.querySelector('.btn-booking')
  btn.disabled=true
  btn.textContent='Sending...'
  
  const d=Object.fromEntries(new FormData(e.target))
  d.phone=norm(d.phone)
  const {error}=await supabase.from('orders').insert({
   ...d,
   oud_country:c,
   oud_id:+id,
   oud_name:o.name
  })
  
  btn.disabled=false
  btn.textContent='Book Now'
  toast(
   error?(error.message.includes('Terlalu')?error.message:'Failed to submit. Please check your details.'):'✓ Booking sent! Check status in My Bookings menu.',
   !!error
  )
  if(!error)e.target.reset()
 }
}
