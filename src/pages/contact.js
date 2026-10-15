const app=document.getElementById('app')

export const contact=()=>{
 app.innerHTML=`
  <h1 class="title">GET IN TOUCH</h1>
  <p class="sub">Have questions? We're here to help you plan your journey</p>
  
  <div class="box" style="max-width:600px;margin:30px auto">
   <h3 style="color:var(--gold);font-family:Cinzel;margin-top:0">Contact Information</h3>
   <p><strong>Email:</strong> <a href="mailto:info@aseantravel.com" style="color:var(--gold)">info@aseantravel.com</a></p>
   <p><strong>WhatsApp:</strong> <a href="https://wa.me/628123456789" style="color:var(--gold)" target="_blank">+62 812-3456-789</a></p>
   <p><strong>Instagram:</strong> <a href="https://instagram.com/aseantravel" style="color:var(--gold)" target="_blank">@aseantravel</a></p>
   
   <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0">
   
   <h3 style="color:var(--gold);font-family:Cinzel">Send Message</h3>
   <form id="contactForm">
    <input type="text" placeholder="Your Name" required>
    <input type="email" placeholder="Your Email" required>
    <textarea rows="5" placeholder="Your Message" required></textarea>
    <button type="submit" class="btn">Send Message</button>
   </form>
  </div>
  
  <div style="text-align:center;margin-top:40px">
   <a href="#/" class="back">← Back to Home</a>
  </div>
 `
 
 document.getElementById('contactForm').onsubmit=(e)=>{
  e.preventDefault()
  alert('Thank you! Your message has been received. We will contact you soon.')
  contact()
 }
}
