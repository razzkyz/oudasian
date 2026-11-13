import { supabase } from '../lib/supabase.js'
import { getCountries, getOuds, S, load, DB, persistSite } from '../lib/store.js'
import { esc, toast, resize, norm } from '../lib/utils.js'

const app = document.getElementById('app')
let pin = '', atab = 'orders', acountry = 'Indonesia', ORD = []

/* ─── LOCAL STORAGE OVERRIDES FOR ORDERS ────────────────────────────── */
const loadLocalOrderEdits = () => {
  try {
    return JSON.parse(localStorage.getItem('asian_oud_order_edits') || '{}')
  } catch (e) {
    return {}
  }
}

const saveLocalOrderEdit = (id, editData) => {
  try {
    const edits = loadLocalOrderEdits()
    edits[id] = Object.assign(edits[id] || {}, editData)
    localStorage.setItem('asian_oud_order_edits', JSON.stringify(edits))
  } catch (e) {}
}

const applyLocalEdits = (orders) => {
  const edits = loadLocalOrderEdits()
  return orders.map(o => {
    if (edits[o.id]) {
      return { ...o, ...edits[o.id] }
    }
    return o
  })
}

/* ─── WHATSAPP NOTIFICATION TEMPLATES ────────────────────────────────── */
const isFemale = g => g === 'Perempuan' || g === 'Female' || g === 'Mrs. / Ms. / Madam'
const NOTIF_TEMPLATES = {
  'baru': {
    title: '1. Order Diterima',
    build: (o, host) => 
`Halo ${isFemale(o.gender) ? 'Ibu' : 'Bapak'} ${o.nama},

Terima kasih telah memesan Agarwood premium di ASIAN OUD.

Rincian Pesanan #${o.id}:
• Produk: ${o.oud_name || 'Koleksi Agarwood'} (${o.oud_country || 'Asia'})
• Status: Order Diterima (Menunggu Verifikasi & QC)
• Alamat Kirim: ${o.alamat || '-'}

Tim kurator kami saat ini sedang memverifikasi pesanan Anda. Anda dapat memantau status pesanan kapan saja melalui tautan resmi pelacakan:
${host}#/cek?phone=${encodeURIComponent(o.phone)}

Salam hangat,
ASIAN OUD — Trusted Supplier of Premium Agarwood`
  },
  'proses': {
    title: '2. QC & Packing',
    build: (o, host) => 
`Halo ${isFemale(o.gender) ? 'Ibu' : 'Bapak'} ${o.nama},

Update pesanan Anda #${o.id} di ASIAN OUD:

Produk Agarwood (${o.oud_name}) saat ini sedang melewati tahap Quality Control (QC), penimbangan presisi, dan pengemasan kedap udara higienis untuk menjaga kemurnian aroma gaharu.

Cek status pelacakan:
${host}#/cek?phone=${encodeURIComponent(o.phone)}

Terima kasih atas kepercayaan Anda,
ASIAN OUD`
  },
  'kirim': {
    title: '3. Paket Dikirim',
    build: (o, host, resi) => 
`Halo ${isFemale(o.gender) ? 'Ibu' : 'Bapak'} ${o.nama},

Kabar baik! Pesanan Agarwood Anda #${o.id} (${o.oud_name}) telah diserahkan kepada kurir pengiriman.

${resi ? `• No. Resi / Kurir: ${resi}` : '• No. Resi: Dalam update ekspedisi'}
• Alamat Pengiriman: ${o.alamat || '-'}

Pantau status paket Anda secara online:
${host}#/cek?phone=${encodeURIComponent(o.phone)}

Harap pastikan penerima berada di alamat tersebut. Terima kasih!
ASIAN OUD`
  },
  'selesai': {
    title: '4. Pesanan Selesai',
    build: (o, host) => 
`Halo ${isFemale(o.gender) ? 'Ibu' : 'Bapak'} ${o.nama},

Pesanan Agarwood Anda #${o.id} (${o.oud_name}) telah tercatat selesai dan diterima dengan baik.

Semoga aroma dan mutu Agarwood dari ASIAN OUD memberikan kenyamanan, ketenangan, dan kepuasan terbaik bagi Anda.

Jika ada pertanyaan atau ingin memesan kembali koleksi gaharu lainnya, kami siap melayani Anda.

Salam takzim,
ASIAN OUD — Trusted Supplier of Premium Agarwood`
  },
  'verif': {
    title: '5. Verifikasi Alamat',
    build: (o, host) => 
`Halo ${isFemale(o.gender) ? 'Ibu' : 'Bapak'} ${o.nama},

Kami dari tim Admin ASIAN OUD ingin mengonfirmasi detail pesanan Anda #${o.id}:

• Nama Penerima: ${o.nama}
• Nomor WhatsApp: ${o.phone}
• Produk: ${o.oud_name} (${o.oud_country})
• Alamat Kirim: ${o.alamat || '-'}

Mohon konfirmasi apakah data di atas sudah sesuai agar pesanan Anda dapat segera kami proses ke tahap pengemasan & pengiriman.

Tautan pelacakan online:
${host}#/cek?phone=${encodeURIComponent(o.phone)}

Terima kasih!`
  }
}

/* ─── MODAL: CEK ORDER & ATUR NOTIFIKASI ────────────────────────────── */
const openOrderVerifier = (orderId, refreshCallback) => {
  const o = ORD.find(x => x.id === orderId)
  if (!o) return

  const host = `${window.location.origin}${window.location.pathname}`
  
  const existingModal = document.getElementById('verifierOverlay')
  if (existingModal) existingModal.remove()

  const overlay = document.createElement('div')
  overlay.id = 'verifierOverlay'
  overlay.className = 'verifier-overlay'

  let currentTplKey = 'baru'
  if (o.status === 'Diproses') currentTplKey = 'proses'
  else if (o.status === 'Dikirim') currentTplKey = 'kirim'
  else if (o.status === 'Selesai') currentTplKey = 'selesai'

  overlay.innerHTML = `
    <div class="verifier-modal" role="dialog" aria-modal="true">
      <div class="verifier-modal-header">
        <div class="verifier-title-group">
          <div class="verifier-top-badges">
            <span class="verifier-badge">ORDER #${o.id}</span>
            <span class="verifier-status-badge status-${(o.status || '').toLowerCase()}">${o.status}</span>
          </div>
          <h2 class="verifier-title">${esc(o.oud_name || 'Produk Agarwood')} (${esc(o.oud_country || '-')})</h2>
          <span class="verifier-meta-time">Waktu Order: ${new Date(o.created_at).toLocaleString('id-ID')} WIB</span>
        </div>
        <button class="verifier-close-btn" id="closeVerifierBtn" type="button" aria-label="Tutup">✕</button>
      </div>

      <div class="verifier-modal-body">
        <!-- PANE KIRI: KOREKSI & VERIFIKASI DATA PEMESAN -->
        <div class="verifier-pane verifier-pane-data">
          <div class="verifier-pane-title">
            <span>Pemeriksaan &amp; Edit Data Pemesan</span>
          </div>
          <p class="verifier-pane-desc">Periksa kembali kebenaran data pembeli, atau ubah nomor telepon untuk menguji pelacakan pelanggan:</p>

          <form id="verifierForm" class="verifier-form">
            <div class="v-form-row">
              <label>Status Pesanan</label>
              <select id="vStatus" class="v-input v-select">
                <option value="Baru" ${o.status === 'Baru' ? 'selected' : ''}>Baru (Menunggu Konfirmasi)</option>
                <option value="Diproses" ${o.status === 'Diproses' ? 'selected' : ''}>Diproses (Quality Check &amp; Packing)</option>
                <option value="Dikirim" ${o.status === 'Dikirim' ? 'selected' : ''}>Dikirim (Dalam Perjalanan)</option>
                <option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai (Pesanan Diterima)</option>
              </select>
            </div>

            <div class="v-form-row">
              <label>Nama Pemesan</label>
              <input type="text" id="vNama" class="v-input" value="${esc(o.nama || '')}" required />
            </div>

            <div class="v-form-row">
              <label>Nomor Telepon / WhatsApp Pemesan</label>
              <div class="v-input-group">
                <input type="tel" id="vPhone" class="v-input" value="${esc(o.phone || '')}" placeholder="Contoh: 081234567890" required />
                <button type="button" id="btnTestTrackCurrent" class="btn btn-secondary v-btn-addon" title="Uji halaman pelacakan publik dengan nomor ini">
                  Uji Cek Order ↗
                </button>
              </div>
              <small class="v-field-hint">Admin dapat mengetik nomor HP pelanggan yang berbeda untuk menguji data &amp; pelacakan.</small>
            </div>

            <div class="v-form-grid-2">
              <div class="v-form-row">
                <label>Email Pemesan</label>
                <input type="email" id="vEmail" class="v-input" value="${esc(o.email || '')}" />
              </div>
              <div class="v-form-row">
                <label>Gender</label>
                <select id="vGender" class="v-input v-select">
                  <option value="Male" ${o.gender === 'Male' || o.gender === 'Laki-laki' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${o.gender === 'Female' || o.gender === 'Perempuan' ? 'selected' : ''}>Female</option>
                  <option value="" ${!o.gender ? 'selected' : ''}>- Netral -</option>
                </select>
              </div>
            </div>

            <div class="v-form-row">
              <label>Alamat Lengkap Pengiriman</label>
              <textarea id="vAlamat" class="v-input v-textarea" rows="3" placeholder="Alamat lengkap penerima paket...">${esc(o.alamat || '')}</textarea>
            </div>

            <div class="v-form-row">
              <label>Nomor Resi / Ekspedisi (Opsional)</label>
              <input type="text" id="vResi" class="v-input" value="${esc(o.resi || '')}" placeholder="Contoh: JNE YES 0123456789" />
            </div>

            <div class="v-actions-data">
              <button type="submit" id="btnSaveVerifier" class="btn btn-primary v-btn-save">
                Simpan Perubahan Data
              </button>
            </div>
          </form>
        </div>

        <!-- PANE KANAN: GENERATOR & CEK NOTIFIKASI WHATSAPP -->
        <div class="verifier-pane verifier-pane-notif">
          <div class="verifier-pane-title">
            <span>Cek &amp; Kirim Notifikasi WhatsApp</span>
          </div>
          <p class="verifier-pane-desc">Pilih template pesan resmi untuk dikirimkan ke WhatsApp pelanggan sesuai tahapan order:</p>

          <div class="notif-tpl-chips">
            <button type="button" class="notif-chip ${currentTplKey === 'baru' ? 'active' : ''}" data-tpl="baru">1. Diterima</button>
            <button type="button" class="notif-chip ${currentTplKey === 'proses' ? 'active' : ''}" data-tpl="proses">2. QC &amp; Packing</button>
            <button type="button" class="notif-chip ${currentTplKey === 'kirim' ? 'active' : ''}" data-tpl="kirim">3. Dikirim</button>
            <button type="button" class="notif-chip ${currentTplKey === 'selesai' ? 'active' : ''}" data-tpl="selesai">4. Selesai</button>
            <button type="button" class="notif-chip ${currentTplKey === 'verif' ? 'active' : ''}" data-tpl="verif">5. Verif Alamat</button>
          </div>

          <div class="v-form-row" style="margin-top:14px;">
            <label style="display:flex; justify-content:space-between; align-items:center;">
              <span>Pratinjau Pesan Notifikasi (Dapat Diedit)</span>
              <span id="waPhoneTarget" class="wa-target-label">Tujuan: ${esc(o.phone)}</span>
            </label>
            <textarea id="vNotifText" class="v-input v-notif-box" rows="11"></textarea>
          </div>

          <div class="v-actions-notif">
            <button type="button" id="btnSendWa" class="btn btn-wa-send">
              Kirim Notifikasi via WhatsApp ↗
            </button>
            <button type="button" id="btnCopyWa" class="btn btn-secondary">
              Salin Teks Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  const getFormData = () => ({
    id: o.id,
    nama: overlay.querySelector('#vNama').value.trim() || o.nama,
    phone: overlay.querySelector('#vPhone').value.trim() || o.phone,
    email: overlay.querySelector('#vEmail').value.trim(),
    gender: overlay.querySelector('#vGender').value,
    status: overlay.querySelector('#vStatus').value,
    alamat: overlay.querySelector('#vAlamat').value.trim(),
    resi: overlay.querySelector('#vResi').value.trim(),
    oud_name: o.oud_name,
    oud_country: o.oud_country
  })

  const updatePreview = () => {
    const cur = getFormData()
    const tpl = NOTIF_TEMPLATES[currentTplKey] || NOTIF_TEMPLATES['baru']
    overlay.querySelector('#vNotifText').value = tpl.build(cur, host, cur.resi)
    overlay.querySelector('#waPhoneTarget').textContent = `Tujuan: ${cur.phone}`
  }

  updatePreview()

  // Switch template
  overlay.querySelectorAll('.notif-chip').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelectorAll('.notif-chip').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentTplKey = btn.dataset.tpl
      updatePreview()
    }
  })

  // Status select synchronizes default template
  overlay.querySelector('#vStatus').onchange = (e) => {
    const st = e.target.value
    if (st === 'Baru') currentTplKey = 'baru'
    else if (st === 'Diproses') currentTplKey = 'proses'
    else if (st === 'Dikirim') currentTplKey = 'kirim'
    else if (st === 'Selesai') currentTplKey = 'selesai'
    overlay.querySelectorAll('.notif-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.tpl === currentTplKey)
    })
    updatePreview()
  }

  // Interactive inputs update live preview
  overlay.querySelector('#vNama').oninput = updatePreview
  overlay.querySelector('#vPhone').oninput = updatePreview
  overlay.querySelector('#vGender').onchange = updatePreview
  overlay.querySelector('#vAlamat').oninput = updatePreview
  overlay.querySelector('#vResi').oninput = updatePreview

  // Modal dismiss
  const closeModal = () => {
    overlay.remove()
    document.body.style.overflow = ''
  }
  overlay.querySelector('#closeVerifierBtn').onclick = closeModal
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal()
  }

  // Test online tracking button
  overlay.querySelector('#btnTestTrackCurrent').onclick = () => {
    const curPhone = overlay.querySelector('#vPhone').value.trim()
    if (!curPhone) return toast('Ketik nomor telepon terlebih dahulu', true)
    window.open(`${host}#/cek?phone=${encodeURIComponent(curPhone)}`, '_blank')
  }

  // Copy WhatsApp text
  overlay.querySelector('#btnCopyWa').onclick = () => {
    const txt = overlay.querySelector('#vNotifText').value
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => {
        toast('Teks pesan notifikasi berhasil disalin')
      }).catch(() => prompt('Salin pesan berikut:', txt))
    } else {
      prompt('Salin pesan berikut:', txt)
    }
  }

  // Send WhatsApp
  overlay.querySelector('#btnSendWa').onclick = () => {
    const cur = getFormData()
    const cleanNum = cur.phone.replace(/[^0-9]/g, '')
    if (!cleanNum) return toast('Nomor telepon tidak valid', true)
    let finalNum = cleanNum
    if (finalNum.startsWith('0')) {
      finalNum = '62' + finalNum.slice(1)
    }
    const txt = overlay.querySelector('#vNotifText').value
    window.open(`https://wa.me/${finalNum}?text=${encodeURIComponent(txt)}`, '_blank')
  }

  // Save changes
  overlay.querySelector('#verifierForm').onsubmit = async (e) => {
    e.preventDefault()
    const saveBtn = overlay.querySelector('#btnSaveVerifier')
    saveBtn.disabled = true
    saveBtn.textContent = 'Menyimpan...'

    const cur = getFormData()

    // 1. Persist locally first
    saveLocalOrderEdit(o.id, {
      nama: cur.nama,
      phone: cur.phone,
      email: cur.email,
      gender: cur.gender,
      alamat: cur.alamat,
      status: cur.status,
      resi: cur.resi
    })
    Object.assign(o, cur)

    // 2. Call Supabase RPCs
    try {
      const { error: errUpdate } = await supabase.rpc('admin_update_order', {
        p_pin: pin,
        p_id: o.id,
        p_nama: cur.nama,
        p_phone: cur.phone,
        p_email: cur.email,
        p_gender: cur.gender,
        p_alamat: cur.alamat,
        p_status: cur.status
      })

      if (errUpdate) {
        await supabase.rpc('admin_status', { p_pin: pin, p_id: o.id, p_status: cur.status }).catch(() => {})
        await supabase.rpc('admin_update_status', { p_pin: pin, p_id: o.id, p_status: cur.status }).catch(() => {})
      }
    } catch (err) {
      console.warn('RPC sync notice:', err)
    }

    toast(`Data order #${o.id} berhasil diperbarui!`)
    saveBtn.disabled = false
    saveBtn.textContent = 'Simpan Perubahan Data'

    if (refreshCallback) refreshCallback()
  }
}

/* ─── LOGIN ──────────────────────────────────────────────────────────── */
const login = () => {
  app.innerHTML = `
  <div class="admin-login">
    <div class="login-card">
      <div class="login-icon" style="color:var(--gold); display:flex; justify-content:center; margin-bottom:12px; font-family:Cinzel,serif; font-size:40px; font-weight:800; letter-spacing:2px;">
        <span class="brand-asian">ASIAN</span> <span class="brand-oud">OUD</span>
      </div>
      <h1>Portal Admin ASIAN OUD</h1>
      <p>Masukkan PIN untuk mengakses manajemen pesanan &amp; CMS</p>
      <form id="f">
        <div class="form-group">
          <input name="p" type="password" placeholder="Masukkan PIN Admin" required autocomplete="current-password"/>
        </div>
        <button class="btn btn-login">Masuk ke Dashboard</button>
      </form>
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid #222;">
        <a href="#/" style="color:#888; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:.2s;" onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='#888'">
          <span>← Kembali ke Tampilan Website</span>
        </a>
      </div>
    </div>
  </div>
  `
  document.getElementById('f').onsubmit = async e => {
    e.preventDefault()
    const btn = e.target.querySelector('.btn-login')
    btn.disabled = true; btn.textContent = 'Memverifikasi...'
    const p = e.target.p.value
    const { data: r, error: e1 } = await supabase.rpc('admin_login', { p_pin: p })
    if (e1 || !r?.ok) {
      btn.disabled = false; btn.textContent = 'Masuk ke Dashboard'
      const errMsg = e1?.message || r?.msg || 'PIN salah atau gagal login'
      return toast(errMsg, true)
    }
    pin = r.token
    const { data } = await supabase.rpc('admin_list', { p_pin: pin })
    ORD = applyLocalEdits(data || [])
    admin()
  }
}

/* ─── ADMIN SHELL ────────────────────────────────────────────────────── */
export const admin = async () => {
  if (!pin) return login()
  const newBadge = ORD.filter(o => o.status === 'Baru').length

  app.innerHTML = `
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-text"><span class="brand-asian">ASIAN</span> <span class="brand-oud">OUD</span> ADMIN</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item ${atab === 'orders' ? 'active' : ''}" data-t="orders">
          <span class="nav-icon-badge">1</span>
          <span class="nav-text">Pesanan Masuk</span>
          ${newBadge > 0 ? `<span class="nav-badge">${newBadge}</span>` : ''}
        </button>
        <button class="nav-item ${atab === 'ouds' ? 'active' : ''}" data-t="ouds">
          <span class="nav-icon-badge">2</span>
          <span class="nav-text">Kelola Produk Agarwood</span>
        </button>
        <button class="nav-item ${atab === 'cms' ? 'active' : ''}" data-t="cms">
          <span class="nav-icon-badge">3</span>
          <span class="nav-text">CMS Landing Page</span>
        </button>
        <button class="nav-item ${atab === 'site' ? 'active' : ''}" data-t="site">
          <span class="nav-icon-badge">4</span>
          <span class="nav-text">Pengaturan Sistem</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <a href="#/" target="_blank" class="nav-item" style="color:#aaa; text-decoration:none; margin-bottom:6px;">
          <span class="nav-icon" style="font-size:16px;">🌐</span>
          <span class="nav-text">Lihat Website ↗</span>
        </a>
        <button class="nav-item logout-btn" id="out">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">←</span>
          <span class="nav-text">Keluar (Logout)</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <h1 class="admin-title">${{
          orders: `Manajemen Pesanan Agarwood`,
          ouds:   `Kelola Produk Agarwood`,
          cms:    `CMS Landing Page`,
          site:   `Pengaturan Sistem`
        }[atab]}</h1>
        <div class="admin-header-actions">
          <a href="#/" target="_blank" class="btn btn-preview-web" style="height:36px; padding:0 14px; font-size:12px;">
            <span>🌐 Buka Tampilan Web ↗</span>
          </a>
        </div>
      </div>
      <div id="body" class="admin-body"></div>
    </main>
  </div>
  `
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { atab = b.dataset.t; admin() })
  document.getElementById('out').onclick = () => {
    if (confirm('Yakin ingin keluar?')) { pin = ''; ORD = []; login() }
  }
  ;({ orders: tabOrders, ouds: tabOuds, cms: tabCms, site: tabSite })[atab](document.getElementById('body'))
}

/* ─── TAB ORDERS ─────────────────────────────────────────────────────── */
const tabOrders = async el => {
  const { data } = await supabase.rpc('admin_list', { p_pin: pin })
  if (data) ORD = data
  ORD = applyLocalEdits(ORD)
  const n = s => ORD.filter(x => x.status === s).length
  const host = `${window.location.origin}${window.location.pathname}`

  el.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-content"><div class="stat-value">${ORD.length}</div><div class="stat-label">Total Order</div></div>
    </div>
    <div class="stat-card stat-new">
      <div class="stat-content"><div class="stat-value">${n('Baru')}</div><div class="stat-label">Order Baru</div></div>
    </div>
    <div class="stat-card stat-process">
      <div class="stat-content"><div class="stat-value">${n('Diproses')}</div><div class="stat-label">Diproses / QC</div></div>
    </div>
    <div class="stat-card stat-done">
      <div class="stat-content"><div class="stat-value">${n('Selesai')}</div><div class="stat-label">Selesai</div></div>
    </div>
  </div>

  <!-- TOOLBAR QUICK CHECKER NOMOR TELEPON PELANGGAN -->
  <div class="admin-quick-checker">
    <div class="quick-checker-header">
      <strong class="quick-checker-title">Pemeriksaan &amp; Notifikasi Pelanggan Cepat</strong>
      <span class="quick-checker-badge">MULTI-NOMOR TESTER</span>
    </div>
    <p class="quick-checker-desc">
      Ketik nomor telepon pemesan yang berbeda untuk langsung mengecek tampilan status di halaman pelacakan atau memfilter order:
    </p>
    <div class="quick-checker-bar">
      <input type="tel" id="quickTestPhone" class="quick-phone-input" placeholder="Ketik nomor telepon pemesan (contoh: 081234567890)..." />
      <button type="button" id="btnQuickTestTrack" class="btn btn-primary">
        Uji Pelacakan Online ↗
      </button>
      <button type="button" id="btnQuickFilter" class="btn btn-secondary">
        Filter Order Nomor Ini
      </button>
      <button type="button" id="btnResetQuickFilter" class="btn btn-secondary" style="display:none;">
        Reset Filter
      </button>
    </div>
  </div>

  <div class="admin-filters">
    <input type="text" id="sq" placeholder="Cari pemesan, produk, no hp..." class="filter-search"/>
    <select id="sf" class="filter-select">
      <option value="">Semua Status</option>
      <option value="Baru">Baru</option>
      <option value="Diproses">Diproses</option>
      <option value="Dikirim">Dikirim</option>
      <option value="Selesai">Selesai</option>
    </select>
    <button class="btn btn-secondary btn-export" id="exp">Export CSV</button>
  </div>

  <div id="ordersList" class="orders-list"></div>
  `

  const render = () => {
    const q = el.querySelector('#sq').value.toLowerCase()
    const st = el.querySelector('#sf').value
    const list = ORD.filter(o => {
      const mQ = !q || [o.nama, o.phone, o.email, o.oud_name, o.oud_country, o.alamat, o.resi].some(v => (v || '').toLowerCase().includes(q))
      const mS = !st || o.status === st
      return mQ && mS
    })

    const lEl = el.querySelector('#ordersList')
    if (!list.length) {
      lEl.innerHTML = `<div class="empty-state"><p>Tidak ada pesanan yang sesuai filter.</p></div>`
      return
    }

    lEl.innerHTML = list.map(o => {
      const cleanPhone = (o.phone || '').replace(/[^0-9]/g, '')
      let waTarget = cleanPhone
      if (waTarget.startsWith('0')) waTarget = '62' + waTarget.slice(1)
      const waQuickText = encodeURIComponent(`Halo ${o.nama}, kami dari ASIAN OUD ingin konfirmasi pesanan Anda #${o.id} (${o.oud_name}).`)

      return `
        <div class="admin-order-card" data-id="${o.id}">
          <div class="order-main">
            <div class="order-info">
              <div class="order-badge-row">
                <span class="order-id-badge">#${o.id}</span>
                <span class="order-status-pill status-${(o.status || '').toLowerCase()}">${o.status}</span>
                ${o.resi ? `<span class="order-resi-pill">Resi: ${esc(o.resi)}</span>` : ''}
              </div>
              <div class="order-product-name">${esc(o.oud_name || 'Produk Agarwood')} (${esc(o.oud_country || '-')})</div>
              <div class="order-meta">
                <span><strong>Pemesan:</strong> ${esc(o.nama)}</span>
                <span><strong>WhatsApp:</strong> <span class="phone-hl">${esc(o.phone)}</span></span>
                <span><strong>Email:</strong> ${esc(o.email || '-')}</span>
                <span><strong>Gender:</strong> ${esc(o.gender === 'Laki-laki' ? 'Male' : (o.gender === 'Perempuan' ? 'Female' : (o.gender || '-')))}</span>
              </div>
              ${(o.negara || o.kode_pos) ? `<div style="font-size:12.5px; color:var(--gold); margin:4px 0;">🌐 <strong>Destinasi:</strong> ${esc(o.negara || '-')}${o.kode_pos ? ` · Kode Pos: ${esc(o.kode_pos)}` : ''}</div>` : ''}
              ${o.alamat ? `<div class="order-address"><strong>Alamat Pengiriman:</strong> ${esc(o.alamat)}</div>` : ''}
              <div class="order-date">Waktu Pemesanan: ${new Date(o.created_at).toLocaleString('id-ID')} WIB</div>
            </div>
            <div class="order-actions">
              <button type="button" class="btn btn-primary btn-check-order" data-id="${o.id}">
                Cek Order / Notif
              </button>
              <select class="status-select" data-id="${o.id}">
                ${['Baru', 'Diproses', 'Dikirim', 'Selesai'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <a href="https://wa.me/${waTarget}?text=${waQuickText}" target="_blank" class="btn btn-small btn-wa-quick">Chat WA</a>
            </div>
          </div>
        </div>
      `
    }).join('')

    // Attach click listener for Cek Order / Notif button
    lEl.querySelectorAll('.btn-check-order').forEach(btn => {
      btn.onclick = () => {
        openOrderVerifier(+btn.dataset.id, () => tabOrders(el))
      }
    })

    // Attach change listener for status select
    lEl.querySelectorAll('.status-select').forEach(sel => {
      sel.onchange = async () => {
        const id = +sel.dataset.id
        const newSt = sel.value
        saveLocalOrderEdit(id, { status: newSt })
        const row = ORD.find(x => x.id === id)
        if (row) row.status = newSt

        // Try RPCs
        try {
          const { error } = await supabase.rpc('admin_status', { p_pin: pin, p_id: id, p_status: newSt })
          if (error) {
            await supabase.rpc('admin_update_status', { p_pin: pin, p_id: id, p_status: newSt })
          }
        } catch (e) {}

        toast(`Status order #${id} diubah ke ${newSt}`)
        tabOrders(el)
      }
    })
  }

  el.querySelector('#sq').oninput = render
  el.querySelector('#sf').onchange = render

  // Quick checker actions
  const quickInput = el.querySelector('#quickTestPhone')
  const btnTrack = el.querySelector('#btnQuickTestTrack')
  const btnFilter = el.querySelector('#btnQuickFilter')
  const btnReset = el.querySelector('#btnResetQuickFilter')

  btnTrack.onclick = () => {
    const p = quickInput.value.trim()
    if (!p) return toast('Ketik nomor telepon terlebih dahulu', true)
    window.open(`${host}#/cek?phone=${encodeURIComponent(p)}`, '_blank')
  }

  btnFilter.onclick = () => {
    const p = quickInput.value.trim()
    if (!p) return toast('Ketik nomor telepon terlebih dahulu', true)
    el.querySelector('#sq').value = p
    btnReset.style.display = 'inline-block'
    render()
  }

  btnReset.onclick = () => {
    quickInput.value = ''
    el.querySelector('#sq').value = ''
    btnReset.style.display = 'none'
    render()
  }

  el.querySelector('#exp').onclick = () => {
    const csv = ['ID,Nama,WhatsApp,Email,Produk,Negara_Produk,Negara_Tujuan,Kode_Pos,Kota,Alamat,Resi,Status,Tanggal'].concat(
      ORD.map(o => `"${o.id}","${o.nama}","${o.phone}","${o.email || ''}","${o.oud_name || ''}","${o.oud_country || ''}","${o.negara || ''}","${o.kode_pos || ''}","${o.kota || ''}","${(o.alamat || '').replace(/"/g, '""')}","${(o.resi || '').replace(/"/g, '""')}","${o.status}","${o.created_at}"`)
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `asian-oud-orders-${Date.now()}.csv`; a.click()
  }

  render()
}

/* ─── TAB OUDS (PRODUK AGARWOOD) ─────────────────────────────────────── */
const tabOuds = el => {
  const countries = getCountries()
  if (!countries.includes(acountry) && countries.length > 0) {
    acountry = countries[0]
  }
  const ouds = getOuds(acountry)
  el.innerHTML = `
  <div class="country-tabs">
    ${countries.map(c => `
      <button class="country-tab ${c === acountry ? 'active' : ''}" data-c="${c}">
        <span class="tab-name">${c}</span>
      </button>
    `).join('')}
  </div>

  <div class="oud-info-box">
    📸 <strong>Manajemen Media Produk Agarwood (${acountry})</strong>: Setiap produk mendukung <strong>3 Foto</strong> (Foto Utama &amp; 2 Foto Galeri) dan <strong>2 Video</strong> (Fisik Kayu &amp; Tes Bakar/Aroma). Anda dapat mengunggah file foto/video langsung dari HP atau menempelkan tautan. Perubahan langsung aktif di website setelah disimpan.
  </div>

  <div class="oud-editor-grid">
    ${ouds.map((o, idx) => {
      const slot = o.slot || o.id || (idx + 1)
      const imgSlots = [
        { key: 'img',  label: '⭐ Foto Utama (Cover)', val: o.img,  fileField: 'file',  statusId: `img-status-${slot}` },
        { key: 'img2', label: '📷 Foto Galeri 2',       val: o.img2, fileField: 'file2', statusId: `img2-status-${slot}` },
        { key: 'img3', label: '📷 Foto Galeri 3',       val: o.img3, fileField: 'file3', statusId: `img3-status-${slot}` },
      ]
      return `
      <form class="oud-editor-card" data-slot="${slot}">

        <!-- Card header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;font-weight:800;color:var(--gold);letter-spacing:.5px;text-transform:uppercase">Produk #${slot}</span>
          <a href="#/oud/${encodeURIComponent(acountry)}/${slot}" target="_blank" class="btn btn-preview-web" style="height:32px;font-size:11px;padding:0 12px">Lihat di Web ↗</a>
        </div>

        <!-- 3 FOTO UPLOAD SLOTS -->
        <div class="oud-gallery-slots">
          ${imgSlots.map((s, si) => {
            const hasPhoto = Boolean(s.val)
            return `
            <div class="oud-gallery-slot ${si === 0 ? 'slot-main' : ''}" data-slotkey="${s.key}">
              <div class="oud-slot-header">
                <span class="oud-slot-title">${s.label}</span>
                ${s.val && si > 0 ? `<button type="button" class="btn-clear-slot" data-clear="${s.key}" title="Hapus foto ${s.label}">✕ Hapus</button>` : ''}
              </div>

              <!-- Preview Box (Klik untuk pilih file) -->
              <label class="oud-preview-box" title="Klik untuk pilih file foto dari HP/komputer">
                <img src="${s.val || ''}" alt="${s.label}" class="slot-preview-img" style="${hasPhoto ? '' : 'display:none;'}" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';"/>
                <div class="oud-preview-empty" style="${hasPhoto ? 'display:none;' : 'display:flex;'}">
                  <span class="oud-preview-empty-icon">📁</span>
                  <span>Klik Upload Foto</span>
                </div>
                <input type="file" name="${s.fileField}" accept="image/jpeg,image/png,image/webp,image/jpg" class="file-input-hidden"/>
              </label>

              <!-- Status Badge -->
              <div class="oud-img-status" id="${s.statusId}" style="display:none;"></div>

              <!-- Tombol Pilih File -->
              <label class="btn-upload-label ${hasPhoto ? 'has-photo' : ''}">
                <input type="file" name="${s.fileField}_btn" accept="image/jpeg,image/png,image/webp,image/jpg" class="file-input-hidden"/>
                <span>📁 ${hasPhoto ? 'Ganti Foto' : 'Pilih File Foto'}</span>
              </label>
            </div>
            `
          }).join('')}
        </div>

        <!-- 2 VIDEO SLOTS -->
        <div class="oud-video-section">
          <div class="oud-section-title">🎬 Video Produk (2 Slot)</div>
          <div class="oud-video-grid">
            <!-- Video 1 -->
            <div class="oud-video-slot" data-videokey="video1">
              <div class="oud-slot-header">
                <span class="oud-slot-title">🎬 Video 1 (Fisik Kayu)</span>
                ${o.video1 ? `<button type="button" class="btn-clear-video" data-vclear="video1" title="Hapus Video 1">✕ Hapus</button>` : ''}
              </div>
              <div class="oud-video-preview-wrap">
                ${o.video1 ? `
                  <video src="${o.video1}" controls class="slot-video-preview" style="width:100%;max-height:130px;background:#000;border-radius:6px;"></video>
                ` : `
                  <div class="oud-video-empty">
                    <span style="font-size:22px;">🎬</span>
                    <span style="font-size:11px;color:#777;">Belum ada Video 1</span>
                  </div>
                `}
              </div>
              <div class="oud-video-status" id="video1-status-${slot}" style="display:none;"></div>
              <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;">
                <label class="btn-upload-label ${o.video1 ? 'has-photo' : ''}" style="font-size:11px;padding:6px 10px;">
                  <input type="file" name="video1_file" accept="video/mp4,video/webm,video/quicktime" class="file-input-hidden"/>
                  <span>📹 ${o.video1 ? 'Ganti Video' : 'Upload Video (MP4)'}</span>
                </label>
                <input type="url" name="video1_url" class="img-url-input" placeholder="atau tempel link video (YouTube/MP4)..." value="${o.video1 || ''}" style="font-size:11px;padding:5px 8px;"/>
              </div>
            </div>

            <!-- Video 2 -->
            <div class="oud-video-slot" data-videokey="video2">
              <div class="oud-slot-header">
                <span class="oud-slot-title">🎬 Video 2 (Tes Aroma / Bakar)</span>
                ${o.video2 ? `<button type="button" class="btn-clear-video" data-vclear="video2" title="Hapus Video 2">✕ Hapus</button>` : ''}
              </div>
              <div class="oud-video-preview-wrap">
                ${o.video2 ? `
                  <video src="${o.video2}" controls class="slot-video-preview" style="width:100%;max-height:130px;background:#000;border-radius:6px;"></video>
                ` : `
                  <div class="oud-video-empty">
                    <span style="font-size:22px;">🎬</span>
                    <span style="font-size:11px;color:#777;">Belum ada Video 2</span>
                  </div>
                `}
              </div>
              <div class="oud-video-status" id="video2-status-${slot}" style="display:none;"></div>
              <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;">
                <label class="btn-upload-label ${o.video2 ? 'has-photo' : ''}" style="font-size:11px;padding:6px 10px;">
                  <input type="file" name="video2_file" accept="video/mp4,video/webm,video/quicktime" class="file-input-hidden"/>
                  <span>📹 ${o.video2 ? 'Ganti Video' : 'Upload Video (MP4)'}</span>
                </label>
                <input type="url" name="video2_url" class="img-url-input" placeholder="atau tempel link video (YouTube/MP4)..." value="${o.video2 || ''}" style="font-size:11px;padding:5px 8px;"/>
              </div>
            </div>
          </div>
        </div>

        <div class="oud-fields">
          <div class="form-group">
            <label>Nama Produk / Grade</label>
            <input type="text" name="sub" value="${esc(o.sub || '')}" placeholder="Contoh: Premium Wild Agarwood Grade A+" required/>
          </div>
          <div class="form-group">
            <label>Label Varian / Karakteristik</label>
            <input type="text" name="name" value="${esc(o.name || '')}" placeholder="Contoh: Kalimantan Super Sinking" required/>
          </div>
          <div class="form-group">
            <label>Deskripsi &amp; Spesifikasi</label>
            <textarea name="descr" rows="2" placeholder="Aroma, resin, keunggulan produk...">${esc(o.desc || '')}</textarea>
          </div>

          <div class="oud-actions">
            <button class="btn btn-save" type="submit">
              <span>💾 Simpan 3 Foto &amp; 2 Video</span>
            </button>
            ${o.custom ? `<button type="button" class="btn btn-reset reset"><span>↺ Reset Produk</span></button>` : ''}
          </div>
        </div>
      </form>
      `
    }).join('')}
  </div>
  `

  el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { acountry = b.dataset.c; tabOuds(el) })
  el.querySelectorAll('.oud-editor-card').forEach((f) => {
    // null = keep existing, string = new base64 image (or '' to delete)
    const imgState = { img: null, img2: null, img3: null }
    // null = keep existing, string = new video url (or '' to delete)
    const videoState = { video1: null, video2: null }
    const slot = +f.dataset.slot
    const currentOud = ouds.find(x => (x.slot || x.id) === slot) || {}

    // Setup photo slot file inputs & clear buttons (3 slots)
    const photoSlots = [
      { key: 'img',  field: 'file' },
      { key: 'img2', field: 'file2' },
      { key: 'img3', field: 'file3' }
    ]

    photoSlots.forEach(({ key }) => {
      const slotEl = f.querySelector(`.oud-gallery-slot[data-slotkey="${key}"]`)
      if (!slotEl) return

      const prevImg   = slotEl.querySelector('.slot-preview-img')
      const emptyBox  = slotEl.querySelector('.oud-preview-empty')
      const statusBox = slotEl.querySelector('.oud-img-status')
      const fileInputs = slotEl.querySelectorAll('input[type="file"]')
      const labelSpan = slotEl.querySelector('.btn-upload-label span')
      const btnClear  = slotEl.querySelector('.btn-clear-slot')

      const onFileChange = async (file) => {
        if (!file) return
        try {
          toast('Memproses foto...')
          const b64 = await resize(file)
          imgState[key] = b64
          if (prevImg) {
            prevImg.src = b64
            prevImg.style.display = 'block'
          }
          if (emptyBox) emptyBox.style.display = 'none'
          if (statusBox) {
            const kb = Math.round(b64.length / 1024)
            statusBox.innerHTML = `<span class="img-status-badge">✓ Foto siap (${kb} KB)</span>`
            statusBox.style.display = 'block'
          }
          if (labelSpan) labelSpan.textContent = '✓ Foto Baru Dipilih'
          toast('📷 Foto berhasil dimuat! Klik Simpan di bawah.')
        } catch (err) {
          console.error('Error resize:', err)
          toast(err.message || 'Gagal memproses file foto', true)
        }
      }

      fileInputs.forEach(input => {
        input.onchange = () => {
          if (input.files && input.files[0]) {
            onFileChange(input.files[0])
          }
        }
      })

      if (btnClear) {
        btnClear.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          imgState[key] = ''
          if (prevImg) {
            prevImg.src = ''
            prevImg.style.display = 'none'
          }
          if (emptyBox) emptyBox.style.display = 'flex'
          if (statusBox) {
            statusBox.innerHTML = `<span class="img-status-badge" style="background:rgba(231,76,60,0.15);border-color:#e74c3c;color:#e74c3c;">✕ Foto dihapus</span>`
            statusBox.style.display = 'block'
          }
          if (labelSpan) labelSpan.textContent = '📁 Pilih File Foto'
        }
      }
    })

    // Setup video slot file inputs, url inputs & clear buttons (2 slots)
    const videoSlots = ['video1', 'video2']
    videoSlots.forEach(vKey => {
      const vSlot = f.querySelector(`.oud-video-slot[data-videokey="${vKey}"]`)
      if (!vSlot) return

      const fileInput = vSlot.querySelector('input[type="file"]')
      const urlInput  = vSlot.querySelector('input[type="url"]')
      const prevWrap  = vSlot.querySelector('.oud-video-preview-wrap')
      const statusEl  = vSlot.querySelector('.oud-video-status')
      const btnClear  = vSlot.querySelector('.btn-clear-video')
      const labelSpan = vSlot.querySelector('.btn-upload-label span')

      // 1. File Upload to Supabase Storage
      if (fileInput) {
        fileInput.onchange = async () => {
          const file = fileInput.files?.[0]
          if (!file) return
          if (file.size > 50 * 1024 * 1024) {
            return toast('Ukuran file video maksimal 50 MB!', true)
          }

          if (statusEl) {
            statusEl.innerHTML = `<span class="img-status-badge" style="background:rgba(212,175,55,0.15);border-color:var(--gold);color:var(--gold);">⏳ Mengunggah video (${Math.round(file.size / 1024 / 1024 * 10) / 10} MB)...</span>`
            statusEl.style.display = 'block'
          }
          toast(`Mengunggah file video (${Math.round(file.size / 1024 / 1024 * 10) / 10} MB)...`)

          try {
            const ext = file.name.split('.').pop() || 'mp4'
            const filePath = `videos/${acountry.toLowerCase()}-slot${slot}-${vKey}-${Date.now()}.${ext}`

            const { error: upErr } = await supabase.storage.from('product-media').upload(filePath, file, { cacheControl: '3600', upsert: true })
            if (upErr) {
              console.error('Upload video error:', upErr)
              if (statusEl) statusEl.style.display = 'none'
              return toast('Gagal mengunggah video: ' + (upErr.message || 'Error storage'), true)
            }

            const { data: pub } = supabase.storage.from('product-media').getPublicUrl(filePath)
            const videoUrl = pub.publicUrl
            videoState[vKey] = videoUrl

            if (urlInput) urlInput.value = videoUrl
            if (prevWrap) {
              prevWrap.innerHTML = `<video src="${videoUrl}" controls style="width:100%;max-height:130px;background:#000;border-radius:6px;"></video>`
            }
            if (statusEl) {
              statusEl.innerHTML = `<span class="img-status-badge">✓ Video berhasil diunggah!</span>`
              statusEl.style.display = 'block'
            }
            if (labelSpan) labelSpan.textContent = '✓ Video Terpilih'
            toast('🎬 Video berhasil diunggah! Klik Simpan di bawah.')
          } catch (err) {
            console.error('Video upload error:', err)
            if (statusEl) statusEl.style.display = 'none'
            toast('Gagal memproses video: ' + (err.message || 'Koneksi error'), true)
          }
        }
      }

      // 2. Direct URL paste (YouTube / MP4 URL)
      if (urlInput) {
        urlInput.oninput = () => {
          const u = urlInput.value.trim()
          if (u && (u.startsWith('http://') || u.startsWith('https://'))) {
            videoState[vKey] = u
            if (prevWrap) {
              if (u.includes('youtube.com') || u.includes('youtu.be')) {
                prevWrap.innerHTML = `<div style="padding:16px 10px;text-align:center;color:var(--gold);font-size:12px;background:#0c0c0c;border-radius:6px;">✓ Tautan YouTube terhubung</div>`
              } else {
                prevWrap.innerHTML = `<video src="${u}" controls style="width:100%;max-height:130px;background:#000;border-radius:6px;"></video>`
              }
            }
            if (statusEl) {
              statusEl.innerHTML = `<span class="img-status-badge">✓ Link video terpasang</span>`
              statusEl.style.display = 'block'
            }
          }
        }
      }

      // 3. Clear video button
      if (btnClear) {
        btnClear.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          videoState[vKey] = ''
          if (urlInput) urlInput.value = ''
          if (prevWrap) {
            prevWrap.innerHTML = `
              <div class="oud-video-empty">
                <span style="font-size:22px;">🎬</span>
                <span style="font-size:11px;color:#777;">Video dihapus</span>
              </div>
            `
          }
          if (statusEl) {
            statusEl.innerHTML = `<span class="img-status-badge" style="background:rgba(231,76,60,0.15);border-color:#e74c3c;color:#e74c3c;">✕ Video dihapus (klik Simpan)</span>`
            statusEl.style.display = 'block'
          }
          if (labelSpan) labelSpan.textContent = '📹 Upload Video (MP4)'
        }
      }
    })

    const save = async () => {
      const btn = f.querySelector('.btn-save')
      btn.disabled = true
      btn.innerHTML = `<span>⏳ Menyimpan ke Database...</span>`

      const resolveFinalImg = (k) => {
        if (imgState[k] !== null) return imgState[k]
        return currentOud[k] || null
      }

      const finalImg    = resolveFinalImg('img')
      const finalImg2   = resolveFinalImg('img2')
      const finalImg3   = resolveFinalImg('img3')
      const finalVideo1 = videoState.video1 !== null ? videoState.video1 : (f.querySelector('input[name="video1_url"]')?.value.trim() || currentOud.video1 || null)
      const finalVideo2 = videoState.video2 !== null ? videoState.video2 : (f.querySelector('input[name="video2_url"]')?.value.trim() || currentOud.video2 || null)

      const rpcParams = {
        p_pin:     pin,
        p_country: acountry,
        p_slot:    slot,
        p_name:    f.name.value.trim(),
        p_sub:     f.sub.value.trim(),
        p_descr:   f.descr.value.trim(),
        p_img:     finalImg  !== null ? finalImg  : null,
        p_img2:    finalImg2 !== null ? finalImg2 : null,
        p_img3:    finalImg3 !== null ? finalImg3 : null,
        p_img4:    null,
        p_video1:  finalVideo1 !== null ? finalVideo1 : null,
        p_video2:  finalVideo2 !== null ? finalVideo2 : null,
      }

      let { error } = await supabase.rpc('admin_save_oud', rpcParams)
      if (error) {
        console.error('admin_save_oud 12-param error:', error)
        // If function with 12 params not yet registered in schema cache, try 10-param version
        if (error.code === 'PGRST202' || error.message?.includes('schema cache')) {
          const fallbackParams = {
            p_pin:     pin,
            p_country: acountry,
            p_slot:    slot,
            p_name:    rpcParams.p_name,
            p_sub:     rpcParams.p_sub,
            p_descr:   rpcParams.p_descr,
            p_img:     rpcParams.p_img,
            p_img2:    rpcParams.p_img2,
            p_img3:    rpcParams.p_img3,
            p_img4:    null,
          }
          const r2 = await supabase.rpc('admin_save_oud', fallbackParams)
          if (!r2.error) {
            error = null
            // Also directly update video1 and video2 if possible
            try {
              await supabase.from('ouds').update({
                video1: finalVideo1,
                video2: finalVideo2
              }).match({ country: acountry, slot })
            } catch(e) {}
          }
        }
      }

      if (error) {
        btn.disabled = false
        btn.innerHTML = `<span>💾 Simpan 3 Foto &amp; 2 Video</span>`
        return toast('Gagal menyimpan: ' + (error.message || 'Koneksi bermasalah'), true)
      }

      // Optimistic instant in-memory update
      const targetIdx = (DB.ouds || []).findIndex(x => x.country === acountry && x.slot === slot)
      const updatedRecord = {
        country: acountry,
        slot,
        name:   rpcParams.p_name,
        sub:    rpcParams.p_sub,
        descr:  rpcParams.p_descr,
        img:    finalImg,
        img2:   finalImg2,
        img3:   finalImg3,
        video1: finalVideo1,
        video2: finalVideo2,
        custom: true
      }
      if (targetIdx !== -1) {
        DB.ouds[targetIdx] = { ...DB.ouds[targetIdx], ...updatedRecord }
      } else {
        DB.ouds.push(updatedRecord)
      }
      persistSite()

      await load()
      toast('✓ 3 Foto & 2 Video berhasil disimpan! Perubahan sudah aktif di web.')
      tabOuds(el)
    }

    f.onsubmit = e => { e.preventDefault(); save() }

    const r = f.querySelector('.reset')
    if (r) r.onclick = () => {
      if (confirm('Reset produk ini ke media & data default bawaan? Semua foto dan video kustom akan dihapus.')) {
        imgState.img = imgState.img2 = imgState.img3 = ''
        videoState.video1 = videoState.video2 = ''
        save()
      }
    }
  })
}

/* ─── TAB CMS LANDING PAGE ───────────────────────────────────────────── */
const tabCms = el => {
  const sections = [
    {
      id: 'hero',
      title: 'Hero Section',
      icon: '✦',
      desc: 'Bagian utama yang pertama dilihat pengunjung saat masuk ke website.',
      fields: [
        { key: 'lp_brand',          label: 'Nama Brand (Navbar & Sidebar)',   type: 'text',     ph: 'ASIAN OUD',             def: 'ASIAN OUD' },
        { key: 'lp_hero_badge',     label: 'Badge Kecil di Atas Judul',        type: 'text',     ph: 'Trusted Supplier of Premium Agarwood', def: 'Trusted Supplier of Premium Agarwood' },
        { key: 'lp_hero_title',     label: 'Judul Utama Hero (Besar)',         type: 'text',     ph: 'BUY NOW',               def: 'BUY NOW' },
        { key: 'lp_hero_subtitle',  label: 'Deskripsi Singkat Hero',           type: 'textarea', ph: 'Menyediakan koleksi Agarwood...', def: 'Menyediakan koleksi Agarwood / Gaharu kualitas tertinggi dari 6 negara Asia.' },
        { key: 'lp_hero_stat1_num', label: 'Statistik 1: Angka',               type: 'text',     ph: '6',                     def: '6' },
        { key: 'lp_hero_stat1_lbl', label: 'Statistik 1: Keterangan',          type: 'text',     ph: 'Negara Asia',           def: 'Negara Asia' },
        { key: 'lp_hero_stat2_num', label: 'Statistik 2: Angka',               type: 'text',     ph: '100%',                  def: '100%' },
        { key: 'lp_hero_stat2_lbl', label: 'Statistik 2: Keterangan',          type: 'text',     ph: 'Autentik & Murni',      def: 'Autentik & Murni' },
        { key: 'lp_hero_stat3_num', label: 'Statistik 3: Angka',               type: 'text',     ph: 'GRADE A+',              def: 'GRADE A+' },
        { key: 'lp_hero_stat3_lbl', label: 'Statistik 3: Keterangan',          type: 'text',     ph: 'Super Sinking',         def: 'Super Sinking' }
      ]
    },
    {
      id: 'catalog',
      title: 'Katalog & Koleksi Produk',
      icon: '✦',
      desc: 'Judul dan sub-judul pada bagian katalog Agarwood 6 negara.',
      fields: [
        { key: 'lp_country_title', label: 'Judul Bagian Origin 6 Negara', type: 'text', ph: 'PREMIUM AGARWOOD COLLECTION FROM SIX ASIAN COUNTRIES.', def: 'PREMIUM AGARWOOD COLLECTION FROM SIX ASIAN COUNTRIES.' },
        { key: 'lp_cat_badge',    label: 'Label Badge Katalog',       type: 'text', ph: 'KOLEKSI 6 NEGARA ASIA', def: 'KOLEKSI 6 NEGARA ASIA' },
        { key: 'lp_cat_title',    label: 'Judul Bagian Katalog',      type: 'text', ph: 'EKSPLORASI AGARWOOD ASIA', def: 'EKSPLORASI AGARWOOD ASIA' },
        { key: 'lp_cat_subtitle', label: 'Sub-judul Bagian Katalog',  type: 'text', ph: 'Pilih negara untuk melihat koleksi...', def: 'Pilih negara untuk melihat koleksi gaharu liar pilihan dengan aroma khas tiap wilayah.' }
      ]
    },
    {
      id: 'features',
      title: 'Keunggulan / Fitur Utama',
      icon: '✦',
      desc: '3 kartu keunggulan ASIAN OUD di halaman depan.',
      fields: [
        { key: 'lp_feat1_title', label: 'Keunggulan 1: Judul',      type: 'text', ph: '100% Autentik & Alami',     def: '100% Autentik & Alami' },
        { key: 'lp_feat1_desc',  label: 'Keunggulan 1: Keterangan', type: 'text', ph: 'Bebas bahan kimia...',      def: 'Bebas dari bahan kimia buatan, pewangi sintetis, atau manipulasi warna resin.' },
        { key: 'lp_feat2_title', label: 'Keunggulan 2: Judul',      type: 'text', ph: 'Kurasi Langsung dari Hutan',def: 'Kurasi Langsung dari Hutan' },
        { key: 'lp_feat2_desc',  label: 'Keunggulan 2: Keterangan', type: 'text', ph: 'Dipanen oleh pemburu...',   def: 'Dipanen langsung oleh pemburu gaharu berpengalaman dari hutan pedalaman Asia.' },
        { key: 'lp_feat3_title', label: 'Keunggulan 3: Judul',      type: 'text', ph: 'Mutu Super Sinking',        def: 'Mutu Super Sinking' },
        { key: 'lp_feat3_desc',  label: 'Keunggulan 3: Keterangan', type: 'text', ph: 'Kandungan resin padat...',  def: 'Kandungan resin padat tinggi yang tenggelam di air dengan profil aroma abadi.' }
      ]
    },
    {
      id: 'contact_info',
      title: 'Kontak & Bantuan WhatsApp',
      icon: '✦',
      desc: 'Informasi nomor kontak customer service dan admin.',
      fields: [
        { key: 'lp_wa_number',  label: 'Nomor WhatsApp Admin',   type: 'text', ph: '6281234567890',                  def: '6281234567890' },
        { key: 'lp_wa_label',   label: 'Teks Tombol WhatsApp',    type: 'text', ph: 'Chat via WhatsApp',              def: 'Chat via WhatsApp' },
        { key: 'lp_wa_hint',    label: 'Keterangan Layanan CS',  type: 'text', ph: 'Konsultasi 24/7 Gratis',          def: 'Konsultasi 24/7 Gratis' }
      ]
    }
  ]

  el.innerHTML = `
    <div class="cms-wrapper">
      <div class="cms-header-bar">
        <div>
          <h2 class="cms-page-title">CMS Landing Page ASIAN OUD</h2>
          <p class="cms-page-sub">Sesuaikan teks, tagline, dan informasi website secara langsung tanpa mengubah kode.</p>
        </div>
        <button class="btn btn-primary" id="cmsSaveAllTop">Simpan Semua Perubahan</button>
      </div>

      <div class="cms-sections-stack">
        ${sections.map(sec => `
          <div class="cms-section-card" id="cms-sec-${sec.id}">
            <div class="cms-section-header">
              <div class="cms-section-info">
                <span class="cms-section-badge">${sec.icon}</span>
                <div>
                  <h3 class="cms-section-title">${sec.title}</h3>
                  <p class="cms-section-desc">${sec.desc}</p>
                </div>
              </div>
              <button class="btn btn-secondary cms-save-section" data-sec="${sec.id}">Simpan Bagian Ini</button>
            </div>
            <div class="cms-section-body">
              <div class="cms-fields-grid">
                ${sec.fields.map(f => `
                  <div class="cms-field-row ${f.type === 'textarea' ? 'cms-field-full' : ''}">
                    <label class="cms-field-label">
                      ${f.label}
                      <span class="cms-key-hint"><code>${f.key}</code></span>
                    </label>
                    ${f.type === 'textarea' ? `
                      <textarea class="cms-input" data-key="${f.key}" rows="3" placeholder="${esc(f.ph)}">${esc(S(f.key, f.def))}</textarea>
                    ` : `
                      <input type="text" class="cms-input" data-key="${f.key}" value="${esc(S(f.key, f.def))}" placeholder="${esc(f.ph)}"/>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cms-save-all-bar">
        <button class="btn btn-primary btn-cms-save-all" id="cmsSaveAllBottom">
          Simpan Semua Pengaturan CMS
        </button>
      </div>
    </div>
  `

  const saveKeys = async (keys, btn) => {
    if (btn) {
      btn.disabled = true
      btn.textContent = 'Menyimpan...'
    }

    let successCount = 0
    let lastError = null

    for (const k of keys) {
      const input = el.querySelector(`[data-key="${k}"]`)
      if (!input) continue
      const v = input.value.trim()
      saveSite(k, v)

      try {
        const { error } = await supabase.rpc('admin_save_site', {
          p_pin: pin,
          p_key: k,
          p_value: v
        })
        if (!error) {
          successCount++
        } else {
          lastError = error.message
        }
      } catch (err) {
        lastError = err.message
      }
    }

    persistSite()

    if (btn) {
      btn.disabled = false
      btn.textContent = 'Tersimpan'
      setTimeout(() => {
        btn.textContent = btn.classList.contains('cms-save-section') ? 'Simpan Bagian Ini' : 'Simpan Semua Perubahan'
      }, 2000)
    }

    if (lastError && successCount === 0) {
      toast(`Gagal menyimpan ke server: ${lastError}`, true)
    } else {
      toast(`Berhasil menyimpan perubahan CMS!`)
    }
  }

  el.querySelectorAll('.cms-save-section').forEach(btn => {
    btn.onclick = () => {
      const secId = btn.dataset.sec
      const sec = sections.find(s => s.id === secId)
      if (sec) {
        saveKeys(sec.fields.map(f => f.key), btn)
      }
    }
  })

  const saveAll = () => {
    const allKeys = sections.flatMap(s => s.fields.map(f => f.key))
    saveKeys(allKeys, el.querySelector('#cmsSaveAllBottom'))
  }

  const topBtn = el.querySelector('#cmsSaveAllTop')
  const btmBtn = el.querySelector('#cmsSaveAllBottom')
  if (topBtn) topBtn.onclick = saveAll
  if (btmBtn) btmBtn.onclick = saveAll
}

/* ─── TAB SETTINGS ───────────────────────────────────────────────────── */
const tabSite = el => {
  el.innerHTML = `
  <div class="settings-grid">
    <form id="pf" class="settings-card">
      <h3 class="settings-title">Keamanan Akun Admin</h3>
      <p class="settings-desc">Ubah PIN admin untuk keamanan portal. Minimal 4 karakter.</p>
      <div class="form-group">
        <label>PIN Baru</label>
        <input name="np" type="password" minlength="4" placeholder="Minimal 4 karakter (disarankan 8+)" required/>
      </div>
      <div class="form-group">
        <label>Konfirmasi PIN Baru</label>
        <input name="np2" type="password" minlength="4" placeholder="Ulangi PIN baru" required/>
      </div>
      <button class="btn btn-warning">
        <span>Ganti PIN Admin</span>
      </button>
    </form>

    <div class="settings-card">
      <h3 class="settings-title">Info Sistem</h3>
      <p class="settings-desc">Detail teknis platform dan versi data.</p>
      <div class="info-list" style="margin-top:16px">
        <div class="info-item"><span class="info-label">Platform:</span><span class="info-val">ASIAN OUD v2.5</span></div>
        <div class="info-item"><span class="info-label">Tagline:</span><span class="info-val">Trusted Supplier of Premium Agarwood</span></div>
        <div class="info-item"><span class="info-label">Total Order:</span><span class="info-val">${ORD.length} pesanan</span></div>
        <div class="info-item"><span class="info-label">Negara Sumber:</span><span class="info-val">6 (Asia)</span></div>
      </div>
      <button class="btn btn-secondary" id="clearCacheBtn" style="margin-top:20px;width:100%;">
        <span>Clear Local Cache</span>
      </button>
    </div>
  </div>
  `

  el.querySelector('#pf').onsubmit = async e => {
    e.preventDefault()
    const np = e.target.np.value
    const np2 = e.target.np2.value
    if (np !== np2) return toast('PIN baru tidak cocok!', true)
    const { data: r, error } = await supabase.rpc('admin_set_pin', { p_pin: pin, p_new: np })
    if (error || !r) return toast(error?.message || 'Gagal mengubah PIN', true)
    toast('PIN admin berhasil diubah. Silakan login kembali.')
    pin = ''; ORD = []; login()
  }

  el.querySelector('#clearCacheBtn').onclick = () => {
    try { localStorage.clear() } catch (e) {}
    toast('Local cache dihapus. Refresh halaman untuk memuat data segar.')
  }
}
