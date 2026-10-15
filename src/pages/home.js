import { COUNTRIES } from '../data/oud.js'
import { getOuds, S } from '../lib/store.js'
import { esc } from '../lib/utils.js'
const app=document.getElementById('app')
let selectedCountry=COUNTRIES[0]

export const home=()=>{
 const ouds=getOuds(selectedCountry)
 
 app.innerHTML=`
 <!-- Hero Clean -->
 <div class="hero-clean">
  <div class="hero-clean-content">
   <h1 class="hero-clean-title">${esc(S('title',"Explore Southeast Asia"))}</h1>
   <p class="hero-clean-subtitle">${esc(S('subtitle','Discover amazing destinations across 6 countries. Carefully curated experiences, authentic adventures.'))}</p>
  </div>
 </div>
 
 <!-- Country Selector -->
 <div class="country-selector">
  <div class="selector-label">SELECT YOUR DESTINATION</div>
  <div class="country-pills">
   ${COUNTRIES.map(c=>`
    <button class="country-pill ${c===selectedCountry?'active':''}" data-c="${c}">
     ${c}
    </button>
   `).join('')}
  </div>
 </div>
 
 <!-- Products Clean Grid -->
 <div class="products-clean">
  <div class="products-header-clean">
   <h2>${selectedCountry} Destinations</h2>
   <p>${ouds.length} amazing places to explore</p>
  </div>
  
  <div class="products-grid-clean">
   ${ouds.map(o=>`
    <a class="product-card-clean" href="#/oud/${selectedCountry}/${o.id}">
     <div class="product-image-clean">
      <img src="${o.img}" alt="${esc(o.name)}" loading="lazy"/>
      <div class="product-badge-clean">Popular</div>
     </div>
     <div class="product-info-clean">
      <h3>${esc(o.name)}</h3>
      <p>${esc(o.sub)}</p>
      <div class="product-footer-clean">
       <span class="product-link-clean">Explore →</span>
      </div>
     </div>
    </a>
   `).join('')}
  </div>
 </div>
 
 <!-- Features Clean -->
 <div class="features-clean">
  <div class="feature-clean-item">
   <div class="feature-clean-icon">✓</div>
   <div>
    <h4>Verified Destinations</h4>
    <p>Handpicked locations</p>
   </div>
  </div>
  <div class="feature-clean-item">
   <div class="feature-clean-icon">✓</div>
   <div>
    <h4>Best Experiences</h4>
    <p>Unforgettable moments</p>
   </div>
  </div>
  <div class="feature-clean-item">
   <div class="feature-clean-icon">✓</div>
   <div>
    <h4>Expert Guides</h4>
    <p>Local knowledge</p>
   </div>
  </div>
  <div class="feature-clean-item">
   <div class="feature-clean-icon">✓</div>
   <div>
    <h4>24/7 Support</h4>
    <p>Always here to help</p>
   </div>
  </div>
 </div>
 `
 
 app.querySelectorAll('.country-pill').forEach(btn=>{
  btn.onclick=()=>{
   selectedCountry=btn.dataset.c
   home()
   window.scrollTo({top:300,behavior:'smooth'})
  }
 })
}
