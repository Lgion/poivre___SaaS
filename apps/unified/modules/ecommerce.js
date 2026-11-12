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

function renderEcommercePage(req, ecosystemData) {

  const data = ecosystemData;
  const { products, lots, b2bContracts, orders } = data;
  const searchQuery = (req.query.q || '').trim().toLowerCase();
  const selectedCategory = (req.query.cat || 'all').trim();
  const selectedLotCode = (req.query.lot || lots[0]?.lotCode || '00120-VFXTV-0004').trim();

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery);
    const matchesCat = selectedCategory === 'all' || p.category.includes(selectedCategory);
    return matchesQuery && matchesCat;
  });

  const activeLot = lots.find((l) => l.lotCode === selectedLotCode) || lots[0];
  const orderSuccess = req.query.order === 'success';
  const loiSuccess = req.query.loi === 'success';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boutique B2C &amp; Portail Contrats B2B — Le Comptoir du Poivre de Côte d'Ivoire (Plantation Soppi)</title>
  <style>
    :root {
      --bg: #fdfbf7;
      --surface: #ffffff;
      --surface-alt: #f4efe6;
      --forest: #143625;
      --forest-mid: #205239;
      --gold: #c98a27;
      --gold-soft: #f7e6c4;
      --spice: #8f2d1e;
      --text: #1c221e;
      --muted: #56635a;
      --border: #dcd2c2;
      --success: #188038;
      --danger: #d93025;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
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

    .topbar {
      background: #1c221e;
      color: #f5efe6;
      padding: 0.55rem 1.25rem;
      font-size: 0.85rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    header.navbar {
      position: sticky;
      inset-block-start: 0;
      z-index: 20;
      background: rgba(253, 251, 247, 0.96);
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
      gap: 0.8rem;
      text-decoration: none;
      color: var(--forest);
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--spice);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 800;
      border: 2px solid var(--gold);
    }

    nav.nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      align-items: center;
    }

    nav.nav-links a {
      text-decoration: none;
      font-weight: 600;
      color: var(--forest);
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
    }

    nav.nav-links a:hover {
      background: var(--surface-alt);
    }

    .btn-primary {
      background: var(--forest);
      color: #fff !important;
      padding: 0.65rem 1.15rem;
      border-radius: 10px;
      border: 2px solid var(--forest);
      font-weight: 700;
      cursor: pointer;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      text-decoration: none;
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--forest);
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      border: 2px solid var(--forest);
      font-weight: 700;
      cursor: pointer;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      text-decoration: none;
    }

    .container {
      max-width: 1220px;
      margin-inline: auto;
      padding: 2rem 1.25rem;
    }

    .commerce-hero {
      background: linear-gradient(135deg, #143625 0%, #2b1810 100%);
      color: #fff;
      border-radius: 20px;
      padding: 2.25rem;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
      align-items: center;
      margin-block-end: 2.5rem;
    }

    @media (max-width: 900px) {
      .commerce-hero {
        grid-template-columns: 1fr;
      }
    }

    .hero-Gallery {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .hero-Gallery img {
      width: 100%;
      height: 155px;
      object-fit: cover;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.25);
    }

    /* Search & filter bar using semantic <search> from modern-web-guidance */
    search.catalog-search {
      display: block;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.15rem;
      margin-block-end: 1.75rem;
    }

    .search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    }

    .product-card img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-block-end: 1px solid var(--border);
    }

    .product-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      flex: 1;
    }

    .badge-hermetic {
      display: inline-block;
      background: #e1f3e8;
      color: #0e5227;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      width: fit-content;
    }

    .badge-health {
      display: inline-block;
      background: var(--gold-soft);
      color: #6b4409;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 8px;
    }

    .price-box {
      background: var(--surface-alt);
      padding: 0.75rem;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-block-top: auto;
    }

    /* Forms & validation from modern-web-guidance */
    .split-section {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 2rem;
      align-items: start;
      margin-block-start: 3rem;
    }

    @media (max-width: 920px) {
      .split-section {
        grid-template-columns: 1fr;
      }
    }

    .card-panel {
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
      margin-block-end: 1.25rem;
    }

    label {
      font-weight: 700;
      color: var(--forest);
      padding: 6px 0;
      margin: -6px 0;
    }

    .hint {
      font-size: 0.84rem;
      color: var(--muted);
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="search"],
    select,
    textarea {
      width: 100%;
      font: inherit;
      font-size: max(1rem, 1em);
      padding: 0.7rem 0.85rem;
      min-height: 48px;
      border: 1.5px solid #6c756f;
      border-radius: 10px;
      background: #fff;
      color: var(--text);
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    button:focus-visible {
      outline: 3px solid #0b57d0;
      outline-offset: 2px;
    }

    .error-msg {
      display: none;
      color: var(--danger);
      font-size: 0.86rem;
      font-weight: 600;
    }

    :is(:user-invalid, .user-invalid-fallback) {
      border-color: var(--danger) !important;
      background-color: #fce8e6 !important;
    }

    :is(:user-invalid, .user-invalid-fallback) + .error-msg {
      display: block;
    }

    dialog {
      border: 2px solid var(--forest);
      border-radius: 18px;
      padding: 1.5rem;
      max-width: 600px;
      width: min(92vw, 600px);
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
      background-color: rgba(15, 28, 20, 0.65);
      backdrop-filter: blur(3px);
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
      background: #1c221e;
      color: #d9e2dc;
      padding: 2.5rem 1.25rem;
      margin-block-start: 4rem;
    }
  </style>
</head>
<body>
  ${renderUnifiedBar('ecommerce')}
  <div class="topbar">
    <div>
      <strong>LE COMPTOIR DU POIVRE DE CÔTE D’IVOIRE</strong> • Vente Directe B2C, Contrats Annuels CHR/Supermarchés &amp; Export CEDEAO
    </div>
    <div>
      <a href="/invest" style="color: #ffe3ae; font-weight: 700; margin-inline-end: 0.85rem;">← Campagne Financement 50M FCFA (Port 3001)</a>
      <a href="/saas" style="color: #ffe3ae; font-weight: 700;">Portail SaaS Coopérative (Port 3003) →</a>
    </div>
  </div>

  <header class="navbar">
    <a href="/boutique" class="brand">
      <div class="brand-logo">SP</div>
      <div>
        <strong style="display: block; font-size: 1.05rem;">BOUTIQUE &amp; CONTRATS B2B — PLANTATION SOPPI</strong>
        <span style="font-size: 0.8rem; color: var(--muted);">Poivre de la Mé Certifié GLOBALG.A.P. • Double Hermétique Garanti</span>
      </div>
    </a>
    <nav class="nav-links" aria-label="Navigation boutique et espace B2B">
      <a href="#catalogue">Catalogue B2C &amp; Demi-Gros</a>
      <a href="#contrats-b2b">Contrats Durables B2B &amp; LOI</a>
      <a href="#tracabilite">Traçabilité Lot / QR Code</a>
      <button type="button" class="btn-primary" data-open-order="Coffret Prestige 3 Poivres + Boîte 50 Sticks" data-price="18500">
        Commander en Direct
      </button>
    </nav>
  </header>

  <main class="container">
    ${
      orderSuccess
        ? `<div role="status" class="alert-banner">
            ✅ Votre commande a bien été enregistrée et transmise à l’Atelier Central (Garage Mme Soppi — Port 3003) !
          </div>`
        : ''
    }
    ${
      loiSuccess
        ? `<div role="status" class="alert-banner">
            🤝 Votre Contrat d’Approvisionnement / Lettre d’Intention (LOI) B2B a été généré et consolidé dans le portefeuille commercial de la Coopérative !
          </div>`
        : ''
    }

    <section class="commerce-hero">
      <div>
        <span style="background: rgba(201,138,39,0.28); border: 1px solid #e7b561; color: #ffe5b4; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700;">
          100% Terroir de Côte d'Ivoire • Certifié GLOBALG.A.P.
        </span>
        <h1 style="font-size: clamp(1.7rem, 2.8vw, 2.35rem); margin: 0.85rem 0;">
          Du Stick de Table à l’Export en Grain Calibré : Le Poivre de la Mé sous Double Scellé Hermétique.
        </h1>
        <p style="color: #e4ece7; margin-block-end: 1.35rem;">
          Découvrez nos innovations : <strong>Sticks individuels hermétiques</strong> (Poivre Noir Pur &amp; Duo Antioxydant Curcuma + Poivre), <strong>Coffrets Prestige Ramadan / Pâques / Entreprises</strong>, Sachets Zips scellés et Sacs Pro pour les hôtels, maquis, supermarchés et grossistes sous-régionaux.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
          <a href="#catalogue" class="btn-primary" style="background: var(--gold); border-color: var(--gold); color: #1c221e !important;">Explorer les Produits (${products.length})</a>
          <a href="#contrats-b2b" class="btn-secondary" style="background: transparent; color: #fff; border-color: #fff;">Signer un Contrat B2B / LOI Durable</a>
        </div>
      </div>
      <div class="hero-Gallery">
        <img src="/images/coffret-3-poivres.jpg" alt="Coffret 3 poivres Plantation Soppi">
        <img src="/images/pots-melange-3-poivres.jpg" alt="Pots Mélange 3 Poivres de la Mé">
        <img src="/images/pots-poivre-blanc-moulu.jpg" alt="Poivre Blanc Muntok Moulu">
        <img src="/images/sacs-pro-1kg.jpg" alt="Sacs Professionnels 1kg Poivre de la Mé">
      </div>
    </section>

    <!-- Catalogue B2C & B2B -->
    <section id="catalogue">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-block-end: 1.25rem;">
        <div>
          <h2 style="margin: 0 0 0.3rem; color: var(--forest);">1. Catalogue B2C (Ménages &amp; Cadeaux) et Demi-Gros B2B</h2>
          <p style="margin: 0; color: var(--muted);">Tous nos emballages respectent l’exigence du <strong>double hermétique</strong> pour conserver un taux d’humidité optimal de 12–13%.</p>
        </div>
      </div>

      <search class="catalog-search">
        <form action="/boutique#catalogue" method="GET" class="search-row" aria-label="Filtrer les produits de la boutique">
          <div style="flex: 1; min-width: 220px;">
            <label for="q">Rechercher un produit ou usage (ex: stick, curcuma, ramadan, grain)</label>
            <input type="search" id="q" name="q" value="${escapeHtml(searchQuery)}" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="search">
          </div>
          <div style="min-width: 240px;">
            <label for="cat">Gamme de conditionnement</label>
            <select id="cat" name="cat">
              <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>Toutes les gammes (${products.length})</option>
              <option value="Sticks Hermétiques" ${selectedCategory === 'Sticks Hermétiques' ? 'selected' : ''}>Sticks Hermétiques (Pur &amp; Curcuma)</option>
              <option value="Coffrets Cadeaux" ${selectedCategory === 'Coffrets Cadeaux' ? 'selected' : ''}>Coffrets Cadeaux (Ramadan / Pâques / VIP)</option>
              <option value="Bouteilles & Pots" ${selectedCategory === 'Bouteilles & Pots' ? 'selected' : ''}>Bouteilles &amp; Pots Hermétiques</option>
              <option value="Sachets Zips" ${selectedCategory === 'Sachets Zips' ? 'selected' : ''}>Sachets Zips Double-Hermétiques</option>
              <option value="Formats Pro" ${selectedCategory === 'Formats Pro' ? 'selected' : ''}>Formats Pro CHR &amp; Export Sous-Régional</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">Filtrer le catalogue</button>
          ${
            searchQuery || selectedCategory !== 'all'
              ? `<a href="/#catalogue" class="btn-secondary">Réinitialiser</a>`
              : ''
          }
        </form>
      </search>

      <div class="product-grid">
        ${filteredProducts
          .map(
            (p) => `<article class="product-card">
              <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}">
              <div class="product-body">
                <div style="display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="badge-hermetic">🔒 ${escapeHtml(p.hermeticLevel)}</span>
                  <span style="font-size: 0.78rem; color: var(--muted); font-weight: 600;"> Stock : ${p.stockUnits} unités</span>
                </div>
                <h3 style="margin: 0.25rem 0; font-size: 1.1rem; color: var(--forest);">${escapeHtml(p.name)}</h3>
                <span class="badge-health">✨ ${escapeHtml(p.healthOrUsageBadge)}</span>
                <p style="font-size: 0.89rem; color: var(--muted); margin: 0.25rem 0;">
                  ${escapeHtml(p.description)}
                </p>
                <div style="font-size: 0.82rem; color: var(--text);">
                  <strong>Format :</strong> ${escapeHtml(p.weightLabel)} • <strong>Lot QR :</strong> <a href="/?lot=${encodeURIComponent(p.traceabilityLotCode)}#tracabilite" style="color: var(--forest); font-weight: 700;">${escapeHtml(p.traceabilityLotCode)}</a>
                </div>
                <div class="price-box">
                  <div>
                    <div style="font-size: 0.76rem; color: var(--muted);">Prix Unitaire B2C</div>
                    <strong style="font-size: 1.15rem; color: var(--forest);">${formatFcfa(p.priceB2cFcfa)}</strong>
                  </div>
                  <div style="text-align: end;">
                    <div style="font-size: 0.76rem; color: var(--muted);">${escapeHtml(p.b2bUnitLabel)}</div>
                    <strong style="font-size: 0.95rem; color: var(--spice);">${formatFcfa(p.priceB2bFcfa)}</strong>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-block-top: 0.5rem;">
                  <button
                    type="button"
                    class="btn-primary"
                    data-open-order="1 × ${escapeHtml(p.name)} (B2C)"
                    data-price="${p.priceB2cFcfa}"
                  >
                    Acheter (B2C)
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    data-open-order="${escapeHtml(p.b2bUnitLabel)} — ${escapeHtml(p.name)} (B2B)"
                    data-price="${p.priceB2bFcfa}"
                  >
                    Commander Carton B2B
                  </button>
                </div>
              </div>
            </article>`
          )
          .join('')}
      </div>
    </section>

    <!-- Portail Contrats B2B & LOI -->
    <section id="contrats-b2b" class="split-section">
      <div class="card-panel">
        <h2 id="b2b-loi-heading" style="margin-block-start: 0; color: var(--forest);">
          2. Contrat d’Approvisionnement Durable B2B &amp; Lettre d’Intention (LOI)
        </h2>
        <p style="font-size: 0.92rem; color: var(--muted); margin-block-end: 1.35rem;">
          Vous êtes un <strong>supermarché, hôtel, restaurant, maquis, boulangerie/charcuterie, distributeur sous-régional (CEDEAO) ou comité d’entreprise</strong> ? Bloquez votre prix annuel et sécurisez votre volume mensuel de poivre standardisé.
        </p>

        <form action="/api/b2b-loi" method="POST" aria-labelledby="b2b-loi-heading" id="b2b-form" novalidate>
          <div class="field">
            <label for="companyName">Nom de l’Entreprise / Établissement <span aria-hidden="true">*</span></label>
            <span id="comp-hint" class="hint">Ex : Supermarché, Hôtel, Maquis, Grossiste CEDEAO, Entreprise.</span>
            <input
              type="text"
              id="companyName"
              name="companyName"
              autocomplete="organization"
              required
              minlength="2"
              aria-describedby="comp-hint"
              data-error="comp-error"
              enterkeyhint="next"
            >
            <div id="comp-error" class="error-msg">
              <span role="img" aria-label="Error">❌</span> Veuillez indiquer la raison sociale de votre établissement.
            </div>
          </div>

          <div class="field">
            <label for="businessType">Secteur d’activité B2B</label>
            <select id="businessType" name="businessType">
              <option value="Supermarché / Grande Distribution Locale">Supermarché / Grande Distribution Locale</option>
              <option value="CHR : Hôtel / Restaurant / Maquis Haut de Gamme">CHR : Hôtel, Restaurant ou Maquis</option>
              <option value="Grossiste / Distributeur Sous-Régional (Sénégal, Mali, Burkina...)">Grossiste / Export Sous-Régional (CEDEAO)</option>
              <option value="Entreprise (Paniers Ramadan, Pâques & Cadeaux Fin d'Année)">Entreprise — Paniers Ramadan, Pâques &amp; Coffrets Cadeaux</option>
              <option value="Industrie Agroalimentaire / Charcuterie / Épicerie Fine">Industrie Agroalimentaire / Charcuterie</option>
            </select>
          </div>

          <div class="field">
            <label for="productSummary">Produits &amp; Moutures souhaités dans le contrat</label>
            <select id="productSummary" name="productSummary">
              <option value="Cartons de Sticks Hermétiques (Poivre Noir Pur & Duo Curcuma-Poivre)">Cartons de Sticks Hermétiques (Poivre Pur &amp; Duo Curcuma-Poivre)</option>
              <option value="Grains Entiers Calibrés Certifiés GlobalG.A.P. (Sacs 1kg / 5kg / 25kg)">Grains Entiers Calibrés Certifiés GlobalG.A.P. (Sacs 1kg / 5kg / 25kg)</option>
              <option value="Gamme Rayons Supermarché : Pots 165g Noir, 125g Blanc Muntok & Zips 200g">Gamme Rayons Supermarché : Pots 165g Noir, 125g Blanc &amp; Zips 200g</option>
              <option value="Coffrets Cadeaux 3 Poivres (Noir, Blanc, Rouge) — Dotation Paniers de Fêtes">Coffrets Cadeaux 3 Poivres (Noir, Blanc, Rouge) — Paniers Ramadan / Fêtes</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="field">
              <label for="monthlyVolumeKg">Volume mensuel estimé (kg) <span aria-hidden="true">*</span></label>
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9]{1,5}"
                id="monthlyVolumeKg"
                name="monthlyVolumeKg"
                value="35"
                required
                data-error="vol-error"
              >
              <div id="vol-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Indiquez un volume mensuel en kg (ex: 35).
              </div>
            </div>

            <div class="field">
              <label for="contractDurationMonths">Durée d’engagement</label>
              <select id="contractDurationMonths" name="contractDurationMonths">
                <option value="12">12 mois (Tarif garanti 1 an)</option>
                <option value="24">24 mois (Partenaire Stratégique)</option>
                <option value="6">6 mois (Contrat Saisonnier)</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label for="contactName">Nom du Responsable Achats / Gérant <span aria-hidden="true">*</span></label>
            <input type="text" id="contactName" name="contactName" autocomplete="name" required data-error="contact-error">
            <div id="contact-error" class="error-msg">
              <span role="img" aria-label="Error">❌</span> Veuillez renseigner le nom du contact.
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="field">
              <label for="b2b-phone">Téléphone / WhatsApp Pro <span aria-hidden="true">*</span></label>
              <input type="tel" id="b2b-phone" name="phone" autocomplete="tel" required data-error="b2b-phone-error">
              <div id="b2b-phone-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Numéro requis.
              </div>
            </div>

            <div class="field">
              <label for="b2b-email">E-mail Professionnel <span aria-hidden="true">*</span></label>
              <input type="email" id="b2b-email" name="email" autocomplete="email" autocorrect="off" autocapitalize="none" spellcheck="false" required data-error="b2b-email-error">
              <div id="b2b-email-error" class="error-msg">
                <span role="img" aria-label="Error">❌</span> Format : contact@entreprise.ci
              </div>
            </div>
          </div>

          <div class="field">
            <label for="b2b-city">Ville &amp; Pays de livraison</label>
            <input type="text" id="b2b-city" name="countryCity" value="Abidjan, Côte d'Ivoire">
          </div>

          <button type="submit" class="btn-primary" style="width: 100%;">
            Générer et Enregistrer le Contrat Cadre / LOI B2B
          </button>
        </form>
      </div>

      <!-- Contrats B2B actifs & Traçabilité QR -->
      <div>
        <div class="card-panel" id="tracabilite" style="margin-block-end: 1.5rem;">
          <h2 style="margin-block-start: 0; color: var(--forest);">
            3. Vérificateur Public de Traçabilité (QR Code Lot)
          </h2>
          <p style="font-size: 0.9rem; color: var(--muted);">
            Chaque pot, stick ou coffret Plantation Soppi porte un numéro de lot lié au certificat <strong>GLOBALG.A.P.</strong> et au contrôle d’humidité (12–13%) réalisé avant emballage.
          </p>

          <form action="/boutique#tracabilite" method="GET" style="display: flex; gap: 0.6rem; margin-block-end: 1.2rem;">
            <div style="flex: 1;">
              <label for="lot-select" class="visually-hidden">Choisir un numéro de lot</label>
              <select id="lot-select" name="lot">
                ${lots
                  .map(
                    (l) =>
                      `<option value="${escapeHtml(l.lotCode)}" ${l.lotCode === activeLot.lotCode ? 'selected' : ''}>Lot ${escapeHtml(l.lotCode)} — ${escapeHtml(l.pepperType)}</option>`
                  )
                  .join('')}
              </select>
            </div>
            <button type="submit" class="btn-secondary">Vérifier le Lot</button>
          </form>

          ${
            activeLot
              ? `<div style="background: var(--surface-alt); border: 1.5px solid var(--forest); border-radius: 14px; padding: 1.15rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-block-end: 0.5rem;">
                    <strong style="color: var(--forest); font-size: 1.05rem;">Lot Certifié : ${escapeHtml(activeLot.lotCode)}</strong>
                    <span class="badge-hermetic">${escapeHtml(activeLot.qualityGrade)}</span>
                  </div>
                  <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.89rem; display: grid; gap: 0.45rem;">
                    <li><strong>Produit :</strong> ${escapeHtml(activeLot.pepperType)}</li>
                    <li><strong>Variété CNRA :</strong> ${escapeHtml(activeLot.variety)}</li>
                    <li><strong>Origine &amp; Producteur :</strong> ${escapeHtml(activeLot.producerName)} (${escapeHtml(activeLot.originLocality)})</li>
                    <li><strong>Date de récolte :</strong> ${escapeHtml(activeLot.harvestDate)} • <strong>Volume du lot :</strong> ${activeLot.weightKg} kg secs</li>
                    <li><strong>Taux d’humidité mesuré :</strong> <span style="color: var(--success); font-weight: 700;">${activeLot.moisturePercent}% (Conforme norme 12–13% — grain crissant)</span></li>
                    <li><strong>Calibrage :</strong> ${escapeHtml(activeLot.caliberMm)}</li>
                    <li><strong>Itinéraire Post-Récolte :</strong> ${escapeHtml(activeLot.processingMethod)}</li>
                    <li><strong>Conditionnement :</strong> ${escapeHtml(activeLot.packagingState)}</li>
                    <li><strong>Certification :</strong> ${escapeHtml(activeLot.certifiedGgn)}</li>
                  </ul>
                </div>`
              : ''
          }
        </div>

        <div class="card-panel">
          <h3 style="margin-block-start: 0; color: var(--forest);">Dernières Commandes &amp; Contrats B2B (${orders.length + b2bContracts.length})</h3>
          <div style="display: grid; gap: 0.75rem;">
            ${b2bContracts
              .slice(0, 3)
              .map(
                (c) => `<div style="background: var(--surface-alt); padding: 0.85rem; border-radius: 10px; font-size: 0.86rem;">
                  <strong style="color: var(--forest);">${escapeHtml(c.referenceCode)} — ${escapeHtml(c.companyName)}</strong><br>
                  <span>${escapeHtml(c.productSummary)} • <strong>${c.monthlyVolumeKg} kg/mois</strong> (${formatFcfa(c.annualEstimatedValueFcfa)}/an)</span>
                </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Modal Dialog Commande Directe with closedby="any" -->
  <dialog id="order-dialog" closedby="any" aria-labelledby="order-dialog-title">
    <h2 id="order-dialog-title" style="margin-block-start: 0; color: var(--forest);">Passer une Commande Directe (B2C / B2B)</h2>
    <p style="font-size: 0.9rem; color: var(--muted);">
      Livraison rapide sur Abidjan et expédition sous-régionale. Paiement Mobile Money (Wave, Orange, MTN) ou virement à la livraison.
    </p>
    <form action="/api/order" method="POST" id="quick-order-form">
      <div class="field">
        <label for="order-items">Articles sélectionnés <span aria-hidden="true">*</span></label>
        <input type="text" id="order-items" name="itemsSummary" required>
      </div>
      <div class="field">
        <label for="order-total">Montant total estimé (FCFA) <span aria-hidden="true">*</span></label>
        <input type="text" inputmode="numeric" id="order-total" name="totalFcfa" required>
      </div>
      <div class="field">
        <label for="order-name">Votre Nom ou Entreprise <span aria-hidden="true">*</span></label>
        <input type="text" id="order-name" name="customerName" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="order-type">Type de client</label>
        <select id="order-type" name="customerType">
          <option value="B2C Ménage / Particulier">Particulier / Ménage (B2C)</option>
          <option value="B2B Maquis / Restaurant / Hôtel">Maquis / Restaurant / Hôtel (B2B)</option>
          <option value="B2B Entreprise (Coffrets Ramadan / Pâques / Fêtes)">Entreprise — Coffrets Cadeaux</option>
          <option value="B2B Revendeur / Export Sous-Régional">Revendeur / Export Sous-Régional</option>
        </select>
      </div>
      <div class="field">
        <label for="order-phone">Téléphone / WhatsApp <span aria-hidden="true">*</span></label>
        <input type="tel" id="order-phone" name="phone" autocomplete="tel" required>
      </div>
      <div class="field">
        <label for="order-zone">Commune / Ville de livraison <span aria-hidden="true">*</span></label>
        <input type="text" id="order-zone" name="deliveryZone" value="Abidjan - Cocody" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn-secondary" id="close-order-dialog">Annuler</button>
        <button type="submit" class="btn-primary">Confirmer la commande</button>
      </div>
    </form>
  </dialog>

  <footer>
    <div class="container" style="padding-block: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem;">
      <div>
        <strong style="color: #fff;">BOUTIQUE OFFICIELLE — LE COMPTOIR DU POIVRE DE CÔTE D’IVOIRE (PLANTATION SOPPI)</strong>
        <p style="margin: 0.35rem 0; font-size: 0.86rem;">
          Produits standardisés par la Coopérative SCPPE • Certifié GLOBALG.A.P. (Ecocert GGN 4063651592948)
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <a href="/invest" style="color: #ffe3ae;">1. Site Financement 50M (Port 3001)</a>
        <a href="http://localhost:3002" style="color: #ffe3ae;">2. Boutique E-Commerce (Port 3002)</a>
        <a href="/saas" style="color: #ffe3ae;">3. SaaS Coopérative (Port 3003)</a>
      </div>
    </div>
  </footer>

  <script>
    const orderDialog = document.getElementById('order-dialog');
    document.querySelectorAll('[data-open-order]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('order-items').value = btn.dataset.openOrder || '';
        document.getElementById('order-total').value = btn.dataset.price || '15000';
        orderDialog.showModal();
      });
    });

    document.getElementById('close-order-dialog')?.addEventListener('click', () => {
      orderDialog.close();
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
  </script>
</body>
</html>`;

  
  return html;
}

module.exports = { renderEcommercePage };
