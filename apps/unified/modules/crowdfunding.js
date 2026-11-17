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

function renderCrowdfundingPage(req, ecosystemData) {

  const data = ecosystemData;
  const { campaign, machines, pledges, b2bContracts, producers = [], metrics } = data;
  const pledgeSuccess = req.query.pledge === 'success';

  const b2bTotal = Number(metrics.totalB2bAnnualCommitmentsFcfa || 0);
  const showExactB2b = b2bTotal > 10000000;

  const geoCatalog = {
    'SCPPE-001': {
      shortLabel: 'Brofodoumé',
      siteName: 'Plantation SOPPI — Brofodoumé / Anyama',
      lat: 5.5033,
      lng: -3.9625,
      geolocCode: '6CQRG23P+8X',
      certDate: '15/09/2023 (Émis le 04/10/2023 • Valide Ecocert EPCI002)',
      certRef: 'Global GAP GGN 4063651592948 • Certificat 00120-VFXTV-0004',
      membersLabel: '1 exploitation certifiée (Site Pilote)',
      annualProdEst: '~12 à 15 tonnes / an (10 ha en prod. sur 16,64 ha)',
      detailUrl: '/planteurs/SCPPE-001'
    },
    'SCPPE-002': {
      shortLabel: 'Azaguié',
      siteName: 'Domaine Fiessou — Azaguié (Agnéby-Tiassa)',
      lat: 5.6128,
      lng: -4.0481,
      geolocCode: '6CQQJX72+4Q',
      certDate: '15/09/2023 (Émis le 04/10/2023 • Valide Ecocert EPCI002)',
      certRef: 'Global GAP GGN 4063651592948 • Certificat 00120-VFXTV-0004',
      membersLabel: '1 exploitation certifiée (Chef de Pôle Azaguié)',
      annualProdEst: '~5,5 tonnes / an (Pôle capacité 2 000 kg/cycle)',
      detailUrl: '/planteurs/SCPPE-002'
    },
    'SCPPE-003': {
      shortLabel: 'Yakassé Mé',
      siteName: 'Domaine Kobenan — Yakassé Mé (Région de la Mé)',
      lat: 5.8281,
      lng: -3.9302,
      geolocCode: '6CQRR3H9+6W',
      certDate: '15/09/2023 (Émis le 04/10/2023 • Valide Ecocert EPCI002)',
      certRef: 'Global GAP GGN 4063651592948 • Certificat 00120-VFXTV-0004',
      membersLabel: '1 exploitation certifiée (Chef de Pôle La Mé)',
      annualProdEst: '~6,5 tonnes / an (Pôle capacité 2 500 kg/cycle)',
      detailUrl: '/planteurs/SCPPE-003'
    },
    'SCPPE-004': {
      shortLabel: 'Agboville (8)',
      siteName: 'Collectif Agboville — Kouassi N’Guessan Bernard',
      lat: 5.9302,
      lng: -4.2167,
      geolocCode: '6CQQWQJM+38',
      certDate: 'Non certifié — Audit CNRA/Global GAP programmé',
      certRef: 'Membre Coopérative SCPPE • Standardisation validée',
      membersLabel: 'Groupe de 8 planteurs membres SCPPE',
      annualProdEst: '~7,5 tonnes / an (Rendement Lampong 1,5 t/ha)',
      detailUrl: ''
    },
    'SCPPE-005': {
      shortLabel: 'Dabou (10)',
      siteName: 'Groupement Dabou — Yapo Brou Marcelline',
      lat: 5.3282,
      lng: -4.3738,
      geolocCode: '6CQQ8JHG+7F',
      certDate: 'Non certifié — Suivi post-récolte en cours',
      certRef: 'Membre Coopérative SCPPE • Pôle Grands Ponts',
      membersLabel: 'Groupement de 10 productrices & planteurs SCPPE',
      annualProdEst: '~8,0 tonnes / an (Muntok & Curcuma intercalaire)',
      detailUrl: ''
    },
    'SCPPE-006': {
      shortLabel: 'Adzopé (12)',
      siteName: 'Collectif Adzopé — Aka Tanoh Constant',
      lat: 6.1051,
      lng: -3.8619,
      geolocCode: '6CRR444Q+26',
      certDate: 'Non certifié — Formation CNRA en cours',
      certRef: 'Membre Coopérative SCPPE • Pôle La Mé / Adzopé',
      membersLabel: 'Collectif de 12 planteurs membres SCPPE',
      annualProdEst: '~9,5 tonnes / an (Calibrage & séchage en déploiement)',
      detailUrl: ''
    }
  };

  const mapMarkers = producers.map((p) => {
    const g = geoCatalog[p.code] || {
      shortLabel: p.locality,
      siteName: `${p.fullName} — ${p.locality}`,
      lat: 5.72,
      lng: -4.18,
      geolocCode: '6CQQPR2M+00',
      certDate: p.globalGapCertified ? '15/09/2023 (Global GAP)' : `Non certifié — ${p.trainingStatus}`,
      certRef: p.globalGapCertified ? 'Global GAP GGN 4063651592948' : 'Membre Coopérative SCPPE',
      membersLabel: p.roleTitle,
      annualProdEst: `~${Math.round(Number(p.hectares || 2) * 1.1)} tonnes / an`,
      detailUrl: p.globalGapCertified ? `/planteurs/${p.code}` : ''
    };
    return {
      id: p.code,
      certified: Boolean(p.globalGapCertified),
      shortLabel: g.shortLabel,
      title: g.siteName,
      manager: p.fullName,
      locality: p.locality,
      regionPole: p.regionPole,
      hectares: p.hectares,
      variety: p.variety,
      plantingYear: p.plantingYear,
      driedStockKg: p.driedStockAvailableKg,
      standardizationScore: p.standardizationScore,
      phone: p.phone,
      lat: g.lat,
      lng: g.lng,
      geolocCode: `${g.geolocCode} (${g.lat.toFixed(4)}, ${g.lng.toFixed(4)})`,
      certDate: g.certDate,
      certRef: g.certRef,
      membersLabel: g.membersLabel,
      annualProdEst: g.annualProdEst,
      detailUrl: g.detailUrl
    };
  });

  // Relais Tiassalé (complément du collectif Ouest pour compléter les 37 membres SCPPE)
  mapMarkers.push({
    id: 'SCPPE-007',
    certified: false,
    shortLabel: 'Tiassalé (4)',
    title: 'Relais Ouest Tiassalé — Coopérateurs SCPPE',
    manager: 'Antenne Relais Tiassalé / Bandama',
    locality: 'Tiassalé (Agnéby-Tiassa Ouest)',
    regionPole: 'Pôle Ouest / Tiassalé',
    hectares: 3.8,
    variety: 'Lampong & Muntok',
    plantingYear: 2023,
    driedStockKg: 95,
    standardizationScore: 79,
    phone: '+225 05 04 71 62 89',
    lat: 5.8983,
    lng: -4.8229,
    geolocCode: '6CQQV5XG+8R (5.8983, -4.8229)',
    certDate: 'Non certifié — Parcours standardisation CNRA',
    certRef: 'Membre Coopérative SCPPE • Relais Ouest',
    membersLabel: 'Relais de 4 planteurs membres SCPPE',
    annualProdEst: '~4,2 tonnes / an (Pré-collecte groupée)',
    detailUrl: ''
  });

  const polesMeta = {
    'Pôle 1': { badge: 'Pôle 1', title: 'Conditionnement, Mouture & Calibrage (Atelier Pilote)' },
    'Pôle 2': { badge: 'Pôle 2', title: 'Fonds de Roulement & Collecte Coopérative' },
    'Pôle 3': { badge: 'Pôle 3', title: 'Équipements Amont & Pôles Régionaux' }
  };

  const polesMap = {};
  for (const m of machines) {
    const shortKey = m.pole.split('—')[0].trim();
    const meta = polesMeta[shortKey] || { badge: shortKey, title: m.pole.split('—').slice(1).join('—').trim() || m.pole };
    if (!polesMap[m.pole]) {
      polesMap[m.pole] = {
        pole: m.pole,
        badge: meta.badge,
        title: meta.title,
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

  const cnraSlides = [
    { src: '/images/plantation-allees.jpg', caption: '1/10 — Allées de poivriers conduits sur tuteurs vivants Glyricidia (2m × 2m)' },
    { src: '/images/plantation-grappes.jpg', caption: '2/10 — Conduite de liane et charge de grappes selon l’itinéraire CNRA / FIRCA' },
    { src: '/images/baies-maturite.jpg', caption: '3/10 — Récolte sélective au sécateur dès l’apparition du 1er grain jaune' },
    { src: '/images/recolte-sechage.jpg', caption: '4/10 — Séchage hygiénique sur grillage plastique perforé (cible 12–13% d’humidité)' },
    { src: '/images/certificat-globalgap.jpg', caption: '5/10 — Référentiel Ecocert Global GAP couvrant 3 domaines certifiés' },
    { src: '/images/attestation-plantation.jpg', caption: '6/10 — Reconnaissance officielle des parcelles en production standardisée' },
    { src: '/images/pots-grains-blanc-noir.jpg', caption: '7/10 — Sélection de grains entiers Muntok & Lampong calibrés au tamis inox' },
    { src: '/images/pots-melange-3-poivres.jpg', caption: '8/10 — Assemblage maîtrisé des poivres noir, blanc et rouge de Côte d’Ivoire' },
    { src: '/images/pots-poivre-noir-moulu.jpg', caption: '9/10 — Mouture inox sans échauffement préservant arômes et pipérine' },
    { src: '/images/coffret-3-poivres.jpg', caption: '10/10 — Valorisation finale en conditionnement scellé double-hermétique' }
  ];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financement Participatif (60M FCFA) — Coopérative de Producteurs de Poivre Certifié (SCPPE)</title>
  <link rel="stylesheet" href="/vendor/leaflet/leaflet.css">
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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
      min-width: 0;
    }

    .proof-card img {
      width: 100%;
      height: 170px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    /* Interactive Cooperative Map (Card 1 Leaflet mini-map & Modal Leaflet Map) */
    .coop-map-wrap {
      background: #eaf3ec;
      border: 1px solid #c2dac7;
      border-radius: 10px;
      padding: 0.55rem;
    }
    .card1-leaflet-map {
      width: 100%;
      height: 185px;
      border-radius: 8px;
      border: 1px solid #b5d2ba;
      background: #dfeee0;
      z-index: 1;
    }
    .map-info-bar {
      margin-top: 0.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem 0.65rem;
      font-size: 0.8rem;
      color: var(--text);
      min-height: 54px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.2rem;
    }

    /* Full Interactive Modal Map */
    dialog.modal-map-xl {
      max-width: 1120px;
      width: min(96vw, 1120px);
    }
    .map-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
    }
    .map-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .map-filter-btn {
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      border: 1.5px solid var(--border);
      background: var(--surface-alt);
      color: var(--forest);
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .map-filter-btn[aria-pressed="true"] {
      background: var(--forest);
      color: #fff;
      border-color: var(--forest);
    }
    .map-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      font-size: 0.8rem;
      align-items: center;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 600;
      color: var(--text);
    }
    .legend-dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
      display: inline-block;
    }
    .legend-dot.certified { background: #0d9488; }
    .legend-dot.member { background: #0284c7; }
    .legend-dot.hub { background: #123524; border-color: var(--gold); }

    .modal-map-grid {
      display: grid;
      grid-template-columns: 1.35fr 0.95fr;
      gap: 1.15rem;
      align-items: stretch;
    }
    @media (max-width: 900px) {
      .modal-map-grid { grid-template-columns: 1fr; }
    }
    .modal-map-stage {
      position: relative;
      background: #dcebdd;
      border: 1.5px solid #9dc2a5;
      border-radius: 14px;
      overflow: hidden;
      height: 470px;
      min-height: 470px;
    }
    .modal-leaflet-stage {
      width: 100%;
      height: 100%;
      min-height: 470px;
      background: #dfeee0;
      z-index: 1;
    }
    @media (max-width: 900px) {
      .modal-map-stage,
      .modal-leaflet-stage {
        height: 360px;
        min-height: 360px;
      }
    }

    /* Custom Leaflet Pin Icons (Vert turquoise = Certifiée / Bleu ciel = Membre SCPPE) */
    .leaflet-coop-pin {
      background: transparent;
      border: 0;
    }
    .coop-pin-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      transition: transform 0.15s ease;
    }
    .coop-pin-inner.is-selected {
      transform: translate(-50%, -105%) scale(1.18);
    }
    .coop-pin-tag {
      margin-top: -3px;
      padding: 0.1rem 0.42rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      color: #fff;
      white-space: nowrap;
      border: 1px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.28);
    }
    .coop-pin-inner.is-certified .coop-pin-tag { background: #0f766e; }
    .coop-pin-inner.is-member .coop-pin-tag { background: #0369a1; }
    .coop-hub-badge {
      transform: translate(-50%, -50%);
      background: #123524;
      color: #ffe3ae;
      border: 2px solid var(--gold);
      border-radius: 999px;
      padding: 0.16rem 0.5rem;
      font-size: 0.68rem;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
    .leaflet-popup-content {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 0.82rem;
      line-height: 1.45;
      margin: 0.65rem 0.8rem;
    }
    .leaflet-popup-dir {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.45rem;
      padding: 0.32rem 0.65rem;
      border-radius: 6px;
      background: #123524;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.78rem;
    }

    .modal-map-inspector {
      background: var(--surface-alt);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.85rem;
    }
    .inspector-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 800;
      width: fit-content;
    }
    .inspector-badge.certified {
      background: #ccfbf1;
      color: #0f766e;
      border: 1px solid #5eead4;
    }
    .inspector-badge.member {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }
    .inspector-specs {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      display: grid;
      gap: 0.45rem;
      font-size: 0.84rem;
    }
    .geoloc-share-row {
      background: #fff;
      border: 1px dashed var(--border);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.45rem;
    }
    .copy-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .copy-button {
      min-inline-size: 32px;
      min-block-size: 32px;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
      border: 1.5px solid var(--forest);
      background: var(--surface);
      color: var(--forest);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .copy-button[data-copied] {
      background: #e1f3e8;
      border-color: var(--success);
      color: #0f5328;
    }
    .copy-button[data-failed] {
      background: #fce8e6;
      border-color: var(--danger);
      color: var(--danger);
    }
    .tip[role="status"] {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--forest);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .copy-button[data-copied] + .tip,
    .copy-button[data-failed] + .tip {
      opacity: 1;
    }
    .inspector-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }
    .inspector-quicklist {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      padding-top: 0.65rem;
      border-top: 1px solid var(--border);
    }
    .quick-chip-btn {
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: #fff;
      color: var(--text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .quick-chip-btn[aria-current="true"] {
      background: var(--forest);
      color: #fff;
      border-color: var(--forest);
    }

    /* Accessible 10-image Carousel (modern-web-guidance) */
    .carousel {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .carousel-viewport {
      position: relative;
    }
    .carousel-track {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .carousel-track::-webkit-scrollbar { display: none; }
    @media (prefers-reduced-motion: no-preference) {
      .carousel-track { scroll-behavior: smooth; }
    }
    .carousel-slide {
      flex: 0 0 100%;
      min-width: 100%;
      scroll-snap-align: center;
      margin: 0;
      position: relative;
      background: #102d1c;
    }
    .carousel-slide img {
      width: 100%;
      height: 170px;
      object-fit: cover;
      border: 0;
      border-radius: 0;
      display: block;
    }
    .carousel-caption {
      background: rgba(16, 45, 28, 0.92);
      color: #f7f3ec;
      font-size: 0.76rem;
      padding: 0.38rem 0.6rem;
      line-height: 1.3;
    }
    .carousel-controls {
      position: absolute;
      inset-inline: 0.35rem;
      top: 66px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      z-index: 3;
    }
    .carousel-btn {
      pointer-events: auto;
      touch-action: manipulation;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 1.5px solid rgba(255, 255, 255, 0.75);
      background: rgba(18, 53, 36, 0.85);
      color: #fff;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .carousel-btn:hover { background: var(--gold); color: #1c241e; border-color: #fff; }
    .carousel-footer-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .carousel-markers {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-wrap: wrap;
    }
    .carousel-markers button {
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    .carousel-markers button::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #b6afa3;
      border: 1px solid #6e7770;
      transition: width 0.2s ease, background-color 0.2s ease;
    }
    .carousel-markers button[aria-current="true"]::before {
      width: 18px;
      height: 9px;
      background: var(--forest);
      border-color: var(--gold);
      outline: 2px solid var(--gold);
    }
    .carousel-pause-btn {
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface-alt);
      color: var(--forest);
      cursor: pointer;
    }

    /* Trust Logos Band ("Ceux qui nous ont fait confiance") */
    .trust-logos-band {
      margin-block-start: 2rem;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    .trust-logos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
      gap: 0.9rem;
      margin-top: 1rem;
    }
    .trust-logo-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.42rem;
      text-decoration: none;
      color: inherit;
      transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    }
    .trust-logo-card:hover {
      transform: translateY(-2px);
      border-color: var(--gold);
      box-shadow: 0 8px 18px rgba(18, 53, 36, 0.1);
    }
    .trust-logo-card:focus-visible {
      outline: 3px solid #0b57d0;
      outline-offset: 2px;
    }
    .trust-logo-frame {
      inline-size: 100%;
      block-size: 66px;
      background: #ffffff;
      border: 1px solid #e4ddd0;
      border-radius: 8px;
      padding: 0.42rem 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }
    .trust-logo-frame img {
      display: block;
      max-block-size: 100%;
      max-inline-size: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
    .trust-logo-frame.is-dual img {
      max-inline-size: 46%;
      max-block-size: 92%;
    }
    .trust-logo-card strong { font-size: 0.9rem; color: var(--forest); }
    .trust-logo-card small { font-size: 0.75rem; color: var(--muted); line-height: 1.3; }
    .trust-card-link-hint {
      margin-top: auto;
      padding-top: 0.2rem;
      font-size: 0.73rem;
      font-weight: 700;
      color: #0e624d;
    }

    /* Field Marketing 4th wide block */
    .field-marketing-banner {
      margin-block-start: 1.5rem;
      background: linear-gradient(135deg, #123524 0%, #1d4d35 70%, #2a6345 100%);
      color: #fff;
      border: 2px solid var(--gold);
      border-radius: 16px;
      padding: 1.65rem 1.85rem;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 1.5rem;
      align-items: center;
    }
    .field-marketing-points {
      margin: 0.9rem 0 0;
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.09);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .field-marketing-points ul {
      margin: 0.4rem 0 0;
      padding-inline-start: 1.15rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 0.35rem 0.9rem;
    }
    .field-marketing-media {
      margin: 0;
      background: rgba(0, 0, 0, 0.22);
      border: 2px solid rgba(255, 227, 174, 0.6);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
    }
    .field-marketing-media img {
      display: block;
      inline-size: 100%;
      aspect-ratio: 16 / 10;
      block-size: auto;
      object-fit: cover;
      object-position: center 22%;
    }
    .field-marketing-media figcaption {
      padding: 0.55rem 0.8rem;
      font-size: 0.78rem;
      color: #ffe3ae;
      background: rgba(12, 34, 23, 0.86);
      border-top: 1px solid rgba(255, 227, 174, 0.25);
    }
    @media (max-width: 860px) {
      .field-marketing-banner { grid-template-columns: 1fr; }
    }

    /* Foldable Proof & Pledge Cards (native <details> per modern-web-guidance) */
    .foldable-proof-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      align-items: start;
    }
    details.foldable-card {
      padding: 0;
      overflow: clip;
    }
    summary.foldable-summary {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1.15rem 1.35rem;
      cursor: pointer;
      user-select: none;
      font-weight: 800;
      color: var(--forest);
      background: linear-gradient(180deg, #ffffff 0%, #f9f6ef 100%);
    }
    summary.foldable-summary::-webkit-details-marker {
      display: none;
    }
    summary.foldable-summary:hover {
      background: #f3ede0;
    }
    summary.foldable-summary:focus-visible {
      outline: 3px solid #0b57d0;
      outline-offset: -3px;
    }
    summary.foldable-summary::before {
      content: "";
      inline-size: 1.05em;
      block-size: 1.05em;
      flex-shrink: 0;
      background-color: currentColor;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M6.7 8.7a1 1 0 0 1 1.4 0L12 12.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 10.1a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E") no-repeat center / contain;
      rotate: -90deg;
    }
    details.foldable-card[open] > summary.foldable-summary::before {
      rotate: 0deg;
    }
    @media (prefers-reduced-motion: no-preference) {
      summary.foldable-summary::before {
        transition: rotate 0.2s ease;
      }
    }
    .foldable-title {
      font-size: 1.08rem;
      line-height: 1.25;
      color: var(--forest);
      flex: 1;
    }
    .foldable-badge {
      font-size: 0.76rem;
      font-weight: 700;
      color: #0e624d;
      background: #e6f4ee;
      border: 1px solid #b5dccb;
      border-radius: 999px;
      padding: 0.22rem 0.65rem;
      white-space: nowrap;
    }
    details.foldable-card[open] > summary.foldable-summary {
      border-bottom: 1px solid var(--border);
    }
    .foldable-body {
      padding: 1.15rem 1.35rem 1.35rem;
    }
    details.foldable-card::details-content {
      interpolate-size: allow-keywords;
      overflow: clip;
      contain: layout;
    }
    details.foldable-card:not([open])::details-content {
      block-size: 0;
    }
    @media (prefers-reduced-motion: no-preference) {
      details.foldable-card::details-content {
        transition: block-size, content-visibility, display;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
        transition-behavior: allow-discrete;
      }
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
      padding: 0.65rem 1rem;
      font: inherit;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      min-height: 48px;
      border-radius: 8px 8px 0 0;
      text-align: left;
    }
    .pole-kicker {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.78;
    }
    .pole-main-label {
      display: block;
      font-size: 0.96rem;
      font-weight: 800;
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
      max-width: 820px;
      width: min(94vw, 820px);
      width: min(94dvw, 820px);
      max-height: min(90vh, 920px);
      max-height: min(90dvh, 920px);
      overflow-y: auto;
      margin: auto;
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
    }

    dialog.modal-varieties-xl {
      max-width: 980px;
      width: min(95vw, 980px);
      width: min(95dvw, 980px);
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

    .dialog-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
    }
    .dialog-close-x {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface-alt);
      color: var(--forest);
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
    }
    .dialog-close-x:hover { background: #e2d8c7; }

    /* Variety Showcase Modal: Video Slot + Uniform 5 Cards + HTML5 Infographic */
    .variety-video-section {
      background: linear-gradient(135deg, #f1f7f3 0%, #fcf8ef 100%);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 0.9rem 1rem 1rem;
      margin-block: 0 1.15rem;
    }
    .variety-video-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.7rem;
    }
    .variety-video-head > div {
      flex: 1 1 360px;
      min-inline-size: 0;
    }
    .video-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.74rem;
      font-weight: 700;
      color: #0e4f36;
      background: #dcf5ea;
      border: 1px solid #99d8bc;
      border-radius: 999px;
      padding: 0.18rem 0.6rem;
    }
    .variety-video-frame {
      width: 100%;
      max-inline-size: 720px;
      margin-inline: auto;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #cfc4b0;
      background: #102018;
      box-shadow: 0 8px 22px rgba(18, 53, 36, 0.14);
    }
    dialog#dialog-varietes[open] .variety-video-frame {
      background: #102018 url("https://i.ytimg.com/vi/lj633m58SVQ/hqdefault.jpg") center / cover no-repeat;
    }
    .variety-video-frame iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .variety-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(225px, 1fr));
      gap: 0.9rem;
      margin-block: 0.85rem 1.25rem;
    }
    .variety-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .variety-card > img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      height: auto;
      object-fit: cover;
      border-radius: 8px;
    }
    .swatch-row {
      display: flex;
      align-items: center;
      min-block-size: 20px;
      gap: 0.35rem;
    }
    .variety-card-title {
      margin: 0;
      font-size: 0.96rem;
      line-height: 1.25;
      color: var(--forest);
    }
    .swatch-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.3);
      display: inline-block;
      flex-shrink: 0;
    }

    /* HTML5 Infographic: Traitement Essentiel du Poivre */
    .infographic-board {
      background: linear-gradient(180deg, #f8f5ed 0%, #f1f6f3 100%);
      border: 1.5px solid #c9d7cd;
      border-radius: 16px;
      padding: 1.05rem;
      margin-block: 0.4rem 0.5rem;
    }
    .infographic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px dashed #b9c9be;
      margin-bottom: 0.95rem;
    }
    .infographic-kpis {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .infographic-kpi-chip {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--forest);
      background: #fff;
      border: 1px solid #cbd9cf;
      border-radius: 999px;
      padding: 0.25rem 0.65rem;
    }
    .infographic-flow {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.85rem;
      counter-reset: pepper-step;
    }
    .infographic-step {
      position: relative;
      background: #ffffff;
      border: 1px solid #d7e0d9;
      border-top: 4px solid var(--step-accent, var(--forest));
      border-radius: 12px;
      padding: 0.8rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      box-shadow: 0 4px 12px rgba(18, 53, 36, 0.05);
    }
    .infographic-step-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .step-badge-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--step-accent, var(--forest));
      color: #fff;
      font-weight: 800;
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-icon {
      font-size: 1.05rem;
      line-height: 1;
    }
    .step-kpi {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--step-accent, var(--forest));
      background: #f4f7f5;
      border: 1px solid #d5e2d9;
      border-radius: 999px;
      padding: 0.16rem 0.5rem;
      white-space: nowrap;
    }
    .infographic-step h4 {
      margin: 0;
      font-size: 0.92rem;
      color: var(--forest);
    }
    .infographic-step p {
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.42;
      color: var(--muted);
    }
    .step-mini-flow {
      margin-top: auto;
      padding-top: 0.35rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--forest);
    }
    .step-tag {
      background: #eff5f1;
      border: 1px solid #cce0d4;
      border-radius: 6px;
      padding: 0.15rem 0.42rem;
    }
    .step-branches {
      margin-top: auto;
      padding-top: 0.35rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.3rem;
      font-size: 0.7rem;
      text-align: center;
    }
    .step-branch {
      border-radius: 6px;
      padding: 0.25rem 0.2rem;
      border: 1px solid var(--border);
      background: #faf8f3;
      line-height: 1.25;
    }
    .moisture-gauge {
      margin-top: auto;
      padding-top: 0.35rem;
    }
    .moisture-track {
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(90deg, #0d9488 0%, #0d9488 26%, #d97706 27%, #dc2626 100%);
      position: relative;
      overflow: hidden;
    }
    .moisture-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.71rem;
      font-weight: 700;
      color: #0e624d;
      margin-top: 0.22rem;
    }
    .infographic-footer-bar {
      margin-top: 0.9rem;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      background: var(--forest);
      color: #f4efe3;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    /* Round Fixed Action Button (Bottom-Right) */
    .fab-round-wrap {
      position: fixed;
      inset-block-end: 1.5rem;
      inset-inline-end: 1.5rem;
      z-index: 60;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .fab-tooltip {
      background: var(--forest);
      color: #fff;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      border: 1.5px solid var(--gold);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
      pointer-events: none;
    }
    .fab-round {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--forest) 0%, #1d4d35 100%);
      color: #ffe3ae;
      border: 3px solid var(--gold);
      box-shadow: 0 10px 28px rgba(18, 53, 36, 0.38);
      cursor: pointer;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.72rem;
      line-height: 1.1;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .fab-round:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 14px 32px rgba(18, 53, 36, 0.46);
    }
    .fab-round:focus-visible {
      outline: 3px solid #0b57d0;
      outline-offset: 3px;
    }
    @media (max-width: 640px) {
      .fab-tooltip { display: none; }
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
  ${renderUnifiedBar('crowdfunding')}
  <div class="topbar">
    <div class="topbar-badges">
      <span class="badge-pill">🇨🇮 Terroir de Côte d'Ivoire (Brofodoumé, Azaguié, Yakassé Mé, Agboville, Dabou)</span>
      <span class="badge-pill">✅ Certifié Global GAP (Ecocert GGN 4063651592948)</span>
      <span class="badge-pill">🤝 Coopérative SCPPE : 37 Planteurs Encadrés</span>
    </div>
    <div>
      <span>Écosystème unifié :</span>
      <a href="/boutique" style="margin-inline-start: 0.6rem; color: #ffe3ae; font-weight: 700;">Boutique B2C/B2B →</a>
      <a href="/saas" style="margin-inline-start: 0.6rem; color: #ffe3ae; font-weight: 700;">Portail Coopérative Agricole →</a>
    </div>
  </div>

  <header class="navbar">
    <a href="/invest" class="brand">
      <div class="brand-mark">SCP</div>
      <div class="brand-text">
        <strong>COOPÉRATIVE DE PRODUCTEURS DE POIVRE CERTIFIÉ</strong>
        <span>Industrialisation Agile &amp; Financement Participatif</span>
      </div>
    </a>
    <nav class="nav-links" aria-label="Navigation principale du financement">
      <a href="#vision">Pourquoi 60M FCFA ?</a>
      <a href="#preuves">Preuves &amp; Carte</a>
      <a href="#machines">Transparence du Projet</a>
      <a href="#innovations">Ivoiriser le Poivre</a>
      <button type="button" class="btn-primary" data-open-dialog="dialog-contribuer">Participer / Précommander</button>
    </nav>
  </header>

  <main class="container">
    ${pledgeSuccess
      ? `<div role="status" class="alert-banner">
            🎉 Merci ! Votre engagement / précommande a été enregistré dans la base commune et répercuté en temps réel sur la jauge et dans le Portail Coopérative Agricole.
          </div>`
      : ''
    }

    <section class="hero" id="vision">
      <div class="hero-card">
        <div>
          <span class="eyebrow">Appel à Financement Participatif &amp; Précommandes</span>
          <h1>Industrialisons le Poivre de Côte d’Ivoire étape par étape, avec confiance et preuves terrain.</h1>
          <p class="lead">
            Porté par <strong>${escapeHtml(campaign.presidentName)}</strong> (${escapeHtml(campaign.cooperativeName)}), ce programme finance l’équipement de notre <strong>unité pilote de transformation (calibrage, mouture et conditionnement hermétique) pour valoriser immédiatement la récolte de nos 37 producteurs encadrés</strong>.
          </p>
          <div class="pivot-callout">
            <strong>💡 Notre approche pragmatique (« Commencer petit/moyen pour prouver et rassurer ») :</strong><br>
            Plutôt que d’attendre <strong>plusieurs milliards</strong> de dette bancaire pour bâtir d’emblée une usine sur 1 hectare, nous lançons une <strong>1re phase agile de 60 Millions FCFA</strong> installée dans un <strong>atelier pilote à Abidjan</strong>, centrée sur la collecte de poivre séché standardisé (12–13% d’humidité), <strong>la transformation (mouture)</strong> et <strong>la commercialisation (conditionnement double hermétique : Zips, Sticks, Bouteilles et Coffrets, etc.)</strong>.
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.85rem;">
          <button type="button" class="btn-primary" data-open-dialog="dialog-contribuer" style="background: var(--gold); border-color: var(--gold); color: #1c241e !important;">
            Soutenir ou Précommander (dès 15 000 FCFA)
          </button>
          <button type="button" class="btn-secondary" data-open-dialog="dialog-certificats">
            Voir Certificat Global GAP &amp; Attestation 10 ha
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
            ℹ️ Les budgets des équipements ci-dessous sont mis à jour en temps réel depuis le <strong>Portail Coopérative Agricole</strong> au fur et à mesure de la réception des devis fournisseurs.
          </p>
        </div>

        <div class="kpi-mini-grid">
          <div class="kpi-mini">
            <strong>37 Planteurs</strong>
            <span>Coopérative active (37 producteurs encadrés SCPPE)</span>
          </div>
          <div class="kpi-mini">
            <strong>${metrics.totalDriedStockKg} kg secs</strong>
            <span>Stock standardisé (12–13% humidité) prêt à conditionner</span>
          </div>
          <div class="kpi-mini">
            ${showExactB2b
      ? `<strong>${formatFcfa(b2bTotal)}</strong>
                   <span>Contrats B2B / LOI annuels déjà engagés</span>`
      : `<strong>Contrats B2B en cours</strong>
                   <span>Traction commerciale active auprès des distributeurs &amp; CHR</span>`
    }
          </div>
          <div class="kpi-mini">
            <strong>${metrics.totalHectares} ha</strong>
            <span>Surfaces suivies selon l’itinéraire CNRA / FIRCA</span>
          </div>
        </div>

        <div class="hero-photo-strip">
          <img src="/images/coffret-3-poivres.jpg" alt="Coffret 3 poivres de la coopérative">
          <img src="/images/recolte-sechage.jpg" alt="Poivre séché standardisé de la coopérative">
          <img src="/images/pots-poivre-noir-moulu.jpg" alt="Flacons de poivre certifié conditionnés">
        </div>
      </aside>
    </section>

    <!-- Preuves & Légitimité -->
    <section id="preuves">
      <div class="section-head">
        <div>
          <h2>1. Pourquoi avoir confiance ? Un projet déjà ancré, certifié et vendeur</h2>
          <p>Contrairement aux projets sur papier, la coopérative SCPPE dispose de 6 ans d’expérimentation terrain, de produits déjà commercialisés et d’une certification internationale reconnue.</p>
        </div>
      </div>

      <div class="proof-grid">
        <!-- Card 1: Carte interactive Leaflet des membres & 3 certifiés Global GAP -->
        <article class="proof-card">
          <div class="coop-map-wrap">
            <div id="card1-leaflet-map" class="card1-leaflet-map" role="region" aria-label="Carte Leaflet des 37 membres et 3 exploitations certifiées Global GAP en Côte d'Ivoire"></div>
            <div class="map-info-bar" id="coop-map-info" aria-live="polite">
              <div><strong>🟢 3 certifiés Global GAP (Turquoise)</strong> • <strong>🔵 34 membres SCPPE (Bleu ciel)</strong></div>
              <div style="color: var(--muted);">Cliquez sur un marqueur ou ouvrez la carte détaillée pour tracer l’itinéraire.</div>
            </div>
          </div>
          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Certifié Global GAP (Ecocert)</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              GGN <strong>4063651592948</strong> — Carte interactive de nos <strong>37 membres coopérateurs</strong> incluant nos <strong>3 domaines certifiés Global GAP</strong> : <a href="/planteurs/SCPPE-001" style="font-weight:700; color:var(--forest);">Brofodoumé</a>, <a href="/planteurs/SCPPE-002" style="font-weight:700; color:var(--forest);">Azaguié</a> et <a href="/planteurs/SCPPE-003" style="font-weight:700; color:var(--forest);">Yakassé Mé</a>.
            </p>
          </div>
          <button type="button" class="btn-secondary" data-open-dialog="dialog-carte-coop">Ouvrir la Carte Coopérative Détaillée</button>
        </article>

        <!-- Card 2: Guide CNRA / FIRCA avec Diaporama 10 images + PDF Download -->
        <article class="proof-card">
          <section class="carousel" aria-roledescription="carousel" aria-label="Diaporama Guide CNRA FIRCA en 10 photos">
            <div class="carousel-viewport">
              <div class="carousel-controls">
                <button type="button" class="carousel-btn" data-direction="previous" aria-label="Photo précédente">‹</button>
                <button type="button" class="carousel-btn" data-direction="next" aria-label="Photo suivante">›</button>
              </div>
              <div class="carousel-track" tabindex="0" role="group" aria-label="Photos du guide technique">
                ${cnraSlides
      .map(
        (slide, idx) => `<figure class="carousel-slide" role="group" aria-roledescription="slide" aria-label="${idx + 1} sur ${cnraSlides.length}" data-marker-name="Aller à la photo ${idx + 1}">
                      <img src="${escapeHtml(slide.src)}" alt="${escapeHtml(slide.caption)}" ${idx === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
                      <figcaption class="carousel-caption">${escapeHtml(slide.caption)}</figcaption>
                    </figure>`
      )
      .join('')}
              </div>
            </div>
            <p class="visually-hidden carousel-status" role="status" aria-live="polite"></p>
            <div class="carousel-footer-nav">
              <nav class="carousel-markers" aria-label="Choisir une diapositive"></nav>
              <button type="button" class="carousel-pause-btn" id="cnra-carousel-toggle" aria-pressed="false">⏸ Pause</button>
            </div>
          </section>

          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Guide CNRA / FIRCA</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              La coopérative <strong>SCPPE</strong> a contribué <strong>à l’élaboration du guide national des bonnes pratiques agricoles avec le CNRA</strong>, l’ESA et le FIRCA : boutures <em>Muntok</em> &amp; <em>Lampong</em>, tuteurs vivants <em>Glyricidia</em>, récolte au 1er grain jaune.
            </p>
          </div>
          <a href="/docs/guide-cnra-firca.pdf" download="Guide-CNRA-FIRCA-Poivre-CI.pdf" class="btn-secondary">📄 Télécharger le Guide National (PDF)</a>
        </article>

        <!-- Card 3: Poivre d'Excellence Artisanale -> Modale Variétés & Traitement -->
        <article class="proof-card">
          <img src="/images/coffret-3-poivres.jpg" alt="Variétés de poivre artisanal d'excellence de Côte d'Ivoire">
          <div>
            <h3 style="margin: 0 0 0.4rem; color: var(--forest);">Poivre d’Excellence Artisanale</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
              Du grain frais cueilli à maturité optimale jusqu’au conditionnement scellé : découvrez la richesse aromatique de nos quatre poivres d’origine ivoirienne, nos assemblages exclusifs et notre savoir-faire de préparation sans compromis.
            </p>
          </div>
          <button type="button" class="btn-secondary" data-open-dialog="dialog-varietes">Découvrir nos Variétés &amp; Traitements</button>
        </article>
      </div>

      <!-- Ceux qui nous ont fait confiance -->
      <div class="trust-logos-band" aria-labelledby="trust-logos-heading">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:0.5rem;">
          <h3 id="trust-logos-heading" style="margin:0; color:var(--forest); font-size:1.15rem;">Ceux qui nous ont fait confiance</h3>
          <span style="font-size:0.84rem; color:var(--muted);">Institutions agronomiques, certificateurs et partenaires commerciaux B2B</span>
        </div>
        <div class="trust-logos-grid">
          <a href="https://cnra.ci/" target="_blank" rel="noopener noreferrer" class="trust-logo-card">
            <div class="trust-logo-frame">
              <img src="/images/logos/cnra.png" alt="Logo officiel CNRA Côte d’Ivoire" width="300" height="102" loading="lazy">
            </div>
            <strong>CNRA Côte d’Ivoire</strong>
            <small>Centre National de Recherche Agronomique</small>
            <span class="trust-card-link-hint">cnra.ci ↗</span>
          </a>

          <a href="https://firca.ci/" target="_blank" rel="noopener noreferrer" class="trust-logo-card">
            <div class="trust-logo-frame">
              <img src="/images/logos/firca.png" alt="Logo officiel FIRCA" width="270" height="270" loading="lazy">
            </div>
            <strong>FIRCA</strong>
            <small>Financement &amp; Conseil Agricoles</small>
            <span class="trust-card-link-hint">firca.ci ↗</span>
          </a>

          <a href="https://esa.inphb.ci/" target="_blank" rel="noopener noreferrer" class="trust-logo-card">
            <div class="trust-logo-frame">
              <img src="/images/logos/inphb.png" alt="Logo officiel ESA / INP-HB Yamoussoukro" width="255" height="255" loading="lazy">
            </div>
            <strong>ESA / INP-HB</strong>
            <small>Co-élaboration Guide Technique National</small>
            <span class="trust-card-link-hint">esa.inphb.ci ↗</span>
          </a>

          <a href="https://globalgap.org/" target="_blank" rel="noopener noreferrer" class="trust-logo-card">
            <div class="trust-logo-frame is-dual">
              <img src="/images/logos/ecocert.png" alt="Logo officiel Ecocert" width="595" height="335" loading="lazy">
              <img src="/images/logos/globalgap.svg" alt="Logo officiel GLOBALG.A.P." width="160" height="138" loading="lazy">
            </div>
            <strong>Ecocert Global GAP</strong>
            <small>Certification GGN 4063651592948</small>
            <span class="trust-card-link-hint">globalgap.org ↗</span>
          </a>

          <a href="/saas" class="trust-logo-card">
            <div class="trust-logo-frame">
              <img src="/images/logos/scppe.png" alt="Sceau Origine Côte d’Ivoire — Coopérative SCPPE" width="280" height="280" loading="lazy">
            </div>
            <strong>Coopérative SCPPE</strong>
            <small>37 Producteurs Standardisés (SCOOPS)</small>
            <span class="trust-card-link-hint">Portail SCPPE →</span>
          </a>

          <a href="https://www.ecowas.int/?lang=fr" target="_blank" rel="noopener noreferrer" class="trust-logo-card">
            <div class="trust-logo-frame">
              <img src="/images/logos/ecowas.png" alt="Logo officiel CEDEAO / ECOWAS" width="422" height="418" loading="lazy">
            </div>
            <strong>Distrib. &amp; CHR CI</strong>
            <small>Supermarchés, Maquis &amp; Importateurs CEDEAO</small>
            <span class="trust-card-link-hint">ecowas.int ↗</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Parc Machines & Transparence -->
    <section id="machines">
      <div class="section-head">
        <div>
          <h2>2. Transparence de l'appel à financement</h2>
          <p>
            Chaque franc investi dans cette phase pilote de <strong>60 Millions FCFA</strong> cible un maillon précis. Les coûts des équipements de petites unités sont affichés à titre indicatif et actualisés dès validation des devis fournisseurs dans le Portail Coopérative Agricole.
          </p>
        </div>
        <a href="/saas#machines" class="btn-secondary">⚙️ Ajuster les devis dans le Portail Coopérative</a>
      </div>

      <div class="tabs">
        <div class="tablist scroller" focusgroup="tablist nomemory" aria-label="Pôles d'investissement des 60 millions FCFA">
          <button type="button" id="tab-all" aria-selected="true" focusgroupstart>
            <span class="pole-kicker">Vue d'ensemble</span>
            <span class="pole-main-label">Tous les équipements (${machines.length} postes — ${formatFcfa(metrics.totalEstimatedMachinesFcfa)})</span>
          </button>
          ${poles
      .map(
        (p, i) =>
          `<button type="button" id="tab-pole-${i}" aria-selected="false">
                  <span class="pole-kicker">${escapeHtml(p.badge)}</span>
                  <span class="pole-main-label">${escapeHtml(p.title)} (${formatFcfa(p.totalEstimated)})</span>
                </button>`
      )
      .join('')}
        </div>

        <div role="tabpanel" aria-labelledby="tab-all" tabindex="0">
          <div class="tabpanel-inner">
            <div tabindex="0" role="region" aria-labelledby="machines-caption-all" class="table-wrapper">
              <table>
                <caption id="machines-caption-all">Liste complète des petites unités prioritaires (Atelier Pilote) et d'extension (Pôles Régionaux)</caption>
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
                <span style="font-size:0.78rem; font-weight:700; text-transform:uppercase; color:var(--muted);">${escapeHtml(p.badge)}</span>
                <h3 style="margin-block: 0.15rem 0.9rem; color: var(--forest); font-size:1.3rem;">${escapeHtml(p.title)} — Total Estimé : ${formatFcfa(p.totalEstimated)}</h3>
                <div tabindex="0" role="region" aria-labelledby="machines-caption-${i}" class="table-wrapper">
                  <table>
                    <caption id="machines-caption-${i}">${escapeHtml(p.title)}</caption>
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

    <!-- Innovations Produits & Marketing Terrain -->
    <section id="innovations">
      <div class="section-head">
        <div>
          <h2>3. Ivoiriser le Poivre (à l’international)</h2>
          <p>Comment nous écoulons le stock : démocratisation par le Stick à usage unique, conditionnement double-hermétique, coffrets événementiels, export calibré et force de vente terrain.</p>
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

      <!-- 4e Grand Bloc Stratégie Marketing Terrain -->
      <article class="field-marketing-banner" aria-labelledby="field-marketing-title">
        <div>
          <span class="eyebrow" style="margin-block-end:0.6rem;">Marketing Direct &amp; Force de Proximité</span>
          <h3 id="field-marketing-title" style="font-size:1.35rem; margin:0 0 0.65rem; color:#ffe3ae;">
            Brigade d’Ambassadrices aux Couleurs de la Coopérative dans les Marchés &amp; Pôles Culinaires
          </h3>
          <p style="margin:0 0 0.75rem; font-size:0.95rem; color:#e6efe9;">
            Pour accélérer la rotation des stocks et installer la marque dans le quotidien des ménages et des professionnels, nous déployons une équipe dédiée de <strong>jeunes hôtesses ambassadrices habillées aux couleurs du poivre et de la coopérative SCPPE</strong> (vert forêt et or).
          </p>
          <p style="margin:0; font-size:0.9rem; color:#d2e2d8;">
            Elles arpentent chaque semaine les <strong>grands marchés d’Abidjan, galeries marchandes, poissonneries, abords des supermarchés, gares gastronomiques et lieux culinaires fortement fréquentés</strong> pour faire sentir le grain frais, faire découvrir le Stick de table et le Duo Curcuma+Poivre, et transformer immédiatement la dégustation en ventes directes.
          </p>
          <div class="field-marketing-points">
            <strong style="display:block; color:#ffe3ae;">Points d’activation prioritaires :</strong>
            <ul>
              <li>Grands marchés vivriers &amp; espaces culinaires</li>
              <li>Zones de restauration, maquis &amp; grillades</li>
              <li>Rayons épices des supermarchés partenaires</li>
              <li>Foires gastronomiques, événements &amp; paniers de fêtes</li>
            </ul>
          </div>
        </div>
        <figure class="field-marketing-media">
          <img
            src="/generated/poivre_marche_abidjan.jpg"
            alt="Ambassadrice de la Brigade SCPPE sur un marché d’Abidjan présentant les sachets et pots de poivre"
            width="1280"
            height="720"
            loading="lazy"
          >
          <figcaption>
            Brigade Terrain Abidjan • Animation directe, dégustation du grain frais &amp; vente de proximité
          </figcaption>
        </figure>
      </article>
    </section>

    <!-- Derniers Contributeurs & Preuves Commerciales (foldables et foldés par défaut) -->
    <section id="contribuer" style="margin-block-start: 3.5rem;" aria-labelledby="contribuer-section-title">
      <div class="section-head" style="margin-block-end: 1.15rem;">
        <div>
          <h2 id="contribuer-section-title" style="margin:0; color:var(--forest);">4. Suivi des Contributions &amp; Preuves Commerciales B2B</h2>
          <p style="margin:0.35rem 0 0; color:var(--muted);">
            Cliquez sur l’un des deux volets ci-dessous pour déplier le journal des précommandes et des lettres d’intention (LOI) signées.
          </p>
        </div>
        <button type="button" class="btn-primary" data-open-dialog="dialog-contribuer" style="min-height:42px; font-size:0.9rem;">+ Participer (60M)</button>
      </div>

      <div class="foldable-proof-grid">
        <details class="form-card foldable-card">
          <summary class="foldable-summary">
            <span class="foldable-title">Derniers Contributeurs &amp; Précommandes (${pledges.length})</span>
            <span class="foldable-badge">${formatFcfa(metrics.raisedTotalFcfa)}</span>
          </summary>
          <div class="foldable-body">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-block-end:0.9rem;">
              <span style="font-size:0.86rem; color:var(--muted);">Les ${Math.min(pledges.length, 6)} derniers engagements enregistrés :</span>
              <button type="button" class="btn-primary" data-open-dialog="dialog-contribuer" style="min-height:38px; font-size:0.84rem;">+ Participer (60M)</button>
            </div>
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
        </details>

        <details class="form-card foldable-card">
          <summary class="foldable-summary">
            <span class="foldable-title">Preuves Commerciales B2B Déjà Signées (${b2bContracts.length} LOI)</span>
            <span class="foldable-badge">${b2bContracts.length} contrats LOI</span>
          </summary>
          <div class="foldable-body">
            <p style="font-size: 0.88rem; color: var(--muted); margin-top: 0;">
              Le dossier financier soulignait l’importance de documenter les ventes par des lettres d’intention (LOI). Voici les contrats générés via notre boutique B2B :
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
        </details>
      </div>
    </section>
  </main>

  <!-- Bouton rond fixe en bas à droite ouvrant la modale de participation 60M FCFA -->
  <div class="fab-round-wrap">
    <span class="fab-tooltip" aria-hidden="true">Participer / Précommander</span>
    <button
      type="button"
      class="fab-round"
      data-open-dialog="dialog-contribuer"
      aria-label="Participer à la levée de 60M FCFA ou précommander du stock"
      title="Participer à la levée de 60M FCFA ou précommander"
    >
      <span style="font-size: 1.2rem;">🚀</span>
      <span>60M</span>
    </button>
  </div>

  <!-- Modale Participation / Précommande (60M FCFA) -->
  <dialog id="dialog-contribuer" closedby="any" aria-labelledby="pledge-form-heading">
    <div class="dialog-head">
      <div>
        <h2 id="pledge-form-heading" style="margin: 0; color: var(--forest); font-size:1.3rem;">
          Participer à la Levée de 60M FCFA ou Précommander du Stock
        </h2>
        <p style="color: var(--muted); font-size: 0.88rem; margin: 0.35rem 0 0;">
          Précommande solidaire, préachat B2B ou co-financement machine/BFR. Les champs marqués d’un <span aria-hidden="true">*</span> sont obligatoires.
        </p>
      </div>
      <button type="button" class="dialog-close-x" data-close-dialog aria-label="Fermer le formulaire">✕</button>
    </div>

    <form action="/api/pledge" method="POST" aria-labelledby="pledge-form-heading" id="pledge-form" novalidate>
      <fieldset>
        <legend>1. Votre formule de participation <span aria-hidden="true">*</span></legend>
        <div class="radio-option">
          <input type="radio" id="mode-reward" name="contributionMode" value="Précommande Solidaire (Coffrets Ramadan/Fêtes & Sticks)" checked data-suggested-amount="30000" data-reward="Pack Découverte : 2 Coffrets Prestige 3 Poivres + 2 Boîtes de 50 Sticks (Pur & Curcuma)">
          <label for="mode-reward">
            <strong>Précommande Solidaire B2C (dès 15 000 FCFA)</strong> — Coffrets Cadeaux 3 Poivres &amp; Boîtes de Sticks Hermétiques
          </label>
        </div>
        <div class="radio-option">
          <input type="radio" id="mode-b2b" name="contributionMode" value="Préachat Professionnel de Stock (B2B / Maquis / Hôtels / Revendeurs)" data-suggested-amount="250000" data-reward="Lot Pro B2B à tarif préférentiel (-18%) + Livraison prioritaire Abidjan / Sous-région">
          <label for="mode-b2b">
            <strong>Préachat Professionnel B2B (dès 100 000 FCFA)</strong> — Réservation de cartons pour Maquis, Hôtels, Supermarchés et Grossistes
          </label>
        </div>
        <div class="radio-option">
          <input type="radio" id="mode-invest" name="contributionMode" value="Investissement Productif / Co-financement Machine & BFR" data-suggested-amount="1000000" data-reward="Convention Partenaire Pilote + Visite Terrain Certifié & Atelier + Reporting trimestriel">
          <label for="mode-invest">
            <strong>Co-Financement Machine / BFR Collecte (dès 500 000 FCFA)</strong> — Financement adossé aux petites unités de l’atelier pilote ou au rachat coopérative
          </label>
        </div>
      </fieldset>

      <div class="field">
        <label for="targetPole">2. Pôle d’investissement que vous souhaitez flécher</label>
        <span id="pole-hint" class="hint">Sélectionnez le pôle prioritaire que votre contribution soutiendra en premier.</span>
        <select id="targetPole" name="targetPole" aria-describedby="pole-hint">
          <option value="Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Pilote)">Pôle 1 — Conditionnement, Mouture &amp; Calibrage (Atelier Pilote)</option>
          <option value="Pôle 2 — Fonds de Roulement (BFR) Collecte Coopérative">Pôle 2 — Fonds de Roulement &amp; Collecte Coopérative (37 Planteurs)</option>
          <option value="Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)">Pôle 3 — Équipements Amont &amp; Pôles Régionaux</option>
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
        <textarea id="message" name="message" rows="2"></textarea>
      </div>

      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button type="submit" id="submit-pledge-btn" class="btn-primary" style="flex:1; justify-content: center; font-size: 1rem;">
          Valider mon Engagement (Campagne 60M FCFA)
        </button>
        <button type="button" class="btn-secondary" data-close-dialog>Fermer</button>
      </div>
    </form>
  </dialog>

  <!-- Modale Carte Interactive des Plantations Certifiées & Membres SCPPE -->
  <dialog id="dialog-carte-coop" class="modal-map-xl" closedby="any" aria-labelledby="dialog-carte-title">
    <div class="dialog-head">
      <div>
        <h2 id="dialog-carte-title" style="margin: 0; color: var(--forest);">
          Carte Interactive de la Coopérative SCPPE — 37 Membres dont 3 Certifiés Global GAP
        </h2>
        <p style="font-size: 0.86rem; color: var(--muted); margin: 0.25rem 0 0;">
          Cliquez sur un marqueur de la carte pour consulter les coordonnées GPS, partager le code géoloc, appeler ou calculer l’itinéraire.
        </p>
      </div>
      <button type="button" class="dialog-close-x" data-close-dialog aria-label="Fermer la carte" autofocus>✕</button>
    </div>

    <div class="map-toolbar">
      <div class="map-filters" role="group" aria-label="Filtrer les marqueurs de la carte">
        <button type="button" class="map-filter-btn" data-map-filter="all" aria-pressed="true">Tous les pôles (37 membres)</button>
        <button type="button" class="map-filter-btn" data-map-filter="certified" aria-pressed="false">Plantations certifiées (3)</button>
        <button type="button" class="map-filter-btn" data-map-filter="member" aria-pressed="false">Membres SCPPE non certifiés (34)</button>
      </div>
      <div class="map-legend">
        <span class="legend-item"><span class="legend-dot certified" aria-hidden="true"></span> Plantations certifiées (Vert turquoise)</span>
        <span class="legend-item"><span class="legend-dot member" aria-hidden="true"></span> Membres SCPPE non certifiés (Bleu ciel)</span>
        <span class="legend-item"><span class="legend-dot hub" aria-hidden="true"></span> Atelier Pilote Abidjan</span>
      </div>
    </div>

    <div class="modal-map-grid">
      <!-- Vraie Carte Interactive Leaflet (OpenStreetMap / Voyager / Satellite) -->
      <div class="modal-map-stage">
        <div id="modal-leaflet-map" class="modal-leaflet-stage" role="region" aria-label="Carte interactive Leaflet de la coopérative SCPPE en Côte d'Ivoire"></div>
      </div>

      <!-- Panneau d'informations du marqueur sélectionné -->
      <aside class="modal-map-inspector" aria-live="polite" aria-label="Détails du site sélectionné sur la carte">
        ${(() => {
      const initial = mapMarkers[0] || {};
      const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=5.3600,-3.9900&destination=${initial.lat},${initial.lng}&travelmode=driving`;
      return `<div>
            <span id="insp-badge" class="inspector-badge ${initial.certified ? 'certified' : 'member'}">
              ${initial.certified ? '🟢 Plantation Certifiée Global GAP' : '🔵 Membre Coopérative SCPPE (Non certifié)'}
            </span>
            <h3 id="insp-title" style="margin: 0.45rem 0 0.2rem; color: var(--forest); font-size: 1.12rem;">${escapeHtml(initial.title)}</h3>
            <div id="insp-sub" style="font-size: 0.84rem; color: var(--muted);">
              ${escapeHtml(initial.id)} • ${escapeHtml(initial.manager)} • ${escapeHtml(initial.regionPole)}
            </div>
          </div>

          <div class="inspector-specs">
            <div><strong>📅 Certification :</strong> <span id="insp-cert-date">${escapeHtml(initial.certDate)}</span></div>
            <div><strong>📜 Référence :</strong> <span id="insp-cert-ref">${escapeHtml(initial.certRef)}</span></div>
            <div><strong>📞 Téléphone :</strong> <a id="insp-phone-link" href="tel:${escapeHtml(String(initial.phone || '').replace(/\s+/g, ''))}" style="font-weight:700; color:var(--forest);">${escapeHtml(initial.phone)}</a></div>
            <div><strong>🌾 Surface &amp; Effectif :</strong> <span id="insp-members">${escapeHtml(initial.hectares)} ha • ${escapeHtml(initial.membersLabel)}</span></div>
            <div><strong>📦 Production &amp; Stock :</strong> <span id="insp-production">${escapeHtml(initial.driedStockKg)} kg secs dispo • ${escapeHtml(initial.annualProdEst)}</span></div>
            <div><strong>🌿 Variétés &amp; Score CNRA :</strong> <span id="insp-variety">${escapeHtml(initial.variety)} (Score ${escapeHtml(initial.standardizationScore)}%)</span></div>
          </div>

          <div class="geoloc-share-row">
            <div style="font-size:0.8rem;">
              <strong style="display:block; color:var(--forest);">📍 Code géoloc à partager :</strong>
              <code id="map-geoloc-code" style="font-weight:700; color:#0f766e;">${escapeHtml(initial.geolocCode)}</code>
            </div>
            <span class="copy-wrap">
              <button type="button" class="copy-button" command="--copy" commandfor="map-geoloc-code" aria-label="Copier le code de géolocalisation à partager">
                📋 Copier
              </button>
              <span class="tip" role="status"></span>
            </span>
          </div>

          <div class="inspector-actions">
            <a id="map-directions-btn" href="${escapeHtml(dirUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex:1; justify-content:center; min-height:42px; padding:0.5rem 0.9rem !important; font-size:0.88rem;">
              🧭 Itinéraire
            </a>
            <button type="button" id="map-share-btn" class="btn-secondary" style="min-height:42px; padding:0.5rem 0.85rem; font-size:0.84rem;" data-share-text="">
              🔗 Partager position
            </button>
            <a id="map-detail-link" href="${escapeHtml(initial.detailUrl || '#')}" class="btn-secondary" style="${initial.detailUrl ? '' : 'display:none;'} min-height:42px; padding:0.5rem 0.85rem; font-size:0.84rem;">
              🌱 Fiche terrain →
            </a>
          </div>

          <div class="inspector-quicklist" aria-label="Accès rapide aux sites de la carte">
            ${mapMarkers
          .map(
            (m, idx) => `<button type="button" class="quick-chip-btn" data-quick-marker="${escapeHtml(m.id)}" aria-current="${idx === 0 ? 'true' : 'false'}">
                  <span style="width:9px; height:9px; border-radius:50%; background:${m.certified ? '#0d9488' : '#0284c7'}; display:inline-block;"></span>
                  ${escapeHtml(m.shortLabel)}
                </button>`
          )
          .join('')}
          </div>`;
    })()}
      </aside>
    </div>

    <form method="dialog" style="display:flex; justify-content:flex-end; margin-top:1rem;">
      <button type="submit" class="btn-secondary">Fermer</button>
    </form>
  </dialog>

  <!-- Modale Variétés de Poivres & Traitement Avant Commercialisation -->
  <dialog id="dialog-varietes" class="modal-varieties-xl" closedby="any" aria-labelledby="dialog-varietes-title">
    <div class="dialog-head">
      <div>
        <h2 id="dialog-varietes-title" style="color: var(--forest); margin: 0;">
          Nos Variétés de Poivre &amp; Savoir-Faire Post-Récolte (<em>Piper nigrum</em>)
        </h2>
        <p style="font-size: 0.88rem; color: var(--muted); margin: 0.3rem 0 0;">
          Un même poivrier révèle des palettes aromatiques spectaculaires selon le moment exact de la cueillette au sécateur et le protocole de transformation.
        </p>
      </div>
      <button type="button" class="dialog-close-x" data-close-dialog aria-label="Fermer la modale variétés" autofocus>✕</button>
    </div>

    <!-- Emplacement Vidéo entre .dialog-head et .variety-grid -->
    <section class="variety-video-section" aria-labelledby="variety-video-title">
      <div class="variety-video-head">
        <div>
          <span class="video-status-pill">🎬 Vidéo Officielle SCPPE</span>
          <h3 id="variety-video-title" style="margin: 0.32rem 0 0.1rem; color: var(--forest); font-size: 0.98rem;">
            Présentation Vidéo des Variétés de Poivre SCPPE
          </h3>
          <p style="margin: 0; font-size: 0.8rem; color: var(--muted);">
            Découvrez en vidéo les différentes variétés de poivre cultivées, traitées et conditionnées par la coopérative SCPPE.
          </p>
        </div>
        <a
          href="https://youtu.be/lj633m58SVQ"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
          style="min-height: 36px; padding: 0.38rem 0.75rem; font-size: 0.8rem; white-space: nowrap;"
        >
          Ouvrir sur YouTube ↗
        </a>
      </div>
      <div class="variety-video-frame">
        <iframe
          id="variety-demo-video"
          data-src="https://www.youtube-nocookie.com/embed/lj633m58SVQ?rel=0"
          title="Présentation des variétés de poivre SCPPE (YouTube)"
          width="560"
          height="315"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </section>

    <div class="variety-grid">
      <article class="variety-card">
        <div class="swatch-row">
          <span class="swatch-dot" style="background:#1c1d1c;" title="Poivre Noir"></span>
        </div>
        <h4 class="variety-card-title">1. Poivre Noir</h4>
        <img src="/images/pots-poivre-noir-moulu.jpg" alt="Poivre Noir" width="400" height="250" loading="lazy">
        <p style="font-size:0.83rem; margin:0; color:var(--muted);">
          Récolté dès le 1er grain jaune sur la grappe, ébouillanté <strong>3 minutes en fût aluminium</strong> puis séché jusqu’à 12–13% d’humidité. Boisé, chaud et riche en pipérine tonique.
        </p>
      </article>

      <article class="variety-card">
        <div class="swatch-row">
          <span class="swatch-dot" style="background:#efe7d6;" title="Poivre Blanc Muntok"></span>
        </div>
        <h4 class="variety-card-title">2. Poivre Blanc (Muntok)</h4>
        <img src="/images/pots-poivre-blanc-moulu.jpg" alt="Poivre Blanc Muntok" width="400" height="250" loading="lazy">
        <p style="font-size:0.83rem; margin:0; color:var(--muted);">
          Issu de baies à pleine maturité <strong>rouies 10 jours en fût à vannes</strong> avec renouvellement d’eau pure toutes les 48 h, débarrassées du péricarpe. Cœur noble, raffiné et idéal pour poissons et sauces blanches.
        </p>
      </article>

      <article class="variety-card">
        <div class="swatch-row">
          <span class="swatch-dot" style="background:#df5f26;" title="Teinte 1 : Rouge Orangé Ambré"></span>
          <span class="swatch-dot" style="background:#b0231b;" title="Teinte 2 : Rouge Carmin Vif"></span>
          <span class="swatch-dot" style="background:#631727;" title="Teinte 3 : Rouge Pourpre Mature"></span>
        </div>
        <h4 class="variety-card-title">3. Poivre Rouge (3 teintes)</h4>
        <img src="/images/baies-maturite.jpg" alt="Poivre Rouge en trois teintes de maturité" width="400" height="250" loading="lazy">
        <p style="font-size:0.83rem; margin:0; color:var(--muted);">
          Cueilli à maturité avancée sur <strong>3 nuances naturelles</strong> (<em>orangé ambré, carmin vif, pourpre intense</em>). Séchage immédiat et délicat sans échauffement pour préserver la douceur fruitée du péricarpe.
        </p>
      </article>

      <article class="variety-card">
        <div class="swatch-row">
          <span class="swatch-dot" style="background:#4f7a38;" title="Poivre Vert"></span>
        </div>
        <h4 class="variety-card-title">4. Poivre Vert</h4>
        <img src="/images/plantation-grappes.jpg" alt="Poivre Vert frais sur grappe" width="400" height="250" loading="lazy">
        <p style="font-size:0.83rem; margin:0; color:var(--muted);">
          Baies immatures cueillies tôt avant le jaunissement, stabilisées rapidement à l’abri de l’oxydation pour conserver leur <strong>fraîcheur végétale vive</strong> et leur piquant léger.
        </p>
      </article>

      <article class="variety-card">
        <div class="swatch-row">
          <span class="swatch-dot" style="background:#1c1d1c;" title="Poivre Noir"></span>
          <span class="swatch-dot" style="background:#efe7d6;" title="Poivre Blanc"></span>
          <span class="swatch-dot" style="background:#b0231b;" title="Poivre Rouge"></span>
          <span class="swatch-dot" style="background:#d98218;" title="Curcuma"></span>
        </div>
        <h4 class="variety-card-title">5. Mélanges Signatures</h4>
        <img src="/images/pots-melange-3-poivres.jpg" alt="Pots de Mélange 3 Poivres et Duo Curcuma + Poivre Noir SCPPE" width="400" height="250" loading="lazy">
        <p style="font-size:0.83rem; margin:0; color:var(--muted);">
          <strong>Mélange &amp; Coffret 3 Poivres</strong> (Noir, Blanc, Rouge) et <strong>Duo Santé Curcuma + Poivre Noir</strong> en sticks et pots — la pipérine multiplie l’absorption de la curcumine jusqu’à 90%.
        </p>
      </article>
    </div>

    <!-- Infographie pure HTML5 : Traitement Essentiel du Poivre -->
    <section class="infographic-board" aria-labelledby="infographic-process-title">
      <header class="infographic-header">
        <div>
          <h3 id="infographic-process-title" style="margin: 0; color: var(--forest); font-size: 1.05rem;">
            🔬 Traitement Essentiel du Poivre Avant sa Mise en Commercialisation
          </h3>
          <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--muted);">
            Infographie HTML5 du circuit qualité SCPPE — 6 étapes maîtrisées de la grappe fraîche au conditionnement étanche.
          </p>
        </div>
        <div class="infographic-kpis" aria-label="Indicateurs clés de transformation">
          <span class="infographic-kpi-chip">🎯 Humidité &lt; 13%</span>
          <span class="infographic-kpi-chip">🛡️ Alu &amp; Inox Alimentaire</span>
          <span class="infographic-kpi-chip">📊 Score CNRA 98%</span>
        </div>
      </header>

      <ol class="infographic-flow">
        <li class="infographic-step" style="--step-accent: #2d6a4f;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">01</span>
              <span class="step-icon" aria-hidden="true">✂️</span>
            </span>
            <data class="step-kpi" value="selective">Cueillette au sécateur</data>
          </div>
          <h4>Récolte au Sécateur</h4>
          <p>Cueillette manuelle sélective par couleur et maturité sans jamais arracher la liane porteuse.</p>
          <div class="step-mini-flow">
            <span class="step-tag">🟢 Vert</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">🟡 Noir</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">🔴 Rouge</span>
          </div>
        </li>

        <li class="infographic-step" style="--step-accent: #0f766e;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">02</span>
              <span class="step-icon" aria-hidden="true">💧</span>
            </span>
            <data class="step-kpi" value="3">Triple lavage pur</data>
          </div>
          <h4>Égrainage &amp; Lavage</h4>
          <p>Séparation manuelle des rafles et triple lavage à l’eau propre en fûts aluminium alimentaires.</p>
          <div class="step-mini-flow">
            <span class="step-tag">Égrainage</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">3× Eau pure</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">Fût Alu</span>
          </div>
        </li>

        <li class="infographic-step" style="--step-accent: #b45309;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">03</span>
              <span class="step-icon" aria-hidden="true">🔥</span>
            </span>
            <data class="step-kpi" value="branching">3 voies par couleur</data>
          </div>
          <h4>Ébouillantage / Rouissage</h4>
          <p>Traitement thermique ou hydraulique adapté à la couleur visée et à la finesse aromatique.</p>
          <div class="step-branches">
            <div class="step-branch"><strong>🖤 Noir</strong><br>3 min chaud</div>
            <div class="step-branch"><strong>🤍 Blanc</strong><br>10 j (/48 h)</div>
            <div class="step-branch"><strong>❤️ Rouge</strong><br>Direct doux</div>
          </div>
        </li>

        <li class="infographic-step" style="--step-accent: #0d9488;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">04</span>
              <span class="step-icon" aria-hidden="true">☀️</span>
            </span>
            <data class="step-kpi" value="12.5">Cible 12–13%</data>
          </div>
          <h4>Séchage Hors-Sol</h4>
          <p>Sur claies surélevées à grillage plastique jusqu’au seuil critique du « grain qui crisse ».</p>
          <div class="moisture-gauge" aria-label="Jauge d'humidité cible de 12 à 13 pourcent">
            <div class="moisture-track"></div>
            <div class="moisture-labels">
              <span>✓ Sec stable : 12–13%</span>
              <span>Seuil max &lt; 13%</span>
            </div>
          </div>
        </li>

        <li class="infographic-step" style="--step-accent: #0284c7;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">05</span>
              <span class="step-icon" aria-hidden="true">🧺</span>
            </span>
            <data class="step-kpi" value="sorted">Tamis multi-étages</data>
          </div>
          <h4>Vannage &amp; Calibrage</h4>
          <p>Élimination des poussières/impuretés par flux d’air et calibrage granulométrique précis par diamètre.</p>
          <div class="step-mini-flow">
            <span class="step-tag">Vannage</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">Tamis Ø</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">Grade Extra</span>
          </div>
        </li>

        <li class="infographic-step" style="--step-accent: #123524;">
          <div class="infographic-step-top">
            <span class="step-badge-wrap">
              <span class="step-num" aria-hidden="true">06</span>
              <span class="step-icon" aria-hidden="true">📦</span>
            </span>
            <data class="step-kpi" value="sealed">Anti-humidité</data>
          </div>
          <h4>Mouture &amp; Double Hermétique</h4>
          <p>Broyage inox à froid pour préserver les huiles essentielles et scellage étanche climat tropical.</p>
          <div class="step-mini-flow">
            <span class="step-tag">Broyage Inox</span>
            <span aria-hidden="true">→</span>
            <span class="step-tag">Sticks • Zips • Pots</span>
          </div>
        </li>
      </ol>

      <footer class="infographic-footer-bar">
        <span>✅ Chaîne tracée Global GAP (GGN 4063651592948) — zéro séchage à même le sol</span>
        <span>🌿 Pipérine &amp; huiles essentielles conservées jusqu’à livraison</span>
      </footer>
    </section>

    <form method="dialog" style="display:flex; justify-content:flex-end; margin-top:1rem;">
      <button type="submit" class="btn-primary">J'ai compris, fermer l'aperçu</button>
    </form>
  </dialog>

  <!-- Modal Dialog Certificats with light-dismiss (closedby="any") -->
  <dialog id="dialog-certificats" closedby="any" aria-labelledby="dialog-cert-title">
    <div class="dialog-head">
      <div>
        <h2 id="dialog-cert-title" style="margin: 0; color: var(--forest);">
          Certificat Global GAP (Ecocert) &amp; Attestation Officielle de Plantation
        </h2>
        <p style="font-size: 0.9rem; color: var(--muted); margin:0.35rem 0 0;">
          Documents officiels délivrés à la <strong>Société Coopérative des Producteurs de Poivre d’Éburnie (SCPPE)</strong>, présidée par <strong>Mme ATSE Chiepo Solange</strong> (Présidente de Société Coopérative des Producteurs de Poivre d’Éburnie).
        </p>
      </div>
      <button type="button" class="dialog-close-x" data-close-dialog aria-label="Fermer" autofocus>✕</button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-block: 1rem;">
      <div>
        <strong style="display: block; margin-block-end: 0.4rem;">1. Certificat Global GAP (GGN 4063651592948)</strong>
        <img src="/images/certificat-globalgap.jpg" alt="Certificat Global GAP Ecocert" style="width: 100%; border-radius: 10px; border: 1px solid var(--border);">
      </div>
      <div>
        <strong style="display: block; margin-block-end: 0.4rem;">2. Attestation Ministère de l'Agriculture (10 ha)</strong>
        <img src="/images/attestation-plantation.jpg" alt="Attestation de Plantation 10 hectares Brofodoumé" style="width: 100%; border-radius: 10px; border: 1px solid var(--border);">
      </div>
    </div>
    <form method="dialog" style="display: flex; justify-content: flex-end;">
      <button type="submit" class="btn-primary">Fermer l’aperçu</button>
    </form>
  </dialog>

  <footer>
    <div class="container" style="padding-block: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem;">
      <div>
        <strong style="font-size: 1.1rem; color: #fff;">COOPÉRATIVE DE PRODUCTEURS DE POIVRE CERTIFIÉ (SCPPE)</strong>
        <p style="margin: 0.4rem 0; font-size: 0.9rem;">
          Le Comptoir du Poivre de Côte d’Ivoire • Brofodoumé, Azaguié, Yakassé Mé &amp; Abidjan<br>
          Contact WhatsApp Direct : +225 07 08 25 73 76 • Traçabilité GGN : 4063651592948
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <a href="/" style="color: #ffe3ae;">🌐 Hub Écosystème</a>
        <a href="/boutique" style="color: #ffe3ae;">🛒 Boutique E-Commerce &amp; B2B</a>
        <a href="/saas" style="color: #ffe3ae;">🏭 Portail Coopérative Agricole</a>
      </div>
    </div>
  </footer>

  <script type="application/json" id="coop-map-data">${JSON.stringify(mapMarkers).replace(/</g, '\\u003c')}</script>
  <script src="/vendor/leaflet/leaflet.js"></script>
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

    // 2. Real Interactive Leaflet Maps (Card 1 preview + Modal Explorer with filters, basemap switch, directions & copy)
    const mapMarkersData = JSON.parse(document.getElementById('coop-map-data')?.textContent || '[]');
    const ABIDJAN_HUB = [5.3600, -3.9900];
    const mapInfoBar = document.getElementById('coop-map-info');
    const quickChips = Array.from(document.querySelectorAll('[data-quick-marker]'));

    function createCoopPinIcon(m, isSelected, compact) {
      const fill = m.certified ? '#0d9488' : '#0284c7';
      const inner = m.certified ? '#99f6e4' : '#bae6fd';
      const w = compact ? 22 : 28;
      const h = compact ? 27 : 34;
      const svg =
        '<svg width="' + w + '" height="' + h + '" viewBox="0 0 28 34" aria-hidden="true">' +
        '<path d="M14 1C6.8 1 1 6.8 1 14c0 9.6 13 19 13 19s13-9.4 13-19C27 6.8 21.2 1 14 1z" fill="' + fill + '" stroke="#ffffff" stroke-width="2.2"/>' +
        '<circle cx="14" cy="13.5" r="5.5" fill="' + inner + '"/>' +
        (m.certified
          ? '<text x="14" y="16.4" font-size="8.8" font-weight="900" text-anchor="middle" fill="#0f766e">★</text>'
          : '<circle cx="14" cy="13.5" r="2.8" fill="#0369a1"/>') +
        '</svg>';
      const cls = 'coop-pin-inner ' + (m.certified ? 'is-certified' : 'is-member') + (isSelected ? ' is-selected' : '');
      const tag = compact ? '' : '<span class="coop-pin-tag">' + m.shortLabel.replace(/</g, '&lt;') + '</span>';
      return L.divIcon({
        className: 'leaflet-coop-pin',
        html: '<div class="' + cls + '">' + svg + tag + '</div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, compact ? -28 : -36]
      });
    }

    function buildDirectionsUrl(m) {
      return 'https://www.google.com/maps/dir/?api=1&origin=5.3600,-3.9900&destination=' + m.lat + ',' + m.lng + '&travelmode=driving';
    }

    function updateMiniMapBar(m) {
      if (!mapInfoBar || !m) return;
      mapInfoBar.innerHTML = '';
      const titleEl = document.createElement('strong');
      titleEl.textContent = (m.certified ? '🟢 ' : '🔵 ') + m.title;
      const descEl = document.createElement('div');
      descEl.style.color = 'var(--muted)';
      descEl.textContent = m.hectares + ' ha • ' + m.driedStockKg + ' kg secs • Tél: ' + m.phone + ' ';
      if (m.detailUrl) {
        const link = document.createElement('a');
        link.href = m.detailUrl;
        link.style.fontWeight = '700';
        link.style.color = 'var(--forest)';
        link.textContent = 'Voir la fiche terrain →';
        descEl.appendChild(link);
      }
      mapInfoBar.appendChild(titleEl);
      mapInfoBar.appendChild(descEl);
    }

    // Card 1 Mini-Map Leaflet
    let card1Map = null;
    if (typeof L !== 'undefined' && document.getElementById('card1-leaflet-map')) {
      card1Map = L.map('card1-leaflet-map', {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView([5.68, -4.18], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(card1Map);
      const miniBounds = [];
      mapMarkersData.forEach((m) => {
        miniBounds.push([m.lat, m.lng]);
        const mk = L.marker([m.lat, m.lng], { icon: createCoopPinIcon(m, false, true), title: m.title }).addTo(card1Map);
        mk.on('click', () => {
          updateMiniMapBar(m);
          selectedMarkerId = m.id;
        });
      });
      if (miniBounds.length) card1Map.fitBounds(miniBounds, { padding: [18, 18] });
    }

    // Modal Full Interactive Leaflet Map
    let modalMap = null;
    let certifiedLayer = null;
    let memberLayer = null;
    let modalRouteLine = null;
    let currentFilter = 'all';
    let selectedMarkerId = mapMarkersData[0]?.id || 'SCPPE-001';
    const leafletMarkerById = new Map();

    function updateInspectorFromMarker(m) {
      if (!m) return;
      selectedMarkerId = m.id;

      quickChips.forEach((c) => c.setAttribute('aria-current', c.dataset.quickMarker === m.id ? 'true' : 'false'));

      leafletMarkerById.forEach((mk, id) => {
        const dataItem = mapMarkersData.find((item) => item.id === id);
        if (dataItem) mk.setIcon(createCoopPinIcon(dataItem, id === m.id, false));
      });

      if (modalMap && modalRouteLine) {
        modalRouteLine.setLatLngs([ABIDJAN_HUB, [m.lat, m.lng]]);
        modalRouteLine.setStyle({ color: m.certified ? '#0d9488' : '#0284c7' });
      }

      const badge = document.getElementById('insp-badge');
      if (badge) {
        badge.className = 'inspector-badge ' + (m.certified ? 'certified' : 'member');
        badge.textContent = m.certified
          ? '🟢 Plantation Certifiée Global GAP'
          : '🔵 Membre Coopérative SCPPE (Non certifié)';
      }
      const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '';
      };
      setText('insp-title', m.title);
      setText('insp-sub', m.id + ' • ' + m.manager + ' • ' + m.regionPole);
      setText('insp-cert-date', m.certDate);
      setText('insp-cert-ref', m.certRef);
      setText('insp-members', m.hectares + ' ha • ' + m.membersLabel);
      setText('insp-production', m.driedStockKg + ' kg secs dispo • ' + m.annualProdEst);
      setText('insp-variety', m.variety + ' (Score ' + m.standardizationScore + '%)');
      setText('map-geoloc-code', m.geolocCode);

      const phoneEl = document.getElementById('insp-phone-link');
      if (phoneEl) {
        phoneEl.textContent = m.phone;
        phoneEl.href = 'tel:' + String(m.phone || '').replace(/\\s+/g, '');
      }

      const dirBtn = document.getElementById('map-directions-btn');
      if (dirBtn) dirBtn.href = buildDirectionsUrl(m);

      const shareBtn = document.getElementById('map-share-btn');
      if (shareBtn) {
        shareBtn.dataset.shareText =
          m.title + ' — Code géoloc: ' + m.geolocCode + ' — Itinéraire: https://maps.google.com/?q=' + m.lat + ',' + m.lng;
      }

      const detailEl = document.getElementById('map-detail-link');
      if (detailEl) {
        if (m.detailUrl) {
          detailEl.href = m.detailUrl;
          detailEl.style.display = 'inline-flex';
        } else {
          detailEl.style.display = 'none';
        }
      }
    }

    function initOrRefreshModalMap() {
      if (typeof L === 'undefined') return;
      const mapEl = document.getElementById('modal-leaflet-map');
      if (!mapEl) return;

      if (!modalMap) {
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        });
        const voyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        });
        const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          attribution: '&copy; Esri World Imagery'
        });

        modalMap = L.map(mapEl, {
          center: [5.68, -4.18],
          zoom: 9,
          layers: [osmLayer]
        });

        L.control.layers(
          {
            '🗺️ Plan (OpenStreetMap)': osmLayer,
            '🧭 Relief & Routes': voyagerLayer,
            '🛰️ Vue Satellite': satLayer
          },
          null,
          { position: 'topright' }
        ).addTo(modalMap);

        certifiedLayer = L.layerGroup().addTo(modalMap);
        memberLayer = L.layerGroup().addTo(modalMap);

        L.marker(ABIDJAN_HUB, {
          icon: L.divIcon({
            className: 'leaflet-coop-pin',
            html: '<div class="coop-hub-badge">🏭 Atelier Pilote Abidjan</div>',
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          }),
          interactive: false
        }).addTo(modalMap);

        modalRouteLine = L.polyline([ABIDJAN_HUB, ABIDJAN_HUB], {
          color: '#0d9488',
          weight: 3.5,
          dashArray: '8 6',
          opacity: 0.9
        }).addTo(modalMap);

        mapMarkersData.forEach((m) => {
          const mk = L.marker([m.lat, m.lng], {
            icon: createCoopPinIcon(m, m.id === selectedMarkerId, false),
            title: m.title
          });
          const popupNode = document.createElement('div');
          const statusLine = document.createElement('strong');
          statusLine.style.color = m.certified ? '#0f766e' : '#0369a1';
          statusLine.textContent = m.certified ? '🟢 Certifiée Global GAP' : '🔵 Membre SCPPE non certifié';
          const nameLine = document.createElement('div');
          nameLine.style.fontWeight = '700';
          nameLine.textContent = m.title;
          const infoLine = document.createElement('div');
          infoLine.textContent = m.hectares + ' ha • ' + m.driedStockKg + ' kg secs • ' + m.phone;
          const dirLink = document.createElement('a');
          dirLink.href = buildDirectionsUrl(m);
          dirLink.target = '_blank';
          dirLink.rel = 'noopener noreferrer';
          dirLink.className = 'leaflet-popup-dir';
          dirLink.textContent = '🧭 Itinéraire GPS →';
          popupNode.append(statusLine, nameLine, infoLine, dirLink);

          mk.bindPopup(popupNode);
          mk.on('click', () => {
            updateInspectorFromMarker(m);
          });
          leafletMarkerById.set(m.id, mk);
          mk.addTo(m.certified ? certifiedLayer : memberLayer);
        });
      }

      const fitVisible = () => {
        if (!modalMap) return;
        modalMap.invalidateSize();
        const visiblePts = mapMarkersData
          .filter((m) => currentFilter === 'all' || (currentFilter === 'certified' ? m.certified : !m.certified))
          .map((m) => [m.lat, m.lng]);
        visiblePts.push(ABIDJAN_HUB);
        modalMap.fitBounds(visiblePts, { padding: [36, 36] });
        const sel = mapMarkersData.find((m) => m.id === selectedMarkerId) || mapMarkersData[0];
        if (sel) updateInspectorFromMarker(sel);
      };

      requestAnimationFrame(fitVisible);
      setTimeout(fitVisible, 120);
    }

    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const m = mapMarkersData.find((item) => item.id === chip.dataset.quickMarker);
        if (!m) return;
        if (modalMap && certifiedLayer && memberLayer) {
          if (m.certified && !modalMap.hasLayer(certifiedLayer)) certifiedLayer.addTo(modalMap);
          if (!m.certified && !modalMap.hasLayer(memberLayer)) memberLayer.addTo(modalMap);
          modalMap.setView([m.lat, m.lng], Math.max(modalMap.getZoom(), 10), { animate: true });
          leafletMarkerById.get(m.id)?.openPopup();
        }
        updateInspectorFromMarker(m);
      });
    });

    document.querySelectorAll('[data-map-filter]').forEach((fbtn) => {
      fbtn.addEventListener('click', () => {
        currentFilter = fbtn.dataset.mapFilter;
        document.querySelectorAll('[data-map-filter]').forEach((b) => {
          b.setAttribute('aria-pressed', b === fbtn ? 'true' : 'false');
        });
        if (modalMap && certifiedLayer && memberLayer) {
          if (currentFilter === 'all') {
            certifiedLayer.addTo(modalMap);
            memberLayer.addTo(modalMap);
          } else if (currentFilter === 'certified') {
            certifiedLayer.addTo(modalMap);
            modalMap.removeLayer(memberLayer);
          } else {
            memberLayer.addTo(modalMap);
            modalMap.removeLayer(certifiedLayer);
          }
          const visibleList = mapMarkersData.filter((m) =>
            currentFilter === 'all' ? true : currentFilter === 'certified' ? m.certified : !m.certified
          );
          if (visibleList.length) {
            const bounds = visibleList.map((m) => [m.lat, m.lng]);
            bounds.push(ABIDJAN_HUB);
            modalMap.fitBounds(bounds, { padding: [36, 36] });
            const stillVisible = visibleList.find((m) => m.id === selectedMarkerId);
            if (!stillVisible) updateInspectorFromMarker(visibleList[0]);
          }
        }
      });
    });

    // 2c. Copy Button + Share Position (modern-web-guidance copy-button)
    const copyTimers = new WeakMap();
    let lastCopyMsg = '';
    function legacyCopy(text) {
      const field = Object.assign(document.createElement('textarea'), { value: text });
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
      document.body.append(field);
      field.select();
      try { return document.execCommand('copy'); } finally { field.remove(); }
    }
    function reportCopy(button, ok) {
      const tip = button.nextElementSibling;
      if (!tip) return;
      clearTimeout(copyTimers.get(button));
      button.removeAttribute('data-copied');
      button.removeAttribute('data-failed');
      let message = ok ? 'Copié !' : 'Échec copie';
      if (message === lastCopyMsg) message += '\\u00A0';
      lastCopyMsg = message;
      tip.textContent = '';
      void button.offsetWidth;
      button.setAttribute(ok ? 'data-copied' : 'data-failed', '');
      requestAnimationFrame(() => { tip.textContent = message; });
      copyTimers.set(button, setTimeout(() => {
        button.removeAttribute('data-copied');
        button.removeAttribute('data-failed');
        tip.textContent = '';
      }, 2200));
    }
    async function runCopy(button, target) {
      const text = target.matches('input, textarea') ? target.value : target.innerText.trim();
      if (!text) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else if (!legacyCopy(text)) {
          throw new Error('Copy unavailable');
        }
        reportCopy(button, true);
      } catch {
        if (legacyCopy(text)) reportCopy(button, true);
        else reportCopy(button, false);
      }
    }
    if ('CommandEvent' in window) {
      document.addEventListener('command', (event) => {
        if (event.command === '--copy') runCopy(event.source, event.target);
      }, true);
    } else {
      document.addEventListener('click', (event) => {
        const button = event.target.closest('button[command="--copy"]');
        if (!button) return;
        const target = document.getElementById(button.getAttribute('commandfor'));
        if (target) runCopy(button, target);
      });
    }

    const shareBtnEl = document.getElementById('map-share-btn');
    if (shareBtnEl) {
      const initialMarker = mapMarkersData[0];
      if (initialMarker) {
        shareBtnEl.dataset.shareText =
          initialMarker.title + ' — Code géoloc: ' + initialMarker.geolocCode + ' — Itinéraire: https://maps.google.com/?q=' + initialMarker.lat + ',' + initialMarker.lng;
      }
      shareBtnEl.addEventListener('click', async () => {
        const payload = shareBtnEl.dataset.shareText || document.getElementById('map-geoloc-code')?.innerText || '';
        if (!payload) return;
        if (navigator.share) {
          try {
            await navigator.share({ title: document.getElementById('insp-title')?.textContent || 'Plantation SCPPE', text: payload });
            return;
          } catch (_err) { /* fallback to clipboard below if user cancelled/unsupported */ }
        }
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(payload);
          else legacyCopy(payload);
          const orig = shareBtnEl.textContent;
          shareBtnEl.textContent = '✓ Lien géoloc copié';
          setTimeout(() => { shareBtnEl.textContent = orig; }, 2000);
        } catch (_err) {}
      });
    }

    // 3. Accessible 10-image Carousel with scroll snap, auto-play & controls (modern-web-guidance)
    document.querySelectorAll('.carousel').forEach((carousel) => {
      const track = carousel.querySelector('.carousel-track');
      const slides = Array.from(track.querySelectorAll('[role="group"]'));
      const markersNav = carousel.querySelector('.carousel-markers');
      const statusEl = carousel.querySelector('.carousel-status');
      const prevBtn = carousel.querySelector('[data-direction="previous"]');
      const nextBtn = carousel.querySelector('[data-direction="next"]');
      const pauseBtn = carousel.querySelector('#cnra-carousel-toggle');

      let currentIndex = 0;
      let pendingTarget = null;
      let rafId = null;
      let autoTimer = null;
      let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      slides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', slide.dataset.markerName || ('Diapositive ' + (idx + 1)));
        dot.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(idx, true));
        markersNav.appendChild(dot);
      });

      const markerButtons = Array.from(markersNav.querySelectorAll('button'));

      function updateMarkerState(idx) {
        markerButtons.forEach((btn, i) => {
          btn.setAttribute('aria-current', i === idx ? 'true' : 'false');
        });
      }

      function computeNearestSlide() {
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        slides.forEach((s, i) => {
          const sRect = s.getBoundingClientRect();
          const slideCenter = sRect.left + sRect.width / 2;
          const dist = Math.abs(trackCenter - slideCenter);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        return bestIdx;
      }

      function goToSlide(targetIdx, announce = false) {
        const count = slides.length;
        const wrapped = ((targetIdx % count) + count) % count;
        pendingTarget = wrapped;
        currentIndex = wrapped;
        updateMarkerState(wrapped);
        const targetSlide = slides[wrapped];
        const delta = targetSlide.getBoundingClientRect().left - track.getBoundingClientRect().left;
        track.scrollBy({
          left: delta,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
        if (announce && statusEl) {
          statusEl.textContent = 'Diapositive ' + (wrapped + 1) + ' sur ' + count;
        }
      }

      prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1, true));
      nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1, true));

      const onSettle = () => {
        const settledIdx = computeNearestSlide();
        pendingTarget = null;
        if (settledIdx !== currentIndex) {
          currentIndex = settledIdx;
          updateMarkerState(settledIdx);
          if (statusEl) {
            statusEl.textContent = 'Diapositive ' + (settledIdx + 1) + ' sur ' + slides.length;
          }
        }
      };

      track.addEventListener('scroll', () => {
        if (pendingTarget !== null || rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const nearest = computeNearestSlide();
          if (nearest !== currentIndex) {
            currentIndex = nearest;
            updateMarkerState(nearest);
          }
        });
      });

      if ('onscrollend' in window) {
        track.addEventListener('scrollend', onSettle);
      } else {
        let debounce;
        track.addEventListener('scroll', () => {
          clearTimeout(debounce);
          debounce = setTimeout(onSettle, 150);
        });
      }

      function startAuto() {
        stopAuto();
        if (userPaused) return;
        autoTimer = setInterval(() => {
          if (!document.hidden && !carousel.matches(':hover') && !carousel.contains(document.activeElement)) {
            goToSlide(currentIndex + 1, false);
          }
        }, 4200);
      }
      function stopAuto() {
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      }

      if (pauseBtn) {
        if (userPaused) {
          pauseBtn.textContent = '▶ Lecture';
          pauseBtn.setAttribute('aria-pressed', 'true');
        }
        pauseBtn.addEventListener('click', () => {
          userPaused = !userPaused;
          pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
          pauseBtn.textContent = userPaused ? '▶ Lecture' : '⏸ Pause';
          if (userPaused) stopAuto();
          else startAuto();
        });
      }

      carousel.addEventListener('pointerenter', stopAuto);
      carousel.addEventListener('pointerleave', startAuto);
      carousel.addEventListener('focusin', stopAuto);
      carousel.addEventListener('focusout', startAuto);
      startAuto();
    });

    // 4. Dialog opener, close button, video lifecycle & light-dismiss fallback (from modern-web-guidance)
    const syncVarietyVideo = (active) => {
      const iframe = document.getElementById('variety-demo-video');
      if (!iframe) return;
      if (active) {
        if (!iframe.getAttribute('src') && iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
        }
      } else if (iframe.getAttribute('src')) {
        iframe.removeAttribute('src');
      }
    };

    document.querySelectorAll('[data-open-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dlg = document.getElementById(btn.dataset.openDialog);
        if (dlg) {
          dlg.showModal();
          dlg.scrollTop = 0;
          requestAnimationFrame(() => {
            dlg.scrollTop = 0;
          });
          if (dlg.id === 'dialog-carte-coop') {
            initOrRefreshModalMap();
          } else if (dlg.id === 'dialog-varietes') {
            syncVarietyVideo(true);
          }
        }
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
        if (dialog.id === 'dialog-varietes') {
          syncVarietyVideo(false);
        }
      });
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        // Test the pointer position, not event.target: <dialog> is also the target for its own padding/gaps
        const outside = (e) => {
          const r = dialog.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => {
          pressedOutside = outside(e);
        });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && outside(e)) {
            dialog.close();
          }
          pressedOutside = false;
        });
      }
    }

    // 5. Tabs with hidden="until-found" & beforematch sync (from modern-web-guidance)
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

    // 6. Form validation after interaction + ARIA live sync (from modern-web-guidance)
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


  return html;
}

module.exports = { renderCrowdfundingPage };
