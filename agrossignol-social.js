/* AGROSSIGNOL : photos, commentaires et WhatsApp du vendeur (Supabase).
   Ne touche ni au Pi SDK, ni à la connexion Pi, ni aux paiements. */
(function(){
const SB='https://ymndoorshmmigbrzisav.supabase.co';
const KEY='sb_publishable_OlIbCWjQlDwI1FIsrVq4Pw_yPLeSd5H';
const H={apikey:KEY}, JH={apikey:KEY,'Content-Type':'application/json'};
const OFF=1000000, DEFWA='237698560650';
let picked=[], OPEN={}, COM={}, busy=false;

const css=document.createElement('style');
css.textContent=`
.pics{display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 12px 10px;scrollbar-width:none}
.pics::-webkit-scrollbar{display:none}
.pics img{flex:0 0 86%;max-height:320px;object-fit:cover;border-radius:12px;scroll-snap-align:start;background:var(--gris)}
.pics.one img{flex-basis:100%}
.cmts{padding:4px 12px 12px;border-top:1px solid var(--gris)}
.cm{padding:8px 0;font-size:.88rem;line-height:1.45;border-bottom:1px solid var(--gris)}
.cm small{color:#6a6a6a;margin-left:6px}
.cm0{padding:10px 0;font-size:.84rem;color:#5f5f5f}
.cmrow{display:flex;gap:8px;margin-top:10px}
.cmrow input{flex:1;min-width:0;border:2px solid var(--gris);border-radius:50px;padding:10px 14px;font:inherit;font-size:.95rem}
.cmrow button{background:var(--vert);color:#fff;border:0;border-radius:50px;padding:0 16px;min-height:42px;font-weight:700;font-size:.85rem}
.modal label.addph{display:block;text-align:center;border:2px dashed var(--vert2);color:var(--vert);border-radius:12px;padding:14px;font-weight:700;cursor:pointer;margin-top:4px}
#f-thumbs{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
#f-thumbs .th{position:relative;width:72px;height:72px}
#f-thumbs img{width:100%;height:100%;object-fit:cover;border-radius:10px}
#f-thumbs button{position:absolute;top:-6px;right:-6px;width:26px;height:26px;border-radius:50%;border:0;background:var(--or);color:#fff;font-size:1rem;line-height:1}
`;
document.head.appendChild(css);

function ago(s){const m=Math.round((Date.now()-new Date(s))/6e4);if(m<1)return "à l'instant";if(m<60)return 'il y a '+m+' min';const h=Math.round(m/60);if(h<24)return 'il y a '+h+' h';return 'il y a '+Math.round(h/24)+' j'}
function waNum(s){let d=String(s||'').replace(/\D/g,'');if(d.length===9&&d[0]==='6')d='237'+d;return d.length>=11&&d.length<=15?d:''}
async function rest(path){const r=await fetch(SB+'/rest/v1/'+path,{headers:H});if(!r.ok)throw new Error(await r.text());return r.json()}
async function post(table,row){const r=await fetch(SB+'/rest/v1/'+table,{method:'POST',headers:Object.assign({Prefer:'return=minimal'},JH),body:JSON.stringify(row)});if(!r.ok)throw new Error(await r.text())}

async function shrink(file){
  const url=URL.createObjectURL(file);
  const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=url});
  const s=Math.min(1,1280/Math.max(img.width,img.height));
  const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
  return new Promise((ok,ko)=>c.toBlob(b=>b?ok(b):ko(new Error('photo')),'image/jpeg',0.8));
}
async function upload(file){
  const blob=await shrink(file), name=Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
  const r=await fetch(SB+'/storage/v1/object/photos/'+name,{method:'POST',headers:{apikey:KEY,'Content-Type':'image/jpeg'},body:blob});
  if(!r.ok)throw new Error(await r.text());
  return SB+'/storage/v1/object/public/photos/'+name;
}

async function loadRemote(){
  try{
    const [a,c]=await Promise.all([rest('annonces?select=*&order=created_at.desc&limit=60'),rest('commentaires?select=*&order=created_at.asc&limit=1000')]);
    COM={};c.forEach(x=>(COM[x.annonce_id]=COM[x.annonce_id]||[]).push(x));
    for(let i=base.length-1;i>=0;i--)if(base[i].remote)base.splice(i,1);
    base.unshift(...a.map(r=>({id:OFF+r.id,rid:r.id,name:r.nom,seller:r.vendeur,price:r.prix,emoji:'',cat:r.categorie||'légumes',unit:r.unite||'unité',text:r.description||'',photos:r.photos||[],wa:r.whatsapp||'',remote:true})));
    renderAll();
  }catch(e){console.warn('Annonces en ligne indisponibles',e)}
}

const _ph=window.ph;
window.ph=function(p){
  if(p.photos&&p.photos.length)return `<div class="ph" data-i="${esc(p.name[0].toUpperCase())}"><img loading="lazy" alt="${esc(p.name)}" src="${esc(p.photos[0])}" onerror="this.remove()"></div>`;
  return _ph(p);
};

function card(p){
  const l=likes[p.id]?1:0,f=follows.includes(p.seller),own=user&&user.username===p.seller;
  const has=p.photos&&p.photos.length, n=(COM[p.rid]||[]).length;
  const pics=has?`<div class="pics${p.photos.length===1?' one':''}">${p.photos.map(u=>`<img loading="lazy" alt="${esc(p.name)}" src="${esc(u)}" onerror="this.remove()">`).join('')}</div>`:'';
  const list=(COM[p.rid]||[]).map(c=>`<div class="cm"><b>${esc(c.auteur)}</b><small>${ago(c.created_at)}</small><div>${esc(c.texte)}</div></div>`).join('');
  const cmts=OPEN[p.id]?`<div class="cmts">${list||'<div class="cm0">Aucun commentaire. Posez vos questions au vendeur avant de le contacter.</div>'}<div class="cmrow"><input id="ci-${p.id}" maxlength="300" placeholder="Écrire un commentaire" onkeydown="if(event.key==='Enter')sendC(${p.id})"><button onclick="sendC(${p.id})">Envoyer</button></div></div>`:'';
  return `<article class="post">
  <div class="post-head"><div class="ava">${esc(p.seller[0])}</div>
    <div class="who"><b onclick="openSeller(this.dataset.s)" data-s="${esc(p.seller)}">${esc(p.seller)}</b><small>${own?'Votre annonce · ':''}${esc(p.cat)}</small></div>
    ${own?'':`<button class="btn-follow ${f?'on':''}" onclick="follow(this.dataset.s)" data-s="${esc(p.seller)}">${f?'Suivi':'Suivre'}</button>`}</div>
  <div class="post-text">${esc(p.text||'Nouveau produit disponible !')}</div>
  ${pics}
  <div class="post-prod">${has?'':ph(p)}<div class="info"><div class="nm">${esc(p.name)}</div><div class="pr">${p.price}π <span>/${esc(p.unit)}</span></div></div>
    <button class="btn-buy" onclick="openBuy(${p.id})">Commander</button></div>
  <div class="actions">
    <button class="${l?'liked':''}" onclick="like(${p.id})">${l?'Aimé':"J'aime"}</button>
    ${p.remote?`<button onclick="togC(${p.id})">Commenter${n?' ('+n+')':''}</button>`:''}
    <button onclick="wa('${p.id}')">Contacter</button>
    <button onclick="share(${p.id})">Partager</button></div>
  ${cmts}</article>`;
}
window.renderFeed=function(){
  const posts=all().filter(p=>p.remote||p.text).slice(0,40);
  document.getElementById('feed').innerHTML=posts.length?posts.map(card).join(''):'<div class="empty">Aucune publication pour le moment. Publiez votre premier produit.</div>';
};
window.togC=function(id){OPEN[id]=!OPEN[id];renderFeed();if(OPEN[id])setTimeout(()=>{const i=document.getElementById('ci-'+id);i&&i.focus()},60)};
window.sendC=async function(id){
  const inp=document.getElementById('ci-'+id),t=inp?inp.value.trim():'',p=all().find(x=>x.id===id);
  if(!t||!p)return;
  if(!user){toast("Connectez-vous d'abord avec Pi");return}
  try{await post('commentaires',{annonce_id:p.rid,auteur:user.username,texte:t.slice(0,300)})}catch(e){console.warn(e);toast('Commentaire non envoyé. Réessayez.');return}
  await loadRemote();setTimeout(()=>{const i=document.getElementById('ci-'+id);i&&i.focus()},60);
};

window.wa=function(id){
  const p=id?all().find(x=>x.id==id):null;
  const s=p?p.seller:curSeller, any=s&&all().find(x=>x.seller===s&&x.wa);
  const num=(p&&p.wa)||(any&&any.wa)||DEFWA;
  const t=p?`Bonjour, je suis intéressé par « ${p.name} » sur AGROSSIGNOL.`:'Bonjour, je vous contacte depuis AGROSSIGNOL.';
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(t),'_blank');
};

const modal=document.querySelector('#o-pub .modal');
modal.querySelector('.btn-confirm').insertAdjacentHTML('beforebegin',
 `<label for="f-wa">Votre numéro WhatsApp</label><input id="f-wa" type="tel" inputmode="tel" placeholder="6XX XXX XXX">
  <label for="f-ph">Photos (4 maximum)</label><label class="addph" for="f-ph">Ajouter des photos</label>
  <input id="f-ph" type="file" accept="image/*" multiple hidden><div id="f-thumbs"></div>`);
function thumbs(){document.getElementById('f-thumbs').innerHTML=picked.map((f,i)=>`<div class="th"><img alt="" src="${URL.createObjectURL(f)}"><button type="button" aria-label="Retirer la photo" onclick="rmPh(${i})">×</button></div>`).join('')}
window.rmPh=function(i){picked.splice(i,1);thumbs()};
const fi=document.getElementById('f-ph');
fi.addEventListener('change',()=>{for(const f of fi.files){if(picked.length<4&&/^image\//.test(f.type))picked.push(f)}fi.value='';thumbs()});

const _op=window.openPublish;
window.openPublish=function(){_op();try{const w=localStorage.getItem('agro_wa');if(w&&!document.getElementById('f-wa').value)document.getElementById('f-wa').value=w}catch(e){}};

window.publish=async function(){
  if(busy)return;
  const nm=f_nm.value.trim(),pr=parseFloat(f_pr.value),un=f_un.value.trim()||'unité',ct=f_ct.value,tx=f_tx.value.trim(),w=waNum(document.getElementById('f-wa').value);
  if(!nm||isNaN(pr)||pr<0){toast('Indiquez le nom et le prix du produit');return}
  if(!w){toast('Indiquez un numéro WhatsApp valide');return}
  if(!user){toast("Connectez-vous d'abord avec Pi");return}
  busy=true;const btn=document.querySelector('#o-pub .btn-confirm');btn.textContent='Publication en cours…';btn.disabled=true;
  try{
    const urls=[];for(const f of picked)urls.push(await upload(f));
    await post('annonces',{vendeur:user.username,whatsapp:w,nom:nm,prix:pr,unite:un,categorie:ct,description:tx,photos:urls});
    try{localStorage.setItem('agro_wa',w)}catch(e){}
    f_nm.value=f_pr.value=f_un.value=f_tx.value='';picked=[];thumbs();
    closeAll();go('feed');await loadRemote();toast('Produit publié');
  }catch(e){console.warn(e);toast('Publication impossible. Vérifiez votre connexion et réessayez.')}
  busy=false;btn.textContent='Publier';btn.disabled=false;
};

loadRemote();
setInterval(()=>{const a=document.activeElement;if(document.hidden||busy||(a&&a.tagName==='INPUT'))return;loadRemote()},60000);
})();
