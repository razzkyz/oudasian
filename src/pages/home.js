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
  const customSub = S('lp_hero_subtitle', '')
  const subtext   = (customSub && !customSub.includes('Koleksi Agarwood') && !customSub.includes('Gaharu'))
    ? customSub
    : 'Discover the finest agarwood collection from six Asian countries, carefully selected to ensure authenticity, exceptional quality, and a distinctive fragrance.'
  const stat1num  = S('lp_hero_stat1_num', S('lp_stat1_num', '6'))
  const stat1lbl  = S('lp_hero_stat1_lbl', S('lp_stat1_label', 'Asian Countries'))
  const stat2num  = S('lp_hero_stat2_num', S('lp_stat2_num', '100%'))
  const stat2lbl  = S('lp_hero_stat2_lbl', S('lp_stat2_label', 'Authentic & Pure'))
  const stat3num  = S('lp_hero_stat3_num', S('lp_stat3_num', 'GRADE A+'))
  const stat3lbl  = S('lp_hero_stat3_lbl', S('lp_stat3_label', 'Super Sinking'))
  let selTitle    = S('lp_country_title', 'PREMIUM AGARWOOD COLLECTION FROM SIX ASIAN COUNTRIES.')
  if (!selTitle || selTitle === 'Agarwood Collections by Country') {
    selTitle = 'PREMIUM AGARWOOD COLLECTION FROM SIX ASIAN COUNTRIES.'
  }
  const catTag    = S('lp_cat_badge',     S('lp_catalog_tag', 'ASIAN OUD CATALOG'))
  const catTitle  = S('lp_cat_title',     S('lp_catalog_title', `Featured Collections — ${selectedCountry}`))
  const catSub    = S('lp_cat_subtitle',  S('lp_catalog_sub', `${ouds.length} curated premium items available, directly verified from trusted wild harvests`))

  const feat1title= S('lp_feat1_title',   '100% Authentic & Natural')
  const feat1desc = S('lp_feat1_desc',    'Free from artificial chemicals, synthetic fragrances, or color manipulation.')
  const feat2title= S('lp_feat2_title',   'Direct Forest Harvest')
  const feat2desc = S('lp_feat2_desc',    'Harvested directly by seasoned agarwood hunters deep in Asian native rainforests.')
  const feat3title= S('lp_feat3_title',   'Super Sinking Grade')
  const feat3desc = S('lp_feat3_desc',    'High-density resin that sinks in water, delivering an everlasting deep scent.')
  const feat4title= S('lp_feat4_title',   'Protected Delivery')
  const feat4desc = S('lp_feat4_desc',    'Secure airtight packaging with transparent tracking directly to your door.')

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
      
      <!-- Stats Row (Asian Countries Box) -->
      <div class="hero-stats-row">
        <div class="hero-stat-item stat-item-1">
          <span class="stat-number">${esc(stat1num)}</span>
          <span class="stat-label">${esc(stat1lbl)}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat-item stat-item-2">
          <span class="stat-number">${esc(stat2num)}</span>
          <span class="stat-label">${esc(stat2lbl)}</span>
        </div>
        <div class="hero-stat-divider"></div>
        <div class="hero-stat-item stat-item-3">
          <span class="stat-number stat-grade-number">${esc(stat3num)}</span>
          <span class="stat-label">${esc(stat3lbl)}</span>
        </div>
      </div>

      <!-- Order CTA Button (Placed Underneath Stats Row) -->
      <div class="hero-buy-action-wrap">
        <button class="btn-hero-buy-action" onclick="const p = document.querySelector('.products-clean'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });">
          <span>CHOOSE YOUR OUD &amp; ORDER NOW</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Country Selector Dinamis dari Database -->
  <section class="country-selector">
    <div class="selector-header">
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
            ${isIndo ? '<span class="pill-badge-mini">Main Origin</span>' : ''}
          </button>
        `
      }).join('')}
    </div>
    <div class="country-info-banner">
      <div class="country-info-header">
        <span class="country-info-flag">${meta.flag}</span>
        <div>
          <h3 class="country-info-title">Agarwood from ${selectedCountry}</h3>
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
                <span>View Details</span>
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
