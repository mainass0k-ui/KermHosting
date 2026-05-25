ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_proof TEXT;  -- URL de la capture d'écran
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS minipay_phone TEXT;  -- Téléphone Minipay de l'utilisateur
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS selected_currency TEXT DEFAULT 'XAF';  -- Devise choisie
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount INTEGER;  -- Montant converti
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS country TEXT;  -- Pays de l'utilisateur
