import { supabase } from '../lib/supabase.js'
import { COUNTRIES } from '../data/oud.js'
import { getOuds, S, load } from '../lib/store.js'
import { esc, toast, resize } from '../lib/utils.js'
const app=document.getElementById('app')
let pin='',atab='orders',acountry=COUNTRIES[0],ORD=[]

const login=()=>{
 app.innerHTML=`
 <div class="admin-login">
  <div class="login-card">
   <div class="login-icon">🔐</div>
   <h1>Admin Panel</h1>
   <p>Masukkan PIN untuk melanjutkan</p>
   <form id="f">
    <div class="form-group">
     <input name="p" type="password" placeholder="Masukkan PIN Admin" required/>
    </div>
    <button class="btn btn-login">Masuk ke Dashboard</button>
   </form>
  </div>
 </div>
 `
 
 document.getElementById('f').onsubmit=async e=>{
  e.preventDefault()
  const btn=e.target.querySelector('.btn-login')
  btn.disabled=true
  btn.textContent='Memverifikasi...'
  
  const p=e.target.p.value
  const {data:r,error:e1}=await supabase.rpc('admin_login',{p_pin:p})
  
  if(e1||!r?.ok){
   btn.disabled=false
   btn.textContent='Masuk ke Dashboard'
   return toast(r?.msg||'PIN salah atau gagal login',true)
  }
  
  pin=r.token
  const {data}=await supabase.rpc('admin_list',{p_pin:pin})
  ORD=data||[]
  admin()
 }
}

export const admin=async()=>{
 if(!pin)return login()
 
 app.innerHTML=`
 <div class="admin-layout">
  <!-- Sidebar -->
  <aside class="admin-sidebar">
   <div class="sidebar-header">
    <div class="sidebar-logo">
     <span class="logo-icon">👑</span>
     <span class="logo-text">Admin Panel</span>
    </div>
   </div>
   
   <nav class="sidebar-nav">
    <button class="nav-item ${atab==='orders'?'active':''}" data-t="orders">
     <span class="nav-icon">📦</span>
     <span class="nav-text">Pesanan</span>
     ${ORD.filter(o=>o.status==='Baru').length>0?`<span class="nav-badge">${ORD.filter(o=>o.status==='Baru').length}</span>`:''}
    </button>
    <button class="nav-item ${atab==='ouds'?'active':''}" data-t="ouds">
     <span class="nav-icon">🪵</span>
     <span class="nav-text">Kelola Produk</span>
    </button>
    <button class="nav-item ${atab==='site'?'active':''}" data-t="site">
     <span class="nav-icon">⚙️</span>
     <span class="nav-text">Pengaturan</span>
    </button>
   </nav>
   
   <div class="sidebar-footer">
    <button class="nav-item logout-btn" id="out">
     <span class="nav-icon">🚪</span>
     <span class="nav-text">Keluar</span>
    </button>
   </div>
  </aside>
  
  <!-- Main Content -->
  <main class="admin-main">
   <div class="admin-header">
    <h1 class="admin-title">${{orders:'📦 Manajemen Pesanan',ouds:'🪵 Manajemen Produk',site:'⚙️ Pengaturan Situs'}[atab]}</h1>
   </div>
   <div id="body" class="admin-body"></div>
  </main>
 </div>
 `
 
 app.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{atab=b.dataset.t;admin()})
 document.getElementById('out').onclick=()=>{
  if(confirm('Yakin ingin keluar?')){
   pin=''
   ORD=[]
   login()
  }
 }
 
 ;({orders:tabOrders,ouds:tabOuds,site:tabSite})[atab](document.getElementById('body'))
}

const tabOrders=async el=>{
 const {data}=await supabase.rpc('admin_list',{p_pin:pin})
 ORD=data||ORD
 const n=s=>ORD.filter(x=>x.status===s).length
 
 el.innerHTML=`
 <div class="stats-grid">
  <div class="stat-card">
   <div class="stat-icon">📊</div>
   <div class="stat-content">
    <div class="stat-value">${ORD.length}</div>
    <div class="stat-label">Total Pesanan</div>
   </div>
  </div>
  <div class="stat-card stat-new">
   <div class="stat-icon">🆕</div>
   <div class="stat-content">
    <div class="stat-value">${n('Baru')}</div>
    <div class="stat-label">Pesanan Baru</div>
   </div>
  </div>
  <div class="stat-card stat-process">
   <div class="stat-icon">⏳</div>
   <div class="stat-content">
    <div class="stat-value">${n('Diproses')+n('Dikirim')}</div>
    <div class="stat-label">Sedang Berjalan</div>
   </div>
  </div>
  <div class="stat-card stat-done">
   <div class="stat-icon">✅</div>
   <div class="stat-content">
    <div class="stat-value">${n('Selesai')}</div>
    <div class="stat-label">Selesai</div>
   </div>
  </div>
 </div>
 
 <div class="admin-filters">
  <input id="q" placeholder="🔍 Cari nama, telepon, atau produk..." class="filter-search"/>
  <select id="fs" class="filter-select">
   <option value="">📋 Semua Status</option>
   <option>Baru</option>
   <option>Diproses</option>
   <option>Dikirim</option>
   <option>Selesai</option>
  </select>
  <button class="btn btn-export" id="csv">⬇️ Ekspor CSV</button>
 </div>
 
 <div id="list" class="orders-list"></div>
 `
 
 const paint=()=>{
  const q=el.querySelector('#q').value.toLowerCase()
  const fs=el.querySelector('#fs').value
  const l=ORD.filter(r=>(!fs||r.status===fs)&&(`${r.nama} ${r.phone} ${r.oud_name} ${r.email}`.toLowerCase().includes(q)))
  
  el.querySelector('#list').innerHTML=l.length?l.map(r=>`
   <div class="admin-order-card">
    <div class="order-main">
     <div class="order-info">
      <div class="order-id-badge">#${r.id}</div>
      <div class="order-product-name">📦 ${esc(r.oud_name)}</div>
      <div class="order-meta">
       <span>👤 ${esc(r.nama)}</span>
       <span>📧 ${esc(r.email)}</span>
       <span>📱 ${esc(r.phone)}</span>
       <span>⚧ ${esc(r.gender)}</span>
      </div>
      <div class="order-date">🕐 ${new Date(r.created_at).toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'})}</div>
     </div>
     <div class="order-actions">
      <select class="status-select" data-id="${r.id}">
       ${['Baru','Diproses','Dikirim','Selesai'].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}
      </select>
     </div>
    </div>
   </div>
  `).join(''):'<div class="empty-state"><div class="empty-icon">📭</div><h3>Tidak ada pesanan</h3><p>Belum ada data yang sesuai dengan filter</p></div>'
  
  el.querySelectorAll('.status-select').forEach(s=>s.onchange=async()=>{
   const btn=s
   btn.disabled=true
   await supabase.rpc('admin_status',{p_pin:pin,p_id:+s.dataset.id,p_status:s.value})
   toast('✓ Status diperbarui')
   tabOrders(el)
  })
 }
 
 el.querySelector('#q').oninput=paint
 el.querySelector('#fs').onchange=paint
 paint()
 
 el.querySelector('#csv').onclick=()=>{
  const h=['id','oud_name','nama','email','phone','gender','status','created_at']
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`
  const csv=[h.join(','),...ORD.map(r=>h.map(k=>q(r[k])).join(','))].join('\n')
  const a=document.createElement('a')
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
  a.download=`pesanan_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  toast('✓ CSV berhasil diunduh')
 }
}

const tabOuds=el=>{
 const list=getOuds(acountry)
 
 el.innerHTML=`
 <div class="country-tabs">
  ${COUNTRIES.map(c=>`<button class="country-tab ${c===acountry?'active':''}" data-c="${c}">
   <span class="tab-flag">${['🇹🇭','🇰🇭','🇻🇳','🇲🇾','🇮🇩','🇱🇦'][COUNTRIES.indexOf(c)]}</span>
   <span>${c}</span>
  </button>`).join('')}
 </div>
 
 <div class="oud-info-box">
  💡 <strong>Info:</strong> Foto otomatis dikecilkan (max 800px). Kosongkan upload jika tidak ingin mengganti foto.
 </div>
 
 <div class="oud-editor-grid">
  ${list.map(o=>`
   <form class="oud-editor-card" data-slot="${o.id}">
    <div class="oud-preview">
     <img class="prev" src="${o.img}"/>
     <div class="oud-slot-badge">Slot ${o.id}</div>
    </div>
    <div class="oud-fields">
     <div class="form-group">
      <label>Nama Produk</label>
      <input name="name" value="${esc(o.name)}" placeholder="Nama oud"/>
     </div>
     <div class="form-group">
      <label>Subjudul</label>
      <input name="sub" value="${esc(o.sub)}" placeholder="Subjudul"/>
     </div>
     <div class="form-group">
      <label>Deskripsi</label>
      <textarea name="descr" rows="3" placeholder="Deskripsi">${esc(o.desc)}</textarea>
     </div>
     <div class="form-group">
      <label>Upload Foto Baru (opsional)</label>
      <input type="file" name="file" accept="image/*" class="file-input"/>
     </div>
     <div class="oud-actions">
      <button class="btn btn-save">💾 Simpan</button>
      ${o.custom?'<button type="button" class="btn btn-reset reset">🗑️ Hapus Foto</button>':''}
     </div>
    </div>
   </form>
  `).join('')}
 </div>
 `
 
 el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{acountry=b.dataset.c;tabOuds(el)})
 
 el.querySelectorAll('.oud-editor-card').forEach(f=>{
  let img=null
  const slot=+f.dataset.slot
  
  const save=async im=>{
   const btn=f.querySelector('.btn-save')
   btn.disabled=true
   btn.textContent='Menyimpan...'
   
   const {error}=await supabase.rpc('admin_save_oud',{
    p_pin:pin,
    p_country:acountry,
    p_slot:slot,
    p_name:f.name.value,
    p_sub:f.sub.value,
    p_descr:f.descr.value,
    p_img:im
   })
   
   if(error){
    btn.disabled=false
    btn.textContent='💾 Simpan'
    return toast(error.message,true)
   }
   
   await load()
   toast('✓ Produk berhasil disimpan')
   tabOuds(el)
  }
  
  f.file.onchange=async()=>{
   if(f.file.files[0]){
    img=await resize(f.file.files[0])
    f.querySelector('.prev').src=img
    toast('✓ Foto berhasil dipilih')
   }
  }
  
  f.onsubmit=e=>{e.preventDefault();save(img)}
  
  const r=f.querySelector('.reset')
  if(r)r.onclick=()=>{
   if(confirm('Yakin ingin menghapus foto custom dan kembali ke default?')){
    save('')
   }
  }
 })
}

const tabSite=el=>{
 const F=[
  ['brand','Nama Brand (Navbar)','OUD ASEAN'],
  ['eyebrow','Label Kecil Hero','Premium Agarwood · Southeast Asia'],
  ['title','Judul Utama Hero',"DISCOVER THE ESSENCE"],
  ['subtitle','Deskripsi Hero','Koleksi kayu gaharu premium dari 6 negara terbaik Asia Tenggara. Setiap produk adalah masterpiece alam yang dikurasi dengan sempurna.'],
  ['footer','Teks Footer','© Oud ASEAN · Premium Agarwood Collection']
 ]
 
 el.innerHTML=`
 <div class="settings-grid">
  <form id="sf" class="settings-card">
   <h3 class="settings-title">📝 Konten Halaman</h3>
   <p class="settings-desc">Ubah teks yang ditampilkan di halaman utama</p>
   ${F.map(([k,l,d])=>`
    <div class="form-group">
     <label>${l}</label>
     ${k==='subtitle'?`<textarea name="${k}" rows="3">${esc(S(k,d))}</textarea>`:`<input name="${k}" value="${esc(S(k,d))}"/>`}
    </div>
   `).join('')}
   <button class="btn btn-save">💾 Simpan Perubahan</button>
  </form>
  
  <form id="pf" class="settings-card">
   <h3 class="settings-title">🔐 Keamanan</h3>
   <p class="settings-desc">Ubah PIN admin untuk keamanan akun</p>
   <div class="form-group">
    <label>PIN Baru</label>
    <input name="np" type="password" minlength="4" placeholder="Minimal 4 karakter (disarankan 8+)" required/>
   </div>
   <button class="btn btn-warning">🔒 Ganti PIN</button>
  </form>
 </div>
 `
 
 document.getElementById('sf').onsubmit=async e=>{
  e.preventDefault()
  const btn=e.target.querySelector('.btn-save')
  btn.disabled=true
  btn.textContent='Menyimpan...'
  
  for(const [k] of F){
   const {error}=await supabase.rpc('admin_save_site',{
    p_pin:pin,
    p_key:k,
    p_value:e.target[k].value
   })
   if(error){
    btn.disabled=false
    btn.textContent='💾 Simpan Perubahan'
    return toast(error.message,true)
   }
  }
  
  await load()
  btn.disabled=false
  btn.textContent='💾 Simpan Perubahan'
  toast('✓ Pengaturan berhasil diperbarui')
  
  // Update navbar brand
  const brandEl=document.getElementById('brand')
  if(brandEl)brandEl.textContent=e.target.brand.value
 }
 
 document.getElementById('pf').onsubmit=async e=>{
  e.preventDefault()
  const btn=e.target.querySelector('.btn-warning')
  btn.disabled=true
  btn.textContent='Mengubah...'
  
  const {error}=await supabase.rpc('admin_set_pin',{
    p_pin:pin,
    p_new:e.target.np.value
  })
  
  btn.disabled=false
  btn.textContent='🔒 Ganti PIN'
  
  if(error)return toast(error.message,true)
  
  e.target.reset()
  toast('✓ PIN berhasil diganti. Gunakan PIN baru saat login berikutnya.')
 }
}
