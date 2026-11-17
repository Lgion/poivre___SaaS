const express = require('express');
const fs = require('fs');
const path = require('path');

// Resolve database: use local bundled ./database if present, otherwise monorepo packages/database
const dbModulePath = fs.existsSync(path.join(__dirname, 'database'))
  ? './database'
  : '../../packages/database';

const {
  getEcosystemSummary,
  addCrowdfundingPledge,
  addEcommerceOrder,
  addB2bContractLoi,
  updateMachineBudget,
  addMachineItem,
  addQualityLot,
  addOrUpdateProducer
} = require(dbModulePath);

// Modules
const { renderHub } = require('./modules/hub');
const { renderCrowdfundingPage } = require('./modules/crowdfunding');
const { renderEcommercePage } = require('./modules/ecommerce');
const { renderSaasPage } = require('./modules/saas');
const { renderCertifiedListPage, renderPlanterDetailPage } = require('./modules/planter-detail');

const app = express();
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3004;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve images: use local bundled public/images if present, otherwise monorepo shared-assets/images
const imagesDir = fs.existsSync(path.join(__dirname, 'public/images'))
  ? path.join(__dirname, 'public/images')
  : path.join(__dirname, '../../shared-assets/images');
app.use('/images', express.static(imagesDir));

const docsDir = path.join(__dirname, 'public/docs');
if (fs.existsSync(docsDir)) {
  app.use('/docs', express.static(docsDir));
}

const generatedDir = path.join(__dirname, 'public/generated');
if (fs.existsSync(generatedDir)) {
  app.use('/generated', express.static(generatedDir));
}

try {
  const leafletDistDir = path.join(path.dirname(require.resolve('leaflet/package.json')), 'dist');
  app.use('/vendor/leaflet', express.static(leafletDistDir));
} catch (_err) {
  // Leaflet optional fallback if missing
}

// ==========================================
// 1. HUB CENTRAL ÉCOSYSTÈME & DOMAINES CERTIFIÉS
// ==========================================
app.get('/', (_req, res) => {
  const summary = getEcosystemSummary();
  res.send(renderHub(summary));
});

app.get('/planteurs', (_req, res) => {
  const summary = getEcosystemSummary();
  res.send(renderCertifiedListPage(summary));
});

app.get('/planteurs/:id', (req, res) => {
  const summary = getEcosystemSummary();
  const pageHtml = renderPlanterDetailPage(summary, req.params.id);
  if (!pageHtml) {
    return res.status(404).send(renderCertifiedListPage(summary));
  }
  return res.send(pageHtml);
});

// ==========================================
// 2. APPLICATION 1 : FINANCEMENT & PRÉCOMMANDES (60M FCFA)
// ==========================================
app.get('/invest', (req, res) => {
  const summary = getEcosystemSummary();
  res.send(renderCrowdfundingPage(req, summary));
});
app.get('/crowdfunding', (_req, res) => res.redirect('/invest'));

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
      message,
      notes
    } = req.body;

    const pledge = addCrowdfundingPledge({
      contributorName,
      contributorType,
      countryCity,
      email,
      phone,
      contributionMode,
      targetPole,
      amountFcfa,
      rewardLabel,
      message: message || notes
    });

    const summary = getEcosystemSummary();
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, pledge, summary });
    }
    return res.redirect('/invest?pledge=success#contribuer');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ==========================================
// 3. APPLICATION 2 : BOUTIQUE B2C & CONTRATS B2B
// ==========================================
app.get('/boutique', (req, res) => {
  const summary = getEcosystemSummary();
  res.send(renderEcommercePage(req, summary));
});
app.get('/ecommerce', (_req, res) => res.redirect('/boutique'));
app.get('/shop', (_req, res) => res.redirect('/boutique'));

app.post('/api/order', (req, res) => {
  try {
    const {
      customerName,
      customerType,
      customerEmail,
      phone,
      customerPhone,
      deliveryZone,
      city,
      deliveryAddress,
      itemsSummary,
      totalFcfa,
      productId,
      quantity,
      customerNote
    } = req.body;

    const order = addEcommerceOrder({
      customerName,
      customerType,
      customerEmail,
      phone: phone || customerPhone,
      deliveryZone: deliveryZone || city || deliveryAddress,
      itemsSummary: itemsSummary || `${quantity || 1} × ${productId || 'Produit Poivre SCPPE'}`,
      totalFcfa: Number(totalFcfa || 15000),
      customerNote
    });

    const summary = getEcosystemSummary();
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, order, summary });
    }
    return res.redirect('/boutique?order=success#catalogue');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/b2b-loi', (req, res) => {
  try {
    const {
      companyName,
      contactName,
      contactPerson,
      email,
      phone,
      businessType,
      sector,
      cityCountry,
      countryCity,
      productSummary,
      productInterest,
      frequency,
      monthlyVolumeKg,
      contractDurationMonths,
      desiredPricePerKgFcfa,
      annualEstimatedValueFcfa,
      packagingPreference,
      deliveryTerms,
      notes
    } = req.body;

    const volKg = Number(monthlyVolumeKg || 25);
    const months = Number(contractDurationMonths || 12);
    const estimatedAnnual =
      annualEstimatedValueFcfa !== undefined
        ? Number(annualEstimatedValueFcfa)
        : volKg * Number(desiredPricePerKgFcfa || 12000) * 12;

    const contract = addB2bContractLoi({
      companyName,
      contactName: contactName || contactPerson,
      email,
      phone,
      businessType: businessType || sector,
      countryCity: countryCity || cityCountry,
      productSummary: productSummary || productInterest,
      frequency,
      monthlyVolumeKg: volKg,
      contractDurationMonths: months,
      annualEstimatedValueFcfa: estimatedAnnual,
      packagingPreference,
      deliveryTerms,
      notes
    });

    const summary = getEcosystemSummary();
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, contract, summary });
    }
    return res.redirect('/boutique?loi=success#contrats-b2b');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ==========================================
// 4. APPLICATION 3 : SAAS COOPÉRATIVE SCPPE
// ==========================================
app.get('/saas', (req, res) => {
  const summary = getEcosystemSummary();
  res.send(renderSaasPage(req, summary));
});
app.get('/cooperative', (_req, res) => res.redirect('/saas'));

app.post('/api/machine/update', (req, res) => {
  try {
    const { id, estimatedCostFcfa, priceStatus, priority, supplierNote } = req.body;
    const updated = updateMachineBudget(id, {
      estimatedCostFcfa,
      priceStatus,
      priority,
      supplierNote
    });
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, machine: updated, summary: getEcosystemSummary() });
    }
    return res.redirect('/saas?updated=machine#machines');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/machine/add', (req, res) => {
  try {
    const { pole, name, category, description, estimatedCostFcfa, priceStatus, priority, supplierNote } = req.body;
    const machine = addMachineItem({
      pole,
      name,
      category,
      description,
      estimatedCostFcfa,
      priceStatus,
      priority,
      supplierNote
    });
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, machine, summary: getEcosystemSummary() });
    }
    return res.redirect('/saas?updated=machine#machines');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/producer/add', (req, res) => {
  try {
    const {
      code,
      fullName,
      phone,
      locality,
      region,
      surfaceHectares,
      certifiedGlobalGap,
      harvestCapacityKg,
      notes
    } = req.body;

    const producer = addOrUpdateProducer({
      code,
      fullName,
      phone,
      locality,
      region,
      surfaceHectares,
      certifiedGlobalGap: certifiedGlobalGap === 'true' || certifiedGlobalGap === true,
      harvestCapacityKg,
      notes
    });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, producer, summary: getEcosystemSummary() });
    }
    return res.redirect('/saas?updated=producer#producteurs');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/lot/add', (req, res) => {
  try {
    const {
      producerCode,
      pepperType,
      weightKg,
      storageSite,
      moisturePercent,
      densityGramsPerLiter,
      dryingConformity,
      purityInspection,
      certifications,
      inspectorNote
    } = req.body;

    const lot = addQualityLot({
      producerCode,
      pepperType,
      weightKg,
      storageSite,
      moisturePercent,
      densityGramsPerLiter,
      dryingConformity: dryingConformity === 'true' || dryingConformity === true,
      purityInspection,
      certifications,
      inspectorNote
    });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ ok: true, lot, summary: getEcosystemSummary() });
    }
    return res.redirect('/saas?updated=lot#lots');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ==========================================
// 5. APIS COMMUNES & EXPORT
// ==========================================
app.get('/api/summary', (_req, res) => {
  res.json(getEcosystemSummary());
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🌿 [Écosystème Unifié 4-en-1 Coopérative SCPPE] en ligne sur http://localhost:${port}`);
    console.log(`   ├─ 🌐 Hub Global : http://localhost:${port}/`);
    console.log(`   ├─ 🚀 Financement & Précommandes (60M) : http://localhost:${port}/invest`);
    console.log(`   ├─ 🛒 Boutique & Contrats B2B : http://localhost:${port}/boutique`);
    console.log(`   └─ 🏭 Portail Coopérative Agricole : http://localhost:${port}/saas`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
      const nextPort = port + 1;
      console.warn(`⚠️ Le port ${port} est déjà utilisé. Bascule automatique sur http://localhost:${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error(`Erreur serveur sur le port ${port}:`, err.message);
    }
  });
}

if (require.main === module) {
  startServer(DEFAULT_PORT);
}

module.exports = app;

