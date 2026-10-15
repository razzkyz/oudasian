export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export const norm=p=>{let d=String(p).replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);else if(d.startsWith('8'))d='62'+d;return d}
export const toast=(m,bad)=>{const t=document.createElement('div');t.className='toast'+(bad?' bad':'');t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3500)}
export const resize=f=>new Promise(res=>{const im=new Image();im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas')
 c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.78))};im.src=URL.createObjectURL(f)})
