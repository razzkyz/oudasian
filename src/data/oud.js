export const COUNTRIES=['Thailand','Cambodia','Vietnam','Malaysia','Indonesia','Laos']
const N=['Royal Agarwood','Black Gold','Sultan Reserve','Midnight Resin','Heritage Chip','Amber Mist','Jungle Spirit','Golden Dust']
export const getOuds=c=>N.map((n,i)=>({id:i+1,name:`Oud ${c} ${i+1}`,sub:n,
 img:`https://picsum.photos/seed/oud${c}${i}/600/600`,
 desc:`${n} dari ${c}: aroma kayu gaharu yang dalam, hangat, dan tahan lama. Cocok untuk koleksi maupun hadiah istimewa. (Edit deskripsi di src/data.js)`}))
