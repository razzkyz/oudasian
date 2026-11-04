const app = document.getElementById('app')

export const contact = () => {
  app.innerHTML = `
  <div class="page-banner">
    <div class="banner-badge">LAYANAN KONSULTASI 24/7</div>
    <h1 class="banner-title">HUBUNGI TIM TOUR KAMI</h1>
    <p class="banner-subtitle">Konsultasikan rencana perjalanan, custom itinerary, atau pertanyaan seputar destinasi wisata dengan konsultan tour kami.</p>
  </div>
  
  <div class="box" style="max-width:680px; margin:36px auto; padding:32px; background:rgba(20,20,20,0.8); border:1px solid rgba(212,175,55,0.2); border-radius:16px;">
    <h3 style="color:var(--gold); font-family:Cinzel; margin-top:0;">Informasi Kontak Resmi</h3>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin:20px 0;">
      <div style="background:#151515; padding:16px; border-radius:10px; border:1px solid #282828;">
        <div style="color:var(--gold); font-weight:700; margin-bottom:6px;">Email CS</div>
        <a href="mailto:info@oudasean.com" style="color:#ddd; text-decoration:none; font-size:14px;">info@oudasean.com</a>
      </div>
      <div style="background:#151515; padding:16px; border-radius:10px; border:1px solid #282828;">
        <div style="color:var(--gold); font-weight:700; margin-bottom:6px;">WhatsApp Hotline</div>
        <a href="https://wa.me/6281234567890" style="color:#ddd; text-decoration:none; font-size:14px;" target="_blank">+62 812-3456-7890</a>
      </div>
    </div>
    
    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:24px 0">
    
    <h3 style="color:var(--gold); font-family:Cinzel;">Kirim Pesan / Tanya Koleksi</h3>
    <form id="contactForm" style="display:flex; flex-direction:column; gap:14px; margin-top:16px;">
      <input type="text" placeholder="Nama Lengkap Anda" required style="padding:12px; background:#121212; border:1px solid #333; color:#fff; border-radius:8px;">
      <input type="email" placeholder="Alamat Email Aktif" required style="padding:12px; background:#121212; border:1px solid #333; color:#fff; border-radius:8px;">
      <textarea rows="4" placeholder="Tuliskan pertanyaan Anda seputar koleksi OUD ASEAN..." required style="padding:12px; background:#121212; border:1px solid #333; color:#fff; border-radius:8px;"></textarea>
      <button type="submit" class="btn" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px;">
        <span>Kirim Pesan Sekarang →</span>
      </button>
    </form>
  </div>
  
  <div style="text-align:center; margin:36px 0;">
    <a href="#/" class="back" style="display:inline-flex; align-items:center; gap:6px;">
      ← Kembali ke Katalog Destinasi
    </a>
  </div>
  `
  
  document.getElementById('contactForm').onsubmit = (e) => {
    e.preventDefault()
    alert('Terima kasih! Pesan Anda telah kami terima. Tim reservasi akan segera menghubungi via WhatsApp / Email.')
    contact()
  }
}
