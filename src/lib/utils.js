export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export const norm=p=>{let d=String(p).replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);else if(d.startsWith('8'))d='62'+d;return d}
export const toast=(m,bad)=>{const t=document.createElement('div');t.className='toast'+(bad?' bad':'');t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3500)}
export const resize = (file, maxDim = 850, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Tidak ada file yang dipilih'))
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih harus berupa gambar (JPG, PNG, WebP)'))
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memproses format gambar'))
      img.onload = () => {
        try {
          const max = Math.max(img.width, img.height)
          const scale = max > maxDim ? maxDim / max : 1
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          let dataUrl = canvas.toDataURL('image/jpeg', quality)
          if (dataUrl.length > 800000) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.65)
          }
          resolve(dataUrl)
        } catch (err) {
          reject(err)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
