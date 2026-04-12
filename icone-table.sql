-- =============================================
-- 1. AJOUT DE LA COLONNE AVATAR À PROFILES
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- =============================================
-- 2. CRÉATION DE LA TABLE CONNECTION_HISTORY
-- =============================================
CREATE TABLE IF NOT EXISTS connection_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connection_history_user_id ON connection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_history_created_at ON connection_history(created_at DESC);

-- =============================================
-- 3. CRÉATION DE LA TABLE USER_BADGES (OPTIONNEL)
-- =============================================
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_name VARCHAR(100),
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_name)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- =============================================
-- 4. MISE À JOUR DE LA VUE USER_STATS (AVEC AVATAR)
-- =============================================
DROP VIEW IF EXISTS user_stats;

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    p.email,
    p.role,
    p.coins,
    p.email_verified,
    p.banned,
    p.avatar,
    p.daily_login_streak,
    p.last_daily_login,
    p.total_login_days,
    p.account_created,
    p.badges,
    p.level,
    p.experience,
    p.free_panel_created,
    p.last_login,
    COUNT(DISTINCT s.id) as servers_count,
    COUNT(DISTINCT t.id) as transactions_count,
    COALESCE(SUM(CASE WHEN t.status = 'successful' AND t.currency = 'FCFA' THEN t.amount ELSE 0 END), 0) as total_spent_fcfa,
    COALESCE(SUM(CASE WHEN t.status = 'successful' AND t.currency = 'COINS' THEN t.amount ELSE 0 END), 0) as total_spent_coins,
    MAX(t.created_at) as last_transaction,
    p.created_at
FROM profiles p
LEFT JOIN servers s ON p.id = s.user_id
LEFT JOIN transactions t ON p.id = t.user_id
GROUP BY p.id;

-- =============================================
-- MESSAGE DE CONFIRMATION
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ MIGRATION AVATAR TERMINÉE';
    RAISE NOTICE '📋 Colonne avatar ajoutée à profiles';
    RAISE NOTICE '📋 Table connection_history créée';
    RAISE NOTICE '📋 Table user_badges créée';
    RAISE NOTICE '📋 Vue user_stats mise à jour avec avatar';
    RAISE NOTICE '==========================================';
END $$;
