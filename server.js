// backend Agrossignol v3 (ajout du diagnostic IA)
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// ---------- Paiements Pi (inchangés) ----------
app.post('/payment/approve', (req, res) => {
  res.json({ approved: true });
});

app.post('/payment/complete', (req, res) => {
  res.json({ completed: true });
});

app.get('/', (req, res) => {
  res.json({ status: 'Agrossignol Backend OK' });
});

// ---------- Diagnostic IA des plantes ----------
const MODELES = [process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-3.7-flash'];

const CONSIGNE = `Tu es un agronome expert qui conseille des producteurs au Cameroun.
Analyse la photo de plante et réponds UNIQUEMENT en JSON valide, en français, avec cette structure :
{"maladie":"nom probable du problème ou Plante saine","emoji":"un emoji",
"severite":"aucune ou faible ou moyenne ou élevée",
"description":"1 à 2 phrases",
"confiance":85,
"symptomes":["symptôme observé 1","symptôme observé 2"],
"traitements":[{"emoji":"🌿","texte":"traitement 1"},{"emoji":"💧","texte":"traitement 2"}],
"prevention":["conseil de prévention 1","conseil de prévention 2"],
"produit_recommande":"produit naturel ou accessible localement"}
Si l'image n'est pas une plante, mets maladie "Image non reconnue" et severite "aucune".
Reste prudent : indique que le diagnostic est une estimation.`;

// Test sans photo : confirme que la clé est bien chargée (n'affiche jamais la clé)
app.get('/diagnostic/etat', (req, res) => {
  res.json({ cleConfiguree: Boolean(process.env.GEMINI_KEY), modeles: MODELES });
});

app.post('/diagnostic', async (req, res) => {
  const cle = process.env.GEMINI_KEY;
  if (!cle) {
    return res.status(500).json({ erreur: "Service IA non configuré sur le serveur." });
  }
  const { image, mimeType } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ erreur: "Aucune image reçue." });
  }
  const type = ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) ? mimeType : 'image/jpeg';

  try {
    let reponse = null;
    for (const modele of MODELES) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`;
      reponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cle },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: type, data: image } },
            { text: CONSIGNE }
          ] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4000, responseMimeType: 'application/json' }
        })
      });
      if (reponse.status !== 404) break; // modèle introuvable -> on essaie le suivant
    }

    if (!reponse.ok) {
      console.error('Erreur Gemini', reponse.status, await reponse.text());
      if (reponse.status === 400 || reponse.status === 403) {
        return res.status(502).json({ erreur: "Le service IA refuse la clé du serveur. Contactez l'administrateur." });
      }
      if (reponse.status === 429) {
        return res.status(429).json({ erreur: "Le service IA est très sollicité. Réessayez dans une minute." });
      }
      return res.status(502).json({ erreur: "Le service IA est momentanément indisponible." });
    }

    const data = await reponse.json();
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content.parts) || [];
    const texte = parts.filter(p => p.text && !p.thought).map(p => p.text).join('');
    if (!texte) {
      return res.status(502).json({ erreur: "L'IA n'a pas renvoyé de réponse. Essayez avec une autre photo." });
    }
    const resultat = JSON.parse(texte.replace(/```json|```/g, '').trim());
    res.json(resultat);
  } catch (e) {
    console.error('Erreur diagnostic', e);
    res.status(500).json({ erreur: "Impossible d'analyser l'image. Réessayez avec une photo plus nette." });
  }
});

module.exports = app;
