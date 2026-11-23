/* AGROSSIGNOL - Profils publics : photo et nom des vendeurs visibles sur les annonces,
   fiche vendeur, et bouton « Modifier mon profil ».
   Fichier séparé : ne touche ni aux paiements, ni aux publications, ni au diagnostic. */
(function () {
  'use strict';

  var SB_URL = 'https://ymndoorshmmigbrzisav.supabase.co';
  var SB_KEY = 'sb_publishable_OlIbCWjQlDwI1FIsrVq4Pw_yPLeSd5H';
  var BACKEND = 'https://agrossignol-backend.vercel.app';
  var BUCKET = 'photos';

  var token = '';
  var me = null;            /* utilisateur Pi connecté (username, uid) */
  var P_UID = {};           /* profils par uid Pi */
  var P_NAME = {};          /* profils par pseudo Pi (minuscules) */
  var SELLERS = {};         /* annonce id -> vendeur */
  var tried = {};
  var newPhoto = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function say(m) { try { if (typeof toast === 'function') toast(m); else alert(m); } catch (e) {} }
  function fmtPi(v) { return Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 4 }); }

  /* ---------- Supabase (lecture publique et envoi de photo) ---------- */
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

  function loadCaches() {
    return Promise.all([
      api('/rest/v1/profils?select=*&limit=1000').catch(function () { return []; }),
      api('/rest/v1/annonces?select=id,vendeur,vendeur_pi,vendeur_uid&order=created_at.desc&limit=300').catch(function () { return []; })
    ]).then(function (r) {
      P_UID = {}; P_NAME = {}; SELLERS = {};
      (r[0] || []).forEach(function (p) {
        if (p.pi_uid) P_UID[p.pi_uid] = p;
        if (p.pi_username) P_NAME[String(p.pi_username).toLowerCase()] = p;
      });
      (r[1] || []).forEach(function (a) { SELLERS[String(a.id)] = a; });
    });
  }

  function profilDe(s) {
    if (!s) return null;
    return (s.vendeur_uid && P_UID[s.vendeur_uid]) ||
      (s.vendeur_pi && P_NAME[String(s.vendeur_pi).toLowerCase()]) || null;
  }
  function monProfil() {
    if (!me) return null;
    return (me.uid && P_UID[me.uid]) || (me.username && P_NAME[String(me.username).toLowerCase()]) || null;
  }

  /* ---------- Styles ---------- */
  function addStyles() {
    if ($('#agsp-style')) return;
    var s = document.createElement('style');
    s.id = 'agsp-style';
    s.textContent =
      '.agsp-av{border-radius:50%;object-fit:cover;display:inline-flex;align-items:center;justify-content:center;background:#2f7a57;color:#fff;font-weight:700;flex-shrink:0;overflow:hidden}' +
      '.ags-by[data-agsp-id]{display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px}' +
      '.ags-by[data-agsp-id] small{color:#c4561a;font-weight:700}' +
      '.agsp-line{display:flex;align-items:center;gap:8px}' +
      '.agsp-bio{font-size:.92rem;line-height:1.5;margin:10px 0;white-space:pre-wrap}' +
      '.agsp-meta{font-size:.82rem;color:#5f5f5f;margin:2px 0}' +
      '.agsp-err{color:#c0392b;font-size:.85rem;min-height:18px;margin-top:8px}' +
      '.agsp-ok{color:#1f9d55}';
    document.head.appendChild(s);
  }

  function avatar(p, nom, size) {
    var st = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.42) + 'px';
    if (p && p.photo_url) return '<img class="agsp-av" style="' + st + '" alt="" src="' + esc(p.photo_url) + '">';
    var ini = String(nom || '?').trim().charAt(0).toUpperCase() || '?';
    return '<span class="agsp-av" style="' + st + '">' + esc(ini) + '</span>';
  }

  /* ---------- Photo + nom sur chaque annonce ---------- */
  function decorate() {
    var cards = [].slice.call(document.querySelectorAll('.ags-card[data-id]:not([data-agsp])'));
    if (!cards.length) return;
    var manque = cards.some(function (c) {
      var id = c.getAttribute('data-id');
      return !SELLERS[id] && !tried[id];
    });
    if (manque) {
      cards.forEach(function (c) { tried[c.getAttribute('data-id')] = true; });
      loadCaches().then(decorate);
      return;
    }
    cards.forEach(function (c) {
      var id = c.getAttribute('data-id');
      c.setAttribute('data-agsp', '1');
      var by = c.querySelector('.ags-by');
      if (!by) return;
      var s = SELLERS[id];
      var p = profilDe(s);
      var nom = (p && p.nom) || (s && s.vendeur) || by.textContent.replace('Publié par :', '').trim();
      if (s && (s.vendeur_uid || s.vendeur_pi)) {
        by.setAttribute('data-agsp-id', id);
        by.innerHTML = avatar(p, nom, 30) + '<span>' + esc(nom) + '</span><small>Voir le profil</small>';
      } else {
        by.innerHTML = '<span>Publié par : ' + esc(nom) + '</span>';
      }
      if (estMienne(s)) {
        var zone = c.querySelector('.ags-b');
        if (zone && !zone.querySelector('[data-agsp-del]')) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ags-btn ags-cm';
          b.setAttribute('data-agsp-del', id);
          b.style.cssText = 'margin-top:8px;width:100%;color:#c0392b';
          b.textContent = 'Supprimer mon annonce';
          zone.appendChild(b);
        }
      }
    });
  }

  function redecorate() {
    [].forEach.call(document.querySelectorAll('.ags-card[data-agsp]'), function (c) { c.removeAttribute('data-agsp'); });
    decorate();
  }

  /* ---------- Fenêtres ---------- */
  function overlay(id) {
    var o = document.getElementById(id);
    if (!o) {
      o = document.createElement('div');
      o.className = 'ov';
      o.id = id;
      o.innerHTML = '<div class="modal"></div>';
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); });
      document.body.appendChild(o);
    }
    return o;
  }

  function ouvrirFiche(annonceId) {
    var s = SELLERS[annonceId];
    if (!s) return;
    var p = profilDe(s);
    var nom = (p && p.nom) || s.vendeur || 'Vendeur';
    var pseudo = (p && p.pi_username) || s.vendeur_pi || '';
    var o = overlay('o-fiche');
    var m = o.firstChild;
    var date = p && p.cree_le ? new Date(p.cree_le).toLocaleDateString('fr-FR') : '';
    m.innerHTML =
      '<div class="agsp-line">' + avatar(p, nom, 84) +
      '<div style="flex:1;min-width:0"><b style="font-size:1.2rem">' + esc(nom) + '</b>' +
      (pseudo ? '<div class="agsp-meta">@' + esc(pseudo) + ' · compte Pi</div>' : '') +
      ((p && p.localite) ? '<div class="agsp-meta">' + esc(p.localite) + '</div>' : '') +
      (date ? '<div class="agsp-meta">Profil créé le ' + esc(date) + '</div>' : '') +
      '</div></div>' +
      (p && p.bio ? '<p class="agsp-bio">' + esc(p.bio) + '</p>'
        : '<p class="agsp-bio" style="color:#5f5f5f">Ce vendeur n\'a pas encore ajouté de photo ni de présentation.</p>') +
      '<b>Annonces de ce vendeur</b><div id="agsp-list"><div class="agsp-meta" style="padding:10px 0">Chargement...</div></div>' +
      '<button type="button" class="btn-alt" id="agsp-close">Fermer</button>';
    $('#agsp-close', m).onclick = function () { o.classList.remove('open'); };
    if (typeof closeAll === 'function') closeAll();
    o.classList.add('open');

    var cond = [];
    if (s.vendeur_uid) cond.push('vendeur_uid.eq.' + encodeURIComponent(s.vendeur_uid));
    if (s.vendeur_pi) cond.push('vendeur_pi.eq.' + encodeURIComponent(s.vendeur_pi));
    if (!cond.length) { $('#agsp-list', m).innerHTML = ''; return; }
    api('/rest/v1/annonces?or=(' + cond.join(',') + ')&select=id,titre,prix_pi,unite&order=created_at.desc&limit=10')
      .then(function (rows) {
        rows = rows || [];
        $('#agsp-list', m).innerHTML = rows.length ? rows.map(function (a) {
          return '<div class="mini"><div class="info"><b>' + esc(a.titre) + '</b>' +
            (a.prix_pi != null ? '<div class="pr">' + esc(fmtPi(a.prix_pi)) + 'π <span>/ ' + esc(a.unite || 'unité') + '</span></div>' : '') +
            '</div></div>';
        }).join('') : '<div class="agsp-meta" style="padding:10px 0">Aucune annonce.</div>';
      })
      .catch(function () { $('#agsp-list', m).innerHTML = ''; });
  }

  /* ---------- Mon profil public (dans l'onglet Profil) ---------- */
  function panneau() {
    var v = document.getElementById('v-me');
    if (!v) return null;
    var p = document.getElementById('ags-profil');
    if (!p) {
      p = document.createElement('div');
      p.className = 'panel';
      p.id = 'ags-profil';
      var premier = v.querySelector('.panel');
      if (premier) premier.insertAdjacentElement('afterend', p); else v.appendChild(p);
      p.addEventListener('click', function (e) {
        if (e.target.getAttribute && e.target.getAttribute('data-act') === 'edit') ouvrirEdition();
      });
    }
    return p;
  }

  function renderMonProfil() {
    var p = panneau();
    if (!p) return;
    if (!me) {
      p.innerHTML = '<b>Mon profil public</b>' +
        '<div class="agsp-meta" style="padding:10px 0">Connectez-vous avec Pi pour ajouter votre photo et votre nom, visibles par les autres utilisateurs.</div>';
      return;
    }
    var pr = monProfil();
    var nom = (pr && pr.nom) || me.username;
    p.innerHTML = '<b>Mon profil public</b>' +
      '<div class="agsp-line" style="margin:10px 0">' + avatar(pr, nom, 56) +
      '<div style="flex:1;min-width:0"><b>' + esc(nom) + '</b><div class="agsp-meta">@' + esc(me.username) + '</div>' +
      ((pr && pr.localite) ? '<div class="agsp-meta">' + esc(pr.localite) + '</div>' : '') + '</div></div>' +
      (pr && pr.bio ? '<p class="agsp-bio">' + esc(pr.bio) + '</p>' : '') +
      '<button type="button" class="btn-main" style="margin-top:4px" data-act="edit">' + (pr ? 'Modifier mon profil' : 'Ajouter ma photo et mon nom') + '</button>';
  }

  function squareJpeg(file) {
    return new Promise(function (res, rej) {
      var img = new Image();
      var u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(img.width, img.height);
        var out = Math.min(480, s);
        var c = document.createElement('canvas');
        c.width = out; c.height = out;
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, out, out);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Photo illisible')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { rej(new Error('Photo illisible')); };
      img.src = u;
    });
  }

  function envoyerPhoto(blob) {
    var name = 'p/av-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    return api('/storage/v1/object/' + BUCKET + '/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: blob
    }).then(function () {
      return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + name;
    });
  }

  function ouvrirEdition() {
    if (!me || !token) { say('Connectez-vous d\'abord avec Pi.'); return; }
    var pr = monProfil() || {};
    newPhoto = null;
    var o = overlay('o-edit');
    var m = o.firstChild;
    m.innerHTML =
      '<h3>Mon profil public</h3>' +
      '<div class="agsp-line" style="margin-bottom:6px"><span id="agsp-prev">' + avatar(pr, pr.nom || me.username, 72) + '</span>' +
      '<button type="button" class="btn-follow" id="agsp-pick">Choisir une photo</button></div>' +
      '<input type="file" id="agsp-file" accept="image/*" style="display:none">' +
      '<label for="agsp-nom">Nom affiché</label><input id="agsp-nom" maxlength="60" value="' + esc(pr.nom || me.username) + '">' +
      '<label for="agsp-loc">Localité</label><input id="agsp-loc" maxlength="60" placeholder="Ex : Maroua" value="' + esc(pr.localite || '') + '">' +
      '<label for="agsp-bio">Présentation</label><textarea id="agsp-bio" rows="3" maxlength="300" placeholder="Qui êtes-vous ? Que vendez-vous ?">' + esc(pr.bio || '') + '</textarea>' +
      '<div class="agsp-err" id="agsp-msg"></div>' +
      '<button type="button" class="btn-confirm" id="agsp-save">Enregistrer</button>' +
      '<button type="button" class="btn-alt" id="agsp-cancel">Annuler</button>';

    $('#agsp-pick', m).onclick = function () { $('#agsp-file', m).click(); };
    $('#agsp-cancel', m).onclick = function () { o.classList.remove('open'); };
    $('#agsp-file', m).addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!f) return;
      newPhoto = f;
      $('#agsp-prev', m).innerHTML = '<img class="agsp-av" style="width:72px;height:72px" alt="" src="' + URL.createObjectURL(f) + '">';
    });
    $('#agsp-save', m).onclick = function () { enregistrer(m, o); };
    if (typeof closeAll === 'function') closeAll();
    o.classList.add('open');
  }

  function enregistrer(m, o) {
    var msg = $('#agsp-msg', m);
    var btn = $('#agsp-save', m);
    var nom = $('#agsp-nom', m).value.trim();
    if (!nom) { msg.textContent = 'Entrez votre nom.'; return; }
    btn.disabled = true;
    msg.className = 'agsp-err';
    msg.textContent = 'Enregistrement...';

    var etape = newPhoto ? squareJpeg(newPhoto).then(envoyerPhoto) : Promise.resolve(undefined);
    etape.then(function (url) {
      var corps = { nom: nom, localite: $('#agsp-loc', m).value.trim(), bio: $('#agsp-bio', m).value.trim() };
      if (url) corps.photo_url = url;
      return fetch(BACKEND + '/mon-profil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(corps)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) throw new Error(j.erreur || ('Erreur ' + r.status));
          return j;
        });
      });
    }).then(function () {
      newPhoto = null;
      return loadCaches();
    }).then(function () {
      btn.disabled = false;
      o.classList.remove('open');
      renderMonProfil();
      redecorate();
      say('Profil enregistré');
    }).catch(function (e) {
      btn.disabled = false;
      msg.textContent = 'Erreur : ' + e.message;
    });
  }

  /* ---------- Supprimer sa propre annonce ---------- */
  function estMienne(s) {
    if (!s || !me) return false;
    if (s.vendeur_uid && me.uid && s.vendeur_uid === me.uid) return true;
    return !!(s.vendeur_pi && me.username && String(s.vendeur_pi).toLowerCase() === String(me.username).toLowerCase());
  }

  function supprimerAnnonce(id, btn) {
    if (!token) { say('Connectez-vous d\'abord avec Pi.'); return; }
    if (!window.confirm('Supprimer définitivement cette annonce et ses commentaires ?')) return;
    btn.disabled = true;
    btn.textContent = 'Suppression...';
    fetch(BACKEND + '/annonce/supprimer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ id: id })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.erreur || ('Erreur ' + r.status));
      });
    }).then(function () {
      say('Annonce supprimée');
      if (typeof window.agsRefreshFeed === 'function') window.agsRefreshFeed();
      return loadCaches();
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = 'Supprimer mon annonce';
      say('Erreur : ' + e.message);
    });
  }

  /* ---------- Connexion Pi : récupère le jeton et l'utilisateur ---------- */
  try {
    if (window.Pi && typeof Pi.authenticate === 'function') {
      var orig = Pi.authenticate.bind(Pi);
      Pi.authenticate = function () {
        return orig.apply(null, arguments).then(function (a) {
          if (a && a.accessToken) token = a.accessToken;
          if (a && a.user) me = a.user;
          loadCaches().then(function () { renderMonProfil(); redecorate(); });
          return a;
        });
      };
    }
  } catch (e) {
    console.warn('AGROSSIGNOL profils : connexion Pi non surveillée', e);
  }

  /* ---------- Démarrage ---------- */
  function init() {
    try {
      addStyles();
      document.addEventListener('click', function (e) {
        var del = e.target.closest && e.target.closest('[data-agsp-del]');
        if (del) { supprimerAnnonce(del.getAttribute('data-agsp-del'), del); return; }
        var by = e.target.closest && e.target.closest('.ags-by[data-agsp-id]');
        if (by) ouvrirFiche(by.getAttribute('data-agsp-id'));
      });
      try {
        var original = window.renderMe;
        if (typeof original === 'function') {
          window.renderMe = function () {
            var r = original.apply(this, arguments);
            renderMonProfil();
            return r;
          };
        }
      } catch (e) {}
      var timer = null;
      new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(decorate, 200);
      }).observe(document.body, { childList: true, subtree: true });
      renderMonProfil();
      loadCaches().then(function () { renderMonProfil(); decorate(); });
    } catch (e) {
      console.error('AGROSSIGNOL profils :', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
