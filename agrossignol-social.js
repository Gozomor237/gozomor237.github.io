/* AGROSSIGNOL - Publications, photos, commentaires et achat (Supabase)
   Version 4 : catégories, Marché alimenté par les vraies annonces, démo masquée.
   Réutilise le paiement Pi existant de index.html (pay). Ne touche ni au Pi SDK, ni au backend, ni au diagnostic IA. */
(function () {
  'use strict';

  var SB_URL = 'https://ymndoorshmmigbrzisav.supabase.co';
  var SB_KEY = 'sb_publishable_OlIbCWjQlDwI1FIsrVq4Pw_yPLeSd5H';
  var BUCKET = 'photos';
  var MAX_PH = 4;
  var FCFA_PAR_PI = 500; /* repère indicatif provisoire, à remplacer par un vrai taux */
  var picked = [];
  var ROWS = {};
  var ANN = [];
  var CATS_DEF = ['légumes','fruits','céréales','élevage','vétérinaire','ingrédients','concentrés','intrants','matériel','épices'];
  function catList() { try { if (typeof CATS !== 'undefined') return Object.keys(CATS); } catch (e) {} return CATS_DEF; }

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
  function fmtPi(v) { return Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 4 }); }
  function say(m) { try { if (typeof toast === 'function') toast(m); else alert(m); } catch (e) {} }

  /* Compte Pi connecté (défini dans index.html après la connexion Pi) */
  function piUser() {
    try { if (typeof user !== 'undefined' && user) return user; } catch (e) {}
    return null;
  }

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
      '.ags-th{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}' +
      '.ags-t{font-weight:700;font-size:19px;color:#1f5130;margin:0 0 2px}' +
      '.ags-badge{flex-shrink:0;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;background:#e6f0e4;color:#1f5130}' +
      '.ags-badge.off{background:#f6e0d8;color:#a33a1a}' +
      '.ags-by{font-size:13px;color:#6b6b5e;margin:0 0 6px}' +
      '.ags-pr{color:#1f5130;font-weight:800;font-size:24px;margin-top:4px}' +
      '.ags-pr small{font-size:14px;font-weight:400;color:#6b6b5e}' +
      '.ags-fcfa{font-size:13px;color:#6b6b5e;margin:0 0 6px}' +
      '.ags-old{font-size:13px;color:#6b6b5e;margin:2px 0}' +
      '.ags-stock{font-size:14px;color:#1f5130;margin:2px 0}' +
      '.ags-m{font-size:14px;color:#6b6b5e;margin:2px 0 8px}' +
      '.ags-d{font-size:14px;line-height:1.45;margin:0 0 10px;white-space:pre-wrap}' +
      '.ags-row{display:flex;gap:8px;margin-top:8px}' +
      '.ags-btn{flex:1;border:0;border-radius:12px;padding:12px;font:700 14px system-ui,sans-serif;text-align:center;text-decoration:none;display:block}' +
      '.ags-buy{width:100%;background:#1f5130;color:#fff;font-size:16px;padding:14px}' +
      '.ags-wa{background:#fff;color:#1f5130;border:2px solid #1f5130}' +
      '.ags-cm{background:#f3edda;color:#1f5130}' +
      '.ags-cbox{display:none;border-top:1px solid #eee;padding:10px 14px;background:#faf5e9}' +
      '.ags-cbox.on{display:block}' +
      '.ags-c{font-size:14px;margin:0 0 8px}' +
      '.ags-c b{color:#1f5130}' +
      '.ags-in{width:100%;box-sizing:border-box;border:1px solid #d8d0b8;border-radius:10px;padding:10px;font:15px system-ui,sans-serif;margin-bottom:8px;background:#fff}' +
      '.ags-2{display:flex;gap:8px}.ags-2>div{flex:1;min-width:0}' +
      '.ags-hint{font-size:12px;color:#6b6b5e;margin:-4px 0 8px}' +
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
    s.textContent += '@media(max-width:639px){#grid{grid-template-columns:1fr}}#grid .ags-card{margin-bottom:0}' +
      /* Messages : en haut de l'écran, jamais sur la barre du bas */
      '#toast{top:76px;bottom:auto;width:max-content;max-width:88vw;opacity:0;pointer-events:none;transform:translateX(-50%) translateY(-16px);transition:transform .3s,opacity .3s}' +
      '#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
      /* Signal violet : utilisateur connecté avec Pi */
      'nav.bottom button[data-v="me"]{position:relative}' +
      '.ags-live{position:absolute;top:9px;left:calc(50% + 9px);width:12px;height:12px;border-radius:50%;background:#8b3fd9;border:2px solid #fff;animation:agspulse 2s infinite}' +
      '@keyframes agspulse{0%{box-shadow:0 0 0 0 rgba(139,63,217,.55)}70%{box-shadow:0 0 0 8px rgba(139,63,217,0)}100%{box-shadow:0 0 0 0 rgba(139,63,217,0)}}' +
      '@media(prefers-reduced-motion:reduce){.ags-live{animation:none}#toast{transition:none}}';
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
      '<label>Catégorie *</label><select class="ags-in" id="ags-ca"></select>' +
      '<label>Description</label><textarea class="ags-in" id="ags-de" rows="3" maxlength="600" placeholder="Qualité, quantité, disponibilité..."></textarea>' +
      '<div class="ags-2">' +
      '<div><label>Prix en π *</label><input class="ags-in" id="ags-pi" type="text" inputmode="decimal" placeholder="Ex : 0.5"></div>' +
      '<div><label>Par unité *</label><input class="ags-in" id="ags-un" maxlength="20" placeholder="kg, sac, panier"></div>' +
      '</div>' +
      '<div class="ags-hint">Le prix en π est le montant payé par l\'acheteur.</div>' +
      '<label>Stock disponible *</label><input class="ags-in" id="ags-st" type="text" inputmode="numeric" placeholder="Ex : 20">' +
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
    var u = piUser();
    var piNom = u && u.username ? u.username : '';
    $('#ags-ve').value = $('#ags-ve').value || store('ags_nom') || piNom;
    $('#ags-wa').value = $('#ags-wa').value || store('ags_wa');
    $('#ags-ca').innerHTML = '<option value="">Choisir une catégorie</option>' + catList().map(function (k) { return '<option value="' + esc(k) + '">' + esc(k) + '</option>'; }).join('');
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
    var piTxt = $('#ags-pi').value.trim().replace(',', '.');
    var piVal = parseFloat(piTxt);
    var unite = $('#ags-un').value.trim();
    var stockTxt = $('#ags-st').value.trim();
    var stock = parseInt(stockTxt, 10);

    if (!titre) return msg('Entrez le titre du produit.', 'err');
    if (!/^\d+(\.\d{1,4})?$/.test(piTxt) || !(piVal > 0)) return msg('Entrez un prix en π valide (ex : 0.5).', 'err');
    if (!unite) return msg('Indiquez l\'unité (kg, sac, panier...).', 'err');
    if (!/^\d+$/.test(stockTxt) || !(stock >= 1)) return msg('Indiquez le stock disponible (un nombre, 1 ou plus).', 'err');
    if (!vendeur) return msg('Entrez votre nom.', 'err');
    if (wa.length < 9) return msg('Entrez un numéro WhatsApp valide.', 'err');

    var categorie = $('#ags-ca').value;
    if (!categorie) return msg('Choisissez une catégorie.', 'err');

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
      var u = piUser();
      return api('/rest/v1/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          titre: titre,
          categorie: categorie,
          description: $('#ags-de').value.trim(),
          prix: null,
          prix_pi: piVal,
          unite: unite,
          stock: stock,
          localite: $('#ags-lo').value.trim(),
          vendeur: vendeur,
          vendeur_pi: u && u.username ? u.username : null,
          vendeur_uid: u && u.uid ? u.uid : null,
          whatsapp: wa,
          photos: urls
        })
      });
    }).then(function () {
      store('ags_nom', vendeur);
      store('ags_wa', wa);
      picked = [];
      thumbs();
      ['ags-ti', 'ags-de', 'ags-pi', 'ags-un', 'ags-st', 'ags-lo'].forEach(function (id) { $('#' + id).value = ''; });
      $('#ags-ca').value = '';
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

  function canBuy(a) {
    return a.prix_pi != null && Number(a.prix_pi) > 0 && (a.stock == null || Number(a.stock) >= 1);
  }

  function priceBlock(a) {
    if (a.prix_pi != null) {
      var u = a.unite ? ' <small>/ ' + esc(a.unite) + '</small>' : '';
      var fcfa = Math.round(Number(a.prix_pi) * FCFA_PAR_PI);
      var st = a.stock != null ? '<div class="ags-stock">Quantité disponible : ' + esc(a.stock) + (a.unite ? ' ' + esc(a.unite) : '') + '</div>' : '';
      return '<div class="ags-pr">' + esc(fmtPi(a.prix_pi)) + ' π' + u + '</div>' +
        '<div class="ags-fcfa">≈ ' + esc(fcfa.toLocaleString('fr-FR')) + ' FCFA (repère indicatif)</div>' + st;
    }
    /* Anciennes annonces : prix en FCFA seulement, en attente d'un prix en π */
    var old = a.prix != null ? '<div class="ags-old">Ancien prix : ' + esc(Number(a.prix).toLocaleString('fr-FR')) + ' FCFA</div>' : '';
    return old + '<div class="ags-old">Prix en π à définir par le vendeur.</div>';
  }

  function card(a) {
    ROWS[a.id] = a;
    var ph = Array.isArray(a.photos) ? a.photos : [];
    var imgs = ph.length
      ? '<div class="ags-ph">' + ph.map(function (u) { return '<img loading="lazy" alt="" src="' + esc(u) + '">'; }).join('') + '</div>'
      : '';
    var date = a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '';
    var meta = [a.localite, date].filter(Boolean).map(esc).join(' · ');
    var txt = encodeURIComponent('Bonjour, je suis intéressé(e) par votre annonce AGROSSIGNOL : ' + (a.titre || ''));
    var badge = '';
    if (a.prix_pi != null) {
      badge = (a.stock != null && Number(a.stock) < 1)
        ? '<span class="ags-badge off">Épuisé</span>'
        : '<span class="ags-badge">Disponible</span>';
    }
    return '<div class="ags-card" data-id="' + esc(a.id) + '">' + imgs +
      '<div class="ags-b">' +
      '<div class="ags-th"><p class="ags-t">' + esc(a.titre) + '</p>' + badge + '</div>' +
      '<div class="ags-by">Publié par : ' + esc(a.vendeur) + '</div>' +
      priceBlock(a) +
      (meta ? '<div class="ags-m">' + meta + '</div>' : '') +
      (a.description ? '<p class="ags-d">' + esc(a.description) + '</p>' : '') +
      (canBuy(a) ? '<button type="button" class="ags-btn ags-buy" data-act="buy">Acheter maintenant</button>' : '') +
      '<div class="ags-row">' +
      '<a class="ags-btn ags-wa" target="_blank" rel="noopener" href="https://wa.me/' + esc(waNum(a.whatsapp)) + '?text=' + txt + '">Contacter le vendeur</a>' +
      '<button type="button" class="ags-btn ags-cm" data-act="cm">Commenter</button>' +
      '</div></div>' +
      '<div class="ags-cbox"></div></div>';
  }

  function loadFeed() {
    var f = feedBox();
    api('/rest/v1/annonces?select=*&order=created_at.desc&limit=30').then(function (rows) {
      rows = rows || [];
      ROWS = {};
      ANN = rows;
      f.innerHTML = '<h2>Annonces des vendeurs</h2>' +
        (rows.length ? rows.map(card).join('') : '<p style="padding:8px 4px">Aucune annonce pour le moment. Soyez le premier à publier !</p>');
      renderMarketAnn();
    }).catch(function (e) {
      f.innerHTML = '<p style="padding:8px 4px;color:#c0392b">Impossible de charger les annonces : ' + esc(e.message) + '</p>';
    });
  }

  /* ---------- Achat : réutilise la fenêtre et le paiement Pi de index.html ---------- */
  function buy(a) {
    if (!a || !canBuy(a)) return say('Cette annonce n\'est pas disponible à l\'achat.');
    var u = piUser();
    if (u && a.vendeur_uid && u.uid === a.vendeur_uid) return say('Vous ne pouvez pas acheter votre propre annonce.');
    try {
      closeAll();
      cur = { id: a.id, name: a.titre, price: Number(a.prix_pi), seller: a.vendeur, cat: '', unit: a.unite || '' };
      var photo = Array.isArray(a.photos) && a.photos.length ? a.photos[0] : '';
      b_em.innerHTML = '<div class="ph" data-i="' + esc((a.titre || '?').charAt(0).toUpperCase()) + '">' +
        (photo ? '<img alt="" src="' + esc(photo) + '">' : '') + '</div>';
      b_nm.textContent = a.titre;
      b_sl.textContent = a.vendeur + (a.localite ? ' · ' + a.localite : '');
      b_pr.textContent = fmtPi(a.prix_pi) + 'π';
      o_buy.classList.add('open');
    } catch (e) {
      console.error('AGROSSIGNOL achat :', e);
      say('Achat indisponible sur cette page. Rechargez et réessayez.');
    }
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

    if (act === 'buy') {
      buy(ROWS[id]);
      return;
    }
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

  /* ---------- Marché : vraies annonces par catégorie ---------- */
  function renderMarketAnn() {
    var g = document.getElementById('grid');
    if (!g) return;
    var c = 'all';
    try { c = cat; } catch (e) {}
    var qe = document.getElementById('q');
    var q = norm(qe ? qe.value : '').trim();
    var l = ANN.filter(function (a) {
      if (q) {
        /* Une recherche porte sur toutes les catégories */
        return norm([a.titre, a.vendeur, a.vendeur_pi, a.localite, a.description, a.categorie].join(' ')).indexOf(q) > -1;
      }
      return c === 'all' || a.categorie === c;
    });
    g.innerHTML = l.length ? l.map(card).join('')
      : '<div class="empty">' + (q ? 'Aucun résultat pour cette recherche.' : 'Aucune annonce dans cette catégorie pour le moment. Soyez le premier à publier !') + '</div>';
  }

  /* Recherche sans accents ni majuscules (mais = maïs) */
  function norm(t) {
    return String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /* Barre de recherche de l'accueil : cherche dans toutes les annonces */
  function homeSearch() {
    var h = document.getElementById('hq'), q = document.getElementById('q');
    if (q && h) q.value = h.value;
    try { cat = 'all'; } catch (e) {}
    try { renderChips(); } catch (e) {}
    try { go('market'); } catch (e) {}
    renderMarketAnn();
  }

  /* ---------- Signal violet à côté de Profil quand on est connecté ---------- */
  function syncConn() {
    var b = document.querySelector('nav.bottom button[data-v="me"]');
    if (!b) return;
    var on = !!piUser();
    var d = b.querySelector('.ags-live');
    if (on && !d) {
      d = document.createElement('span');
      d.className = 'ags-live';
      d.setAttribute('role', 'img');
      d.setAttribute('aria-label', 'Connecté avec Pi');
      b.appendChild(d);
    } else if (!on && d) {
      d.remove();
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
      var gr = document.getElementById('grid');
      if (gr) gr.addEventListener('click', onFeedClick);
      /* Masque le catalogue de démonstration de l'accueil */
      var old = document.getElementById('feed');
      if (old) old.style.display = 'none';
      var st = document.getElementById('stories');
      if (st) st.style.display = 'none';
      [].slice.call(document.querySelectorAll('#v-feed h2')).forEach(function (h) {
        if (h.textContent.indexOf('Dernières annonces') > -1) h.style.display = 'none';
      });
      loadFeed();
      syncConn();
      setInterval(syncConn, 1000);
    } catch (e) {
      console.error('AGROSSIGNOL social :', e);
    }
  }

  window.renderMarket = renderMarketAnn;
  window.hs = homeSearch;
  window.openPublish = openPublish;
  window.agsRefreshFeed = loadFeed;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
