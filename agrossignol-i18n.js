/* AGROSSIGNOL - Langue : anglais par défaut, français au choix (bouton FR/EN dans l'en-tête).
   Traduit l'écran sans modifier les autres fichiers. Les textes écrits par les utilisateurs
   (titres d'annonces, descriptions, commentaires) ne sont jamais traduits.
   Les clés techniques (catégories enregistrées en base) ne changent pas. */
(function () {
  'use strict';

  var KEY = 'ags_lang';

  /* Textes exacts : français -> anglais (apostrophes et espaces normalisés) */
  var D = {
    /* En-tête, accueil */
    "AGROSSIGNOL, accueil": "AGROSSIGNOL, home",
    "Connexion Pi": "Connect with Pi",
    "Utilisateur": "User",
    "Plateforme agricole numérique panafricaine": "Pan-African digital agriculture platform",
    "Produisez, vendez et payez avec Pi.": "Grow, sell and pay with Pi.",
    "Chercher un produit ou un vendeur": "Search for a product or a seller",
    "Recherche": "Search",
    "Chercher": "Search",
    "Catégories": "Categories",
    "Tout voir": "See all",
    "Diagnostic des plantes par IA": "AI plant diagnosis",
    "Photographiez une plante, recevez une analyse.": "Photograph a plant and get an analysis.",
    "Lancer le diagnostic": "Start diagnosis",
    "Services": "Services",
    "Diagnostic IA": "AI diagnosis",
    "Détectez les maladies de vos cultures.": "Detect diseases in your crops.",
    "Marché agricole": "Farm marketplace",
    "Cultures, élevage, intrants, matériel.": "Crops, livestock, inputs, equipment.",
    "Vendre un produit": "Sell a product",
    "Publiez votre annonce en une minute.": "Post your listing in one minute.",
    "Paiement Pi": "Pi payment",
    "Achetez avec votre wallet Pi Network.": "Buy with your Pi Network wallet.",
    "Que voulez-vous vendre aujourd'hui ?": "What do you want to sell today?",
    "Dernières annonces": "Latest listings",
    "Annonces des vendeurs": "Seller listings",
    /* Catégories */
    "légumes": "Vegetables", "fruits": "Fruits", "céréales": "Cereals", "élevage": "Livestock",
    "vétérinaire": "Veterinary", "ingrédients": "Ingredients", "concentrés": "Concentrates",
    "intrants": "Farm inputs", "matériel": "Equipment", "épices": "Spices", "Tout": "All",
    /* Messages */
    "Messages": "Messages",
    "La messagerie intégrée n'est pas encore disponible. Pour écrire à un vendeur, touchez « Contacter » sur une annonce : la conversation s'ouvre sur WhatsApp.":
      "Built-in messaging is not available yet. To write to a seller, tap “Contact the seller” on a listing: the conversation opens on WhatsApp.",
    /* Profil */
    "Mon profil": "My profile",
    "Non connecté": "Not connected",
    "Connectez-vous avec Pi pour acheter et vendre.": "Connect with Pi to buy and sell.",
    "publications": "listings",
    "abonnements": "following",
    "Mes publications": "My listings",
    "Connecté avec Pi": "Connected with Pi",
    /* Pied de page */
    "Créée par": "Created by",
    "Yaoundé, Cameroun": "Yaoundé, Cameroon",
    "© 2026 AGROSSIGNOL — Tous droits réservés": "© 2026 AGROSSIGNOL — All rights reserved",
    /* Navigation */
    "Accueil": "Home", "Marché": "Market", "Publier": "Post", "Profil": "Profile",
    /* Fenêtres */
    "Confirmer la commande": "Confirm order",
    "π Le paiement passe par votre wallet Pi Network. Connectez-vous avant de payer.":
      "π Payment goes through your Pi Network wallet. Connect before paying.",
    "Payer avec Pi": "Pay with Pi",
    "Annuler": "Cancel",
    "Fermer": "Close",
    "Suivre": "Follow",
    "Suivi": "Following",
    "Contacter": "Contact",
    "Produits en vente": "Products for sale",
    /* Annonces */
    "Disponible": "Available",
    "Épuisé": "Sold out",
    "Prix en π à définir par le vendeur.": "Price in π to be set by the seller.",
    "Acheter maintenant": "Buy now",
    "Contacter le vendeur": "Contact the seller",
    "Commenter": "Comment",
    "Envoyer": "Send",
    "Votre nom": "Your name",
    "Votre commentaire": "Your comment",
    "Aucun commentaire pour le moment.": "No comments yet.",
    "Entrez votre nom et votre commentaire.": "Enter your name and your comment.",
    "Aucune annonce pour le moment. Soyez le premier à publier !": "No listings yet. Be the first to post!",
    "Aucune annonce dans cette catégorie pour le moment. Soyez le premier à publier !": "No listings in this category yet. Be the first to post!",
    "Aucun résultat pour cette recherche.": "No results for this search.",
    "Cette annonce n'est pas disponible à l'achat.": "This listing is not available for purchase.",
    "Vous ne pouvez pas acheter votre propre annonce.": "You cannot buy your own listing.",
    "Achat indisponible sur cette page. Rechargez et réessayez.": "Purchase unavailable on this page. Reload and try again.",
    /* Publication */
    "Publier une annonce": "Post a listing",
    "Titre du produit *": "Product title *",
    "Ex : Maïs frais, sac de 50 kg": "e.g. Fresh maize, 50 kg bag",
    "Catégorie *": "Category *",
    "Choisir une catégorie": "Choose a category",
    "Description": "Description",
    "Qualité, quantité, disponibilité...": "Quality, quantity, availability...",
    "Prix en π *": "Price in π *",
    "Par unité *": "Per unit *",
    "kg, sac, panier": "kg, bag, basket",
    "Le prix en π est le montant payé par l'acheteur.": "The price in π is the amount paid by the buyer.",
    "Stock disponible *": "Stock available *",
    "Ex : 20": "e.g. 20",
    "Localité": "Location",
    "Ex : Maroua": "e.g. Maroua",
    "Votre nom *": "Your name *",
    "Numéro WhatsApp *": "WhatsApp number *",
    "Ex : 6XXXXXXXX": "e.g. 6XXXXXXXX",
    "Ajouter des photos": "Add photos",
    "Entrez le titre du produit.": "Enter the product title.",
    "Entrez un prix en π valide (ex : 0.5).": "Enter a valid price in π (e.g. 0.5).",
    "Indiquez l'unité (kg, sac, panier...).": "Enter the unit (kg, bag, basket...).",
    "Indiquez le stock disponible (un nombre, 1 ou plus).": "Enter the available stock (a number, 1 or more).",
    "Entrez votre nom.": "Enter your name.",
    "Entrez un numéro WhatsApp valide.": "Enter a valid WhatsApp number.",
    "Choisissez une catégorie.": "Choose a category.",
    "Envoi en cours, patientez...": "Sending, please wait...",
    "Annonce publiée !": "Listing posted!",
    "Produit publié": "Product posted",
    "Indiquez le nom et le prix du produit": "Enter the product name and price",
    /* Connexion et paiement */
    "Ouvrez AGROSSIGNOL dans Pi Browser pour vous connecter": "Open AGROSSIGNOL in Pi Browser to connect",
    "Ouvrez AGROSSIGNOL dans Pi Browser pour payer": "Open AGROSSIGNOL in Pi Browser to pay",
    "Connexion annulée": "Connection cancelled",
    "Connectez-vous d'abord avec Pi": "Connect with Pi first",
    "Connectez-vous d'abord avec Pi.": "Connect with Pi first.",
    "Paiement annulé": "Payment cancelled",
    "Commande réussie, merci !": "Order successful, thank you!",
    /* Mon activité */
    "Mon activité": "My activity",
    "Actualiser": "Refresh",
    "Connectez-vous avec Pi pour voir vos achats et vos ventes.": "Connect with Pi to see your purchases and sales.",
    "Chargement...": "Loading...",
    "Aucun achat pour le moment.": "No purchases yet.",
    "Aucune vente pour le moment.": "No sales yet.",
    "Produit": "Product",
    "Payé": "Paid", "Acceptée": "Accepted", "En préparation": "Being prepared",
    "Expédiée": "Shipped", "Livrée": "Delivered", "Annulée": "Cancelled", "Remboursée": "Refunded",
    "Impossible de charger votre activité.": "Unable to load your activity.",
    "Lecture des commandes impossible.": "Unable to read orders.",
    /* Profils publics */
    "Voir le profil": "View profile",
    "Annonces de ce vendeur": "This seller's listings",
    "Aucune annonce.": "No listings.",
    "Ce vendeur n'a pas encore ajouté de photo ni de présentation.": "This seller has not added a photo or bio yet.",
    "compte Pi": "Pi account",
    "Mon profil public": "My public profile",
    "Connectez-vous avec Pi pour ajouter votre photo et votre nom, visibles par les autres utilisateurs.":
      "Connect with Pi to add your photo and name, visible to other users.",
    "Modifier mon profil": "Edit my profile",
    "Ajouter ma photo et mon nom": "Add my photo and name",
    "Choisir une photo": "Choose a photo",
    "Nom affiché": "Display name",
    "Présentation": "Bio",
    "Qui êtes-vous ? Que vendez-vous ?": "Who are you? What do you sell?",
    "Enregistrer": "Save",
    "Enregistrement...": "Saving...",
    "Profil enregistré": "Profile saved",
    "Impossible d'enregistrer le profil.": "Unable to save the profile.",
    "Photo non valide.": "Invalid photo.",
    "Photo illisible": "Unreadable photo",
    /* Suppression d'annonce */
    "Supprimer mon annonce": "Delete my listing",
    "Suppression...": "Deleting...",
    "Annonce supprimée": "Listing deleted",
    "Supprimer définitivement cette annonce et ses commentaires ?": "Permanently delete this listing and its comments?",
    "Vous ne pouvez supprimer que vos propres annonces.": "You can only delete your own listings.",
    "Annonce introuvable.": "Listing not found.",
    "Annonce manquante.": "Missing listing.",
    "Impossible de supprimer l'annonce.": "Unable to delete the listing.",
    "Lecture de l'annonce impossible.": "Unable to read the listing.",
    /* Erreurs du serveur */
    "Connexion Pi requise.": "Pi connection required.",
    "Connexion Pi invalide. Reconnectez-vous.": "Invalid Pi connection. Please reconnect.",
    "Connexion Pi invalide.": "Invalid Pi connection.",
    "Produit introuvable.": "Product not found.",
    "Produit épuisé.": "Product sold out.",
    "Le montant ne correspond pas au prix du produit.": "The amount does not match the product price.",
    "Vérification du produit impossible. Réessayez.": "Unable to verify the product. Please try again."
  };

  /* Textes avec une partie variable */
  var R = [
    [/^Publié par : (.+)$/, "Published by: $1"],
    [/^Quantité disponible : (.+)$/, "Available quantity: $1"],
    [/^≈ (.+) FCFA \(repère indicatif\)$/, "≈ $1 FCFA (indicative)"],
    [/^Ancien prix : (.+)$/, "Previous price: $1"],
    [/^Connecté : (.+)$/, "Connected: $1"],
    [/^Impossible de charger les annonces : (.+)$/, "Unable to load listings: $1"],
    [/^Mes achats \((\d+)\)$/, "My purchases ($1)"],
    [/^Mes ventes \((\d+)\)$/, "My sales ($1)"],
    [/^Vendeur : (.+)$/, "Seller: $1"],
    [/^Profil créé le (.+)$/, "Profile created on $1"],
    [/^(\d+) produits? en vente$/, "$1 product(s) for sale"],
    [/^Photos \(jusqu'à (\d+)\)$/, "Photos (up to $1)"],
    [/^Votre annonce · (.+)$/, "Your listing · $1"]
  ];

  var WA_FR = 'Bonjour, je suis intéressé(e) par votre annonce AGROSSIGNOL : ';
  var WA_EN = 'Hello, I am interested in your AGROSSIGNOL listing: ';
  var TITLE_FR = null;

  var lang = 'en';
  try { lang = localStorage.getItem(KEY) === 'fr' ? 'fr' : 'en'; } catch (e) {}

  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u00a0\u202f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var DN = {};
  Object.keys(D).forEach(function (k) { DN[norm(k)] = D[k]; });

  /* Retourne la traduction anglaise, ou null si rien à traduire */
  function tr(s) {
    var n = norm(s);
    if (!n) return null;
    if (Object.prototype.hasOwnProperty.call(DN, n)) return DN[n];
    var i, m;
    for (i = 0; i < R.length; i++) {
      m = n.match(R[i][0]);
      if (m) return n.replace(R[i][0], R[i][1]);
    }
    /* "Erreur : message" */
    m = n.match(/^Erreur : (.+)$/);
    if (m) return 'Error: ' + (tr(m[1]) || m[1]);
    /* Textes séparés par " · " */
    if (n.indexOf('·') > -1) {
      var parts = n.split(/(\s·\s|^·\s)/);
      var changed = false;
      var out = parts.map(function (p) {
        if (!p || /^(\s·\s|·\s)$/.test(p)) return p;
        var t = Object.prototype.hasOwnProperty.call(DN, p) ? DN[p] : null;
        if (t) { changed = true; return t; }
        return p;
      });
      if (changed) return out.join('');
    }
    return null;
  }

  var ATTRS = ['placeholder', 'aria-label', 'title'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };

  function textNode(node) {
    if (lang !== 'en') return;
    var p = node.parentNode;
    if (!p || SKIP[p.nodeName]) return;
    var v = node.nodeValue;
    var t = tr(v);
    if (t == null) return;
    var lead = (v.match(/^\s*/) || [''])[0];
    var trail = (v.match(/\s*$/) || [''])[0];
    if (node.__agsFr === undefined) node.__agsFr = v;
    node.nodeValue = lead + t + trail;
  }

  function attrs(el) {
    if (lang !== 'en' || !el.getAttribute) return;
    ATTRS.forEach(function (a) {
      var v = el.getAttribute(a);
      if (v == null) return;
      var t = tr(v);
      if (t == null) return;
      el.__agsA = el.__agsA || {};
      if (el.__agsA[a] === undefined) el.__agsA[a] = v;
      el.setAttribute(a, t);
    });
    /* Message WhatsApp pré-rempli */
    if (el.nodeName === 'A') {
      var h = el.getAttribute('href') || '';
      if (h.indexOf('wa.me') > -1) {
        var fr = encodeURIComponent(WA_FR);
        if (h.indexOf(fr) > -1) {
          el.__agsA = el.__agsA || {};
          if (el.__agsA.href === undefined) el.__agsA.href = h;
          el.setAttribute('href', h.replace(fr, encodeURIComponent(WA_EN)));
        }
      }
    }
  }

  function tree(root) {
    if (!root) return;
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1) return;
    attrs(root);
    var w = document.createTreeWalker(root, 1 | 4, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) textNode(n); else attrs(n);
    }
  }

  function restore() {
    var w = document.createTreeWalker(document.documentElement, 1 | 4, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3 && n.__agsFr !== undefined) {
        n.nodeValue = n.__agsFr;
        n.__agsFr = undefined;
      } else if (n.nodeType === 1 && n.__agsA) {
        for (var a in n.__agsA) {
          if (n.__agsA[a] !== undefined) n.setAttribute(a, n.__agsA[a]);
        }
        n.__agsA = undefined;
      }
    }
  }

  function applyHead() {
    document.documentElement.lang = lang;
    if (TITLE_FR === null) TITLE_FR = document.title;
    document.title = lang === 'en' ? 'AGROSSIGNOL — Pan-African digital agriculture platform' : TITLE_FR;
  }

  function label(btn) {
    btn.textContent = lang === 'en' ? 'FR' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? 'Passer en français' : 'Switch to English');
  }

  function setLang(l) {
    lang = l === 'fr' ? 'fr' : 'en';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    restore();
    if (lang === 'en') tree(document.body);
    applyHead();
    var b = document.getElementById('agsl-btn');
    if (b) label(b);
  }

  function addButton() {
    if (document.getElementById('agsl-btn')) return;
    var st = document.createElement('style');
    st.textContent =
      '#agsl-btn{background:transparent;border:1.5px solid #fefae0;color:#fefae0;border-radius:50px;padding:6px 10px;min-height:36px;font-weight:700;font-size:.78rem;flex-shrink:0}' +
      '@media(max-width:430px){.hin{gap:6px}.logo b{font-size:1.02rem;letter-spacing:.03em}.logo svg{width:26px;height:26px}#btn-login{padding:8px 12px;font-size:.78rem}}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.id = 'agsl-btn';
    b.type = 'button';
    label(b);
    b.onclick = function () { setLang(lang === 'en' ? 'fr' : 'en'); };
    var login = document.getElementById('btn-login');
    var hin = document.querySelector('header .hin');
    if (hin && login) hin.insertBefore(b, login);
    else if (hin) hin.appendChild(b);
    else document.body.appendChild(b);
  }

  /* Le texte du paiement Pi est toujours en anglais */
  function patchPayment() {
    try {
      if (window.Pi && typeof Pi.createPayment === 'function') {
        var oc = Pi.createPayment.bind(Pi);
        Pi.createPayment = function (data, cb) {
          if (data && typeof data.memo === 'string') {
            data.memo = data.memo.replace(/^Achat : /, 'Purchase: ').replace(/ sur Agrossignol$/, ' on Agrossignol');
          }
          return oc(data, cb);
        };
      }
    } catch (e) {}
  }

  function patchDialogs() {
    try {
      var oa = window.alert.bind(window);
      var oc = window.confirm.bind(window);
      window.alert = function (m) { return oa(lang === 'en' ? (tr(m) || m) : m); };
      window.confirm = function (m) { return oc(lang === 'en' ? (tr(m) || m) : m); };
    } catch (e) {}
  }

  function init() {
    try {
      addButton();
      patchPayment();
      patchDialogs();
      applyHead();
      tree(document.body);
      new MutationObserver(function (recs) {
        if (lang !== 'en') return;
        recs.forEach(function (r) {
          if (r.type === 'childList') {
            [].forEach.call(r.addedNodes, tree);
          } else if (r.type === 'characterData') {
            textNode(r.target);
          } else if (r.type === 'attributes') {
            attrs(r.target);
          }
        });
      }).observe(document.documentElement, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'href']
      });
    } catch (e) {
      console.error('AGROSSIGNOL langue :', e);
    }
  }

  window.agsTr = tr;
  window.agsSetLang = setLang;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
