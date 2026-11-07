import { supabase } from '../lib/supabase.js'
import { esc, norm } from '../lib/utils.js'

const app = document.getElementById('app')

const statusConfig = {
  'Baru':      { color: '#3498db', bg: 'rgba(52, 152, 219, 0.15)', step: 1, label: 'Order Received',         desc: 'Your Agarwood order has been received and is awaiting admin verification.' },
  'Diproses':  { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.15)', step: 2, label: 'Quality Check & Packing', desc: 'The product is undergoing strict quality inspection, precision weighing, and airtight protective packaging.' },
  'Dikirim':   { color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.15)', step: 3, label: 'In Transit',              desc: 'Your package has been dispatched with the courier. Tracking and delivery updates sent via WhatsApp.' },
  'Selesai':   { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)', step: 4, label: 'Order Delivered',         desc: 'The order has been successfully delivered. Thank you for placing your trust in ASIAN OUD.' }
}

const renderTimeline = (status) => {
  const currentStep = statusConfig[status]?.step || 1
  const steps = [
    { num: 1, name: 'Received' },
    { num: 2, name: 'Processing' },
    { num: 3, name: 'Shipped' },
    { num: 4, name: 'Delivered' }
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
        <h3>No Order History Found</h3>
        <p>No order history was found for phone number <strong>${esc(phoneSearched)}</strong>.</p>
        <p class="empty-subnote">Please ensure the phone number matches the one provided during checkout, or reach out to our customer support for manual assistance.</p>
        <div class="empty-actions">
          <a href="#/" class="btn-empty-cta">Explore Catalog</a>
          <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Hello ASIAN OUD Admin, I would like to inquire about my order status for phone number ' + phoneSearched)}" target="_blank" class="btn-empty-wa">Contact Support</a>
        </div>
      </div>
    `
  }

  const trackUrl = `${window.location.origin}${window.location.pathname}#/cek?phone=${encodeURIComponent(phoneSearched)}`

  return `
    <div class="results-wrapper">
      <div class="results-header">
        <div class="results-header-left">
          <div class="results-count-badge">Found <strong>${orders.length}</strong> Order Record${orders.length > 1 ? 's' : ''}</div>
          <p class="results-sub">Phone Number: <strong style="color:var(--gold);">${esc(phoneSearched)}</strong></p>
        </div>
        <div class="results-header-right">
          <button id="btnCopyTrackLink" class="btn-copy-link" type="button" data-url="${esc(trackUrl)}">
            Copy Tracking Link
          </button>
        </div>
      </div>

      <!-- TABEL RINGKASAN ORDER -->
      <div class="table-responsive-box">
        <table class="order-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date &amp; Time</th>
              <th>Agarwood Item</th>
              <th>Customer Name</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((r) => {
              const cfg = statusConfig[r.status] || { color: '#d4af37', bg: 'rgba(212,175,55,0.15)', label: r.status }
              const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
              return `
                <tr class="order-table-row" data-target="detail-${r.id}">
                  <td class="cell-id">
                    <span class="order-id-badge">#${r.id}</span>
                  </td>
                  <td class="cell-date">${dateStr}</td>
                  <td class="cell-product">
                    <div class="table-prod-name">${esc(r.oud_name || 'Agarwood Collection')}</div>
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
                      View Details ↓
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
        <h3>Order Summary &amp; Delivery Details</h3>
        <p>Detailed item specifications and verified shipping information</p>
      </div>

      <div class="order-details-stack">
        ${orders.map((r) => {
          const cfg = statusConfig[r.status] || { color: '#d4af37', bg: 'rgba(212,175,55,0.15)', label: r.status, desc: '' }
          const formattedDate = new Date(r.created_at).toLocaleString('en-US', {
            dateStyle: 'full', timeStyle: 'medium'
          })
          const waMessage = encodeURIComponent(
            `Hello ASIAN OUD Admin, I would like to confirm my order #${r.id} (${r.oud_name}) under the name ${r.nama}.`
          )

          return `
            <div class="order-detail-card" id="detail-${r.id}">
              <div class="card-top-bar">
                <div class="card-id-group">
                  <div>
                    <h4 class="card-title">Order #${r.id}</h4>
                    <span class="card-time">Placed on ${formattedDate}</span>
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
                  <strong>Current Status:</strong> ${cfg.desc}
                </div>
              </div>

              <div class="detail-split-grid">
                <!-- Kolom Produk -->
                <div class="detail-section-block">
                  <h5 class="block-title">Ordered Product</h5>
                  <div class="item-ordered-card">
                    <div class="item-bullet">✓</div>
                    <div class="item-text">
                      <div class="item-main-name">${esc(r.oud_name || 'ASIAN OUD Agarwood Collection')}</div>
                      <div class="item-sub-meta">Origin: <strong>${esc(r.oud_country || 'Asia')}</strong></div>
                      <div class="item-note">100% authentic collection with guaranteed premium grade quality from ASIAN OUD.</div>
                    </div>
                  </div>
                </div>

                <!-- Kolom Detail Pemesan -->
                <div class="detail-section-block">
                  <h5 class="block-title">Customer &amp; Delivery Details</h5>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">Customer Name:</span>
                      <span class="info-val">${esc(r.nama)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">WhatsApp Number:</span>
                      <span class="info-val">${esc(r.phone)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email Address:</span>
                      <span class="info-val">${esc(r.email)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Gender:</span>
                      <span class="info-val">${esc(r.gender === 'Laki-laki' ? 'Male' : (r.gender === 'Perempuan' ? 'Female' : (r.gender || '-')))}</span>
                    </div>
                    ${(r.negara || r.kode_pos) ? `
                    <div class="info-item">
                      <span class="info-label">Destination Country:</span>
                      <span class="info-val">🌐 ${esc(r.negara || '-')}${r.kode_pos ? ` (ZIP/Postal: ${esc(r.kode_pos)})` : ''}</span>
                    </div>
                    ` : ''}
                    ${r.alamat ? `
                    <div class="info-item address-item">
                      <span class="info-label">Shipping Address:</span>
                      <span class="info-val address-text">${esc(r.alamat)}</span>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="card-bottom-actions">
                <a href="https://wa.me/6281234567890?text=${waMessage}" target="_blank" class="btn-card-wa">
                  <span>Contact ASIAN OUD Support on WhatsApp</span>
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
      <div class="luxury-pill-badge">OFFICIAL ORDER TRACKING</div>
      <h1 class="cek-hero-title">TRACK YOUR ORDER</h1>
      <p class="cek-hero-subtitle">Monitor the status of your Agarwood order, product details, and shipment progress using your registered phone number.</p>
    </div>
    
    <!-- Search Form Card -->
    <div class="cek-search-wrapper">
      <form id="f" class="cek-search-card">
        <div class="search-card-top">
          <label class="search-card-label" for="phoneInput">Customer Phone / WhatsApp Number</label>
          <span class="search-badge-pill">Instant Verification</span>
        </div>

        <div class="search-bar-integrated">
          <span class="search-prefix" title="International Phone Number">📞 +</span>
          <input 
            id="phoneInput"
            name="p" 
            type="tel" 
            class="search-main-input"
            placeholder="Enter complete number (e.g. 62085210017968 or 966501234567)" 
            value="${esc(prefillPhone)}"
            required 
            autocomplete="tel"
            pattern="[\+]?[0-9\s\-]{8,20}"
            title="Enter complete phone number with country code (e.g. 62085210017968)"
          />
          <button class="btn-search-trigger" type="submit">
            <span>Track Order →</span>
          </button>
        </div>

        <div class="search-card-footer">
          <span class="search-hint-text">
            Enter the complete phone number with country code (e.g. <strong>62085210017968</strong>) used during checkout.
          </span>
          <a href="https://wa.me/6281234567890" target="_blank" class="search-cs-link">
            WhatsApp CS Support ↗
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
              <strong>Enter Phone Number</strong>
              <p>Use the contact number provided during checkout.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">2</span>
            <div>
              <strong>Review Order Summary</strong>
              <p>Review your agarwood selection, specifications, and processing stage.</p>
            </div>
          </div>
          <div class="guide-item">
            <span class="guide-icon-badge">3</span>
            <div>
              <strong>Track Shipment</strong>
              <p>Status is updated in real time by the ASIAN OUD logistics team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Help Box -->
    <div class="cek-help">
      <div class="help-inner">
        <div class="help-header">
          <h3>Need Assistance with Your Order?</h3>
          <p>The ASIAN OUD customer support team is available 24/7 to assist you.</p>
        </div>
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon help-icon-num">i</div>
            <div>
              <strong>Forgotten Your Order Details?</strong>
              <p>Check your confirmation email or contact support with your full recipient name.</p>
            </div>
          </div>
          <div class="help-item">
            <div class="help-icon help-icon-num">WA</div>
            <div>
              <strong>24/7 WhatsApp Customer Service</strong>
              <p>Contact ASIAN OUD Customer Support at <a href="https://wa.me/6281234567890" target="_blank" style="color:var(--gold); font-weight:700;">+62 812-3456-7890</a> (Available 24/7)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  const doSearch = async (phoneVal) => {
    const rawDigits = String(phoneVal || '').replace(/\D/g, '')
    const outEl = document.getElementById('out')
    if (!outEl) return

    if (!rawDigits || rawDigits.length < 7) {
      outEl.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-circle">!</div>
          <h3>Invalid Phone Number</h3>
          <p>Please enter a valid phone number with country code (e.g. <strong>62085210017968</strong> or <strong>966501234567</strong>).</p>
        </div>
      `
      return
    }

    outEl.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Checking order history for ${esc(phoneVal)}...</p>
      </div>
    `

    // Generate intelligent permutations so user can find orders
    // whether they typed 62085210017968, 6285210017968, 085210017968, or an international number
    const candidates = [rawDigits]
    if (rawDigits.startsWith('620')) {
      candidates.push('62' + rawDigits.slice(3))
    }
    if (rawDigits.startsWith('62') && rawDigits[2] !== '0') {
      candidates.push('620' + rawDigits.slice(2))
    }
    if (rawDigits.startsWith('0')) {
      candidates.push('62' + rawDigits)
      candidates.push('62' + rawDigits.slice(1))
    }
    if (rawDigits.startsWith('8')) {
      candidates.push('62' + rawDigits)
      candidates.push('620' + rawDigits)
    }

    const uniqueCandidates = [...new Set(candidates)].filter(p => p.length >= 8 && p.length <= 15)

    try {
      let finalData = []
      let matchedPhone = rawDigits
      let lastError = null

      for (const cand of uniqueCandidates) {
        const { data, error } = await supabase.rpc('cek_pesanan', { p_phone: cand })
        if (error) {
          lastError = error
          continue
        }
        if (data && data.length > 0) {
          finalData = data
          matchedPhone = cand
          break
        }
      }

      if (finalData.length > 0) {
        outEl.innerHTML = renderOrderResults(finalData, matchedPhone)
        const copyBtn = document.getElementById('btnCopyTrackLink')
        if (copyBtn) {
          copyBtn.onclick = () => {
            const url = copyBtn.dataset.url
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(() => {
                copyBtn.textContent = 'Link Copied to Clipboard!'
                setTimeout(() => { copyBtn.textContent = 'Copy Tracking Link' }, 2000)
              }).catch(() => {
                prompt('Copy this link:', url)
              })
            } else {
              prompt('Copy this link:', url)
            }
          }
        }
      } else if (lastError && uniqueCandidates.length === 1) {
        console.error('Error cek pesanan:', lastError)
        outEl.innerHTML = `
          <div class="error-state">
            <div class="error-icon">!</div>
            <h4>Unable to Retrieve Order</h4>
            <p>${esc(lastError.message || 'An error occurred while fetching your data. Please try again shortly.')}</p>
          </div>
        `
      } else {
        outEl.innerHTML = renderOrderResults([], phoneVal)
      }
    } catch (err) {
      outEl.innerHTML = `
        <div class="error-state">
          <div class="error-icon">!</div>
          <p>Network connectivity issue. Please ensure your internet connection is active.</p>
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
      btn.innerHTML = `<span>Searching...</span>`
      
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
