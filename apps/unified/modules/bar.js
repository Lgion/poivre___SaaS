function renderUnifiedBar(activeTab = 'hub') {
  return `
  <style>
    .soppi-unified-bar-wrapper {
      position: sticky;
      top: 0;
      z-index: 99999;
      background: #0d2316;
      border-bottom: 1.5px solid rgba(200, 138, 43, 0.45);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }
    .soppi-unified-bar {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.55rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .soppi-unified-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: #ffffff;
    }
    .soppi-unified-logo-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #c88a2b, #8c5b16);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
      color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .soppi-unified-brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .soppi-unified-brand-title {
      font-weight: 700;
      font-size: 0.92rem;
      letter-spacing: -0.01em;
      color: #f7f3ec;
    }
    .soppi-unified-brand-sub {
      font-size: 0.72rem;
      color: #c9b18f;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .soppi-unified-nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      overflow-x: auto;
      padding-block: 0.15rem;
      scrollbar-width: none;
    }
    .soppi-unified-nav::-webkit-scrollbar {
      display: none;
    }
    .soppi-nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.42rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      color: #e5ded3;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .soppi-nav-btn:hover {
      background: rgba(200, 138, 43, 0.22);
      border-color: rgba(200, 138, 43, 0.5);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .soppi-nav-btn.active {
      background: linear-gradient(135deg, #c88a2b, #b3771e);
      color: #ffffff;
      border-color: #f1c57e;
      box-shadow: 0 2px 8px rgba(200, 138, 43, 0.4);
    }
    .soppi-nav-btn .pill-badge {
      display: inline-block;
      font-size: 0.68rem;
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.25);
      color: #fff;
    }
    @media (max-width: 860px) {
      .soppi-unified-bar {
        padding: 0.45rem 0.6rem;
        gap: 0.5rem;
      }
      .soppi-unified-brand-title {
        font-size: 0.85rem;
      }
      .soppi-nav-btn {
        padding: 0.35rem 0.6rem;
        font-size: 0.75rem;
      }
    }
  </style>
  <aside class="soppi-unified-bar-wrapper" aria-label="Sélecteur d'application de l'écosystème Poivre Soppi">
    <div class="soppi-unified-bar">
      <a href="/" class="soppi-unified-brand" title="Retour au Hub Global">
        <span class="soppi-unified-logo-icon">🌿</span>
        <div class="soppi-unified-brand-text">
          <span class="soppi-unified-brand-title">Le Comptoir du Poivre de Côte d'Ivoire</span>
          <span class="soppi-unified-brand-sub">SCPPE • Mme Soppi • Écosystème Unifié</span>
        </div>
      </a>
      <nav class="soppi-unified-nav" aria-label="Navigation principale">
        <a href="/" class="soppi-nav-btn ${activeTab === 'hub' ? 'active' : ''}">
          <span>🌐</span> Hub Écosystème
        </a>
        <a href="/invest" class="soppi-nav-btn ${activeTab === 'crowdfunding' ? 'active' : ''}">
          <span>🚀</span> 1. Financement (50M)
          <span class="pill-badge">Pilote</span>
        </a>
        <a href="/boutique" class="soppi-nav-btn ${activeTab === 'ecommerce' ? 'active' : ''}">
          <span>🛒</span> 2. Boutique & B2B
          <span class="pill-badge">Ventes</span>
        </a>
        <a href="/saas" class="soppi-nav-btn ${activeTab === 'saas' ? 'active' : ''}">
          <span>🏭</span> 3. Portail SaaS
          <span class="pill-badge">Coopérative</span>
        </a>
      </nav>
    </div>
  </aside>
  `;
}

module.exports = { renderUnifiedBar };

