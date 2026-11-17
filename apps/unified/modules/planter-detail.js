const { renderUnifiedBar } = require('./bar');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TERRAIN_PROFILES = {
  'SCPPE-001': {
    slug: 'brofodoume',
    farmTitle: 'Plantation SOPPI — Brofodoumé (Anyama)',
    tagline: 'Parcelle pilote historique certifiée Global GAP (10 ha plantés sur 16,64 ha)',
    terroirDescription:
      'Située sur l’axe Brofodoumé–Anyama au nord d’Abidjan, cette parcelle bénéficie d’un microclimat humide propice au poivrier (Piper nigrum) avec une pluviométrie bien répartie. Le terrain est structuré en allées drainées et paillées, conduites sur tuteurs vivants Glyricidia espacés de 2 m × 2 m (environ 2 500 à 2 800 plants par hectare).',
    soilAndAgronomy:
      'Sols sablo-argileux riches en matière organique forestière, protégés contre l’érosion par un couvert végétal et un paillage régulier au pied des lianes. Une ombrière de pépinière (2,5 m) assure la multiplication saine de boutures à 2–3 nœuds (variétés Muntok & Lampong, clones CNRA).',
    infrastructure:
      'Station amont complète intégrée au site : aire de lavage double en fûts d’aluminium, cuves d’ébouillantage 3 minutes pour le poivre noir, fûts à vannes pour le rouissage de 10 jours du poivre blanc, et claies de séchage sur grillage plastique perforé garantissant 12–13 % d’humidité.',
    gallery: [
      { src: '/images/plantation-allees.jpg', caption: 'Allées arborées de poivriers sur tuteurs vivants à Brofodoumé' },
      { src: '/images/plantation-grappes.jpg', caption: 'Grappes de poivre en pleine maturation sous couvert régulé' },
      { src: '/images/attestation-plantation.jpg', caption: 'Attestation officielle de plantation (10 ha certifiés)' },
      { src: '/images/certificat-globalgap.jpg', caption: 'Certificat Global GAP Ecocert (GGN 4063651592948)' }
    ],
    siteCode: 'POLE-BROFODOUME',
    totalReserveHa: '16,64 ha (dont 10 ha en production)',
    altitude: '45 – 70 m',
    gpsApprox: '5°30′N, 3°56′O'
  },
  'SCPPE-002': {
    slug: 'azaguie',
    farmTitle: 'Domaine Fiessou — Azaguié (Agnéby-Tiassa)',
    tagline: 'Pôle relais certifié Global GAP spécialisé en variété Muntok gros calibre (4,5 ha)',
    terroirDescription:
      'Implanté au cœur du bassin agricole d’Azaguié, le Domaine Fiessou occupe un coteau légèrement vallonné favorisant un ressuyage naturel après les pluies. Le terrain accueille 4,5 hectares de poivriers palissés en rangs aérés, limitant la pression fongique tout en maximisant l’ensoleillement des grappes.',
    soilAndAgronomy:
      'Terres forestières profondes enrichies en compost végétal, dédiées principalement au cultivar Muntok sélectionné pour le poids élevé de ses baies (14 g / 100 grains frais, 5,2 g sec). Récolte sélective au sécateur dès l’apparition du premier grain jaune sur la grappe.',
    infrastructure:
      'Aire de séchage dédiée sur grillage plastique perforé hors-sol, cuves d’ébouillantage standardisé, atomiseurs phytosanitaires mutualisés pour le pôle Agnéby-Tiassa et stockage tampon en sacs double-hermétiques avant transfert vers l’atelier pilote d’Abidjan.',
    gallery: [
      { src: '/images/baies-maturite.jpg', caption: 'Baies de variété Muntok au stade optimal de récolte (grain jaune)' },
      { src: '/images/recolte-sechage.jpg', caption: 'Séchage contrôlé à 12–13 % d’humidité sur claies perforées' },
      { src: '/images/plantation-allees.jpg', caption: 'Conduite en rangs aérés sur tuteurs vivants à Azaguié' },
      { src: '/images/certificat-globalgap.jpg', caption: 'Couverture certification Global GAP GGN 4063651592948' }
    ],
    siteCode: 'POLE-AZAGUIE',
    totalReserveHa: '4,5 ha en pleine production',
    altitude: '60 – 95 m',
    gpsApprox: '5°38′N, 4°05′O'
  },
  'SCPPE-003': {
    slug: 'yakasse-me',
    farmTitle: 'Domaine Kobenan — Yakassé Mé (Région de la Mé)',
    tagline: 'Pôle relais certifié Global GAP orienté Poivre Blanc Muntok & Rouge mature (5 ha)',
    terroirDescription:
      'Établi à Yakassé Mé dans la région de la Mé, ce domaine de 5 hectares profite d’un couvert hydrique et forestier d’altitude douce, idéal pour mener les grappes à pleine maturité physiologique (jaune à rouge) nécessaires à l’élaboration du poivre blanc et du poivre rouge.',
    soilAndAgronomy:
      'Sols limono-argileux fertiles avec gestion agroécologique des adventices et conduite rigoureuse des lianes Lampong & Muntok. Chaque parcelle est suivie selon l’itinéraire technique CNRA/FIRCA afin de garantir une densité supérieure et une teneur élevée en pipérine.',
    infrastructure:
      'Équipé de bacs de rouissage à vannes dédiés au poivre blanc (trempage 10 jours avec renouvellement d’eau pure toutes les 48 h), d’aires de séchage solaire isolées du sol et d’un magasin tampon sec ventilé et protégé.',
    gallery: [
      { src: '/images/plantation-grappes.jpg', caption: 'Lianes chargées de grappes destinées au poivre blanc et rouge' },
      { src: '/images/recolte-sechage.jpg', caption: 'Séchage hygiénique après dépulpation à eau pure à Yakassé Mé' },
      { src: '/images/pots-poivre-blanc-moulu.jpg', caption: 'Poivre blanc Muntok issu du pôle Yakassé Mé' },
      { src: '/images/certificat-globalgap.jpg', caption: 'Certification Global GAP GGN 4063651592948' }
    ],
    siteCode: 'POLE-YAKASSE-ME',
    totalReserveHa: '5,0 ha plantés et standardisés',
    altitude: '85 – 120 m',
    gpsApprox: '5°49′N, 3°52′O'
  }
};

function resolveCertifiedProducer(producers, identifier) {
  const certified = producers.filter((p) => p.globalGapCertified);
  const key = String(identifier || '').trim().toLowerCase();
  return certified.find((p) => {
    const profile = TERRAIN_PROFILES[p.code];
    return (
      p.code.toLowerCase() === key ||
      p.id.toLowerCase() === key ||
      (profile && profile.slug.toLowerCase() === key)
    );
  });
}

function renderCertifiedListPage(ecosystemSummary) {
  const { producers } = ecosystemSummary;
  const certified = producers.filter((p) => p.globalGapCertified);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 Planteurs Certifiés Global GAP — Terrains Agricoles SCPPE</title>
  <style>
    :root { --bg:#f8f6f0; --surface:#fff; --forest:#102d1c; --gold:#c88a2b; --text:#1d261e; --muted:#5e6b60; --border:#dfd7cb; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; line-height:1.55; }
    .wrap { max-width:1200px; margin:0 auto; padding:2rem 1.25rem 4rem; }
    .hero { background:linear-gradient(135deg,#102d1c,#1b492f); color:#fff; padding:2rem; border-radius:16px; margin-bottom:2rem; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:1.5rem; }
    .card { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 6px 20px rgba(0,0,0,.06); }
    .card img { width:100%; height:200px; object-fit:cover; border-bottom:1px solid var(--border); }
    .card-body { padding:1.35rem; flex:1; display:flex; flex-direction:column; gap:.65rem; }
    .badge { display:inline-block; background:#e1f3e8; color:#0f5328; font-size:.76rem; font-weight:700; padding:.2rem .65rem; border-radius:999px; width:fit-content; }
    .btn { margin-top:auto; display:inline-flex; align-items:center; justify-content:center; padding:.65rem 1rem; background:var(--forest); color:#fff; border-radius:8px; text-decoration:none; font-weight:700; }
    .btn:hover { background:#1b492f; }
  </style>
</head>
<body>
  ${renderUnifiedBar('hub')}
  <main class="wrap">
    <p style="margin-bottom:1rem;"><a href="/" style="color:#102d1c; font-weight:700; text-decoration:none;">← Retour au Hub Écosystème</a></p>
    <section class="hero">
      <h1 style="font-size:1.85rem; margin-bottom:.5rem;">Les 3 Exploitations Certifiées Global GAP de la Coopérative SCPPE</h1>
      <p style="color:#d6e2d9;">Découvrez le terrain agricole, les variétés cultivées (Muntok &amp; Lampong) et les équipements post-récolte de chacune des 3 plantations certifiées qui pilotent la standardisation des 37 membres producteurs de la coopérative.</p>
    </section>
    <div class="grid">
      ${certified
        .map((p) => {
          const prof = TERRAIN_PROFILES[p.code] || {};
          const img = prof.gallery?.[0]?.src || '/images/plantation-allees.jpg';
          return `<article class="card">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(prof.farmTitle || p.fullName)}">
            <div class="card-body">
              <span class="badge">🏅 Certifié Global GAP • ${escapeHtml(p.code)}</span>
              <h2 style="font-size:1.2rem; color:var(--forest);">${escapeHtml(prof.farmTitle || p.fullName)}</h2>
              <p style="font-size:.88rem; color:var(--muted);">${escapeHtml(prof.tagline || p.roleTitle)}</p>
              <div style="font-size:.85rem;">
                <strong>Localité :</strong> ${escapeHtml(p.locality)} (${escapeHtml(p.regionPole)})<br>
                <strong>Surface :</strong> ${p.hectares} ha • <strong>Score CNRA :</strong> ${p.standardizationScore}%
              </div>
              <a class="btn" href="/planteurs/${escapeHtml(p.code)}">Visiter la fiche terrain complète →</a>
            </div>
          </article>`;
        })
        .join('')}
    </div>
  </main>
</body>
</html>`;
}

function renderPlanterDetailPage(ecosystemSummary, identifier) {
  const { producers, sites, lots } = ecosystemSummary;
  const certified = producers.filter((p) => p.globalGapCertified);
  const producer = resolveCertifiedProducer(producers, identifier);

  if (!producer) {
    return null;
  }

  const profile = TERRAIN_PROFILES[producer.code] || {
    farmTitle: producer.fullName,
    tagline: producer.roleTitle,
    terroirDescription: `Parcelle certifiée Global GAP située à ${producer.locality} (${producer.regionPole}).`,
    soilAndAgronomy: `Culture raisonnée selon le référentiel CNRA / FIRCA (${producer.variety}).`,
    infrastructure: 'Aires de séchage et de conditionnement standardisées.',
    gallery: [{ src: '/images/plantation-allees.jpg', caption: producer.locality }],
    totalReserveHa: `${producer.hectares} ha`,
    altitude: 'Région côtière / forestière de Côte d’Ivoire',
    gpsApprox: producer.locality
  };

  const relatedSite = sites.find((s) => s.code === profile.siteCode);
  const relatedLots = lots.filter((l) => l.producerId === producer.id);
  const checklist = producer.checklist || {};

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(profile.farmTitle)} — Terrain Agricole Certifié Global GAP</title>
  <style>
    :root { --bg:#f8f6f0; --surface:#fff; --surface-alt:#f1ebe0; --forest:#102d1c; --forest-mid:#1b492f; --gold:#c88a2b; --text:#1d261e; --muted:#5a675d; --border:#dcd3c5; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; line-height:1.6; }
    .container { max-width:1240px; margin:0 auto; padding:1.75rem 1.25rem 4rem; }
    .breadcrumb { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; margin-bottom:1.25rem; font-size:.9rem; }
    .breadcrumb a { color:var(--forest); font-weight:700; text-decoration:none; }
    .breadcrumb a:hover { text-decoration:underline; }
    .switcher { display:flex; flex-wrap:wrap; gap:.5rem; }
    .switcher a { padding:.4rem .8rem; border-radius:999px; font-size:.82rem; border:1px solid var(--border); background:#fff; color:var(--forest); text-decoration:none; font-weight:600; }
    .switcher a.active { background:var(--forest); color:#fff; border-color:var(--forest); }
    .hero { background:linear-gradient(135deg,#0e291a 0%,#1c4c30 100%); color:#fff; border-radius:18px; padding:2.1rem; margin-bottom:2rem; border:1px solid rgba(200,138,43,.35); }
    .pill { display:inline-flex; align-items:center; gap:.35rem; padding:.28rem .75rem; border-radius:999px; font-size:.78rem; font-weight:700; background:rgba(200,138,43,.25); border:1px solid rgba(247,212,146,.5); color:#ffe4ad; margin-bottom:.85rem; }
    .hero h1 { font-size:clamp(1.6rem,2.6vw,2.25rem); margin-bottom:.5rem; }
    .stats-strip { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:1rem; margin-top:1.5rem; }
    .stat-box { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.16); border-radius:10px; padding:.9rem 1rem; }
    .stat-box small { display:block; font-size:.75rem; color:#cde0d4; text-transform:uppercase; }
    .stat-box strong { font-size:1.05rem; color:#fff; }
    .grid-2 { display:grid; grid-template-columns:1.15fr .85fr; gap:1.5rem; margin-bottom:2rem; }
    @media (max-width:900px) { .grid-2 { grid-template-columns:1fr; } }
    .panel { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:1.5rem; }
    .panel h2 { font-size:1.25rem; color:var(--forest); margin-bottom:.85rem; }
    .panel h3 { font-size:1rem; color:var(--forest); margin:1rem 0 .4rem; }
    .panel p, .panel li { font-size:.93rem; color:var(--text); }
    .checklist { list-style:none; display:grid; gap:.55rem; margin-top:.5rem; }
    .checklist li { background:var(--surface-alt); padding:.6rem .85rem; border-radius:8px; font-size:.88rem; }
    .gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1rem; }
    .gallery figure { background:#fff; border:1px solid var(--border); border-radius:12px; overflow:hidden; }
    .gallery img { width:100%; height:190px; object-fit:cover; display:block; }
    .gallery figcaption { padding:.65rem .8rem; font-size:.82rem; color:var(--muted); }
  </style>
</head>
<body>
  ${renderUnifiedBar('hub')}
  <main class="container">
    <div class="breadcrumb">
      <div>
        <a href="/">← Retour au Hub</a> &nbsp;|&nbsp; <a href="/invest#preuves">Carte Coopérative Financement</a> &nbsp;|&nbsp; <a href="/planteurs">Les 3 Domaines Certifiés</a>
      </div>
      <nav class="switcher" aria-label="Changer de domaine certifié Global GAP">
        ${certified
          .map(
            (cp) => `<a href="/planteurs/${escapeHtml(cp.code)}" class="${cp.code === producer.code ? 'active' : ''}">${escapeHtml((TERRAIN_PROFILES[cp.code]?.farmTitle || cp.fullName).split('—')[0].trim())}</a>`
          )
          .join('')}
      </nav>
    </div>

    <section class="hero">
      <span class="pill">🏅 Exploitation Certifiée Global GAP • GGN 4063651592948 • ${escapeHtml(producer.code)}</span>
      <h1>${escapeHtml(profile.farmTitle)}</h1>
      <p style="color:#d8e6dd; max-width:850px;">${escapeHtml(profile.tagline)}</p>
      <div class="stats-strip">
        <div class="stat-box">
          <small>Responsable / Référent</small>
          <strong>${escapeHtml(producer.fullName)}</strong>
        </div>
        <div class="stat-box">
          <small>Surface Agricole</small>
          <strong>${escapeHtml(profile.totalReserveHa)}</strong>
        </div>
        <div class="stat-box">
          <small>Variétés Cultivées</small>
          <strong>${escapeHtml(producer.variety)}</strong>
        </div>
        <div class="stat-box">
          <small>Localisation &amp; Altitude</small>
          <strong>${escapeHtml(producer.locality)} (${escapeHtml(profile.altitude)})</strong>
        </div>
        <div class="stat-box">
          <small>Stock Sec Disponible</small>
          <strong>${producer.driedStockAvailableKg} kg (12–13% hum.)</strong>
        </div>
      </div>
    </section>

    <div class="grid-2">
      <section class="panel">
        <h2>🌱 Présentation du Terrain Agricole &amp; Conduite Culture</h2>
        <h3>Topographie, Climat &amp; Implantation (${escapeHtml(profile.gpsApprox)})</h3>
        <p>${escapeHtml(profile.terroirDescription)}</p>

        <h3>Pédologie &amp; Itinéraire Agroécologique CNRA</h3>
        <p>${escapeHtml(profile.soilAndAgronomy)}</p>

        <h3>Infrastructures Post-Récolte sur Parcelle</h3>
        <p>${escapeHtml(profile.infrastructure)}</p>

        ${
          relatedSite
            ? `<div style="margin-top:1.15rem; background:var(--surface-alt); padding:1rem; border-radius:10px; border:1px solid var(--border);">
                <strong style="color:var(--forest);">Équipements actifs sur ce pôle (${escapeHtml(relatedSite.code)}) :</strong>
                <ul style="margin:.4rem 0 0 1.2rem; font-size:.88rem;">
                  ${relatedSite.equipments.map((eq) => `<li>${escapeHtml(eq)}</li>`).join('')}
                </ul>
              </div>`
            : ''
        }
      </section>

      <aside class="panel">
        <h2>✅ Conformité Standardisation &amp; Lots Traçables</h2>
        <p style="font-size:.88rem; color:var(--muted); margin-bottom:.6rem;">
          Score de conformité CNRA / Global GAP : <strong style="color:var(--forest);">${producer.standardizationScore}%</strong> • Année d'implantation : <strong>${producer.plantingYear}</strong>
        </p>
        <ul class="checklist">
          <li>${checklist.nurseryShade ? '✅' : '⏳'} Pépinière sous ombrière &amp; boutures 2–3 nœuds</li>
          <li>${checklist.livingTutorsGlyricidia ? '✅' : '⏳'} Tuteurs vivants <em>Glyricidia</em> (2m × 2m)</li>
          <li>${checklist.phytosanitaryCompliant ? '✅' : '⏳'} Paillage &amp; protection phytosanitaire raisonnée</li>
          <li>${checklist.secateurHarvestYellowGrain ? '✅' : '⏳'} Récolte sécateur dès le 1er grain jaune</li>
          <li>${checklist.blanching3MinOrRetting10Days ? '✅' : '⏳'} Ébouillantage 3 min / Rouissage 10 jours</li>
          <li>${checklist.moisture12To13Percent ? '✅' : '⏳'} Séchage grillage plastique à 12–13 % d’humidité</li>
        </ul>

        <h3 style="margin-top:1.25rem;">📦 Lots Certifiés issus de ce Terrain</h3>
        ${
          relatedLots.length
            ? relatedLots
                .map(
                  (l) => `<div style="background:var(--surface-alt); padding:.8rem; border-radius:8px; margin-top:.5rem; font-size:.86rem;">
                    <strong>Lot ${escapeHtml(l.lotCode)}</strong> — ${escapeHtml(l.pepperType)}<br>
                    Humidité : <strong>${l.moisturePercent}%</strong> • Volume : <strong>${l.weightKg} kg</strong><br>
                    <a href="/saas?lot=${encodeURIComponent(l.lotCode)}#lots" style="color:var(--forest); font-weight:700;">Vérifier dans le Portail Coopérative →</a>
                  </div>`
                )
                .join('')
            : '<p style="font-size:.86rem; color:var(--muted);">Nouvelle récolte en cours de conditionnement.</p>'
        }
      </aside>
    </div>

    <section class="panel">
      <h2>📸 Aperçu Visuel du Terrain, des Baies et des Documents Officiels</h2>
      <div class="gallery">
        ${profile.gallery
          .map(
            (g) => `<figure>
              <img src="${escapeHtml(g.src)}" alt="${escapeHtml(g.caption)}" loading="lazy">
              <figcaption>${escapeHtml(g.caption)}</figcaption>
            </figure>`
          )
          .join('')}
      </div>
    </section>
  </main>
</body>
</html>`;
}

module.exports = {
  TERRAIN_PROFILES,
  resolveCertifiedProducer,
  renderCertifiedListPage,
  renderPlanterDetailPage
};
