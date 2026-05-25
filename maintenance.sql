CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    is_active BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL DEFAULT '🚧 Site en maintenance. Nous revenons très bientôt !',
    estimated_end_time TIMESTAMPTZ,
    support_email TEXT DEFAULT 'bookmakerp@gmail.com',
    support_whatsapp TEXT DEFAULT '+237659535227',
    discord_link TEXT DEFAULT 'https://discord.gg/kermhosting',
    allow_ips TEXT[] DEFAULT '{}',
    allow_paths TEXT[] DEFAULT '{/api/admin/*,/api/health}',
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_maintenance_updated_by FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Ajout d'un index pour améliorer les performances de recherche
CREATE INDEX idx_maintenance_updated_at ON public.maintenance(updated_at);

-- Commentaires sur les colonnes pour la documentation
COMMENT ON TABLE public.maintenance IS 'Table de configuration du mode maintenance';
COMMENT ON COLUMN public.maintenance.is_active IS 'Active ou désactive le mode maintenance';
COMMENT ON COLUMN public.maintenance.message IS 'Message affiché aux utilisateurs pendant la maintenance';
COMMENT ON COLUMN public.maintenance.estimated_end_time IS 'Heure estimée de fin de maintenance';
COMMENT ON COLUMN public.maintenance.allow_ips IS 'Liste des adresses IP autorisées à contourner la maintenance';
COMMENT ON COLUMN public.maintenance.allow_paths IS 'Liste des chemins d''URL autorisés pendant la maintenance';
