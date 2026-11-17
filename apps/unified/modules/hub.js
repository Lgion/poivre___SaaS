const { renderUnifiedBar } = require('./bar');

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

function renderHub(ecosystemSummary) {
  const { campaign, metrics, machines, pledges, b2bContracts, producers, lots, sites = [], orders = [] } = ecosystemSummary;

  const totalRaised = Number(metrics.raisedTotalFcfa || 0);
  const targetAmount = Number(campaign.targetAmountFcfa || 60000000);
  const percentRaised = Math.min(100, Math.round((totalRaised / targetAmount) * 100));

  const b2bCommitted = Number(metrics.totalB2bAnnualCommitmentsFcfa || 0);
  const ecomSales = Number(metrics.ecommerceSalesFcfa || 0);
  const totalCommercialVolume = b2bCommitted + ecomSales;

  const certifiedList = producers.filter((p) => p.globalGapCertified);
  const certifiedProducers = certifiedList.length;
  const machinesBudget = Number(metrics.totalEstimatedMachinesFcfa || 0);
  const totalCoopMembers = Number(metrics.activeFarmersCount || 37);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hub Écosystème Unifié — Le Comptoir du Poivre de Côte d'Ivoire (Coopérative SCPPE)</title>
  <style>
    :root {
      --bg: #f8f6f0;
      --surface: #ffffff;
      --surface-alt: #f0eae1;
      --forest: #102d1c;
      --forest-light: #1b492f;
      --gold: #c88a2b;
      --gold-dark: #9e6919;
      --text: #1d261e;
      --text-muted: #5e6b60;
      --border: #dfd7cb;
      --radius: 12px;
      --shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
    }
    .hub-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
    }
    .hero-banner {
      background: linear-gradient(135deg, #0e291a 0%, #174229 65%, #255839 100%);
      color: #fff;
      border-radius: var(--radius);
      padding: 2.5rem 2rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(16, 45, 28, 0.25);
      border: 1px solid rgba(200, 138, 43, 0.3);
    }
    .hero-banner::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(200, 138, 43, 0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tag-gold {
      background: rgba(200, 138, 43, 0.25);
      color: #f7d492;
      border: 1px solid rgba(200, 138, 43, 0.45);
    }
    .tag-white {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .hero-title {
      font-size: 2.1rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      font-size: 1.05rem;
      color: #d6e2d9;
      max-width: 900px;
      margin-bottom: 1.5rem;
    }
    .hero-promoter-strip {
      background: rgba(0, 0, 0, 0.25);
      border-left: 3px solid var(--gold);
      padding: 0.8rem 1.2rem;
      border-radius: 6px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.88rem;
    }
    .hero-promoter-name {
      font-weight: 700;
      color: #fff;
    }
    .hero-cert-code {
      color: #e2c082;
      font-family: monospace;
      font-size: 0.82rem;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.2rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.35rem 1.25rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      width: 100%;
      text-align: left;
      font: inherit;
      color: inherit;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 26px rgba(16, 45, 28, 0.13);
      border-color: var(--gold);
    }
    .kpi-card:focus-visible {
      outline: 3px solid var(--gold);
      outline-offset: 3px;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }
    .kpi-card.kpi-gold::before { background: var(--gold); }
    .kpi-card.kpi-green::before { background: var(--forest-light); }
    .kpi-card.kpi-blue::before { background: #2a6f97; }
    .kpi-card.kpi-dark::before { background: #4a5759; }

    .kpi-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
    }
    .kpi-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--forest);
      line-height: 1.2;
      margin-bottom: 0.45rem;
    }
    .kpi-subval {
      display: inline-block;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--gold-dark);
      background: #fcf3e3;
      border: 1px solid #ecd5ac;
      padding: 0.1rem 0.5rem;
      border-radius: 6px;
      vertical-align: middle;
    }
    .kpi-detail {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.45;
    }
    .kpi-more-cue {
      margin-top: 0.65rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--forest-light);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .kpi-progress {
      height: 7px;
      border-radius: 9999px;
      background: #e5ded5;
      margin-top: 0.6rem;
      overflow: hidden;
    }
    .kpi-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--gold), #e8a846);
      border-radius: 9999px;
    }

    /* Native Modal Dialogs (modern-web-guidance) */
    dialog.hub-dialog {
      border: 2px solid var(--forest);
      border-radius: 16px;
      padding: 0;
      max-width: 760px;
      width: min(92vw, 760px);
      margin: auto;
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 24px 52px rgba(0, 0, 0, 0.3);
    }
    dialog.hub-dialog:modal {
      overscroll-behavior: contain;
    }
    dialog.hub-dialog::backdrop {
      overflow: hidden;
      overscroll-behavior: contain;
      background-color: rgba(10, 26, 17, 0.65);
      backdrop-filter: blur(3px);
    }
    .hub-dialog-inner {
      padding: 1.5rem 1.65rem;
    }
    .hub-dialog-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.85rem;
      margin-bottom: 1rem;
    }
    .hub-dialog-head h3 {
      font-size: 1.25rem;
      color: var(--forest);
      font-weight: 800;
    }
    .hub-dialog-close {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      color: var(--forest);
      width: 36px;
      height: 36px;
      border-radius: 999px;
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
    }
    .hub-dialog-close:hover {
      background: #e6ddcf;
    }
    .hub-dialog-list {
      display: grid;
      gap: 0.65rem;
      margin: 0.9rem 0 1.25rem;
    }
    .hub-dialog-item {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      font-size: 0.88rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    /* Section Hub Applications */
    .section-title-wrap {
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--forest);
      letter-spacing: -0.01em;
    }
    .section-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .app-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .app-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .app-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      border-color: var(--gold);
    }
    .app-card-header {
      padding: 1.35rem 1.4rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .app-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .icon-invest { background: #fcf4e8; border: 1px solid #f2d9b6; }
    .icon-ecom { background: #eaf5ee; border: 1px solid #bce1c7; }
    .icon-saas { background: #eef3f7; border: 1px solid #c9dae8; }

    .app-card-title-group h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--forest);
      margin-bottom: 0.2rem;
    }
    .app-badge-target {
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .badge-invest { background: #fdf1de; color: #a66a15; }
    .badge-ecom { background: #e2f4e8; color: #166534; }
    .badge-saas { background: #e0ecf7; color: #1e40af; }

    .app-card-body {
      padding: 1.4rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .app-card-text {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.2rem;
      line-height: 1.5;
    }
    .app-features-list {
      list-style: none;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .app-features-list li {
      font-size: 0.84rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--text);
    }
    .app-features-list li span.tick {
      color: var(--gold);
      font-weight: 800;
    }
    .app-card-footer {
      border-top: 1px dashed var(--border);
      padding-top: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .app-stat-summary {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .app-stat-summary strong {
      display: block;
      color: var(--forest);
      font-size: 0.92rem;
    }
    .btn-launch {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.86rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .btn-launch-invest {
      background: var(--gold);
      color: #fff;
    }
    .btn-launch-invest:hover {
      background: var(--gold-dark);
      transform: translateX(2px);
    }
    .btn-launch-ecom {
      background: var(--forest);
      color: #fff;
    }
    .btn-launch-ecom:hover {
      background: var(--forest-light);
      transform: translateX(2px);
    }
    .btn-launch-saas {
      background: #1b4d3e;
      color: #fff;
    }
    .btn-launch-saas:hover {
      background: #103328;
      transform: translateX(2px);
    }

    /* Strategy Recap Box */
    .strategy-box {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.8rem;
      margin-bottom: 3rem;
    }
    .strategy-box h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--forest);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .strategy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.2rem;
      margin-top: 1rem;
    }
    .strategy-item {
      background: #fff;
      padding: 1.1rem;
      border-radius: 8px;
      border: 1px solid #ded5c7;
      font-size: 0.86rem;
    }
    .strategy-item strong {
      display: block;
      color: var(--forest);
      margin-bottom: 0.35rem;
      font-size: 0.9rem;
    }

    /* Footer */
    .hub-footer {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.84rem;
    }
    .hub-footer a {
      color: var(--gold-dark);
      font-weight: 600;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 1.6rem; }
      .hero-banner { padding: 1.5rem 1.2rem; }
      .app-cards-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  ${renderUnifiedBar('hub')}

  <main class="hub-container">

    <!-- Hero Banner -->
    <section class="hero-banner" aria-labelledby="hub-hero-title">
      <div class="hero-meta">
        <span class="tag tag-gold">🌿 Écosystème Unifié</span>
        <span class="tag tag-white">Phase Pilote Agile 60M FCFA</span>
        <span class="tag tag-white">Certifié Global GAP &amp; Ecocert</span>
      </div>
      <h1 class="hero-title" id="hub-hero-title">Le Comptoir du Poivre de Côte d'Ivoire</h1>
      <p class="hero-sub">
        Plateforme intégrée d'industrialisation et de valorisation de la filière poivre (<em>Piper nigrum</em>) : 
        Levée de fonds agile, transformation et commercialisation B2C, B2B, et standardisation qualité de 37 producteurs de la Coopérative SCPPE.
      </p>
      <div class="hero-promoter-strip">
        <div>
          <span style="color: #c88a2b;">Promotrice :</span> 
          <span class="hero-promoter-name">${escapeHtml(campaign.presidentName)}</span> 
          <span style="opacity: 0.85;">(${escapeHtml(campaign.cooperativeName)})</span>
        </div>
        <div class="hero-cert-code">${escapeHtml(campaign.certificationGgn)}</div>
      </div>
    </section>

    <!-- Key Metrics Grid (4 zones cliquables ouvrant des modales détaillées) -->
    <section class="kpi-grid" aria-label="Indicateurs clés de performance en temps réel">
      <button type="button" class="kpi-card kpi-gold" data-open-dialog="modal-kpi-funding">
        <div>
          <div class="kpi-label">🎯 Financement Participatif</div>
          <div class="kpi-val">${formatFcfa(totalRaised)}</div>
          <div class="kpi-detail">Objectif pilote : <strong>${formatFcfa(targetAmount)}</strong> (${percentRaised}%)</div>
        </div>
        <div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: ${percentRaised}%;"></div>
          </div>
          <span class="kpi-more-cue">Voir le détail des paliers &amp; souscriptions →</span>
        </div>
      </button>

      <button type="button" class="kpi-card kpi-green" data-open-dialog="modal-kpi-commercial">
        <div>
          <div class="kpi-label">🛒 Ventes &amp; Contrats B2B</div>
          <div class="kpi-val">${formatFcfa(totalCommercialVolume)}</div>
          <div class="kpi-detail"><strong>${b2bContracts.length}</strong> contrats cadres + <strong>${formatFcfa(ecomSales)}</strong> précommandes boutique</div>
        </div>
        <span class="kpi-more-cue">Voir les contrats B2B &amp; commandes →</span>
      </button>

      <button type="button" class="kpi-card kpi-blue" data-open-dialog="modal-kpi-producers">
        <div>
          <div class="kpi-label">🌾 Réseau Producteurs SCPPE</div>
          <div class="kpi-val">${certifiedProducers} Planteurs</div>
          <div class="kpi-detail">
            <strong>Certifiés Global GAP</strong><br>
            ${totalCoopMembers} membres producteurs dans la coopérative SCPPE
          </div>
        </div>
        <span class="kpi-more-cue">Découvrir les 3 terrains certifiés →</span>
      </button>

      <button type="button" class="kpi-card kpi-dark" data-open-dialog="modal-kpi-machines">
        <div>
          <div class="kpi-label">⚙️ Parc Machines Identifié</div>
          <div class="kpi-val">${machines.length} Équipements <span class="kpi-subval">de petites unités</span></div>
          <div class="kpi-detail">Budget devis : <strong>${formatFcfa(machinesBudget)}</strong> (Phase pilote ajustable en direct)</div>
        </div>
        <span class="kpi-more-cue">Voir la répartition par pôle →</span>
      </button>
    </section>

    <!-- The 3 Integrated Apps Cards -->
    <section class="section-title-wrap">
      <h2 class="section-title">Les 3 Pôles Opérationnels de l'Écosystème</h2>
      <p class="section-desc">Accédez directement à chacune des composantes spécialisées du projet.</p>
    </section>

    <div class="app-cards-grid">

      <!-- App 1: Crowdfunding -->
      <article class="app-card" aria-labelledby="app1-title">
        <header class="app-card-header">
          <div class="app-icon-wrap icon-invest">🚀</div>
          <div class="app-card-title-group">
            <span class="app-badge-target badge-invest">Application 1 • Investisseurs &amp; Précommandes</span>
            <h3 id="app1-title">Appel à Financement (60M)</h3>
          </div>
        </header>
        <div class="app-card-body">
          <p class="app-card-text">
            Vitrine d'investissement participatif et de précommandes pour lancer l'unité pilote de transformation (calibrage, mouture et conditionnement) à Abidjan avant l'étape industrielle.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Paliers d'adhésion de 10 000 à 5 000 000 FCFA avec récompenses</li>
            <li><span class="tick">✓</span> Fiches techniques des petites unités (broyeur inox, ensacheuse sticks...)</li>
            <li><span class="tick">✓</span> Preuves terrain, carte des membres certifiés et garanties agricoles</li>
          </ul>
          <footer class="app-card-footer">
            <div class="app-stat-summary">
              <strong>${percentRaised}% mobilisé</strong>
              ${pledges.length} souscriptions enregistrées
            </div>
            <a href="/invest" class="btn-launch btn-launch-invest">Ouvrir la Vitrine →</a>
          </footer>
        </div>
      </article>

      <!-- App 2: Ecommerce & B2B -->
      <article class="app-card" aria-labelledby="app2-title">
        <header class="app-card-header">
          <div class="app-icon-wrap icon-ecom">🛒</div>
          <div class="app-card-title-group">
            <span class="app-badge-target badge-ecom">Application 2 • B2C &amp; Négociation B2B</span>
            <h3 id="app2-title">Boutique &amp; Contrats B2B</h3>
          </div>
        </header>
        <div class="app-card-body">
          <p class="app-card-text">
            Comptoir commercial digital de la coopérative SCPPE : vente directe de poivre en grains/moulu, packs sticks nomades hermétiques, duo Curcuma + Poivre noir et contrats pour CHR / grossistes.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Catalogue à destination des particuliers et des grossistes</li>
            <li><span class="tick">✓</span> Commande directe et livraison Abidjan / sous-région</li>
            <li><span class="tick">✓</span> Contrat d'approvisionnement durable B2B / LOI avec tarifs annuels</li>
          </ul>
          <footer class="app-card-footer">
            <div class="app-stat-summary">
              <strong>${formatFcfa(totalCommercialVolume)}</strong>
              Engagés sur la saison 2026-2027
            </div>
            <a href="/boutique" class="btn-launch btn-launch-ecom">Ouvrir la Boutique →</a>
          </footer>
        </div>
      </article>

      <!-- App 3: Portail Cooperative Agricole -->
      <article class="app-card" aria-labelledby="app3-title">
        <header class="app-card-header">
          <div class="app-icon-wrap icon-saas">🏭</div>
          <div class="app-card-title-group">
            <span class="app-badge-target badge-saas">Application 3 • Gestion Interne SCPPE</span>
            <h3 id="app3-title">Portail Coopérative Agricole</h3>
          </div>
        </header>
        <div class="app-card-body">
          <p class="app-card-text">
            Plateforme de pilotage de la coopérative SCPPE : répertoire des 37 planteurs encadrés, réception des lots séchés avec test d'humidité &lt; 12-13% (CNRA), traçabilité QR et devis machines ajustables.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Répertoire et encadrement des 37 membres producteurs de poivre</li>
            <li><span class="tick">✓</span> Contrôle qualité et vérificateur public de traçabilité QR par lot</li>
            <li><span class="tick">✓</span> Gestionnaire en direct des prix et devis des équipements</li>
          </ul>
          <footer class="app-card-footer">
            <div class="app-stat-summary">
              <strong>${lots.length} lots réceptionnés</strong>
              Suivi humidité &amp; stockage conforme
            </div>
            <a href="/saas" class="btn-launch btn-launch-saas">Ouvrir le Portail →</a>
          </footer>
        </div>
      </article>

    </div>

    <!-- Strategy Summary Box -->
    <section class="strategy-box" aria-labelledby="strategy-title">
      <h4 id="strategy-title">💡 La Stratégie d'Industrialisation en Partenariat avec des Organismes Établis</h4>
      <p style="font-size: 0.88rem; color: var(--text-muted);">
        Synthèse des axes structurants portés par la Coopérative SCPPE et les organismes techniques partenaires (guide CNRA / FIRCA &amp; dossier d'industrialisation) :
      </p>
      <div class="strategy-grid">
        <div class="strategy-item">
          <strong>1. Démarrer en Phase Pilote Agile (60M FCFA)</strong>
          L'usine industrielle complète représente un investissement de plusieurs milliards FCFA. Cette première phase finance des petites unités dans un atelier pilote à Abidjan pour calibrer, moudre et conditionner le poivre ivoirien dès maintenant.
        </div>
        <div class="strategy-item">
          <strong>2. Le Défi de l'Humidité &amp; Format Sticks</strong>
          Le poivre en climat tropical absorbe l'humidité. La solution : séchage certifié &lt; 12-13% d'eau et ensachage en sticks hermétiques individuels scellés pour les restaurants et la consommation quotidienne.
        </div>
        <div class="strategy-item">
          <strong>3. Duo Curcuma + Poivre Noir</strong>
          Valorisation de la synergie biologique (la pipérine du poivre noir multiplie l'absorption de la curcumine par l'organisme). Un produit à haute valeur ajoutée pour diversifier les revenus des planteurs.
        </div>
        <div class="strategy-item">
          <strong>4. Standardisation des Planteurs Partenaires</strong>
          Encadrement technique et rachat garanti du poivre aux 37 producteurs de la coopérative SCPPE, assurant un volume constant et une qualité conforme aux exigences de l'exportation.
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="hub-footer">
      <p>
        <strong>Le Comptoir du Poivre de Côte d'Ivoire</strong> — Société Coopérative des Producteurs de Poivre d'Éburnie (SCPPE) &amp; Le Group Soppi Consulting.
      </p>
      <p style="margin-top: 0.35rem; font-size: 0.78rem;">
        Version Unifiée 4-en-1 • Hub Écosystème, Financement Participatif (60M FCFA), Boutique E-Commerce B2C/B2B et Portail Coopérative Agricole.
      </p>
    </footer>

  </main>

  <!-- 4 Modales KPI cliquables -->
  <dialog id="modal-kpi-funding" class="hub-dialog" closedby="any" aria-labelledby="modal-funding-title">
    <div class="hub-dialog-inner">
      <div class="hub-dialog-head">
        <h3 id="modal-funding-title">🎯 Détail du Financement Participatif — Phase Pilote 60M FCFA</h3>
        <button type="button" class="hub-dialog-close" data-close-dialog aria-label="Fermer la fenêtre">✕</button>
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        Montant déjà mobilisé : <strong>${formatFcfa(totalRaised)}</strong> sur un objectif de <strong>${formatFcfa(targetAmount)}</strong> (${percentRaised}%), incluant <strong>${pledges.length}</strong> engagements et précommandes enregistrés.
      </p>
      <div class="hub-dialog-list">
        ${pledges.slice(0, 4).map((p) => `<div class="hub-dialog-item">
          <div>
            <strong>${escapeHtml(p.contributorName)}</strong><br>
            <small style="color:var(--text-muted);">${escapeHtml(p.contributionMode)} • ${escapeHtml(p.countryCity)}</small>
          </div>
          <strong style="color:var(--gold-dark);">${formatFcfa(p.amountFcfa)}</strong>
        </div>`).join('')}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
        <a href="/invest" class="btn-launch btn-launch-invest">Accéder à la page Financement (60M) →</a>
      </div>
    </div>
  </dialog>

  <dialog id="modal-kpi-commercial" class="hub-dialog" closedby="any" aria-labelledby="modal-commercial-title">
    <div class="hub-dialog-inner">
      <div class="hub-dialog-head">
        <h3 id="modal-commercial-title">🛒 Traction Commerciale — Contrats B2B &amp; Précommandes</h3>
        <button type="button" class="hub-dialog-close" data-close-dialog aria-label="Fermer la fenêtre">✕</button>
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        Volume total engagé : <strong>${formatFcfa(totalCommercialVolume)}</strong> répartis entre <strong>${b2bContracts.length} contrats cadres B2B / LOI</strong> (${formatFcfa(b2bCommitted)}/an) et <strong>${orders.length} commandes boutique</strong> (${formatFcfa(ecomSales)}).
      </p>
      <div class="hub-dialog-list">
        ${b2bContracts.slice(0, 4).map((c) => `<div class="hub-dialog-item">
          <div>
            <strong>${escapeHtml(c.companyName)}</strong><br>
            <small style="color:var(--text-muted);">${escapeHtml(c.businessType)} • ${c.monthlyVolumeKg} kg/mois</small>
          </div>
          <strong style="color:var(--forest);">${formatFcfa(c.annualEstimatedValueFcfa)}/an</strong>
        </div>`).join('')}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
        <a href="/boutique" class="btn-launch btn-launch-ecom">Ouvrir la Boutique &amp; Contrats B2B →</a>
      </div>
    </div>
  </dialog>

  <dialog id="modal-kpi-producers" class="hub-dialog" closedby="any" aria-labelledby="modal-producers-title">
    <div class="hub-dialog-inner">
      <div class="hub-dialog-head">
        <h3 id="modal-producers-title">🌾 Réseau SCPPE : ${certifiedProducers} Planteurs Certifiés Global GAP &amp; ${totalCoopMembers} Membres</h3>
        <button type="button" class="hub-dialog-close" data-close-dialog aria-label="Fermer la fenêtre">✕</button>
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        La coopérative réunit <strong>${totalCoopMembers} membres producteurs</strong> encadrés selon le guide national CNRA / FIRCA, avec <strong>${certifiedProducers} exploitations certifiées Global GAP</strong> (GGN 4063651592948) disposant chacune d’une fiche terrain dédiée :
      </p>
      <div class="hub-dialog-list">
        ${certifiedList.map((p) => `<div class="hub-dialog-item">
          <div>
            <strong>🏅 ${escapeHtml(p.fullName)}</strong><br>
            <small style="color:var(--text-muted);">${escapeHtml(p.locality)} • ${p.hectares} ha • ${escapeHtml(p.variety)}</small>
          </div>
          <a href="/planteurs/${escapeHtml(p.code)}" class="btn-launch btn-launch-ecom" style="padding:0.42rem 0.85rem; font-size:0.8rem;">Voir le terrain agricole →</a>
        </div>`).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap;">
        <a href="/planteurs" style="color:var(--forest); font-weight:700; font-size:0.86rem;">Comparer les 3 domaines certifiés →</a>
        <a href="/saas#producteurs" class="btn-launch btn-launch-saas">Voir les 37 producteurs dans le Portail →</a>
      </div>
    </div>
  </dialog>

  <dialog id="modal-kpi-machines" class="hub-dialog" closedby="any" aria-labelledby="modal-machines-title">
    <div class="hub-dialog-inner">
      <div class="hub-dialog-head">
        <h3 id="modal-machines-title">⚙️ Parc de ${machines.length} Petites Unités Pilotes — Budget ${formatFcfa(machinesBudget)}</h3>
        <button type="button" class="hub-dialog-close" data-close-dialog aria-label="Fermer la fenêtre">✕</button>
      </div>
      <p style="font-size:0.9rem; color:var(--text-muted);">
        Contrairement à une usine lourde, ces <strong>${machines.length} équipements de petites unités</strong> permettent un démarrage immédiat en phase pilote (calibrage, mouture, sticks, zips, bouteilles) et un appui progressif aux pôles régionaux :
      </p>
      <div class="hub-dialog-list" style="max-height: 290px; overflow-y: auto; padding-right: 0.25rem;">
        ${machines.map((m) => `<div class="hub-dialog-item">
          <div>
            <strong>${escapeHtml(m.name)}</strong><br>
            <small style="color:var(--text-muted);">${escapeHtml(m.category)} • ${escapeHtml(m.priority)}</small>
          </div>
          <strong style="color:var(--forest);">${formatFcfa(m.estimatedCostFcfa)}</strong>
        </div>`).join('')}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
        <a href="/invest#machines" class="btn-launch btn-launch-invest">Voir la transparence sur Financement →</a>
        <a href="/saas#machines" class="btn-launch btn-launch-saas">Ajuster les devis dans le Portail →</a>
      </div>
    </div>
  </dialog>

  <script>
    document.querySelectorAll('[data-open-dialog]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const dlg = document.getElementById(trigger.dataset.openDialog);
        if (dlg) dlg.showModal();
      });
    });

    document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dlg = btn.closest('dialog');
        if (dlg) dlg.close();
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
          const isInside =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isInside) return;
          dialog.close();
        });
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderHub };

