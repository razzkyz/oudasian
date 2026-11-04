import { supabase } from '../lib/supabase.js'
import { esc, norm } from '../lib/utils.js'

const app = document.getElementById('app')

const statusConfig = {
  'Baru':      { color: '#3498db', bg: 'rgba(52, 152, 219, 0.15)', step: 1, label: 'Booking Diterima',    desc: 'Reservasi jadwal tour Anda telah masuk ke sistem dan menunggu verifikasi tim admin.' },
  'Diproses':  { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.15)', step: 2, label: 'Verifikasi & Reservasi', desc: 'Jadwal perjalanan, kamar hotel pilihan, dan armada transportasi sedang dikonfirmasi.' },
  'Dikirim':   { color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.15)', step: 3, label: 'E-Tiket Terbit',       desc: 'E-Tiket, voucher hotel, dan kontak tour leader telah diterbitkan dan dikirimkan via WA/Email.' },
  'Selesai':   { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)', step: 4, label: 'Tour Selesai',          desc: 'Perjalanan wisata telah sukses dilaksanakan. Semoga liburan Anda sangat menyenangkan!' }
}

const renderTimeline = (status) => {
  const currentStep = statusConfig[status]?.step || 1
  const steps = [
    { num: 1, name: 'Diterima' },
    { num: 2, name: 'Verifikasi' },
    { num: 3, name: 'E-Tiket Terbit' },
    { num: 4, name: 'Selesai' }
  ]

  return `
    <div class="order-timeline">
      ${steps.map((s, idx) => {
        const isDone = s.num <= currentStep
        const isCurrent = s.num === currentStep
        return `
          <div class="timeline-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-active' : ''}">
            <div class="step-circle">${isDone ? '✓' : s.num}</div>
            <span class="step-label">${s.name}</span>
          </div>
          ${idx < steps.length - 1 ? `<div class="timeline-line ${s.num < currentStep ? 'line-done' : ''}"></div>` : ''}
        `
      }).join('')}
    </div>
  `
}

const renderOrderResults = (orders, phoneSearched) => {
  if (!orders || orders.length === 0) {
    return `
      <div class="empty-state-card">
        <div class="empty-icon-circle">?</div>
        <h3>Tidak Ditemukan Riwayat Booking</h3>
        <p>Tidak ada riwayat reservasi yang terdaftar dengan nomor telepon <strong>${esc(phoneSearched)}</strong>.</p>
        <div class="empty-actions">
          <a href="#/" class="btn-empty-cta">Jelajahi Koleksi</a>
          <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin OUD ASEAN, saya ingin menanyakan status pesanan untuk nomor HP ' + phoneSearched)}" target="_blank" class="btn-empty-wa">Hubungi Admin CS</a>
        </div>
      </div>
    `
  }

  return `
    <div class="results-wrapper">
      <div class="results-header">
        <div class="results-count-badge">Ditemukan <strong>${orders.length}</strong> Riwayat Booking</div>
        <p class="results-sub">Berikut adalah daftar lengkap paket wisata yang Anda booking beserta status jadwal perjalanannya:</p>
      </div>

      <!-- TABEL RINGKASAN BOOKING -->
      <div class="table-responsive-box">
        <table class="order-table">
          <thead>
            <tr>
              <th>No. Booking</th>
              <th>Waktu Reservasi</th>
              <th>Paket Wisata yang Dipilih</th>
              <th>Nama Traveler</th>
              <th>Status Tour</th>
              <th>Rincian</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((r) => {
              const cfg = statusConfig[r.status] || { color: '#d4af37', bg: 'rgba(212,175,55,0.15)', label: r.status }
              const dateStr = new Date(r.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
              return `
                <tr class="order-table-row" data-target="detail-${r.id}">
                  <td class="cell-id">
                    <span class="order-id-badge">#${r.id}</span>
                  </td>
                  <td class="cell-date">${dateStr} WIB</td>
                  <td class="cell-product">
                    <div class="table-prod-name">${esc(r.oud_name || 'Paket Wisata ASEAN')}</div>
                    ${r.oud_country ? `<span class="table-prod-country">${esc(r.oud_country)}</span>` : ''}
                  </td>
                  <td class="cell-customer">
                    <div class="customer-name">${esc(r.nama)}</div>
                    <div class="customer-phone">${esc(r.phone)}</div>
                  </td>
                  <td class="cell-status">
                    <span class="status-badge-table" style="color:${cfg.color}; background:${cfg.bg}; border-color:${cfg.color};">
                      ● ${esc(cfg.label || r.status)}
                    </span>
                  </td>
                  <td class="cell-action">
                    <a href="#detail-${r.id}" class="btn-view-detail" onclick="event.preventDefault();document.getElementById('detail-${r.id}').scrollIntoView({behavior:'smooth'});">
                      Lihat Detail ↓
                    </a>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- DETAIL CARD LENGKAP TIAP BOOKING -->
      <div class="details-cards-heading">
        <h3>Rincian Lengkap Paket &amp; Pemesanan</h3>
        <p>Detail reservasi dan informasi perjalanan Anda</p>
      </div>

      <div class="order-details-stack">
        ${orders.map((r) => {
          const cfg = statusConfig[r.status] || { color: '#d4af37', bg: 'rgba(212,175,55,0.15)', label: r.status, desc: '' }
          const formattedDate = new Date(r.created_at).toLocaleString('id-ID', {
            dateStyle: 'full', timeStyle: 'medium'
          })
          const waMessage = encodeURIComponent(
            `Halo Admin OUD ASEAN, saya ingin konfirmasi status pesanan #${r.id} (${r.oud_name}) atas nama ${r.nama}.`
          )

          return `
            <div class="order-detail-card" id="detail-${r.id}">
              <div class="card-top-bar">
                <div class="card-id-group">
                  <div>
                    <h4 class="card-title">Pesanan #${r.id}</h4>
                    <span class="card-time">Dipesan pada ${formattedDate}</span>
                  </div>
                </div>
                <div class="card-status-pill" style="color:${cfg.color}; background:${cfg.bg}; border: 1px solid ${cfg.color}">
                  ${esc(cfg.label || r.status)}
                </div>
              </div>

              <!-- Visual Status Stepper -->
              <div class="card-stepper-box">
                ${renderTimeline(r.status)}
                <div class="status-desc-text">
                  <strong>Status Perjalanan:</strong> ${cfg.desc}
                </div>
              </div>

              <div class="detail-split-grid">
                <!-- Kolom Paket Wisata -->
                <div class="detail-section-block">
                  <h5 class="block-title">Paket Wisata yang Dipesan</h5>
                  <div class="item-ordered-card">
                    <div class="item-bullet">✓</div>
                    <div class="item-text">
                      <div class="item-main-name">${esc(r.oud_name || 'Paket Wisata ASEAN')}</div>
                      <div class="item-sub-meta">Destinasi: <strong>${esc(r.oud_country || 'ASEAN')}</strong></div>
                      <div class="item-note">Termasuk akomodasi hotel, transportasi ber-AC/speedboat, tiket masuk, dan pemandu lokal.</div>
                    </div>
                  </div>
                </div>

                <!-- Kolom Detail Pemesan -->
                <div class="detail-section-block">
                  <h5 class="block-title">Data Traveler</h5>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">Nama Traveler:</span>
                      <span class="info-val">${esc(r.nama)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Nomor WhatsApp:</span>
                      <span class="info-val">${esc(r.phone)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Alamat Email:</span>
                      <span class="info-val">${esc(r.email)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Kategori / Titel:</span>
                      <span class="info-val">${esc(r.gender || '-')}</span>
                    </div>
                    ${r.alamat ? `
                    <div class="info-item address-item">
                      <span class="info-label">Alamat Lengkap:</span>
                      <span class="info-val address-text">${esc(r.alamat)}</span>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="card-bottom-actions">
                <a href="https://wa.me/6281234567890?text=${waMessage}" target="_blank" class="btn-card-wa">
                  <span>Hubungi Tour Coordinator via WhatsApp</span>
                </a>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

export const cek = () => {
  let prefillPhone = ''
  try {
    const hash = window.location.hash || ''
    const qIdx = hash.indexOf('?')
    if (qIdx !== -1) {
      const sp = new URLSearchParams(hash.substring(qIdx))
      prefillPhone = sp.get('phone') || ''
    }
  } catch (e) {}

  app.innerHTML = `
    <!-- Header Banner -->
    <div class="page-banner">
      <div class="banner-badge">PELACAKAN RESERVASI RESMI</div>
      <h1 class="banner-title">CEK STATUS BOOKING TOUR</h1>
      <p class="banner-subtitle">Pantau status reservasi, rincian paket wisata, jadwal keberangkatan cukup dengan nomor telepon Anda.</p>
    </div>
    
    <div class="cek-container">
      <div class="search-box-card">
        <form id="f" class="cek-form">
          <label class="search-label" for="phoneInput">Masukkan Nomor Telepon / WhatsApp Saat Booking:</label>
          <div class="form-group-inline">
            <div class="input-with-icon">
              <input 
                id="phoneInput"
                name="p" 
                type="tel" 
                placeholder="Contoh: 081234567890" 
                value="${esc(prefillPhone)}"
                required 
                autocomplete="tel"
                pattern="[0-9]{8,15}"
                title="Nomor telepon harus berupa 8-15 digit angka"
              />
            </div>
            <button class="btn btn-cek" type="submit">
              <span>Cek Booking</span>
            </button>
          </div>
          <p class="form-hint">Cukup ketik nomor handphone yang Anda gunakan saat mengisi formulir booking.</p>
        </form>
      </div>
      
      <div id="out" class="orders-container">
        <!-- Default State / Placeholder before search -->
        <div class="cek-initial-guide">
          <div class="guide-item">
            <span class="guide-icon-badge">1</span>
            <div>
              <strong>Ketik Nomor HP</strong>
              <p>Gunakan nomor kontak yang terdaftar saat melakukan reservasi tour.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">2</span>
            <div>
              <strong>Lihat Tabel Booking</strong>
              <p>Tabel ringkasan otomatis menampilkan semua paket wisata yang Anda pesan.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">3</span>
            <div>
              <strong>Pantau Status &amp; E-Tiket</strong>
              <p>Status diperbarui real-time oleh tim reservasi &amp; tour leader kami.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cek-help">
      <div class="help-inner">
        <div class="help-header">
          <h3>Butuh Bantuan Mengenai Pesanan Anda?</h3>
          <p>Tim customer support OUD ASEAN siap melayani kebutuhan informasi Anda.</p>
        </div>
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon help-icon-num">i</div>
            <div>
              <strong>Lupa Nomor yang Digunakan?</strong>
              <p>Silakan periksa pesan konfirmasi di email Anda atau hubungi admin dengan menyebutkan nama lengkap pemesan.</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon help-icon-num">WA</div>
            <div>
              <strong>Layanan Pelanggan WhatsApp 24/7</strong>
              <p>Hubungi Customer Service kami di <a href="https://wa.me/6281234567890" target="_blank" style="color:var(--gold); font-weight:700;">+62 812-3456-7890</a> (Setiap Hari 24 Jam)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  const doSearch = async (phoneVal) => {
    const phone = norm(phoneVal)
    const outEl = document.getElementById('out')
    if (!outEl) return

    outEl.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Sedang memeriksa riwayat booking tour untuk nomor ${esc(phone)}...</p>
      </div>
    `
    
    try {
      const { data, error } = await supabase.rpc('cek_pesanan', { p_phone: phone })
      
      if (error) {
        console.error('Error cek pesanan:', error)
        outEl.innerHTML = `
          <div class="error-state">
            <div class="error-icon">!</div>
            <h4>Gagal Memeriksa Booking</h4>
            <p>${esc(error.message || 'Terjadi kesalahan saat mengambil data. Silakan coba beberapa saat lagi.')}</p>
          </div>
        `
      } else {
        outEl.innerHTML = renderOrderResults(data, phoneVal)
      }
    } catch (err) {
      outEl.innerHTML = `
        <div class="error-state">
          <div class="error-icon">!</div>
          <p>Terjadi kendala jaringan. Pastikan koneksi internet Anda aktif.</p>
        </div>
      `
    }
  }
  
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault()
    const btn = e.target.querySelector('.btn-cek')
    const originalText = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = `<span>Mencari Data...</span>`
    
    const rawPhone = e.target.p.value
    await doSearch(rawPhone)
    
    btn.disabled = false
    btn.innerHTML = originalText
  }

  if (prefillPhone) {
    doSearch(prefillPhone)
  }
}
