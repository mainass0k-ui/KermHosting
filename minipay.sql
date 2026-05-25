-- =============================================
-- MISE À JOUR COMPLÈTE DE LA TABLE TRANSACTIONS
-- =============================================

-- 1. Supprimer les anciennes contraintes
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_currency_check;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_medium_check;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- 2. Recréer la contrainte CURRENCY
ALTER TABLE transactions ADD CONSTRAINT transactions_currency_check 
CHECK (currency IN ('FCFA', 'XAF', 'XOF', 'EUR', 'USD', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'RWF', 'BIF', 'ZAR', 'ZMW', 'MWK', 'MZN', 'AOA', 'NAD', 'BWP', 'MGA', 'MUR', 'SCR', 'KMF', 'DJF', 'ETB', 'SOS', 'SDG', 'SSP', 'ERN', 'LYD', 'TND', 'DZD', 'MAD', 'MRU', 'LRD', 'SLL', 'GNF', 'COINS'));

-- 3. Recréer la contrainte MEDIUM
ALTER TABLE transactions ADD CONSTRAINT transactions_medium_check 
CHECK (UPPER(medium) IN ('FAPSHI', 'PAYPAL', 'MINIPAY', 'COINS', 'ADMIN'));

-- 4. Recréer la contrainte STATUS
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'pending_manual', 'pending_manual_with_proof', 'successful', 'failed', 'expired', 'completed'));

-- 5. Ajouter les colonnes manquantes
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_proof TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;   -- ⭐ NOUVELLE COLONNE POUR L'IMAGE BASE64
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS minipay_phone TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS selected_currency TEXT DEFAULT 'XAF';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_confirmed_by UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_confirmed_at TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 6. Vérifier que tout est en ordre
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
