import { COUNTRIES, COUNTRY_META } from '../data/oud.js'
import { getOuds, S } from '../lib/store.js'
import { esc } from '../lib/utils.js'
import { I } from '../lib/icons.js'

const app = document.getElementById('app')
let selectedCountry = COUNTRIES[0]

export const home = () => {
  const ouds = getOuds(selectedCountry)
  const meta = COUNTRY_META[selectedCountry] || { flag: '🌏', label: 'Destinasi Asia Tenggara', desc: 'Jelajahi keajaiban alam dan kekayaan budaya eksotis di Asia Tenggara.' }

  // CMS values
  const badge     = S('lp_hero_badge',    'Southeast Asia\'s Premier Oud & Heritage Collections')
  const headline  = S('lp_hero_title',    'Jelajahi Pesona Koleksi OUD ASEAN')
  const subtext   = S('lp_hero_subtitle', 'Koleksi eksklusif, sewa & reservasi premium 6 negara Asia Tenggara dengan standar kualitas terbaik, kurasi terpercaya, dan pelayanan profesional.')
  const stat1num  = S('lp_stat1_num',     '6')
  const stat1lbl  = S('lp_stat1_label',   'Negara Eksotis')
  const stat2num  = S('lp_stat2_num',     '100%')
  const stat2lbl  = S('lp_stat2_label',   'Verified Collection')
  const stat3num  = S('lp_stat3_num',     '4.9★')
  const stat3lbl  = S('lp_stat3_label',   'Customer Satisfaction')
  const selLabel  = S('lp_country_label', 'PILIH NEGARA ASAL KOLEKSI')
  const selTitle  = S('lp_country_title', 'Eksplorasi Koleksi & Pilihan per Wilayah')
  const catTag    = S('lp_catalog_tag',   'KATALOG OUD ASEAN')
  const catTitle  = S('lp_catalog_title', `Koleksi Unggulan ${selectedCountry}`)
  const catSub    = S('lp_catalog_sub',   `Tersedia ${ouds.length} paket pilihan kurasi eksklusif dengan fasilitas lengkap dan jaminan kualitas terbaik`)

  const feat1icon = S('lp_feat1_icon',    'Islands')
  const feat1title= S('lp_feat1_title',   'Koleksi Terkurasi')
  const feat1desc = S('lp_feat1_desc',    'Koleksi pilihan mencakup varian legendaris dan kualitas terbaik kawasan ASEAN.')
  const feat2icon = S('lp_feat2_icon',    'Hotel')
  const feat2title= S('lp_feat2_title',   'Standar Premium')
  const feat2desc = S('lp_feat2_desc',    'Kualitas terbaik dengan spesifikasi otentik dan penyimpanan terstandarisasi.')
  const feat3icon = S('lp_feat3_icon',    'Guide')
  const feat3title= S('lp_feat3_title',   'Layanan Berpengalaman')
  const feat3desc = S('lp_feat3_desc',    'Didukung oleh tim profesional yang ramah, responsif, dan siap membantu.')
  const feat4icon = S('lp_feat4_icon',    'Shield')
  const feat4title= S('lp_feat4_title',   'Jaminan Kualitas')
  const feat4desc = S('lp_feat4_desc',    'Layanan profesional dan terpercaya dengan support 24/7 dan garansi kepuasan.')

  let rawBrand = S('lp_brand', 'OUD ASEAN').replace(/^[✈️\s]+/, '').trim()
  if (rawBrand.toLowerCase().includes('asean travel')) rawBrand = 'OUD ASEAN'
  const brandEl = document.getElementById('brand')
  if (brandEl) brandEl.innerHTML = `<span>${esc(rawBrand || 'OUD ASEAN')}</span>`

  app.innerHTML = `
  <!-- Hero -->
  <section class="hero-clean">
    <div class="hero-clean-content">
      <div class="luxury-pill-badge">${esc(badge)}</div>
      <h1 class="hero-clean-title">${esc(headline)}</h1>
      <p class="hero-clean-subtitle">${esc(subtext)}</p>
      <div class="hero-stats-row">
        <div class="hero-stat-item">
          <span class="stat-number">${esc(stat1num)}</span>
          <span class="stat-label">${esc(stat1lbl)}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat-item">
          <span class="stat-number">${esc(stat2num)}</span>
          <span class="stat-label">${esc(stat2lbl)}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat-item">
          <span class="stat-number">${esc(stat3num)}</span>
          <span class="stat-label">${esc(stat3lbl)}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Country Selector -->
  <section class="country-selector">
    <div class="selector-header">
      <span class="selector-label">${esc(selLabel)}</span>
      <h2 class="selector-title">${esc(selTitle)}</h2>
    </div>
    <div class="country-pills">
      ${COUNTRIES.map(c => {
        const cMeta = COUNTRY_META[c] || {}
        const isIndo = c === 'Indonesia'
        return `
          <button class="country-pill ${c === selectedCountry ? 'active' : ''} ${isIndo ? 'pill-indonesia' : ''}" data-c="${c}">
            <span class="pill-flag">${cMeta.flag || '🌏'}</span>
            <span class="pill-name">${c}</span>
            ${isIndo ? '<span class="pill-badge-mini">Utama</span>' : ''}
          </button>
        `
      }).join('')}
    </div>
    <div class="country-info-banner">
      <div class="country-info-header">
        <span class="country-info-flag">${meta.flag}</span>
        <div>
          <h3 class="country-info-title">Destinasi Wisata ${selectedCountry}</h3>
          <span class="country-info-sub">${meta.label}</span>
        </div>
      </div>
      <p class="country-info-desc">${meta.desc}</p>
    </div>
  </section>

  <!-- Tour Packages Grid -->
  <section class="products-clean">
    <div class="products-header-clean">
      <div class="section-tag">${esc(catTag)}</div>
      <h2>${esc(catTitle.replace('${selectedCountry}', selectedCountry))}</h2>
      <p>${esc(catSub.replace('${ouds.length}', ouds.length))}</p>
    </div>
    <div class="products-grid-clean">
      ${ouds.map(o => `
        <a class="product-card-clean" href="#/oud/${encodeURIComponent(selectedCountry)}/${o.id}" title="${esc(o.sub || o.name)}">
          <div class="product-image-clean">
            <img
              src="${o.img}"
              alt="${esc(o.sub || o.name)}"
              loading="eager"
              decoding="async"
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80';"
            />
            <div class="product-image-overlay"></div>
            <div class="product-badge-clean">${esc(o.badge || 'Best Seller')}</div>
            <div class="product-origin-badge">${meta.flag} ${selectedCountry}</div>
          </div>
          <div class="product-info-clean">
            <div class="product-meta-row">
              <span class="product-code">PAKET #${o.id}</span>
              <span class="product-rating">★ 4.9</span>
            </div>
            <h3 class="product-title-text">${esc(o.sub || o.name)}</h3>
            <div class="product-sub-text">${meta.label}</div>
            <p class="product-desc-snippet">${esc(o.desc)}</p>
            <div class="product-footer-clean">
              <div class="product-action-btn">
                <span>Lihat Detail</span>
                <span class="btn-arrow-text">→</span>
              </div>
            </div>
          </div>
        </a>
      `).join('')}
    </div>
  </section>

  <!-- Features -->
  <section class="features-clean">
    <div class="feature-clean-item">
      <div class="feature-clean-icon feature-icon-num">01</div>
      <div>
        <h4>${esc(feat1title)}</h4>
        <p>${esc(feat1desc)}</p>
      </div>
    </div>
    <div class="feature-clean-item">
      <div class="feature-clean-icon feature-icon-num">02</div>
      <div>
        <h4>${esc(feat2title)}</h4>
        <p>${esc(feat2desc)}</p>
      </div>
    </div>
    <div class="feature-clean-item">
      <div class="feature-clean-icon feature-icon-num">03</div>
      <div>
        <h4>${esc(feat3title)}</h4>
        <p>${esc(feat3desc)}</p>
      </div>
    </div>
    <div class="feature-clean-item">
      <div class="feature-clean-icon feature-icon-num">04</div>
      <div>
        <h4>${esc(feat4title)}</h4>
        <p>${esc(feat4desc)}</p>
      </div>
    </div>
  </section>
  `

  app.querySelectorAll('.country-pill').forEach(btn => {
    btn.onclick = () => {
      selectedCountry = btn.dataset.c
      home()
      const productsEl = document.querySelector('.products-clean')
      if (productsEl) productsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
