import { getCountries, getCountryMeta, getOuds, S } from '../lib/store.js'
import { esc } from '../lib/utils.js'

const app = document.getElementById('app')
let selectedCountry = 'Indonesia'

export const resetHomeCountry = () => {
  selectedCountry = 'Indonesia'
}

export const home = (reset = false) => {
  if (reset) {
    selectedCountry = 'Indonesia'
  }
  const countries = getCountries()
  if (!countries.includes(selectedCountry) && countries.length > 0) {
    selectedCountry = countries[0]
  }

  const ouds = getOuds(selectedCountry)
  const meta = getCountryMeta(selectedCountry)

  // CMS values
  const badge     = S('lp_hero_badge',    'Trusted Supplier of Premium Agarwood')
  const headline  = S('lp_hero_title',    'BUY NOW')
  const subtext   = S('lp_hero_subtitle', 'Koleksi Agarwood / Gaharu premium dari 6 negara Asia. Produk 100% autentik, bersertifikasi, dan dikurasi langsung dari sumber terpercaya.')
  const stat1num  = S('lp_stat1_num',     '6')
  const stat1lbl  = S('lp_stat1_label',   'Asian Countries')
  const stat2num  = S('lp_stat2_num',     '100%')
  const stat2lbl  = S('lp_stat2_label',   'Authentic & Verified')
  const stat3num  = S('lp_stat3_num',     '4.9★')
  const stat3lbl  = S('lp_stat3_label',   'Customer Rating')
  const selLabel  = S('lp_country_label', 'PILIH ASAL PRODUK')
  const selTitle  = S('lp_country_title', 'Koleksi Agarwood per Negara')
  const catTag    = S('lp_catalog_tag',   'KATALOG ASIAN OUD')
  const catTitle  = S('lp_catalog_title', `Produk Unggulan — ${selectedCountry}`)
  const catSub    = S('lp_catalog_sub',   `${ouds.length} produk pilihan tersedia, dikurasi dari sumber terpercaya dengan grade premium`)

  const feat1title= S('lp_feat1_title',   'Sumber Langsung')
  const feat1desc = S('lp_feat1_desc',    'Agarwood dikurasi langsung dari penghasil terpercaya di 6 negara Asia.')
  const feat2title= S('lp_feat2_title',   'Grade Premium')
  const feat2desc = S('lp_feat2_desc',    'Setiap produk melewati seleksi ketat untuk memastikan kualitas terbaik.')
  const feat3title= S('lp_feat3_title',   '100% Autentik')
  const feat3desc = S('lp_feat3_desc',    'Didukung dokumentasi asal-usul dan sertifikasi keaslian produk.')
  const feat4title= S('lp_feat4_title',   'Layanan Profesional')
  const feat4desc = S('lp_feat4_desc',    'Tim berpengalaman siap membantu konsultasi dan pemesanan 24/7.')

  // Update brand di navbar
  const brandEl = document.getElementById('brand')
  if (brandEl) brandEl.innerHTML = `<span class="brand-asian">ASIAN</span> <span class="brand-oud">OUD</span>`

  app.innerHTML = `
  <!-- Hero -->
  <section class="hero-clean">
    <div class="hero-clean-content">
      <div class="luxury-pill-badge">${esc(badge)}</div>
      <h1 class="hero-clean-title hero-buy-title">${esc(headline)}</h1>
      <p class="hero-clean-subtitle">${esc(subtext)}</p>
      <div class="hero-buy-action-wrap">
        <button class="btn-hero-buy-action" onclick="const p = document.querySelector('.products-clean'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });">
          <span>PILIH PRODUK &amp; ORDER SEKARANG →</span>
        </button>
      </div>
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

  <!-- Country Selector Dinamis dari Database -->
  <section class="country-selector">
    <div class="selector-header">
      <span class="selector-label">${esc(selLabel)}</span>
      <h2 class="selector-title">${esc(selTitle)}</h2>
    </div>
    <div class="country-pills">
      ${countries.map(c => {
        const cMeta = getCountryMeta(c)
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
          <h3 class="country-info-title">Agarwood dari ${selectedCountry}</h3>
          <span class="country-info-sub">${meta.label}</span>
        </div>
      </div>
      <p class="country-info-desc">${meta.desc}</p>
    </div>
  </section>

  <!-- Products Grid Dinamis dari Database -->
  <section class="products-clean">
    <div class="products-header-clean">
      <div class="section-tag">${esc(catTag)}</div>
      <h2>${esc(catTitle)}</h2>
      <p>${esc(catSub)}</p>
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
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80';"
            />
            <div class="product-image-overlay"></div>
            <div class="product-badge-clean">${esc(o.badge || 'Premium Grade')}</div>
            <div class="product-origin-badge">${meta.flag} ${selectedCountry}</div>
          </div>
          <div class="product-info-clean">
            <div class="product-meta-row">
              <span class="product-code">PROD #${o.id}</span>
              <span class="product-rating">★ 4.9</span>
            </div>
            <h3 class="product-title-text">${esc(o.sub || o.name)}</h3>
            <div class="product-sub-text">${esc(o.name)} · ${meta.label}</div>
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

  <!-- Features / Why Us -->
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
