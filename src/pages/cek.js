import { supabase } from '../lib/supabase.js'
import { esc, norm } from '../lib/utils.js'
const app=document.getElementById('app')

const statusColors={
 'Baru':'#3498db',
 'Diproses':'#f39c12',
 'Dikirim':'#9b59b6',
 'Selesai':'#27ae60'
}

const rows=l=>l.length?l.map(r=>`
 <div class="order-card">
  <div class="order-header">
   <div class="order-id">Order #${r.id}</div>
   <span class="order-status" style="background:${statusColors[r.status]||'#999'}">${esc(r.status)}</span>
  </div>
  <div class="order-product">
   <div class="order-product-name">📦 ${esc(r.oud_name)}</div>
   <div class="order-country">${esc(r.oud_country)}</div>
  </div>
  <div class="order-details">
   <div class="order-row">
    <span class="order-label">👤 Nama:</span>
    <span>${esc(r.nama)}</span>
   </div>
   <div class="order-row">
    <span class="order-label">📧 Email:</span>
    <span>${esc(r.email)}</span>
   </div>
   <div class="order-row">
    <span class="order-label">📱 Telepon:</span>
    <span>${esc(r.phone)}</span>
   </div>
   <div class="order-row">
    <span class="order-label">⚧ Gender:</span>
    <span>${esc(r.gender)}</span>
   </div>
  </div>
  <div class="order-footer">
   <span class="order-date">🕐 ${new Date(r.created_at).toLocaleString('id-ID',{dateStyle:'full',timeStyle:'short'})}</span>
  </div>
 </div>
`).join(''):'<div class="empty-state"><div class="empty-icon">📭</div><h3>Tidak Ada Pesanan</h3><p>Belum ada pesanan ditemukan dengan nomor telepon ini.</p></div>'

export const cek=()=>{
 app.innerHTML=`
 <div class="page-banner">
  <div class="banner-icon">📋</div>
  <h1 class="banner-title">CEK STATUS PEMESANAN</h1>
  <p class="banner-subtitle">Masukkan nomor telepon yang Anda gunakan saat memesan</p>
 </div>
 
 <div class="cek-container">
  <form id="f" class="cek-form">
   <div class="form-group-inline">
    <input name="p" type="tel" placeholder="Contoh: 081234567890" required/>
    <button class="btn btn-cek">Cek Pesanan</button>
   </div>
   <p class="form-hint">💡 Masukkan nomor telepon lengkap dengan kode area</p>
  </form>
  
  <div id="out" class="orders-container"></div>
 </div>
 
 <div class="cek-help">
  <h3>Bantuan</h3>
  <div class="help-grid">
   <div class="help-item">
    <div class="help-icon">❓</div>
    <div>
     <strong>Lupa Nomor Telepon?</strong>
     <p>Cek email konfirmasi yang dikirim saat pemesanan</p>
    </div>
   </div>
   <div class="help-item">
    <div class="help-icon">💬</div>
    <div>
     <strong>Butuh Bantuan?</strong>
     <p>Hubungi kami melalui WhatsApp: <a href="https://wa.me/628123456789" style="color:var(--gold)">+62 812-3456-789</a></p>
    </div>
   </div>
  </div>
 </div>
 `
 
 document.getElementById('f').onsubmit=async e=>{
  e.preventDefault()
  const btn=e.target.querySelector('.btn-cek')
  const originalText=btn.textContent
  btn.disabled=true
  btn.textContent='Mencari...'
  
  const {data,error}=await supabase.rpc('cek_pesanan',{p_phone:norm(e.target.p.value)})
  
  btn.disabled=false
  btn.textContent=originalText
  
  document.getElementById('out').innerHTML=error?`<div class="error-state"><div class="error-icon">⚠️</div><p>${esc(error.message)}</p></div>`:rows(data)
 }
}
