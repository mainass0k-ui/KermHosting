-- =============================================
-- TABLES POUR PAYPAL - KERMHOSTING
-- Version complète
-- =============================================

-- =============================================
-- 1. AJOUT DES COLONNES À LA TABLE TRANSACTIONS
-- =============================================

-- Colonne pour le moyen de paiement (MTN, ORANGE, PAYPAL, COINS)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS medium TEXT;

-- Colonnes PayPal
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_currency TEXT DEFAULT 'EUR';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_amount_converted DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_transaction_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paypal_payment_id TEXT;

-- Colonnes pour la confirmation admin
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_confirmed_by UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_confirmed_at TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- =============================================
-- 2. MODIFICATION DE LA CONTRAINTE medium
-- =============================================

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_medium_check;

-- Ajouter la nouvelle contrainte avec PAYPAL
ALTER TABLE transactions ADD CONSTRAINT transactions_medium_check 
    CHECK (medium IN ('MTN', 'ORANGE', 'CARD', 'COINS', 'PAYPAL'));

-- =============================================
-- 3. TABLE DES CONFIRMATIONS PAYPAL
-- =============================================

CREATE TABLE IF NOT EXISTS paypal_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'failed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TABLE DES DEVISES
-- =============================================

CREATE TABLE IF NOT EXISTS currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    rate_to_fcfa DECIMAL(10,4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. INSERTION DES DEVISES PAR DÉFAUT
-- =============================================

INSERT INTO currencies (code, name, symbol, rate_to_fcfa, sort_order) VALUES
('EUR', 'Euro', '€', 655.96, 1),
('USD', 'Dollar US', '$', 615.00, 2),
('GBP', 'Livre Sterling', '£', 780.00, 3),
('CAD', 'Dollar Canadien', 'CA$', 450.00, 4),
('XAF', 'Franc CFA', 'FCFA', 1.00, 5)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 6. MISE À JOUR DES TRANSACTIONS EXISTANTES
-- =============================================

-- Mettre à jour les transactions PayPal existantes avec les données du metadata
UPDATE transactions 
SET 
    medium = COALESCE(medium, 'PAYPAL'),
    paypal_email = COALESCE(paypal_email, metadata->>'paypal_email'),
    paypal_name = COALESCE(paypal_name, metadata->>'paypal_name'),
    paypal_currency = COALESCE(paypal_currency, metadata->>'currency', 'EUR'),
    paypal_amount_converted = COALESCE(paypal_amount_converted, (metadata->>'converted_amount')::DECIMAL)
WHERE metadata->>'paypal_email' IS NOT NULL;

-- =============================================
-- 7. INDEX POUR OPTIMISER LES PERFORMANCES
-- =============================================

-- Index pour la colonne medium
CREATE INDEX IF NOT EXISTS idx_transactions_medium ON transactions(medium);

-- Index pour les colonnes PayPal
CREATE INDEX IF NOT EXISTS idx_transactions_paypal_email ON transactions(paypal_email);
CREATE INDEX IF NOT EXISTS idx_transactions_paypal_currency ON transactions(paypal_currency);

-- Index pour la confirmation admin
CREATE INDEX IF NOT EXISTS idx_transactions_admin_confirmed ON transactions(admin_confirmed_at);

-- Index pour la table paypal_confirmations
CREATE INDEX IF NOT EXISTS idx_paypal_confirmations_transaction_id ON paypal_confirmations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_paypal_confirmations_admin_id ON paypal_confirmations(admin_id);

-- Index pour la table currencies
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON currencies(is_active);

-- =============================================
-- 8. COMMENTAIRES POUR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN transactions.medium IS 'Moyen de paiement (MTN, ORANGE, CARD, COINS, PAYPAL)';
COMMENT ON COLUMN transactions.paypal_email IS 'Email PayPal du client';
COMMENT ON COLUMN transactions.paypal_name IS 'Nom complet du client pour PayPal';
COMMENT ON COLUMN transactions.paypal_currency IS 'Devise utilisée pour le paiement PayPal (EUR, USD, GBP, CAD, XAF)';
COMMENT ON COLUMN transactions.paypal_amount_converted IS 'Montant converti dans la devise PayPal';
COMMENT ON COLUMN transactions.paypal_transaction_id IS 'ID de transaction PayPal (si fourni)';
COMMENT ON COLUMN transactions.admin_confirmed_by IS 'ID de l''admin qui a confirmé la transaction';
COMMENT ON COLUMN transactions.admin_confirmed_at IS 'Date de confirmation admin';
COMMENT ON COLUMN transactions.admin_notes IS 'Notes admin sur la transaction';

COMMENT ON TABLE paypal_confirmations IS 'Logs des confirmations admin pour les transactions PayPal';
COMMENT ON TABLE currencies IS 'Devises supportées pour les paiements PayPal avec taux de conversion';

-- =============================================
-- 9. VÉRIFICATION FINALE
-- =============================================

-- Afficher les transactions PayPal
SELECT id, type, status, medium, paypal_email, paypal_name, paypal_currency, paypal_amount_converted, created_at
FROM transactions 
WHERE medium = 'PAYPAL' OR paypal_email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Afficher le nombre de transactions PayPal
SELECT COUNT(*) as total_paypal_transactions
FROM transactions 
WHERE medium = 'PAYPAL' OR paypal_email IS NOT NULL;

-- =============================================
-- FIN DU SCRIPT
-- =============================================
