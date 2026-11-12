const express = require('express');
const fs = require('fs');
const path = require('path');
const dbModulePath = fs.existsSync(path.join(__dirname, '../../packages/database'))
  ? '../../packages/database'
  : './database';
const {
  getEcosystemSummary,
  addCrowdfundingPledge
} = require(dbModulePath);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const imagesDir = fs.existsSync(path.join(__dirname, '../../shared-assets/images'))
  ? path.join(__dirname, '../../shared-assets/images')
  : path.join(__dirname, 'public/images');
app.use('/images', express.static(imagesDir));

function formatFcfa(amount) {
  return Number(amount || 0).toLocaleString('fr-FR') + ' FCFA';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/api/summary', (_req, res) => {
  res.json(getEcosystemSummary());
});

app.post('/api/pledge', (req, res) => {
  try {
    const {
      contributorName,
      contributorType,
      countryCity,
      email,
      phone,
      contributionMode,
      targetPole,
      amountFcfa,
      rewardLabel,
      message
    } = req.body;

    if (!contributorName || !amountFcfa || Number(amountFcfa) < 5000) {
      return res.status(400).json({
        ok: false,
        error: 'Veuillez renseigner votre nom complet et un montant minimum de 5 000 FCFA.'
      });
    }

    const pledge = addCrowdfundingPledge({
      contributorName,
      contributorType,
      countryCity,
      email,
      phone,
      contributionMode,
      targetPole,
      amountFcfa: Number(amountFcfa),
      rewardLabel,
      message
    });

    const summary = getEcosystemSummary();
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, pledge, summary });
    }
    return res.redirect('/?pledge=success#contribuer');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  const data = getEcosystemSummary();
  const { campaign, machines, pledges, b2bContracts, metrics } = data;
  const pledgeSuccess = req.query.pledge === 'success';

  const polesMap = {};
  for (const m of machines) {
    if (!polesMap[m.pole]) {
      polesMap[m.pole] = {
        pole: m.pole,
        items: [],
        totalEstimated: 0,
        totalFunded: 0
      };
    }
    polesMap[m.pole].items.push(m);
    polesMap[m.pole].totalEstimated += Number(m.estimatedCostFcfa || 0);
    polesMap[m.pole].totalFunded += Number(m.fundedAmountFcfa || 0);
  }
  const poles = Object.values(polesMap);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appel à Financement Participatif (50M FCFA) — Le Comptoir du Poivre de Côte d'Ivoire (Plantation Soppi)</title>
  <style>
    @property --fade-start {
      syntax: "<length>";
      inherits: false;
      initial-value: 0px;
    }
    @property --fade-end {
      syntax: "<length>";
      inherits: false;
      initial-value: 0px;
    }

    :root {
      --bg: #faf7f2;
      --surface: #ffffff;
      --surface-alt: #f2ece1;
      --forest: #123524;
      --forest-mid: #1d4d35;
      --gold: #c88a2b;
      --gold-light: #f6e7cb;
      --pepper-red: #9e2a2b;
      --text: #1c241e;
      --muted: #526056;
      --border: #d8cfc0;
      --accent: #123524;
      --success: #188038;
      --danger: #d93025;
      --radius: 14px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }

    /* Accessibility utility from modern-web-guidance */
    .visually-hidden:where(:not(:focus-within, :active)) {
      position: absolute !important;
      clip-path: inset(50%) !important;
      overflow: hidden !important;
      width: 1px !important;
      height: 1px !important;
      margin: -1px !important;
      padding: 0 !important;
      border: 0 !important;
      white-space: nowrap !important;
    }

    a {
      color: inherit;
    }

    .topbar {
      background: var(--forest);
      color: #fff;
      padding: 0.6rem 1.25rem;
      font-size: 0.875rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      border-block-end: 2px solid var(--gold);
    }

    .topbar-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .badge-pill {
      background: rgba(255, 255, 255, 0.14);
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.8rem;
    }

    header.navbar {
      position: sticky;
      inset-block-start: 0;
      z-index: 20;
      background: rgba(250, 247, 242, 0.95);
      backdrop-filter: blur(8px);
      border-block-end: 1px solid var(--border);
      padding: 0.9rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
    }

    .brand-mark {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--forest);
      color: var(--gold-light);
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 1.2rem;
      border: 2px solid var(--gold);
    }

    .brand-text strong {
      display: block;
      font-size: 1.05rem;
      color: var(--forest);
      letter-spacing: -0.01em;
    }

    .brand-text span {
      font-size: 0.8rem;
      color: var(--muted);
    }

    nav.nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    nav.nav-links a {
      text-decoration: none;
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--forest);
      padding: 0.4rem 0.65rem;
      border-radius: 8px;
    }

    nav.nav-links a:hover,
    nav.nav-links a:focus-visible {
      background: var(--surface-alt);
      outline: 2px solid var(--forest);
    }

    .btn-primary {
      background: var(--forest);
      color: #fff !important;
      padding: 0.65rem 1.2rem !important;
      border-radius: 10px !important;
      border: 2px solid var(--forest);
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 48px;
      text-decoration: none;
    }

    .btn-primary:hover {
      background: var(--forest-mid);
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--forest);
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      border: 2px solid var(--forest);
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 48px;
      text-decoration: none;
    }

    .container {
      max-width: 1220px;
      margin-inline: auto;
      padding: 2rem 1.25rem;
    }

    /* Hero section */
    .hero {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 2rem;
      align-items: stretch;
      margin-block-end: 2.5rem;
    }

    @media (max-width: 940px) {
      .hero {
        grid-template-columns: 1fr;
      }
    }

    .hero-card {
      background: linear-gradient(145deg, #123524 0%, #1c4e36 100%);
      color: #fff;
      padding: 2.25rem;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 16px 36px rgba(18, 53, 36, 0.16);
    }

    .eyebrow {
      display: inline-block;
      background: rgba(200, 138, 43, 0.25);
      border: 1px solid #e3b25c;
      color: #ffe3ae;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-block-end: 1rem;
      width: fit-content;
    }

    .hero-card h1 {
      font-size: clamp(1.75rem, 3vw, 2.5rem);
      line-height: 1.18;
      margin: 0 0 1rem;
    }

    .hero-card p.lead {
      font-size: 1.05rem;
      color: #e6efe9;
      margin: 0 0 1.5rem;
    }

    .pivot-callout {
      background: rgba(255, 255, 255, 0.1);
      border-inline-start: 4px solid var(--gold);
      padding: 1rem 1.15rem;
      border-radius: 10px;
      margin-block-end: 1.5rem;
      font-size: 0.93rem;
    }

    .gauge-panel {
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.15rem;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.05);
    }

    .gauge-numbers {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .gauge-raised {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--forest);
    }

    .gauge-target {
      font-size: 0.95rem;
      color: var(--muted);
      font-weight: 600;
    }

    .progress-track {
      width: 100%;
      height: 16px;
      background: var(--surface-alt);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--forest) 0%, var(--gold) 100%);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .kpi-mini-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .kpi-mini {
      background: var(--surface-alt);
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
    }

    .kpi-mini strong {
      display: block;
      font-size: 1.1rem;
      color: var(--forest);
    }

    .kpi-mini span {
      font-size: 0.8rem;
      color: var(--muted);
    }

    .hero-photo-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
    }

    .hero-photo-strip img {
      width: 100%;
      height: 92px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    /* Section headings */
    .section-head {
      margin-block: 3rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
    }

    .section-head h2 {
      font-size: clamp(1.4rem, 2.3vw, 1.95rem);
      color: var(--forest);
      margin: 0 0 0.35rem;
    }

    .section-head p {
      margin: 0;
      color: var(--muted);
      max-width: 740px;
    }

    /* Trust / Proofs section */
    .proof-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .proof-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.85rem;
    }

    .proof-card img {
      width: 100%;
      height: 170px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    /* Tabs from modern-web-guidance */
    .tabs {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 1.25rem;
    }

    .tablist.scroller {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      border-block-end: 1px solid var(--border);
      padding-block-end: 0.25rem;
      margin-block-end: 1.25rem;
      --fade-size: 2.5rem;
      --fade-dir: right;
      --fade-start-pos: 0;
      --fade-end-pos: 100%;
      scroll-padding-inline: var(--fade-size);
    }

    .tablist button {
      flex: none;
      position: relative;
      background: transparent;
      border: 0;
      padding: 0.75rem 1.1rem;
      font: inherit;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      min-height: 48px;
      border-radius: 8px 8px 0 0;
    }

    .tablist button[aria-selected="true"] {
      color: var(--accent);
    }

    .tablist button[aria-selected="true"]::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      border-block-end: 3px solid var(--accent);
    }

    .tablist button:focus-visible {
      outline: 3px solid var(--gold);
      outline-offset: 2px;
    }

    .tabpanel-inner {
      padding: 0.5rem 0.25rem;
    }

    /* Responsive Table from modern-web-guidance */
    .table-wrapper {
      overflow: auto;
      max-inline-size: 100%;
      max-block-size: min(620px, 80vh);
      container-type: inline-size;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      --label-2: "Catégorie";
      --label-3: "Rôle Opérationnel";
      --label-4: "Budget Estimatif";
      --label-5: "Statut Devis";
      --label-6: "Priorité";
    }

    caption {
      text-align: start;
      padding: 0.9rem 1rem;
      font-weight: 700;
      color: var(--forest);
      background: var(--surface-alt);
      border-block-end: 1px solid var(--border);
    }

    thead {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      background: var(--forest);
      color: #fff;
    }

    th, td {
      padding: 0.85rem 1rem;
      text-align: start;
      border-block-end: 1px solid var(--border);
      vertical-align: top;
      font-size: 0.92rem;
    }

    tbody th {
      position: sticky;
      inset-inline-start: 0;
      background: var(--surface);
      font-weight: 700;
      color: var(--forest);
    }

    @container (width < 680px) {
      table, thead, tbody, tr, th, td {
        display: block;
      }
      thead {
        display: none;
      }
      tr {
        margin-block-end: 1rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
      }
      tbody th {
        position: sticky;
        inset-block-start: 0;
        z-index: 2;
        background: var(--surface-alt);
      }
      td:nth-child(2)::before { content: var(--label-2) ": "; font-weight: 700; }
      td:nth-child(3)::before { content: var(--label-3) ": "; font-weight: 700; }
      td:nth-child(4)::before { content: var(--label-4) ": "; font-weight: 700; }
      td:nth-child(5)::before { content: var(--label-5) ": "; font-weight: 700; }
      td:nth-child(6)::before { content: var(--label-6) ": "; font-weight: 700; }
    }

    .status-chip {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      background: var(--gold-light);
      color: #6e470b;
    }

    .status-chip.prio1 {
      background: #e1f3e8;
      color: #0f5328;
    }

    /* Form rules from modern-web-guidance */
    .form-layout {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 920px) {
      .form-layout {
        grid-template-columns: 1fr;
      }
    }

    .form-card {
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 18px;
      padding: 1.75rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      margin-block-end: 1.35rem;
    }

    label {
      font-weight: 700;
      color: var(--forest);
      display: inline-block;
      padding: 6px 0;
      margin: -6px 0;
    }

    .hint {
      display: block;
      color: var(--muted);
      font-size: 0.85rem;
      margin-block-end: 0.2rem;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    select,
    textarea {
      width: 100%;
      font: inherit;
      font-size: max(1rem, 1em);
      padding: 0.75rem;
      min-height: 48px;
      border: 1.5px solid #6e7770;
      border-radius: 10px;
      background: #fff;
      color: var(--text);
      box-sizing: border-box;
    }

    @media (pointer: coarse) {
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      select,
      textarea {
        min-height: 52px;
      }
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    button:focus-visible {
      outline: 3px solid #0b57d0;
      outline-offset: 2px;
    }

    fieldset {
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.15rem;
      margin: 0 0 1.35rem;
      width: 100%;
    }

    legend {
      font-weight: 700;
      color: var(--forest);
      padding: 0 0.4rem;
    }

    .radio-option {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      margin-block: 0.55rem;
    }

    .radio-option input[type="radio"] {
      accent-color: var(--forest);
      width: 1.2rem;
      height: 1.2rem;
      margin-block-start: 0.2rem;
      flex: none;
    }

    .error-msg {
      display: none;
      color: var(--danger);
      font-size: 0.875rem;
      margin-block-start: 0.25rem;
      font-weight: 600;
    }

    :is(:user-invalid, .user-invalid-fallback) {
      border-color: var(--danger) !important;
      background-color: #fce8e6 !important;
    }

    :is(:user-invalid, .user-invalid-fallback) + .error-msg {
      display: block;
    }

    input:user-valid {
      border-color: var(--success);
    }

    /* Native Dialog rules from modern-web-guidance */
    dialog {
      border: 2px solid var(--forest);
      border-radius: 18px;
      padding: 1.5rem;
      max-width: 720px;
      width: min(92vw, 720px);
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
    }

    dialog:modal {
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      overflow: hidden;
      overscroll-behavior: contain;
      background-color: rgba(10, 24, 16, 0.65);
      backdrop-filter: blur(3px);
    }

    .pledge-feed {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .pledge-item {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
    }

    .alert-banner {
      background: #e3f5e8;
      border: 2px solid var(--success);
      color: #0e4f23;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-block-end: 1.5rem;
      font-weight: 700;
    }

    footer {
      background: var(--forest);
      color: #d9e6de;
      padding: 2.5rem 1.25rem;
      margin-block-start: 4rem;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-badges">
      <span class="badge-pill">🇨🇮 Terroir de la Mé &amp; Grands Ponts</span>
      <span class="badge-pill">✅ Certifié GLOBALG.A.P. (Ecocert GGN 4063651592948)</span>
      <span class="badge-pill">🤝 Coopérative SCPPE : 25–40 Planteurs Partenaires</span>
    </div>
    <div>
      <span>Écosystème découplé :</span>
      <a href="http://localhost:3002" style="margin-inline-start: 0.6rem; color: #ffe3ae; font-weight: 700;">Boutique B2C/B2B (Port 3002) →</a>
      <a href="http://localhost:3003" style="margin-inline-start: 0.6rem; color: #ffe3ae; font-weight: 700;">Portail SaaS Coopérative (Port 3003) →</a>
    </div>
  </div>

  <header class="navbar">
    <a href="/" class="brand">
      <div class="brand-mark">SP</div>
      <div class="brand-text">
        <strong>PLANTATION SOPPI — POIVRE DE LA MÉ</strong>
        <span>Campagne d’Industrialisation Agile &amp; Financement Participatif</span>
      </div>
    </a>
    <nav class="nav-links" aria-label="Navigation principale de la campagne">
      <a href="#vision">Pourquoi 50M FCFA ?</a>
      <a href="#preuves">Preuves &amp; Certificats</a>
      <a href="#machines">Parc Machines &amp; Paliers</a>
      <a href="#innovations">Sticks &amp; Coffrets</a>
      <a href="#contribuer" class="btn-primary">Participer / Précommander</a>
    </nav>
  </header>

  <main class="container">
    ${
      pledgeSuccess
        ? `<div role="status" class="alert-banner">
            🎉 Merci ! Votre engagement / précommande a été enregistré dans la base commune et répercuté en temps réel sur la jauge et dans le SaaS de la Coopérative.
          </div>`
        : ''
    }

    <section class="hero" id="vision">
      <div class="hero-card">
        <div>
          <span class="eyebrow">Appel à Financement Participatif &amp; Précommandes</span>
          <h1>Industrialisons le Poivre de Côte d’Ivoire étape par étape, avec confiance et preuves terrain.</h1>
          <p class="lead">
            Porté par <strong>${escapeHtml(campaign.presidentName)}</strong> (${escapeHtml(campaign.cooperativeName)}), ce programme finance l’équipement de notre <strong>unité pilote de calibrage, mouture et conditionnement hermétique</strong> pour valoriser immédiatement la récolte de nos <strong>25 à 40 producteurs formés</strong>.
          </p>
          <div class="pivot-callout">
            <strong>💡 Notre approche pragmatique (« Commencer petit/moyen pour prouver et rassurer ») :</strong><br>
            Plutôt que d’attendre 2,352 milliards FCFA de dette bancaire pour bâtir d’emblée une usine sur 1 hectare, nous lançons une <strong>1re phase agile de 50 Millions FCFA</strong> installée dans l’atelier pilote aménagé (garage de Mme Soppi), centrée sur la collecte de poivre séché standardisé (12–13% d’humidité), la mouture (poivre &amp; curcuma) et le conditionnement double-hermétique (Sticks, Zips, Bouteilles &amp; Coffrets).
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.85rem;">
          <a href="#contribuer" class="btn-primary" style="background: var(--gold); border-color: var(--gold); color: #1c241e !important;">
            Soutenir ou Précommander (dès 15 000 FCFA)
          </a>
          <button type="button" class="btn-secondary" data-open-dialog="dialog-certificats">
            Voir Certificat GLOBALG.A.P. &amp; Attestation 10 ha
          </button>
        </div>
      </div>

      <aside class="gauge-panel" aria-label="Avancement de la levée de fonds">
        <div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--muted); text-transform: uppercase;">
            Objectif Phase 1 — Unité Pilote &amp; Collecte Standardisée
          </div>
          <div class="gauge-numbers" style="margin-block: 0.45rem;">
            <span class="gauge-raised">${formatFcfa(metrics.raisedTotalFcfa)}</span>
            <span class="gauge-target">sur ${formatFcfa(campaign.targetAmountFcfa)} (${metrics.progressPercent}%)</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${metrics.progressPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progression du financement">
            <div class="progress-fill" style="width: ${metrics.progressPercent}%;"></div>
          </div>
          <p style="font-size: 0.82rem; color: var(--muted); margin: 0.5rem 0 0;">
            ℹ️ Les budgets des machines ci-dessous sont mis à jour en temps réel depuis le <strong>SaaS Coopérative (Port 3003)</strong> au fur et à mesure de la réception des devis fournisseurs.
          </p>
        </div>

        <div class="kpi-mini-grid">
          <div class="kpi-mini">
            <strong>32 Planteurs</strong>
            <span>Coopérative active (Cible 25–40 partenaires formés)</span>
          </div>
          <div class="kpi-mini">
            <strong>${metrics.totalDriedStockKg} kg secs</strong>
            <span>Stock standardisé (12–13% humidité) prêt à conditionner</span>
          </div>
          <div class="kpi-mini">
            <strong>${formatFcfa(metrics.totalB2bAnnualCommitmentsFcfa)}</strong>
            <span>Contrats B2B / LOI annuels déjà engagés</span>
          </div>
          <div class="kpi-mini">
            <strong>${metrics.totalHectares} ha</strong>
            <span>Surfaces suivies selon l’itinéraire CNRA / FIRCA</span>
          </div>
        </div>

        <div class="hero-photo-strip">
          <img src="/images/coffret-3-poivres.jpg" alt="Coffret 3 poivres Plantation Soppi">
          <img src="/images/recolte-sechage.jpg" alt="Poivre séché standardisé de la coopérative">
          <img src="/images/pots-poivre-noir-moulu.jpg" alt="Flacons Poivre de la Mé conditionnés">
        </div>
      </aside>
    </section>

    <!-- Preuves & Légitimité -->
    <section id="preuves">
      <div class="section-head">
        <div>
          <h2>1. Pourquoi avoir confiance ? Un projet déjà ancré, certifié et vendeur</h2>
          <p>Contrairement aux projets sur papier, Plantation Soppi et la coopérative SCPPE disposent de 6 ans d’expérimentation, de produits déjà sur le marché et d’une reconnaissance officielle.</p>
        </div>
      </div>

      <div class="proof-grid">
        <article class="proof-card">
          <img src="/images/certificat-globalgap.jpg" alt="Certificat Ecocert GLOBALG.A.P. SCPPE">
          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Certifié GLOBALG.A.P. (Ecocert)</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              Numéro GGN <strong>4063651592948</strong> (Certificat <code>00120-VFXTV-0004</code>) couvrant Plantation SOPPI (Brofodoumé-Anyama), Domaine Fiessou (Azaguié) et Domaine Kobenan (Yakassé Mé).
            </p>
          </div>
          <button type="button" class="btn-secondary" data-open-dialog="dialog-certificats">Agrandir les documents officiels</button>
        </article>

        <article class="proof-card">
          <img src="/images/plantation-allees.jpg" alt="Plantation de poivre conduite sur tuteurs vivants">
          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Co-Auteur du Guide CNRA / FIRCA</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              La coopérative <strong>SCPPE</strong> a contribué au guide national de bonnes pratiques agricoles avec le CNRA, l’ESA et le FIRCA : boutures <em>Muntok</em> &amp; <em>Lampong</em>, tuteurs vivants <em>Glyricidia</em>, récolte au 1er grain jaune.
            </p>
          </div>
          <span class="status-chip prio1">Standardisation de 25 à 40 planteurs</span>
        </article>

        <article class="proof-card">
          <img src="/images/coffret-3-poivres.jpg" alt="Gamme conditionnée Poivre de la Mé">
          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Double Hermétique &amp; Innovations</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              Maîtrise post-récolte complète : ébouillantage 3 min (noir), rouissage 10 jours à eau renouvelée tous les 2 jours (blanc), séchage 12–13% et emballage double-hermétique (Sticks, Zips, Pots, Coffrets).
            </p>
          </div>
          <a href="http://localhost:3002" class="btn-secondary">Voir le Catalogue E-Commerce (Port 3002)</a>
        </article>
      </div>
    </section>

    <!-- Parc Machines & Paliers Dynamiques -->
    <section id="machines">
      <div class="section-head">
        <div>
          <h2>2. Affectation Transparente des 50 Millions FCFA (Paliers Évolutifs)</h2>
          <p>
            Chaque franc investi cible un maillon précis. Les coûts des machines sont affichés à titre indicatif et actualisés dès validation des devis fournisseurs dans le portail SaaS.
          </p>
        </div>
        <a href="http://localhost:3003#machines" class="btn-secondary">⚙️ Modifier les prix machines dans le SaaS (Port 3003)</a>
      </div>

      <div class="tabs">
        <div class="tablist scroller" focusgroup="tablist nomemory" aria-label="Pôles d'investissement des 50 millions FCFA">
          <button type="button" id="tab-all" aria-selected="true" focusgroupstart>Vue Globale (${machines.length} postes — ${formatFcfa(metrics.totalEstimatedMachinesFcfa)})</button>
          ${poles
            .map(
              (p, i) =>
                `<button type="button" id="tab-pole-${i}" aria-selected="false">${escapeHtml(p.pole.split('—')[0].trim())} (${formatFcfa(p.totalEstimated)})</button>`
            )
            .join('')}
        </div>

        <div role="tabpanel" aria-labelledby="tab-all" tabindex="0">
          <div class="tabpanel-inner">
            <div tabindex="0" role="region" aria-labelledby="machines-caption-all" class="table-wrapper">
              <table>
                <caption id="machines-caption-all">Liste complète des équipements prioritaires (Atelier Garage) et d'extension (Zone Brouillon / Partenaires)</caption>
                <thead>
                  <tr>
                    <th scope="col">Équipement / Poste</th>
                    <th scope="col">Catégorie</th>
                    <th scope="col">Rôle Opérationnel</th>
                    <th scope="col">Budget Estimatif</th>
                    <th scope="col">Statut du Prix / Devis</th>
                    <th scope="col">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  ${machines
                    .map(
                      (m) => `<tr>
                        <th scope="row">${escapeHtml(m.name)}<br><small style="color: var(--muted); font-weight: 500;">${escapeHtml(m.id)}</small></th>
                        <td>${escapeHtml(m.category)}</td>
                        <td>${escapeHtml(m.description)}<br><small style="color: var(--forest);"><em>Note : ${escapeHtml(m.supplierNote)}</em></small></td>
                        <td><strong>${formatFcfa(m.estimatedCostFcfa)}</strong></td>
                        <td><span class="status-chip">${escapeHtml(m.priceStatus)}</span></td>
                        <td><span class="status-chip ${m.priority.includes('Priorité 1') ? 'prio1' : ''}">${escapeHtml(m.priority)}</span></td>
                      </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        ${poles
          .map(
            (p, i) => `<div role="tabpanel" aria-labelledby="tab-pole-${i}" hidden="until-found">
              <div class="tabpanel-inner">
                <h3 style="margin-block-start: 0; color: var(--forest);">${escapeHtml(p.pole)} — Total Estimé : ${formatFcfa(p.totalEstimated)}</h3>
                <div tabindex="0" role="region" aria-labelledby="machines-caption-${i}" class="table-wrapper">
                  <table>
                    <caption id="machines-caption-${i}">${escapeHtml(p.pole)}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Équipement / Poste</th>
                        <th scope="col">Catégorie</th>
                        <th scope="col">Rôle Opérationnel</th>
                        <th scope="col">Budget Estimatif</th>
                        <th scope="col">Statut du Prix / Devis</th>
                        <th scope="col">Priorité</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${p.items
                        .map(
                          (m) => `<tr>
                            <th scope="row">${escapeHtml(m.name)}</th>
                            <td>${escapeHtml(m.category)}</td>
                            <td>${escapeHtml(m.description)}</td>
                            <td><strong>${formatFcfa(m.estimatedCostFcfa)}</strong></td>
                            <td><span class="status-chip">${escapeHtml(m.priceStatus)}</span></td>
                            <td><span class="status-chip ${m.priority.includes('Priorité 1') ? 'prio1' : ''}">${escapeHtml(m.priority)}</span></td>
                          </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- Innovations Produits pour écouler rapidement le stock -->
    <section id="innovations">
      <div class="section-head">
        <div>
          <h2>3. Comment nous écoulons le stock : Innovations Produits &amp; Contrats B2B</h2>
          <p>Notre stratégie commerciale combine démocratisation par le Stick à usage unique, coffrets cadeaux événementiels et contrats annuels avec les professionnels locaux et sous-régionaux.</p>
        </div>
      </div>

      <div class="proof-grid">
        <article class="proof-card">
          <div>
            <span class="status-chip prio1">Innovation Phare #1 — Le Stick Hermétique</span>
            <h3 style="color: var(--forest); margin: 0.6rem 0;">Sticks Usage Unique (Format type Nescafé)</h3>
            <p style="font-size: 0.92rem; color: var(--muted);">
              En Côte d’Ivoire, le poivre est souvent trop cuit dans la sauce. Le <strong>Stick en film plastique/alu hermétique</strong> (non poreux, contrairement au papier d’avion) installe le réflexe de saupoudrer son poivre frais à table dans les <strong>maquis, restaurants, stations-service, supermarchés et ménages</strong> :
            </p>
            <ul style="font-size: 0.9rem; padding-inline-start: 1.2rem;">
              <li><strong>Stick Poivre Noir Pur :</strong> Arôme intense &amp; vertu tonique / aphrodisiaque recommandée aux hommes.</li>
              <li><strong>Stick Duo Curcuma + Poivre Noir :</strong> Antioxydant puissant dont le principe actif ne se déclenche qu’à 90% en présence de pipérine (poivre noir).</li>
            </ul>
          </div>
        </article>

        <article class="proof-card">
          <div>
            <span class="status-chip prio1">Innovation #2 — L’Exigence du Double Hermétique</span>
            <h3 style="color: var(--forest); margin: 0.6rem 0;">Zips Scellés, Bouteilles &amp; Verre Luxe</h3>
            <p style="font-size: 0.92rem; color: var(--muted);">
              Le climat tropical humide est l’ennemi du poivre sec (qui doit rester entre <strong>12% et 13% d’humidité</strong> pour crisser sous la main et garder sa pipérine).
            </p>
            <ul style="font-size: 0.9rem; padding-inline-start: 1.2rem;">
              <li><strong>Sachets Zips + Soudure Thermique :</strong> Double barrière hermétique pour les ménages (100g, 200g) et les pros (1kg, 5kg).</li>
              <li><strong>Pots PET scellés puis Flacons Verre :</strong> Montée en gamme progressive sans bloquer la trésorerie initiale.</li>
            </ul>
          </div>
        </article>

        <article class="proof-card">
          <div>
            <span class="status-chip prio1">Innovation #3 — Paniers de Fêtes &amp; Export Grain</span>
            <h3 style="color: var(--forest); margin: 0.6rem 0;">Coffrets Ramadan / Pâques &amp; Grain Calibré</h3>
            <p style="font-size: 0.92rem; color: var(--muted);">
              Deux moteurs de trésorerie rapide :
            </p>
            <ul style="font-size: 0.9rem; padding-inline-start: 1.2rem;">
              <li><strong>Coffrets 3 Poivres (Noir, Blanc, Rouge) :</strong> Très demandés pour les paniers cadeaux du <strong>Ramadan, de Pâques et de fin d’année</strong>.</li>
              <li><strong>Grains Calibrés au Tamis Multi-Étages :</strong> À l’international et dans la sous-région, vendre en grain entier calibré inspire une confiance immédiate sur la pureté, tout en servant le marché local en moulu (lisse, concassé, extra-fin).</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <!-- Formulaire de Participation & Précommande -->
    <section id="contribuer" style="margin-block-start: 3.5rem;">
      <div class="form-layout">
        <div class="form-card">
          <h2 id="pledge-form-heading" style="margin-block-start: 0; color: var(--forest);">
            Participer à la Levée de 50M FCFA ou Précommander du Stock
          </h2>
          <p style="color: var(--muted); font-size: 0.93rem; margin-block-end: 1.5rem;">
            Choisissez votre mode d’action : précommande solidaire de coffrets/sticks, préachat de stock B2B à tarif bloqué, ou co-financement d’une machine de l’atelier pilote. Les champs marqués d’un <span aria-hidden="true">*</span> sont obligatoires.
          </p>

          <form action="/api/pledge" method="POST" aria-labelledby="pledge-form-heading" id="pledge-form" novalidate>
            <fieldset>
              <legend>1. Votre formule de participation <span aria-hidden="true">*</span></legend>
              <div class="radio-option">
                <input type="radio" id="mode-reward" name="contributionMode" value="Précommande Solidaire (Coffrets Ramadan/Fêtes & Sticks)" checked data-suggested-amount="30000" data-reward="Pack Découverte : 2 Coffrets Prestige 3 Poivres + 2 Boîtes de 50 Sticks (Pur & Curcuma)">
                <label for="mode-reward">
                  <strong>Précommande Solidaire B2C (dès 15 000 FCFA)</strong> — Coffrets Cadeaux 3 Poivres (Ramadan, Pâques, Fêtes) &amp; Boîtes de Sticks Hermétiques
                </label>
              </div>
              <div class="radio-option">
                <input type="radio" id="mode-b2b" name="contributionMode" value="Préachat Professionnel de Stock (B2B / Maquis / Hôtels / Revendeurs)" data-suggested-amount="250000" data-reward="Lot Pro B2B à tarif préférentiel (-18%) + Livraison prioritaire Abidjan / Sous-région">
                <label for="mode-b2b">
                  <strong>Préachat Professionnel B2B (dès 100 000 FCFA)</strong> — Réservation de cartons de Sticks, Pots ou Sacs 1kg/25kg pour Maquis, Hôtels, Supermarchés et Grossistes
                </label>
              </div>
              <div class="radio-option">
                <input type="radio" id="mode-invest" name="contributionMode" value="Investissement Productif / Co-financement Machine & BFR" data-suggested-amount="1000000" data-reward="Convention Partenaire Pilote + Visite Plantation Brofodoumé & Atelier + Reporting trimestriel">
                <label for="mode-invest">
                  <strong>Co-Financement Machine / BFR Collecte (dès 500 000 FCFA)</strong> — Financement participatif adossé aux équipements de l’atelier pilote ou au rachat de stock coopérative
                </label>
              </div>
            </fieldset>

            <div class="field">
              <label for="targetPole">2. Pôle d’investissement que vous souhaitez flécher</label>
              <span id="pole-hint" class="hint">Sélectionnez le pôle prioritaire que votre contribution soutiendra en premier.</span>
              <select id="targetPole" name="targetPole" aria-describedby="pole-hint">
                <option value="Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)">Pôle 1 (Priorité 1) — Machines Mouture, Sticks, Zips, Bouteilles &amp; Garage Pilote</option>
                <option value="Pôle 2 — Fonds de Roulement (BFR) Collecte Coopérative">Pôle 2 (Priorité 1) — BFR Rachat Poivre Séché Standardisé (25-40 Planteurs)</option>
                <option value="Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)">Pôle 3 (Étape 2) — Séchoirs, Fûts à Vannes, Égraineuse &amp; Atomiseurs Partenaires</option>
              </select>
            </div>

            <div class="field">
              <label for="amountFcfa">3. Montant de votre engagement (en FCFA) <span aria-hidden="true">*</span></label>
              <span id="amount-hint" class="hint">Montant numérique sans espace (minimum 5 000 FCFA). Ex : 30000, 250000, 1500000.</span>
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9]{4,10}"
                id="amountFcfa"
                name="amountFcfa"
                value="30000"
                required
                aria-describedby="amount-hint"
                data-error="amount-error"
                enterkeyhint="next"
              >
              <div id="amount-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Veuillez entrer un montant valide en chiffres uniquement (au moins 5 000 FCFA, ex: 30000).
              </div>
            </div>

            <div class="field">
              <label for="rewardLabel">Contrepartie / Lot réservé associé</label>
              <input
                type="text"
                id="rewardLabel"
                name="rewardLabel"
                value="Pack Découverte : 2 Coffrets Prestige 3 Poivres + 2 Boîtes de 50 Sticks (Pur & Curcuma)"
                required
              >
            </div>

            <div class="field">
              <label for="contributorName">4. Nom complet ou Raison sociale <span aria-hidden="true">*</span></label>
              <span id="name-hint" class="hint">Votre nom complet ou celui de votre entreprise / diaspora.</span>
              <input
                type="text"
                id="contributorName"
                name="contributorName"
                autocomplete="name"
                required
                minlength="2"
                maxlength="120"
                aria-describedby="name-hint"
                data-error="name-error"
                enterkeyhint="next"
              >
              <div id="name-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Veuillez indiquer votre nom complet ou le nom de votre structure.
              </div>
            </div>

            <div class="field">
              <label for="contributorType">Profil du contributeur</label>
              <select id="contributorType" name="contributorType">
                <option value="Soutien Particulier / Consommateur">Particulier / Amateur du Terroir Ivoirien</option>
                <option value="Investisseur Diaspora">Membre de la Diaspora Ivoirienne / Africaine</option>
                <option value="Partenaire B2B (Hôtel / Restaurant / Maquis / Supermarché)">Professionnel B2B (Hôtel, Restaurant, Maquis, Supermarché)</option>
                <option value="Investisseur / Business Angel Local">Investisseur / Business Angel Local</option>
              </select>
            </div>

            <div class="field">
              <label for="email">5. Adresse e-mail <span aria-hidden="true">*</span></label>
              <span id="email-hint" class="hint">Format : vous@exemple.com (pour l’envoi de votre certificat d’engagement).</span>
              <input
                type="email"
                id="email"
                name="email"
                autocomplete="email"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                required
                aria-describedby="email-hint"
                data-error="email-error"
                enterkeyhint="next"
              >
              <div id="email-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Entrez une adresse e-mail valide au format vous@exemple.com.
              </div>
            </div>

            <div class="field">
              <label for="phone">6. Téléphone / WhatsApp <span aria-hidden="true">*</span></label>
              <span id="phone-hint" class="hint">Ex : +225 07 08 25 73 76 ou numéro international WhatsApp.</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                autocomplete="tel"
                required
                minlength="8"
                aria-describedby="phone-hint"
                data-error="phone-error"
                enterkeyhint="next"
              >
              <div id="phone-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Veuillez saisir un numéro de téléphone ou WhatsApp joignable.
              </div>
            </div>

            <div class="field">
              <label for="countryCity">Ville &amp; Pays</label>
              <input
                type="text"
                id="countryCity"
                name="countryCity"
                autocomplete="address-level2"
                value="Abidjan, Côte d'Ivoire"
                enterkeyhint="next"
              >
            </div>

            <div class="field">
              <label for="message">Message ou précision sur votre soutien (optionnel)</label>
              <textarea id="message" name="message" rows="3"></textarea>
            </div>

            <button type="submit" id="submit-pledge-btn" class="btn-primary" style="width: 100%; justify-content: center; font-size: 1.05rem;">
              Valider mon Engagement sur la Campagne 50M FCFA
            </button>
          </form>
        </div>

        <!-- Flux des derniers soutiens & engagements -->
        <div>
          <div class="form-card" style="margin-block-end: 1.5rem;">
            <h3 style="margin-block-start: 0; color: var(--forest);">Derniers Contributeurs &amp; Précommandes (${pledges.length})</h3>
            <div class="pledge-feed">
              ${pledges
                .slice(0, 6)
                .map(
                  (p) => `<div class="pledge-item">
                    <div style="display: flex; justify-content: space-between; gap: 0.5rem; font-weight: 700; color: var(--forest);">
                      <span>${escapeHtml(p.contributorName)}</span>
                      <span style="color: var(--gold);">${formatFcfa(p.amountFcfa)}</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--muted); margin-block: 0.2rem;">
                      ${escapeHtml(p.contributorType)} • ${escapeHtml(p.countryCity)} • <strong>${escapeHtml(p.contributionMode)}</strong>
                    </div>
                    <div style="font-size: 0.85rem; margin-block-top: 0.35rem;">
                      🎁 <em>${escapeHtml(p.rewardLabel)}</em>
                    </div>
                    ${p.message ? `<p style="margin: 0.4rem 0 0; font-size: 0.85rem; color: var(--text);">« ${escapeHtml(p.message)} »</p>` : ''}
                  </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="form-card">
            <h3 style="margin-block-start: 0; color: var(--forest);">Preuves Commerciales B2B Déjà Signées (${b2bContracts.length} LOI)</h3>
            <p style="font-size: 0.88rem; color: var(--muted);">
              Le dossier financier initial soulignait l’importance de documenter les ventes par des lettres d’intention (LOI). Voici les contrats générés via notre portail B2B :
            </p>
            <div class="pledge-feed">
              ${b2bContracts
                .slice(0, 4)
                .map(
                  (c) => `<div class="pledge-item">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--forest);">
                      <span>${escapeHtml(c.companyName)}</span>
                      <span>${formatFcfa(c.annualEstimatedValueFcfa)} / an</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--muted);">
                      ${escapeHtml(c.businessType)} • ${escapeHtml(c.monthlyVolumeKg)} kg/mois • <span style="color: var(--success); font-weight: 700;">${escapeHtml(c.status)}</span>
                    </div>
                  </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Modal Dialog with light-dismiss (closedby="any") from modern-web-guidance -->
  <dialog id="dialog-certificats" closedby="any" aria-labelledby="dialog-cert-title">
    <h2 id="dialog-cert-title" style="margin-block-start: 0; color: var(--forest);">
      Certificat GLOBALG.A.P. (Ecocert) &amp; Attestation Officielle de Plantation
    </h2>
    <p style="font-size: 0.9rem; color: var(--muted);">
      Documents officiels délivrés à la <strong>Société Coopérative des Producteurs de Poivre d’Éburnie (SCPPE)</strong> et à sa Présidente <strong>Mme ATSE Chiepo Solange épouse Diabagaté</strong>. Cliquez à l’extérieur ou appuyez sur Échap pour fermer.
    </p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-block: 1rem;">
      <div>
        <strong style="display: block; margin-block-end: 0.4rem;">1. Certificat GLOBALG.A.P. (GGN 4063651592948)</strong>
        <img src="/images/certificat-globalgap.jpg" alt="Certificat GLOBALG.A.P. Ecocert" style="width: 100%; border-radius: 10px; border: 1px solid var(--border);">
      </div>
      <div>
        <strong style="display: block; margin-block-end: 0.4rem;">2. Attestation Ministère de l'Agriculture (10 ha)</strong>
        <img src="/images/attestation-plantation.jpg" alt="Attestation de Plantation 10 hectares Brofodoumé" style="width: 100%; border-radius: 10px; border: 1px solid var(--border);">
      </div>
    </div>
    <form method="dialog" style="display: flex; justify-content: flex-end;">
      <button type="submit" class="btn-primary" autofocus>Fermer l’aperçu</button>
    </form>
  </dialog>

  <footer>
    <div class="container" style="padding-block: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem;">
      <div>
        <strong style="font-size: 1.1rem; color: #fff;">LE COMPTOIR DU POIVRE DE CÔTE D’IVOIRE — PLANTATION SOPPI</strong>
        <p style="margin: 0.4rem 0; font-size: 0.9rem;">
          Société Coopérative des Producteurs de Poivre d’Éburnie (SCPPE) • Brofodoumé, Azaguié, Yakassé Mé &amp; Abidjan<br>
          Contact WhatsApp Direct : +225 07 08 25 73 76 • Traçabilité GGN : 00120-VFXTV-0004
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <a href="http://localhost:3001" style="color: #ffe3ae;">1. Site Financement (Port 3001)</a>
        <a href="http://localhost:3002" style="color: #ffe3ae;">2. Boutique E-Commerce B2C/B2B (Port 3002)</a>
        <a href="http://localhost:3003" style="color: #ffe3ae;">3. SaaS Coopérative &amp; Stocks (Port 3003)</a>
      </div>
    </div>
  </footer>

  <script>
    // 1. Radio mode selector updates suggested amount & reward
    document.querySelectorAll('input[name="contributionMode"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const amountInput = document.getElementById('amountFcfa');
          const rewardInput = document.getElementById('rewardLabel');
          if (radio.dataset.suggestedAmount) amountInput.value = radio.dataset.suggestedAmount;
          if (radio.dataset.reward) rewardInput.value = radio.dataset.reward;
        }
      });
    });

    // 2. Dialog opener & light-dismiss fallback (from modern-web-guidance)
    document.querySelectorAll('[data-open-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dlg = document.getElementById(btn.dataset.openDialog);
        if (dlg) dlg.showModal();
      });
    });

    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      dialog.addEventListener('close', () => {
        dialog.returnValue = '';
      });
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dialog.close();
        });
      }
    }

    // 3. Tabs with hidden="until-found" & beforematch sync (from modern-web-guidance)
    document.querySelectorAll('.tabs').forEach((tabContainer) => {
      const tabs = Array.from(tabContainer.querySelectorAll('.tablist button'));
      const panels = Array.from(tabContainer.querySelectorAll('[role="tabpanel"]'));

      function selectTab(selected) {
        for (const tab of tabs) {
          const isSelected = tab === selected;
          tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          tab.toggleAttribute('focusgroupstart', isSelected);
        }
        for (const panel of panels) {
          const isMatch = panel.getAttribute('aria-labelledby') === selected.id;
          if (isMatch) {
            panel.removeAttribute('hidden');
            panel.setAttribute('tabindex', '0');
          } else {
            panel.setAttribute('hidden', 'until-found');
            panel.removeAttribute('tabindex');
          }
        }
        selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('focus', () => selectTab(tab));
      });

      panels.forEach((panel) => {
        panel.addEventListener('beforematch', () => {
          const associatedTab = document.getElementById(panel.getAttribute('aria-labelledby'));
          if (associatedTab) selectTab(associatedTab);
        });
      });
    });

    // 4. Form validation after interaction + ARIA live sync (from modern-web-guidance)
    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);
    let announceTimer;
    let announcedField;

    const spokenText = (node) => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      copy.querySelectorAll('[role="img"][aria-label]').forEach((n) =>
        n.replaceWith(n.getAttribute('aria-label') + ': ')
      );
      return copy.textContent.replace(/\\s+/g, ' ').trim();
    };

    const announceError = (el) => {
      const error = document.getElementById(el.dataset.error);
      if (!error) return;
      const label = el.labels?.[0] ? spokenText(el.labels[0]) + ': ' : '';
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = label + spokenText(error);
      }, 500);
    };

    const flagged = new WeakSet();
    const announced = new WeakSet();
    const syncAria = (el, announce = false) => {
      if (!el.matches?.('input, select, textarea')) return;
      const invalid = el.matches(':user-invalid') || el.classList.contains('user-invalid-fallback');
      if (invalid) {
        if (announce && !announced.has(el)) {
          announceError(el);
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
        announced.delete(el);
        if (announcedField === el) {
          clearTimeout(announceTimer);
          announcer.textContent = '';
        }
      }
    };

    document.querySelectorAll('input, select, textarea').forEach((el) => syncAria(el));
    document.addEventListener('blur', (e) => syncAria(e.target, true), true);
    document.addEventListener('input', (e) => {
      if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
    });
    document.addEventListener('change', (e) => syncAria(e.target, true), true);
    document.addEventListener(
      'invalid',
      (e) => {
        e.target.classList.add('user-invalid-fallback');
        announced.add(e.target);
        syncAria(e.target);
      },
      true
    );

    const pledgeForm = document.getElementById('pledge-form');
    if (pledgeForm) {
      pledgeForm.addEventListener('submit', (e) => {
        if (!pledgeForm.checkValidity()) {
          e.preventDefault();
          const firstInvalid = pledgeForm.querySelector(':invalid');
          if (firstInvalid) firstInvalid.focus();
          return;
        }
        const btn = document.getElementById('submit-pledge-btn');
        if (btn) btn.disabled = true;
      });
    }
  </script>
</body>
</html>`;

  res.send(html);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 [App 1 - Financement Participatif 50M FCFA] en ligne sur http://localhost:${PORT}`);
  });
}

module.exports = app;

