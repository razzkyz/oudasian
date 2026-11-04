import { supabase } from '../lib/supabase.js'
import { COUNTRIES } from '../data/oud.js'
import { getOuds, S, load, DB, persistSite } from '../lib/store.js'
import { esc, toast, resize } from '../lib/utils.js'

const app = document.getElementById('app')
let pin = '', atab = 'orders', acountry = COUNTRIES[0], ORD = []

/* ─── LOGIN ──────────────────────────────────────────────────────────── */
const login = () => {
  app.innerHTML = `
  <div class="admin-login">
    <div class="login-card">
      <div class="login-icon" style="color:var(--gold); display:flex; justify-content:center; margin-bottom:12px; font-family:Cinzel,serif; font-size:48px; font-weight:800; letter-spacing:2px;">
        OUD
      </div>
      <h1>Portal Admin Tour</h1>
      <p>Masukkan PIN untuk mengakses manajemen reservasi & CMS</p>
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
      return toast(r?.msg || 'PIN salah atau gagal login', true)
    }
    pin = r.token
    const { data } = await supabase.rpc('admin_list', { p_pin: pin })
    ORD = data || []
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
          <span class="logo-icon" style="color:var(--gold); display:inline-flex; align-items:center;"></span>
          <span class="logo-text">Admin OUD ASEAN</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item ${atab === 'orders' ? 'active' : ''}" data-t="orders">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">📋</span>
          <span class="nav-text">Reservasi Tour</span>
          ${newBadge > 0 ? `<span class="nav-badge">${newBadge}</span>` : ''}
        </button>
        <button class="nav-item ${atab === 'ouds' ? 'active' : ''}" data-t="ouds">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">🌴</span>
          <span class="nav-text">Kelola Paket Wisata</span>
        </button>
        <button class="nav-item ${atab === 'cms' ? 'active' : ''}" data-t="cms">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">🎨</span>
          <span class="nav-text">CMS Landing Page</span>
        </button>
        <button class="nav-item ${atab === 'site' ? 'active' : ''}" data-t="site">
          <span class="nav-icon" style="display:inline-flex; align-items:center;">⚙</span>
          <span class="nav-text">Pengaturan Situs</span>
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
        <h1 class="admin-title" style="display:inline-flex; align-items:center; gap:10px;">${{
          orders: `Manajemen Reservasi Tour`,
          ouds:   `Manajemen Paket Wisata`,
          cms:    `CMS Landing Page`,
          site:   `Pengaturan Situs`
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
  ORD = data || ORD
  const n = s => ORD.filter(x => x.status === s).length

  el.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon" style="color:var(--gold); display:flex; align-items:center; justify-content:center;"></div>
      <div class="stat-content"><div class="stat-value">${ORD.length}</div><div class="stat-label">Total Booking</div></div>
    </div>
    <div class="stat-card stat-new">
      <div class="stat-icon" style="color:#3498db; display:flex; align-items:center; justify-content:center;"></div>
      <div class="stat-content"><div class="stat-value">${n('Baru')}</div><div class="stat-label">Booking Baru</div></div>
    </div>
    <div class="stat-card stat-process">
      <div class="stat-icon" style="color:#f39c12; display:flex; align-items:center; justify-content:center;"></div>
      <div class="stat-content"><div class="stat-value">${n('Diproses') + n('Dikirim')}</div><div class="stat-label">Jadwal Berjalan</div></div>
    </div>
    <div class="stat-card stat-done">
      <div class="stat-icon" style="color:#2ecc71; display:flex; align-items:center; justify-content:center;"></div>
      <div class="stat-content"><div class="stat-value">${n('Selesai')}</div><div class="stat-label">Tour Selesai</div></div>
    </div>
  </div>
  <div class="filter-bar">
    <div class="search-box">
      <span class="search-icon" style="display:inline-flex; align-items:center;"></span>
      <input id="q" placeholder="Cari nama, WhatsApp, email, paket tour..."/>
    </div>
    <div class="filter-actions">
      <select id="fs" class="filter-select">
        <option value="">Semua Status</option>
        <option>Baru</option><option>Diproses</option><option>Dikirim</option><option>Selesai</option>
      </select>
      <button class="btn btn-export" id="csv" style="display:inline-flex; align-items:center; gap:6px;">
        <span>Unduh CSV</span>
      </button>
    </div>
  </div>
  <div id="list" class="orders-list"></div>
  `

  const list = el.querySelector('#list')
  const paint = () => {
    const q = el.querySelector('#q').value.toLowerCase()
    const s = el.querySelector('#fs').value
    const filtered = ORD.filter(r => {
      const matchQ = !q || [r.nama, r.email, r.phone, r.gender, r.alamat, r.oud_name, r.oud_country].some(v => (v || '').toLowerCase().includes(q))
      return matchQ && (!s || r.status === s)
    })
    list.innerHTML = filtered.length ? filtered.map(r => `
      <div class="order-card status-${(r.status || 'baru').toLowerCase()}">
        <div class="order-header">
          <div class="order-id-section">
            <span class="order-badge">#${r.id}</span>
            <span class="order-product">${esc(r.oud_name || 'Paket Tour')} ${r.oud_country ? `<small>(${esc(r.oud_country)})</small>` : ''}</span>
          </div>
          <span class="order-status badge-${(r.status || 'baru').toLowerCase()}">${esc(r.status)}</span>
        </div>
        <div class="order-content">
          <div class="order-details">
            <div class="order-meta">
              <span style="display:inline-flex; align-items:center; gap:5px;">${esc(r.nama)}</span>
              <span style="display:inline-flex; align-items:center; gap:5px;">${esc(r.email)}</span>
              <span style="display:inline-flex; align-items:center; gap:5px;">${esc(r.phone)}</span>
              <span style="display:inline-flex; align-items:center; gap:5px;">${esc(r.gender)}</span>
            </div>
            ${r.alamat ? `<div class="order-address" style="display:flex; align-items:flex-start; gap:6px;"><div><strong>Titik Jemput:</strong> ${esc(r.alamat)}</div></div>` : ''}
            <div class="order-date" style="display:inline-flex; align-items:center; gap:5px;">${new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</div>
          </div>
          <div class="order-actions">
            <select class="status-select" data-id="${r.id}">
              ${['Baru', 'Diproses', 'Dikirim', 'Selesai'].map(st => `<option ${st === r.status ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `).join('') : `<div class="empty-state"><div class="empty-icon" style="color:var(--text-muted); display:flex; justify-content:center; margin-bottom:10px;"></div><h3>Tidak ada reservasi</h3><p>Belum ada data yang sesuai</p></div>`

    el.querySelectorAll('.status-select').forEach(sel => sel.onchange = async () => {
      sel.disabled = true
      await supabase.rpc('admin_status', { p_pin: pin, p_id: +sel.dataset.id, p_status: sel.value })
      toast('Status diperbarui'); tabOrders(el)
    })
  }
  el.querySelector('#q').oninput = paint
  el.querySelector('#fs').onchange = paint
  paint()

  el.querySelector('#csv').onclick = () => {
    const h = ['id', 'oud_name', 'oud_country', 'nama', 'email', 'phone', 'gender', 'alamat', 'status', 'created_at']
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [h.join(','), ...ORD.map(r => h.map(k => q(r[k])).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `booking_tour_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); toast('CSV berhasil diunduh')
  }
}

/* ─── TAB OUDS / PAKET WISATA ────────────────────────────────────────── */
const tabOuds = el => {
  const list = getOuds(acountry)
  const flags = { Indonesia: '🇮🇩', Thailand: '🇹🇭', Cambodia: '🇰🇭', Vietnam: '🇻🇳', Malaysia: '🇲🇾', Laos: '🇱🇦' }

  el.innerHTML = `
  <div class="country-tabs">
    ${COUNTRIES.map(c => `<button class="country-tab ${c === acountry ? 'active' : ''}" data-c="${c}">
      <span class="tab-flag">${flags[c] || '🌏'}</span><span>${c}</span>
    </button>`).join('')}
  </div>
  <div class="oud-info-box" style="display:flex; align-items:center; gap:8px;">
    <div><strong>Tips:</strong> Upload foto baru untuk mengganti foto default. Kosongkan jika tidak ingin mengubah foto destinasi.</div>
  </div>
  <div class="oud-editor-grid">
    ${list.map(o => `
      <form class="oud-editor-card" data-slot="${o.id}">
        <div class="oud-preview">
          <img class="prev" src="${o.img}" alt="Preview"/>
          <div class="oud-slot-badge">Paket #${o.id}</div>
        </div>
        <div class="oud-fields">
          <div class="form-group">
            <label>Nama Paket Wisata</label>
            <input name="name" value="${esc(o.name)}" placeholder="Nama paket tour"/>
          </div>
          <div class="form-group">
            <label>Subjudul / Highlight</label>
            <input name="sub" value="${esc(o.sub)}" placeholder="Highlight singkat paket"/>
          </div>
          <div class="form-group">
            <label>Deskripsi & Itinerary</label>
            <textarea name="descr" rows="3">${esc(o.desc)}</textarea>
          </div>
          <div class="form-group">
            <label>Upload Foto Destinasi Baru (opsional)</label>
            <input type="file" name="file" accept="image/*" class="file-input"/>
          </div>
          <div class="oud-actions">
            <button class="btn btn-save" style="display:inline-flex; align-items:center; gap:6px;">
              <span>Simpan Paket</span>
            </button>
            ${o.custom ? `<button type="button" class="btn btn-reset reset" style="display:inline-flex; align-items:center; gap:6px;"><span>Reset ke Default</span></button>` : ''}
          </div>
        </div>
      </form>
    `).join('')}
  </div>
  `

  el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { acountry = b.dataset.c; tabOuds(el) })
  el.querySelectorAll('.oud-editor-card').forEach(f => {
    let img = null
    const slot = +f.dataset.slot
    const save = async im => {
      const btn = f.querySelector('.btn-save')
      btn.disabled = true; btn.textContent = 'Menyimpan...'
      const { error } = await supabase.rpc('admin_save_oud', {
        p_pin: pin, p_country: acountry, p_slot: slot,
        p_name: f.name.value, p_sub: f.sub.value, p_descr: f.descr.value, p_img: im
      })
      if (error) { btn.disabled = false; btn.innerHTML = `<span>Simpan Paket</span>`; return toast(error.message, true) }
      await load(); toast('Paket wisata berhasil disimpan'); tabOuds(el)
    }
    f.file.onchange = async () => {
      if (f.file.files[0]) { img = await resize(f.file.files[0]); f.querySelector('.prev').src = img; toast('Foto dipilih') }
    }
    f.onsubmit = e => { e.preventDefault(); save(img) }
    const r = f.querySelector('.reset')
    if (r) r.onclick = () => { if (confirm('Reset ke foto default?')) save('') }
  })
}

/* ─── TAB CMS LANDING PAGE ───────────────────────────────────────────── */
const tabCms = el => {
  // Group fields by section
  const sections = [
    {
      id: 'hero',
      title: 'Hero Section',
      icon: I.Sparkles(18),
      desc: 'Bagian utama yang pertama dilihat pengunjung saat masuk ke website.',
      fields: [
        { key: 'lp_brand',          label: 'Nama Brand (Navbar & Sidebar)',   type: 'text',     ph: 'OUD ASEAN',             def: 'OUD ASEAN' },
        { key: 'lp_hero_badge',     label: 'Badge Kecil di Atas Judul',        type: 'text',     ph: 'Southeast Asia\'s Premier...', def: 'Southeast Asia\'s Premier Oud & Heritage Collections' },
        { key: 'lp_hero_title',     label: 'Judul Utama Hero',                 type: 'text',     ph: 'Jelajahi Pesona Koleksi OUD ASEAN', def: 'Jelajahi Pesona Koleksi OUD ASEAN' },
        { key: 'lp_hero_subtitle',  label: 'Deskripsi / Subjudul Hero',        type: 'textarea', ph: 'Deskripsi singkat layanan...', def: 'Koleksi eksklusif, sewa & reservasi premium 6 negara Asia Tenggara dengan standar kualitas terbaik, kurasi terpercaya, dan pelayanan profesional.' },
      ]
    },
    {
      id: 'stats',
      title: 'Statistik / Angka Keunggulan',
      icon: I.Award(18),
      desc: 'Tiga angka highlight yang tampil di bawah teks hero.',
      fields: [
        { key: 'lp_stat1_num',   label: 'Angka Statistik 1',  type: 'text', ph: '6',     def: '6' },
        { key: 'lp_stat1_label', label: 'Label Statistik 1',  type: 'text', ph: 'Negara Eksotis', def: 'Negara Eksotis' },
        { key: 'lp_stat2_num',   label: 'Angka Statistik 2',  type: 'text', ph: '100%',  def: '100%' },
        { key: 'lp_stat2_label', label: 'Label Statistik 2',  type: 'text', ph: 'Verified Tours', def: 'Verified Tours' },
        { key: 'lp_stat3_num',   label: 'Angka Statistik 3',  type: 'text', ph: '4.9★',  def: '4.9★' },
        { key: 'lp_stat3_label', label: 'Label Statistik 3',  type: 'text', ph: 'Traveler Satisfaction', def: 'Traveler Satisfaction' },
      ]
    },
    {
      id: 'catalog',
      title: 'Seksi Katalog Paket Tour',
      icon: I.Map(18),
      desc: 'Teks di atas grid kartu destinasi.',
      fields: [
        { key: 'lp_country_label', label: 'Label Tombol Pemilih Negara', type: 'text', ph: 'PILIH NEGARA TUJUAN WISATA', def: 'PILIH NEGARA TUJUAN WISATA' },
        { key: 'lp_country_title', label: 'Judul Section Pemilih Negara', type: 'text', ph: 'Eksplorasi Destinasi & Paket Tour per Wilayah', def: 'Eksplorasi Destinasi & Paket Tour per Wilayah' },
        { key: 'lp_catalog_tag',   label: 'Tag Label Katalog',            type: 'text', ph: 'KATALOG PAKET TOUR', def: 'KATALOG PAKET TOUR' },
        { key: 'lp_catalog_title', label: 'Judul Section Katalog',        type: 'text', ph: 'Paket Wisata Unggulan ...', def: 'Paket Wisata Unggulan' },
        { key: 'lp_catalog_sub',   label: 'Deskripsi Bawah Judul Katalog', type: 'textarea', ph: 'Tersedia 8 paket tour kurasi...', def: 'Tersedia 8 paket tour kurasi eksklusif dengan fasilitas lengkap, akomodasi nyaman, dan pemandu berpengalaman' },
      ]
    },
    {
      id: 'features',
      title: 'Seksi Fitur & Keunggulan',
      icon: I.Shield(18),
      desc: '4 kotak keunggulan layanan di bawah kartu destinasi.',
      fields: [
        { key: 'lp_feat1_title', label: 'Judul Fitur 1',        type: 'text', ph: 'Destinasi Terkurasi', def: 'Destinasi Terkurasi' },
        { key: 'lp_feat1_desc',  label: 'Deskripsi Fitur 1',    type: 'textarea', ph: 'Rute wisata pilihan...', def: 'Rute wisata pilihan mencakup ikon legendaris dan surga tersembunyi terbaik.' },
        { key: 'lp_feat2_title', label: 'Judul Fitur 2',        type: 'text', ph: 'Akomodasi Premium', def: 'Akomodasi Premium' },
        { key: 'lp_feat2_desc',  label: 'Deskripsi Fitur 2',    type: 'textarea', ph: 'Menginap di hotel berbintang...', def: 'Menginap di hotel berbintang, resort tepi pantai, dan villa nyaman berfasilitas lengkap.' },
        { key: 'lp_feat3_title', label: 'Judul Fitur 3',        type: 'text', ph: 'Pemandu Berlisensi', def: 'Pemandu Berlisensi' },
        { key: 'lp_feat3_desc',  label: 'Deskripsi Fitur 3',    type: 'textarea', ph: 'Didampingi local tour guide...', def: 'Didampingi local tour guide ramah, profesional, dan menguasai sejarah lokal.' },
        { key: 'lp_feat4_title', label: 'Judul Fitur 4',        type: 'text', ph: 'Jaminan Kenyamanan', def: 'Jaminan Kenyamanan' },
        { key: 'lp_feat4_desc',  label: 'Deskripsi Fitur 4',    type: 'textarea', ph: 'Layanan terpercaya...', def: 'Layanan terpercaya dengan fasilitas terbaik, support 24/7, dan garansi perjalanan lancar.' },
      ]
    },
    {
      id: 'footer',
      title: 'Footer & Kontak',
      icon: I.Building(18),
      desc: 'Teks yang tampil di bagian paling bawah semua halaman.',
      fields: [
        { key: 'lp_footer_tagline', label: 'Tagline Footer',           type: 'text', ph: 'Curated Luxury Oud & Heritage...', def: 'Southeast Asia\'s Premier Oud Heritage & Experiences' },
        { key: 'lp_footer_copyright', label: 'Teks Copyright Footer',  type: 'text', ph: '© 2026 OUD ASEAN — Eksplorasi Keindahan Asia Tenggara.', def: '© 2026 OUD ASEAN — Eksplorasi Keindahan Asia Tenggara. All Rights Reserved.' },
        { key: 'lp_footer_email',    label: 'Email Kontak Footer',     type: 'text', ph: 'info@oudasean.com', def: 'info@oudasean.com' },
        { key: 'lp_footer_phone',    label: 'Nomor WhatsApp Footer',   type: 'text', ph: '+62 812-3456-7890', def: '+62 812-3456-7890' },
        { key: 'lp_footer_address',  label: 'Alamat Kantor Footer',    type: 'text', ph: 'Jakarta & Bali, Indonesia', def: 'Jakarta & Bali, Indonesia' },
        { key: 'lp_footer_wa_number', label: 'Nomor WA CS (format: 628xxx)', type: 'text', ph: '6281234567890', def: '6281234567890' },
      ]
    }
  ]

  // Build the accordion-style CMS editor
  el.innerHTML = `
  <div class="cms-page">
    <div class="cms-intro-bar">
      <div class="cms-intro-icon" style="color:var(--gold); display:flex; align-items:center;"></div>
      <div>
        <h3 class="cms-intro-title">CMS Landing Page — Edit Konten Website</h3>
        <p class="cms-intro-desc">Ubah semua teks, judul, deskripsi, dan kontak yang tampil di halaman depan website. Perubahan langsung aktif setelah disimpan.</p>
      </div>
      <button class="btn btn-cms-preview" id="cmsPreviewBtn" style="display:inline-flex; align-items:center; gap:6px;">
        <span>Preview di Tab Baru</span>
      </button>
    </div>

    <div class="cms-sections-grid">
      ${sections.map(sec => `
        <div class="cms-section-card" data-sec="${sec.id}">
          <div class="cms-section-header" data-toggle="${sec.id}">
            <div class="cms-section-title-row">
              <h4 class="cms-section-title" style="display:inline-flex; align-items:center; gap:8px;">
                <span style="color:var(--gold); display:inline-flex;">${sec.icon}</span>
                <span>${sec.title}</span>
              </h4>
              <p class="cms-section-desc">${sec.desc}</p>
            </div>
            <div class="cms-section-actions">
              <span class="cms-field-count">${sec.fields.length} field</span>
              <button type="button" class="cms-save-section btn btn-save" data-sec-id="${sec.id}" style="display:inline-flex; align-items:center; gap:5px;">
                <span>Simpan Section</span>
              </button>
              <span class="cms-toggle-icon" data-icon="${sec.id}"></span>
            </div>
          </div>
          <div class="cms-section-body" id="cms-body-${sec.id}">
            <div class="cms-fields-grid ${sec.fields.length > 4 ? 'cms-grid-2' : ''}">
              ${sec.fields.map(f => `
                <div class="form-group">
                  <label class="cms-field-label">${f.label}</label>
                  ${f.type === 'textarea'
                    ? `<textarea name="${f.key}" rows="3" placeholder="${esc(f.ph)}" class="cms-input" data-def="${esc(f.def)}">${esc(S(f.key, f.def))}</textarea>`
                    : `<input type="text" name="${f.key}" placeholder="${esc(f.ph)}" value="${esc(S(f.key, f.def))}" class="cms-input" data-def="${esc(f.def)}"/>`
                  }
                  <small class="form-hint cms-key-hint">Kunci: <code>${f.key}</code></small>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="cms-save-all-bar">
      <button class="btn btn-cms-save-all" id="cmsSaveAll" style="display:inline-flex; align-items:center; gap:8px;">
        <span>Simpan Semua Perubahan</span>
      </button>
      <button class="btn btn-cms-reset" id="cmsReset">↺ Reset Semua ke Default</button>
    </div>
  </div>
  `

  // Toggle accordion
  el.querySelectorAll('[data-toggle]').forEach(header => {
    header.style.cursor = 'pointer'
    header.onclick = (e) => {
      if (e.target.closest('.cms-save-section')) return
      const secId = header.dataset.toggle
      const body = el.querySelector(`#cms-body-${secId}`)
      const icon = el.querySelector(`[data-icon="${secId}"]`)
      const isOpen = body.style.display !== 'none'
      body.style.display = isOpen ? 'none' : 'block'
      if (icon) icon.innerHTML = isOpen ? I.ChevronRight(16) : I.ChevronDown(16)
    }
  })

  // Save a single section
  const saveSection = async (secId, btn) => {
    const sec = sections.find(s => s.id === secId)
    if (!sec) return
    const originalText = btn.innerHTML
    btn.disabled = true; btn.innerHTML = `<span>Menyimpan...</span>`

    let allOk = true
    for (const f of sec.fields) {
      const input = el.querySelector(`[name="${f.key}"]`)
      if (!input) continue
      const val = input.value.trim()
      const { error } = await supabase.rpc('admin_save_site', { p_pin: pin, p_key: f.key, p_val: val })
      if (error) { allOk = false; toast(`Gagal simpan "${f.label}": ${error.message}`, true); break }
      DB.site[f.key] = val
    }
    persistSite()
    btn.disabled = false; btn.innerHTML = originalText
    if (allOk) toast(`Section "${sec.title}" berhasil disimpan!`)
  }

  el.querySelectorAll('.cms-save-section').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); saveSection(btn.dataset.secId, btn) }
  })

  // Save ALL
  el.querySelector('#cmsSaveAll').onclick = async function () {
    const btn = this
    const originalText = btn.innerHTML
    btn.disabled = true; btn.innerHTML = `<span>Menyimpan semua...</span>`

    let saved = 0, failed = 0
    for (const sec of sections) {
      for (const f of sec.fields) {
        const input = el.querySelector(`[name="${f.key}"]`)
        if (!input) continue
        const val = input.value.trim()
        const { error } = await supabase.rpc('admin_save_site', { p_pin: pin, p_key: f.key, p_val: val })
        if (error) { failed++; console.error(f.key, error) }
        else { DB.site[f.key] = val; saved++ }
      }
    }
    persistSite()
    btn.disabled = false; btn.innerHTML = originalText
    if (failed === 0) toast(`Semua ${saved} field CMS berhasil disimpan!`)
    else toast(`${saved} berhasil, ${failed} gagal. Periksa koneksi.`, true)
  }

  // Reset to defaults
  el.querySelector('#cmsReset').onclick = () => {
    if (!confirm('Reset semua field ke nilai default? Perubahan yang belum disimpan akan hilang.')) return
    sections.forEach(sec => {
      sec.fields.forEach(f => {
        const input = el.querySelector(`[name="${f.key}"]`)
        if (input) input.value = f.def
      })
    })
    toast('Semua field direset ke nilai default. Klik "Simpan Semua" untuk menerapkan.')
  }

  // Preview
  el.querySelector('#cmsPreviewBtn').onclick = () => {
    window.open('/#/', '_blank')
  }
}

/* ─── TAB SITE SETTINGS ──────────────────────────────────────────────── */
const tabSite = el => {
  el.innerHTML = `
  <div class="settings-grid">
    <form id="pf" class="settings-card">
      <h3 class="settings-title" style="display:inline-flex; align-items:center; gap:8px;">
        <span style="color:var(--gold); display:inline-flex;">🔒</span>
        <span>Keamanan Akun Admin</span>
      </h3>
      <p class="settings-desc">Ubah PIN admin untuk keamanan portal. Minimal 4 karakter.</p>
      <div class="form-group">
        <label>PIN Baru</label>
        <input name="np" type="password" minlength="4" placeholder="Minimal 4 karakter (disarankan 8+)" required/>
      </div>
      <div class="form-group">
        <label>Konfirmasi PIN Baru</label>
        <input name="np2" type="password" minlength="4" placeholder="Ulangi PIN baru" required/>
      </div>
      <button class="btn btn-warning" style="display:inline-flex; align-items:center; gap:8px;">
        <span>Ganti PIN Admin</span>
      </button>
    </form>

    <div class="settings-card">
      <h3 class="settings-title" style="display:inline-flex; align-items:center; gap:8px;">
        <span style="color:var(--gold); display:inline-flex;">ℹ</span>
        <span>Info Sistem</span>
      </h3>
      <p class="settings-desc">Detail teknis platform dan versi data.</p>
      <div class="info-list" style="margin-top:16px">
        <div class="info-item"><span class="info-label">Platform:</span><span class="info-val">OUD ASEAN v2.0</span></div>
        <div class="info-item"><span class="info-label">Cache:</span><span class="info-val">oud_asean_store_v1</span></div>
        <div class="info-item"><span class="info-label">Total Booking:</span><span class="info-val">${ORD.length} reservasi</span></div>
        <div class="info-item"><span class="info-label">Negara Aktif:</span><span class="info-val">6 (ASEAN)</span></div>
      </div>
      <button class="btn btn-secondary" id="clearCacheBtn" style="margin-top:20px;width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
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

