const express = require('express');
const path = require('path');
const {
  getEcosystemSummary,
  updateMachineBudget,
  addMachineItem,
  addQualityLot,
  addOrUpdateProducer
} = require('../../packages/database');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../../shared-assets/images')));

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

app.post('/api/machine/update', (req, res) => {
  try {
    const { id, name, estimatedCostFcfa, priceStatus, priority, supplierNote } = req.body;
    updateMachineBudget(id, {
      name,
      estimatedCostFcfa: Number(estimatedCostFcfa),
      priceStatus,
      priority,
      supplierNote
    });
    return res.redirect('/?updated=machine#machines');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/api/machine/add', (req, res) => {
  try {
    const { pole, name, category, description, estimatedCostFcfa, priceStatus, priority, supplierNote } = req.body;
    addMachineItem({
      pole,
      name,
      category,
      description,
      estimatedCostFcfa: Number(estimatedCostFcfa || 0),
      priceStatus,
      priority,
      supplierNote
    });
    return res.redirect('/?updated=machine#machines');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/api/producer/add', (req, res) => {
  try {
    const {
      fullName,
      roleTitle,
      locality,
      regionPole,
      hectares,
      variety,
      driedStockAvailableKg,
      phone,
      trainingStatus
    } = req.body;

    addOrUpdateProducer({
      fullName,
      roleTitle,
      locality,
      regionPole,
      hectares: Number(hectares || 2),
      variety,
      driedStockAvailableKg: Number(driedStockAvailableKg || 50),
      phone,
      trainingStatus,
      checklist: {
        nurseryShade: Boolean(req.body.chk_nursery),
        livingTutorsGlyricidia: Boolean(req.body.chk_tutors),
        phytosanitaryCompliant: Boolean(req.body.chk_phyto),
        secateurHarvestYellowGrain: Boolean(req.body.chk_harvest),
        blanching3MinOrRetting10Days: Boolean(req.body.chk_post),
        moisture12To13Percent: Boolean(req.body.chk_moisture)
      }
    });
    return res.redirect('/?updated=producer#producteurs');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/api/lot/add', (req, res) => {
  try {
    const {
      lotCode,
      pepperType,
      variety,
      producerName,
      originLocality,
      weightKg,
      moisturePercent,
      caliberMm,
      processingMethod
    } = req.body;

    addQualityLot({
      lotCode,
      pepperType,
      variety,
      producerName,
      originLocality,
      weightKg: Number(weightKg || 100),
      moisturePercent: Number(moisturePercent || 12.3),
      caliberMm,
      processingMethod
    });
    return res.redirect('/?updated=lot#lots');
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.get('/', (req, res) => {
  const data = getEcosystemSummary();
  const { campaign, machines, producers, sites, lots, pledges, b2bContracts, orders, metrics } = data;
  const updatedFlag = req.query.updated || '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Coopérative SCPPE &amp; Pilotage Exploitation — Plantation Soppi</title>
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
      --bg: #f3f6f4;
      --surface: #ffffff;
      --surface-alt: #e8efea;
      --forest: #0f3121;
      --forest-mid: #1b4d35;
      --gold: #c68624;
      --gold-soft: #f9ebd2;
      --text: #16211b;
      --muted: #506157;
      --border: #cbd8d0;
      --accent: #0f3121;
      --success: #188038;
      --danger: #d93025;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }

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

    .saas-header {
      background: var(--forest);
      color: #fff;
      padding: 1rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border-block-end: 3px solid var(--gold);
    }

    .saas-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .saas-badge {
      background: var(--gold);
      color: #16211b;
      font-weight: 800;
      padding: 0.35rem 0.7rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .app-switcher {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
    }

    .app-switcher a {
      color: #ffe2ad;
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 700;
      padding: 0.4rem 0.75rem;
      border: 1px solid rgba(255, 226, 173, 0.35);
      border-radius: 8px;
    }

    .container {
      max-width: 1320px;
      margin-inline: auto;
      padding: 1.75rem 1.25rem;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-block-end: 1.75rem;
    }

    .kpi-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-inline-start: 5px solid var(--forest);
      border-radius: 12px;
      padding: 1rem 1.15rem;
    }

    .kpi-box span {
      font-size: 0.8rem;
      color: var(--muted);
      font-weight: 600;
      text-transform: uppercase;
    }

    .kpi-box strong {
      display: block;
      font-size: 1.35rem;
      color: var(--forest);
      margin-block: 0.2rem;
    }

    .kpi-box small {
      font-size: 0.8rem;
      color: var(--muted);
    }

    /* Tabs from modern-web-guidance */
    .tabs {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
    }

    .tablist.scroller {
      display: flex;
      gap: 0.4rem;
      overflow-x: auto;
      border-block-end: 2px solid var(--border);
      margin-block-end: 1.5rem;
    }

    .tablist button {
      flex: none;
      position: relative;
      background: transparent;
      border: 0;
      padding: 0.85rem 1.15rem;
      font: inherit;
      font-weight: 700;
      color: var(--muted);
      cursor: pointer;
      min-height: 48px;
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

    .tabpanel-inner {
      padding: 0.25rem;
    }

    /* Responsive Tables from modern-web-guidance */
    .table-wrapper {
      overflow: auto;
      max-inline-size: 100%;
      max-block-size: min(620px, 80vh);
      container-type: inline-size;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      margin-block-end: 1.5rem;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      --label-2: "Détail";
      --label-3: "Indicateur";
      --label-4: "Montant / Stock";
      --label-5: "Statut";
      --label-6: "Action";
    }

    caption {
      text-align: start;
      padding: 0.85rem 1rem;
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
      padding: 0.8rem 0.95rem;
      text-align: start;
      border-block-end: 1px solid var(--border);
      font-size: 0.9rem;
      vertical-align: top;
    }

    tbody th {
      position: sticky;
      inset-inline-start: 0;
      background: var(--surface);
      color: var(--forest);
      font-weight: 700;
    }

    @container (width < 680px) {
      table, thead, tbody, tr, th, td { display: block; }
      thead { display: none; }
      tr { margin-block-end: 1rem; border: 1px solid var(--border); border-radius: 10px; }
      tbody th { position: sticky; inset-block-start: 0; z-index: 2; background: var(--surface-alt); }
      td:nth-child(2)::before { content: var(--label-2) ": "; font-weight: 700; }
      td:nth-child(3)::before { content: var(--label-3) ": "; font-weight: 700; }
      td:nth-child(4)::before { content: var(--label-4) ": "; font-weight: 700; }
      td:nth-child(5)::before { content: var(--label-5) ": "; font-weight: 700; }
      td:nth-child(6)::before { content: var(--label-6) ": "; font-weight: 700; }
    }

    .btn-primary {
      background: var(--forest);
      color: #fff;
      border: 2px solid var(--forest);
      border-radius: 9px;
      padding: 0.55rem 1rem;
      font-weight: 700;
      cursor: pointer;
      min-height: 44px;
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--forest);
      border: 1.5px solid var(--forest);
      border-radius: 9px;
      padding: 0.45rem 0.85rem;
      font-weight: 700;
      cursor: pointer;
      min-height: 40px;
    }

    .chip {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 700;
      background: var(--gold-soft);
      color: #6b4306;
    }

    .chip.ok {
      background: #dff3e5;
      color: #0d5225;
    }

    .site-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .site-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      background: var(--surface-alt);
      padding: 1.25rem;
      border-radius: 14px;
      border: 1px solid var(--border);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--forest);
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      font: inherit;
      font-size: max(1rem, 1em);
      padding: 0.6rem 0.75rem;
      min-height: 46px;
      border: 1.5px solid #6b7870;
      border-radius: 8px;
      background: #fff;
    }

    dialog {
      border: 2px solid var(--forest);
      border-radius: 16px;
      padding: 1.5rem;
      max-width: 580px;
      width: min(92vw, 580px);
      background: var(--surface);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
    }

    dialog:modal { overscroll-behavior: contain; }
    dialog::backdrop {
      overflow: hidden;
      overscroll-behavior: contain;
      background-color: rgba(10, 24, 16, 0.65);
      backdrop-filter: blur(3px);
    }

    .alert-banner {
      background: #dff3e5;
      border: 2px solid var(--success);
      color: #0d5225;
      padding: 0.9rem 1.15rem;
      border-radius: 10px;
      margin-block-end: 1.25rem;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <header class="saas-header">
    <div class="saas-brand">
      <span class="saas-badge">ERP / SaaS COOPÉRATIVE</span>
      <div>
        <strong style="font-size: 1.1rem; display: block;">PORTAIL DE GESTION — PLANTATION SOPPI &amp; COOPÉRATIVE SCPPE</strong>
        <span style="font-size: 0.82rem; color: #cfe0d6;">Standardisation CNRA/FIRCA • Lieux de Stockage &amp; Traitement • Pilotage des Devis Machines (50M FCFA)</span>
      </div>
    </div>
    <div class="app-switcher">
      <a href="http://localhost:3001">↗ Voir Site Financement 50M (Port 3001)</a>
      <a href="http://localhost:3002">↗ Voir Boutique B2C/B2B (Port 3002)</a>
    </div>
  </header>

  <main class="container">
    ${
      updatedFlag
        ? `<div role="status" class="alert-banner">
            ✅ Mise à jour enregistrée (${escapeHtml(updatedFlag)}) et synchronisée instantanément avec le Site de Financement (Port 3001) et la Boutique E-Commerce (Port 3002) !
          </div>`
        : ''
    }

    <div class="kpi-row">
      <div class="kpi-box">
        <span>Budget Machines &amp; Pôles</span>
        <strong>${formatFcfa(metrics.totalEstimatedMachinesFcfa)}</strong>
        <small>Cible Campagne : ${formatFcfa(campaign.targetAmountFcfa)} (100% éditable)</small>
      </div>
      <div class="kpi-box">
        <span>Financement &amp; Précommandes</span>
        <strong>${formatFcfa(metrics.raisedTotalFcfa)} (${metrics.progressPercent}%)</strong>
        <small>${pledges.length} engagements enregistrés sur Port 3001</small>
      </div>
      <div class="kpi-box">
        <span>Coopérative &amp; Standardisation</span>
        <strong>32 Planteurs (${metrics.avgStandardizationScore}% CNRA)</strong>
        <small>Cible : 25–40 partenaires • ${metrics.totalHectares} ha suivis</small>
      </div>
      <div class="kpi-box">
        <span>Stock Sec &amp; Contrats B2B</span>
        <strong>${metrics.totalDriedStockKg} kg secs • ${b2bContracts.length} LOI</strong>
        <small>${formatFcfa(metrics.totalB2bAnnualCommitmentsFcfa)}/an de contrats B2B</small>
      </div>
    </div>

    <div class="tabs">
      <div class="tablist scroller" focusgroup="tablist nomemory" aria-label="Modules du SaaS Coopérative Soppi">
        <button type="button" id="tab-machines" aria-selected="true" focusgroupstart>
          1. Devis Machines &amp; Paliers 50M (${machines.length})
        </button>
        <button type="button" id="tab-producteurs" aria-selected="false">
          2. Producteurs (25–40) &amp; Formation CNRA (${producers.length} pôles/groupes)
        </button>
        <button type="button" id="tab-lots" aria-selected="false">
          3. Réception Lots Séchés (12–13%) &amp; QR (${lots.length})
        </button>
        <button type="button" id="tab-sites" aria-selected="false">
          4. Lieux de Stockage, Traitement &amp; Flux (${sites.length} sites)
        </button>
      </div>

      <!-- ONGLET 1 : MACHINES & BUDGETS DYNAMIQUES -->
      <div role="tabpanel" aria-labelledby="tab-machines" tabindex="0">
        <div class="tabpanel-inner">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-block-end: 1rem;">
            <div>
              <h2 style="margin: 0; color: var(--forest);">Configurateur des Coûts Machines &amp; Pôles d’Investissement</h2>
              <p style="margin: 0.25rem 0 0; color: var(--muted); font-size: 0.9rem;">
                Vous n’avez pas encore les prix définitifs de certaines machines ? Modifiez ici à tout moment les montants estimatifs ou le statut des devis : le Site de Financement Participatif (Port 3001) se met à jour instantanément.
              </p>
            </div>
          </div>

          <div tabindex="0" role="region" aria-labelledby="cap-saas-machines" class="table-wrapper">
            <table>
              <caption id="cap-saas-machines">Postes d’investissement (Atelier Garage Mme Soppi, BFR Collecte &amp; Zone Brouillon/Amont)</caption>
              <thead>
                <tr>
                  <th scope="col">Machine / Poste</th>
                  <th scope="col">Pôle &amp; Catégorie</th>
                  <th scope="col">Note Technique</th>
                  <th scope="col">Coût Estimatif (FCFA)</th>
                  <th scope="col">Statut du Prix / Devis</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                ${machines
                  .map(
                    (m) => `<tr>
                      <th scope="row">${escapeHtml(m.name)}<br><small style="color: var(--muted);">${escapeHtml(m.id)}</small></th>
                      <td><strong>${escapeHtml(m.pole.split('—')[0])}</strong><br><small>${escapeHtml(m.category)}</small></td>
                      <td>${escapeHtml(m.description)}<br><small style="color: var(--forest);"><em>${escapeHtml(m.supplierNote)}</em></small></td>
                      <td><strong style="font-size: 1rem; color: var(--forest);">${formatFcfa(m.estimatedCostFcfa)}</strong></td>
                      <td>
                        <span class="chip ${m.priceStatus.includes('Validé') ? 'ok' : ''}">${escapeHtml(m.priceStatus)}</span><br>
                        <small style="color: var(--muted);">${escapeHtml(m.priority)}</small>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="btn-secondary"
                          data-edit-machine='${escapeHtml(JSON.stringify(m))}'
                        >
                          ✏️ Modifier Prix / Devis
                        </button>
                      </td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <h3 style="color: var(--forest); margin-block-end: 0.6rem;">Ajouter un nouvel équipement ou poste de dépense</h3>
          <form action="/api/machine/add" method="POST" class="form-grid" aria-label="Ajouter une machine">
            <div class="field">
              <label for="new-m-name">Nom de la machine / poste *</label>
              <input type="text" id="new-m-name" name="name" required>
            </div>
            <div class="field">
              <label for="new-m-pole">Pôle d’affectation</label>
              <select id="new-m-pole" name="pole">
                <option value="Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)">Pôle 1 — Priorité Atelier Garage (Mouture, Emballage, Calibrage)</option>
                <option value="Pôle 2 — Fonds de Roulement (BFR) Collecte Coopérative">Pôle 2 — BFR Collecte Coopérative</option>
                <option value="Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)">Pôle 3 — Zone Brouillon / Étape 2 (Séchage, Égrainage, Atomiseurs)</option>
              </select>
            </div>
            <div class="field">
              <label for="new-m-cost">Coût estimatif (FCFA) *</label>
              <input type="text" inputmode="numeric" id="new-m-cost" name="estimatedCostFcfa" value="1500000" required>
            </div>
            <div class="field">
              <label for="new-m-status">Statut du devis</label>
              <select id="new-m-status" name="priceStatus">
                <option value="Estimatif (Devis fournisseur à confirmer)">Estimatif (Devis fournisseur à confirmer)</option>
                <option value="Devis fournisseur reçu">Devis fournisseur reçu</option>
                <option value="Devis Validé & Fermé">Devis Validé &amp; Fermé</option>
              </select>
            </div>
            <div class="field">
              <label for="new-m-desc">Description opérationnelle</label>
              <input type="text" id="new-m-desc" name="description" required>
            </div>
            <div class="field" style="justify-content: flex-end;">
              <button type="submit" class="btn-primary">+ Ajouter au Plan d’Investissement</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ONGLET 2 : PRODUCTEURS & STANDARDISATION CNRA -->
      <div role="tabpanel" aria-labelledby="tab-producteurs" hidden="until-found">
        <div class="tabpanel-inner">
          <h2 style="margin-block-start: 0; color: var(--forest);">
            Encadrement, Formation &amp; Standardisation des 25–40 Producteurs Partenaires (Protocole CNRA / FIRCA)
          </h2>
          <p style="color: var(--muted); font-size: 0.9rem;">
            Suivi de l’itinéraire technique issu du guide CNRA/FIRCA : boutures 2–3 nœuds sous ombrière, tuteurs vivants <em>Glyricidia</em> (2m×2m), récolte au sécateur dès le 1er grain jaune, ébouillantage 3 min / rouissage 10j, et séchage sur grillage plastique à 12–13% d’humidité.
          </p>

          <div tabindex="0" role="region" aria-labelledby="cap-producers" class="table-wrapper">
            <table>
              <caption id="cap-producers">Réseau des producteurs partenaires de la Coopérative SCPPE &amp; Groupements affiliés</caption>
              <thead>
                <tr>
                  <th scope="col">Producteur / Pôle</th>
                  <th scope="col">Localité &amp; Surface</th>
                  <th scope="col">Variétés CNRA</th>
                  <th scope="col">Checklist Standardisation (6 critères CNRA)</th>
                  <th scope="col">Score &amp; Statut</th>
                  <th scope="col">Stock Sec Dispo</th>
                </tr>
              </thead>
              <tbody>
                ${producers
                  .map((p) => {
                    const c = p.checklist || {};
                    return `<tr>
                      <th scope="row">
                        ${escapeHtml(p.fullName)}<br>
                        <small style="color: var(--muted);">${escapeHtml(p.code)} • ${escapeHtml(p.roleTitle)}</small><br>
                        <small>📞 ${escapeHtml(p.phone)}</small>
                      </th>
                      <td><strong>${escapeHtml(p.locality)}</strong><br><small>${escapeHtml(p.regionPole)} • ${p.hectares} ha</small></td>
                      <td>${escapeHtml(p.variety)}<br><small>Planté en ${p.plantingYear}</small></td>
                      <td style="font-size: 0.82rem;">
                        ${c.nurseryShade ? '✅' : '⏳'} Ombrière &amp; Boutures 2-3 nœuds<br>
                        ${c.livingTutorsGlyricidia ? '✅' : '⏳'} Tuteurs Glyricidia 2m×2m (2500/ha)<br>
                        ${c.phytosanitaryCompliant ? '✅' : '⏳'} Paillage &amp; Lutte phytosanitaire<br>
                        ${c.secateurHarvestYellowGrain ? '✅' : '⏳'} Récolte sécateur (1er grain jaune)<br>
                        ${c.blanching3MinOrRetting10Days ? '✅' : '⏳'} Ébouillantage 3m / Rouissage 10j<br>
                        ${c.moisture12To13Percent ? '✅' : '⏳'} Séchage grillage plastique (12-13%)
                      </td>
                      <td>
                        <span class="chip ${p.standardizationScore >= 90 ? 'ok' : ''}">Score : ${p.standardizationScore}%</span><br>
                        <small>${p.globalGapCertified ? '🏅 Certifié GLOBALG.A.P.' : escapeHtml(p.trainingStatus)}</small>
                      </td>
                      <td><strong style="color: var(--forest);">${p.driedStockAvailableKg} kg secs</strong></td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>

          <h3 style="color: var(--forest);">Enrôler et former un nouveau producteur partenaire (Expansion locale &amp; sous-régionale)</h3>
          <form action="/api/producer/add" method="POST" class="form-grid" aria-label="Ajouter un producteur partenaire">
            <div class="field">
              <label for="prod-name">Nom du planteur ou groupement *</label>
              <input type="text" id="prod-name" name="fullName" required>
            </div>
            <div class="field">
              <label for="prod-loc">Localité / Village *</label>
              <input type="text" id="prod-loc" name="locality" value="Aboisso / Sud-Comoé" required>
            </div>
            <div class="field">
              <label for="prod-ha">Superficie (ha) *</label>
              <input type="text" id="prod-ha" name="hectares" value="3.5" required>
            </div>
            <div class="field">
              <label for="prod-var">Variété CNRA</label>
              <select id="prod-var" name="variety">
                <option value="Muntok & Lampong (Clones CNRA)">Muntok &amp; Lampong (Clones CNRA)</option>
                <option value="Muntok (Gros grain - 5,2g/100gr sec)">Muntok (Gros grain)</option>
                <option value="Lampong (Haut rendement 1-2t/ha)">Lampong (Haut rendement)</option>
              </select>
            </div>
            <div class="field">
              <label for="prod-stock">Stock sec estimé (kg)</label>
              <input type="text" inputmode="numeric" id="prod-stock" name="driedStockAvailableKg" value="90">
            </div>
            <div class="field">
              <label for="prod-phone">Téléphone planteur</label>
              <input type="text" id="prod-phone" name="phone" value="+225 07 00 00 00 00">
            </div>
            <div class="field" style="grid-column: 1 / -1;">
              <span style="font-weight: 700; font-size: 0.88rem; color: var(--forest);">Étapes de standardisation déjà maîtrisées :</span>
              <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-block-top: 0.35rem;">
                <label><input type="checkbox" name="chk_nursery" checked> Pépinière ombrière</label>
                <label><input type="checkbox" name="chk_tutors" checked> Tuteurs Glyricidia 2m×2m</label>
                <label><input type="checkbox" name="chk_phyto" checked> Suivi phytosanitaire</label>
                <label><input type="checkbox" name="chk_harvest" checked> Récolte sécateur grain jaune</label>
                <label><input type="checkbox" name="chk_post" checked> Ébouillantage 3m / Rouissage 10j</label>
                <label><input type="checkbox" name="chk_moisture" checked> Séchage 12–13% humidité</label>
              </div>
            </div>
            <div class="field">
              <button type="submit" class="btn-primary">+ Intégrer à la Coopérative SCPPE</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ONGLET 3 : LOTS & CONTRÔLE QUALITÉ -->
      <div role="tabpanel" aria-labelledby="tab-lots" hidden="until-found">
        <div class="tabpanel-inner">
          <h2 style="margin-block-start: 0; color: var(--forest);">
            Réception des Lots Séchés, Contrôle d’Humidité (12–13%) &amp; Traçabilité QR
          </h2>
          <p style="color: var(--muted); font-size: 0.9rem;">
            Chaque lot réceptionné au Garage Central d’Abidjan est testé avant mise en stock hermétique. Tout lot enregistré ici génère un code traçable sur la Boutique E-Commerce (Port 3002).
          </p>

          <div tabindex="0" role="region" aria-labelledby="cap-lots" class="table-wrapper">
            <table>
              <caption id="cap-lots">Lots contrôlés et certifiés en stock</caption>
              <thead>
                <tr>
                  <th scope="col">Code Lot QR</th>
                  <th scope="col">Type &amp; Variété</th>
                  <th scope="col">Producteur &amp; Origine</th>
                  <th scope="col">Volume &amp; Humidité</th>
                  <th scope="col">Grade &amp; Conditionnement</th>
                  <th scope="col">Prix Rachat / kg</th>
                </tr>
              </thead>
              <tbody>
                ${lots
                  .map(
                    (l) => `<tr>
                      <th scope="row">${escapeHtml(l.lotCode)}<br><small>${escapeHtml(l.harvestDate)}</small></th>
                      <td><strong>${escapeHtml(l.pepperType)}</strong><br><small>${escapeHtml(l.variety)} • ${escapeHtml(l.caliberMm)}</small></td>
                      <td>${escapeHtml(l.producerName)}<br><small>${escapeHtml(l.originLocality)}</small></td>
                      <td>
                        <strong>${l.weightKg} kg</strong><br>
                        <span class="chip ${l.moisturePercent <= 13 ? 'ok' : ''}">Humidité : ${l.moisturePercent}%</span>
                      </td>
                      <td>
                        <strong>${escapeHtml(l.qualityGrade)}</strong><br>
                        <small>${escapeHtml(l.packagingState)}</small>
                      </td>
                      <td><strong>${formatFcfa(l.purchasePricePerKgFcfa)} / kg</strong></td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <h3 style="color: var(--forest);">Réceptionner et contrôler un nouveau lot de poivre séché partenaire</h3>
          <form action="/api/lot/add" method="POST" class="form-grid" aria-label="Enregistrer un lot de poivre">
            <div class="field">
              <label for="lot-code">Code Lot QR *</label>
              <input type="text" id="lot-code" name="lotCode" value="SOPPI-2026-N0${lots.length + 1}" required>
            </div>
            <div class="field">
              <label for="lot-type">Type de produit</label>
              <select id="lot-type" name="pepperType">
                <option value="Poivre Noir de la Mé (Séché Standardisé)">Poivre Noir de la Mé (Séché Standardisé)</option>
                <option value="Poivre Blanc Muntok (Rouissage 10j Eau Pure)">Poivre Blanc Muntok (Rouissage 10j)</option>
                <option value="Poivre Rouge Mature Séché Délicat">Poivre Rouge Mature Séché</option>
                <option value="Duo Poivre Noir + Curcuma Séché">Duo Poivre Noir + Curcuma Séché</option>
              </select>
            </div>
            <div class="field">
              <label for="lot-prod">Producteur partenaire *</label>
              <input type="text" id="lot-prod" name="producerName" value="Domaine Fiessou (Azaguié)" required>
            </div>
            <div class="field">
              <label for="lot-weight">Poids net sec (kg) *</label>
              <input type="text" inputmode="numeric" id="lot-weight" name="weightKg" value="120" required>
            </div>
            <div class="field">
              <label for="lot-moisture">Taux d’humidité mesuré (%) *</label>
              <input type="text" id="lot-moisture" name="moisturePercent" value="12.3" required>
            </div>
            <div class="field">
              <label for="lot-caliber">Calibre au tamis multi-étages</label>
              <input type="text" id="lot-caliber" name="caliberMm" value="4,7 mm (Grains Calibrés)">
            </div>
            <div class="field" style="justify-content: flex-end;">
              <button type="submit" class="btn-primary">Valider le Contrôle Qualité &amp; Générer QR</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ONGLET 4 : LIEUX DE STOCKAGE & DE TRAITEMENT -->
      <div role="tabpanel" aria-labelledby="tab-sites" hidden="until-found">
        <div class="tabpanel-inner">
          <h2 style="margin-block-start: 0; color: var(--forest);">
            Maillage des Lieux de Stockage et de Traitement (Hub Garage Central + Pôles Partenaires)
          </h2>
          <p style="color: var(--muted); font-size: 0.9rem;">
            Organisation agile : pré-traitement (égrainage, lavage, ébouillantage 3 min, rouissage 10j, séchage) sur les pôles partenaires en région, et finition haute valeur (calibrage, mouture poivre/curcuma, sticks, zips, bouteilles) dans le garage aménagé de Mme Soppi à Abidjan.
          </p>

          <div class="site-grid">
            ${sites
              .map(
                (s) => `<article class="site-card">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                    <span class="chip ok">${escapeHtml(s.code)}</span>
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--forest);">${s.currentStockKg} / ${s.capacityKg} kg</span>
                  </div>
                  <h3 style="margin: 0.5rem 0 0.25rem; color: var(--forest);">${escapeHtml(s.name)}</h3>
                  <div style="font-size: 0.84rem; color: var(--muted); margin-block-end: 0.65rem;">
                    📍 ${escapeHtml(s.locality)} • 👤 ${escapeHtml(s.managerName)}<br>
                    👷 Équipe : <strong>${s.permanentStaff} permanents</strong> + <strong>${s.onDemandStaff} à la demande</strong>
                  </div>
                  <div style="font-size: 0.84rem; margin-block-end: 0.6rem;">
                    <strong>Équipements affectés :</strong>
                    <ul style="margin: 0.25rem 0; padding-inline-start: 1.15rem;">
                      ${s.equipments.map((eq) => `<li>${escapeHtml(eq)}</li>`).join('')}
                    </ul>
                  </div>
                  <div style="font-size: 0.84rem;">
                    <strong>Opérations réalisées :</strong>
                    <ul style="margin: 0.25rem 0; padding-inline-start: 1.15rem;">
                      ${s.operations.map((op) => `<li>${escapeHtml(op)}</li>`).join('')}
                    </ul>
                  </div>
                </article>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Modal Dialog Édition Prix Machine (closedby="any") -->
  <dialog id="edit-machine-dialog" closedby="any" aria-labelledby="edit-machine-title">
    <h2 id="edit-machine-title" style="margin-block-start: 0; color: var(--forest);">Modifier le Prix / Devis de la Machine</h2>
    <p style="font-size: 0.88rem; color: var(--muted);">
      Toute modification enregistrée ici met à jour instantanément la vitrine d’Appel à Financement Participatif (Port 3001).
    </p>
    <form action="/api/machine/update" method="POST">
      <input type="hidden" id="edit-m-id" name="id">
      <div class="field" style="margin-block-end: 1rem;">
        <label for="edit-m-name">Désignation de la machine / poste</label>
        <input type="text" id="edit-m-name" name="name" required>
      </div>
      <div class="field" style="margin-block-end: 1rem;">
        <label for="edit-m-cost">Coût Estimatif ou Devis Fournisseur (FCFA)</label>
        <input type="text" inputmode="numeric" id="edit-m-cost" name="estimatedCostFcfa" required>
      </div>
      <div class="field" style="margin-block-end: 1rem;">
        <label for="edit-m-status">Statut du Prix / Devis</label>
        <select id="edit-m-status" name="priceStatus">
          <option value="Estimatif (Devis fournisseur à confirmer)">Estimatif (Devis fournisseur à confirmer)</option>
          <option value="Devis fournisseur reçu (En négociation)">Devis fournisseur reçu (En négociation)</option>
          <option value="Devis Validé & Fermé">Devis Validé &amp; Fermé</option>
          <option value="Enveloppe BFR modulable">Enveloppe BFR modulable</option>
        </select>
      </div>
      <div class="field" style="margin-block-end: 1rem;">
        <label for="edit-m-prio">Priorité de déploiement</label>
        <select id="edit-m-prio" name="priority">
          <option value="Priorité 1 — Démarrage immédiat">Priorité 1 — Démarrage immédiat (Garage Pilote)</option>
          <option value="Étape 2 — Pôles Partenaires & Amont">Étape 2 — Pôles Partenaires &amp; Amont (Zone Brouillon)</option>
        </select>
      </div>
      <div class="field" style="margin-block-end: 1.25rem;">
        <label for="edit-m-note">Note fournisseur / spécification hermétique</label>
        <input type="text" id="edit-m-note" name="supplierNote">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn-secondary" id="cancel-edit-machine">Annuler</button>
        <button type="submit" class="btn-primary">Enregistrer &amp; Synchroniser</button>
      </div>
    </form>
  </dialog>

  <script>
    // 1. Edit machine dialog
    const editDialog = document.getElementById('edit-machine-dialog');
    document.querySelectorAll('[data-edit-machine]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = JSON.parse(btn.dataset.editMachine);
        document.getElementById('edit-m-id').value = m.id;
        document.getElementById('edit-m-name').value = m.name;
        document.getElementById('edit-m-cost').value = m.estimatedCostFcfa;
        document.getElementById('edit-m-status').value = m.priceStatus;
        document.getElementById('edit-m-prio').value = m.priority;
        document.getElementById('edit-m-note').value = m.supplierNote || '';
        editDialog.showModal();
      });
    });

    document.getElementById('cancel-edit-machine')?.addEventListener('click', () => {
      editDialog.close();
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

    // 2. Tabs controller with hidden="until-found" & beforematch
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

      // Activate tab matching URL hash if present
      if (window.location.hash === '#producteurs') selectTab(document.getElementById('tab-producteurs'));
      if (window.location.hash === '#lots') selectTab(document.getElementById('tab-lots'));
      if (window.location.hash === '#sites') selectTab(document.getElementById('tab-sites'));
    });
  </script>
</body>
</html>`;

  res.send(html);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚙️ [App 3 - SaaS Coopérative, Stocks & Devis Machines] en ligne sur http://localhost:${PORT}`);
  });
}

module.exports = app;

