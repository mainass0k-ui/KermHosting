-- Templates de bots
CREATE TABLE IF NOT EXISTS bot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    repo_url TEXT,
    zip_url TEXT,
    zip_path TEXT,
    icon TEXT DEFAULT 'fa-robot',
    price_coins INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    memory INTEGER DEFAULT 512,
    disk INTEGER DEFAULT 1024,
    cpu INTEGER DEFAULT 100,
    egg_id INTEGER DEFAULT 15,
    docker_image TEXT DEFAULT 'ghcr.io/parkervcp/yolks:nodejs_20',
    environment_config JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bots déployés par les utilisateurs
CREATE TABLE IF NOT EXISTS user_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES bot_templates(id),
    bot_name TEXT NOT NULL,
    pterodactyl_server_id INTEGER,
    pterodactyl_identifier TEXT,
    pterodactyl_user_id INTEGER,
    status TEXT DEFAULT 'deploying',
    environment_vars JSONB DEFAULT '{}',
    coins_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_deployed_at TIMESTAMPTZ,
    deploy_logs TEXT,
    UNIQUE(bot_name, user_id)
);

-- Logs de déploiement
CREATE TABLE IF NOT EXISTS bot_deploy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES user_bots(id) ON DELETE CASCADE,
    action TEXT,
    status TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_bots_user_id ON user_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bots_status ON user_bots(status);
CREATE INDEX IF NOT EXISTS idx_bot_templates_active ON bot_templates(is_active);
