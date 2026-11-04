import { supabase } from '../lib/supabase.js'
import { getOuds, getCountryMeta } from '../lib/store.js'
import { esc, norm, toast } from '../lib/utils.js'
import { home } from './home.js'

const app = document.getElementById('app')

export const detail = (c, id) => {
  const o = getOuds(c)[id - 1]
  if (!o) return home()

  const meta = getCountryMeta(c)

  const galleryImages = [
    o.img,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80'
  ]

  const relatedOuds = getOuds(c).filter((_, i) => i + 1 !== +id).slice(0, 4)
  let currentImage = 0

  app.innerHTML = `
  <div class="breadcrumb-nav">
    <a class="back-link" href="#/">← Kembali ke Katalog Produk</a>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-current">${meta.flag} ${c} · ${esc(o.sub || o.name)}</span>
  </div>

  <!-- Detail Hero -->
  <div class="detail-hero">
    <!-- Gallery -->
    <div class="detail-gallery">
      <div class="gallery-main">
        <img id="mainImage" src="${galleryImages[0]}" alt="${esc(o.sub || o.name)}" onerror="this.src='${o.img}'"/>
        <button class="gallery-prev" id="prevBtn" type="button" aria-label="Foto Sebelumnya">‹</button>
        <button class="gallery-next" id="nextBtn" type="button" aria-label="Foto Berikutnya">›</button>
        <div class="gallery-zoom-badge">Klik untuk memperbesar</div>
      </div>
      <div class="gallery-thumbs">
        ${galleryImages.map((img, i) => `
          <button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" type="button">
            <img src="${img}" alt="Preview ${i + 1}" onerror="this.src='${o.img}'"/>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Info Panel -->
    <div class="detail-hero-content">
      <div class="detail-badge-top">
        <span class="badge-flag">${meta.flag}</span>
        <span class="badge-origin">${c}</span>
        <span class="badge-highlight">${esc(o.badge || 'Premium Agarwood')}</span>
      </div>

      <h1 class="detail-title">${esc(o.sub || o.name)}</h1>
      <div class="detail-subtitle">${esc(o.name)} · Asal: ${meta.label}</div>

      <div class="detail-desc-box">
        <h3>Spesifikasi &amp; Karakteristik Produk</h3>
        <p class="detail-desc">${esc(o.desc)}</p>
      </div>

      <div class="detail-features-grid">
        <div class="detail-feature-card">
          <span class="feature-icon feature-num">01</span>
          <div>
            <strong>100% Autentik</strong>
            <small>Dipilih langsung dari sumber terverifikasi</small>
          </div>
        </div>
        <div class="detail-feature-card">
          <span class="feature-icon feature-num">02</span>
          <div>
            <strong>Grade Premium</strong>
            <small>Kualitas terstandarisasi &amp; aroma otentik</small>
          </div>
        </div>
        <div class="detail-feature-card">
          <span class="feature-icon feature-num">03</span>
          <div>
            <strong>Garansi Supplier</strong>
            <small>Pengemasan aman &amp; pengiriman terpercaya</small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Form -->
  <div class="booking-section-wrapper">
    <div class="booking-header">
      <div class="booking-tag">FORMULIR PESANAN RESMI ASIAN OUD</div>
      <h2 class="booking-title">Order Produk: ${esc(o.sub || o.name)}</h2>
      <p class="booking-subtitle">Mohon lengkapi formulir di bawah ini dengan data diri dan alamat lengkap untuk proses verifikasi dan konfirmasi pengiriman pesanan Anda.</p>
    </div>

    <form id="f" class="booking-form-card">
      <div class="form-grid-2">
        <div class="form-group">
          <label>Nama Lengkap Pemesan <span class="required">*</span></label>
          <input name="nama" type="text" placeholder="Contoh: Rian Pratama" required minlength="2" maxlength="100"/>
        </div>
        <div class="form-group">
          <label>Email Aktif (Konfirmasi Order) <span class="required">*</span></label>
          <input name="email" type="email" placeholder="contoh@email.com" required maxlength="150"/>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Nomor WhatsApp / Telepon <span class="required">*</span></label>
          <input name="phone" type="tel" placeholder="Contoh: 081234567890" required pattern="[0-9]{8,15}" title="Nomor telepon 8–15 digit angka"/>
          <small class="form-hint">Digunakan untuk koordinasi order &amp; cek status pengiriman.</small>
        </div>
        <div class="form-group">
          <label>Titel / Panggilan <span class="required">*</span></label>
          <select name="gender" required>
            <option value="">-- Pilih Titel --</option>
            <option value="Laki-laki">Bapak / Tuan (Mr)</option>
            <option value="Perempuan">Ibu / Nyonya (Ms/Mrs)</option>
          </select>
        </div>
      </div>

      <!-- Alamat Lengkap -->
      <div class="form-group full-width">
        <label>Alamat Lengkap Pengiriman <span class="required">*</span></label>
        <textarea
          name="alamat"
          rows="3"
          placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, provinsi, dan kode pos..."
          required
          minlength="10"
          maxlength="500"
        ></textarea>
        <small class="form-hint">Pastikan alamat ditulis selengkap mungkin agar tim supplier dapat memproses pengiriman dengan tepat.</small>
      </div>

      <div class="order-summary-box">
        <div class="summary-line">
          <span>Produk yang Dipilih:</span>
          <strong>${esc(o.sub || o.name)} (${c})</strong>
        </div>
      </div>

      <button class="btn btn-booking" type="submit">
        <span>Konfirmasi &amp; Kirim Pesanan →</span>
      </button>
      <p class="order-security-note">Data Anda aman dan terenkripsi. Tim ASIAN OUD akan segera menghubungi via WhatsApp untuk konfirmasi detail pesanan Anda.</p>
    </form>
  </div>

  <!-- Related Products -->
  ${relatedOuds.length > 0 ? `
  <div class="related-section">
    <div class="related-header">
      <h3>Pilihan Koleksi Lainnya dari ${c}</h3>
      <p>Koleksi produk Agarwood alternatif dengan mutu dan karakter aroma unik</p>
    </div>
    <div class="related-grid">
      ${relatedOuds.map(ro => `
        <a class="related-card" href="#/oud/${encodeURIComponent(c)}/${ro.id}">
          <div class="related-img-wrap">
            <img src="${ro.img}" alt="${esc(ro.sub || ro.name)}" loading="lazy"
              onerror="this.onerror=null;this.src='${o.img}'"/>
            <div class="related-img-overlay"></div>
            <span class="related-badge">${esc(ro.badge || 'Premium Grade')}</span>
          </div>
          <div class="related-info">
            <h4>${esc(ro.sub || ro.name)}</h4>
            <p>Produk #${ro.id} · Asal: ${meta.label}</p>
            <span class="related-cta">Lihat Detail →</span>
          </div>
        </a>
      `).join('')}
    </div>
  </div>
  ` : ''}
  `

  // --- Gallery interactions ---
  const mainImg = document.getElementById('mainImage')
  const thumbs  = document.querySelectorAll('.gallery-thumb')
  const prevBtn = document.getElementById('prevBtn')
  const nextBtn = document.getElementById('nextBtn')

  const updateGallery = idx => {
    currentImage = (idx + galleryImages.length) % galleryImages.length
    if (mainImg) {
      mainImg.style.opacity = '0.4'
      setTimeout(() => {
        mainImg.src = galleryImages[currentImage]
        mainImg.style.opacity = '1'
      }, 150)
    }
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentImage))
  }

  thumbs.forEach(t => t.onclick = () => updateGallery(+t.dataset.index))
  if (prevBtn) prevBtn.onclick = () => updateGallery(currentImage - 1)
  if (nextBtn) nextBtn.onclick = () => updateGallery(currentImage + 1)

  if (mainImg) {
    mainImg.onclick = () => {
      const modal = document.createElement('div')
      modal.className = 'lightbox-modal'
      modal.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <img src="${galleryImages[currentImage]}" alt="Full Preview"/>
          <button class="lightbox-close">✕</button>
        </div>
      `
      document.body.appendChild(modal)
      setTimeout(() => modal.classList.add('open'), 10)
      const closeModal = () => {
        modal.classList.remove('open')
        setTimeout(() => modal.remove(), 300)
      }
      modal.querySelector('.lightbox-close').onclick = closeModal
      modal.querySelector('.lightbox-overlay').onclick = closeModal
    }
  }

  // --- Order Form Submit ---
  const form = document.getElementById('f')
  if (form) {
    form.onsubmit = async e => {
      e.preventDefault()
      const btn = form.querySelector('button[type="submit"]')
      const origHTML = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = `<span>Memproses Pesanan...</span>`

      const rawPhone = form.phone.value
      const cleanPhone = norm(rawPhone)

      const payload = {
        oud_country: c,
        oud_id: +id,
        oud_name: (o.sub ? `${o.sub} - ${o.name}` : o.name).substring(0, 150),
        nama: form.nama.value.trim(),
        email: form.email.value.trim(),
        phone: cleanPhone,
        gender: form.gender.value,
        alamat: form.alamat.value.trim()
      }

      let { error, data } = await supabase.from('orders').insert([payload]).select('id')

      // Fallback jika kolom alamat belum ada
      if (error && (error.message?.includes('alamat') || error.code === 'PGRST204')) {
        const fallback = { ...payload }; delete fallback.alamat
        const r2 = await supabase.from('orders').insert([fallback]).select('id')
        error = r2.error; data = r2.data
      }

      if (error) {
        btn.disabled = false; btn.innerHTML = origHTML
        return toast('Gagal mengirim pesanan: ' + (error.message || 'Periksa koneksi Anda'), true)
      }

      const orderId = data?.[0]?.id || 'ORD-' + Math.floor(1000 + Math.random() * 9000)

      document.querySelector('.booking-section-wrapper').innerHTML = `
        <div class="booking-success-card">
          <div class="success-icon-badge">✓</div>
          <h2 class="success-title">Pesanan Berhasil Diterima!</h2>
          <p class="success-subtitle">Terima kasih <strong>${esc(payload.nama)}</strong>. Permintaan order untuk produk <strong>${esc(o.sub || o.name)}</strong> telah tersimpan di sistem ASIAN OUD.</p>

          <div class="success-info-box">
            <div class="info-row">
              <span>Nomor Order:</span>
              <strong class="gold-text">#${orderId}</strong>
            </div>
            <div class="info-row">
              <span>Asal Produk:</span>
              <span>${meta.flag} ${c}</span>
            </div>
            <div class="info-row">
              <span>WhatsApp:</span>
              <span>${esc(cleanPhone)}</span>
            </div>
            <div class="info-row">
              <span>Alamat Pengiriman:</span>
              <span>${esc(payload.alamat)}</span>
            </div>
          </div>

          <div class="success-actions">
            <a href="#/cek?phone=${encodeURIComponent(cleanPhone)}" class="btn-primary-action">
              Lacak Status Pesanan
            </a>
            <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin ASIAN OUD, saya ingin konfirmasi pesanan produk ' + (o.sub || o.name) + ' — No. Order #' + orderId)}" target="_blank" class="btn-wa-confirm">
              Konfirmasi via WhatsApp CS
            </a>
            <a href="#/" class="btn-secondary-action">
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      `
      document.querySelector('.booking-section-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' })
      toast('Pesanan berhasil dikirim! Silakan cek status di menu Cek Order.')
    }
  }
}
