import { supabase } from './supabase.js'
import { getOuds as defaults } from '../data/oud.js'
export const DB={ouds:[],site:{}}
export const S=(k,d)=>DB.site[k]||d
export const load=async()=>{
 const [o,s]=await Promise.all([
  supabase.from('ouds').select('*'),
  supabase.from('site').select('*')
 ])
 
 DB.ouds=o.data||[]
 DB.site=Object.fromEntries((s.data||[]).map(r=>[r.key,r.value]))
 
 // Update footer if exists
 const footerEl=document.querySelector('.footer-luxury')
 if(footerEl){
  footerEl.textContent=S('footer','© Oud ASEAN · Premium Agarwood Collection')
 }
 
 // Update brand if exists
 const brandEl=document.getElementById('brand')
 if(brandEl){
  brandEl.textContent=S('brand','OUD ASEAN')
 }
}

export const getOuds=c=>defaults(c).map((d,i)=>{
 const r=DB.ouds.find(x=>x.country===c&&x.slot===i+1)||{}
 return {...d,name:r.name||d.name,sub:r.sub||d.sub,desc:r.descr||d.desc,img:r.img||d.img,custom:!!r.img}
})
