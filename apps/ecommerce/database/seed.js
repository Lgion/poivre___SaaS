const fs = require('fs');
const { DB_JSON_PATH, DB_SQLITE_PATH, SCHEMA_SQL_PATH, INITIAL_DATA, getEcosystemSummary } = require('./index.js');

// 1. Écriture de la base JSON partagée
if (!fs.existsSync(DB_JSON_PATH)) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
}

const summary = getEcosystemSummary();

// 2. Synchronisation SQLite si node:sqlite est actif
try {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(DB_SQLITE_PATH);
  const schema = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  db.exec(schema);
  console.log('✅ Base SQLite synchronisée avec succès :', DB_SQLITE_PATH);
} catch {
  console.log('ℹ️ Base de données partagée initialisée :', DB_JSON_PATH);
}

console.log('📊 Résumé Écosystème Soppi :');
console.log(`   - Objectif Financement Participatif : ${summary.campaign.targetAmountFcfa.toLocaleString('fr-FR')} FCFA`);
console.log(`   - Total Estimatif Machines / Pôles  : ${summary.metrics.totalEstimatedMachinesFcfa.toLocaleString('fr-FR')} FCFA`);
console.log(`   - Déjà engagé / précommandé         : ${summary.metrics.raisedTotalFcfa.toLocaleString('fr-FR')} FCFA (${summary.metrics.progressPercent}%)`);
console.log(`   - Contrats B2B / LOI signés         : ${summary.metrics.totalB2bAnnualCommitmentsFcfa.toLocaleString('fr-FR')} FCFA / an`);

