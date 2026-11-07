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
const NOTIF_TEMPLATES = {
  'baru': {
    title: '1. Order Diterima',
    build: (o, host) => 
`Halo ${o.gender === 'Perempuan' ? 'Ibu' : 'Bapak'} ${o.nama},

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
`Halo ${o.gender === 'Perempuan' ? 'Ibu' : 'Bapak'} ${o.nama},

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
`Halo ${o.gender === 'Perempuan' ? 'Ibu' : 'Bapak'} ${o.nama},

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
`Halo ${o.gender === 'Perempuan' ? 'Ibu' : 'Bapak'} ${o.nama},

Pesanan Agarwood Anda #${o.id} (${o.oud_name}) telah tercatat selesai dan diterima dengan baik.

Semoga aroma dan mutu Agarwood dari ASIAN OUD memberikan kenyamanan, ketenangan, dan kepuasan terbaik bagi Anda.

Jika ada pertanyaan atau ingin memesan kembali koleksi gaharu lainnya, kami siap melayani Anda.

Salam takzim,
ASIAN OUD — Trusted Supplier of Premium Agarwood`
  },
  'verif': {
    title: '5. Verifikasi Alamat',
    build: (o, host) => 
`Halo ${o.gender === 'Perempuan' ? 'Ibu' : 'Bapak'} ${o.nama},

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
                <label>Titel / Panggilan</label>
                <select id="vGender" class="v-input v-select">
                  <option value="Laki-laki" ${o.gender === 'Laki-laki' ? 'selected' : ''}>Bapak / Laki-laki</option>
                  <option value="Perempuan" ${o.gender === 'Perempuan' ? 'selected' : ''}>Ibu / Perempuan</option>
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
        <button class="nav-item logout-btn" id="out">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">←</span>
          <span class="nav-text">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-header">
        <h1 class="admin-title">${{
          orders: `Manajemen Pesanan Agarwood`,
          ouds:   `Kelola Produk Agarwood`,
          cms:    `CMS Landing Page`,
          site:   `Pengaturan Sistem`
        }[atab]}</h1>
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
                <span><strong>Titel:</strong> ${esc(o.gender || '-')}</span>
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
    📸 Kelola produk Agarwood untuk negara <strong>${acountry}</strong>. Klik preview foto untuk ganti gambar, atau edit nama/deskripsi produk lalu simpan.
  </div>

  <div class="oud-editor-grid">
    ${ouds.map((o, idx) => `
      <form class="oud-editor-card" data-slot="${idx + 1}">
        <!-- FOTO PREVIEW: Klik untuk ganti -->
        <div class="oud-preview" title="Klik gambar untuk ganti foto">
          <img src="${o.img}" alt="${esc(o.sub || o.name)}" class="prev oud-img-clickable"/>
          <span class="oud-slot-badge">Slot #${idx + 1}</span>
          <div class="oud-img-overlay">
            <span class="oud-img-overlay-icon">📷</span>
            <span class="oud-img-overlay-text">Ganti Foto</span>
          </div>
          <input type="file" name="file" accept="image/*" class="file-input file-input-hidden"/>
        </div>

        <div class="oud-fields">
          <div class="oud-img-status" id="img-status-${idx + 1}" style="display:none;">
            <span class="img-status-badge new">✓ Foto baru dipilih — klik Simpan untuk menyimpan</span>
          </div>

          <div class="form-group">
            <label>Nama Produk / Grade</label>
            <input type="text" name="sub" value="${esc(o.sub || '')}" placeholder="Contoh: Premium Wild Agarwood Grade A+" required/>
          </div>
          <div class="form-group">
            <label>Label Varian / Karakteristik</label>
            <input type="text" name="name" value="${esc(o.name || '')}" placeholder="Contoh: Kalimantan Super Sinking" required/>
          </div>
          <div class="form-group">
            <label>Deskripsi &amp; Spesifikasi Produk</label>
            <textarea name="descr" rows="3" placeholder="Tuliskan spesifikasi, aroma, resin, dan keunggulan produk...">${esc(o.desc || '')}</textarea>
          </div>

          <div class="oud-actions">
            <button class="btn btn-save">
              <span>💾 Simpan Produk</span>
            </button>
            <button type="button" class="btn btn-pick-img" title="Upload foto produk baru">
              <span>📷 Ganti Foto</span>
            </button>
            ${o.custom ? `<button type="button" class="btn btn-reset reset"><span>↺ Reset</span></button>` : ''}
          </div>
        </div>
      </form>
    `).join('')}
  </div>
  `

  el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { acountry = b.dataset.c; tabOuds(el) })
  el.querySelectorAll('.oud-editor-card').forEach((f, idx) => {
    let img = null  // null = keep existing photo, '' = reset to default, string = new base64 image
    const slot = +f.dataset.slot
    const fileInput = f.querySelector('.file-input')
    const prevImg = f.querySelector('.prev')
    const statusBox = f.querySelector('.oud-img-status')

    // Click on image preview → open file picker
    const imgClickable = f.querySelector('.oud-img-clickable')
    if (imgClickable) {
      imgClickable.onclick = () => fileInput && fileInput.click()
    }

    // Click "Ganti Foto" button → open file picker  
    const btnPick = f.querySelector('.btn-pick-img')
    if (btnPick) {
      btnPick.onclick = () => fileInput && fileInput.click()
    }

    const save = async im => {
      const btn = f.querySelector('.btn-save')
      btn.disabled = true; btn.innerHTML = `<span>⏳ Menyimpan...</span>`
      // im = null means keep existing photo, so don't send p_img (SQL: CASE WHEN p_img IS NULL THEN ouds.img)
      const rpcParams = {
        p_pin: pin, p_country: acountry, p_slot: slot,
        p_name: f.name.value, p_sub: f.sub.value, p_descr: f.descr.value
      }
      if (im !== null) rpcParams.p_img = im
      const { error } = await supabase.rpc('admin_save_oud', rpcParams)
      if (error) {
        btn.disabled = false
        btn.innerHTML = `<span>💾 Simpan Produk</span>`
        return toast(error.message, true)
      }
      await load()
      toast('✓ Produk berhasil disimpan!')
      tabOuds(el)
    }

    if (fileInput) {
      fileInput.onchange = async () => {
        if (fileInput.files[0]) {
          img = await resize(fileInput.files[0])
          if (prevImg) prevImg.src = img
          if (statusBox) statusBox.style.display = 'block'
          toast('📷 Foto dipilih — klik Simpan untuk menyimpan ke database')
        }
      }
    }

    f.onsubmit = e => { e.preventDefault(); save(img) }

    const r = f.querySelector('.reset')
    if (r) r.onclick = () => {
      if (confirm('Reset gambar produk ini ke foto default? Foto custom akan dihapus.')) {
        img = ''
        save('')
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
      desc: '4 kartu keunggulan ASIAN OUD di halaman depan.',
      fields: [
        { key: 'lp_feat1_title', label: 'Keunggulan 1: Judul',      type: 'text', ph: '100% Autentik & Alami',     def: '100% Autentik & Alami' },
        { key: 'lp_feat1_desc',  label: 'Keunggulan 1: Keterangan', type: 'text', ph: 'Bebas bahan kimia...',      def: 'Bebas dari bahan kimia buatan, pewangi sintetis, atau manipulasi warna resin.' },
        { key: 'lp_feat2_title', label: 'Keunggulan 2: Judul',      type: 'text', ph: 'Kurasi Langsung dari Hutan',def: 'Kurasi Langsung dari Hutan' },
        { key: 'lp_feat2_desc',  label: 'Keunggulan 2: Keterangan', type: 'text', ph: 'Dipanen oleh pemburu...',   def: 'Dipanen langsung oleh pemburu gaharu berpengalaman dari hutan pedalaman Asia.' },
        { key: 'lp_feat3_title', label: 'Keunggulan 3: Judul',      type: 'text', ph: 'Mutu Super Sinking',        def: 'Mutu Super Sinking' },
        { key: 'lp_feat3_desc',  label: 'Keunggulan 3: Keterangan', type: 'text', ph: 'Kandungan resin padat...',  def: 'Kandungan resin padat tinggi yang tenggelam di air dengan profil aroma abadi.' },
        { key: 'lp_feat4_title', label: 'Keunggulan 4: Judul',      type: 'text', ph: 'Pengiriman Terproteksi',    def: 'Pengiriman Terproteksi' },
        { key: 'lp_feat4_desc',  label: 'Keunggulan 4: Keterangan', type: 'text', ph: 'Kemasan kedap udara...',    def: 'Kemasan kedap udara aman dengan nomor pelacakan pengiriman transparan.' }
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
