import { supabase } from '../lib/supabase.js'
import { getOuds, getCountryMeta } from '../lib/store.js'
import { esc, norm, toast } from '../lib/utils.js'
import { home } from './home.js'

const app = document.getElementById('app')

export const detail = (c, id) => {
  const ouds = getOuds(c)
  const o = ouds.find(x => String(x.slot || x.id) === String(id)) || ouds[+id - 1] || ouds[0]
  if (!o) return home()

  const meta = getCountryMeta(c)

  // 3 Images + 2 Videos support
  const mediaItems = []
  if (o.img)    mediaItems.push({ type: 'image', src: o.img, label: 'Foto Utama' })
  if (o.img2)   mediaItems.push({ type: 'image', src: o.img2, label: 'Foto 2' })
  if (o.img3)   mediaItems.push({ type: 'image', src: o.img3, label: 'Foto 3' })
  if (o.video1) mediaItems.push({ type: 'video', src: o.video1, label: 'Video 1' })
  if (o.video2) mediaItems.push({ type: 'video', src: o.video2, label: 'Video 2' })

  if (mediaItems.length === 0) {
    mediaItems.push({ type: 'image', src: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80', label: 'Foto' })
  }

  let currentMediaIdx = 0

  app.innerHTML = `
  <div class="breadcrumb-nav">
    <a class="back-link" href="#/">← Back to Product Catalog</a>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-current">${meta.flag} ${c} · ${esc(o.sub || o.name)}</span>
  </div>

  <!-- Detail Hero -->
  <div class="detail-hero">
    <!-- Gallery -->
    <div class="detail-gallery">
      <div class="gallery-main" id="galleryMain">
        <div id="mediaViewerWrap" class="media-viewer-wrap" style="width:100%;height:100%;position:relative;"></div>
        ${mediaItems.length > 1 ? `
          <button class="gallery-prev" id="prevBtn" type="button" aria-label="Previous Media">‹</button>
          <button class="gallery-next" id="nextBtn" type="button" aria-label="Next Media">›</button>
        ` : ''}
        <div class="gallery-zoom-badge" id="zoomBadge" style="display:none;">Click to enlarge</div>
      </div>
      <div class="gallery-thumbs" style="${mediaItems.length <= 1 ? 'display:none;' : ''}">
        ${mediaItems.map((item, i) => `
          <button class="gallery-thumb ${i === 0 ? 'active' : ''} ${item.type === 'video' ? 'thumb-is-video' : ''}" data-index="${i}" type="button">
            <img src="${item.type === 'video' ? (o.img || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80') : item.src}" alt="${item.label}"/>
            ${item.type === 'video' ? `<span class="video-play-tag">▶ Video</span>` : ''}
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
      <div class="detail-subtitle">${esc(o.name)} · Origin: ${meta.label}</div>

      <div class="detail-desc-box">
        <h3>Specifications &amp; Characteristics</h3>
        <p class="detail-desc">${esc(o.desc)}</p>
      </div>

      <div class="detail-features-grid">
        <div class="detail-feature-card">
          <div class="feature-card-header">
            <span class="feature-num-badge">01</span>
            <strong class="feature-title">100% Authentic</strong>
          </div>
          <p class="feature-desc">Directly selected from verified wild harvests</p>
        </div>
        <div class="detail-feature-card">
          <div class="feature-card-header">
            <span class="feature-num-badge">02</span>
            <strong class="feature-title">Premium Grade</strong>
          </div>
          <p class="feature-desc">Standardized quality &amp; signature natural resin</p>
        </div>
        <div class="detail-feature-card">
          <div class="feature-card-header">
            <span class="feature-num-badge">03</span>
            <strong class="feature-title">Supplier Guarantee</strong>
          </div>
          <p class="feature-desc">Secure airtight packaging &amp; insured shipping</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Form -->
  <div class="booking-section-wrapper">
    <div class="booking-header">
      <div class="booking-tag">OFFICIAL ASIAN OUD ORDER FORM</div>
      <h2 class="booking-title">Order Product: ${esc(o.sub || o.name)}</h2>
      <p class="booking-subtitle">Please complete the form below with your recipient details and address for fast verification and order confirmation.</p>
    </div>

    <form id="f" class="booking-form-card">
      <div class="form-grid-2">
        <div class="form-group">
          <label>Full Name <span class="required">*</span></label>
          <input name="nama" type="text" placeholder="e.g. Mohammed Al-Otaibi / John Doe" required minlength="2" maxlength="100"/>
        </div>
        <div class="form-group">
          <label>Email Address <span class="required">*</span></label>
          <input name="email" type="email" placeholder="example@email.com" required maxlength="150"/>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Gender <span class="required">*</span></label>
          <select name="gender" required>
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div class="form-group">
          <label>WhatsApp / Mobile Number <span class="required">*</span></label>
          <div class="phone-split-row">
            <div class="dial-code-group" id="dialCodeGroup">
              <!-- Dropdown Selector -->
              <div class="dial-select-wrap" id="dialSelectWrap">
                <select id="dialCodeSelect" class="dial-code-select" aria-label="Country Dial Code">
                  <optgroup label="Popular &amp; Asia">
                    <option value="62" selected>🇮🇩 +62</option>
                    <option value="60">🇲🇾 +60</option>
                    <option value="65">🇸🇬 +65</option>
                    <option value="66">🇹🇭 +66</option>
                    <option value="84">🇻🇳 +84</option>
                    <option value="855">🇰🇭 +855</option>
                    <option value="856">🇱🇦 +856</option>
                    <option value="81">🇯🇵 +81</option>
                    <option value="82">🇰🇷 +82</option>
                    <option value="852">🇭🇰 +852</option>
                    <option value="886">🇹🇼 +886</option>
                    <option value="61">🇦🇺 +61</option>
                  </optgroup>
                  <optgroup label="Middle East &amp; GCC">
                    <option value="966">🇸🇦 +966</option>
                    <option value="971">🇦🇪 +971</option>
                    <option value="974">🇶🇦 +974</option>
                    <option value="965">🇰🇼 +965</option>
                    <option value="968">🇴🇲 +968</option>
                    <option value="973">🇧🇭 +973</option>
                  </optgroup>
                  <optgroup label="Americas &amp; Europe">
                    <option value="1">🇺🇸/🇨🇦 +1</option>
                    <option value="44">🇬🇧 +44</option>
                    <option value="49">🇩🇪 +49</option>
                    <option value="33">🇫🇷 +33</option>
                    <option value="41">🇨🇭 +41</option>
                    <option value="31">🇳🇱 +31</option>
                    <option value="90">🇹🇷 +90</option>
                  </optgroup>
                  <option value="custom">✏️ Type (+...)</option>
                </select>
              </div>

              <!-- Manual Input Box -->
              <div class="dial-input-wrap" id="dialInputWrap" style="display:none;">
                <span class="dial-plus-prefix">+</span>
                <input 
                  type="text" 
                  id="dialCodeInput" 
                  class="dial-manual-input" 
                  placeholder="62" 
                  maxlength="5" 
                  inputmode="numeric" 
                  pattern="[0-9]{1,5}"
                  title="Country code digits only"
                />
              </div>

              <!-- Instant Toggle Button between Dropdown & Manual Input -->
              <button 
                type="button" 
                id="btnSwitchDialMode" 
                class="btn-dial-toggle" 
                title="Switch between country list and typing manual code"
                aria-label="Toggle country code mode"
              >
                <span id="dialToggleIcon">✏️</span>
              </button>
            </div>

            <!-- Subscriber Phone Number -->
            <div class="phone-subscriber-group">
              <input 
                id="phoneSubscriber" 
                name="phone_subscriber" 
                type="tel" 
                class="phone-subscriber-input"
                placeholder="e.g. 085210017968" 
                required 
                minlength="6" 
                maxlength="16" 
                autocomplete="tel-national"
                title="Enter your phone or WhatsApp number"
              />
            </div>
          </div>
          <small class="form-hint">Country code &amp; local number are saved together for order tracking and WhatsApp updates.</small>
        </div>
      </div>

      <!-- Destination Country -->
      <div class="form-group full-width">
        <label>Destination Country <span class="required">*</span></label>
        <select name="negara" id="destCountrySelect" required>
          <option value="">-- Select Destination Country --</option>
          <optgroup label="Middle East &amp; GCC (Priority Air Freight)">
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia (المملكة العربية السعودية)</option>
            <option value="United Arab Emirates">🇦🇪 United Arab Emirates (الإمارات)</option>
            <option value="Qatar">🇶🇦 Qatar (قطر)</option>
            <option value="Kuwait">🇰🇼 Kuwait (الكويت)</option>
            <option value="Oman">🇴🇲 Oman (عمان)</option>
            <option value="Bahrain">🇧🇭 Bahrain (البحرين)</option>
          </optgroup>
          <optgroup label="Asia Pacific">
            <option value="Indonesia">🇮🇩 Indonesia</option>
            <option value="Malaysia">🇲🇾 Malaysia</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="Thailand">🇹🇭 Thailand</option>
            <option value="Vietnam">🇻🇳 Vietnam</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="South Korea">🇰🇷 South Korea</option>
            <option value="Taiwan">🇹🇼 Taiwan</option>
            <option value="Hong Kong">🇭🇰 Hong Kong</option>
            <option value="Australia">🇦🇺 Australia</option>
          </optgroup>
          <optgroup label="Americas &amp; Europe">
            <option value="United States">🇺🇸 United States</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="France">🇫🇷 France</option>
            <option value="Switzerland">🇨🇭 Switzerland</option>
            <option value="Netherlands">🇳🇱 Netherlands</option>
            <option value="Turkey">🇹🇷 Turkey</option>
          </optgroup>
          <optgroup label="Other Destination">
            <option value="Other">🌍 Other Country (Worldwide Express Delivery)</option>
          </optgroup>
        </select>
      </div>

      <!-- City & State / Province -->
      <div class="form-grid-2">
        <div class="form-group">
          <label>City / Town <span class="required">*</span></label>
          <input name="kota" type="text" placeholder="e.g. Riyadh / Dubai / Jakarta / London" required minlength="2" maxlength="100"/>
        </div>
        <div class="form-group">
          <label>State / Province / Region</label>
          <input name="provinsi" type="text" placeholder="e.g. Riyadh Province / Dubai / DKI Jakarta / California" maxlength="100"/>
        </div>
      </div>

      <!-- Street Address -->
      <div class="form-group full-width">
        <label>Complete Street Address &amp; Delivery Notes <span class="required">*</span></label>
        <textarea
          name="alamat"
          rows="3"
          placeholder="Building name, villa/suite number, street name, district/neighborhood..."
          required
          minlength="8"
          maxlength="500"
        ></textarea>
        <small class="form-hint">Please provide detailed address for DHL, FedEx, Aramex, or UPS door-to-door courier delivery.</small>
      </div>

      <!-- Postal / ZIP Code (End of Form) -->
      <div class="form-group full-width">
        <label>Postal / ZIP Code <span class="required">*</span></label>
        <input name="kode_pos" type="text" placeholder="e.g. 11564 / 90210 / 12345" required minlength="3" maxlength="20"/>
        <small class="form-hint">Essential for air courier routing and customs dispatch.</small>
      </div>

      <div class="order-summary-box">
        <div class="summary-line">
          <span>Selected Product:</span>
          <strong>${esc(o.sub || o.name)} (${c})</strong>
        </div>
        <div class="summary-line" style="margin-top:6px; font-size:12.5px; color:#aaa;">
          <span>Export Compliance:</span>
          <span style="color:var(--gold);">Archival Aroma Packaging + CITES Compliant</span>
        </div>
      </div>

      <button class="btn btn-booking" type="submit">
        <span>Confirm &amp; Submit Order →</span>
      </button>
      <p class="order-security-note">🔒 Your data is secure and confidential. Our customer support will contact you via WhatsApp to confirm order and dispatch details.</p>
    </form>
  </div>
  `

  // --- Gallery media viewer interactions ---
  const viewerWrap = document.getElementById('mediaViewerWrap')
  const zoomBadge  = document.getElementById('zoomBadge')
  const thumbs     = document.querySelectorAll('.gallery-thumb')
  const prevBtn    = document.getElementById('prevBtn')
  const nextBtn    = document.getElementById('nextBtn')

  const openLightbox = (imgSrc) => {
    const modal = document.createElement('div')
    modal.className = 'lightbox-modal'
    modal.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <img src="${imgSrc}" alt="Full Preview"/>
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

  const renderMedia = idx => {
    currentMediaIdx = (idx + mediaItems.length) % mediaItems.length
    const item = mediaItems[currentMediaIdx]
    if (!viewerWrap) return

    viewerWrap.style.opacity = '0.3'
    setTimeout(() => {
      if (item.type === 'video') {
        if (zoomBadge) zoomBadge.style.display = 'none'
        const isYoutube = item.src.includes('youtube.com') || item.src.includes('youtu.be')
        if (isYoutube) {
          let vidId = ''
          if (item.src.includes('youtu.be/')) vidId = item.src.split('youtu.be/')[1].split('?')[0]
          else if (item.src.includes('v=')) vidId = item.src.split('v=')[1].split('&')[0]
          viewerWrap.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;min-height:350px;border-radius:12px;"></iframe>
          `
        } else {
          viewerWrap.innerHTML = `
            <video id="mainVideo" src="${item.src}" controls autoplay playsinline style="width:100%;height:100%;min-height:350px;object-fit:contain;background:#000;border-radius:12px;"></video>
          `
        }
      } else {
        if (zoomBadge) zoomBadge.style.display = 'block'
        viewerWrap.innerHTML = `
          <img id="mainImage" src="${item.src}" alt="${esc(o.sub || o.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;cursor:pointer;" onerror="this.src='${o.img}'"/>
        `
        const imgEl = viewerWrap.querySelector('#mainImage')
        if (imgEl) {
          imgEl.onclick = () => openLightbox(item.src)
        }
      }
      viewerWrap.style.opacity = '1'
    }, 120)

    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentMediaIdx))
  }

  // Initial render
  renderMedia(0)

  thumbs.forEach(t => t.onclick = () => renderMedia(+t.dataset.index))
  if (prevBtn) prevBtn.onclick = () => renderMedia(currentMediaIdx - 1)
  if (nextBtn) nextBtn.onclick = () => renderMedia(currentMediaIdx + 1)

  // --- Dial Code & Country Selection Interactions ---
  const dialCodeSelect   = document.getElementById('dialCodeSelect')
  const dialSelectWrap   = document.getElementById('dialSelectWrap')
  const dialInputWrap    = document.getElementById('dialInputWrap')
  const dialCodeInput    = document.getElementById('dialCodeInput')
  const btnSwitchDial    = document.getElementById('btnSwitchDialMode')
  const dialToggleIcon   = document.getElementById('dialToggleIcon')
  const destCountrySel   = document.getElementById('destCountrySelect')
  const phoneSubInput    = document.getElementById('phoneSubscriber')

  let isCustomDialMode = false

  const setDialMode = (custom) => {
    isCustomDialMode = custom
    if (custom) {
      if (dialSelectWrap) dialSelectWrap.style.display = 'none'
      if (dialInputWrap) dialInputWrap.style.display = 'flex'
      if (dialToggleIcon) dialToggleIcon.textContent = '📋'
      if (btnSwitchDial) btnSwitchDial.title = 'Switch to country dropdown list'
      if (dialCodeInput) {
        if (!dialCodeInput.value && dialCodeSelect && dialCodeSelect.value && dialCodeSelect.value !== 'custom') {
          dialCodeInput.value = dialCodeSelect.value
        }
        dialCodeInput.focus()
      }
    } else {
      if (dialInputWrap) dialInputWrap.style.display = 'none'
      if (dialSelectWrap) dialSelectWrap.style.display = 'block'
      if (dialToggleIcon) dialToggleIcon.textContent = '✏️'
      if (btnSwitchDial) btnSwitchDial.title = 'Type country code manually'
      if (dialCodeInput && dialCodeInput.value && dialCodeSelect) {
        const cleanVal = dialCodeInput.value.replace(/\D/g, '')
        const matchingOpt = Array.from(dialCodeSelect.options).find(o => o.value === cleanVal)
        if (matchingOpt) {
          dialCodeSelect.value = cleanVal
        }
      }
    }
  }

  if (dialCodeSelect) {
    dialCodeSelect.onchange = () => {
      if (dialCodeSelect.value === 'custom') {
        setDialMode(true)
      }
    }
  }

  if (btnSwitchDial) {
    btnSwitchDial.onclick = () => {
      setDialMode(!isCustomDialMode)
    }
  }

  // Country calling code mapping for destination countries
  const countryDialMap = {
    'Indonesia': '62',
    'Malaysia': '60',
    'Singapore': '65',
    'Thailand': '66',
    'Vietnam': '84',
    'Cambodia': '855',
    'Laos': '856',
    'Saudi Arabia': '966',
    'United Arab Emirates': '971',
    'Qatar': '974',
    'Kuwait': '965',
    'Oman': '968',
    'Bahrain': '973',
    'United States': '1',
    'Canada': '1',
    'United Kingdom': '44',
    'Australia': '61',
    'Japan': '81',
    'South Korea': '82',
    'Hong Kong': '852',
    'Taiwan': '886',
    'Germany': '49',
    'France': '33',
    'Switzerland': '41',
    'Netherlands': '31',
    'Turkey': '90'
  }

  if (destCountrySel) {
    destCountrySel.addEventListener('change', () => {
      const selectedCountry = destCountrySel.value
      const targetDial = countryDialMap[selectedCountry]
      if (targetDial) {
        if (isCustomDialMode) {
          if (dialCodeInput) dialCodeInput.value = targetDial
        } else {
          if (dialCodeSelect) {
            const opt = Array.from(dialCodeSelect.options).find(o => o.value === targetDial)
            if (opt) dialCodeSelect.value = targetDial
          }
        }
      }
    })
  }

  // --- Order Form Submit ---
  const form = document.getElementById('f')
  if (form) {
    form.onsubmit = async e => {
      e.preventDefault()
      const btn = form.querySelector('button[type="submit"]')
      const origHTML = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = `<span>Processing Order...</span>`

      // 1. Resolve Country Dial Code
      let dialDigits = ''
      if (isCustomDialMode) {
        dialDigits = String(dialCodeInput?.value || '').replace(/\D/g, '')
      } else {
        dialDigits = String(dialCodeSelect?.value || '').replace(/\D/g, '')
      }
      if (!dialDigits) dialDigits = '62'

      // 2. Resolve Subscriber Local Number
      const subVal = phoneSubInput ? phoneSubInput.value : ''
      const subDigits = String(subVal).replace(/\D/g, '')

      if (!subDigits || subDigits.length < 6) {
        btn.disabled = false
        btn.innerHTML = origHTML
        phoneSubInput?.focus()
        return toast('Please enter a valid phone number (at least 6 digits)', true)
      }

      // 3. Assemble Full Complete Phone Number (e.g. 62085210017968)
      // Preserves local leading 0 if entered (e.g. 62 + 085210017968 = 62085210017968)
      let fullPhone = ''
      if (subDigits.startsWith(dialDigits)) {
        fullPhone = subDigits
      } else {
        fullPhone = dialDigits + subDigits
      }

      // Database check constraint enforcement: phone ~ '^[0-9]{8,15}$'
      if (fullPhone.length > 15 && subDigits.startsWith('0')) {
        fullPhone = dialDigits + subDigits.slice(1)
      }

      if (fullPhone.length < 8 || fullPhone.length > 15) {
        btn.disabled = false
        btn.innerHTML = origHTML
        return toast('Combined phone number must be between 8 and 15 digits', true)
      }

      const countryVal = form.negara ? form.negara.value.trim() : ''
      const postalVal = form.kode_pos ? form.kode_pos.value.trim() : ''
      const cityVal = form.kota ? form.kota.value.trim() : ''
      const provVal = form.provinsi ? form.provinsi.value.trim() : ''
      const streetVal = form.alamat.value.trim()

      // Format complete international shipping address
      const fullAddress = [
        streetVal,
        [cityVal, provVal].filter(Boolean).join(', '),
        [countryVal, postalVal ? `(Postal: ${postalVal})` : ''].filter(Boolean).join(' ')
      ].filter(Boolean).join('\n')

      // 1. Data lengkap pemesanan
      const payload = {
        oud_country: c,
        oud_id: +id,
        oud_name: (o.sub ? `${o.sub} - ${o.name}` : o.name).substring(0, 150),
        nama: form.nama.value.trim(),
        email: form.email.value.trim(),
        phone: fullPhone,
        gender: form.gender.value,
        alamat: fullAddress, // Memuat jalan, kota, provinsi, negara & kode pos secara lengkap
        negara: countryVal,
        kode_pos: postalVal,
        kota: cityVal,
        provinsi: provVal
      }

      // 2. Data standar pokok jika skema database belum memiliki kolom destinasi terpisah
      const basePayload = {
        oud_country: payload.oud_country,
        oud_id: payload.oud_id,
        oud_name: payload.oud_name,
        nama: payload.nama,
        email: payload.email,
        phone: payload.phone,
        gender: payload.gender,
        alamat: payload.alamat
      }

      const fullPayload = payload

      let error = null
      let data = null

      // Strategi Bertingkat:
      // Tahap 1: Coba insert fullPayload dengan .select('id')
      let res = await supabase.from('orders').insert([fullPayload]).select('id')

      // Tangani kemungkinan constraint gender lama ('Laki-laki' / 'Perempuan')
      if (res.error && (res.error.message?.includes('orders_valid') || res.error.message?.includes('gender') || res.error.message?.includes('check constraint'))) {
        const mappedGender = form.gender.value === 'Female' ? 'Perempuan' : 'Laki-laki'
        res = await supabase.from('orders').insert([{ ...fullPayload, gender: mappedGender }]).select('id')
      }

      // Tahap 2: Jika ditolak karena permission denied atau kolom tambahan belum dimigrasi di database,
      // fallback menggunakan basePayload dengan .select('id')
      if (res.error && (res.error.message?.includes('permission denied') || res.error.code === 'PGRST204' || res.error.message?.includes('column') || res.error.message?.includes('negara'))) {
        res = await supabase.from('orders').insert([basePayload]).select('id')
        if (res.error && (res.error.message?.includes('orders_valid') || res.error.message?.includes('gender') || res.error.message?.includes('check constraint'))) {
          const mappedGender = form.gender.value === 'Female' ? 'Perempuan' : 'Laki-laki'
          res = await supabase.from('orders').insert([{ ...basePayload, gender: mappedGender }]).select('id')
        }
      }

      // Tahap 3: Jika .select('id') masih permission denied (karena database membatasi hak SELECT pada anon),
      // lakukan INSERT MURNI tanpa .select() sehingga tidak memerlukan izin baca tabel
      if (res.error && res.error.message?.includes('permission denied')) {
        let pure = await supabase.from('orders').insert([basePayload])
        if (pure.error && (pure.error.message?.includes('orders_valid') || pure.error.message?.includes('gender') || pure.error.message?.includes('check constraint'))) {
          const mappedGender = form.gender.value === 'Female' ? 'Perempuan' : 'Laki-laki'
          pure = await supabase.from('orders').insert([{ ...basePayload, gender: mappedGender }])
        }
        if (!pure.error) {
          res = { data: [{ id: 'ORD-' + Math.floor(1000 + Math.random() * 9000) }], error: null }
        } else {
          res = pure
        }
      }

      error = res.error
      data = res.data

      if (error) {
        btn.disabled = false; btn.innerHTML = origHTML
        return toast('Failed to submit order: ' + (error.message || 'Please check your connection'), true)
      }

      const orderId = data?.[0]?.id || 'ORD-' + Math.floor(1000 + Math.random() * 9000)

      document.querySelector('.booking-section-wrapper').innerHTML = `
        <div class="booking-success-card">
          <div class="success-icon-badge">✓</div>
          <h2 class="success-title">Order Successfully Received!</h2>
          <p class="success-subtitle">Thank you, <strong>${esc(payload.nama)}</strong>. Your order request for <strong>${esc(o.sub || o.name)}</strong> has been recorded in the ASIAN OUD system.</p>

          <div class="success-info-box">
            <div class="info-row">
              <span>Order #:</span>
              <strong class="gold-text">#${orderId}</strong>
            </div>
            <div class="info-row">
              <span>Product:</span>
              <span>${esc(o.sub || o.name)} (${meta.flag} ${c})</span>
            </div>
            <div class="info-row">
              <span>WhatsApp / Phone:</span>
              <span class="gold-text">+${esc(dialDigits)} ${esc(subDigits)}</span>
            </div>
            <div class="info-row">
              <span>Tracking Number ID:</span>
              <span style="font-family:monospace; font-weight:700; color:#fff;">${esc(fullPhone)}</span>
            </div>
            <div class="info-row">
              <span>Destination Country:</span>
              <strong style="color:var(--gold);">🌐 ${esc(countryVal || '-')}</strong>
            </div>
            <div class="info-row">
              <span>Postal / ZIP Code:</span>
              <span>📮 ${esc(postalVal || '-')}</span>
            </div>
            <div class="info-row">
              <span>City &amp; Region:</span>
              <span>${esc(cityVal)}${provVal ? ', ' + esc(provVal) : ''}</span>
            </div>
            <div class="info-row address-row">
              <span>Full Shipping Address:</span>
              <span class="address-text-block">${esc(fullAddress)}</span>
            </div>
          </div>

          <div class="success-actions">
            <a href="#/cek?phone=${encodeURIComponent(fullPhone)}" class="btn-primary-action">
              Track Order Status (${esc(fullPhone)}) →
            </a>
            <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Hello ASIAN OUD Admin, I would like to confirm my order #' + orderId + ' (' + (o.sub || o.name) + ') for recipient ' + payload.nama + ' with phone ' + fullPhone)}" target="_blank" class="btn-wa-confirm">
              Confirm via WhatsApp CS
            </a>
            <a href="#/" class="btn-secondary-action">
              ← Return to Home
            </a>
          </div>
        </div>
      `
      document.querySelector('.booking-section-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' })
      toast('Order submitted successfully! You can track your order in the Track Order menu.')
    }
  }
}
