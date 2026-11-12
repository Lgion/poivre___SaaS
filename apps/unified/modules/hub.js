const { renderUnifiedBar } = require('./bar');

function formatFcfa(amount) {
  return Number(amount || 0).toLocaleString('fr-FR') + ' FCFA';
}

function renderHub(ecosystemSummary) {
  const { campaign, metrics, machines, pledges, b2bContracts, producers, lots } = ecosystemSummary;

  const totalRaised = Number(metrics.crowdfundingRaisedFcfa || 0);
  const targetAmount = Number(campaign.targetAmountFcfa || 50000000);
  const percentRaised = Math.min(100, Math.round((totalRaised / targetAmount) * 100));

  const b2bCommitted = Number(metrics.b2bCommittedFcfa || 0);
  const ecomSales = Number(metrics.ecommerceSalesFcfa || 0);
  const totalCommercialVolume = b2bCommitted + ecomSales;

  const totalProducers = producers.length;
  const certifiedProducers = producers.filter((p) => p.certifiedGlobalGap).length;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hub Écosystème Unifié — Le Comptoir du Poivre de Côte d'Ivoire (SCPPE & Mme Soppi)</title>
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
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--forest);
      line-height: 1.15;
      margin-bottom: 0.4rem;
    }
    .kpi-detail {
      font-size: 0.82rem;
      color: var(--text-muted);
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
        <span class="tag tag-white">Phase Pilote Agile 50M FCFA</span>
        <span class="tag tag-white">Certifié GLOBALG.A.P. &amp; Ecocert</span>
      </div>
      <h1 class="hero-title" id="hub-hero-title">Le Comptoir du Poivre de Côte d'Ivoire</h1>
      <p class="hero-sub">
        Plateforme intégrée d'industrialisation et de valorisation de la filière poivre (<em>Piper nigrum</em>) : 
        Levée de fonds agile, commercialisation B2C/B2B et standardisation qualité de 25 à 40 producteurs de la Coopérative SCPPE.
      </p>
      <div class="hero-promoter-strip">
        <div>
          <span style="color: #c88a2b;">Promotrice :</span> 
          <span class="hero-promoter-name">${campaign.presidentName}</span> 
          <span style="opacity: 0.8;">(${campaign.cooperativeName})</span>
        </div>
        <div class="hero-cert-code">${campaign.certificationGgn}</div>
      </div>
    </section>

    <!-- Key Metrics Grid -->
    <section class="kpi-grid" aria-label="Indicateurs clés de performance en temps réel">
      <div class="kpi-card kpi-gold">
        <div>
          <div class="kpi-label">🎯 Financement Participatif</div>
          <div class="kpi-val">${formatFcfa(totalRaised)}</div>
          <div class="kpi-detail">Objectif pilote : <strong>${formatFcfa(targetAmount)}</strong> (${percentRaised}%)</div>
        </div>
        <div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: ${percentRaised}%;"></div>
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div>
          <div class="kpi-label">🛒 Ventes &amp; Contrats B2B</div>
          <div class="kpi-val">${formatFcfa(totalCommercialVolume)}</div>
          <div class="kpi-detail"><strong>${b2bContracts.length}</strong> contrats cadres + <strong>${formatFcfa(ecomSales)}</strong> précommandes boutique</div>
        </div>
      </div>

      <div class="kpi-card kpi-blue">
        <div>
          <div class="kpi-label">🌾 Réseau Producteurs SCPPE</div>
          <div class="kpi-val">${totalProducers} Planteurs</div>
          <div class="kpi-detail"><strong>${certifiedProducers}</strong> certifiés GlobalG.A.P. • Cible : 25-40 planteurs régionaux</div>
        </div>
      </div>

      <div class="kpi-card kpi-dark">
        <div>
          <div class="kpi-label">⚙️ Parc Machines Identifié</div>
          <div class="kpi-val">${machines.length} Équipements</div>
          <div class="kpi-detail">Budget devis : <strong>${formatFcfa(metrics.machinesBudgetTotalFcfa)}</strong> (Ajustable en direct)</div>
        </div>
      </div>
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
            <h3 id="app1-title">Appel à Financement (50M)</h3>
          </div>
        </header>
        <div class="app-card-body">
          <p class="app-card-text">
            Vitrine d'investissement participatif et de précommandes pour lancer l'unité de mouture et conditionnement dans l'atelier garage d'Abidjan avant l'usine à 2,35 Milliards.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Paliers d'adhésion de 10 000 à 5 000 000 FCFA avec récompenses</li>
            <li><span class="tick">✓</span> Fiches techniques des machines (broyeur inox, ensacheuse sticks...)</li>
            <li><span class="tick">✓</span> Simulateur de retour sur investissement et garanties agricoles</li>
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
            Comptoir commercial digital : Vente directe de poivre en grains/moulu, packs sticks nomades hermétiques anti-humidité, duo Curcuma + Poivre noir et contrats pour CHR / grossistes.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Commande directe avec panier et sélection de livraison</li>
            <li><span class="tick">✓</span> Générateur de Contrat-cadre / LOI B2B avec remises grands comptes</li>
            <li><span class="tick">✓</span> Module public de vérification de traçabilité par numéro de lot</li>
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

      <!-- App 3: SaaS ERP Cooperative -->
      <article class="app-card" aria-labelledby="app3-title">
        <header class="app-card-header">
          <div class="app-icon-wrap icon-saas">🏭</div>
          <div class="app-card-title-group">
            <span class="app-badge-target badge-saas">Application 3 • Gestion Interne SCPPE</span>
            <h3 id="app3-title">Portail SaaS Coopérative</h3>
          </div>
        </header>
        <div class="app-card-body">
          <p class="app-card-text">
            Plateforme interne de gestion de la coopérative SCPPE : Répertoire des planteurs formés, réception des lots séchés avec test d'humidité &lt; 12-13% (CNRA) et devis machines ajustables.
          </p>
          <ul class="app-features-list">
            <li><span class="tick">✓</span> Répertoire et encadrement des 25 à 40 producteurs de poivre</li>
            <li><span class="tick">✓</span> Fiche de réception de lot (taux d'humidité, impuretés, calibrage)</li>
            <li><span class="tick">✓</span> Gestionnaire en direct des prix et devis des équipements</li>
          </ul>
          <footer class="app-card-footer">
            <div class="app-stat-summary">
              <strong>${lots.length} lots réceptionnés</strong>
              Suivi humidité &amp; stockage conforme
            </div>
            <a href="/saas" class="btn-launch btn-launch-saas">Ouvrir le SaaS →</a>
          </footer>
        </div>
      </article>

    </div>

    <!-- Strategy Summary Box -->
    <section class="strategy-box" aria-labelledby="strategy-title">
      <h4 id="strategy-title">💡 La Stratégie d'Industrialisation Validée avec Mme Soppi</h4>
      <p style="font-size: 0.88rem; color: var(--text-muted);">
        Synthèse des points clés issus des échanges avec Mme Atse Chiepo Solange et des documents techniques (guide CNRA/FIRCA &amp; dossier de financement) :
      </p>
      <div class="strategy-grid">
        <div class="strategy-item">
          <strong>1. Démarrer Petit mais Pro (Phase 50M FCFA)</strong>
          L'usine complète à 2,352 Milliards FCFA est la vision à long terme. Cette phase intermédiaire finance l'équipement de l'atelier pilote dans le garage de Mme Soppi pour calibrer, moudre et ensacher hermétiquement dès maintenant.
        </div>
        <div class="strategy-item">
          <strong>2. Le Défi de l'Humidité &amp; Format Sticks</strong>
          Le poivre en climat tropical absorbe l'humidité. La solution : séchage certifié &lt; 12-13% d'eau et ensachage en sticks hermétiques individuels scellés (type café) pour les restaurants et la consommation quotidienne.
        </div>
        <div class="strategy-item">
          <strong>3. Duo Curcuma + Poivre Noir</strong>
          Valorisation de la synergie biologique (la pipérine du poivre noir multiplie l'absorption de la curcumine par l'organisme). Un produit à haute valeur ajoutée pour diversifier les revenus des planteurs.
        </div>
        <div class="strategy-item">
          <strong>4. Standardisation des Planteurs Partenaires</strong>
          Encadrement technique et rachat garanti du poivre aux producteurs formés par la coopérative SCPPE, assurant un volume constant et une qualité conforme aux exigences de l'exportation.
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="hub-footer">
      <p>
        <strong>Écosystème Poivre de la Mé</strong> — Société Coopérative des Producteurs de Poivre d'Éburnie (SCPPE) &amp; Le Group Soppi Consulting.
      </p>
      <p style="margin-top: 0.35rem; font-size: 0.78rem;">
        Version Unifiée 4-en-1 • Architecture disponible en 1 application tout-en-un ou en 3 applications séparées (Portail Crowdfunding, Boutique E-Commerce, SaaS Coopérative).
      </p>
    </footer>

  </main>

</body>
</html>`;
}

module.exports = { renderHub };

