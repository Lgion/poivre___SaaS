const fs = require('fs');
const path = require('path');

const LOCAL_DB_JSON_PATH = path.join(__dirname, 'soppi-db.json');
const TMP_DB_JSON_PATH = path.join('/tmp', 'soppi-db.json');
const DB_JSON_PATH = process.env.VERCEL ? TMP_DB_JSON_PATH : LOCAL_DB_JSON_PATH;
const DB_SQLITE_PATH = path.join(__dirname, 'soppi.sqlite');
const SCHEMA_SQL_PATH = path.join(__dirname, 'schema.sql');

const INITIAL_DATA = {
  campaign: {
    id: 'CAMP-SOPPI-50M',
    title: "Industrialisation Agile du Poivre de Côte d'Ivoire — Phase Pilote & Coopérative",
    targetAmountFcfa: 50000000,
    initialCommittedFcfa: 14850000,
    masterPlanCapexFcfa: 2352000000,
    cooperativeName: "Société Coopérative des Producteurs de Poivre d'Éburnie (SCPPE)",
    presidentName: 'Mme ATSE Chiepo Solange épouse Diabagaté',
    promoterEntity: 'LE GROUP SOPPI CONSULTING / PLANTATION SOPPI (Poivre de la Mé)',
    certificationGgn: 'GLOBALG.A.P. GGN 4063651592948 — Certificat Ecocert 00120-VFXTV-0004',
    pilotLocation: 'Atelier Pilote Central — Garage aménagé de Mme Soppi (Abidjan) + 3 Pôles Régionaux',
    farmersTargetRange: '25 à 40 agriculteurs partenaires (en expansion sous-régionale)',
    updatedAt: '2026-11-11T19:30:00Z'
  },
  machines: [
    {
      id: 'MACH-01',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Moulin / Broyeur Inox Pro (Poivre & Curcuma)',
      category: 'Mouture & Transformation',
      description:
        'Mouture hygiénique en inox pour poivre noir/blanc (lisse, concassé, extra-fin) et curcuma séché pour les formules antioxydantes.',
      estimatedCostFcfa: 4500000,
      priceStatus: 'Estimatif (Devis fournisseur à confirmer)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Capacité petite/moyenne échelle évolutive, zéro échauffement des arômes.',
      fundedAmountFcfa: 3200000
    },
    {
      id: 'MACH-02',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Ensacheuse Automatique de Sticks Hermétiques (Format type Nescafé)',
      category: 'Emballage Hermétique',
      description:
        'Conditionnement à usage unique en film complexe plastique/alu scellé hermétiquement (Sticks Poivre Pur & Sticks Duo Curcuma + Poivre Noir).',
      estimatedCostFcfa: 6800000,
      priceStatus: 'Estimatif (Devis fournisseur à confirmer)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Film barrière anti-humidité tropicale indispensable (pas de papier poreux).',
      fundedAmountFcfa: 4100000
    },
    {
      id: 'MACH-03',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Scelleuse Continue Sachets Zips Double-Hermétiques',
      category: 'Emballage Hermétique',
      description:
        'Scellage thermique renforcé au-dessus du zip pour garantir le double-hermétique sur les formats 100g, 200g Famille, 1kg et 5kg Pro.',
      estimatedCostFcfa: 3200000,
      priceStatus: 'Estimatif (Devis fournisseur à confirmer)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Préserve le taux de 12-13% d’humidité et évite toute reprise d’humidité en rayon.',
      fundedAmountFcfa: 2400000
    },
    {
      id: 'MACH-04',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Doseuse-Remplisseuse & Capsuleuse Bouteilles (Plastique & Verre Luxe)',
      category: 'Emballage Hermétique',
      description:
        'Ligne semi-automatique pour pots PET (125g / 165g / 200g) avec opercule scellé et flacons en verre pour la gamme Prestige & Coffrets Cadeaux.',
      estimatedCostFcfa: 4200000,
      priceStatus: 'Estimatif (Devis fournisseur à confirmer)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Inclut bague d’inviolabilité et étiquetage traçabilité GGN.',
      fundedAmountFcfa: 1850000
    },
    {
      id: 'MACH-05',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Tamis Vibratoire de Calibrage Multi-Étages (Inox)',
      category: 'Calibrage & Tri',
      description:
        'Séparation précise par diamètre des grains entiers destinés à l’export/coffrets et des grains destinés à la mouture.',
      estimatedCostFcfa: 3500000,
      priceStatus: 'Estimatif (Devis fournisseur à confirmer)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: '3 à 4 grilles inox démontables pour variétés Muntok (gros grain) et Lampong.',
      fundedAmountFcfa: 1500000
    },
    {
      id: 'MACH-06',
      pole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      name: 'Aménagement Normé du Garage Pilote & Équipe Opérationnelle',
      category: 'Aménagement & Stockage Sec',
      description:
        'Aménagement de l’atelier dans le garage de Mme Soppi : étanchéité anti-rongeurs (toiture scellée, moustiquaires, portes ajustées), déshumidification, tables inox, employés permanents & renforts à la demande.',
      estimatedCostFcfa: 5800000,
      priceStatus: 'Estimatif (Chiffrage travaux interne)',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Zéro coût foncier au démarrage : optimisation immédiate des locaux existants.',
      fundedAmountFcfa: 1800000
    },
    {
      id: 'MACH-07',
      pole: 'Pôle 2 — Fonds de Roulement (BFR) Collecte Coopérative',
      name: 'Fonds d’Achat Comptant de Poivre Séché Standardisé & Curcuma (25-40 Planteurs)',
      category: 'Collecte & BFR Coopérative',
      description:
        'Trésorerie de roulement pour racheter immédiatement les lots séchés (12-13% humidité) aux partenaires formés de la SCPPE avec prime à la qualité.',
      estimatedCostFcfa: 12000000,
      priceStatus: 'Enveloppe BFR modulable',
      priority: 'Priorité 1 — Démarrage immédiat',
      supplierNote: 'Sécurise les volumes face aux acheteurs bord-champ et fidélise les planteurs.',
      fundedAmountFcfa: 0
    },
    {
      id: 'MACH-08',
      pole: 'Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)',
      name: 'Séchoirs Thermiques (Four) & Aires Solaire sur Grillage Plastique Perforé',
      category: 'Séchage Post-Récolte',
      description:
        'Système hybride (thermique + solaire sous tunnel) permettant de descendre le poivre ébouillanté à 12-13% d’humidité en toute saison.',
      estimatedCostFcfa: 4000000,
      priceStatus: 'Estimatif (Étape 2 — À affiner)',
      priority: 'Étape 2 — Pôles Partenaires & Amont',
      supplierNote: 'Déploiement progressif sur Brofodoumé, Azaguié et Yakassé Mé.',
      fundedAmountFcfa: 0
    },
    {
      id: 'MACH-09',
      pole: 'Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)',
      name: 'Fûts en Aluminium à Vannes (Rouissage 10j Poivre Blanc & Ébouillantage 3 min)',
      category: 'Lavage, Chauffage & Rouissage',
      description:
        'Grands fûts alu avec vannes de vidange tous les 2 jours pour la fermentation (10 jours) du poivre blanc, dépulpeuse à eau et cuves d’ébouillantage du poivre noir.',
      estimatedCostFcfa: 2500000,
      priceStatus: 'Estimatif (Étape 2 — À affiner)',
      priority: 'Étape 2 — Pôles Partenaires & Amont',
      supplierNote: 'Standardise la couleur et l’arôme du poivre blanc Muntok et du poivre noir.',
      fundedAmountFcfa: 0
    },
    {
      id: 'MACH-10',
      pole: 'Pôle 3 — Équipements Amont & Pôles Partenaires (Zone Brouillon / Étape 2)',
      name: 'Égraineuse Anti-Bourrage, Vanneuse-Trieuse & Atomiseurs Phytosanitaires',
      category: 'Traitement au Champ, Égrainage & Vannage',
      description:
        'Parc mutualisé pour les partenaires : atomiseurs pour traitement phytosanitaire des lianes, égraineuse mécanique corrigée sans bourrage, vannage et triage.',
      estimatedCostFcfa: 3500000,
      priceStatus: 'Estimatif (Étape 2 — À affiner)',
      priority: 'Étape 2 — Pôles Partenaires & Amont',
      supplierNote: 'Capitalise sur les 6 ans de tests mécaniques de Mme Soppi.',
      fundedAmountFcfa: 0
    }
  ],
  products: [
    {
      id: 'PROD-01',
      sku: 'SOPPI-STICK-NOIR-50',
      name: 'Boîte Distributrice de 50 Sticks Hermétiques — Poivre Noir Pur de la Mé',
      category: 'Sticks Hermétiques (Usage Unique)',
      packagingType: 'Stick film barrière plastique/alu scellé hermétique (1,5g × 50)',
      hermeticLevel: 'Double Hermétique (Stick scellé + Boîte refermable)',
      weightLabel: '75g net (50 sticks × 1,5g)',
      priceB2cFcfa: 3500,
      priceB2bFcfa: 58000,
      b2bUnitLabel: 'Carton CHR / Maquis de 20 boîtes (1 000 sticks)',
      stockUnits: 145,
      imageUrl: '/images/pots-poivre-noir-moulu.jpg',
      description:
        'Le format révolutionnaire type Nescafé pensé pour la table, les maquis, restaurants, hôtels, stations-service et ménages. Permet de saupoudrer un poivre fraîchement moulu non dénaturé par la cuisson.',
      healthOrUsageBadge: 'Tonique Naturel & Vitalité Masculine (Aphrodisiaque reconnu)',
      traceabilityLotCode: '00120-VFXTV-0004'
    },
    {
      id: 'PROD-02',
      sku: 'SOPPI-STICK-CURCUMA-50',
      name: 'Boîte de 50 Sticks Hermétiques — Duo Antioxydant Curcuma + Poivre Noir',
      category: 'Sticks Hermétiques (Santé & Nutraceutique)',
      packagingType: 'Stick film barrière plastique/alu scellé hermétique (2g × 50)',
      hermeticLevel: 'Double Hermétique (Stick scellé + Sachet protecteur)',
      weightLabel: '100g net (50 sticks × 2g)',
      priceB2cFcfa: 4000,
      priceB2bFcfa: 66000,
      b2bUnitLabel: 'Carton Pharmacie / Supermarché de 20 boîtes',
      stockUnits: 110,
      imageUrl: '/images/pots-poivre-blanc-moulu.jpg',
      description:
        'Synergie scientifiquement prouvée : le principe actif antioxydant du curcuma (curcumine) est activé à 90% grâce à la pipérine de notre poivre noir de la Mé. Idéal en infusion, soupe ou sur le repas quotidien.',
      healthOrUsageBadge: 'Antioxydant Activé à 90% (Synergie Curcuma + Pipérine)',
      traceabilityLotCode: 'SOPPI-2026-C04'
    },
    {
      id: 'PROD-03',
      sku: 'SOPPI-COFFRET-3P',
      name: 'Coffret Cadeau Prestige "Plantation Soppi" — Les 3 Poivres (Noir, Blanc, Rouge)',
      category: 'Coffrets Cadeaux & Luxe',
      packagingType: 'Coffret Ruban Satin avec 3 Pots Scellés (Verre / PET Haute Clarté)',
      hermeticLevel: 'Double Hermétique avec Opercule Fraîcheur',
      weightLabel: '450g net (3 × 150g : Noir, Blanc Muntok, Rouge mature)',
      priceB2cFcfa: 15000,
      priceB2bFcfa: 130000,
      b2bUnitLabel: 'Lot Entreprise / Paniers de Fêtes (10 Coffrets)',
      stockUnits: 68,
      imageUrl: '/images/coffret-3-poivres.jpg',
      description:
        'Le joyau du terroir ivoirien certifié GLOBALG.A.P. Incontournable pour composer les Paniers de Ramadan, Paniers de Pâques, cadeaux diplomatiques et coffrets de fin d’année des entreprises.',
      healthOrUsageBadge: 'Spécial Paniers Ramadan, Pâques & Cadeaux Corporate',
      traceabilityLotCode: '00120-VFXTV-0004'
    },
    {
      id: 'PROD-04',
      sku: 'SOPPI-POT-NOIR-165',
      name: 'Flacon Poivre Noir de la Mé — Moulu Extra-Fin ou Concassé (165g)',
      category: 'Bouteilles & Pots Hermétiques',
      packagingType: 'Bouteille ergonomique à col verseur + opercule hermétique scellé',
      hermeticLevel: 'Double Hermétique (Opercule + Bouchon vissé étanche)',
      weightLabel: '165g net',
      priceB2cFcfa: 3000,
      priceB2bFcfa: 30000,
      b2bUnitLabel: 'Pack Supermarché / Épicerie de 12 flacons',
      stockUnits: 230,
      imageUrl: '/images/pots-poivre-noir-moulu.jpg',
      description:
        'Poivre noir récolté au premier grain jaune, ébouillanté 3 minutes et séché à 12,2% d’humidité. Disponible en mouture lisse, concassée ou extra-fine pour remplacer les poivres importés en grande surface.',
      healthOrUsageBadge: '100% Pur Poivre de la Mé — Zéro additif ni grignon',
      traceabilityLotCode: 'SOPPI-2026-M01'
    },
    {
      id: 'PROD-05',
      sku: 'SOPPI-POT-BLANC-125',
      name: 'Flacon Poivre Blanc Muntok de la Mé — Grain ou Moulu Lisse (125g)',
      category: 'Bouteilles & Pots Hermétiques',
      packagingType: 'Bouteille ergonomique + opercule hermétique scellé',
      hermeticLevel: 'Double Hermétique (Opercule + Bouchon vissé étanche)',
      weightLabel: '125g net',
      priceB2cFcfa: 3500,
      priceB2bFcfa: 36000,
      b2bUnitLabel: 'Pack Supermarché / Restaurant de 12 flacons',
      stockUnits: 175,
      imageUrl: '/images/pots-poivre-blanc-moulu.jpg',
      description:
        'Issu de baies à pleine maturité rouies 10 jours dans une eau pure renouvelée tous les 2 jours, débarrassées de leur péricarpe et séchées avec soin. Notes nobles et délicates pour poissons, volailles et sauces blanches.',
      healthOrUsageBadge: 'Rouissage 10 Jours Eau Pure — Variété Muntok',
      traceabilityLotCode: 'SOPPI-2026-B02'
    },
    {
      id: 'PROD-06',
      sku: 'SOPPI-ZIP-FAMILLE-200',
      name: 'Sachet Zip Scellé Double-Hermétique "Format Famille" (200g — Grain ou Moulu)',
      category: 'Sachets Zips Hermétiques',
      packagingType: 'Pouch Stand-Up Zip + Soudure thermique supérieure inviolable',
      hermeticLevel: 'Double Hermétique Certifié Climat Tropical',
      weightLabel: '200g net',
      priceB2cFcfa: 3200,
      priceB2bFcfa: 54000,
      b2bUnitLabel: 'Carton Revendeur / Marché de 20 sachets',
      stockUnits: 190,
      imageUrl: '/images/pots-grains-blanc-noir.jpg',
      description:
        'Format économique et ultra-protecteur conçu pour les familles et pour recharger les moulins de table sans aucune perte d’arôme ni reprise d’humidité.',
      healthOrUsageBadge: 'Format Recharge Économique & Double Scellé',
      traceabilityLotCode: 'SOPPI-2026-M01'
    },
    {
      id: 'PROD-07',
      sku: 'SOPPI-SAC-PRO-1KG',
      name: 'Sac Professionnel Double-Hermétique (1 kg — Grains Calibrés ou Moulu Pro)',
      category: 'Formats Pro CHR & Export Sous-Régional',
      packagingType: 'Sac Polyéthylène Haute Densité doublé + Soudure hermétique',
      hermeticLevel: 'Double Hermétique Industriel',
      weightLabel: '1 kg net (disponible aussi en 5 kg et 25 kg)',
      priceB2cFcfa: 13500,
      priceB2bFcfa: 120000,
      b2bUnitLabel: 'Ballot B2B / Grossiste Sous-Régional de 10 kg',
      stockUnits: 85,
      imageUrl: '/images/sacs-pro-1kg.jpg',
      description:
        'Conditionnement grand compte pour hôtels, restaurants, charcuteries industrielles, distributeurs CEDEAO (Sénégal, Mali, Burkina, Togo) et acheteurs internationaux exigeant du grain calibré.',
      healthOrUsageBadge: 'Certifié GLOBALG.A.P. — Calibré au Tamis Inox',
      traceabilityLotCode: '00120-VFXTV-0004'
    }
  ],
  producers: [
    {
      id: 'PROD-AGRI-01',
      code: 'SCPPE-001',
      fullName: 'Mme ATSE Chiepo Solange épse Diabagaté',
      roleTitle: 'Présidente Fondatrice SCPPE — Plantation SOPPI',
      locality: 'Brofodoumé - Anyama',
      regionPole: 'Pôle Grands Ponts / Abidjan Nord',
      hectares: 10.0,
      variety: 'Muntok & Lampong (Clones CNRA)',
      plantingYear: 2020,
      globalGapCertified: true,
      trainingStatus: 'Formatrice Référente CNRA / FIRCA',
      standardizationScore: 98,
      driedStockAvailableKg: 420,
      phone: '+225 07 08 25 73 76',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: true,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: true,
        moisture12To13Percent: true
      }
    },
    {
      id: 'PROD-AGRI-02',
      code: 'SCPPE-002',
      fullName: 'Domaine Fiessou (Coopérateur Référent)',
      roleTitle: 'Chef de Pôle Relais — Azaguié',
      locality: 'Azaguié (Agboville)',
      regionPole: 'Pôle Agnéby-Tiassa',
      hectares: 4.5,
      variety: 'Muntok (14g/100gr frais, 5.2g sec)',
      plantingYear: 2020,
      globalGapCertified: true,
      trainingStatus: 'Certifié GlobalG.A.P. & Standardisé',
      standardizationScore: 95,
      driedStockAvailableKg: 215,
      phone: '+225 05 67 23 03 11',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: true,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: true,
        moisture12To13Percent: true
      }
    },
    {
      id: 'PROD-AGRI-03',
      code: 'SCPPE-003',
      fullName: 'Domaine Kobenan (Coopérateur Référent)',
      roleTitle: 'Chef de Pôle Relais — Yakassé Mé',
      locality: 'Yakassé Mé (Région de la Mé)',
      regionPole: 'Pôle La Mé / Adzopé',
      hectares: 5.0,
      variety: 'Lampong & Muntok',
      plantingYear: 2021,
      globalGapCertified: true,
      trainingStatus: 'Certifié GlobalG.A.P. & Standardisé',
      standardizationScore: 94,
      driedStockAvailableKg: 260,
      phone: '+225 07 48 12 90 34',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: true,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: true,
        moisture12To13Percent: true
      }
    },
    {
      id: 'PROD-AGRI-04',
      code: 'SCPPE-004',
      fullName: 'Kouassi N’Guessan Bernard',
      roleTitle: 'Producteur Partenaire (Groupe de 8 planteurs)',
      locality: 'Agboville',
      regionPole: 'Pôle Agnéby-Tiassa',
      hectares: 6.5,
      variety: 'Lampong (Rendement 1,5 t/ha)',
      plantingYear: 2021,
      globalGapCertified: false,
      trainingStatus: 'Formé — Standardisation validée',
      standardizationScore: 88,
      driedStockAvailableKg: 180,
      phone: '+225 01 42 88 19 05',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: true,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: true,
        moisture12To13Percent: false
      }
    },
    {
      id: 'PROD-AGRI-05',
      code: 'SCPPE-005',
      fullName: 'Yapo Brou Marcelline (Groupement Femmes de Dabou)',
      roleTitle: 'Productrice Partenaire (Groupe de 10 planteurs)',
      locality: 'Dabou',
      regionPole: 'Pôle Grands Ponts',
      hectares: 8.0,
      variety: 'Muntok & Curcuma intercalaire',
      plantingYear: 2022,
      globalGapCertified: false,
      trainingStatus: 'En suivi post-récolte (Séchage & Ébouillantage)',
      standardizationScore: 82,
      driedStockAvailableKg: 155,
      phone: '+225 07 59 31 44 20',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: true,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: false,
        moisture12To13Percent: true
      }
    },
    {
      id: 'PROD-AGRI-06',
      code: 'SCPPE-006',
      fullName: 'Aka Tanoh Constant (Collectif Adzopé-Tiassalé)',
      roleTitle: 'Producteur Partenaire (Groupe de 12 planteurs)',
      locality: 'Adzopé / Tiassalé',
      regionPole: 'Pôle La Mé / Agnéby',
      hectares: 9.2,
      variety: 'Lampong',
      plantingYear: 2022,
      globalGapCertified: false,
      trainingStatus: 'Formation CNRA en cours (Calibrage & Séchage)',
      standardizationScore: 76,
      driedStockAvailableKg: 140,
      phone: '+225 05 04 71 62 89',
      checklist: {
        nurseryShade: true,
        livingTutorsGlyricidia: true,
        phytosanitaryCompliant: false,
        secateurHarvestYellowGrain: true,
        blanching3MinOrRetting10Days: true,
        moisture12To13Percent: false
      }
    }
  ],
  sites: [
    {
      id: 'SITE-HUB-ABJ',
      code: 'HUB-ABJ-GARAGE',
      name: 'Atelier Pilote Central & Entrepôt Sec (Garage aménagé Mme Soppi)',
      siteType: 'Hub Central — Calibrage, Mouture, Emballage Hermétique & Stockage Finis',
      locality: 'Abidjan (District d’Abidjan)',
      managerName: 'Mme ATSE Chiepo Solange & Équipe Centrale',
      capacityKg: 3500,
      currentStockKg: 980,
      permanentStaff: 4,
      onDemandStaff: 6,
      hermeticSealCompliant: true,
      equipments: [
        'Moulin Inox Poivre & Curcuma (Priorité 1)',
        'Ensacheuse Sticks Hermétiques (Priorité 1)',
        'Scelleuse Zips Double-Hermétiques (Priorité 1)',
        'Remplisseuse Pots Plastique & Verre (Priorité 1)',
        'Tamis Calibreur Multi-Étages (Priorité 1)',
        'Humidimètre de contrôle lots (12-13%)'
      ],
      operations: [
        'Réception et test d’humidité (< 13%) des lots séchés',
        'Calibrage par taille de grain (Export vs Mouture)',
        'Mouture lisse, concassée, extra-fine & mélange Curcuma',
        'Mise en sticks, sachets zips scellés, pots et coffrets',
        'Stockage en salle sèche scellée anti-rongeurs (norme CNRA)'
      ],
      status: 'Opérationnel — En cours de mécanisation (Cible 50M FCFA)'
    },
    {
      id: 'SITE-POLE-BRO',
      code: 'POLE-BROFODOUME',
      name: 'Pôle Amont & Traitement — Plantation SOPPI (Brofodoumé)',
      siteType: 'Centre de Production, Ébouillantage, Rouissage & Séchage',
      locality: 'Brofodoumé - Anyama (10 ha plantés sur 16,64 ha)',
      managerName: 'Chef de Culture Brofodoumé (SCPPE)',
      capacityKg: 4000,
      currentStockKg: 420,
      permanentStaff: 5,
      onDemandStaff: 12,
      hermeticSealCompliant: true,
      equipments: [
        'Ombrière pépinière 2,5m (2 800 plants/ha)',
        'Fûts en aluminium pour lavage & ébouillantage 3 min',
        'Fûts à vannes pour rouissage 10 jours du poivre blanc',
        'Claies de séchage en grillage plastique perforé',
        'Atomiseurs phytosanitaires'
      ],
      operations: [
        'Multiplication de boutures à 2-3 nœuds (Muntok & Lampong)',
        'Égrainage post-récolte et lavage à l’eau propre',
        'Ébouillantage 3 min (poivre noir) et trempage 10j (poivre blanc)',
        'Séchage jusqu’à 12-13% d’humidité et vannage'
      ],
      status: 'Certifié GLOBALG.A.P. (GGN 4063651592948)'
    },
    {
      id: 'SITE-POLE-AZA',
      code: 'POLE-AZAGUIE',
      name: 'Pôle Partenaire Relais — Domaine Fiessou (Azaguié)',
      siteType: 'Point Relais Collecte, Séchage Standardisé & Formation',
      locality: 'Azaguié / Agboville',
      managerName: 'Responsable Pôle Azaguié',
      capacityKg: 2000,
      currentStockKg: 395,
      permanentStaff: 2,
      onDemandStaff: 5,
      hermeticSealCompliant: true,
      equipments: [
        'Aire de séchage sur grillage plastique perforé',
        'Cuves de lavage et ébouillantage',
        'Atomiseurs mutualisés pour les planteurs du secteur',
        'Sacs de transfert double-hermétiques vers Abidjan'
      ],
      operations: [
        'Collecte groupée des planteurs d’Azaguié et Agboville',
        'Contrôle du séchage (grain qui crisse sous la main à 12-13%)',
        'Vannage et triage des résidus avant expédition au Garage Central'
      ],
      status: 'Certifié GLOBALG.A.P. — Besoin séchoir thermique Étape 2'
    },
    {
      id: 'SITE-POLE-YAK',
      code: 'POLE-YAKASSE-ME',
      name: 'Pôle Partenaire Relais — Domaine Kobenan (Yakassé Mé)',
      siteType: 'Point Relais Spécialisé Poivre Blanc & Noir de la Mé',
      locality: 'Yakassé Mé / Adzopé',
      managerName: 'Responsable Pôle La Mé',
      capacityKg: 2500,
      currentStockKg: 400,
      permanentStaff: 2,
      onDemandStaff: 6,
      hermeticSealCompliant: true,
      equipments: [
        'Bacs de trempage poivre blanc (renouvellement eau 48h)',
        'Aires de séchage solaire',
        'Magasin de stockage tampon aéré et sec'
      ],
      operations: [
        'Préparation du poivre blanc Muntok et du poivre noir',
        'Encadrement des nouveaux planteurs partenaires de la Mé',
        'Pré-stockage sec avant transfert vers Abidjan'
      ],
      status: 'Certifié GLOBALG.A.P. — Expansion partenaires active'
    }
  ],
  lots: [
    {
      id: 'LOT-01',
      lotCode: '00120-VFXTV-0004',
      pepperType: 'Poivre Noir & Blanc en Grains / Coffret Prestige',
      variety: 'Muntok & Lampong (Clones CNRA)',
      producerId: 'PROD-AGRI-01',
      producerName: 'Plantation SOPPI (Brofodoumé - Anyama)',
      originLocality: 'Brofodoumé (District d’Abidjan / La Mé)',
      siteId: 'SITE-HUB-ABJ',
      harvestDate: '2026-08-18',
      weightKg: 420,
      moisturePercent: 12.2,
      caliberMm: '4,8 mm (Calibré Supérieur Export)',
      processingMethod: 'Récolte au 1er grain jaune au sécateur, égrainage, lavage double, ébouillantage 3 min, séchage 5 jours sur grillage plastique perforé.',
      qualityGrade: 'Grade A+ Certifié GLOBALG.A.P.',
      packagingState: 'Conditionné Double-Hermétique (Coffrets, Pots & Sticks)',
      purchasePricePerKgFcfa: 4500,
      certifiedGgn: 'GGN 4063651592948 / Certificat Ecocert 00120-VFXTV-0004'
    },
    {
      id: 'LOT-02',
      lotCode: 'SOPPI-2026-M01',
      pepperType: 'Poivre Noir de la Mé (Grain & Moulu Extra-Fin)',
      variety: 'Lampong',
      producerId: 'PROD-AGRI-02',
      producerName: 'Domaine Fiessou (Azaguié)',
      originLocality: 'Azaguié (Agnéby-Tiassa)',
      siteId: 'SITE-HUB-ABJ',
      harvestDate: '2026-09-05',
      weightKg: 215,
      moisturePercent: 12.5,
      caliberMm: '4,5 mm (Standardisé Soppi)',
      processingMethod: 'Ébouillantage 3 min en fût aluminium, séchage solaire contrôlé à 12,5% d’humidité, vannage et triage.',
      qualityGrade: 'Grade A+ Certifié GLOBALG.A.P.',
      packagingState: 'En stock sec au Garage Central (Prêt pour Mouture & Zips)',
      purchasePricePerKgFcfa: 4500,
      certifiedGgn: 'GGN 4063651592948'
    },
    {
      id: 'LOT-03',
      lotCode: 'SOPPI-2026-B02',
      pepperType: 'Poivre Blanc Muntok (Grain & Moulu Lisse)',
      variety: 'Muntok (Poids 100 grains secs : 5,2g)',
      producerId: 'PROD-AGRI-03',
      producerName: 'Domaine Kobenan (Yakassé Mé)',
      originLocality: 'Yakassé Mé (Région de la Mé)',
      siteId: 'SITE-HUB-ABJ',
      harvestDate: '2026-09-22',
      weightKg: 185,
      moisturePercent: 12.1,
      caliberMm: '5,0 mm (Cœur de grain blanc sans péricarpe)',
      processingMethod: 'Récolte à maturité (jaune-rouge), rouissage 10 jours en fût à vanne avec changement d’eau tous les 2 jours, dépulpation à grande eau et séchage 5 jours.',
      qualityGrade: 'Grade A+ Prestige Blanc',
      packagingState: 'Conditionné Double-Hermétique (Pots 125g & Coffrets)',
      purchasePricePerKgFcfa: 5500,
      certifiedGgn: 'GGN 4063651592948'
    },
    {
      id: 'LOT-04',
      lotCode: 'SOPPI-2026-C04',
      pepperType: 'Duo Poivre Noir de la Mé + Curcuma Séché (Mouture Sticks)',
      variety: 'Muntok + Curcuma Ivoirien sélectionné',
      producerId: 'PROD-AGRI-05',
      producerName: 'Groupement Femmes de Dabou & Plantation Soppi',
      originLocality: 'Dabou & Brofodoumé',
      siteId: 'SITE-HUB-ABJ',
      harvestDate: '2026-10-10',
      weightKg: 160,
      moisturePercent: 11.9,
      caliberMm: 'Mouture fine homogène (Dosage Pipérine + Curcumine)',
      processingMethod: 'Séchage contrôlé < 12%, mouture combinée inox et mise en sticks hermétiques anti-humidité.',
      qualityGrade: 'Grade A Nutraceutique / Santé',
      packagingState: 'Conditionné en Sticks Hermétiques 2g',
      purchasePricePerKgFcfa: 4200,
      certifiedGgn: 'Protocole Qualité Soppi / CNRA'
    }
  ],
  pledges: [
    {
      id: 'PLEDGE-01',
      contributorName: 'Dr. Kouamé Jean-Marc (Diaspora France)',
      contributorType: 'Investisseur Diaspora',
      countryCity: 'Paris, France',
      email: 'jm.kouame@diaspora-invest.fr',
      phone: '+33 6 18 45 92 10',
      contributionMode: 'Investissement Productif (Co-financement Machine)',
      targetPole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      amountFcfa: 2500000,
      rewardLabel: 'Partenaire Industriel Pilote + Convention de partage + 10 Coffrets Prestige',
      message: 'Fier de soutenir la transformation locale d’un poivre ivoirien déjà certifié GlobalG.A.P. !',
      createdAt: '2026-11-02T14:20:00Z'
    },
    {
      id: 'PLEDGE-02',
      contributorName: 'Résidence Hôtelière Les Palétuviers',
      contributorType: 'Partenaire B2B / Hôtellerie',
      countryCity: 'Abidjan - Cocody',
      email: 'achats@paletuviers-ci.com',
      phone: '+225 07 09 44 12 00',
      contributionMode: 'Préachat Professionnel de Stock (B2B)',
      targetPole: 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
      amountFcfa: 850000,
      rewardLabel: 'Précommande annuelle de 15 cartons de Sticks Hermétiques + 30 Coffrets Clients VIP',
      message: 'Nous voulons les sticks Poivre de la Mé sur toutes nos tables dès le lancement.',
      createdAt: '2026-11-06T10:15:00Z'
    },
    {
      id: 'PLEDGE-03',
      contributorName: 'Mme Bamba Aminata',
      contributorType: 'Soutien Particulier / Précommande',
      countryCity: 'Abidjan - Riviera Palmeraie',
      email: 'aminata.bamba@gmail.com',
      phone: '+225 05 84 11 22 33',
      contributionMode: 'Précommande Solidaire (Coffrets & Sticks)',
      targetPole: 'Pôle 2 — Fonds de Roulement (BFR) Collecte Coopérative',
      amountFcfa: 150000,
      rewardLabel: 'Pack 10 Coffrets Prestige 3 Poivres (Spécial Paniers Ramadan & Fêtes)',
      message: 'Les coffrets sont magnifiques pour offrir pendant le Ramadan, bravo à Mme Soppi.',
      createdAt: '2026-11-09T17:40:00Z'
    }
  ],
  b2bContracts: [
    {
      id: 'LOI-01',
      referenceCode: 'LOI-SOPPI-2026-001',
      companyName: 'Groupe Supermarchés Éburnie Distribution',
      businessType: 'Grande Distribution / Supermarchés (Abidjan)',
      contactName: 'M. Konan Stéphane (Directeur Achats Épicerie)',
      countryCity: 'Abidjan - Zone 4 & Cocody',
      phone: '+225 07 07 81 23 45',
      email: 's.konan@eburnie-distrib.ci',
      productSummary: 'Pots 165g Noir Moulu, Pots 125g Blanc Muntok & Boîtes 50 Sticks Curcuma-Poivre',
      frequency: 'Livraison Mensuelle Garantie',
      monthlyVolumeKg: 85,
      annualEstimatedValueFcfa: 14280000,
      contractDurationMonths: 12,
      status: 'LOI Signée — Contrat Ferme Actif',
      createdAt: '2026-10-28T09:30:00Z'
    },
    {
      id: 'LOI-02',
      referenceCode: 'LOI-SOPPI-2026-002',
      companyName: 'Comptoir des Épices du Sahel (Importateur CEDEAO)',
      businessType: 'Grossiste Sous-Régional (Sénégal & Mali)',
      contactName: 'El Hadj Ibrahima Ndiaye',
      countryCity: 'Dakar, Sénégal / Bamako, Mali',
      phone: '+221 77 412 89 00',
      email: 'direction@epices-sahel.sn',
      productSummary: 'Sacs Pro 1kg & 25kg Grains Calibrés Certifiés GlobalG.A.P. + Sachets Zips 200g',
      frequency: 'Trimestrielle (Contrat Sous-Régional)',
      monthlyVolumeKg: 120,
      annualEstimatedValueFcfa: 17280000,
      contractDurationMonths: 24,
      status: 'LOI Signée — En attente premier lot calibré',
      createdAt: '2026-11-04T15:10:00Z'
    },
    {
      id: 'LOI-03',
      referenceCode: 'LOI-SOPPI-2026-003',
      companyName: 'Réseau des Maquis & Grillades Premium d’Abidjan (RMGPA)',
      businessType: 'Groupement CHR / Maquis & Restaurants (18 établissements)',
      contactName: 'M. Digbeu Franck',
      countryCity: 'Abidjan (Marcory, Yopougon, Angré)',
      phone: '+225 01 02 99 44 11',
      email: 'contact@rmgpa-ci.org',
      productSummary: 'Cartons de Sticks Hermétiques Usage Unique (Poivre Pur & Duo Curcuma) + Concassé 1kg',
      frequency: 'Mensuelle',
      monthlyVolumeKg: 45,
      annualEstimatedValueFcfa: 8640000,
      contractDurationMonths: 12,
      status: 'Contrat Cadre Validé',
      createdAt: '2026-11-08T11:45:00Z'
    }
  ],
  orders: [
    {
      id: 'ORD-01',
      orderCode: 'CMD-2026-104',
      customerName: 'Cabinet Conseil Ivoire Finance (Cadeaux Fin d’Année)',
      customerType: 'B2B Corporate',
      phone: '+225 07 88 12 34 56',
      deliveryZone: 'Abidjan - Plateau',
      itemsSummary: '15 × Coffret Prestige 3 Poivres + 5 × Boîte 50 Sticks Curcuma-Poivre',
      totalFcfa: 245000,
      status: 'Livrée & Payée',
      createdAt: '2026-11-09T16:00:00Z'
    },
    {
      id: 'ORD-02',
      orderCode: 'CMD-2026-105',
      customerName: 'M. Touré Cheick',
      customerType: 'B2C Particulier',
      phone: '+225 07 49 00 11 22',
      deliveryZone: 'Abidjan - Deux Plateaux',
      itemsSummary: '2 × Boîte 50 Sticks Poivre Pur (Vitalité) + 2 × Sachet Zip Famille 200g',
      totalFcfa: 13400,
      status: 'En préparation (Garage Central)',
      createdAt: '2026-11-11T09:15:00Z'
    }
  ]
};

function ensureDbInitialized() {
  if (!fs.existsSync(DB_JSON_PATH)) {
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDbInitialized();
  const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeDb(data) {
  data.campaign.updatedAt = new Date().toISOString();
  const tmpPath = `${DB_JSON_PATH}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_JSON_PATH);
  return data;
}

function getEcosystemSummary() {
  const db = readDb();
  const totalEstimatedMachinesFcfa = db.machines.reduce((sum, m) => sum + Number(m.estimatedCostFcfa || 0), 0);
  const pledgesTotalFcfa = db.pledges.reduce((sum, p) => sum + Number(p.amountFcfa || 0), 0);
  const raisedTotalFcfa = Number(db.campaign.initialCommittedFcfa || 0) + pledgesTotalFcfa;
  const progressPercent = Math.min(100, Math.round((raisedTotalFcfa / (db.campaign.targetAmountFcfa || 50000000)) * 1000) / 10);

  const totalDriedStockKg = db.producers.reduce((sum, p) => sum + Number(p.driedStockAvailableKg || 0), 0);
  const totalHectares = Math.round(db.producers.reduce((sum, p) => sum + Number(p.hectares || 0), 0) * 10) / 10;
  const avgStandardizationScore = Math.round(
    db.producers.reduce((sum, p) => sum + Number(p.standardizationScore || 0), 0) / Math.max(1, db.producers.length)
  );
  const totalB2bAnnualCommitmentsFcfa = db.b2bContracts.reduce(
    (sum, c) => sum + Number(c.annualEstimatedValueFcfa || 0),
    0
  );

  return {
    ...db,
    metrics: {
      totalEstimatedMachinesFcfa,
      pledgesTotalFcfa,
      raisedTotalFcfa,
      progressPercent,
      totalDriedStockKg,
      totalHectares,
      avgStandardizationScore,
      totalB2bAnnualCommitmentsFcfa,
      activeFarmersCount: 32,
      targetFarmersRange: '25 - 40'
    }
  };
}

function updateMachineBudget(machineId, updates) {
  const db = readDb();
  const idx = db.machines.findIndex((m) => m.id === machineId);
  if (idx === -1) throw new Error(`Machine introuvable: ${machineId}`);
  db.machines[idx] = {
    ...db.machines[idx],
    ...updates,
    estimatedCostFcfa:
      updates.estimatedCostFcfa !== undefined
        ? Number(updates.estimatedCostFcfa)
        : db.machines[idx].estimatedCostFcfa,
    fundedAmountFcfa:
      updates.fundedAmountFcfa !== undefined
        ? Number(updates.fundedAmountFcfa)
        : db.machines[idx].fundedAmountFcfa
  };
  writeDb(db);
  return db.machines[idx];
}

function addMachineItem(newMachine) {
  const db = readDb();
  const id = `MACH-${String(db.machines.length + 1).padStart(2, '0')}`;
  const item = {
    id,
    pole: newMachine.pole || 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
    name: newMachine.name,
    category: newMachine.category || 'Équipement',
    description: newMachine.description || '',
    estimatedCostFcfa: Number(newMachine.estimatedCostFcfa || 0),
    priceStatus: newMachine.priceStatus || 'Estimatif (Devis à confirmer)',
    priority: newMachine.priority || 'Priorité 1 — Démarrage immédiat',
    supplierNote: newMachine.supplierNote || '',
    fundedAmountFcfa: Number(newMachine.fundedAmountFcfa || 0)
  };
  db.machines.push(item);
  writeDb(db);
  return item;
}

function updateCampaignSettings(updates) {
  const db = readDb();
  db.campaign = {
    ...db.campaign,
    ...updates,
    targetAmountFcfa:
      updates.targetAmountFcfa !== undefined
        ? Number(updates.targetAmountFcfa)
        : db.campaign.targetAmountFcfa,
    initialCommittedFcfa:
      updates.initialCommittedFcfa !== undefined
        ? Number(updates.initialCommittedFcfa)
        : db.campaign.initialCommittedFcfa
  };
  writeDb(db);
  return db.campaign;
}

function addCrowdfundingPledge(pledgeInput) {
  const db = readDb();
  const item = {
    id: `PLEDGE-${Date.now()}`,
    contributorName: pledgeInput.contributorName,
    contributorType: pledgeInput.contributorType || 'Soutien / Contributeur',
    countryCity: pledgeInput.countryCity || 'Abidjan, Côte d’Ivoire',
    email: pledgeInput.email || '',
    phone: pledgeInput.phone || '',
    contributionMode: pledgeInput.contributionMode || 'Précommande Solidaire (Coffrets & Sticks)',
    targetPole:
      pledgeInput.targetPole || 'Pôle 1 — Priorité Conditionnement, Mouture & Calibrage (Atelier Garage)',
    amountFcfa: Number(pledgeInput.amountFcfa || 0),
    rewardLabel: pledgeInput.rewardLabel || 'Contrepartie Poivre de la Mé',
    message: pledgeInput.message || '',
    createdAt: new Date().toISOString()
  };
  db.pledges.unshift(item);
  writeDb(db);
  return item;
}

function addEcommerceOrder(orderInput) {
  const db = readDb();
  const item = {
    id: `ORD-${Date.now()}`,
    orderCode: `CMD-2026-${106 + db.orders.length}`,
    customerName: orderInput.customerName,
    customerType: orderInput.customerType || 'B2C Particulier',
    phone: orderInput.phone || '',
    deliveryZone: orderInput.deliveryZone || 'Abidjan',
    itemsSummary: orderInput.itemsSummary,
    totalFcfa: Number(orderInput.totalFcfa || 0),
    status: 'Nouvelle commande — En préparation au Garage Central',
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(item);
  writeDb(db);
  return item;
}

function addB2bContractLoi(contractInput) {
  const db = readDb();
  const item = {
    id: `LOI-${Date.now()}`,
    referenceCode: `LOI-SOPPI-2026-${String(db.b2bContracts.length + 1).padStart(3, '0')}`,
    companyName: contractInput.companyName,
    businessType: contractInput.businessType || 'Partenaire Commercial B2B',
    contactName: contractInput.contactName,
    countryCity: contractInput.countryCity || 'Abidjan, Côte d’Ivoire',
    phone: contractInput.phone || '',
    email: contractInput.email || '',
    productSummary: contractInput.productSummary || 'Gamme Sticks Hermétiques & Pots Poivre de la Mé',
    frequency: contractInput.frequency || 'Mensuelle',
    monthlyVolumeKg: Number(contractInput.monthlyVolumeKg || 25),
    annualEstimatedValueFcfa: Number(contractInput.annualEstimatedValueFcfa || 3600000),
    contractDurationMonths: Number(contractInput.contractDurationMonths || 12),
    status: 'LOI Générée — En validation commerciale',
    createdAt: new Date().toISOString()
  };
  db.b2bContracts.unshift(item);
  writeDb(db);
  return item;
}

function addQualityLot(lotInput) {
  const db = readDb();
  const moisture = Number(lotInput.moisturePercent || 12.4);
  const isMoistureStandard = moisture >= 11.0 && moisture <= 13.0;
  const item = {
    id: `LOT-${Date.now()}`,
    lotCode: lotInput.lotCode || `SOPPI-2026-L0${db.lots.length + 1}`,
    pepperType: lotInput.pepperType || 'Poivre Noir de la Mé (Séché Standardisé)',
    variety: lotInput.variety || 'Muntok',
    producerId: lotInput.producerId || 'PROD-AGRI-01',
    producerName: lotInput.producerName || 'Membre Coopérative SCPPE',
    originLocality: lotInput.originLocality || 'Brofodoumé',
    siteId: lotInput.siteId || 'SITE-HUB-ABJ',
    harvestDate: lotInput.harvestDate || new Date().toISOString().slice(0, 10),
    weightKg: Number(lotInput.weightKg || 100),
    moisturePercent: moisture,
    caliberMm: lotInput.caliberMm || '4,6 mm (Tamis Multi-Étages)',
    processingMethod:
      lotInput.processingMethod ||
      'Égrainage, lavage eau propre, ébouillantage 3 min, séchage sur grillage plastique perforé.',
    qualityGrade: isMoistureStandard
      ? 'Grade A+ Standardisé Soppi (Humidité conforme 12-13%)'
      : 'En reprise de séchage (Humidité > 13%)',
    packagingState: lotInput.packagingState || 'Stocké en sac double-hermétique au Garage Central',
    purchasePricePerKgFcfa: Number(lotInput.purchasePricePerKgFcfa || (isMoistureStandard ? 4500 : 3800)),
    certifiedGgn: 'Protocole CNRA / SCPPE — GGN 4063651592948'
  };
  db.lots.unshift(item);
  writeDb(db);
  return item;
}

function addOrUpdateProducer(producerInput) {
  const db = readDb();
  if (producerInput.id) {
    const idx = db.producers.findIndex((p) => p.id === producerInput.id);
    if (idx !== -1) {
      const updatedChecklist = {
        ...db.producers[idx].checklist,
        ...(producerInput.checklist || {})
      };
      const checksCount = Object.values(updatedChecklist).filter(Boolean).length;
      const computedScore = Math.round((checksCount / 6) * 100);
      db.producers[idx] = {
        ...db.producers[idx],
        ...producerInput,
        checklist: updatedChecklist,
        standardizationScore: producerInput.standardizationScore ?? computedScore
      };
      writeDb(db);
      return db.producers[idx];
    }
  }

  const checklist = producerInput.checklist || {
    nurseryShade: true,
    livingTutorsGlyricidia: true,
    phytosanitaryCompliant: true,
    secateurHarvestYellowGrain: true,
    blanching3MinOrRetting10Days: true,
    moisture12To13Percent: true
  };
  const checksCount = Object.values(checklist).filter(Boolean).length;
  const newProd = {
    id: `PROD-AGRI-${Date.now()}`,
    code: `SCPPE-00${db.producers.length + 1}`,
    fullName: producerInput.fullName,
    roleTitle: producerInput.roleTitle || 'Producteur Partenaire en Formation',
    locality: producerInput.locality || 'Agboville',
    regionPole: producerInput.regionPole || 'Pôle Agnéby-Tiassa',
    hectares: Number(producerInput.hectares || 2.0),
    variety: producerInput.variety || 'Muntok & Lampong (Clones CNRA)',
    plantingYear: Number(producerInput.plantingYear || 2024),
    globalGapCertified: Boolean(producerInput.globalGapCertified),
    trainingStatus: producerInput.trainingStatus || 'En formation itinéraire technique CNRA',
    standardizationScore: Math.round((checksCount / 6) * 100),
    driedStockAvailableKg: Number(producerInput.driedStockAvailableKg || 0),
    phone: producerInput.phone || '+225 07 00 00 00 00',
    checklist
  };
  db.producers.push(newProd);
  writeDb(db);
  return newProd;
}

module.exports = {
  DB_JSON_PATH,
  DB_SQLITE_PATH,
  SCHEMA_SQL_PATH,
  INITIAL_DATA,
  getEcosystemSummary,
  updateMachineBudget,
  addMachineItem,
  updateCampaignSettings,
  addCrowdfundingPledge,
  addEcommerceOrder,
  addB2bContractLoi,
  addQualityLot,
  addOrUpdateProducer
};

