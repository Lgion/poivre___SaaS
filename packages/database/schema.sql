-- Schéma SQL relationnel de l'écosystème Plantation Soppi / Coopérative SCPPE
-- Compatible SQLite & PostgreSQL

CREATE TABLE IF NOT EXISTS campaign (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount_fcfa INTEGER NOT NULL DEFAULT 50000000,
  initial_committed_fcfa INTEGER NOT NULL DEFAULT 14850000,
  cooperative_name TEXT NOT NULL,
  certification_ggn TEXT NOT NULL,
  pilot_location TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  pole TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost_fcfa INTEGER NOT NULL,
  price_status TEXT NOT NULL,
  priority TEXT NOT NULL,
  supplier_note TEXT,
  funded_amount_fcfa INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  packaging_type TEXT NOT NULL,
  hermetic_level TEXT NOT NULL,
  weight_label TEXT NOT NULL,
  price_b2c_fcfa INTEGER NOT NULL,
  price_b2b_fcfa INTEGER NOT NULL,
  b2b_unit_label TEXT NOT NULL,
  stock_units INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  health_or_usage_badge TEXT NOT NULL,
  traceability_lot_code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS producers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  locality TEXT NOT NULL,
  region_pole TEXT NOT NULL,
  hectares REAL NOT NULL,
  variety TEXT NOT NULL,
  planting_year INTEGER NOT NULL,
  global_gap_certified INTEGER NOT NULL DEFAULT 0,
  training_status TEXT NOT NULL,
  standardization_score INTEGER NOT NULL,
  dried_stock_available_kg INTEGER NOT NULL DEFAULT 0,
  phone TEXT NOT NULL,
  checklist_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  site_type TEXT NOT NULL,
  locality TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  capacity_kg INTEGER NOT NULL,
  current_stock_kg INTEGER NOT NULL,
  permanent_staff INTEGER NOT NULL,
  on_demand_staff INTEGER NOT NULL,
  hermetic_seal_compliant INTEGER NOT NULL DEFAULT 1,
  equipments_json TEXT NOT NULL,
  operations_json TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lots (
  id TEXT PRIMARY KEY,
  lot_code TEXT NOT NULL UNIQUE,
  pepper_type TEXT NOT NULL,
  variety TEXT NOT NULL,
  producer_id TEXT NOT NULL,
  producer_name TEXT NOT NULL,
  origin_locality TEXT NOT NULL,
  site_id TEXT NOT NULL,
  harvest_date TEXT NOT NULL,
  weight_kg INTEGER NOT NULL,
  moisture_percent REAL NOT NULL,
  caliber_mm TEXT NOT NULL,
  processing_method TEXT NOT NULL,
  quality_grade TEXT NOT NULL,
  packaging_state TEXT NOT NULL,
  purchase_price_per_kg_fcfa INTEGER NOT NULL,
  certified_ggn TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pledges (
  id TEXT PRIMARY KEY,
  contributor_name TEXT NOT NULL,
  contributor_type TEXT NOT NULL,
  country_city TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  contribution_mode TEXT NOT NULL,
  target_pole TEXT NOT NULL,
  amount_fcfa INTEGER NOT NULL,
  reward_label TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS b2b_contracts (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  country_city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product_summary TEXT NOT NULL,
  frequency TEXT NOT NULL,
  monthly_volume_kg REAL NOT NULL,
  annual_estimated_value_fcfa INTEGER NOT NULL,
  contract_duration_months INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_zone TEXT NOT NULL,
  items_summary TEXT NOT NULL,
  total_fcfa INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

