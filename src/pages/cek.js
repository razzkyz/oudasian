import { supabase } from '../lib/supabase.js'
import { esc, norm } from '../lib/utils.js'

const app = document.getElementById('app')

const statusConfig = {
  'Baru':      { color: '#3498db', bg: 'rgba(52, 152, 219, 0.15)', step: 1, label: 'Order Diterima',       desc: 'Pesanan Agarwood Anda telah masuk ke sistem dan menunggu verifikasi admin.' },
  'Diproses':  { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.15)', step: 2, label: 'Quality Check & Packing', desc: 'Produk sedang melewati seleksi kualitas, penimbangan, dan pengemasan kedap udara aman.' },
  'Dikirim':   { color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.15)', step: 3, label: 'Sedang Dikirim',        desc: 'Paket telah diserahkan ke kurir/ekspedisi. Resi dan update pengiriman dikirim via WhatsApp.' },
  'Selesai':   { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)', step: 4, label: 'Pesanan Selesai',       desc: 'Produk telah diterima oleh pemesan. Terima kasih atas kepercayaan Anda pada ASIAN OUD.' }
}

const renderTimeline = (status) => {
  const currentStep = statusConfig[status]?.step || 1
  const steps = [
    { num: 1, name: 'Diterima' },
    { num: 2, name: 'Diproses' },
    { num: 3, name: 'Dikirim' },
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
        <h3>Tidak Ditemukan Riwayat Order</h3>
        <p>Tidak ada riwayat pesanan yang terdaftar dengan nomor telepon <strong>${esc(phoneSearched)}</strong>.</p>
        <p class="empty-subnote">Pastikan nomor yang Anda ketik sesuai saat pengisian formulir pemesanan, atau hubungi tim customer service kami untuk bantuan pencarian manual.</p>
        <div class="empty-actions">
          <a href="#/" class="btn-empty-cta">Jelajahi Katalog</a>
          <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin ASIAN OUD, saya ingin menanyakan status pesanan untuk nomor HP ' + phoneSearched)}" target="_blank" class="btn-empty-wa">Hubungi Admin CS</a>
        </div>
      </div>
    `
  }

  const trackUrl = `${window.location.origin}${window.location.pathname}#/cek?phone=${encodeURIComponent(phoneSearched)}`

  return `
    <div class="results-wrapper">
      <div class="results-header">
        <div class="results-header-left">
          <div class="results-count-badge">Ditemukan <strong>${orders.length}</strong> Riwayat Order</div>
          <p class="results-sub">Nomor Telepon: <strong style="color:var(--gold);">${esc(phoneSearched)}</strong></p>
        </div>
        <div class="results-header-right">
          <button id="btnCopyTrackLink" class="btn-copy-link" type="button" data-url="${esc(trackUrl)}">
            Salin Link Pelacakan
          </button>
        </div>
      </div>

      <!-- TABEL RINGKASAN ORDER -->
      <div class="table-responsive-box">
        <table class="order-table">
          <thead>
            <tr>
              <th>No. Order</th>
              <th>Waktu Order</th>
              <th>Produk Agarwood</th>
              <th>Nama Pemesan</th>
              <th>Status</th>
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
                    <div class="table-prod-name">${esc(r.oud_name || 'Produk Agarwood')}</div>
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

      <!-- DETAIL CARD LENGKAP TIAP ORDER -->
      <div class="details-cards-heading">
        <h3>Rincian Lengkap Produk &amp; Pengiriman</h3>
        <p>Detail pesanan dan informasi alamat pengiriman Anda</p>
      </div>

      <div class="order-details-stack">
        ${orders.map((r) => {
          const cfg = statusConfig[r.status] || { color: '#d4af37', bg: 'rgba(212,175,55,0.15)', label: r.status, desc: '' }
          const formattedDate = new Date(r.created_at).toLocaleString('id-ID', {
            dateStyle: 'full', timeStyle: 'medium'
          })
          const waMessage = encodeURIComponent(
            `Halo Admin ASIAN OUD, saya ingin konfirmasi status pesanan #${r.id} (${r.oud_name}) atas nama ${r.nama}.`
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
                  <strong>Status Pesanan:</strong> ${cfg.desc}
                </div>
              </div>

              <div class="detail-split-grid">
                <!-- Kolom Produk -->
                <div class="detail-section-block">
                  <h5 class="block-title">Produk yang Dipesan</h5>
                  <div class="item-ordered-card">
                    <div class="item-bullet">✓</div>
                    <div class="item-text">
                      <div class="item-main-name">${esc(r.oud_name || 'Produk Agarwood ASIAN OUD')}</div>
                      <div class="item-sub-meta">Asal Produk: <strong>${esc(r.oud_country || 'Asia')}</strong></div>
                      <div class="item-note">Koleksi 100% autentik dengan jaminan kualitas grade premium dari ASIAN OUD.</div>
                    </div>
                  </div>
                </div>

                <!-- Kolom Detail Pemesan -->
                <div class="detail-section-block">
                  <h5 class="block-title">Data Pemesan &amp; Alamat Pengiriman</h5>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">Nama Pemesan:</span>
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
                      <span class="info-label">Titel / Panggilan:</span>
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
                  <span>Hubungi Admin ASIAN OUD via WhatsApp</span>
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
    if (!prefillPhone) {
      const s = new URLSearchParams(window.location.search || '')
      prefillPhone = s.get('phone') || ''
    }
  } catch (e) {}

  app.innerHTML = `
    <!-- Hero Header -->
    <div class="cek-page-hero">
      <div class="luxury-pill-badge">PELACAKAN PESANAN RESMI</div>
      <h1 class="cek-hero-title">CEK STATUS ORDER</h1>
      <p class="cek-hero-subtitle">Pantau status pesanan produk Agarwood Anda, rincian produk, dan proses pengiriman cukup dengan nomor telepon yang terdaftar.</p>
    </div>
    
    <!-- Search Form Card -->
    <div class="cek-search-wrapper">
      <form id="f" class="cek-search-card">
        <div class="search-card-top">
          <label class="search-card-label" for="phoneInput">Nomor Handphone / WhatsApp Saat Order</label>
          <span class="search-badge-pill">Verifikasi Online</span>
        </div>

        <div class="search-bar-integrated">
          <span class="search-prefix">+62</span>
          <input 
            id="phoneInput"
            name="p" 
            type="tel" 
            class="search-main-input"
            placeholder="Ketik nomor HP (contoh: 081234567890)" 
            value="${esc(prefillPhone)}"
            required 
            autocomplete="tel"
            pattern="[0-9]{8,15}"
            title="Nomor telepon harus berupa 8-15 digit angka"
          />
          <button class="btn-search-trigger" type="submit">
            <span>Lacak Pesanan →</span>
          </button>
        </div>

        <div class="search-card-footer">
          <span class="search-hint-text">
            Ketik nomor handphone yang Anda cantumkan saat mengisi formulir pemesanan.
          </span>
          <a href="https://wa.me/6281234567890" target="_blank" class="search-cs-link">
            Bantuan CS WhatsApp ↗
          </a>
        </div>
      </form>
    </div>

    <!-- Container Hasil & Panduan -->
    <div class="cek-container">
      <div id="out" class="orders-container">
        <!-- Default State / Placeholder before search -->
        <div class="cek-initial-guide">
          <div class="guide-item">
            <span class="guide-icon-badge">1</span>
            <div>
              <strong>Ketik Nomor HP</strong>
              <p>Gunakan nomor kontak yang Anda cantumkan saat memesan produk.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">2</span>
            <div>
              <strong>Lihat Ringkasan Order</strong>
              <p>Sistem menampilkan daftar produk Agarwood dan status pengerjaan.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">3</span>
            <div>
              <strong>Pantau Pengiriman</strong>
              <p>Status diperbarui real-time oleh tim admin &amp; kurir ASIAN OUD.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Help Box -->
    <div class="cek-help">
      <div class="help-inner">
        <div class="help-header">
          <h3>Butuh Bantuan Mengenai Pesanan Anda?</h3>
          <p>Tim customer support ASIAN OUD siap melayani kebutuhan informasi Anda.</p>
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
              <p>Hubungi Customer Service ASIAN OUD di <a href="https://wa.me/6281234567890" target="_blank" style="color:var(--gold); font-weight:700;">+62 812-3456-7890</a> (Setiap Hari 24 Jam)</p>
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
        <p>Sedang memeriksa riwayat order untuk nomor ${esc(phone)}...</p>
      </div>
    `
    
    try {
      const { data, error } = await supabase.rpc('cek_pesanan', { p_phone: phone })
      
      if (error) {
        console.error('Error cek pesanan:', error)
        outEl.innerHTML = `
          <div class="error-state">
            <div class="error-icon">!</div>
            <h4>Gagal Memeriksa Order</h4>
            <p>${esc(error.message || 'Terjadi kesalahan saat mengambil data. Silakan coba beberapa saat lagi.')}</p>
          </div>
        `
      } else {
        outEl.innerHTML = renderOrderResults(data, phoneVal)
        const copyBtn = document.getElementById('btnCopyTrackLink')
        if (copyBtn) {
          copyBtn.onclick = () => {
            const url = copyBtn.dataset.url
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(() => {
                copyBtn.textContent = 'Link Berhasil Disalin!'
                setTimeout(() => { copyBtn.textContent = 'Salin Link Pelacakan' }, 2000)
              }).catch(() => {
                prompt('Salin tautan ini:', url)
              })
            } else {
              prompt('Salin tautan ini:', url)
            }
          }
        }
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
  
  const formEl = document.getElementById('f')
  if (formEl) {
    formEl.onsubmit = async (e) => {
      e.preventDefault()
      const btn = e.target.querySelector('.btn-search-trigger')
      const originalText = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = `<span>Mencari Data...</span>`
      
      const rawPhone = e.target.p.value
      await doSearch(rawPhone)
      
      btn.disabled = false
      btn.innerHTML = originalText
    }
  }

  if (prefillPhone) {
    doSearch(prefillPhone)
  }
}
