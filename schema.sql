-- DOM.ITA Database Schema
-- PostgreSQL 18 on ermes:54329

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Navigation Log (ore di navigazione)
CREATE TABLE IF NOT EXISTS navigation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    engine_hours_start DECIMAL(8,2),
    engine_hours_end DECIMAL(8,2),
    hours_total DECIMAL(6,2),
    route TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insurances (assicurazioni)
CREATE TABLE IF NOT EXISTS insurances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    policy_number TEXT,
    start_date DATE,
    expiry_date DATE NOT NULL,
    premium DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fuel Logs (rifornimenti carburante)
CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    engine_hours_at_fill DECIMAL(8,2),
    consumption_l_per_h DECIMAL(6,2),
    station TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extra Expenses (spese extra)
CREATE TABLE IF NOT EXISTS extra_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Manutenzione', 'Ricambi', 'Attrezzatura', 'Manodopera', 'Altro')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mooring Payments (ormeggio & pontile)
CREATE TABLE IF NOT EXISTS mooring_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    port TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Refit Budget (budget refit 2026)
CREATE TABLE IF NOT EXISTS refit_budget (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    budget_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    priority TEXT CHECK (priority IN ('MUST', 'NICE', 'OPZ')),
    contingency DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Refit Payments (pagamenti a fornitori)
CREATE TABLE IF NOT EXISTS refit_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    category TEXT,
    status TEXT DEFAULT 'ToDo' CHECK (status IN ('ToDo', 'InCorso', 'Sospeso', 'Fatto')),
    responsible TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Parts List (distinta ricambi)
CREATE TABLE IF NOT EXISTS parts_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    supplier TEXT,
    category TEXT,
    status TEXT DEFAULT 'ToDo' CHECK (status IN ('ToDo', 'InCorso', 'Sospeso', 'Fatto')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Users (per auth futuro)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_navigation_date ON navigation_log(date);
CREATE INDEX idx_insurances_expiry ON insurances(expiry_date);
CREATE INDEX idx_fuel_date ON fuel_logs(date);
CREATE INDEX idx_expenses_date ON extra_expenses(date);
CREATE INDEX idx_expenses_category ON extra_expenses(category);
CREATE INDEX idx_mooring_due ON mooring_payments(due_date);
CREATE INDEX idx_refit_payments_status ON refit_payments(status);
CREATE INDEX idx_parts_status ON parts_list(status);

-- Insert default refit budget categories (11 categorie dal WBS)
INSERT INTO refit_budget (category, budget_amount, priority, contingency) VALUES
    ('Motori / Refit', 2580, 'MUST', 258),
    ('Trasmissione / Bravo 3X', 0, 'OPZ', 0),
    ('Impianti di bordo', 780, 'MUST', 78),
    ('Scafo / Carena / Anodi', 300, 'MUST', 30),
    ('Sicurezza e dotazioni', 180, 'MUST', 18),
    ('Ormeggio & Logistica', 300, 'MUST', 30),
    ('Assicurazioni / Bolli', 420, 'MUST', 42),
    ('Manodopera / Officina', 420, 'MUST', 42),
    ('Buffer imprevisti', 420, 'MUST', 0),
    ('Extra / Upgrade estetici', 0, 'NICE', 0),
    ('Carrozzeria / Superfici esterne', 600, 'NICE', 60)
ON CONFLICT DO NOTHING;

-- Insert admin user (password: 'domita2026' — bcrypt hash)
INSERT INTO users (username, password_hash, role) VALUES
    ('admin', '$2b$10$placeholder_replace_with_real_hash', 'admin')
ON CONFLICT DO NOTHING;
