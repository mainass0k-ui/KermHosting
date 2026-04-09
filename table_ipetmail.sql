-- Colonnes pour les serveurs
ALTER TABLE servers ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS auto_renew_attempts INTEGER DEFAULT 0;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS last_auto_renew_attempt TIMESTAMPTZ;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS auto_renew_error TEXT;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS warning_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE servers ADD COLUMN IF NOT EXISTS free_notification_sent BOOLEAN DEFAULT FALSE;

-- Colonnes pour les profils
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_ip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Table auto_renew_logs
CREATE TABLE IF NOT EXISTS auto_renew_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    status TEXT CHECK (status IN ('success', 'failed_insufficient_coins', 'failed_other', 'attempting')),
    coins_required INTEGER,
    coins_available INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table mass_email_campaigns
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

-- Index
CREATE INDEX IF NOT EXISTS idx_auto_renew_logs_server ON auto_renew_logs(server_id);
CREATE INDEX IF NOT EXISTS idx_auto_renew_logs_user ON auto_renew_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_admin ON mass_email_campaigns(admin_id);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_status ON mass_email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_created ON mass_email_campaigns(created_at DESC);
