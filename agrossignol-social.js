/* AGROSSIGNOL - Publications, photos et commentaires (Supabase)
   Fichier autonome : ne touche ni au Pi SDK, ni aux paiements, ni au diagnostic IA. */
(function () {
  'use strict';

  var SB_URL = 'https://ymndoorshmmigbrzisav.supabase.co';
  var SB_KEY = 'sb_publishable_OlIbCWjQlDwI1FIsrVq4Pw_yPLeSd5H';
  var BUCKET = 'photos';
  var MAX_PH = 4;
  var picked = [];

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function waNum(n) {
    var d = String(n || '').replace(/\D/g, '');
    if (d.length === 9 && d.charAt(0) === '6') d = '237' + d;
    return d;
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; localStorage.setItem(k, v); } catch (e) { return ''; } }

  /* ---------- Appels Supabase ---------- */
  function api(path, opt) {
    opt = opt || {};
    var h = { apikey: SB_KEY };
    for (var k in (opt.headers || {})) h[k] = opt.headers[k];
    opt.headers = h;
    return fetch(SB_URL + path, opt).then(function (r) {
      if (r.ok) return r.status === 204 ? null : r.json().catch(function () { return null; });
      return r.text().then(function (t) {
        var m = t;
        try { m = JSON.parse(t).message || t; } catch (e) {}
        throw new Error(m || ('Erreur ' + r.status));
      });
    });
  }

  function compress(file) {
    return new Promise(function (res, rej) {
      var img = new Image();
      var u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 1200 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Photo illisible')); }, 'image/jpeg', 0.8);
      };
      img.onerror = function () { rej(new Error('Photo illisible')); };
      img.src = u;
    });
  }

  function upload(blob) {
    var name = 'p/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    return api('/storage/v1/object/' + BUCKET + '/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: blob
    }).then(function () {
      return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + name;
    });
  }

  /* ---------- Styles ---------- */
  function addStyles() {
    if ($('#ags-style')) return;
    var s = document.createElement('style');
    s.id = 'ags-style';
    s.textContent =
      '#ags-fab{position:fixed;right:16px;bottom:84px;z-index:9990;background:#e8803a;color:#fff;border:0;border-radius:28px;padding:13px 20px;font:700 15px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
      '#social-feed{margin-bottom:18px;color:#1b1b1b}' +
      '.ags-card{background:#fff;border:1px solid #e6dfcc;border-radius:14px;margin-bottom:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06)}' +
      '.ags-ph{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;background:#f3edda}' +
      '.ags-ph img{flex:0 0 100%;width:100%;max-height:300px;object-fit:cover;scroll-snap-align:start}' +
      '.ags-b{padding:12px 14px}' +
      '.ags-t{font-weight:700;font-size:17px;color:#1f5130;margin:0 0 4px}' +
      '.ags-pr{color:#e8803a;font-weight:700;font-size:16px}' +
      '.ags-m{font-size:13px;color:#6b6b5e;margin:2px 0 8px}' +
      '.ags-d{font-size:14px;line-height:1.45;margin:0 0 10px;white-space:pre-wrap}' +
      '.ags-row{display:flex;gap:8px}' +
      '.ags-btn{flex:1;border:0;border-radius:10px;padding:11px;font:700 14px system-ui,sans-serif;text-align:center;text-decoration:none;display:block}' +
      '.ags-wa{background:#1f9d55;color:#fff}' +
      '.ags-cm{background:#f3edda;color:#1f5130}' +
      '.ags-cbox{display:none;border-top:1px solid #eee;padding:10px 14px;background:#faf5e9}' +
      '.ags-cbox.on{display:block}' +
      '.ags-c{font-size:14px;margin:0 0 8px}' +
      '.ags-c b{color:#1f5130}' +
      '.ags-in{width:100%;box-sizing:border-box;border:1px solid #d8d0b8;border-radius:10px;padding:10px;font:15px system-ui,sans-serif;margin-bottom:8px;background:#fff}' +
      '#ags-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9995;display:none;align-items:flex-end;justify-content:center}' +
      '#ags-ov.on{display:flex}' +
      '#ags-box{background:#faf5e9;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;border-radius:18px 18px 0 0;padding:16px;box-sizing:border-box;font-family:system-ui,sans-serif}' +
      '#ags-box h3{margin:0 0 12px;color:#1f5130}' +
      '#ags-box label{display:block;font-size:13px;font-weight:700;color:#1f5130;margin:0 0 4px}' +
      '#ags-th{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}' +
      '#ags-th div{position:relative;width:72px;height:72px}' +
      '#ags-th img{width:72px;height:72px;object-fit:cover;border-radius:8px}' +
      '#ags-th button{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:0;background:#c0392b;color:#fff;font-size:13px;line-height:22px;padding:0}' +
      '#ags-msg{font-size:14px;margin:6px 0;min-height:18px}' +
      '#ags-msg.err{color:#c0392b}#ags-msg.ok{color:#1f9d55}' +
      '.ags-go{background:#1f5130;color:#fff;border:0;border-radius:12px;padding:14px;width:100%;font:700 16px system-ui,sans-serif}' +
      '.ags-x{background:none;border:0;color:#6b6b5e;width:100%;padding:12px;font:15px system-ui,sans-serif}';
    document.head.appendChild(s);
  }

  /* ---------- Fenêtre de publication ---------- */
  function buildModal() {
    if ($('#ags-ov')) return;
    var o = document.createElement('div');
    o.id = 'ags-ov';
    o.innerHTML =
      '<div id="ags-box">' +
      '<h3>Publier une annonce</h3>' +
      '<label>Titre du produit *</label><input class="ags-in" id="ags-ti" maxlength="80" placeholder="Ex : Maïs frais, sac de 50 kg">' +
      '<label>Description</label><textarea class="ags-in" id="ags-de" rows="3" maxlength="600" placeholder="Qualité, quantité, disponibilité..."></textarea>' +
      '<label>Prix (FCFA)</label><input class="ags-in" id="ags-pr" type="number" inputmode="numeric" placeholder="Ex : 15000">' +
      '<label>Localité</label><input class="ags-in" id="ags-lo" maxlength="60" placeholder="Ex : Maroua">' +
      '<label>Votre nom *</label><input class="ags-in" id="ags-ve" maxlength="60">' +
      '<label>Numéro WhatsApp *</label><input class="ags-in" id="ags-wa" type="tel" inputmode="tel" placeholder="Ex : 6XXXXXXXX">' +
      '<label>Photos (jusqu\'à ' + MAX_PH + ')</label>' +
      '<div id="ags-th"></div>' +
      '<input id="ags-f" type="file" accept="image/*" multiple style="display:none">' +
      '<button type="button" class="ags-btn ags-cm" id="ags-addph" style="margin-bottom:12px">Ajouter des photos</button>' +
      '<div id="ags-msg"></div>' +
      '<button type="button" class="ags-go" id="ags-send">Publier</button>' +
      '<button type="button" class="ags-x" id="ags-close">Annuler</button>' +
      '</div>';
    document.body.appendChild(o);

    $('#ags-close').onclick = closePublish;
    o.addEventListener('click', function (e) { if (e.target === o) closePublish(); });
    $('#ags-addph').onclick = function () { $('#ags-f').click(); };
    $('#ags-f').addEventListener('change', function (e) {
      var files = Array.prototype.slice.call(e.target.files || []);
      files.forEach(function (f) { if (picked.length < MAX_PH) picked.push(f); });
      e.target.value = '';
      thumbs();
    });
    $('#ags-th').addEventListener('click', function (e) {
      var i = e.target.getAttribute && e.target.getAttribute('data-rm');
      if (i !== null && i !== undefined) { picked.splice(parseInt(i, 10), 1); thumbs(); }
    });
    $('#ags-send').onclick = publish;
  }

  function thumbs() {
    var box = $('#ags-th');
    box.innerHTML = '';
    picked.forEach(function (f, i) {
      var d = document.createElement('div');
      var im = document.createElement('img');
      im.src = URL.createObjectURL(f);
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'x';
      b.setAttribute('data-rm', i);
      d.appendChild(im);
      d.appendChild(b);
      box.appendChild(d);
    });
  }

  function msg(t, cls) {
    var m = $('#ags-msg');
    m.className = cls || '';
    m.textContent = t || '';
  }

  function openPublish() {
    addStyles();
    buildModal();
    var piNom = '';
    try { if (typeof user !== 'undefined' && user && user.username) piNom = user.username; } catch (e) {}
    $('#ags-ve').value = $('#ags-ve').value || store('ags_nom') || piNom;
    $('#ags-wa').value = $('#ags-wa').value || store('ags_wa');
    msg('');
    $('#ags-ov').classList.add('on');
  }

  function closePublish() {
    var o = $('#ags-ov');
    if (o) o.classList.remove('on');
  }

  function publish() {
    var titre = $('#ags-ti').value.trim();
    var vendeur = $('#ags-ve').value.trim();
    var wa = waNum($('#ags-wa').value);
    if (!titre) return msg('Entrez le titre du produit.', 'err');
    if (!vendeur) return msg('Entrez votre nom.', 'err');
    if (wa.length < 9) return msg('Entrez un numéro WhatsApp valide.', 'err');

    var btn = $('#ags-send');
    btn.disabled = true;
    msg('Envoi en cours, patientez...');

    var files = picked.slice();
    var chain = Promise.resolve([]);
    files.forEach(function (f) {
      chain = chain.then(function (urls) {
        return compress(f).then(upload).then(function (u) { urls.push(u); return urls; });
      });
    });

    chain.then(function (urls) {
      var prix = parseInt($('#ags-pr').value, 10);
      return api('/rest/v1/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          titre: titre,
          description: $('#ags-de').value.trim(),
          prix: isNaN(prix) ? null : prix,
          localite: $('#ags-lo').value.trim(),
          vendeur: vendeur,
          whatsapp: wa,
          photos: urls
        })
      });
    }).then(function () {
      store('ags_nom', vendeur);
      store('ags_wa', wa);
      picked = [];
      thumbs();
      ['ags-ti', 'ags-de', 'ags-pr', 'ags-lo'].forEach(function (id) { $('#' + id).value = ''; });
      msg('Annonce publiée !', 'ok');
      btn.disabled = false;
      loadFeed();
      setTimeout(closePublish, 900);
    }).catch(function (e) {
      btn.disabled = false;
      msg('Erreur : ' + e.message, 'err');
    });
  }

  /* ---------- Fil des annonces ---------- */
  function feedBox() {
    var f = $('#social-feed');
    if (!f) {
      f = document.createElement('div');
      f.id = 'social-feed';
      document.body.appendChild(f);
    }
    f.classList.add('ags-wrap');
    f.id = 'social-feed';
    return f;
  }

  function card(a) {
    var ph = Array.isArray(a.photos) ? a.photos : [];
    var imgs = ph.length
      ? '<div class="ags-ph">' + ph.map(function (u) { return '<img loading="lazy" alt="" src="' + esc(u) + '">'; }).join('') + '</div>'
      : '';
    var prix = a.prix != null ? '<div class="ags-pr">' + esc(Number(a.prix).toLocaleString('fr-FR')) + ' FCFA</div>' : '';
    var date = a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '';
    var meta = [a.vendeur, a.localite, date].filter(Boolean).map(esc).join(' · ');
    var txt = encodeURIComponent('Bonjour, je suis intéressé(e) par votre annonce AGROSSIGNOL : ' + (a.titre || ''));
    return '<div class="ags-card" data-id="' + esc(a.id) + '">' + imgs +
      '<div class="ags-b"><p class="ags-t">' + esc(a.titre) + '</p>' + prix +
      '<div class="ags-m">' + meta + '</div>' +
      (a.description ? '<p class="ags-d">' + esc(a.description) + '</p>' : '') +
      '<div class="ags-row">' +
      '<button type="button" class="ags-btn ags-cm" data-act="cm">Commenter</button>' +
      '<a class="ags-btn ags-wa" target="_blank" rel="noopener" href="https://wa.me/' + esc(waNum(a.whatsapp)) + '?text=' + txt + '">WhatsApp</a>' +
      '</div></div>' +
      '<div class="ags-cbox"></div></div>';
  }

  function loadFeed() {
    var f = feedBox();
    api('/rest/v1/annonces?select=*&order=created_at.desc&limit=30').then(function (rows) {
      rows = rows || [];
      f.innerHTML = '<h2>Annonces des vendeurs</h2>' +
        (rows.length ? rows.map(card).join('') : '<p style="padding:8px 4px">Aucune annonce pour le moment. Soyez le premier à publier !</p>');
    }).catch(function (e) {
      f.innerHTML = '<p style="padding:8px 4px;color:#c0392b">Impossible de charger les annonces : ' + esc(e.message) + '</p>';
    });
  }

  function renderComments(box, id) {
    api('/rest/v1/commentaires?select=*&annonce_id=eq.' + encodeURIComponent(id) + '&order=created_at.asc').then(function (rows) {
      rows = rows || [];
      box.innerHTML =
        rows.map(function (c) { return '<p class="ags-c"><b>' + esc(c.auteur) + '</b> : ' + esc(c.texte) + '</p>'; }).join('') +
        (rows.length ? '' : '<p class="ags-c">Aucun commentaire pour le moment.</p>') +
        '<input class="ags-in" data-f="au" maxlength="60" placeholder="Votre nom" value="' + esc(store('ags_nom')) + '">' +
        '<input class="ags-in" data-f="tx" maxlength="400" placeholder="Votre commentaire">' +
        '<button type="button" class="ags-btn ags-cm" data-act="send">Envoyer</button>' +
        '<div class="ags-m" data-f="er" style="color:#c0392b"></div>';
    }).catch(function (e) {
      box.innerHTML = '<p class="ags-c" style="color:#c0392b">Erreur : ' + esc(e.message) + '</p>';
    });
  }

  function onFeedClick(e) {
    var t = e.target;
    var act = t.getAttribute && t.getAttribute('data-act');
    if (!act) return;
    var card = t.closest('.ags-card');
    if (!card) return;
    var id = card.getAttribute('data-id');
    var box = card.querySelector('.ags-cbox');

    if (act === 'cm') {
      var on = box.classList.toggle('on');
      if (on) renderComments(box, id);
      return;
    }
    if (act === 'send') {
      var au = box.querySelector('[data-f="au"]').value.trim();
      var tx = box.querySelector('[data-f="tx"]').value.trim();
      var er = box.querySelector('[data-f="er"]');
      if (!au || !tx) { er.textContent = 'Entrez votre nom et votre commentaire.'; return; }
      t.disabled = true;
      api('/rest/v1/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ annonce_id: id, auteur: au, texte: tx })
      }).then(function () {
        store('ags_nom', au);
        renderComments(box, id);
      }).catch(function (x) {
        t.disabled = false;
        er.textContent = 'Erreur : ' + x.message;
      });
    }
  }

  /* ---------- Démarrage ---------- */
  function init() {
    try {
      addStyles();
      if (!$('#ags-fab') && !$('nav.bottom .pub')) {
        var b = document.createElement('button');
        b.id = 'ags-fab';
        b.type = 'button';
        b.textContent = '+ Publier';
        b.onclick = openPublish;
        document.body.appendChild(b);
      }
      feedBox().addEventListener('click', onFeedClick);
      loadFeed();
    } catch (e) {
      console.error('AGROSSIGNOL social :', e);
    }
  }

  window.openPublish = openPublish;
  window.agsRefreshFeed = loadFeed;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
/* === DIAGNOSTIC PAIEMENT (temporaire) === */
(function(){
  function boite(m){
    var d=document.createElement('div');
    d.style.cssText='position:fixed;left:10px;right:10px;top:70px;z-index:9999;background:#fff;border:3px solid #c4561a;border-radius:12px;padding:12px;font-size:14px;word-break:break-word';
    d.textContent=m+' (touchez pour fermer)';
    d.onclick=function(){d.remove()};
    document.body.appendChild(d);
  }
  window.pay=function(){
    if(!PI_OK){toast('Ouvrez AGROSSIGNOL dans Pi Browser pour payer');closeAll();return}
    if(!user){toast("Connectez-vous d'abord avec Pi");closeAll();return}
    var t0=Date.now();
    Pi.createPayment({amount:cur.price,memo:'Achat : '+cur.name+' sur Agrossignol',metadata:{productId:cur.id,seller:cur.seller}},{
      onReadyForServerApproval:async function(id){
        try{
          var r=await fetch(BACKEND+'/payment/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentId:id})});
          var tx=await r.text();
          boite('Approbation : HTTP '+r.status+' en '+(Date.now()-t0)+' ms. Reponse : '+tx.slice(0,250));
        }catch(e){
          boite('Approbation impossible : '+e.message);
        }
      },
      onReadyForServerCompletion:async function(id,txid){
        await fetch(BACKEND+'/payment/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentId:id,txid:txid})});
        closeAll();toast('Commande réussie, merci !');
      },
      onCancel:function(){closeAll();toast('Paiement annulé')},
      onError:function(e){closeAll();boite('Erreur Pi : '+e.message)}
    });
  };
})();
