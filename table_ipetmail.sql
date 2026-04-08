-- Table pour l'historique des campagnes d'emails massifs
CREATE TABLE IF NOT EXISTS mass_email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    template_type TEXT NOT NULL,
    target_role TEXT DEFAULT 'all',
    total_recipients INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour accélérer les recherches
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_admin ON mass_email_campaigns(admin_id);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_status ON mass_email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_created ON mass_email_campaigns(created_at DESC);

-- Ajout des colonnes pour l'anti-multi-comptes (si pas déjà présentes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_ip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Ajout des colonnes pour les serveurs gratuits
ALTER TABLE servers ADD COLUMN IF NOT EXISTS free_notification_sent BOOLEAN DEFAULT FALSE;

-- Ajout des colonnes pour les emails massifs (si besoin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_mass_email_sent TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT FALSE;
