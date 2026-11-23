/* AGROSSIGNOL - Mon activité (achats et ventes) dans le profil.
   Fichier séparé : lit /mon-activite du backend avec la connexion Pi.
   Ne touche ni aux paiements, ni aux publications, ni au diagnostic. */
(function () {
  'use strict';

  var BACKEND = 'https://agrossignol-backend.vercel.app';
  var token = '';
  var LABELS = {
    paiement_confirme: 'Payé',
    acceptee: 'Acceptée',
    en_preparation: 'En préparation',
    expediee: 'Expédiée',
    livree: 'Livrée',
    annulee: 'Annulée',
    remboursee: 'Remboursée'
  };

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtPi(v) { return Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 4 }); }
  function fmtDate(d) {
    try { return d ? new Date(d).toLocaleDateString('fr-FR') : ''; } catch (e) { return ''; }
  }

  function panel() {
    var me = document.getElementById('v-me');
    if (!me) return null;
    var p = document.getElementById('ags-activite');
    if (!p) {
      p = document.createElement('div');
      p.className = 'panel';
      p.id = 'ags-activite';
      p.addEventListener('click', function (e) {
        var a = e.target.getAttribute && e.target.getAttribute('data-act');
        if (a === 'refresh') charger();
      });
      me.appendChild(p);
    }
    return p;
  }

  function ligne(c, achat) {
    var statut = LABELS[c.statut] || c.statut || '';
    var meta = [statut, fmtDate(c.cree_le)].filter(Boolean).map(esc).join(' · ');
    return '<div class="mini"><div class="info">' +
      '<b>' + esc(c.titre || 'Produit') + '</b>' +
      '<div class="pr">' + esc(fmtPi(c.montant || 0)) + 'π <span>' + (meta ? '· ' + meta : '') + '</span></div>' +
      (achat && c.vendeur_nom ? '<div style="font-size:.78rem;color:#5f5f5f">Vendeur : ' + esc(c.vendeur_nom) + '</div>' : '') +
      '</div></div>';
  }

  function liste(titre, rows, achat, vide) {
    return '<div style="margin-top:12px"><b>' + titre + ' (' + rows.length + ')</b>' +
      (rows.length ? rows.map(function (c) { return ligne(c, achat); }).join('')
        : '<div class="empty" style="padding:14px">' + vide + '</div>') +
      '</div>';
  }

  function entete() {
    return '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<b>Mon activité</b>' +
      '<button type="button" class="btn-follow" data-act="refresh">Actualiser</button></div>';
  }

  function charger() {
    var p = panel();
    if (!p) return;
    if (!token) {
      p.innerHTML = entete() +
        '<div class="empty" style="padding:16px">Connectez-vous avec Pi pour voir vos achats et vos ventes.</div>';
      return;
    }
    p.innerHTML = entete() + '<div class="empty" style="padding:16px">Chargement...</div>';
    fetch(BACKEND + '/mon-activite', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error((j && j.erreur) || ('Erreur ' + r.status));
          return j;
        });
      })
      .then(function (d) {
        p.innerHTML = entete() +
          liste('Mes achats', d.achats || [], true, 'Aucun achat pour le moment.') +
          liste('Mes ventes', d.ventes || [], false, 'Aucune vente pour le moment.');
      })
      .catch(function (e) {
        p.innerHTML = entete() +
          '<div class="empty" style="padding:16px;color:#c0392b">' + esc(e.message) + '</div>';
      });
  }

  /* Récupère la preuve de connexion Pi au moment de la connexion */
  try {
    if (window.Pi && typeof Pi.authenticate === 'function') {
      var orig = Pi.authenticate.bind(Pi);
      Pi.authenticate = function () {
        return orig.apply(null, arguments).then(function (a) {
          if (a && a.accessToken) token = a.accessToken;
          setTimeout(charger, 0);
          return a;
        });
      };
    }
  } catch (e) {
    console.warn('AGROSSIGNOL activité : connexion Pi non surveillée', e);
  }

  /* Rafraîchit à chaque ouverture du profil */
  try {
    var original = window.renderMe;
    if (typeof original === 'function') {
      window.renderMe = function () {
        var r = original.apply(this, arguments);
        charger();
        return r;
      };
    }
  } catch (e) {}

  charger();
})();
