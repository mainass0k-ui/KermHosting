-- =============================================
-- SCHÉMA COMPLET KERMHOSTING
-- Version: 1.0.1
-- Date: 2026
-- =============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLE 1: PROFILES (Utilisateurs)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id TEXT UNIQUE DEFAULT uuid_generate_v4()::text,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    coins INTEGER DEFAULT 10,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    current_plan TEXT DEFAULT 'free',
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pterodactyl_user_id INTEGER,
    banned BOOLEAN DEFAULT FALSE,
    daily_login_streak INTEGER DEFAULT 0,
    last_daily_login DATE,
    total_login_days INTEGER DEFAULT 0,
    account_created TIMESTAMPTZ DEFAULT NOW(),
    badges JSONB DEFAULT '[]',
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_code TEXT,
    email_verification_code_expires TIMESTAMPTZ,
    reset_password_code TEXT,
    reset_password_code_expires TIMESTAMPTZ,
    admin_expires_at TIMESTAMPTZ,
    admin_access_active BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    newsletter_subscribed BOOLEAN DEFAULT TRUE,
    free_panel_created BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 2: SERVERS (Serveurs des utilisateurs)
-- =============================================
CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    server_type TEXT NOT NULL,
    server_name TEXT NOT NULL,
    pterodactyl_id INTEGER,
    server_identifier TEXT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    allocations JSONB,
    node_id INTEGER,
    egg_id INTEGER,
    docker_image TEXT,
    startup_command TEXT,
    limits JSONB DEFAULT '{}',
    feature_limits JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'suspended', 'deleting', 'deleted', 'error')),
    is_admin_server BOOLEAN DEFAULT FALSE,
    warning_sent BOOLEAN DEFAULT FALSE,
    deletion_scheduled BOOLEAN DEFAULT FALSE,
    last_activity_check TIMESTAMPTZ,
    last_backup TIMESTAMPTZ,
    auto_backup BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 3: TRANSACTIONS (Paiements)
-- =============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('server_purchase', 'coins_purchase', 'server_renewal', 'admin_adjustment')),
    plan_key TEXT,
    pack_id TEXT,
    server_name TEXT,
    phone_number TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'FCFA' CHECK (currency IN ('FCFA', 'COINS')),
    coins_amount INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'expired')),
    payment_id TEXT UNIQUE,
    fapshi_transaction_id TEXT,
    fapshi_response JSONB,
    payment_url TEXT,
    medium TEXT CHECK (medium IN ('MTN', 'ORANGE', 'CARD', 'COINS')),
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    completed_at TIMESTAMPTZ,
    is_renewal BOOLEAN DEFAULT FALSE,
    renewed_server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 4: REFERRALS (Parrainages)
-- =============================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    coins_rewarded INTEGER DEFAULT 20,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id)
);

-- =============================================
-- TABLE 5: DAILY_REWARDS (Récompenses quotidiennes)
-- =============================================
CREATE TABLE daily_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reward_date DATE NOT NULL,
    coins_earned INTEGER DEFAULT 5,
    streak_count INTEGER DEFAULT 1,
    bonus_applied BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reward_date)
);

-- =============================================
-- TABLE 6: USER_ACTIVITIES (Activités utilisateur)
-- =============================================
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    coins_earned INTEGER DEFAULT 0,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 7: SERVER_LOGS (Logs des serveurs)
-- =============================================
CREATE TABLE server_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    server_status TEXT,
    resource_usage JSONB,
    console_logs TEXT,
    last_active TIMESTAMPTZ,
    cpu_usage FLOAT,
    ram_usage BIGINT,
    disk_usage BIGINT,
    network_rx BIGINT,
    network_tx BIGINT,
    uptime BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 8: ADMIN_ACTIONS (Actions des admins)
-- =============================================
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id),
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 9: SYSTEM_LOGS (Logs système)
-- =============================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 10: PLANS (Configuration des plans)
-- =============================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    memory INTEGER NOT NULL,
    disk INTEGER NOT NULL,
    cpu INTEGER NOT NULL,
    swap INTEGER DEFAULT 0,
    io INTEGER DEFAULT 500,
    price_fcfa INTEGER NOT NULL,
    coins_needed INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    egg_id INTEGER DEFAULT 15,
    docker_image TEXT DEFAULT 'ghcr.io/parkervcp/yolks:nodejs_18',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 11: COIN_PACKS (Packs de coins)
-- =============================================
CREATE TABLE coin_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    coins INTEGER NOT NULL,
    price_fcfa INTEGER NOT NULL,
    bonus INTEGER DEFAULT 0,
    icon TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 12: BADGES (Configuration des badges)
-- =============================================
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    icon TEXT,
    min_days INTEGER,
    min_coins INTEGER,
    special BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 13: NOTIFICATIONS (Notifications utilisateur)
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEX (Optimisation des performances)
-- =============================================

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(banned);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Index pour servers
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_servers_expires_at ON servers(expires_at);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_server_type ON servers(server_type);
CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at);

-- Index pour transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_fapshi_id ON transactions(fapshi_transaction_id);

-- Index pour referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- Index pour daily_rewards
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_reward_date ON daily_rewards(reward_date);

-- Index pour user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Index pour server_logs
CREATE INDEX IF NOT EXISTS idx_server_logs_server_id ON server_logs(server_id);
CREATE INDEX IF NOT EXISTS idx_server_logs_created_at ON server_logs(created_at);

-- Index pour admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Index pour system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON system_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- =============================================
-- DONNÉES PAR DÉFAUT
-- =============================================

-- 1. Insérer les plans par défaut
INSERT INTO plans (plan_key, name, memory, disk, cpu, price_fcfa, coins_needed, duration_days, features, sort_order) VALUES
('free', 'Free', 2048, 4096, 300, 0, 0, 1, '["2 GB RAM", "4 GB SSD", "300% CPU", "1 DB", "1 backup"]', 1),
('1gb', 'Starter', 1024, 10240, 100, 500, 100, 30, '["1 GB RAM", "10 GB SSD", "100% CPU", "3 DB", "3 backups", "Support standard"]', 2),
('2gb', 'Basic', 2048, 20480, 200, 800, 160, 30, '["2 GB RAM", "20 GB SSD", "200% CPU", "5 DB", "5 backups", "Support prioritaire"]', 3),
('4gb', 'Pro', 4096, 40960, 400, 1300, 260, 30, '["4 GB RAM", "40 GB SSD", "400% CPU", "10 DB", "10 backups", "Support VIP"]', 4),
('8gb', 'Business', 8192, 81920, 800, 1700, 340, 30, '["8 GB RAM", "80 GB SSD", "800% CPU", "15 DB", "15 backups", "Support VIP 24/7"]', 5);

-- 2. Insérer les packs de coins
INSERT INTO coin_packs (pack_key, name, coins, price_fcfa, bonus, is_popular, sort_order) VALUES
('small', 'Pack Découverte', 100, 500, 0, false, 1),
('medium', 'Pack Populaire', 300, 1000, 20, true, 2),
('large', 'Pack Performance', 700, 2000, 50, false, 3),
('xlarge', 'Pack Ultimate', 2000, 5000, 200, false, 4);

-- 3. Insérer les badges
INSERT INTO badges (badge_key, name, color, min_days, min_coins, special) VALUES
('newcomer', 'Nouvel Arrivant', '#6B7280', 0, 0, false),
('bronze', 'Bronze', '#CD7F32', 7, 0, false),
('silver', 'Argent', '#C0C0C0', 30, 0, false),
('gold', 'Or', '#FFD700', 60, 0, false),
('vip', 'VIP', '#FF00FF', 90, 1000, false),
('premium', 'Premium', '#FFA500', 0, 5000, false),
('admin-assistant', 'Assistant Admin', '#00FF00', 0, 0, true),
('beta-tester', 'Beta Testeur', '#0000FF', 0, 0, true);

-- =============================================
-- CRÉATION DU SUPERADMIN PAR DÉFAUT
-- =============================================
-- Mot de passe: AdminKerm2024! (hashé avec bcrypt)
-- Le hash réel serait: $2a$12$Y2GpP1vQX9pQVNH/lGZpY.TLZJZ0jX8X8X8X8X8X8X8X8X8X
-- Mais pour Supabase, on va utiliser gen_salt() et crypt()

DO $$
DECLARE
    admin_id UUID;
    hashed_pw TEXT;
BEGIN
    -- Vérifier si le superadmin existe déjà
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'superadmin') THEN
        -- Générer l'ID
        admin_id := gen_random_uuid();
        
        -- Générer le hash du mot de passe (AdminKerm2024!)
        hashed_pw := crypt('AdminKerm2024!', gen_salt('bf', 12));
        
        -- Insérer le superadmin
        INSERT INTO profiles (
            id,
            public_id,
            username,
            email,
            password_hash,
            api_key,
            coins,
            role,
            current_plan,
            referral_code,
            badges,
            email_verified,
            admin_expires_at,
            admin_access_active,
            created_at
        ) VALUES (
            admin_id,
            gen_random_uuid()::text,
            'superadmin',
            'emmanuelmoukodi6@gmail.com',
            hashed_pw,
            'KERM_SUPERADMIN_' || encode(gen_random_bytes(32), 'hex'),
            10000,
            'superadmin',
            'admin',
            'ADMIN_' || encode(gen_random_bytes(4), 'hex'),
            '["admin-assistant", "beta-tester", "premium"]',
            true,
            '2099-12-31 23:59:59',
            true,
            NOW()
        );

        RAISE NOTICE '✅ Superadmin créé avec succès';
        RAISE NOTICE '📧 Email: emmanuelmoukodi6@gmail.com';
        RAISE NOTICE '🔑 Mot de passe: AdminKerm2024!';
        RAISE NOTICE '💰 Coins: 10000';
        RAISE NOTICE '⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !';
    ELSE
        RAISE NOTICE '✅ Superadmin existe déjà';
    END IF;
END $$;

-- =============================================
-- FONCTIONS UTILES
-- =============================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_servers_updated_at ON servers;
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coin_packs_updated_at ON coin_packs;
CREATE TRIGGER update_coin_packs_updated_at BEFORE UPDATE ON coin_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les jours restants d'un serveur
CREATE OR REPLACE FUNCTION get_server_days_left(server_expires_at TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(0, EXTRACT(DAY FROM (server_expires_at - NOW()))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
    RETURN user_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue des utilisateurs avec leurs statistiques
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    p.email,
    p.role,
    p.coins,
    p.email_verified,
    p.banned,
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

-- Vue des serveurs avec leurs propriétaires
CREATE OR REPLACE VIEW server_details AS
SELECT 
    s.*,
    p.username as owner_username,
    p.email as owner_email,
    EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER as days_left,
    CASE 
        WHEN s.expires_at < NOW() THEN 'expired'
        WHEN EXTRACT(DAY FROM (s.expires_at - NOW())) <= 3 THEN 'expiring_soon'
        ELSE 'active'
    END as expiry_status
FROM servers s
JOIN profiles p ON s.user_id = p.id;

-- Vue des transactions avec les utilisateurs
CREATE OR REPLACE VIEW transaction_details AS
SELECT 
    t.*,
    p.username as user_username,
    p.email as user_email,
    CASE 
        WHEN t.currency = 'FCFA' THEN '💰 ' || t.amount || ' FCFA'
        WHEN t.currency = 'COINS' THEN '🪙 ' || t.amount || ' coins'
    END as formatted_amount
FROM transactions t
JOIN profiles p ON t.user_id = p.id;

-- =============================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS profiles_user_policy ON profiles;
DROP POLICY IF EXISTS profiles_admin_policy ON profiles;
DROP POLICY IF EXISTS servers_user_policy ON servers;
DROP POLICY IF EXISTS servers_admin_policy ON servers;
DROP POLICY IF EXISTS transactions_user_policy ON transactions;
DROP POLICY IF EXISTS transactions_admin_policy ON transactions;

-- Politique pour profiles: les utilisateurs peuvent voir/modifier leur propre profil
CREATE POLICY profiles_user_policy ON profiles
    FOR ALL USING (auth.uid() = id);

-- Politique pour profiles: les admins peuvent tout voir
CREATE POLICY profiles_admin_policy ON profiles
    FOR ALL USING (is_admin(auth.uid()));

-- Politique pour servers: les utilisateurs peuvent voir leurs serveurs
CREATE POLICY servers_user_policy ON servers
    FOR ALL USING (auth.uid() = user_id);

-- Politique pour servers: les admins peuvent tout voir
CREATE POLICY servers_admin_policy ON servers
    FOR ALL USING (is_admin(auth.uid()));

-- Politique pour transactions: les utilisateurs peuvent voir leurs transactions
CREATE POLICY transactions_user_policy ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour transactions: les admins peuvent tout voir
CREATE POLICY transactions_admin_policy ON transactions
    FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- DONNÉES DE TEST (optionnel - à commenter en production)
-- =============================================
/*
-- Utilisateur de test
INSERT INTO profiles (username, email, password_hash, api_key, coins) VALUES
('testuser', 'test@example.com', crypt('Test123!', gen_salt('bf')), 'KERM_TEST_' || encode(gen_random_bytes(32), 'hex'), 100);

-- Serveur de test
INSERT INTO servers (user_id, server_type, server_name, pterodactyl_id, username, password, email, expires_at) 
SELECT id, '1gb', 'Test Server', 12345, 'testuser', 'Kh-test123', 'test@kermhosting.local', NOW() + INTERVAL '30 days'
FROM profiles WHERE username = 'testuser';
*/

-- =============================================
-- FIN DU SCHÉMA
-- =============================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Base de données KermHosting initialisée avec succès';
    RAISE NOTICE '📊 Tables créées: 13';
    RAISE NOTICE '🔍 Index créés: 30+';
    RAISE NOTICE '👤 Superadmin: emmanuelmoukodi6@gmail.com / AdminKerm2024!';
    RAISE NOTICE '⚠️  CHANGEZ LE MOT DE PASSE SUPERADMIN IMMÉDIATEMENT !';
    RAISE NOTICE '==========================================';
END $$;
