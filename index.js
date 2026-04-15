// =============================================
// index.js - KERMHOSTING BACKEND ULTIME - VERSION EMAILS OPTIMISÉS
// AVEC PAYPAL ET MINIPAY
// =============================================

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import cron from 'node-cron';
import multer from 'multer';
import { WebSocketServer } from 'ws';
import http from 'http';
import axios from 'axios';
import FormData from 'form-data';
import { Resend } from 'resend';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// =============================================
// CONFIGURATION SUPABASE
// =============================================
const SUPABASE_CONFIG = {
    url: 'https://qfhztozowlqajvkqdsvl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHp0b3pvd2xxYWp2a3Fkc3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzE2NzksImV4cCI6MjA4ODIwNzY3OX0.AHMcTyOgGucDf5wfLvvUnejET1vc-m3nM31WfY0Z2uQ',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHp0b3pvd2xxYWp2a3Fkc3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMTY3OSwiZXhwIjoyMDg4MjA3Njc5fQ.GG1lh8JOoX70vomo6futGOc7d1edGLtR4wVaeVtph5Y'
};

// =============================================
// CONFIGURATION FAPSHI (LIVE)
// =============================================
const FAPSHI_CONFIG = {
    baseUrl: 'https://live.fapshi.com',
    apiuser: '60dc2e19-b38f-4bc0-9d51-9aef82dc6261',
    apikey: 'FAK_81e7ddd26a9f30229050977d15a3dda3',
    webhookSecret: 'kermhosting_webhook_secret_2026'
};

const fapshiHeaders = {
    apiuser: FAPSHI_CONFIG.apiuser,
    apikey: FAPSHI_CONFIG.apikey
};

// =============================================
// CONFIGURATION RESEND
// =============================================
const RESEND_CONFIG = {
    apiKey: 're_H45dWC65_QJEweNhFFLL9qhsn9c46m2Hn',
    from: 'KermHosting☁️ <noreply@kermhosting.site>',
    supportFrom: 'Support KermHosting <support@kermhosting.site>'
};

// Initialisation Resend
const resend = new Resend(RESEND_CONFIG.apiKey);

// =============================================
// CONFIGURATION PTERODACTYL
// =============================================
const PTERODACTYL_CONFIG = {
    url: 'https://panel.kermhosting.site',
    applicationApiKey: 'ptla_Txoudg9wQjBfupPIechR8qDrcotmFIICjGFj6AdvAdx',
    clientApiKey: 'ptlc_GbX8yaoYt9TEA5hs7mQtwrJE7JoN6D71ydDw2M5Oeib'
};

// =============================================
// CONFIGURATION SITE
// =============================================
const SITE_CONFIG = {
    url: 'https://kermhosting.site',
    name: 'KermHosting',
    supportEmail: 'bookmakerp@gmail.com',
    whatsapp: 'https://wa.me/237659535227',
    discord: 'https://discord.gg/pDyM3Du3h',
    instagram: 'https://twitter.com/kermhosting',
    jwtSecret: 'kermhosting_super_secret_key_2026_changez_ceci',
    port: process.env.PORT || 3000
};

// =============================================
// CONFIGURATION PAYPAL
// =============================================
const PAYPAL_CONFIG = {
    paypalLink: 'https://www.paypal.me/kermhosting?locale.x=en_DE',
    supportCurrencies: ['EUR', 'USD', 'GBP', 'CAD', 'XAF']
};

// =============================================
// CONFIGURATION MINIPAY (PAIEMENT MANUEL)
// =============================================
const MINIPAY_CONFIG = {
    phone_number: '+237659535227',
    instructions: 'Envoyez le montant exact via Minipay à ce numéro, puis téléchargez la capture d\'écran de la transaction',
    appStoreUrl: 'https://apps.apple.com/app/id6504087257',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.opera.minipay&pcampaignid=web_share',
    logo: 'https://files.catbox.moe/u2zr7i.jpg'
};

// =============================================
// CONFIGURATION DES PAYS AFRICAINS AVEC DEVISES
// =============================================
const AFRICAN_COUNTRIES = [
    { code: 'CM', name: 'Cameroun', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'SN', name: 'Sénégal', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'ML', name: 'Mali', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'BF', name: 'Burkina Faso', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'BJ', name: 'Bénin', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'NE', name: 'Niger', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'TG', name: 'Togo', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'GA', name: 'Gabon', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'CG', name: 'Congo', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'CF', name: 'RCA', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'TD', name: 'Tchad', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'GQ', name: 'Guinée Équatoriale', currency: 'XAF', rate_to_fcfa: 1, symbol: 'FCFA' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', rate_to_fcfa: 0.004, symbol: '₦' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', rate_to_fcfa: 0.11, symbol: '₵' },
    { code: 'KE', name: 'Kenya', currency: 'KES', rate_to_fcfa: 0.012, symbol: 'KSh' },
    { code: 'TZ', name: 'Tanzanie', currency: 'TZS', rate_to_fcfa: 0.00064, symbol: 'TSh' },
    { code: 'UG', name: 'Ouganda', currency: 'UGX', rate_to_fcfa: 0.00043, symbol: 'USh' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF', rate_to_fcfa: 0.0011, symbol: 'RF' },
    { code: 'BI', name: 'Burundi', currency: 'BIF', rate_to_fcfa: 0.00054, symbol: 'FBu' },
    { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', rate_to_fcfa: 0.087, symbol: 'R' },
    { code: 'ZM', name: 'Zambie', currency: 'ZMW', rate_to_fcfa: 0.058, symbol: 'ZK' },
    { code: 'MW', name: 'Malawi', currency: 'MWK', rate_to_fcfa: 0.00095, symbol: 'MK' },
    { code: 'MZ', name: 'Mozambique', currency: 'MZN', rate_to_fcfa: 0.024, symbol: 'MT' },
    { code: 'AO', name: 'Angola', currency: 'AOA', rate_to_fcfa: 0.0019, symbol: 'Kz' },
    { code: 'NA', name: 'Namibie', currency: 'NAD', rate_to_fcfa: 0.087, symbol: 'N$' },
    { code: 'BW', name: 'Botswana', currency: 'BWP', rate_to_fcfa: 0.12, symbol: 'P' },
    { code: 'ZW', name: 'Zimbabwe', currency: 'USD', rate_to_fcfa: 0.0016, symbol: '$' },
    { code: 'MG', name: 'Madagascar', currency: 'MGA', rate_to_fcfa: 0.00057, symbol: 'Ar' },
    { code: 'MU', name: 'Maurice', currency: 'MUR', rate_to_fcfa: 0.034, symbol: 'Rs' },
    { code: 'SC', name: 'Seychelles', currency: 'SCR', rate_to_fcfa: 0.12, symbol: 'SR' },
    { code: 'KM', name: 'Comores', currency: 'KMF', rate_to_fcfa: 0.0022, symbol: 'CF' },
    { code: 'DJ', name: 'Djibouti', currency: 'DJF', rate_to_fcfa: 0.0091, symbol: 'Fdj' },
    { code: 'ET', name: 'Éthiopie', currency: 'ETB', rate_to_fcfa: 0.028, symbol: 'Br' },
    { code: 'SO', name: 'Somalie', currency: 'SOS', rate_to_fcfa: 0.0028, symbol: 'Sh' },
    { code: 'SD', name: 'Soudan', currency: 'SDG', rate_to_fcfa: 0.0027, symbol: '£S' },
    { code: 'SS', name: 'Soudan du Sud', currency: 'SSP', rate_to_fcfa: 0.012, symbol: '£' },
    { code: 'ER', name: 'Érythrée', currency: 'ERN', rate_to_fcfa: 0.11, symbol: 'Nfk' },
    { code: 'LY', name: 'Libye', currency: 'LYD', rate_to_fcfa: 0.33, symbol: 'LD' },
    { code: 'TN', name: 'Tunisie', currency: 'TND', rate_to_fcfa: 0.52, symbol: 'DT' },
    { code: 'DZ', name: 'Algérie', currency: 'DZD', rate_to_fcfa: 0.012, symbol: 'DA' },
    { code: 'MA', name: 'Maroc', currency: 'MAD', rate_to_fcfa: 0.10, symbol: 'DH' },
    { code: 'MR', name: 'Mauritanie', currency: 'MRU', rate_to_fcfa: 0.042, symbol: 'UM' },
    { code: 'LR', name: 'Libéria', currency: 'LRD', rate_to_fcfa: 0.0096, symbol: 'L$' },
    { code: 'SL', name: 'Sierra Leone', currency: 'SLL', rate_to_fcfa: 0.00011, symbol: 'Le' },
    { code: 'GN', name: 'Guinée', currency: 'GNF', rate_to_fcfa: 0.00018, symbol: 'FG' },
    { code: 'GW', name: 'Guinée-Bissau', currency: 'XOF', rate_to_fcfa: 1, symbol: 'FCFA' }
];

// Taux de conversion FCFA vers autres devises
const EXCHANGE_RATES = {
    'EUR': 655.96,
    'USD': 615.00,
    'GBP': 780.00,
    'CAD': 450.00,
    'XAF': 1.00,
    'XOF': 1.00,
    'NGN': 0.004,
    'GHS': 0.11,
    'KES': 0.012,
    'TZS': 0.00064,
    'UGX': 0.00043,
    'RWF': 0.0011,
    'BIF': 0.00054,
    'ZAR': 0.087,
    'ZMW': 0.058,
    'MWK': 0.00095,
    'MZN': 0.024,
    'AOA': 0.0019,
    'NAD': 0.087,
    'BWP': 0.12,
    'USD': 0.0016,
    'MGA': 0.00057,
    'MUR': 0.034,
    'SCR': 0.12,
    'KMF': 0.0022,
    'DJF': 0.0091,
    'ETB': 0.028,
    'SOS': 0.0028,
    'SDG': 0.0027,
    'SSP': 0.012,
    'ERN': 0.11,
    'LYD': 0.33,
    'TND': 0.52,
    'DZD': 0.012,
    'MAD': 0.10,
    'MRU': 0.042,
    'LRD': 0.0096,
    'SLL': 0.00011,
    'GNF': 0.00018
};

function convertFcfaToCurrency(amountFcfa, currency) {
    const rate = EXCHANGE_RATES[currency];
    if (!rate) return amountFcfa;
    return Math.round((amountFcfa / rate) * 100) / 100;
}

function getCurrencyName(code) {
    const names = {
        'EUR': 'Euro', 'USD': 'Dollar US', 'GBP': 'Livre Sterling', 
        'CAD': 'Dollar Canadien', 'XAF': 'Franc CFA', 'XOF': 'Franc CFA',
        'NGN': 'Naira', 'GHS': 'Cedi', 'KES': 'Shilling Kenyan',
        'TZS': 'Shilling Tanzanien', 'UGX': 'Shilling Ougandais',
        'RWF': 'Franc Rwandais', 'BIF': 'Franc Burundais',
        'ZAR': 'Rand', 'ZMW': 'Kwacha Zambien', 'MWK': 'Kwacha Malawien',
        'MZN': 'Metical', 'AOA': 'Kwanza', 'NAD': 'Dollar Namibien',
        'BWP': 'Pula', 'MGA': 'Ariary', 'MUR': 'Roupie Mauricienne',
        'SCR': 'Roupie Seychelloise', 'KMF': 'Franc Comorien',
        'DJF': 'Franc Djiboutien', 'ETB': 'Birr', 'SOS': 'Shilling Somali',
        'SDG': 'Livre Soudanaise', 'SSP': 'Livre Sud-Soudanaise',
        'ERN': 'Nakfa', 'LYD': 'Dinar Libyen', 'TND': 'Dinar Tunisien',
        'DZD': 'Dinar Algérien', 'MAD': 'Dirham Marocain',
        'MRU': 'Ouguiya', 'LRD': 'Dollar Libérien', 'SLL': 'Leone',
        'GNF': 'Franc Guinéen'
    };
    return names[code] || code;
}

function getCurrencySymbol(code) {
    const symbols = {
        'EUR': '€', 'USD': '$', 'GBP': '£', 'CAD': 'CA$', 
        'XAF': 'FCFA', 'XOF': 'FCFA', 'NGN': '₦', 'GHS': '₵',
        'KES': 'KSh', 'TZS': 'TSh', 'UGX': 'USh', 'RWF': 'RF',
        'BIF': 'FBu', 'ZAR': 'R', 'ZMW': 'ZK', 'MWK': 'MK',
        'MZN': 'MT', 'AOA': 'Kz', 'NAD': 'N$', 'BWP': 'P',
        'MGA': 'Ar', 'MUR': 'Rs', 'SCR': 'SR', 'KMF': 'CF',
        'DJF': 'Fdj', 'ETB': 'Br', 'SOS': 'Sh', 'SDG': '£S',
        'SSP': '£', 'ERN': 'Nfk', 'LYD': 'LD', 'TND': 'DT',
        'DZD': 'DA', 'MAD': 'DH', 'MRU': 'UM', 'LRD': 'L$',
        'SLL': 'Le', 'GNF': 'FG'
    };
    return symbols[code] || code;
}

// Initialisation Supabase
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

// =============================================
// CONFIGURATION DES PLANS
// =============================================
const PLANS = {
    'free': {
        id: 'free',
        name: 'Free',
        memory: 2048,
        disk: 4096,
        cpu: 300,
        swap: 0,
        io: 500,
        price_fcfa: 0,
        coins_needed: 0,
        duration_days: 1,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
        features: [
            '2 GB DDR4',
            '4 GB Stockage NVMe',
            '300% CPU',
            '24h d\'essai',
            '1 base de données',
            '1 backup'
        ],
        icon: 'fa-gift',
        color: 'gray'
    },
    '1gb': {
        id: '1gb',
        name: 'Starter',
        memory: 1024,
        disk: 3072,
        cpu: 100,
        swap: 0,
        io: 500,
        price_fcfa: 500,
        coins_needed: 100,
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
        features: [
            '1 GB RAM DDR4',
            '3 GB Stockage NVMe',
            '100% CPU',
            '7 jours',
            '3 bases de données',
            '3 backups',
            'Support standard'
        ],
        icon: 'fa-rocket',
        color: 'blue',
        popular: true
    },
    '2gb': {
        id: '2gb',
        name: 'Basic',
        memory: 2048,
        disk: 5120,
        cpu: 200,
        swap: 0,
        io: 500,
        price_fcfa: 800,
        coins_needed: 160,
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
        features: [
            '2 GB RAM DDR4',
            '5 GB Stockage NVMe',
            '200% CPU',
            '7 jours',
            '5 bases de données',
            '5 backups',
            'Support prioritaire'
        ],
        icon: 'fa-server',
        color: 'green'
    },
    '4gb': {
        id: '4gb',
        name: 'Pro',
        memory: 4096,
        disk: 10240,
        cpu: 400,
        swap: 0,
        io: 500,
        price_fcfa: 1300,
        coins_needed: 260,
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
        features: [
            '4 GB RAM DDR4',
            '10 GB Stockage NVMe',
            '400% CPU',
            '7 jours',
            '10 bases de données',
            '10 backups',
            'Support prioritaire',
            'Domaine gratuit'
        ],
        icon: 'fa-crown',
        color: 'purple'
    },
    '8gb': {
        id: '8gb',
        name: 'Business',
        memory: 8192,
        disk: 20480,
        cpu: 800,
        swap: 0,
        io: 500,
        price_fcfa: 1700,
        coins_needed: 340,
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
        features: [
            '8 GB RAM DDR4',
            '20 GB Stockage NVMe',
            '800% CPU',
            '7 jours',
            '15 bases de données',
            '15 backups',
            'Support VIP 24/7',
            'Domaine gratuit',
            'SSL dédié'
        ],
        icon: 'fa-star',
        color: 'gold'
    }
};

// =============================================
// CONFIGURATION DES PACKS DE COINS
// =============================================
const COIN_PACKS = {
    'small': {
        id: 'small',
        name: 'Pack Découverte',
        coins: 100,
        price_fcfa: 500,
        bonus: 0,
        icon: 'fa-seedling'
    },
    'medium': {
        id: 'medium',
        name: 'Pack Populaire',
        coins: 300,
        price_fcfa: 1000,
        bonus: 20,
        icon: 'fa-fire',
        popular: true
    },
    'large': {
        id: 'large',
        name: 'Pack Performance',
        coins: 700,
        price_fcfa: 2000,
        bonus: 50,
        icon: 'fa-bolt'
    },
    'xlarge': {
        id: 'xlarge',
        name: 'Pack Ultimate',
        coins: 2000,
        price_fcfa: 5000,
        bonus: 200,
        icon: 'fa-gem'
    }
};

// =============================================
// MIDDLEWARE
// =============================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: SITE_CONFIG.url,
    credentials: true
}));

// Configuration Multer pour l'upload de captures d'écran Minipay
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.'), false);
        }
    }
});

// =============================================
// MIDDLEWARE DE MAINTENANCE
// =============================================

const maintenanceCheck = async (req, res, next) => {
    try {
        const publicPaths = [
            '/', 
            '/login', 
            '/register', 
            '/email-verification', 
            '/forgot-password', 
            '/admin',
            '/maintenance',
            '/api/health',
            '/api/maintenance-status',
            '/api/admin/maintenance',
            '/api/admin/check',
            '/api/countries'
        ];
        
        if (publicPaths.includes(req.path) || req.path.startsWith('/api/admin/') || req.path.startsWith('/api/payment/minipay/upload-proof')) {
            return next();
        }

        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .select('*')
            .single();

        if (error || !maintenance) {
            return next();
        }

        if (!maintenance.is_active) {
            return next();
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (maintenance.allow_ips && maintenance.allow_ips.includes(clientIp)) {
            return next();
        }

        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, SITE_CONFIG.jwtSecret);
                const { data: user } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', decoded.userId)
                    .single();
                
                if (user && (user.role === 'admin' || user.role === 'superadmin')) {
                    return next();
                }
            } catch (err) {
                // Token invalide, ignorer
            }
        }

        if (req.path.startsWith('/api/')) {
            return res.status(503).json({
                success: false,
                error: 'Site en maintenance',
                maintenance: true,
                message: maintenance.message
            });
        }

        return res.status(503).sendFile(path.join(__dirname, 'public', 'maintenance.html'));

    } catch (error) {
        console.error('❌ Erreur middleware maintenance:', error);
        next();
    }
};

app.use(maintenanceCheck);

// =============================================
// SERVEUR STATIQUE
// =============================================
app.use(express.static('public'));

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

const generateApiKey = () => `KERM_${crypto.randomBytes(32).toString('hex')}`;
const generateReferralCode = () => `KERM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateUUID = () => crypto.randomUUID();
const generateTransactionId = () => crypto.randomUUID();
const generateUsername = () => `user_${crypto.randomBytes(4).toString('hex')}`;
const generatePassword = () => crypto.randomBytes(12).toString('hex');

function generateServerPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    return `Kh-${password}`;
}

function validateUsername(username) {
    if (!username) return { valid: false, reason: 'Nom d\'utilisateur requis' };
    if (username.length < 3 || username.length > 20) {
        return { valid: false, reason: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, reason: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores' };
    }
    return { valid: true };
}

// =============================================
// ANTI-MULTI-COMPTES (NOUVEAU)
// =============================================
async function checkAndBanMultiAccounts(ip, userId, userEmail, username) {
    // Vérifier si l'utilisateur est admin (exemption)
    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (adminCheck && (adminCheck.role === 'admin' || adminCheck.role === 'superadmin')) {
        return false; // Les admins sont exemptés
    }
    
    // Chercher d'autres comptes avec la même IP
    const { data: otherAccounts } = await supabase
        .from('profiles')
        .select('id, email, username')
        .eq('registration_ip', ip)
        .neq('id', userId);
    
    if (otherAccounts && otherAccounts.length > 0) {
        // Bannir tous les comptes concernés
        const allUserIds = [...otherAccounts.map(a => a.id), userId];
        
        for (const id of allUserIds) {
            await supabase
                .from('profiles')
                .update({ 
                    banned: true,
                    ban_reason: 'Multi-comptes détectés (même IP)'
                })
                .eq('id', id);
            
            // Email à chaque compte banni
            const { data: user } = await supabase
                .from('profiles')
                .select('email, username')
                .eq('id', id)
                .single();
            
            if (user) {
                await sendEmail(
                    user.email,
                    '🔒 Compte suspendu - Multi-comptes',
                    getMultiAccountBanHtml(user.username, ip)
                );
            }
        }
        
        return true;
    }
    
    return false;
}

function getMultiAccountBanHtml(username, ip) {
    const content = `
        <h2>🔒 Compte suspendu</h2>
        <p>Bonjour ${username},</p>
        <p>Votre compte a été suspendu car nous avons détecté plusieurs comptes créés depuis la même adresse IP.</p>
        <div style="background: #fee9e6; padding: 15px; border-left: 4px solid #f44336;">
            <p><strong>Raison :</strong> Multi-comptes (IP: ${ip})</p>
            <p>Pour faire réactiver votre compte, veuillez contacter un administrateur.</p>
        </div>
        <p><strong>Contact :</strong> ${SITE_CONFIG.supportEmail}</p>
    `;
    return getBaseEmailTemplate('🔒 Compte suspendu - Multi-comptes', content);
}

// =============================================
// FONCTIONS EMAIL AVEC RESEND - VERSION OPTIMISÉE
// =============================================
async function sendEmail(to, subject, htmlContent) {
    try {
        console.log(`📧 Tentative d'envoi à ${to} via Resend...`);
        
        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.from,
            to: [to],
            subject: subject,
            html: htmlContent
        });

        if (error) {
            console.error('❌ Erreur Resend:', error);
            return { success: false, error };
        }

        console.log(`✅ Email envoyé avec succès à ${to}`, data);
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        return { success: false, error: error.message };
    }
}

async function sendSupportEmail(to, subject, htmlContent) {
    try {
        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.supportFrom,
            to: [to],
            subject: subject,
            html: htmlContent
        });

        if (error) {
            console.error('❌ Erreur Resend support:', error);
            return { success: false };
        }

        console.log(`✅ Email support envoyé à ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur email support:', error);
        return { success: false };
    }
}

// Template de base avec design élégant mais sobre
function getBaseEmailTemplate(title, content) {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KermHosting</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f8;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                 <tr>
                    <td style="padding: 30px 30px 20px 30px; text-align: center; border-bottom: 2px solid #f0f0f5;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #7C3AED; letter-spacing: -0.5px;">KermHosting</h1>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 14px; font-weight: 400;">Hébergement Node.js nouvelle génération</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        ${content}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 30px; text-align: center; background-color: #fafafc; border-radius: 0 0 12px 12px; border-top: 1px solid #eaeaf0;">
                        <p style="margin: 0; color: #666; font-size: 13px;">KermHosting · ${SITE_CONFIG.url}</p>
                        <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">© ${year} Tous droits réservés.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;
}

// 🔐 Template de vérification d'email
function getVerificationEmailHtml(username, code) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🔐 Vérification de votre compte</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Merci de vous être inscrit sur KermHosting. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
        
        <div style="background: linear-gradient(145deg, #f9f9ff, #f0f0fa); border: 2px solid #7C3AED; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <span style="font-size: 42px; font-weight: 700; color: #7C3AED; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
        </div>
        
        <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">⏰ Ce code expirera dans <strong>15 minutes</strong> pour des raisons de sécurité.</p>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 12px 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">Si vous n'avez pas créé de compte sur KermHosting, ignorez simplement cet email.</p>
        </div>
        
        <p style="color: #7C3AED; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
            <a href="${SITE_CONFIG.url}" style="color: #7C3AED; text-decoration: none;">← Retour à l'accueil</a>
        </p>
    `;
    return getBaseEmailTemplate('🔐 Vérification de votre compte', content);
}

// 🎉 Template de bienvenue
function getWelcomeEmailHtml(username) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🎉 Bienvenue ${username} !</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Félicitations, votre compte a été vérifié avec succès. Vous faites maintenant partie de la communauté KermHosting !</p>
        
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🚀 Pour commencer :</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
                         <tr>
                            <td style="padding: 8px 0; color: #555;">1. Connectez-vous à votre tableau de bord</td>
                         </tr>
                         <tr>
                            <td style="padding: 8px 0; color: #555;">2. Créez votre premier serveur (offre gratuite 24h)</td>
                         </tr>
                         <tr>
                            <td style="padding: 8px 0; color: #555;">3. Déployez vos projets Node.js</td>
                         </tr>
                     </table>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Accéder au tableau de bord</a>
        </p>
    `;
    return getBaseEmailTemplate('🎉 Bienvenue sur KermHosting', content);
}

// 🔑 Template de réinitialisation de mot de passe
function getResetEmailHtml(username, code) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🔑 Réinitialisation de mot de passe</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous :</p>
        
        <div style="background: linear-gradient(145deg, #f9f9ff, #f0f0fa); border: 2px solid #7C3AED; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <span style="font-size: 42px; font-weight: 700; color: #7C3AED; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
        </div>
        
        <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">⏰ Ce code expirera dans <strong>15 minutes</strong>.</p>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 12px 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
        
        <p style="text-align: center; margin: 20px 0 0 0;">
            <a href="${SITE_CONFIG.url}/reset-password" style="color: #7C3AED;">Changer mon mot de passe</a>
        </p>
    `;
    return getBaseEmailTemplate('🔑 Réinitialisation de mot de passe', content);
}

// ✅ Template de confirmation d'achat de serveur
function getPurchaseConfirmationHtml(username, plan, serverCredentials) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">✅ Serveur créé avec succès</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur <strong>${serverCredentials.server_name}</strong> (plan ${plan.name}) a été créé avec succès.</p>
        
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🔑 Informations de connexion :</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                         <tr>
                            <td style="color: #666;">Nom du serveur :</td>
                            <td style="font-weight: bold;">${serverCredentials.server_name}</td>
                         </tr>
                         <tr>
                            <td style="color: #666;">Nom d'utilisateur :</td>
                            <td style="font-weight: bold;">${serverCredentials.username}</td>
                         </tr>
                         <tr>
                            <td style="color: #666;">Mot de passe :</td>
                            <td style="font-weight: bold; color: #7C3AED;">${serverCredentials.password}</td>
                         </tr>
                         <tr>
                            <td style="color: #666;">URL du panel :</td>
                            <td><a href="${PTERODACTYL_CONFIG.url}" style="color: #7C3AED;">${PTERODACTYL_CONFIG.url}</a></td>
                         </tr>
                         <tr>
                            <td style="color: #666;">Identifiant :</td>
                            <td style="font-family: monospace;">${serverCredentials.identifier}</td>
                         </tr>
                     </table>
        </div>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 12px 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Important :</strong> conservez ces informations précieusement. Elles ne seront plus affichées.</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Gérer mon serveur</a>
        </p>
    `;
    return getBaseEmailTemplate('✅ Confirmation de création de serveur', content);
}

// 💰 Template de confirmation d'achat de coins
function getCoinsPurchaseHtml(username, pack, totalCoins, transactionId) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">💰 Achat de coins confirmé</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre achat de coins a été traité avec succès et crédité sur votre compte.</p>
        
        <div style="background: linear-gradient(145deg, #f9f9ff, #f0f0fa); border: 2px solid #7C3AED; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <div style="font-size: 20px; color: #7C3AED; margin-bottom: 10px;">💰 Total de coins crédités</div>
            <div style="font-size: 48px; font-weight: 700; color: #7C3AED; margin-bottom: 10px;">${totalCoins}</div>
            <div style="color: #666;">coins</div>
        </div>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0;">
                     <tr>
                        <td style="color: #666;">Pack acheté :</td>
                        <td style="font-weight: bold;">${pack.name}</td>
                     </tr>
                     <tr>
                        <td style="color: #666;">Coins de base :</td>
                        <td style="font-weight: bold;">${pack.coins}</td>
                     </tr>
                    ${pack.bonus > 0 ? `
                     <tr>
                        <td style="color: #666;">Bonus offert :</td>
                        <td style="font-weight: bold; color: #27ae60;">+${pack.bonus} coins</td>
                      </tr>
                    ` : ''}
                     <tr>
                        <td style="color: #666;">Montant payé :</td>
                        <td style="font-weight: bold;">${pack.price_fcfa} FCFA</td>
                      </tr>
                     <tr>
                        <td style="color: #666;">ID de transaction :</td>
                        <td style="font-family: monospace; font-size: 12px;">${transactionId || 'N/A'}</td>
                      </tr>
                 </table>
        
        <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 15px; margin: 25px 0;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">✨ Vous pouvez maintenant utiliser vos coins pour créer ou renouveler des serveurs.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/pricing" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 0 5px;">Créer un serveur</a>
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #f0f0f0; color: #333; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 0 5px;">Voir mon solde</a>
        </div>
    `;
    return getBaseEmailTemplate('💰 Achat de coins confirmé', content);
}

// 🎁 Template de notification de parrainage (MODIFIÉ: 10 coins)
function getReferralNotificationHtml(username, referrerName, referralLink) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🎁 Nouveau filleul !</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">${referrerName} vient de s'inscrire sur KermHosting en utilisant votre lien de parrainage.</p>
        
        <div style="background: linear-gradient(145deg, #f9f9ff, #f0f0fa); border: 2px solid #7C3AED; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <div style="font-size: 36px; font-weight: 700; color: #7C3AED; margin-bottom: 5px;">10 coins</div>
            <div style="color: #666;">Crédités sur votre compte</div>
        </div>
        
        <p style="color: #555; margin: 20px 0 10px 0;">Continuez à partager votre lien de parrainage :</p>
        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 15px 0; word-break: break-all; font-family: monospace; color: #7C3AED;">
            ${referralLink}
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/profile" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Voir mes statistiques</a>
        </p>
    `;
    return getBaseEmailTemplate('🎁 Nouveau filleul !', content);
}

// 🎁 Template de bienvenue pour filleul (MODIFIÉ: 5 coins)
function getReferralWelcomeHtml(username, referrerName, referralLink) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🎁 Bienvenue sur KermHosting !</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Vous avez été parrainé par ${referrerName}. Bienvenue dans notre communauté !</p>
        
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 5px 0; color: #555;"><strong>🎁 Bonus de bienvenue :</strong> 5 coins (parrainage)</p>
            <p style="margin: 5px 0; color: #555;"><strong>💰 Total de départ :</strong> 10 coins (5 parrainage + 5 vérification email)</p>
        </div>
        
        <div style="margin: 25px 0;">
            <p style="color: #555; margin: 0 0 10px 0;">🚀 Pour commencer :</p>
            <ol style="color: #555; margin-left: 20px; padding-left: 0;">
                <li style="margin-bottom: 10px;">Vérifiez votre email pour activer votre compte</li>
                <li style="margin-bottom: 10px;">Créez votre premier serveur (offre gratuite 24h)</li>
                <li style="margin-bottom: 10px;">Partagez votre lien de parrainage pour gagner plus de coins</li>
            </ol>
        </div>
        
        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #666;">Votre lien de parrainage :</p>
            <p style="margin: 10px 0 0; word-break: break-all; font-family: monospace; color: #7C3AED;">${referralLink}</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Accéder au tableau de bord</a>
        </p>
    `;
    return getBaseEmailTemplate('🎁 Bienvenue sur KermHosting !', content);
}

// ⚠️ Template d'expiration de serveur (J-3)
function getServerExpiringHtml(username, server, daysLeft) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">⚠️ Votre serveur expire bientôt</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur <strong>"${server.server_name}"</strong> expirera dans <strong style="color: #e67e22;">${daysLeft} jours</strong>.</p>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Action requise :</strong> Pour éviter la suspension de votre serveur, veuillez le renouveler avant la date d'expiration.</p>
        </div>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0;">
                     <tr>
                        <td style="color: #666;">Date d'expiration :</td>
                        <td style="font-weight: bold;">${new Date(server.expires_at).toLocaleDateString('fr-FR')}</td>
                     </tr>
                     <tr>
                        <td style="color: #666;">Prix de renouvellement :</td>
                        <td style="font-weight: bold;">${PLANS[server.server_type]?.price_fcfa || 0} FCFA / ${Math.floor((PLANS[server.server_type]?.price_fcfa || 0) / 5)} coins</td>
                     </tr>
                 </table>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Renouveler maintenant</a>
        </div>
        
        <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">Si vous ne renouvelez pas, votre serveur sera suspendu à la date d'expiration puis supprimé définitivement après 3 jours.</p>
    `;
    return getBaseEmailTemplate('⚠️ Alerte expiration', content);
}

// 🔴 Template de suspension de serveur (J0)
function getServerSuspendedHtml(username, server) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🔴 Votre serveur a été suspendu</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur <strong>"${server.server_name}"</strong> a été suspendu car il a atteint sa date d'expiration.</p>
        
        <div style="background-color: #fee9e6; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #b71c1c;"><strong>Important :</strong> Vous avez jusqu'au <strong>${new Date(new Date(server.expires_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</strong> pour renouveler votre serveur. Passé ce délai, il sera définitivement supprimé.</p>
        </div>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0;">
                     <tr>
                        <td style="color: #666;">Date d'expiration :</td>
                        <td style="font-weight: bold;">${new Date(server.expires_at).toLocaleDateString('fr-FR')}</td>
                     </tr>
                     <tr>
                        <td style="color: #666;">Date limite de renouvellement :</td>
                        <td style="font-weight: bold; color: #e67e22;">${new Date(new Date(server.expires_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</td>
                     </tr>
                     <tr>
                        <td style="color: #666;">Prix de renouvellement :</td>
                        <td style="font-weight: bold;">${PLANS[server.server_type]?.price_fcfa || 0} FCFA / ${Math.floor((PLANS[server.server_type]?.price_fcfa || 0) / 5)} coins</td>
                     </tr>
                 </table>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Renouveler maintenant</a>
        </div>
    `;
    return getBaseEmailTemplate('🔴 Serveur suspendu', content);
}

// 🗑️ Template de suppression de serveur (J+3)
function getServerDeletedHtml(username, server) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🗑️ Votre serveur a été supprimé</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur <strong>"${server.server_name}"</strong> a été définitivement supprimé car il n'a pas été renouvelé dans les 3 jours suivant son expiration.</p>
        
        <div style="background-color: #fee9e6; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #b71c1c;">Toutes les données associées à ce serveur ont été effacées de nos systèmes.</p>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin: 20px 0;">Vous pouvez toujours créer un nouveau serveur quand vous le souhaitez. Vos coins et votre compte sont toujours actifs.</p>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/pricing" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Créer un nouveau serveur</a>
        </div>
    `;
    return getBaseEmailTemplate('🗑️ Serveur supprimé', content);
}

// 🆓 Template pour serveur free - expiration dans 12h (NOUVEAU)
function getFreeServerExpiringHtml(username, server) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">⚠️ Votre serveur gratuit expire dans 12h</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur gratuit <strong>"${server.server_name}"</strong> expirera dans 12 heures.</p>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e;">⏰ Après 24h, il sera automatiquement supprimé.</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">💡 Passez à un plan payant pour garder vos données.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/pricing" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Voir les offres</a>
        </div>
    `;
    return getBaseEmailTemplate('⚠️ Serveur gratuit - expiration dans 12h', content);
}

// 🗑️ Template pour serveur free - suppression à 24h (NOUVEAU)
function getFreeServerDeletedHtml(username, server) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🗑️ Votre serveur gratuit a été supprimé</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur gratuit <strong>"${server.server_name}"</strong> a été automatiquement supprimé après 24h.</p>
        
        <div style="background-color: #fee9e6; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #b71c1c;">Toutes les données associées à ce serveur ont été effacées.</p>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin: 20px 0;">Vous pouvez créer un nouveau serveur gratuit ou passer à un plan payant.</p>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/pricing" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Créer un serveur</a>
        </div>
    `;
    return getBaseEmailTemplate('🗑️ Serveur gratuit supprimé', content);
}

// 🔒 Template de suspension de compte
function getAccountSuspendedHtml(username, reason) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🔒 Compte suspendu</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Nous vous informons que votre compte KermHosting a été temporairement suspendu.</p>
        
        <div style="background-color: #fee9e6; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #b71c1c;">Raison : ${reason || 'Non-respect des conditions d\'utilisation.'}</p>
        </div>
        
        <p style="color: #555; margin: 20px 0;">Pour plus d'informations, veuillez contacter notre support.</p>
        
        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Support :</strong></p>
            <p style="margin: 5px 0;">Email: <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: #7C3AED;">${SITE_CONFIG.supportEmail}</a></p>
            <p style="margin: 5px 0;">WhatsApp: <a href="${SITE_CONFIG.whatsapp}" style="color: #7C3AED;">Cliquez ici</a></p>
            <p style="margin: 5px 0;">Discord: <a href="${SITE_CONFIG.discord}" style="color: #7C3AED;">Rejoindre</a></p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/support" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Contacter le support</a>
        </p>
    `;
    return getBaseEmailTemplate('🔒 Compte suspendu', content);
}

// 🗑️ Template de suppression de compte
function getAccountDeletedHtml(username) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🗑️ Compte supprimé</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Nous confirmons la suppression de votre compte KermHosting conformément à votre demande.</p>
        
        <div style="background-color: #fee9e6; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #b71c1c;">Toutes vos données personnelles, serveurs et transactions ont été supprimés.</p>
        </div>
        
        <p style="color: #555; margin: 20px 0;">Nous espérons vous revoir bientôt sur KermHosting.</p>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}" style="color: #7C3AED;">Retour à l'accueil</a>
        </p>
    `;
    return getBaseEmailTemplate('🗑️ Compte supprimé', content);
}

// 📧 Template de confirmation de changement d'email
function getEmailChangedConfirmationHtml(username, newEmail) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">📧 Email modifié avec succès</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre adresse email a été modifiée avec succès.</p>
        
        <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #555;">Nouvelle adresse : <strong>${newEmail}</strong></p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin: 20px 0;">Pour vous connecter, utilisez désormais cette nouvelle adresse email.</p>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/login" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Se connecter</a>
        </p>
    `;
    return getBaseEmailTemplate('📧 Email modifié', content);
}

// ✅ Template de renouvellement de serveur
function getRenewalConfirmationHtml(username, server, newExpiry, coins) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">✅ Renouvellement confirmé</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Votre serveur <strong>"${server.server_name}"</strong> a été renouvelé avec succès.</p>
        
        <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 5px 0; color: #555;"><strong>📅 Nouvelle date d'expiration :</strong> ${newExpiry.toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0; color: #555;"><strong>💰 Coins déduits :</strong> ${coins}</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Voir mon serveur</a>
        </p>
    `;
    return getBaseEmailTemplate('✅ Renouvellement confirmé', content);
}

// 📱 Template de paiement Minipay en attente
function getMinipayPendingHtml(username, pack, convertedAmount, currencySymbol) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">⏳ Paiement Minipay en attente</h2>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: #7C3AED;">${username}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">Nous avons bien reçu votre demande d'achat de coins via Minipay. Votre paiement est en cours de vérification par notre équipe.</p>
        
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📋 Récapitulatif :</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                         <tr>
                            <td style="color: #666;">Pack :</td>
                            <td style="font-weight: bold;">${pack.name}</td>
                         </tr>
                         <tr>
                            <td style="color: #666;">Coins :</td>
                            <td style="font-weight: bold;">${pack.coins + (pack.bonus || 0)} coins</td>
                         </tr>
                         <tr>
                            <td style="color: #666;">Montant :</td>
                            <td style="font-weight: bold;">${convertedAmount} ${currencySymbol}</td>
                         </tr>
                      </table>
        </div>
        
        <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 12px 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e;">⏰ Votre transaction sera traitée dans les prochaines minutes après vérification de la capture d'écran.</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/transactions" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Suivre ma transaction</a>
        </p>
    `;
    return getBaseEmailTemplate('⏳ Paiement Minipay en attente', content);
}

// ✅ Template de confirmation Minipay (admin)
function getMinipayAdminNotificationHtml(user, pack, transaction, proofUrl) {
    const content = `
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">💰 Nouvelle transaction Minipay en attente</h2>
        
        <p><strong>Client :</strong> ${user.username} (${user.email})</p>
        <p><strong>Pack :</strong> ${pack.name}</p>
        <p><strong>Coins :</strong> ${pack.coins + (pack.bonus || 0)} coins</p>
        <p><strong>Montant :</strong> ${transaction.converted_amount} ${transaction.selected_currency}</p>
        <p><strong>Pays :</strong> ${transaction.country || 'Non spécifié'}</p>
        <p><strong>Téléphone :</strong> ${transaction.minipay_phone || 'Non spécifié'}</p>
        <p><strong>ID Transaction :</strong> ${transaction.id}</p>
        
        <div style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/admin" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Traiter la transaction</a>
        </div>
    `;
    return getBaseEmailTemplate('💰 Nouvelle transaction Minipay', content);
}

// =============================================
// FONCTIONS PTERODACTYL (CORRIGÉES)
// =============================================

async function callPterodactylAPI(endpoint, method = 'GET', data = null) {
    try {
        const url = `${PTERODACTYL_CONFIG.url}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_CONFIG.applicationApiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        if (data) options.data = data;

        const response = await axios(url, options);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur Pterodactyl:', error.response?.data || error.message);
        throw error;
    }
}

async function callPterodactylClientAPI(endpoint, method = 'GET', data = null) {
    try {
        const url = `${PTERODACTYL_CONFIG.url}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_CONFIG.clientApiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        if (data) options.data = data;

        const response = await axios(url, options);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur Pterodactyl Client:', error.response?.data || error.message);
        throw error;
    }
}

async function createPterodactylUser(username, email) {
    try {
        const password = generateServerPassword();
        
        let cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (!cleanUsername || cleanUsername.length < 3) {
            cleanUsername = `user_${Date.now().toString().slice(-8)}`;
            console.log(`⚠️ Username invalide, génération automatique: ${cleanUsername}`);
        }
        
        let cleanEmail = `${cleanUsername}@kermhosting.local`;
        
        console.log(`📝 Création utilisateur Pterodactyl avec username: ${cleanUsername}, email: ${cleanEmail}`);
        
        try {
            const searchResult = await callPterodactylAPI(`/api/application/users?filter[email]=${encodeURIComponent(cleanEmail)}`);
            if (searchResult.data && searchResult.data.length > 0) {
                const existingUser = searchResult.data[0];
                console.log(`📝 Utilisateur Pterodactyl existant trouvé: ${existingUser.attributes.username}`);
                
                await callPterodactylAPI(`/api/application/users/${existingUser.attributes.id}`, 'PATCH', {
                    password: password
                });
                
                return {
                    id: existingUser.attributes.id,
                    username: existingUser.attributes.username,
                    email: existingUser.attributes.email,
                    password: password,
                    isExisting: true
                };
            }
        } catch (searchError) {
            console.log('⚠️ Recherche utilisateur existant échouée, création d\'un nouveau...');
        }
        
        const payload = {
            username: cleanUsername,
            email: cleanEmail,
            first_name: cleanUsername.substring(0, 10),
            last_name: 'KermHosting',
            password: password
        };

        const result = await callPterodactylAPI('/api/application/users', 'POST', payload);
        
        return {
            id: result.attributes.id,
            username: result.attributes.username,
            email: result.attributes.email,
            password: password,
            isExisting: false
        };
        
    } catch (error) {
        console.error('❌ Erreur création/récupération utilisateur Pterodactyl:', error);
        
        if (error.response?.data?.errors?.[0]?.detail?.includes('email has already been taken')) {
            try {
                const fallbackEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@kermhosting.local`;
                const searchResult = await callPterodactylAPI(`/api/application/users?filter[email]=${encodeURIComponent(fallbackEmail)}`);
                if (searchResult.data && searchResult.data.length > 0) {
                    const existingUser = searchResult.data[0];
                    const password = generateServerPassword();
                    
                    await callPterodactylAPI(`/api/application/users/${existingUser.attributes.id}`, 'PATCH', {
                        password: password
                    });
                    
                    console.log(`✅ Utilisateur existant récupéré après erreur: ${existingUser.attributes.username}`);
                    
                    return {
                        id: existingUser.attributes.id,
                        username: existingUser.attributes.username,
                        email: existingUser.attributes.email,
                        password: password,
                        isExisting: true
                    };
                }
            } catch (recoverError) {
                console.error('❌ Échec de récupération après erreur:', recoverError);
            }
        }
        
        throw error;
    }
}

async function createPterodactylServer(serverData) {
    try {
        const {
            name,
            userId,
            eggId = 15,
            dockerImage = 'ghcr.io/parkervcp/yolks:nodejs_21',
            memory,
            disk,
            cpu,
            locationId = 1
        } = serverData;

        const startupCommand =
            'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; ' +
            'if [[ ! -z ${NODE_PACKAGES} ]]; then npm install ${NODE_PACKAGES}; fi; ' +
            'if [ -f /home/container/package.json ]; then npm install; fi; ' +
            '/usr/local/bin/node /home/container/{{MAIN_FILE}}';

        const payload = {
            name: name,
            description: "Serveur créé par KermHosting",
            user: parseInt(userId),
            egg: parseInt(eggId),
            docker_image: dockerImage,
            startup: startupCommand,
            environment: {
                INST: "KERMHOSTING",
                USER_UPLOAD: "0",
                AUTO_UPDATE: "0",
                CMD_RUN: "node {{MAIN_FILE}}",
                MAIN_FILE: "index.js",
                NODE_PACKAGES: "",
                STARTUP: startupCommand
            },
            limits: {
                memory: parseInt(memory),
                swap: 0,
                disk: parseInt(disk),
                io: 500,
                cpu: parseInt(cpu)
            },
            feature_limits: {
                databases: 5,
                backups: 5,
                allocations: 1
            },
            allocation: {
                default: 1
            },
            deploy: {
                locations: [parseInt(locationId)],
                dedicated_ip: false,
                port_range: []
            }
        };

        const result = await callPterodactylAPI('/api/application/servers', 'POST', payload);

        return {
            id: result.attributes.id,
            uuid: result.attributes.uuid,
            identifier: result.attributes.identifier,
            name: result.attributes.name,
            node: result.attributes.node,
            sftp_details: result.attributes.sftp_details
        };
    } catch (error) {
        console.error('❌ Erreur création serveur Pterodactyl:', error);
        throw error;
    }
}

async function getServerAllocations(serverId) {
    try {
        const result = await callPterodactylAPI(`/api/application/servers/${serverId}`);
        const allocations = result.attributes.relationships?.allocations?.data || [];
        return allocations.map(a => ({
            ip: a.attributes.ip,
            port: a.attributes.port,
            alias: a.attributes.alias
        }));
    } catch (error) {
        console.error('❌ Erreur récupération allocations:', error);
        return [];
    }
}

async function suspendPterodactylServer(serverId) {
    try {
        if (!serverId) return true;
        await callPterodactylAPI(`/api/application/servers/${serverId}/suspend`, 'POST');
        return true;
    } catch (error) {
        console.error('❌ Erreur suspension serveur:', error);
        return false;
    }
}

async function unsuspendPterodactylServer(serverId) {
    try {
        if (!serverId) return true;
        await callPterodactylAPI(`/api/application/servers/${serverId}/unsuspend`, 'POST');
        return true;
    } catch (error) {
        console.error('❌ Erreur réactivation serveur:', error);
        return false;
    }
}

async function deletePterodactylServer(serverId) {
    try {
        if (!serverId) return true;
        await callPterodactylAPI(`/api/application/servers/${serverId}`, 'DELETE');
        return true;
    } catch (error) {
        if (error.response?.status === 404) return true;
        console.error('❌ Erreur suppression serveur:', error);
        return false;
    }
}

async function getServerResources(serverIdentifier) {
    try {
        const result = await callPterodactylClientAPI(`/api/client/servers/${serverIdentifier}/resources`);
        return {
            state: result.attributes.current_state,
            resources: result.attributes.resources
        };
    } catch (error) {
        console.error('❌ Erreur récupération ressources:', error);
        return null;
    }
}

async function getServersByNode(nodeId) {
    try {
        const allServers = await callPterodactylAPI('/api/application/servers');
        
        const servers = allServers.data.filter(server => {
            if (server.attributes.relationships?.node?.attributes?.id === parseInt(nodeId)) {
                return true;
            }
            if (server.attributes.node === parseInt(nodeId)) {
                return true;
            }
            return false;
        });
        
        return servers;
    } catch (error) {
        console.error('❌ Erreur récupération serveurs par node:', error);
        return [];
    }
}

async function sendServerPowerAction(serverIdentifier, action) {
    try {
        await callPterodactylClientAPI(`/api/client/servers/${serverIdentifier}/power`, 'POST', { signal: action });
        return true;
    } catch (error) {
        console.error('❌ Erreur action power:', error);
        return false;
    }
}

// =============================================
// FONCTIONS FAPSHI
// =============================================

function fapshiError(message, statusCode) {
    return { message, statusCode };
}

async function fapshiDirectPay(data) {
    try {
        console.log('📤 Envoi paiement Direct Pay à Fapshi:', { 
            amount: data.amount, 
            phone: data.phone,
            externalId: data.externalId 
        });

        if (!data?.amount) return { success: false, message: 'Montant requis', statusCode: 400 };
        if (!Number.isInteger(data.amount)) return { success: false, message: 'Le montant doit être un entier', statusCode: 400 };
        if (data.amount < 100) return { success: false, message: 'Le montant minimum est de 100 FCFA', statusCode: 400 };
        if (!data?.phone) return { success: false, message: 'Numéro de téléphone requis', statusCode: 400 };
        if (!/^6[\d]{8}$/.test(data.phone)) return { success: false, message: 'Numéro de téléphone invalide (doit commencer par 6 et avoir 9 chiffres)', statusCode: 400 };

        const config = {
            method: 'post',
            url: `${FAPSHI_CONFIG.baseUrl}/direct-pay`,
            headers: fapshiHeaders,
            data: {
                amount: data.amount,
                phone: data.phone,
                name: data.name || 'Client KermHosting',
                email: data.email,
                userId: data.userId,
                externalId: data.externalId,
                message: data.message || 'Paiement KermHosting'
            }
        };

        const response = await axios(config);
        
        console.log('✅ Réponse Fapshi Direct Pay:', response.data);

        return {
            success: true,
            transId: response.data.transId,
            statusCode: response.status
        };
    } catch (e) {
        console.error('❌ Erreur Fapshi directPay:', {
            status: e.response?.status,
            data: e.response?.data,
            message: e.message
        });
        
        let errorMessage = 'Erreur lors du paiement direct';
        if (e.response?.data?.message) {
            errorMessage = e.response.data.message;
        } else if (e.message) {
            errorMessage = e.message;
        }
        
        return {
            success: false,
            message: errorMessage,
            statusCode: e.response?.status || 500
        };
    }
}

async function fapshiInitiatePay(data) {
    try {
        console.log('📤 Envoi paiement Initiate Pay à Fapshi:', { 
            amount: data.amount, 
            email: data.email,
            externalId: data.externalId 
        });

        if (!data?.amount) return { success: false, message: 'Montant requis', statusCode: 400 };
        if (!Number.isInteger(data.amount)) return { success: false, message: 'Le montant doit être un entier', statusCode: 400 };
        if (data.amount < 100) return { success: false, message: 'Le montant minimum est de 100 FCFA', statusCode: 400 };

        const config = {
            method: 'post',
            url: `${FAPSHI_CONFIG.baseUrl}/initiate-pay`,
            headers: fapshiHeaders,
            data: {
                amount: data.amount,
                email: data.email,
                userId: data.userId,
                externalId: data.externalId,
                redirectUrl: data.redirectUrl || `${SITE_CONFIG.url}/payment-success`,
                message: data.message || 'Paiement KermHosting'
            }
        };

        const response = await axios(config);
        
        console.log('✅ Réponse Fapshi Initiate Pay:', response.data);

        return {
            success: true,
            transId: response.data.transId,
            link: response.data.link,
            statusCode: response.status
        };
    } catch (e) {
        console.error('❌ Erreur Fapshi initiatePay:', e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.message || 'Erreur lors de l\'initialisation du paiement',
            statusCode: e.response?.status || 500
        };
    }
}

async function fapshiPaymentStatus(transId) {
    try {
        if (!transId || typeof transId !== 'string') return { success: false, message: 'ID de transaction invalide', statusCode: 400 };

        const config = {
            method: 'get',
            url: `${FAPSHI_CONFIG.baseUrl}/payment-status/${transId}`,
            headers: fapshiHeaders
        };

        const response = await axios(config);
        
        const data = response.data;
        
        return {
            success: true,
            transId: data.transId || transId,
            status: data.status || 'UNKNOWN',
            medium: data.medium,
            amount: data.amount,
            revenue: data.revenue,
            payerName: data.payerName,
            email: data.email,
            externalId: data.externalId,
            userId: data.userId,
            financialTransId: data.financialTransId,
            dateInitiated: data.dateInitiated,
            dateConfirmed: data.dateConfirmed,
            statusCode: response.status
        };
    } catch (e) {
        console.error('❌ Erreur Fapshi paymentStatus:', e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.message || 'Erreur lors de la vérification du statut',
            statusCode: e.response?.status || 500
        };
    }
}

async function fapshiBalance() {
    try {
        const config = {
            method: 'get',
            url: `${FAPSHI_CONFIG.baseUrl}/balance`,
            headers: fapshiHeaders
        };
        const response = await axios(config);
        return {
            success: true,
            balance: response.data.balance,
            currency: 'XAF',
            statusCode: response.status
        };
    } catch (e) {
        console.error('❌ Erreur Fapshi balance:', e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.message || 'Erreur lors de la vérification du solde',
            statusCode: e.response?.status || 500
        };
    }
}

// =============================================
// MIDDLEWARE AUTH
// =============================================

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token requis', code: 'TOKEN_REQUIRED' });
    }

    try {
        const decoded = jwt.verify(token, SITE_CONFIG.jwtSecret);
        
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(403).json({ success: false, error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
        }

        if (user.banned) {
            return res.status(403).json({ success: false, error: 'Compte suspendu', code: 'ACCOUNT_BANNED' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Token invalide', code: 'INVALID_TOKEN' });
    }
};

const requireEmailVerification = (req, res, next) => {
    if (!req.user.email_verified) {
        return res.status(403).json({ success: false, error: 'Email non vérifié', code: 'EMAIL_NOT_VERIFIED' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Droits admin requis', code: 'ADMIN_REQUIRED' });
    }
    next();
};

const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Droits superadmin requis', 
            code: 'SUPERADMIN_REQUIRED' 
        });
    }
    next();
};

// =============================================
// ROUTES PAYPAL
// =============================================

app.get('/api/currencies', async (req, res) => {
    try {
        const { data: currencies, error } = await supabase
            .from('currencies')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error || !currencies || currencies.length === 0) {
            const fallbackCurrencies = Object.entries(EXCHANGE_RATES).map(([code, rate]) => ({
                code,
                name: getCurrencyName(code),
                symbol: getCurrencySymbol(code),
                rate_to_fcfa: rate,
                is_active: true
            }));
            return res.json({ success: true, currencies: fallbackCurrencies });
        }

        res.json({ success: true, currencies });
    } catch (error) {
        console.error('❌ Erreur récupération devises:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération devises' });
    }
});

app.post('/api/payment/paypal', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { type, plan_id, pack_id, server_name, server_username, paypal_email, paypal_name, currency } = req.body;

        if (!paypal_email || !paypal_email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Email PayPal requis', code: 'PAYPAL_EMAIL_REQUIRED' });
        }

        if (!paypal_name || paypal_name.length < 2) {
            return res.status(400).json({ success: false, error: 'Nom complet requis', code: 'PAYPAL_NAME_REQUIRED' });
        }

        if (!currency || !EXCHANGE_RATES[currency]) {
            return res.status(400).json({ success: false, error: 'Devise invalide', code: 'INVALID_CURRENCY' });
        }

        let amountFcfa = 0;
        let itemName = '';
        let itemDetails = {};
        let transactionType = '';

        if (type === 'server' && plan_id && PLANS[plan_id] && plan_id !== 'free') {
            if (!server_username || server_username.length < 3 || server_username.length > 20) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nom d\'utilisateur invalide (3-20 caractères)', 
                    code: 'INVALID_USERNAME' 
                });
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(server_username)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nom d\'utilisateur invalide. Caractères autorisés: lettres, chiffres et _', 
                    code: 'INVALID_USERNAME' 
                });
            }
            
            if (!server_name || server_name.length < 3 || server_name.length > 30) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nom du serveur invalide (3-30 caractères)', 
                    code: 'INVALID_SERVER_NAME' 
                });
            }
            
            const plan = PLANS[plan_id];
            amountFcfa = plan.price_fcfa;
            itemName = `Serveur ${plan.name}`;
            transactionType = 'server_purchase';
            itemDetails = { plan_id, server_name, server_username, plan };
        } 
        else if (type === 'coins' && pack_id && COIN_PACKS[pack_id]) {
            const pack = COIN_PACKS[pack_id];
            amountFcfa = pack.price_fcfa;
            itemName = `Pack ${pack.name} (${pack.coins + (pack.bonus || 0)} coins)`;
            transactionType = 'coins_purchase';
            itemDetails = { pack_id, pack };
        }
        else {
            return res.status(400).json({ success: false, error: 'Type de transaction invalide', code: 'INVALID_TRANSACTION_TYPE' });
        }

        const convertedAmount = convertFcfaToCurrency(amountFcfa, currency);
        const transactionId = generateTransactionId();

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: transactionType,
                plan_key: plan_id || null,
                pack_id: pack_id || null,
                amount: amountFcfa,
                currency: 'FCFA',
                status: 'pending',
                medium: 'PAYPAL',
                paypal_email: paypal_email,
                paypal_name: paypal_name,
                paypal_currency: currency,
                paypal_amount_converted: convertedAmount,
                metadata: {
                    ...itemDetails,
                    paypal_email,
                    paypal_name,
                    currency,
                    converted_amount: convertedAmount,
                    payment_link: PAYPAL_CONFIG.paypalLink,
                    created_at_cameroon: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction PayPal:', error);
            return res.status(500).json({ success: false, error: 'Erreur création transaction', code: 'TRANSACTION_CREATION_ERROR' });
        }

        const adminEmail = 'bookmakerp@gmail.com';
        const adminHtml = `
            <h2>💰 Nouvelle transaction PayPal en attente</h2>
            <p><strong>Client:</strong> ${paypal_name} (${paypal_email})</p>
            <p><strong>Utilisateur:</strong> ${req.user.username}</p>
            <p><strong>Article:</strong> ${itemName}</p>
            <p><strong>Montant:</strong> ${convertedAmount} ${currency} (${amountFcfa} FCFA)</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
            <p><strong>ID Transaction:</strong> ${transactionId}</p>
            <p>Vérifiez votre compte PayPal et confirmez la transaction dans l'admin.</p>
            <a href="${SITE_CONFIG.url}/admin">Aller dans l'admin</a>
        `;
        await sendEmail(adminEmail, '💰 Nouvelle transaction PayPal en attente', getBaseEmailTemplate('Transaction PayPal', adminHtml));

        res.json({
            success: true,
            message: 'Demande de paiement PayPal créée. Vous allez être redirigé vers PayPal.',
            transaction_id: transactionId,
            paypal_link: PAYPAL_CONFIG.paypalLink,
            amount: convertedAmount,
            currency: currency
        });

    } catch (error) {
        console.error('❌ Erreur création transaction PayPal:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'PAYPAL_ERROR' });
    }
});

app.get('/api/admin/paypal/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (
                    username,
                    email
                )
            `)
            .eq('status', 'pending')
            .not('paypal_email', 'is', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            transactions: transactions || []
        });

    } catch (error) {
        console.error('❌ Erreur récupération transactions PayPal:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/admin/paypal/confirm/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { admin_notes } = req.body;

        console.log('🔍 Recherche transaction PayPal:', transactionId);

        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (*)
            `)
            .eq('id', transactionId)
            .eq('status', 'pending')
            .single();

        if (fetchError || !transaction) {
            console.error('Transaction non trouvée:', fetchError);
            return res.status(404).json({ success: false, error: 'Transaction non trouvée ou déjà traitée' });
        }

        if (!transaction.paypal_email) {
            console.error('Pas une transaction PayPal:', transaction);
            return res.status(400).json({ success: false, error: 'Cette transaction n\'est pas un paiement PayPal' });
        }

        console.log('✅ Transaction PayPal trouvée:', transaction.id);

        await supabase
            .from('transactions')
            .update({
                status: 'successful',
                completed_at: new Date().toISOString(),
                admin_confirmed_by: req.user.id,
                admin_confirmed_at: new Date().toISOString(),
                admin_notes: admin_notes || null
            })
            .eq('id', transactionId);

        await supabase
            .from('paypal_confirmations')
            .insert([{
                transaction_id: transactionId,
                admin_id: req.user.id,
                status: 'confirmed',
                admin_notes: admin_notes || null,
                created_at: new Date().toISOString()
            }]);

        const user = transaction.profiles;

        if (transaction.type === 'coins_purchase') {
            let coinsToAdd = 0;
            if (transaction.pack_id && COIN_PACKS[transaction.pack_id]) {
                const pack = COIN_PACKS[transaction.pack_id];
                coinsToAdd = pack.coins + (pack.bonus || 0);
            } else if (transaction.metadata?.pack) {
                const pack = transaction.metadata.pack;
                coinsToAdd = (pack.coins || 0) + (pack.bonus || 0);
            } else {
                coinsToAdd = Math.floor(transaction.amount / 5);
            }

            if (coinsToAdd > 0) {
                await supabase
                    .from('profiles')
                    .update({ coins: (user.coins || 0) + coinsToAdd })
                    .eq('id', user.id);
            }

            await sendEmail(
                user.email,
                '💰 Achat de coins confirmé (PayPal)',
                getCoinsPurchaseHtml(
                    user.username,
                    { name: transaction.metadata?.pack?.name || 'Pack de coins', price_fcfa: transaction.amount },
                    coinsToAdd,
                    transaction.id
                )
            );

        } else if (transaction.type === 'server_purchase') {
            const plan = transaction.metadata?.plan;
            const server_name = transaction.metadata?.server_name;
            const server_username = transaction.metadata?.server_username;

            if (!plan || !server_name) {
                console.error('❌ Données serveur manquantes:', { plan, server_name });
                return res.status(400).json({ success: false, error: 'Données serveur manquantes' });
            }

            if (!server_username || server_username.length < 3 || server_username.length > 20) {
                console.error('❌ Nom d\'utilisateur invalide:', server_username);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nom d\'utilisateur invalide. Il doit contenir entre 3 et 20 caractères (lettres, chiffres, _)' 
                });
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(server_username)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nom d\'utilisateur invalide. Caractères autorisés: lettres, chiffres et underscore (_)' 
                });
            }

            const { data: existingServer } = await supabase
                .from('servers')
                .select('username')
                .eq('username', server_username)
                .maybeSingle();
            
            if (existingServer) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Ce nom d\'utilisateur est déjà utilisé' 
                });
            }

            try {
                const checkResult = await callPterodactylAPI(`/api/application/users?filter[username]=${encodeURIComponent(server_username.toLowerCase())}`);
                if (checkResult.data && checkResult.data.length > 0) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Ce nom d\'utilisateur est déjà utilisé' 
                    });
                }
            } catch (checkError) {
                console.log('⚠️ Vérification username Pterodactyl ignorée:', checkError.message);
            }

            const pteroEmail = `${server_username.toLowerCase()}@kermhosting.local`;
            
            console.log(`📝 Création serveur PayPal avec username: ${server_username}, email Pterodactyl: ${pteroEmail}`);

            let pteroUser;
            try {
                pteroUser = await createPterodactylUser(server_username, pteroEmail);
            } catch (error) {
                console.error('❌ Erreur création utilisateur Pterodactyl:', error);
                return res.status(500).json({ success: false, error: 'Erreur de création du serveur' });
            }

            const serverIdentifier = `${server_name}-${plan.id}-${Date.now().toString().slice(-4)}`;
            
            const pterodactylServer = await createPterodactylServer({
                name: serverIdentifier,
                userId: pteroUser.id,
                eggId: plan.egg_id,
                dockerImage: plan.docker_image,
                memory: plan.memory,
                disk: plan.disk,
                cpu: plan.cpu
            });

            const allocations = await getServerAllocations(pterodactylServer.id);

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

            const newServer = {
                id: generateUUID(),
                user_id: user.id,
                server_type: plan.id,
                server_name: server_name,
                pterodactyl_id: pterodactylServer.id,
                server_identifier: pterodactylServer.identifier,
                username: pteroUser.username,
                password: pteroUser.password,
                email: pteroUser.email,
                allocations: allocations,
                expires_at: expiresAt.toISOString(),
                status: 'active',
                auto_renew: false,
                auto_renew_attempts: 0,
                created_at: new Date().toISOString()
            };

            await supabase
                .from('servers')
                .insert([newServer]);

            await supabase
                .from('profiles')
                .update({ 
                    current_plan: plan.id,
                    experience: (user.experience || 0) + 10
                })
                .eq('id', user.id);

            await sendEmail(
                user.email,
                '✅ Votre serveur a été créé (PayPal)',
                getPurchaseConfirmationHtml(
                    user.username,
                    plan,
                    {
                        server_name: server_name,
                        username: pteroUser.username,
                        password: pteroUser.password,
                        identifier: pterodactylServer.identifier
                    }
                )
            );
        }

        res.json({
            success: true,
            message: 'Transaction PayPal confirmée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur confirmation transaction PayPal:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/admin/paypal/fail/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { admin_notes } = req.body;

        console.log('🔍 Recherche transaction PayPal à échouer:', transactionId);

        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (*)
            `)
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) {
            console.error('Transaction non trouvée:', fetchError);
            return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
        }

        if (!transaction.paypal_email) {
            return res.status(400).json({ success: false, error: 'Cette transaction n\'est pas un paiement PayPal' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: `Transaction déjà ${transaction.status === 'successful' ? 'confirmée' : 'traitée'}` 
            });
        }

        await supabase
            .from('transactions')
            .update({
                status: 'failed',
                admin_confirmed_by: req.user.id,
                admin_confirmed_at: new Date().toISOString(),
                admin_notes: admin_notes || 'Paiement non reçu'
            })
            .eq('id', transactionId);

        await supabase
            .from('paypal_confirmations')
            .insert([{
                transaction_id: transactionId,
                admin_id: req.user.id,
                status: 'failed',
                admin_notes: admin_notes || 'Paiement non reçu',
                created_at: new Date().toISOString()
            }]);

        const failHtml = `
            <h2>❌ Paiement PayPal échoué</h2>
            <p>Bonjour ${transaction.profiles.username},</p>
            <p>Nous n'avons pas reçu confirmation de votre paiement PayPal pour la transaction suivante :</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                <p><strong>ID Transaction:</strong> ${transaction.id}</p>
                <p><strong>Montant:</strong> ${transaction.paypal_amount_converted} ${transaction.paypal_currency}</p>
                <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <p>Si vous avez effectué le paiement, veuillez contacter le support.</p>
            <a href="${SITE_CONFIG.url}/support">Contacter le support</a>
        `;
        await sendEmail(transaction.profiles.email, '❌ Paiement PayPal échoué', getBaseEmailTemplate('Paiement échoué', failHtml));

        res.json({
            success: true,
            message: 'Transaction PayPal marquée comme échouée'
        });

    } catch (error) {
        console.error('❌ Erreur annulation transaction PayPal:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ROUTES MINIPAY (PAIEMENT MANUEL)
// =============================================

// Récupérer la liste des pays africains pour conversion
app.get('/api/countries', async (req, res) => {
    try {
        res.json({
            success: true,
            countries: AFRICAN_COUNTRIES
        });
    } catch (error) {
        console.error('❌ Erreur récupération pays:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Initier un paiement Minipay
app.post('/api/payment/minipay/initiate', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { pack_id, phone, country_code } = req.body;

        if (!pack_id || !COIN_PACKS[pack_id]) {
            return res.status(400).json({ success: false, error: 'Pack invalide', code: 'INVALID_PACK' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        let cleanPhone = phone.replace(/\s/g, '');
        if (!/^[0-9]{9,12}$/.test(cleanPhone)) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone invalide', code: 'INVALID_PHONE' });
        }

        const pack = COIN_PACKS[pack_id];
        const totalCoins = pack.coins + (pack.bonus || 0);
        
        let selectedCountry = AFRICAN_COUNTRIES.find(c => c.code === country_code);
        if (!selectedCountry) {
            selectedCountry = AFRICAN_COUNTRIES.find(c => c.currency === 'XAF');
        }
        
        const USD_TO_FCFA = 615;
        const amountInUsd = pack.price_fcfa / USD_TO_FCFA;
        
        const conversionRates = {
            'XAF': 615, 'XOF': 615, 'NGN': 1538, 'GHS': 12.5,
            'KES': 135, 'TZS': 2650, 'UGX': 3800, 'RWF': 1350,
            'ZAR': 18.5, 'MAD': 10, 'DZD': 135, 'TND': 3.1,
            'EUR': 0.937, 'GBP': 0.788, 'CAD': 1.366
        };
        
        const rate = conversionRates[selectedCountry.currency] || 615;
        const convertedAmount = Math.round(amountInUsd * rate);
        
        console.log(`💰 Conversion Minipay: ${pack.price_fcfa} FCFA = ${amountInUsd.toFixed(2)} USD = ${convertedAmount} ${selectedCountry.currency}`);
        
        const transactionId = generateTransactionId();

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: 'coins_purchase',
                pack_id: pack_id,
                amount: pack.price_fcfa,
                currency: selectedCountry.currency,
                coins_amount: totalCoins,
                status: 'pending_manual',
                medium: 'MINIPAY',
                minipay_phone: cleanPhone,
                selected_currency: selectedCountry.currency,
                converted_amount: convertedAmount,
                country: selectedCountry.name,
                metadata: { 
                    pack: {
                        name: pack.name,
                        coins: pack.coins,
                        bonus: pack.bonus || 0,
                        price_fcfa: pack.price_fcfa
                    },
                    phone: cleanPhone,
                    pack_id,
                    country_code,
                    country_name: selectedCountry.name,
                    amount_in_usd: amountInUsd,
                    conversion_rate: rate,
                    minipay_number: MINIPAY_CONFIG.phone_number
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction Minipay:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur création transaction',
                code: 'TRANSACTION_CREATION_ERROR' 
            });
        }

        await sendEmail(
            req.user.email,
            '⏳ Paiement Minipay - En attente de confirmation',
            getMinipayPendingHtml(req.user.username, pack, convertedAmount, getCurrencySymbol(selectedCountry.currency))
        );

        const adminHtml = getMinipayAdminNotificationHtml(req.user, pack, transaction, 'capture à uploader');
        await sendEmail(
            'bookmakerp@gmail.com',
            '💰 Nouvelle transaction Minipay en attente',
            adminHtml
        );

        res.json({
            success: true,
            message: 'Demande de paiement Minipay créée. Veuillez uploader la capture d\'écran après avoir effectué le paiement.',
            transaction_id: transactionId,
            minipay_number: MINIPAY_CONFIG.phone_number,
            amount: convertedAmount,
            currency: selectedCountry.currency,
            currency_symbol: getCurrencySymbol(selectedCountry.currency),
            appStoreUrl: MINIPAY_CONFIG.appStoreUrl,
            playStoreUrl: MINIPAY_CONFIG.playStoreUrl,
            instructions: MINIPAY_CONFIG.instructions
        });

    } catch (error) {
        console.error('❌ Erreur initiation Minipay:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur', 
            code: 'MINIPAY_ERROR' 
        });
    }
});

// Upload de la capture d'écran pour une transaction Minipay
app.post('/api/payment/minipay/upload-proof', upload.single('screenshot'), async (req, res) => {
    try {
        const { transaction_id } = req.body;
        
        if (!transaction_id) {
            return res.status(400).json({ success: false, error: 'ID de transaction requis' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Capture d\'écran requise' });
        }

        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('*, profiles!transactions_user_id_fkey(*)')
            .eq('id', transaction_id)
            .eq('medium', 'MINIPAY')
            .single();

        if (fetchError || !transaction) {
            return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
        }

        if (transaction.status !== 'pending_manual') {
            return res.status(400).json({ success: false, error: 'Transaction déjà traitée' });
        }

        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const screenshotData = `data:${mimeType};base64,${base64Image}`;

        await supabase
            .from('transactions')
            .update({
                payment_screenshot: screenshotData,
                status: 'pending_manual_with_proof'
            })
            .eq('id', transaction_id);

        res.json({
            success: true,
            message: 'Capture d\'écran envoyée avec succès. Votre paiement est en attente de confirmation.'
        });

    } catch (error) {
        console.error('❌ Erreur upload preuve Minipay:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Admin - Récupérer les transactions Minipay en attente
app.get('/api/admin/minipay/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (
                    username,
                    email
                )
            `)
            .eq('medium', 'MINIPAY')
            .in('status', ['pending_manual', 'pending_manual_with_proof'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            transactions: transactions || []
        });

    } catch (error) {
        console.error('❌ Erreur récupération transactions Minipay:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Admin - Confirmer une transaction Minipay
app.post('/api/admin/minipay/confirm/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { admin_notes } = req.body;

        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (*)
            `)
            .eq('id', transactionId)
            .eq('medium', 'MINIPAY')
            .single();

        if (fetchError || !transaction) {
            return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
        }

        if (transaction.status !== 'pending_manual_with_proof') {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction non éligible à la confirmation' 
            });
        }

        const user = transaction.profiles;
        let coinsToAdd = 0;
        
        if (transaction.pack_id && COIN_PACKS[transaction.pack_id]) {
            const pack = COIN_PACKS[transaction.pack_id];
            coinsToAdd = pack.coins + (pack.bonus || 0);
        } else if (transaction.metadata?.pack) {
            const pack = transaction.metadata.pack;
            coinsToAdd = (pack.coins || 0) + (pack.bonus || 0);
        } else {
            coinsToAdd = Math.floor(transaction.amount / 5);
        }

        await supabase
            .from('profiles')
            .update({ coins: (user.coins || 0) + coinsToAdd })
            .eq('id', user.id);

        await supabase
            .from('transactions')
            .update({
                status: 'successful',
                completed_at: new Date().toISOString(),
                admin_confirmed_by: req.user.id,
                admin_confirmed_at: new Date().toISOString(),
                admin_notes: admin_notes || null
            })
            .eq('id', transactionId);

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'minipay_confirm',
                target_type: 'transaction',
                target_id: transactionId,
                description: `Confirmation transaction Minipay ${transactionId} pour ${user.username}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        await sendEmail(
            user.email,
            '💰 Achat de coins confirmé (Minipay)',
            getCoinsPurchaseHtml(
                user.username,
                { name: transaction.metadata?.pack?.name || 'Pack de coins' },
                coinsToAdd,
                transaction.id
            )
        );

        res.json({
            success: true,
            message: `Transaction Minipay confirmée. ${coinsToAdd} coins ajoutés à ${user.username}`
        });

    } catch (error) {
        console.error('❌ Erreur confirmation Minipay:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Admin - Échouer une transaction Minipay
app.post('/api/admin/minipay/fail/:transactionId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { admin_notes } = req.body;

        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles!transactions_user_id_fkey (*)
            `)
            .eq('id', transactionId)
            .eq('medium', 'MINIPAY')
            .single();

        if (fetchError || !transaction) {
            return res.status(404).json({ success: false, error: 'Transaction non trouvée' });
        }

        if (transaction.status !== 'pending_manual_with_proof') {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction non éligible à l\'échec' 
            });
        }

        const user = transaction.profiles;

        await supabase
            .from('transactions')
            .update({
                status: 'failed',
                admin_confirmed_by: req.user.id,
                admin_confirmed_at: new Date().toISOString(),
                admin_notes: admin_notes || 'Paiement non vérifié'
            })
            .eq('id', transactionId);

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'minipay_fail',
                target_type: 'transaction',
                target_id: transactionId,
                description: `Échec transaction Minipay ${transactionId} pour ${user.username}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        const failHtml = `
            <h2>❌ Paiement Minipay échoué</h2>
            <p>Bonjour ${user.username},</p>
            <p>Nous n'avons pas pu confirmer votre paiement Minipay pour la transaction suivante :</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                <p><strong>ID Transaction:</strong> ${transaction.id}</p>
                <p><strong>Montant:</strong> ${transaction.converted_amount} ${transaction.selected_currency}</p>
                <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <p>Si vous avez effectué le paiement, veuillez contacter le support.</p>
            <a href="${SITE_CONFIG.url}/support">Contacter le support</a>
        `;
        await sendEmail(user.email, '❌ Paiement Minipay échoué', getBaseEmailTemplate('Paiement échoué', failHtml));

        res.json({
            success: true,
            message: `Transaction Minipay marquée comme échouée`
        });

    } catch (error) {
        console.error('❌ Erreur échec Minipay:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// CRÉATION DU SUPERADMIN PAR DÉFAUT
// =============================================

async function createDefaultSuperAdmin() {
    try {
        const { data: existingAdmin } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'superadmin')
            .maybeSingle();

        if (existingAdmin) {
            console.log('✅ Superadmin existe déjà');
            return;
        }

        const hashedPassword = await bcrypt.hash('AdminKerm2024!', 12);
        const apiKey = generateApiKey();
        const referralCode = generateReferralCode();
        const userId = generateUUID();

        const { error } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                username: 'superadmin',
                email: 'admin@kermhosting.com',
                password_hash: hashedPassword,
                api_key: apiKey,
                coins: 10000,
                role: 'superadmin',
                current_plan: 'admin',
                referral_code: referralCode,
                badges: ['admin-assistant', 'beta-tester', 'premium'],
                email_verified: true,
                admin_expires_at: '2099-12-31 23:59:59',
                admin_access_active: true,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('❌ Erreur création superadmin:', error);
        } else {
            console.log('\n✅ SUPERADMIN CRÉÉ AVEC SUCCÈS');
            console.log('📧 Email: admin@kermhosting.com');
            console.log('🔑 Mot de passe: AdminKerm2024!');
            console.log('💰 Coins: 10000');
            console.log('⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !\n');
        }
    } catch (error) {
        console.error('❌ Erreur création superadmin:', error);
    }
}

// =============================================
// FONCTIONS AUTO-RENOUVELLEMENT
// =============================================

async function processAutoRenew(server) {
    try {
        const plan = PLANS[server.server_type];
        if (!plan) {
            console.error(`❌ Plan inconnu pour le serveur ${server.id}: ${server.server_type}`);
            return false;
        }

        const coinsNeeded = plan.coins_needed;
        
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('coins, username, email')
            .eq('id', server.user_id)
            .single();

        if (userError || !user) {
            console.error(`❌ Utilisateur non trouvé pour le serveur ${server.id}`);
            return false;
        }

        await supabase
            .from('auto_renew_logs')
            .insert([{
                server_id: server.id,
                user_id: server.user_id,
                status: 'attempting',
                coins_required: coinsNeeded,
                coins_available: user.coins,
                created_at: new Date().toISOString()
            }]);

        await supabase
            .from('servers')
            .update({
                last_auto_renew_attempt: new Date().toISOString(),
                auto_renew_attempts: (server.auto_renew_attempts || 0) + 1
            })
            .eq('id', server.id);

        if (user.coins >= coinsNeeded) {
            await supabase
                .from('profiles')
                .update({ coins: user.coins - coinsNeeded })
                .eq('id', server.user_id);

            const currentExpiry = new Date(server.expires_at);
            const now = new Date();
            let newExpiry;
            
            if (currentExpiry < now) {
                newExpiry = new Date();
            } else {
                newExpiry = new Date(currentExpiry);
            }
            newExpiry.setDate(newExpiry.getDate() + plan.duration_days);

            await supabase
                .from('servers')
                .update({
                    expires_at: newExpiry.toISOString(),
                    warning_sent: false,
                    auto_renew_attempts: 0,
                    auto_renew_error: null,
                    status: 'active'
                })
                .eq('id', server.id);

            if (server.status === 'suspended') {
                await unsuspendPterodactylServer(server.pterodactyl_id);
            }

            const transactionId = generateTransactionId();
            await supabase
                .from('transactions')
                .insert([{
                    id: transactionId,
                    user_id: server.user_id,
                    type: 'server_renewal',
                    plan_key: server.server_type,
                    amount: coinsNeeded,
                    currency: 'COINS',
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    is_renewal: true,
                    renewed_server_id: server.id,
                    metadata: { auto_renew: true }
                }]);

            await supabase
                .from('user_activities')
                .insert([{
                    user_id: server.user_id,
                    activity_type: 'auto_renewal_success',
                    coins_earned: -coinsNeeded,
                    description: `Auto-renouvellement du serveur "${server.server_name}" pour ${coinsNeeded} coins`
                }]);

            await supabase
                .from('auto_renew_logs')
                .insert([{
                    server_id: server.id,
                    user_id: server.user_id,
                    status: 'success',
                    coins_required: coinsNeeded,
                    coins_available: user.coins - coinsNeeded,
                    created_at: new Date().toISOString()
                }]);

            const html = `
                <h2 style="color: #333; margin: 0 0 15px 0;">🔄 Auto-renouvellement réussi</h2>
                <p style="color: #555; line-height: 1.6;">Bonjour ${user.username},</p>
                <p style="color: #555; line-height: 1.6;">Votre serveur <strong>"${server.server_name}"</strong> a été automatiquement renouvelé.</p>
                <div style="background-color: #f0f7ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Nouvelle date d'expiration :</strong> ${newExpiry.toLocaleDateString('fr-FR')}</p>
                    <p style="margin: 5px 0;"><strong>💰 Coins déduits :</strong> ${coinsNeeded} coins</p>
                    <p style="margin: 5px 0;"><strong>💳 Solde restant :</strong> ${user.coins - coinsNeeded} coins</p>
                </div>
                <p style="color: #10B981;">L'auto-renouvellement est actif pour ce serveur.</p>
            `;
            await sendEmail(user.email, '🔄 Auto-renouvellement réussi', getBaseEmailTemplate('Auto-renouvellement réussi', html));

            console.log(`✅ Auto-renouvellement réussi pour le serveur ${server.id} (${server.server_name})`);
            return true;

        } else {
            const missingCoins = coinsNeeded - user.coins;
            
            await supabase
                .from('auto_renew_logs')
                .insert([{
                    server_id: server.id,
                    user_id: server.user_id,
                    status: 'failed_insufficient_coins',
                    coins_required: coinsNeeded,
                    coins_available: user.coins,
                    error_message: `Coins insuffisants: besoin de ${coinsNeeded} coins, disponible: ${user.coins} coins`,
                    created_at: new Date().toISOString()
                }]);

            await supabase
                .from('servers')
                .update({
                    auto_renew_error: `Échec auto-renouvellement: coins insuffisants (${missingCoins} coins manquants)`
                })
                .eq('id', server.id);

            await supabase
                .from('user_activities')
                .insert([{
                    user_id: server.user_id,
                    activity_type: 'auto_renewal_failed',
                    coins_earned: 0,
                    description: `Échec auto-renouvellement du serveur "${server.server_name}" : coins insuffisants (besoin: ${coinsNeeded}, disponible: ${user.coins})`
                }]);

            const html = `
                <h2 style="color: #333; margin: 0 0 15px 0;">⚠️ Auto-renouvellement échoué</h2>
                <p style="color: #555; line-height: 1.6;">Bonjour ${user.username},</p>
                <p style="color: #555; line-height: 1.6;">Le serveur <strong>"${server.server_name}"</strong> devait être renouvelé automatiquement, mais vous n'avez pas assez de coins.</p>
                <div style="background-color: #fff9e6; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>💰 Coins nécessaires :</strong> ${coinsNeeded} coins</p>
                    <p style="margin: 5px 0;"><strong>💳 Votre solde :</strong> ${user.coins} coins</p>
                    <p style="margin: 5px 0;"><strong>⚠️ Coins manquants :</strong> ${missingCoins} coins</p>
                </div>
                <p>Pour éviter la suppression de votre serveur, veuillez recharger vos coins.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${SITE_CONFIG.url}/buy-coins" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Acheter des coins</a>
                </div>
            `;
            await sendEmail(user.email, '⚠️ Auto-renouvellement échoué - Coins insuffisants', getBaseEmailTemplate('Auto-renouvellement échoué', html));

            console.log(`❌ Auto-renouvellement échoué pour le serveur ${server.id}: coins insuffisants`);
            return false;
        }

    } catch (error) {
        console.error(`❌ Erreur auto-renouvellement serveur ${server.id}:`, error);
        
        await supabase
            .from('auto_renew_logs')
            .insert([{
                server_id: server.id,
                user_id: server.user_id,
                status: 'failed_other',
                error_message: error.message,
                created_at: new Date().toISOString()
            }]);

        await supabase
            .from('servers')
            .update({
                auto_renew_error: `Erreur: ${error.message}`
            })
            .eq('id', server.id);

        return false;
    }
}

// =============================================
// AJOUT DES COLONNES D'AUTO-RENOUVELLEMENT DANS LA BASE
// =============================================
async function setupAutoRenewTables() {
    try {
        console.log('⚠️ Assurez-vous que les colonnes suivantes existent dans Supabase:');
        console.log('  - servers.auto_renew (boolean)');
        console.log('  - servers.auto_renew_attempts (integer)');
        console.log('  - servers.last_auto_renew_attempt (timestamptz)');
        console.log('  - servers.auto_renew_error (text)');
        console.log('  - servers.warning_sent (boolean)');
        console.log('  - servers.free_notification_sent (boolean)');
        console.log('  - profiles.registration_ip (text)');
        console.log('  - profiles.ban_reason (text)');
        console.log('  - auto_renew_logs (table)');
        console.log('  - mass_email_campaigns (table)');
        
        console.log('✅ Configuration auto-renouvellement vérifiée');
    } catch (error) {
        console.error('❌ Erreur configuration auto-renouvellement:', error);
    }
}

// =============================================
// ROUTES AUTO-RENOUVELLEMENT
// =============================================

app.post('/api/servers/:serverId/auto-renew', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;
        const { enabled } = req.body;

        const { data: server, error } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !server) {
            return res.status(404).json({ 
                success: false, 
                error: 'Serveur non trouvé' 
            });
        }

        if (server.server_type === 'free') {
            return res.status(400).json({ 
                success: false, 
                error: 'Les serveurs gratuits ne peuvent pas être auto-renouvelés' 
            });
        }

        await supabase
            .from('servers')
            .update({ 
                auto_renew: enabled,
                auto_renew_error: enabled ? null : undefined
            })
            .eq('id', serverId);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'auto_renew_toggle',
                description: `${enabled ? 'Activation' : 'Désactivation'} de l'auto-renouvellement pour le serveur "${server.server_name}"`
            }]);

        res.json({ 
            success: true, 
            message: `Auto-renouvellement ${enabled ? 'activé' : 'désactivé'} avec succès` 
        });

    } catch (error) {
        console.error('❌ Erreur auto-renew:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.get('/api/servers/:serverId/auto-renew', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server, error } = await supabase
            .from('servers')
            .select('auto_renew, auto_renew_error, last_auto_renew_attempt, auto_renew_attempts, server_name, expires_at')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !server) {
            return res.status(404).json({ 
                success: false, 
                error: 'Serveur non trouvé' 
            });
        }

        const plan = PLANS[server.server_type];
        const coinsNeeded = plan?.coins_needed || 0;

        res.json({ 
            success: true, 
            auto_renew: server.auto_renew || false,
            auto_renew_error: server.auto_renew_error || null,
            last_attempt: server.last_auto_renew_attempt,
            attempts_count: server.auto_renew_attempts || 0,
            coins_needed: coinsNeeded
        });

    } catch (error) {
        console.error('❌ Erreur récupération auto-renew:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// =============================================
// NOUVEAU CRON JOB PRINCIPAL - TOUTES LES 30 SECONDES
// =============================================
setInterval(async () => {
    console.log(`🔄 Vérification des serveurs - ${new Date().toISOString()}`);
    
    const now = new Date();
    
    // 1. Serveurs gratuits : notification à 12h, suppression à 24h
    const { data: freeServers } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .eq('server_type', 'free')
        .eq('status', 'active');

    for (const server of freeServers || []) {
        const createdAt = new Date(server.created_at);
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
        
        if (hoursSinceCreation >= 12 && !server.free_notification_sent) {
            console.log(`📧 Free server notification: ${server.server_name} (12h)`);
            await sendEmail(
                server.profiles.email,
                '⚠️ Votre serveur gratuit expire dans 12h',
                getFreeServerExpiringHtml(server.profiles.username, server)
            );
            await supabase
                .from('servers')
                .update({ free_notification_sent: true })
                .eq('id', server.id);
        }
        
        if (hoursSinceCreation >= 24) {
            console.log(`🗑️ Suppression serveur free: ${server.server_name}`);
            await deletePterodactylServer(server.pterodactyl_id);
            await supabase.from('servers').delete().eq('id', server.id);
            await sendEmail(
                server.profiles.email,
                '🗑️ Votre serveur gratuit a été supprimé',
                getFreeServerDeletedHtml(server.profiles.username, server)
            );
        }
    }
    
    // 2. Serveurs payants expirés : suspension immédiate
    const { data: expiredServers } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .lt('expires_at', now.toISOString())
        .eq('status', 'active')
        .neq('server_type', 'free');

    for (const server of expiredServers || []) {
        console.log(`🔴 Suspension serveur expiré: ${server.server_name}`);
        await suspendPterodactylServer(server.pterodactyl_id);
        await supabase
            .from('servers')
            .update({ status: 'suspended' })
            .eq('id', server.id);
        await sendEmail(
            server.profiles.email,
            '🔴 Votre serveur a été suspendu',
            getServerSuspendedHtml(server.profiles.username, server)
        );
    }
    
    // 3. Auto-renouvellement (UNIQUEMENT à expiration si auto_renew=true)
    const { data: autoRenewServers } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .eq('auto_renew', true)
        .eq('status', 'suspended')
        .lt('expires_at', now.toISOString())
        .neq('server_type', 'free');

    for (const server of autoRenewServers || []) {
        console.log(`🔄 Tentative auto-renouvellement: ${server.server_name}`);
        await processAutoRenew(server);
    }
    
    // 4. Suppression définitive après 3 jours (serveurs suspendus)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data: serversToDelete } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .eq('status', 'suspended')
        .lt('expires_at', threeDaysAgo.toISOString())
        .neq('server_type', 'free');

    for (const server of serversToDelete || []) {
        console.log(`🗑️ Suppression définitive: ${server.server_name}`);
        await deletePterodactylServer(server.pterodactyl_id);
        await supabase.from('servers').delete().eq('id', server.id);
        await sendEmail(
            server.profiles.email,
            '🗑️ Votre serveur a été supprimé définitivement',
            getServerDeletedHtml(server.profiles.username, server)
        );
    }
    
    // 5. Notification J-3 pour serveurs actifs
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const { data: expiringSoon } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .lte('expires_at', threeDaysFromNow.toISOString())
        .gt('expires_at', now.toISOString())
        .eq('warning_sent', false)
        .eq('status', 'active')
        .neq('server_type', 'free');

    for (const server of expiringSoon || []) {
        const daysLeft = Math.ceil((new Date(server.expires_at) - now) / (1000 * 60 * 60 * 24));
        console.log(`📧 Envoi notification J-${daysLeft}: ${server.server_name}`);
        await sendEmail(
            server.profiles.email,
            '⚠️ Votre serveur expire bientôt',
            getServerExpiringHtml(server.profiles.username, server, daysLeft)
        );
        await supabase
            .from('servers')
            .update({ warning_sent: true })
            .eq('id', server.id);
    }
    
}, 30000);

// =============================================
// ROUTES AUTH (MODIFIÉES POUR COINS)
// =============================================

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, referral_code } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'Tous les champs sont requis', code: 'MISSING_FIELDS' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Mot de passe trop court', code: 'PASSWORD_TOO_SHORT' });
        }

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email ou nom déjà utilisé', code: 'DUPLICATE_USER' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const apiKey = generateApiKey();
        const userReferralCode = generateReferralCode();
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        let referrerId = null;
        let referrerName = null;

        if (referral_code) {
            const { data: referrer } = await supabase
                .from('profiles')
                .select('id, username, email')
                .eq('referral_code', referral_code)
                .maybeSingle();

            if (referrer) {
                referrerId = referrer.id;
                referrerName = referrer.username;
            }
        }

        const { data: newUser, error } = await supabase
            .from('profiles')
            .insert([{
                username,
                email,
                password_hash: hashedPassword,
                api_key: apiKey,
                referral_code: userReferralCode,
                referred_by: referrerId,
                email_verification_code: verificationCode,
                email_verification_code_expires: expiresAt.toISOString(),
                registration_ip: clientIp,
                coins: 5,
                badges: []
            }])
            .select()
            .single();

        if (error) {
            return res.status(500).json({ success: false, error: 'Erreur création compte', code: 'REGISTER_ERROR' });
        }

        const banned = await checkAndBanMultiAccounts(clientIp, newUser.id, email, username);
        if (banned) {
            return res.status(403).json({ 
                success: false, 
                error: 'Compte banni pour multi-comptes. Contactez le support.',
                code: 'MULTI_ACCOUNT_BANNED'
            });
        }

        await sendEmail(
            email,
            '🔐 Code de vérification KermHosting',
            getVerificationEmailHtml(username, verificationCode)
        );

        if (referrerId) {
            const { data: referrerData } = await supabase
                .from('profiles')
                .select('coins')
                .eq('id', referrerId)
                .single();
            
            if (referrerData) {
                await supabase
                    .from('profiles')
                    .update({ coins: referrerData.coins + 10 })
                    .eq('id', referrerId);
            }

            await supabase
                .from('profiles')
                .update({ coins: 5 })
                .eq('id', newUser.id);

            await supabase
                .from('referrals')
                .insert([{
                    referrer_id: referrerId,
                    referred_id: newUser.id,
                    coins_rewarded: 10
                }]);

            const { data: referrerEmail } = await supabase
                .from('profiles')
                .select('email, referral_code')
                .eq('id', referrerId)
                .single();
            
            if (referrerEmail) {
                const referrerLink = `${SITE_CONFIG.url}/register?ref=${referrerEmail.referral_code}`;
                await sendEmail(
                    referrerEmail.email,
                    '🎁 Nouveau filleul sur KermHosting',
                    getReferralNotificationHtml(referrerName, username, referrerLink)
                );
            }

            const userLink = `${SITE_CONFIG.url}/register?ref=${newUser.referral_code}`;
            await sendEmail(
                email,
                '🎁 Bienvenue sur KermHosting',
                getReferralWelcomeHtml(username, referrerName, userLink)
            );
        }

        res.json({ 
            success: true, 
            message: 'Compte créé! Vérifiez votre email.', 
            requiresVerification: true 
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

app.post('/api/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Email et code requis', code: 'MISSING_FIELDS' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
        }

        if (user.email_verified) {
            return res.status(400).json({ success: false, error: 'Email déjà vérifié', code: 'ALREADY_VERIFIED' });
        }

        if (new Date() > new Date(user.email_verification_code_expires)) {
            return res.status(400).json({ success: false, error: 'Code expiré', code: 'CODE_EXPIRED' });
        }

        if (user.email_verification_code !== code) {
            return res.status(400).json({ success: false, error: 'Code incorrect', code: 'INVALID_CODE' });
        }

        await supabase
            .from('profiles')
            .update({
                email_verified: true,
                email_verification_code: null,
                email_verification_code_expires: null,
                coins: (user.coins || 0) + 5
            })
            .eq('id', user.id);

        await sendEmail(
            email,
            '🎉 Bienvenue sur KermHosting',
            getWelcomeEmailHtml(user.username)
        );

        res.json({ 
            success: true, 
            message: 'Email vérifié!', 
            coinsBonus: 5 
        });

    } catch (error) {
        console.error('❌ Erreur vérification:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email requis' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        if (user.email_verified) {
            return res.status(400).json({ success: false, error: 'Email déjà vérifié' });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        await supabase
            .from('profiles')
            .update({
                email_verification_code: verificationCode,
                email_verification_code_expires: expiresAt.toISOString()
            })
            .eq('id', user.id);

        await sendEmail(
            email,
            '🔐 Nouveau code de vérification KermHosting',
            getVerificationEmailHtml(user.username, verificationCode)
        );

        res.json({ 
            success: true, 
            message: 'Nouveau code envoyé avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur renvoi code:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email/Nom d\'utilisateur et mot de passe requis', 
                code: 'MISSING_FIELDS' 
            });
        }

        let { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.eq.${identifier},username.eq.${identifier}`)
            .maybeSingle();

        if (error || !user) {
            return res.status(400).json({ 
                success: false, 
                error: 'Identifiant ou mot de passe incorrect', 
                code: 'INVALID_CREDENTIALS' 
            });
        }

        if (user.banned) {
            return res.status(403).json({ 
                success: false, 
                error: 'Compte suspendu', 
                code: 'ACCOUNT_BANNED' 
            });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Identifiant ou mot de passe incorrect', 
                code: 'INVALID_CREDENTIALS' 
            });
        }

        if (!user.email_verified) {
            return res.status(403).json({ 
                success: false, 
                error: 'Email non vérifié', 
                requiresVerification: true, 
                code: 'EMAIL_NOT_VERIFIED' 
            });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            SITE_CONFIG.jwtSecret,
            { expiresIn: '3d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                apiKey: user.api_key,
                coins: user.coins,
                role: user.role,
                current_plan: user.current_plan,
                referral_code: user.referral_code,
                daily_login_streak: user.daily_login_streak || 0,
                total_login_days: user.total_login_days || 0,
                badges: user.badges,
                email_verified: user.email_verified,
                free_panel_created: user.free_panel_created
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur', 
            code: 'INTERNAL_ERROR' 
        });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email requis', code: 'EMAIL_REQUIRED' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('id, username, email')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) {
            return res.json({ 
                success: true, 
                message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.' 
            });
        }

        const resetCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        await supabase
            .from('profiles')
            .update({
                reset_password_code: resetCode,
                reset_password_code_expires: expiresAt.toISOString()
            })
            .eq('id', user.id);

        await sendEmail(
            email,
            '🔑 Réinitialisation de mot de passe KermHosting',
            getResetEmailHtml(user.username, resetCode)
        );

        res.json({ 
            success: true, 
            message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.' 
        });

    } catch (error) {
        console.error('❌ Erreur forgot password:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, code et nouveau mot de passe requis', 
                code: 'MISSING_FIELDS' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le mot de passe doit contenir au moins 6 caractères', 
                code: 'PASSWORD_TOO_SHORT' 
            });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
        }

        if (new Date() > new Date(user.reset_password_code_expires)) {
            return res.status(400).json({ success: false, error: 'Code expiré', code: 'CODE_EXPIRED' });
        }

        if (user.reset_password_code !== code) {
            return res.status(400).json({ success: false, error: 'Code incorrect', code: 'INVALID_CODE' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await supabase
            .from('profiles')
            .update({
                password_hash: hashedPassword,
                reset_password_code: null,
                reset_password_code_expires: null
            })
            .eq('id', user.id);

        res.json({ 
            success: true, 
            message: 'Mot de passe réinitialisé avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur reset password:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe actuel et nouveau mot de passe requis', 
                code: 'MISSING_FIELDS' 
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le nouveau mot de passe doit contenir au moins 6 caractères', 
                code: 'PASSWORD_TOO_SHORT' 
            });
        }

        const validPassword = await bcrypt.compare(current_password, req.user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe actuel incorrect', 
                code: 'INVALID_PASSWORD' 
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await supabase
            .from('profiles')
            .update({
                password_hash: hashedPassword
            })
            .eq('id', req.user.id);

        res.json({ 
            success: true, 
            message: 'Mot de passe changé avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur change password:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

// =============================================
// ROUTES DE PAIEMENT FAPSHI
// =============================================

app.post('/api/payment/direct-server', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { plan_id, phone, server_name, server_username } = req.body;

        if (!plan_id || !PLANS[plan_id] || plan_id === 'free') {
            return res.status(400).json({ success: false, error: 'Plan invalide', code: 'INVALID_PLAN' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        if (!/^6[\d]{8}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro de téléphone invalide. Utilisez un numéro à 9 chiffres commençant par 6.', 
                code: 'INVALID_PHONE' 
            });
        }

        const plan = PLANS[plan_id];
        const transactionId = crypto.randomUUID();

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: 'server_purchase',
                plan_key: plan_id,
                amount: plan.price_fcfa,
                currency: 'FCFA',
                status: 'pending',
                metadata: { 
                    plan, 
                    phone,
                    server_name,
                    server_username 
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur création transaction',
                code: 'TRANSACTION_CREATION_ERROR' 
            });
        }

        const payment = await fapshiDirectPay({
            amount: plan.price_fcfa,
            phone: phone,
            name: req.user.username,
            email: req.user.email,
            userId: req.user.id,
            externalId: transactionId,
            message: `Serveur ${plan.name} - ${req.user.username}`
        });

        if (!payment.success) {
            await supabase
                .from('transactions')
                .update({ 
                    status: 'failed',
                    metadata: { 
                        ...transaction.metadata, 
                        error: payment.message 
                    }
                })
                .eq('id', transactionId);

            return res.status(400).json({
                success: false,
                error: payment.message || 'Erreur lors du paiement.',
                code: 'FAPSHI_ERROR'
            });
        }

        await supabase
            .from('transactions')
            .update({
                fapshi_transaction_id: payment.transId
            })
            .eq('id', transactionId);

        res.json({
            success: true,
            message: 'Demande de paiement envoyée. Veuillez confirmer la transaction sur votre téléphone.',
            transaction_id: transactionId,
            transId: payment.transId
        });

    } catch (error) {
        console.error('❌ Erreur paiement direct:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur.', 
            code: 'PAYMENT_ERROR' 
        });
    }
});

app.post('/api/payment/buy-coins', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { pack_id, phone } = req.body;

        if (!pack_id || !COIN_PACKS[pack_id]) {
            return res.status(400).json({ success: false, error: 'Pack invalide', code: 'INVALID_PACK' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        if (!/^6[\d]{8}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro de téléphone invalide.', 
                code: 'INVALID_PHONE' 
            });
        }

        const pack = COIN_PACKS[pack_id];
        const totalCoins = pack.coins + (pack.bonus || 0);
        const transactionId = crypto.randomUUID();

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: 'coins_purchase',
                pack_id: pack_id,
                amount: pack.price_fcfa,
                currency: 'FCFA',
                coins_amount: totalCoins,
                status: 'pending',
                metadata: { 
                    pack: {
                        name: pack.name,
                        coins: pack.coins,
                        bonus: pack.bonus || 0,
                        price: pack.price_fcfa
                    },
                    phone,
                    pack_id
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur création transaction',
                code: 'TRANSACTION_CREATION_ERROR' 
            });
        }

        const payment = await fapshiDirectPay({
            amount: pack.price_fcfa,
            phone: phone,
            name: req.user.username,
            email: req.user.email,
            userId: req.user.id,
            externalId: transactionId,
            message: `Achat ${totalCoins} coins - ${req.user.username}`
        });

        if (!payment.success) {
            await supabase
                .from('transactions')
                .update({ 
                    status: 'failed',
                    metadata: { 
                        ...transaction.metadata, 
                        error: payment.message 
                    }
                })
                .eq('id', transactionId);

            return res.status(400).json({
                success: false,
                error: payment.message || 'Erreur lors du paiement',
                code: 'FAPSHI_ERROR'
            });
        }

        await supabase
            .from('transactions')
            .update({
                fapshi_transaction_id: payment.transId
            })
            .eq('id', transactionId);

        res.json({
            success: true,
            message: 'Demande de paiement envoyée. Confirmez sur votre téléphone.',
            transaction_id: transactionId,
            transId: payment.transId,
            coins: totalCoins
        });

    } catch (error) {
        console.error('❌ Erreur achat coins:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur', 
            code: 'PAYMENT_ERROR' 
        });
    }
});

app.get('/api/payment/status/:transId', async (req, res) => {
    try {
        const { transId } = req.params;
        
        if (!transId) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID de transaction requis' 
            });
        }

        console.log(`🔍 Vérification statut transaction: ${transId}`);
        
        const status = await fapshiPaymentStatus(transId);

        if (!status.success) {
            return res.status(400).json({ 
                success: false, 
                error: status.message 
            });
        }

        const { data: transaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('fapshi_transaction_id', transId)
            .single();

        if (transaction && transaction.status === 'pending' && status.status === 'SUCCESSFUL') {
            console.log('💰 Paiement détecté comme réussi !');
            
            await supabase
                .from('transactions')
                .update({
                    status: 'successful',
                    completed_at: new Date().toISOString()
                })
                .eq('id', transaction.id);
            
            const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', transaction.user_id)
                .single();
            
            if (user && transaction.type === 'coins_purchase') {
                let coinsToAdd = transaction.coins_amount || 0;
                
                if (coinsToAdd === 0 && transaction.metadata?.pack) {
                    const pack = transaction.metadata.pack;
                    coinsToAdd = (pack.coins || 0) + (pack.bonus || 0);
                }
                
                if (coinsToAdd > 0) {
                    await supabase
                        .from('profiles')
                        .update({ coins: (user.coins || 0) + coinsToAdd })
                        .eq('id', user.id);
                    
                    console.log(`✅ ${coinsToAdd} coins crédités à ${user.username}`);
                    
                    await sendEmail(
                        user.email,
                        '💰 Achat de coins confirmé',
                        getCoinsPurchaseHtml(
                            user.username, 
                            { name: transaction.metadata?.pack?.name || 'Pack de coins' }, 
                            coinsToAdd,
                            transaction.id
                        )
                    );
                }
            }
        }

        res.json({
            success: true,
            status: status.status,
            data: status
        });

    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.post('/api/fapshi-webhook', express.json(), async (req, res) => {
    try {
        const { transId } = req.body;
        
        console.log('📥 Webhook Fapshi reçu:', { transId, body: req.body });

        if (!transId) {
            return res.status(400).json({ message: 'transId requis' });
        }

        const event = await fapshiPaymentStatus(transId);

        if (event.statusCode !== 200) {
            return res.status(400).json({ message: event.message });
        }

        let { data: transaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('fapshi_transaction_id', transId)
            .single();

        if (error || !transaction) {
            const { data: txByExternal } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', transId)
                .maybeSingle();
            
            if (txByExternal) {
                transaction = txByExternal;
                await supabase
                    .from('transactions')
                    .update({ fapshi_transaction_id: transId })
                    .eq('id', txByExternal.id);
            } else {
                return res.status(404).json({ message: 'Transaction non trouvée' });
            }
        }

        if (transaction.status === event.status.toLowerCase()) {
            return res.json({ received: true });
        }

        await supabase
            .from('transactions')
            .update({
                status: event.status.toLowerCase(),
                completed_at: event.status === 'SUCCESSFUL' ? new Date().toISOString() : null,
                fapshi_response: event
            })
            .eq('id', transaction.id);

        if (event.status === 'SUCCESSFUL') {
            if (transaction.type === 'coins_purchase') {
                const { data: user, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', transaction.user_id)
                    .single();

                if (userError || !user) {
                    console.error('❌ Utilisateur non trouvé:', transaction.user_id);
                } else {
                    let coinsToAdd = 0;
                    
                    if (transaction.coins_amount && transaction.coins_amount > 0) {
                        coinsToAdd = transaction.coins_amount;
                    } else if (transaction.pack_id && COIN_PACKS[transaction.pack_id]) {
                        const pack = COIN_PACKS[transaction.pack_id];
                        coinsToAdd = pack.coins + (pack.bonus || 0);
                    } else if (transaction.metadata?.pack) {
                        const pack = transaction.metadata.pack;
                        coinsToAdd = (pack.coins || 0) + (pack.bonus || 0);
                    } else if (transaction.amount) {
                        coinsToAdd = Math.floor(transaction.amount / 5);
                    }

                    if (coinsToAdd > 0) {
                        const oldBalance = user.coins || 0;
                        const newBalance = oldBalance + coinsToAdd;
                        
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update({ coins: newBalance })
                            .eq('id', user.id);

                        if (!updateError) {
                            console.log(`✅ ${coinsToAdd} coins crédités à ${user.username}`);
                            
                            await supabase
                                .from('transactions')
                                .update({ 
                                    coins_amount: coinsToAdd,
                                    metadata: {
                                        ...transaction.metadata,
                                        credited_at: new Date().toISOString(),
                                        credited_coins: coinsToAdd
                                    }
                                })
                                .eq('id', transaction.id);

                            await sendEmail(
                                user.email,
                                '💰 Achat de coins confirmé',
                                getCoinsPurchaseHtml(
                                    user.username, 
                                    { name: transaction.metadata?.pack?.name || 'Pack de coins' }, 
                                    coinsToAdd,
                                    transaction.id
                                )
                            );
                        }
                    }
                }
            }
        }

        res.json({ received: true });

    } catch (error) {
        console.error('❌ ERREUR WEBHOOK:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// =============================================
// ROUTES UTILISATEUR
// =============================================

app.get('/api/user/me', authenticateToken, async (req, res) => {
    try {
        const { data: servers } = await supabase
            .from('servers')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            user: req.user,
            servers: servers || [],
            transactions: transactions || []
        });

    } catch (error) {
        console.error('❌ Erreur user/me:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

app.get('/api/user/activities', authenticateToken, async (req, res) => {
    try {
        const { data: activities, error } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        res.json({ success: true, activities: activities || [] });
    } catch (error) {
        console.error('❌ Erreur récupération activités:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération activités' });
    }
});

app.delete('/api/user/activities', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('user_activities')
            .delete()
            .eq('user_id', req.user.id);

        if (error) throw error;

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'activities_cleared',
                description: 'Historique des activités effacé',
                coins_earned: 0
            }]);

        res.json({ 
            success: true, 
            message: 'Toutes les activités ont été supprimées' 
        });

    } catch (error) {
        console.error('❌ Erreur suppression activités:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la suppression des activités' 
        });
    }
});

app.post('/api/user/regenerate-api-key', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const newApiKey = generateApiKey();

        await supabase
            .from('profiles')
            .update({ api_key: newApiKey })
            .eq('id', req.user.id);

        res.json({
            success: true,
            message: 'Clé API régénérée avec succès',
            new_api_key: newApiKey
        });

    } catch (error) {
        console.error('❌ Erreur régénération API key:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

// =============================================
// ROUTES DE GESTION DU PROFIL
// =============================================

app.post('/api/user/update-username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nom d\'utilisateur requis' 
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' 
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores' 
            });
        }

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ce nom d\'utilisateur est déjà utilisé' 
            });
        }

        const { error } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', req.user.id);

        if (error) throw error;

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'profile_update',
                description: 'Changement de nom d\'utilisateur'
            }]);

        res.json({ 
            success: true, 
            message: 'Nom d\'utilisateur mis à jour avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur update username:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.post('/api/user/request-email-change', authenticateToken, async (req, res) => {
    try {
        const { new_email } = req.body;

        if (!new_email || !new_email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email invalide' 
            });
        }

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', new_email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cet email est déjà utilisé' 
            });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        await supabase
            .from('profiles')
            .update({ 
                metadata: { 
                    ...req.user.metadata,
                    pending_email: new_email,
                    pending_email_code: verificationCode,
                    pending_email_expires: expiresAt.toISOString()
                }
            })
            .eq('id', req.user.id);

        await sendEmail(
            new_email,
            '🔐 Code de vérification pour votre nouvel email',
            getVerificationEmailHtml(req.user.username, verificationCode)
        );

        res.json({ 
            success: true, 
            message: 'Code de vérification envoyé à votre nouvelle adresse email' 
        });

    } catch (error) {
        console.error('❌ Erreur request email change:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.post('/api/user/confirm-email-change', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Code requis' 
            });
        }

        const pendingEmail = req.user.metadata?.pending_email;
        const pendingCode = req.user.metadata?.pending_email_code;
        const pendingExpires = req.user.metadata?.pending_email_expires;

        if (!pendingEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'Aucune demande de changement d\'email en cours' 
            });
        }

        if (pendingCode !== code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Code incorrect' 
            });
        }

        if (new Date() > new Date(pendingExpires)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Code expiré' 
            });
        }

        const oldEmail = req.user.email;

        const { error } = await supabase
            .from('profiles')
            .update({ 
                email: pendingEmail,
                metadata: {
                    ...req.user.metadata,
                    pending_email: null,
                    pending_email_code: null,
                    pending_email_expires: null
                }
            })
            .eq('id', req.user.id);

        if (error) throw error;

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'profile_update',
                description: `Changement d'email de ${oldEmail} vers ${pendingEmail}`
            }]);

        await sendEmail(
            oldEmail,
            '📧 Votre email a été modifié',
            getEmailChangedConfirmationHtml(req.user.username, pendingEmail)
        );

        await sendEmail(
            pendingEmail,
            '🎉 Bienvenue sur votre nouvelle adresse',
            getWelcomeEmailHtml(req.user.username)
        );

        res.json({ 
            success: true, 
            message: 'Email mis à jour avec succès. Veuillez vous reconnecter avec votre nouvelle adresse.' 
        });

    } catch (error) {
        console.error('❌ Erreur confirm email change:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.post('/api/user/delete-account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe requis' 
            });
        }

        const validPassword = await bcrypt.compare(password, req.user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe incorrect' 
            });
        }

        const { data: servers } = await supabase
            .from('servers')
            .select('pterodactyl_id')
            .eq('user_id', req.user.id);

        for (const server of servers || []) {
            if (server.pterodactyl_id) {
                await deletePterodactylServer(server.pterodactyl_id);
            }
        }

        const username = req.user.username;
        const email = req.user.email;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', req.user.id);

        if (error) throw error;

        await sendEmail(
            email,
            '🗑️ Compte supprimé',
            getAccountDeletedHtml(username)
        );

        res.json({ 
            success: true, 
            message: 'Compte supprimé avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur delete account:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// /api/dashboard - Un seul appel pour tout
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const [user, servers, activities] = await Promise.all([
            pool.query('SELECT id, username, email, role, coins, level, daily_login_streak, last_daily_login, free_panel_created FROM profiles WHERE id = $1', [req.user.id]),
            pool.query('SELECT * FROM servers WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]),
            pool.query('SELECT * FROM user_activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [req.user.id])
        ]);
        
        res.json({
            success: true,
            user: user.rows[0],
            servers: servers.rows,
            activities: activities.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ENDPOINTS AVATAR (POSTGRESQL)
// =============================================

// ===== GET /api/user/avatar - Récupérer l'avatar =====
app.get('/api/user/avatar', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT avatar FROM profiles WHERE id = $1',
            [req.user.id]
        );
        
        const user = result.rows[0];
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Utilisateur non trouvé' 
            });
        }
        
        res.json({ 
            success: true, 
            avatar: user.avatar || null 
        });
    } catch (error) {
        console.error('Erreur GET avatar:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// ===== POST /api/user/avatar - Mettre à jour l'avatar =====
app.post('/api/user/avatar', authenticateToken, async (req, res) => {
    try {
        const { avatar } = req.body;
        
        // Vérifier si l'avatar est fourni
        if (!avatar) {
            return res.status(400).json({ 
                success: false, 
                error: 'Aucune image fournie' 
            });
        }
        
        // Vérifier que c'est bien une image base64
        if (!avatar.startsWith('data:image/')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Format d\'image invalide. Utilisez data:image/...' 
            });
        }
        
        // Vérifier le type MIME
        const mimeMatch = avatar.match(/^data:(image\/\w+);base64,/);
        if (!mimeMatch) {
            return res.status(400).json({ 
                success: false, 
                error: 'Format base64 invalide' 
            });
        }
        
        const mimeType = mimeMatch[1];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(mimeType)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Format non supporté. Utilisez JPG, PNG, GIF ou WEBP' 
            });
        }
        
        // Calculer la taille approximative en base64 (caractères * 0.75 = octets)
        const base64Data = avatar.split(',')[1];
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        // Limite à 5 Mo
        const MAX_SIZE_MB = 5;
        if (sizeInMB > MAX_SIZE_MB) {
            return res.status(400).json({ 
                success: false, 
                error: `Image trop volumineuse (${sizeInMB.toFixed(2)} Mo). Maximum ${MAX_SIZE_MB} Mo` 
            });
        }
        
        // Optionnel : Redimensionner l'image si elle est trop grande
        let finalAvatar = avatar;
        if (sizeInMB > 2) {
            // Pour les images > 2 Mo, on pourrait les redimensionner côté serveur
            // avec sharp ou jimp, mais pour l'instant on accepte jusqu'à 5 Mo
            console.log(`Avatar de ${sizeInMB.toFixed(2)} Mo accepté pour l'utilisateur ${req.user.id}`);
        }
        
        // Mettre à jour la base de données
        await pool.query(
            'UPDATE profiles SET avatar = $1, updated_at = NOW() WHERE id = $2',
            [avatar, req.user.id]
        );
        
        // Enregistrer l'activité
        await pool.query(
            `INSERT INTO user_activities (user_id, activity_type, description, metadata) 
             VALUES ($1, $2, $3, $4)`,
            [
                req.user.id,
                'avatar_update',
                'Photo de profil mise à jour',
                JSON.stringify({ size_mb: sizeInMB.toFixed(2), mime_type: mimeType })
            ]
        );
        
        res.json({ 
            success: true, 
            message: 'Avatar mis à jour avec succès',
            size_mb: sizeInMB.toFixed(2),
            mime_type: mimeType
        });
        
    } catch (error) {
        console.error('Erreur POST avatar:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de la mise à jour' 
        });
    }
});

// ===== DELETE /api/user/avatar - Supprimer l'avatar =====
app.delete('/api/user/avatar', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE profiles SET avatar = NULL, updated_at = NOW() WHERE id = $1 RETURNING avatar',
            [req.user.id]
        );
        
        const oldAvatar = result.rows[0]?.avatar;
        
        // Enregistrer l'activité
        await pool.query(
            `INSERT INTO user_activities (user_id, activity_type, description) 
             VALUES ($1, $2, $3)`,
            [req.user.id, 'avatar_delete', 'Photo de profil supprimée']
        );
        
        res.json({ 
            success: true, 
            message: 'Avatar supprimé avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur DELETE avatar:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de la suppression' 
        });
    }
});

// ===== POST /api/connection-history - Enregistrer une connexion =====
app.post('/api/connection-history', authenticateToken, async (req, res) => {
    try {
        const { device, browser, os } = req.body;
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   req.connection.remoteAddress;
        
        await pool.query(
            `INSERT INTO connection_history (user_id, ip_address, user_agent, device_type, browser, os) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.id, ip, req.headers['user-agent'], device, browser, os]
        );
        
        // Garder seulement les 20 dernières connexions
        await pool.query(`
            DELETE FROM connection_history 
            WHERE user_id = $1 AND id NOT IN (
                SELECT id FROM connection_history 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 20
            )
        `, [req.user.id]);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Erreur historique connexion:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// ===== GET /api/connection-history - Récupérer l'historique =====
app.get('/api/connection-history', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ip_address, user_agent, device_type, browser, os, created_at 
             FROM connection_history 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [req.user.id]
        );
        
        // Masquer partiellement les IP pour la sécurité
        const history = result.rows.map(conn => ({
            ...conn,
            ip_address: conn.ip_address ? 
                conn.ip_address.split('.').slice(0, 2).join('.') + '.***.***' : 
                'Inconnue'
        }));
        
        res.json({ 
            success: true, 
            history 
        });
        
    } catch (error) {
        console.error('Erreur GET historique:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// POST /api/user/logout-all
app.post('/api/user/logout-all', authenticateToken, async (req, res) => {
    try {
        const newApiKey = 'KERM_' + require('crypto').randomBytes(32).toString('hex');
        await pool.query('UPDATE profiles SET api_key = $1 WHERE id = $2', [newApiKey, req.user.id]);
        res.json({ success: true, message: 'Toutes les sessions déconnectées' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// ===== GET /api/user/export - Exporter toutes les données =====
app.get('/api/user/export', authenticateToken, async (req, res) => {
    try {
        // Récupérer l'utilisateur
        const userResult = await pool.query(
            `SELECT id, username, email, role, coins, level, daily_login_streak, 
                    account_created, created_at, avatar, free_panel_created, badges,
                    experience, total_login_days, last_login, email_verified
             FROM profiles WHERE id = $1`,
            [req.user.id]
        );
        const user = userResult.rows[0];
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Utilisateur non trouvé' 
            });
        }
        
        // Récupérer les serveurs
        const serversResult = await pool.query(
            `SELECT id, server_type, server_name, status, expires_at, 
                    created_at, updated_at, limits, feature_limits
             FROM servers WHERE user_id = $1`,
            [req.user.id]
        );
        
        // Récupérer les transactions
        const transactionsResult = await pool.query(
            `SELECT id, type, plan_key, amount, currency, coins_amount, status, 
                    completed_at, created_at
             FROM transactions WHERE user_id = $1`,
            [req.user.id]
        );
        
        // Récupérer les filleuls (parrainage)
        const referralsResult = await pool.query(
            `SELECT u.username, r.created_at, r.coins_rewarded 
             FROM referrals r 
             JOIN profiles u ON r.referred_id = u.id 
             WHERE r.referrer_id = $1`,
            [req.user.id]
        );
        
        // Récupérer l'historique des connexions
        const connectionsResult = await pool.query(
            `SELECT device_type, browser, os, created_at 
             FROM connection_history 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user.id]
        );
        
        // Récupérer les activités
        const activitiesResult = await pool.query(
            `SELECT activity_type, description, coins_earned, created_at 
             FROM user_activities 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user.id]
        );
        
        // Récupérer les récompenses quotidiennes
        const rewardsResult = await pool.query(
            `SELECT reward_date, coins_earned, streak_count 
             FROM daily_rewards 
             WHERE user_id = $1 
             ORDER BY reward_date DESC`,
            [req.user.id]
        );
        
        const exportData = {
            export_date: new Date().toISOString(),
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                coins: user.coins,
                level: user.level,
                experience: user.experience,
                daily_login_streak: user.daily_login_streak,
                total_login_days: user.total_login_days,
                account_created: user.account_created,
                last_login: user.last_login,
                email_verified: user.email_verified,
                badges: user.badges,
                free_panel_created: user.free_panel_created,
                has_avatar: !!user.avatar
            },
            servers: serversResult.rows,
            transactions: transactionsResult.rows,
            referrals: referralsResult.rows,
            connection_history: connectionsResult.rows,
            activities: activitiesResult.rows,
            daily_rewards: rewardsResult.rows
        };
        
        // Enregistrer l'activité d'export
        await pool.query(
            `INSERT INTO user_activities (user_id, activity_type, description) 
             VALUES ($1, $2, $3)`,
            [req.user.id, 'data_export', 'Export des données personnelles']
        );
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 
            `attachment; filename=kermhosting-export-${user.username}-${new Date().toISOString().split('T')[0]}.json`
        );
        res.json(exportData);
        
    } catch (error) {
        console.error('Erreur export:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de l\'export' 
        });
    }
});

// ===== MODIFICATION DE L'ENDPOINT /api/user/me =====
// Ajouter l'avatar dans la réponse
app.get('/api/user/me', authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT id, username, email, role, coins, level, daily_login_streak, 
                    account_created, created_at, api_key, avatar, free_panel_created,
                    experience, total_login_days, badges, email_verified,
                    last_daily_login, banned
             FROM profiles WHERE id = $1`,
            [req.user.id]
        );
        const user = userResult.rows[0];
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Utilisateur non trouvé' 
            });
        }
        
        // Récupérer les serveurs
        const serversResult = await pool.query(
            `SELECT id, server_type, server_name, pterodactyl_id, server_identifier,
                    username, email, expires_at, status, limits, feature_limits,
                    auto_backup, last_backup, created_at, updated_at
             FROM servers 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user.id]
        );
        
        // Récupérer les dernières transactions
        const transactionsResult = await pool.query(
            `SELECT id, type, plan_key, amount, currency, coins_amount, status, 
                    completed_at, created_at
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 20`,
            [req.user.id]
        );
        
        // Calculer les badges à partir du JSONB
        let badges = [];
        try {
            badges = user.badges || [];
        } catch (e) {
            badges = [];
        }
        
        res.json({ 
            success: true, 
            user: {
                ...user,
                badges: badges
            }, 
            servers: serversResult.rows,
            transactions: transactionsResult.rows
        });
        
    } catch (error) {
        console.error('Erreur /me:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// =============================================
// ROUTES SERVEURS
// =============================================

app.get('/api/servers', authenticateToken, async (req, res) => {
    try {
        const { data: servers } = await supabase
            .from('servers')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        res.json({ success: true, servers: servers || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur récupération', code: 'SERVERS_FETCH_ERROR' });
    }
});

app.get('/api/servers/:serverId', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;
        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (!server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé', code: 'SERVER_NOT_FOUND' });
        }

        const resources = await getServerResources(server.server_identifier);
        
        res.json({ 
            success: true, 
            server,
            resources: resources
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur récupération', code: 'SERVER_FETCH_ERROR' });
    }
});

app.get('/api/servers/:serverId/credentials', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server, error } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé' });
        }

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'credentials_view',
                description: `Consultation des identifiants du serveur ${server.server_name}`
            }]);

        res.json({
            success: true,
            credentials: {
                username: server.username,
                password: server.password,
                panel_url: PTERODACTYL_CONFIG.url,
                server_id: server.pterodactyl_id,
                identifier: server.server_identifier
            }
        });

    } catch (error) {
        console.error('❌ Erreur récupération identifiants:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/create-server', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { plan_id, server_name, server_username, transaction_id, payment_method } = req.body;

        if (!plan_id || !server_name || !server_username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Plan, nom du serveur et nom d\'utilisateur requis', 
                code: 'MISSING_FIELDS' 
            });
        }

        if (!PLANS[plan_id]) {
            return res.status(400).json({ success: false, error: 'Plan invalide', code: 'INVALID_PLAN' });
        }

        if (server_name.length < 3 || server_name.length > 30) {
            return res.status(400).json({ success: false, error: 'Nom du serveur invalide', code: 'INVALID_NAME' });
        }

        const usernameValidation = validateUsername(server_username);
        if (!usernameValidation.valid) {
            return res.status(400).json({ 
                success: false, 
                error: usernameValidation.reason, 
                code: 'INVALID_USERNAME' 
            });
        }

        const plan = PLANS[plan_id];

        if (plan_id !== 'free') {
            if (payment_method === 'coins') {
                if (req.user.coins < plan.coins_needed) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Coins insuffisants', 
                        code: 'INSUFFICIENT_COINS' 
                    });
                }
            } else {
                if (!transaction_id) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'ID de transaction requis', 
                        code: 'TRANSACTION_REQUIRED' 
                    });
                }

                const { data: transaction } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('id', transaction_id)
                    .eq('user_id', req.user.id)
                    .eq('status', 'successful')
                    .single();

                if (!transaction) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Transaction invalide ou non confirmée', 
                        code: 'INVALID_TRANSACTION' 
                    });
                }
            }
        } else {
            if (req.user.free_panel_created) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Serveur gratuit déjà utilisé', 
                    code: 'FREE_USED' 
                });
            }
        }

        const pteroEmail = req.user.email;
        const pteroUser = await createPterodactylUser(server_username, pteroEmail);

        const serverIdentifier = `${server_name}-${plan_id}-${Date.now().toString().slice(-4)}`;
        
        const pterodactylServer = await createPterodactylServer({
            name: serverIdentifier,
            userId: pteroUser.id,
            eggId: plan.egg_id,
            dockerImage: plan.docker_image,
            memory: plan.memory,
            disk: plan.disk,
            cpu: plan.cpu
        });

        const allocations = await getServerAllocations(pterodactylServer.id);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

        const newServer = {
            id: generateUUID(),
            user_id: req.user.id,
            server_type: plan_id,
            server_name: server_name,
            pterodactyl_id: pterodactylServer.id,
            server_identifier: pterodactylServer.identifier,
            username: pteroUser.username,
            password: pteroUser.password,
            email: pteroUser.email,
            allocations: allocations,
            expires_at: expiresAt.toISOString(),
            status: 'active',
            auto_renew: false,
            auto_renew_attempts: 0,
            created_at: new Date().toISOString()
        };

        const { data: savedServer } = await supabase
            .from('servers')
            .insert([newServer])
            .select()
            .single();

        await supabase
            .from('profiles')
            .update({ 
                current_plan: plan_id,
                experience: (req.user.experience || 0) + 10
            })
            .eq('id', req.user.id);

        if (plan_id === 'free') {
            await supabase
                .from('profiles')
                .update({ free_panel_created: true })
                .eq('id', req.user.id);
        } else if (payment_method === 'coins') {
            await supabase
                .from('profiles')
                .update({ coins: req.user.coins - plan.coins_needed })
                .eq('id', req.user.id);

            await supabase
                .from('transactions')
                .insert([{
                    id: generateTransactionId(),
                    user_id: req.user.id,
                    type: 'server_purchase',
                    plan_key: plan_id,
                    amount: plan.coins_needed,
                    currency: 'COINS',
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }]);
        }

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'server_creation',
                coins_earned: payment_method === 'coins' ? -plan.coins_needed : 0,
                description: `Création du serveur "${server_name}" (plan ${plan.name})`
            }]);

        await sendEmail(
            req.user.email,
            '✅ Votre serveur a été créé',
            getPurchaseConfirmationHtml(
                req.user.username, 
                plan, 
                {
                    server_name: server_name,
                    username: pteroUser.username,
                    password: pteroUser.password,
                    identifier: pterodactylServer.identifier
                }
            )
        );

        res.json({ 
            success: true, 
            message: 'Serveur créé avec succès',
            server: savedServer,
            credentials: {
                username: pteroUser.username,
                password: pteroUser.password,
                panel_url: PTERODACTYL_CONFIG.url,
                identifier: pterodactylServer.identifier
            }
        });

    } catch (error) {
        console.error('❌ Erreur création serveur:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur création serveur: ' + error.message,
            code: 'SERVER_CREATION_ERROR' 
        });
    }
});

app.post('/api/servers/:serverId/power', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { serverId } = req.params;
        const { action } = req.body;

        if (!['start', 'stop', 'restart', 'kill'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Action invalide', code: 'INVALID_ACTION' });
        }

        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (!server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé', code: 'SERVER_NOT_FOUND' });
        }

        const success = await sendServerPowerAction(server.server_identifier, action);

        if (!success) {
            return res.status(500).json({ success: false, error: 'Erreur lors de l\'action', code: 'POWER_ACTION_ERROR' });
        }

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: `server_${action}`,
                description: `${action === 'start' ? 'Démarrage' : action === 'stop' ? 'Arrêt' : 'Redémarrage'} du serveur "${server.server_name}"`
            }]);

        res.json({ success: true, message: `Action ${action} effectuée` });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message, code: 'POWER_ACTION_ERROR' });
    }
});

app.get('/api/servers/:serverId/resources', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (!server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé', code: 'SERVER_NOT_FOUND' });
        }

        const resources = await getServerResources(server.server_identifier);

        res.json({ 
            success: true, 
            resources: resources 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message, code: 'RESOURCES_FETCH_ERROR' });
    }
});

app.post('/api/servers/:serverId/renew', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { serverId } = req.params;
        const { coins } = req.body;

        if (!coins || coins < 1) {
            return res.status(400).json({ 
                success: false, 
                error: 'Montant de coins invalide', 
                code: 'INVALID_COINS' 
            });
        }

        const { data: server, error } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !server) {
            return res.status(404).json({ 
                success: false, 
                error: 'Serveur non trouvé', 
                code: 'SERVER_NOT_FOUND' 
            });
        }

        if (req.user.coins < coins) {
            return res.status(400).json({ 
                success: false, 
                error: 'Coins insuffisants', 
                code: 'INSUFFICIENT_COINS' 
            });
        }

        const plan = PLANS[server.server_type];
        if (!plan) {
            return res.status(400).json({ 
                success: false, 
                error: 'Plan invalide', 
                code: 'INVALID_PLAN' 
            });
        }

        const currentExpiry = new Date(server.expires_at);
        const now = new Date();
        
        let newExpiry;
        if (currentExpiry < now) {
            newExpiry = new Date();
        } else {
            newExpiry = new Date(currentExpiry);
        }
        newExpiry.setDate(newExpiry.getDate() + plan.duration_days);

        await supabase
            .from('profiles')
            .update({ coins: req.user.coins - coins })
            .eq('id', req.user.id);

        await supabase
            .from('servers')
            .update({ 
                expires_at: newExpiry.toISOString(),
                warning_sent: false,
                status: 'active'
            })
            .eq('id', serverId);

        if (server.status === 'suspended') {
            await unsuspendPterodactylServer(server.pterodactyl_id);
        }

        const transactionId = generateTransactionId();
        await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: 'server_renewal',
                plan_key: server.server_type,
                amount: coins,
                currency: 'COINS',
                status: 'completed',
                completed_at: new Date().toISOString(),
                metadata: { 
                    server_id: serverId,
                    server_name: server.server_name,
                    previous_expiry: server.expires_at,
                    new_expiry: newExpiry.toISOString()
                }
            }]);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'server_renewal',
                coins_earned: -coins,
                description: `Renouvellement du serveur "${server.server_name}" pour ${coins} coins`
            }]);

        await sendEmail(
            req.user.email,
            '✅ Serveur renouvelé avec succès',
            getRenewalConfirmationHtml(req.user.username, server, newExpiry, coins)
        );

        res.json({
            success: true,
            message: 'Serveur renouvelé avec succès',
            new_expiry: newExpiry.toISOString(),
            coins_deducted: coins,
            remaining_coins: req.user.coins - coins
        });

    } catch (error) {
        console.error('❌ Erreur renouvellement:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors du renouvellement', 
            code: 'RENEWAL_ERROR' 
        });
    }
});

// =============================================
// ROUTES PARRAINAGE
// =============================================

app.get('/api/referral/info', authenticateToken, async (req, res) => {
    try {
        const { data: referrals } = await supabase
            .from('referrals')
            .select('*, referred:referred_id(username, created_at)')
            .eq('referrer_id', req.user.id)
            .order('created_at', { ascending: false });

        const referralUrl = `${SITE_CONFIG.url}/register?ref=${req.user.referral_code}`;

        res.json({
            success: true,
            referral_code: req.user.referral_code,
            referral_url: referralUrl,
            referral_count: referrals?.length || 0,
            total_coins_earned: referrals?.reduce((sum, r) => sum + r.coins_rewarded, 0) || 0,
            referrals: referrals || []
        });

    } catch (error) {
        console.error('❌ Erreur récupération parrainage:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération' });
    }
});

// =============================================
// ROUTES RÉCOMPENSE QUOTIDIENNE (MODIFIÉE: 1 coin)
// =============================================

app.post('/api/daily-reward', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toDateString();

        if (req.user.last_daily_login === today) {
            return res.status(400).json({ 
                success: false, 
                error: 'Récompense déjà réclamée aujourd\'hui', 
                code: 'DAILY_REWARD_ALREADY_CLAIMED' 
            });
        }

        const coinsReward = 1;
        let streakCount = 1;

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (req.user.last_daily_login === yesterday) {
            streakCount = (req.user.daily_login_streak || 0) + 1;
        }

        await supabase
            .from('profiles')
            .update({
                daily_login_streak: streakCount,
                last_daily_login: today,
                total_login_days: (req.user.total_login_days || 0) + 1,
                coins: (req.user.coins || 0) + coinsReward
            })
            .eq('id', req.user.id);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'daily_login',
                coins_earned: coinsReward,
                description: `Récompense quotidienne - 1 coin (série: ${streakCount} jours)`
            }]);

        res.json({
            success: true,
            message: `Félicitations ! Vous avez gagné ${coinsReward} coin (série: ${streakCount} jours)`,
            coins: coinsReward,
            streak: streakCount
        });

    } catch (error) {
        console.error('❌ Erreur récompense quotidienne:', error);
        res.status(500).json({ success: false, error: 'Erreur récompense' });
    }
});

// =============================================
// ROUTES INFORMATIONS
// =============================================

app.get('/api/plans', (req, res) => {
    res.json({ success: true, plans: PLANS });
});

app.get('/api/coin-packs', (req, res) => {
    res.json({ success: true, packs: COIN_PACKS });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'KermHosting opérationnel',
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        payment: 'Fapshi Live + PayPal + Minipay',
        features: {
            payments: 'FCFA',
            mobile_money: true,
            pterodactyl: true,
            referrals: true,
            daily_rewards: true,
            auto_renew: true,
            paypal: true,
            minipay: true
        }
    });
});

// =============================================
// ROUTES PTERODACTYL - STATS & NODES
// =============================================

app.get('/api/pterodactyl/nodes', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const nodes = await callPterodactylAPI('/api/application/nodes');
        res.json({ success: true, nodes: nodes.data || [] });
    } catch (error) {
        console.error('❌ Erreur récupération nodes:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération nodes' });
    }
});

app.get('/api/pterodactyl/nodes/:nodeId/servers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { nodeId } = req.params;
        
        try {
            const nodeServers = await callPterodactylAPI(`/api/application/nodes/${nodeId}/servers`);
            return res.json({ success: true, servers: nodeServers.data || [] });
        } catch (specificError) {
            console.log('⚠️ Endpoint spécifique non disponible, utilisation du filtrage manuel');
            const servers = await getServersByNode(nodeId);
            return res.json({ success: true, servers });
        }
    } catch (error) {
        console.error('❌ Erreur récupération serveurs du node:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération serveurs' });
    }
});

app.get('/api/pterodactyl/servers/:identifier/resources', authenticateToken, async (req, res) => {
    try {
        const { identifier } = req.params;
        
        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('server_identifier', identifier)
            .eq('user_id', req.user.id)
            .single();

        if (!server && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }

        const resources = await getServerResources(identifier);
        
        if (!resources) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé' });
        }

        res.json({ 
            success: true, 
            resources: resources,
            server: server || null
        });
    } catch (error) {
        console.error('❌ Erreur récupération ressources serveur:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération ressources' });
    }
});

app.get('/api/pterodactyl/servers/:serverId/allocations', authenticateToken, async (req, res) => {
    try {
        const { serverId } = req.params;
        
        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('pterodactyl_id', parseInt(serverId))
            .eq('user_id', req.user.id)
            .single();

        if (!server && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }

        const allocations = await getServerAllocations(serverId);
        res.json({ success: true, allocations });
    } catch (error) {
        console.error('❌ Erreur récupérations allocations:', error);
        res.status(500).json({ success: false, error: 'Erreur récupérations allocations' });
    }
});

// =============================================
// ROUTES ADMIN
// =============================================

app.get('/api/admin/check', authenticateToken, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
        res.json({ 
            success: true, 
            isAdmin, 
            role: req.user.role 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur vérification' });
    }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select(`
                *,
                servers:servers(count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erreur SQL users:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedUsers = users.map(user => ({
            ...user,
            servers_count: user.servers?.[0]?.count || 0
        }));

        res.json({ success: true, users: formattedUsers || [] });
    } catch (error) {
        console.error('❌ Erreur récupération users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/servers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: servers, error } = await supabase
            .from('servers')
            .select(`
                *,
                profiles:user_id (
                    username,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erreur SQL servers:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedServers = servers.map(server => ({
            ...server,
            owner_username: server.profiles?.username,
            owner_email: server.profiles?.email
        }));

        res.json({ success: true, servers: formattedServers || [] });
    } catch (error) {
        console.error('❌ Erreur récupération serveurs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/transactions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles:user_id (
                    username,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erreur SQL transactions:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedTransactions = transactions.map(t => ({
            ...t,
            user_username: t.profiles?.username
        }));

        res.json({ success: true, transactions: formattedTransactions || [] });
    } catch (error) {
        console.error('❌ Erreur récupération transactions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('admin_actions')
            .select(`
                *,
                profiles:admin_id (
                    username
                )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Erreur SQL logs:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedLogs = logs.map(log => ({
            ...log,
            admin_username: log.profiles?.username
        }));

        res.json({ success: true, logs: formattedLogs || [] });
    } catch (error) {
        console.error('❌ Erreur récupération logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: verifiedUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('email_verified', true);

        const { count: bannedUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('banned', true);

        const { count: totalServers } = await supabase
            .from('servers')
            .select('*', { count: 'exact', head: true });

        const { count: activeServers } = await supabase
            .from('servers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        const { count: suspendedServers } = await supabase
            .from('servers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'suspended');

        const { data: allUsers } = await supabase
            .from('profiles')
            .select('coins');

        const totalCoins = allUsers?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

        res.json({
            success: true,
            stats: {
                total_users: totalUsers || 0,
                verified_users: verifiedUsers || 0,
                banned_users: bannedUsers || 0,
                total_servers: totalServers || 0,
                active_servers: activeServers || 0,
                suspended_servers: suspendedServers || 0,
                total_coins: totalCoins
            }
        });

    } catch (error) {
        console.error('❌ Erreur stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/financial-stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('💰 Récupération des stats financières...');

        const { data: revenueData, error: revenueError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('currency', 'FCFA')
            .eq('status', 'successful');

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        const { data: monthlyData, error: monthlyError } = await supabase
            .from('transactions')
            .select('amount, created_at')
            .eq('currency', 'FCFA')
            .eq('status', 'successful')
            .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        if (monthlyError) throw monthlyError;

        const monthlyRevenue = {};
        monthlyData?.forEach(t => {
            const month = new Date(t.created_at).toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (t.amount || 0);
        });

        const { data: typeData, error: typeError } = await supabase
            .from('transactions')
            .select('type, amount')
            .eq('currency', 'FCFA')
            .eq('status', 'successful');

        if (typeError) throw typeError;

        const revenueByType = {
            coins_purchase: 0,
            server_purchase: 0,
            server_renewal: 0
        };

        typeData?.forEach(t => {
            if (revenueByType[t.type] !== undefined) {
                revenueByType[t.type] += t.amount || 0;
            }
        });

        const { data: topBuyers, error: topError } = await supabase
            .from('transactions')
            .select(`
                amount,
                user_id,
                profiles:user_id (
                    username,
                    email
                )
            `)
            .eq('currency', 'FCFA')
            .eq('status', 'successful')
            .order('amount', { ascending: false });

        if (topError) throw topError;

        const buyerMap = new Map();
        topBuyers?.forEach(t => {
            const userId = t.user_id;
            if (!buyerMap.has(userId)) {
                buyerMap.set(userId, {
                    user_id: userId,
                    username: t.profiles?.username || 'Inconnu',
                    email: t.profiles?.email || '',
                    total: 0,
                    count: 0
                });
            }
            const buyer = buyerMap.get(userId);
            buyer.total += t.amount || 0;
            buyer.count++;
        });

        const topBuyersList = Array.from(buyerMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todayData, error: todayError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('currency', 'FCFA')
            .eq('status', 'successful')
            .gte('created_at', today.toISOString());

        if (todayError) throw todayError;

        const todayRevenue = todayData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        const { count: totalTransactions, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('currency', 'FCFA')
            .eq('status', 'successful');

        if (countError) throw countError;

        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        res.json({
            success: true,
            financial: {
                total_revenue: totalRevenue,
                today_revenue: todayRevenue,
                total_transactions: totalTransactions || 0,
                avg_transaction: Math.round(avgTransaction),
                by_type: revenueByType,
                monthly: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
                top_buyers: topBuyersList
            }
        });

    } catch (error) {
        console.error('❌ Erreur stats financières:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur récupération des stats financières' 
        });
    }
});

app.get('/api/admin/fapshi/balance', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const balance = await fapshiBalance();
        
        if (balance.success) {
            res.json({
                success: true,
                balance: balance.balance,
                currency: balance.currency || 'XAF'
            });
        } else {
            res.status(500).json({
                success: false,
                error: balance.message || 'Erreur lors de la récupération du solde Fapshi'
            });
        }
    } catch (error) {
        console.error('❌ Erreur récupération solde Fapshi:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

// =============================================
// NOUVELLE ROUTE ADMIN - NETTOYAGE DES UTILISATEURS PTERODACTYL ORPHELINS
// =============================================
app.post('/api/admin/pterodactyl/cleanup-users', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        console.log('🧹 Début du nettoyage des utilisateurs Pterodactyl orphelins...');
        
        const { data: kermUsers, error: usersError } = await supabase
            .from('profiles')
            .select('pterodactyl_user_id, username, email');
        
        if (usersError) throw usersError;
        
        const linkedPteroIds = new Set(
            kermUsers
                .filter(u => u.pterodactyl_user_id)
                .map(u => u.pterodactyl_user_id.toString())
        );
        
        console.log(`📊 Utilisateurs KermHosting avec lien Pterodactyl: ${linkedPteroIds.size}`);
        
        let allPteroUsers = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            try {
                const response = await callPterodactylAPI(`/api/application/users?page=${page}`);
                
                if (response.data && response.data.length > 0) {
                    allPteroUsers = [...allPteroUsers, ...response.data];
                    page++;
                    
                    if (response.meta?.pagination?.total_pages && page > response.meta.pagination.total_pages) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.error('❌ Erreur récupération page Pterodactyl:', error);
                hasMore = false;
            }
        }
        
        console.log(`📊 Total utilisateurs Pterodactyl trouvés: ${allPteroUsers.length}`);
        
        let stats = {
            total_ptero_users: allPteroUsers.length,
            linked_users: 0,
            orphan_with_servers: 0,
            orphan_without_servers: 0,
            deleted_users: 0,
            failed_deletions: 0,
            details: []
        };
        
        for (const pteroUser of allPteroUsers) {
            const pteroId = pteroUser.attributes.id.toString();
            const pteroUsername = pteroUser.attributes.username;
            const pteroEmail = pteroUser.attributes.email;
            
            if (linkedPteroIds.has(pteroId)) {
                stats.linked_users++;
                stats.details.push({
                    id: pteroId,
                    username: pteroUsername,
                    email: pteroEmail,
                    status: 'linked',
                    action: 'conservé (lié à KermHosting)'
                });
                continue;
            }
            
            try {
                const serversResponse = await callPterodactylAPI(`/api/application/users/${pteroId}`);
                const servers = serversResponse.attributes.relationships?.servers?.data || [];
                
                if (servers.length > 0) {
                    stats.orphan_with_servers++;
                    stats.details.push({
                        id: pteroId,
                        username: pteroUsername,
                        email: pteroEmail,
                        servers_count: servers.length,
                        status: 'orphan_with_servers',
                        action: 'conservé (a des serveurs)'
                    });
                } else {
                    stats.orphan_without_servers++;
                    
                    try {
                        await callPterodactylAPI(`/api/application/users/${pteroId}`, 'DELETE');
                        stats.deleted_users++;
                        stats.details.push({
                            id: pteroId,
                            username: pteroUsername,
                            email: pteroEmail,
                            status: 'deleted',
                            action: 'supprimé'
                        });
                        console.log(`✅ Utilisateur Pterodactyl supprimé: ${pteroUsername} (ID: ${pteroId})`);
                    } catch (deleteError) {
                        stats.failed_deletions++;
                        stats.details.push({
                            id: pteroId,
                            username: pteroUsername,
                            email: pteroEmail,
                            status: 'delete_failed',
                            error: deleteError.message,
                            action: 'échec suppression'
                        });
                        console.error(`❌ Échec suppression utilisateur ${pteroUsername}:`, deleteError.message);
                    }
                }
            } catch (serverError) {
                console.error(`❌ Erreur vérification serveurs pour ${pteroUsername}:`, serverError.message);
                stats.details.push({
                    id: pteroId,
                    username: pteroUsername,
                    email: pteroEmail,
                    status: 'check_failed',
                    error: serverError.message,
                    action: 'non traité'
                });
            }
        }
        
        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'pterodactyl_cleanup',
                target_type: 'system',
                description: `Nettoyage utilisateurs Pterodactyl: ${stats.deleted_users}/${stats.orphan_without_servers} supprimés`,
                metadata: stats,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);
        
        console.log('✅ Nettoyage terminé avec succès');
        
        res.json({
            success: true,
            message: `Nettoyage terminé: ${stats.deleted_users} utilisateurs supprimés sur ${stats.orphan_without_servers} orphelins`,
            stats: {
                total_ptero_users: stats.total_ptero_users,
                linked_users: stats.linked_users,
                orphan_with_servers: stats.orphan_with_servers,
                orphan_without_servers: stats.orphan_without_servers,
                deleted_users: stats.deleted_users,
                failed_deletions: stats.failed_deletions,
                success_rate: stats.orphan_without_servers > 0 
                    ? Math.round((stats.deleted_users / stats.orphan_without_servers) * 100) 
                    : 100
            },
            details: stats.details.slice(0, 50)
        });
        
    } catch (error) {
        console.error('❌ Erreur nettoyage utilisateurs Pterodactyl:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors du nettoyage: ' + error.message 
        });
    }
});

app.post('/api/admin/users/:userId/ban', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { banned } = req.body;

        if (userId === req.user.id) {
            return res.status(400).json({ success: false, error: 'Action impossible sur vous-même' });
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', userId)
            .single();

        await supabase
            .from('profiles')
            .update({ banned })
            .eq('id', userId);

        if (banned && user) {
            await sendEmail(
                user.email,
                '🔒 Votre compte KermHosting a été suspendu',
                getAccountSuspendedHtml(user.username, 'Non-respect des conditions d\'utilisation')
            );
        }

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: banned ? 'user_ban' : 'user_unban',
                target_type: 'user',
                target_id: userId,
                description: `${banned ? 'Bannissement' : 'Débannissement'} de ${user?.username || userId}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: banned ? 'Utilisateur banni' : 'Utilisateur débanni' });
    } catch (error) {
        console.error('❌ Erreur ban:', error);
        res.status(500).json({ success: false, error: 'Erreur bannissement' });
    }
});

app.post('/api/admin/users/:userId/coins', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ success: false, error: 'Montant invalide' });
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('coins, username')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        await supabase
            .from('profiles')
            .update({ coins: (user.coins || 0) + amount })
            .eq('id', userId);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: userId,
                activity_type: 'admin_coins_add',
                coins_earned: amount,
                description: `Ajout de ${amount} coins par admin`
            }]);

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'coins_add',
                target_type: 'user',
                target_id: userId,
                description: `Ajout de ${amount} coins à ${user.username}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: `${amount} coins ajoutés avec succès` });
    } catch (error) {
        console.error('❌ Erreur ajout coins:', error);
        res.status(500).json({ success: false, error: 'Erreur ajout coins' });
    }
});

app.post('/api/admin/users/:userId/coins/remove', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ success: false, error: 'Montant invalide' });
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('coins, username')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        if (user.coins < amount) {
            return res.status(400).json({ success: false, error: 'Solde insuffisant' });
        }

        await supabase
            .from('profiles')
            .update({ coins: user.coins - amount })
            .eq('id', userId);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: userId,
                activity_type: 'admin_coins_remove',
                coins_earned: -amount,
                description: `Retrait de ${amount} coins par admin`
            }]);

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'coins_remove',
                target_type: 'user',
                target_id: userId,
                description: `Retrait de ${amount} coins à ${user.username}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: `${amount} coins retirés avec succès` });
    } catch (error) {
        console.error('❌ Erreur retrait coins:', error);
        res.status(500).json({ success: false, error: 'Erreur retrait coins' });
    }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user.id) {
            return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' });
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', userId)
            .single();

        const { data: servers } = await supabase
            .from('servers')
            .select('pterodactyl_id')
            .eq('user_id', userId);

        for (const server of servers || []) {
            if (server.pterodactyl_id) {
                await deletePterodactylServer(server.pterodactyl_id);
            }
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        if (user) {
            await sendEmail(
                user.email,
                '🗑️ Votre compte KermHosting a été supprimé',
                getAccountDeletedHtml(user.username)
            );
        }

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'user_delete',
                target_type: 'user',
                target_id: userId,
                description: `Suppression de l'utilisateur ${user?.username || userId}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        res.status(500).json({ success: false, error: 'Erreur suppression utilisateur' });
    }
});

app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, email_verified, banned } = req.body;

        const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        if (userId === req.user.id && role && role !== req.user.role && role !== 'superadmin') {
            return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous rétrograder vous-même' });
        }

        const updates = {};
        if (role !== undefined) updates.role = role;
        if (email_verified !== undefined) updates.email_verified = email_verified;
        if (banned !== undefined) updates.banned = banned;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'user_update',
                target_type: 'user',
                target_id: userId,
                description: `Modification utilisateur: ${JSON.stringify(updates)}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: 'Utilisateur modifié avec succès' });
    } catch (error) {
        console.error('❌ Erreur modification utilisateur:', error);
        res.status(500).json({ success: false, error: 'Erreur modification utilisateur' });
    }
});

app.put('/api/admin/servers/:serverId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { serverId } = req.params;
        const { server_type, status, expires_at, username, password } = req.body;

        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .single();

        if (!server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé' });
        }

        const updates = {};
        if (server_type) updates.server_type = server_type;
        if (status) updates.status = status;
        if (expires_at) updates.expires_at = expires_at;
        if (username) updates.username = username;
        
        if (password) {
            try {
                await callPterodactylAPI(`/api/application/users/${server.pterodactyl_id}`, 'PATCH', { password });
                updates.password = password;
            } catch (pteroError) {
                console.error('❌ Erreur mise à jour mot de passe Pterodactyl:', pteroError);
            }
        }

        const { error } = await supabase
            .from('servers')
            .update(updates)
            .eq('id', serverId);

        if (error) throw error;

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'server_update',
                target_type: 'server',
                target_id: serverId,
                description: `Modification du serveur ${server.server_name}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: 'Serveur modifié avec succès' });
    } catch (error) {
        console.error('❌ Erreur modification serveur:', error);
        res.status(500).json({ success: false, error: 'Erreur modification serveur' });
    }
});

app.delete('/api/admin/servers/:serverId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server } = await supabase
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .single();

        if (!server) {
            return res.status(404).json({ success: false, error: 'Serveur non trouvé' });
        }

        if (server.pterodactyl_id) {
            await deletePterodactylServer(server.pterodactyl_id);
        }

        const { error } = await supabase
            .from('servers')
            .delete()
            .eq('id', serverId);

        if (error) throw error;

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'server_delete',
                target_type: 'server',
                target_id: serverId,
                description: `Suppression du serveur ${server.server_name}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: 'Serveur supprimé avec succès' });
    } catch (error) {
        console.error('❌ Erreur suppression serveur:', error);
        res.status(500).json({ success: false, error: 'Erreur suppression serveur' });
    }
});

app.post('/api/admin/servers/delete-all', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { data: servers } = await supabase
            .from('servers')
            .select('pterodactyl_id, server_name');

        for (const server of servers || []) {
            if (server.pterodactyl_id) {
                await deletePterodactylServer(server.pterodactyl_id);
            }
        }

        const { error } = await supabase
            .from('servers')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'servers_delete_all',
                target_type: 'system',
                description: `Suppression de tous les serveurs (${servers?.length || 0} serveurs)`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ success: true, message: `Tous les serveurs ont été supprimés (${servers?.length || 0} serveurs)` });
    } catch (error) {
        console.error('❌ Erreur suppression tous les serveurs:', error);
        res.status(500).json({ success: false, error: 'Erreur suppression serveurs' });
    }
});

app.get('/api/admin/pterodactyl/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const nodes = await callPterodactylAPI('/api/application/nodes');
        
        let totalRAM = 0;
        let usedRAM = 0;
        let totalDisk = 0;
        let usedDisk = 0;
        let totalServers = 0;
        let nodesList = [];

        for (const node of nodes.data || []) {
            const nodeId = node.attributes.id;
            
            const allocations = await callPterodactylAPI(`/api/application/nodes/${nodeId}/allocations`);
            
            let nodeServers = [];
            try {
                const serversResponse = await callPterodactylAPI(`/api/application/nodes/${nodeId}/servers`);
                nodeServers = serversResponse.data || [];
            } catch (specificError) {
                console.log(`⚠️ Fallback: filtrage manuel pour le node ${nodeId}`);
                const allServers = await callPterodactylAPI('/api/application/servers');
                nodeServers = allServers.data.filter(s => {
                    if (s.attributes.relationships?.node?.attributes?.id === nodeId) return true;
                    if (s.attributes.node === nodeId) return true;
                    return false;
                });
            }
            
            const nodeRAM = node.attributes.memory;
            const nodeDisk = node.attributes.disk;
            
            totalRAM += nodeRAM;
            totalDisk += nodeDisk;
            
            totalServers += nodeServers.length;
            
            nodesList.push({
                id: nodeId,
                name: node.attributes.name,
                ram_total: nodeRAM,
                ram_used: nodeRAM * 0.6,
                disk_total: nodeDisk,
                disk_used: nodeDisk * 0.4,
                servers_count: nodeServers.length,
                is_active: node.attributes.scheme === 'https'
            });
            
            usedRAM += nodeRAM * 0.6;
            usedDisk += nodeDisk * 0.4;
        }

        const pteroUsers = await callPterodactylAPI('/api/application/users');

        res.json({
            success: true,
            cpu_used: 45,
            ram_used: Math.round(usedRAM / 1024 / 1024),
            ram_total: Math.round(totalRAM / 1024 / 1024),
            disk_used: Math.round(usedDisk / 1024 / 1024),
            disk_total: Math.round(totalDisk / 1024 / 1024),
            nodes: nodes.data?.length || 0,
            ptero_users: pteroUsers.meta?.pagination?.total || 0,
            ptero_servers: totalServers,
            average_load: 65,
            nodes_list: nodesList
        });

    } catch (error) {
        console.error('❌ Erreur récupération stats Pterodactyl:', error);
        res.status(500).json({ success: false, error: 'Erreur récupération stats Pterodactyl' });
    }
});

// =============================================
// ROUTE SUPPRESSION LOGS
// =============================================
app.post('/api/admin/logs/delete-all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('🗑️ Suppression de tous les logs par', req.user.username);

        const { count: beforeCount, error: countError } = await supabase
            .from('admin_actions')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Erreur comptage logs:', countError);
            return res.status(500).json({ success: false, error: 'Erreur lors du comptage des logs' });
        }

        const { error: deleteError } = await supabase
            .from('admin_actions')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
            console.error('❌ Erreur suppression logs:', deleteError);
            return res.status(500).json({ success: false, error: 'Erreur lors de la suppression des logs' });
        }

        console.log(`✅ ${beforeCount} logs supprimés avec succès par ${req.user.username}`);

        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'admin_logs_cleared',
                description: `Suppression de ${beforeCount} logs d'administration`
            }]);

        res.json({ 
            success: true, 
            message: `${beforeCount} logs supprimés avec succès`,
            count: beforeCount 
        });

    } catch (error) {
        console.error('❌ Erreur suppression logs:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de la suppression des logs',
            details: error.message 
        });
    }
});

// =============================================
// ROUTES MAINTENANCE
// =============================================

app.get('/api/maintenance-status', async (req, res) => {
    try {
        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .select('*')
            .single();

        if (error) {
            return res.json({ 
                success: true, 
                is_active: false,
                message: '🚧 Site en maintenance. Nous revenons très bientôt !'
            });
        }

        res.json({ 
            success: true, 
            is_active: maintenance.is_active,
            message: maintenance.message,
            estimated_end_time: maintenance.estimated_end_time,
            support_email: maintenance.support_email,
            support_whatsapp: maintenance.support_whatsapp,
            discord_link: maintenance.discord_link
        });

    } catch (error) {
        console.error('❌ Erreur récupération statut maintenance:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.get('/api/admin/maintenance', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .select('*')
            .single();

        if (error && error.code === 'PGRST116') {
            return res.json({ 
                success: true, 
                maintenance: {
                    is_active: false,
                    message: '🚧 Site en maintenance. Nous revenons très bientôt !',
                    estimated_end_time: null,
                    support_email: SITE_CONFIG.supportEmail,
                    support_whatsapp: SITE_CONFIG.whatsapp,
                    discord_link: SITE_CONFIG.discord,
                    allow_ips: [],
                    allow_paths: ['/api/admin/*', '/api/health']
                }
            });
        }

        if (error) throw error;

        res.json({ success: true, maintenance });

    } catch (error) {
        console.error('❌ Erreur récupération maintenance:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/admin/maintenance', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            is_active, 
            message, 
            estimated_end_time, 
            support_email, 
            support_whatsapp, 
            discord_link,
            allow_ips 
        } = req.body;

        const { data: existing, error: checkError } = await supabase
            .from('maintenance')
            .select('id')
            .maybeSingle();

        let result;

        if (existing) {
            const { data, error } = await supabase
                .from('maintenance')
                .update({
                    is_active: is_active !== undefined ? is_active : false,
                    message: message || '🚧 Site en maintenance. Nous revenons très bientôt !',
                    estimated_end_time: estimated_end_time || null,
                    support_email: support_email || SITE_CONFIG.supportEmail,
                    support_whatsapp: support_whatsapp || SITE_CONFIG.whatsapp,
                    discord_link: discord_link || SITE_CONFIG.discord,
                    allow_ips: allow_ips || [],
                    updated_by: req.user.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;

        } else {
            const { data, error } = await supabase
                .from('maintenance')
                .insert([{
                    id: '00000000-0000-0000-0000-000000000001',
                    is_active: is_active !== undefined ? is_active : false,
                    message: message || '🚧 Site en maintenance. Nous revenons très bientôt !',
                    estimated_end_time: estimated_end_time || null,
                    support_email: support_email || SITE_CONFIG.supportEmail,
                    support_whatsapp: support_whatsapp || SITE_CONFIG.whatsapp,
                    discord_link: discord_link || SITE_CONFIG.discord,
                    allow_ips: allow_ips || [],
                    allow_paths: ['/api/admin/*', '/api/health', '/api/maintenance-status'],
                    updated_by: req.user.id
                }])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'maintenance_update',
                target_type: 'system',
                description: `Modification maintenance: ${is_active ? 'activée' : 'désactivée'}`,
                metadata: { is_active, message },
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        res.json({ 
            success: true, 
            message: `Maintenance ${is_active ? 'activée' : 'désactivée'} avec succès`,
            maintenance: result 
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour maintenance:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ADMIN - EMAILS MASSIFS AVEC TEMPLATES ET DELAY (NOUVEAU)
// =============================================

const EMAIL_TEMPLATES = {
    'announcement': {
        name: '📢 Annonce générale',
        icon: '📢',
        default_subject: 'Nouvelle annonce KermHosting',
        default_message: 'Nous vous informons d\'une nouvelle mise à jour importante sur nos services.'
    },
    'maintenance': {
        name: '🛠️ Maintenance planifiée',
        icon: '🛠️',
        default_subject: 'Maintenance planifiée sur KermHosting',
        default_message: 'Une maintenance est prévue sur notre infrastructure. Des interruptions temporaires sont à prévoir.'
    },
    'promotion': {
        name: '🎉 Offre promotionnelle',
        icon: '🎉',
        default_subject: 'Offre spéciale KermHosting',
        default_message: 'Profitez de nos nouvelles offres sur les serveurs et packs de coins !'
    },
    'newsletter': {
        name: '📰 Newsletter',
        icon: '📰',
        default_subject: 'Newsletter KermHosting',
        default_message: 'Découvrez les dernières actualités de KermHosting.'
    },
    'alert': {
        name: '⚠️ Alerte sécurité',
        icon: '⚠️',
        default_subject: 'Alerte de sécurité KermHosting',
        default_message: 'Une action est requise de votre part concernant la sécurité de votre compte.'
    },
    'update': {
        name: '🔄 Mise à jour système',
        icon: '🔄',
        default_subject: 'Mise à jour KermHosting',
        default_message: 'De nouvelles fonctionnalités sont disponibles sur KermHosting.'
    }
};

function getMassEmailTemplate(username, templateType, customMessage, customTitle) {
    const template = EMAIL_TEMPLATES[templateType] || EMAIL_TEMPLATES['announcement'];
    const title = customTitle || template.default_subject;
    const message = customMessage || template.default_message;
    
    let gradientColor = '#7C3AED';
    
    switch(templateType) {
        case 'maintenance': gradientColor = '#f59e0b'; break;
        case 'promotion': gradientColor = '#10b981'; break;
        case 'alert': gradientColor = '#ef4444'; break;
        case 'update': gradientColor = '#3b82f6'; break;
        default: gradientColor = '#7C3AED';
    }
    
    const content = `
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 48px;">${template.icon}</span>
        </div>
        
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600; text-align: center;">
            ${title}
        </h2>
        
        <div style="height: 3px; background: linear-gradient(90deg, ${gradientColor}, transparent); margin: 20px 0;"></div>
        
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">Bonjour <strong style="color: ${gradientColor};">${username}</strong>,</p>
        
        <div style="background-color: #fafafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #444; line-height: 1.7; margin: 0; white-space: pre-line;">
                ${message.replace(/\n/g, '<br>')}
            </p>
        </div>
        
        <div style="background-color: #f0f7ff; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Besoin d'aide ?</p>
            <p style="margin: 0;">
                <a href="${SITE_CONFIG.whatsapp}" style="color: ${gradientColor}; text-decoration: none;">WhatsApp</a> · 
                <a href="${SITE_CONFIG.discord}" style="color: ${gradientColor}; text-decoration: none;">Discord</a> · 
                <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: ${gradientColor}; text-decoration: none;">Support</a>
            </p>
        </div>
        
        <p style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: ${gradientColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">
                Accéder à mon compte
            </a>
        </p>
    `;
    
    return getBaseEmailTemplate(title, content);
}

app.get('/api/admin/email-templates', authenticateToken, requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            templates: Object.entries(EMAIL_TEMPLATES).map(([key, value]) => ({
                id: key,
                name: value.name,
                icon: value.icon,
                default_subject: value.default_subject,
                default_message: value.default_message
            }))
        });
    } catch (error) {
        console.error('❌ Erreur récupération templates:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ADMIN - EMAILS MASSIFS (VERSION ASYNC SANS TIMEOUT)
// =============================================

app.post('/api/admin/send-mass-email', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            subject, 
            template_type, 
            custom_message, 
            target_role,
            test_email,
            send_test_first = true
        } = req.body;
        
        if (!template_type || !EMAIL_TEMPLATES[template_type]) {
            return res.status(400).json({ 
                success: false, 
                error: 'Type de template invalide',
                available_templates: Object.keys(EMAIL_TEMPLATES)
            });
        }
        
        if (!subject) {
            return res.status(400).json({ 
                success: false, 
                error: 'Sujet de l\'email requis' 
            });
        }
        
        let query = supabase.from('profiles').select('email, username, id, role');
        
        if (target_role && target_role !== 'all') {
            query = query.eq('role', target_role);
        }
        
        const { data: users, error } = await query;
        
        if (error) throw error;
        
        if (!users || users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Aucun utilisateur trouvé pour ce filtre' 
            });
        }
        
        // MODE TEST : envoi immédiat d'un seul email
        if (send_test_first && test_email) {
            console.log(`📧 Mode test : envoi à ${test_email} uniquement`);
            
            const testUser = users.find(u => u.email === test_email) || { username: 'Test', email: test_email };
            const testHtml = getMassEmailTemplate(testUser.username, template_type, custom_message, subject);
            
            const testResult = await sendEmail(test_email, `[TEST] ${subject}`, testHtml);
            
            if (!testResult.success) {
                return res.status(500).json({
                    success: false,
                    error: 'L\'email de test a échoué. Vérifiez votre configuration.',
                    details: testResult.error
                });
            }
            
            return res.json({
                success: true,
                test_sent: true,
                message: `Email de test envoyé avec succès à ${test_email}. Vérifiez votre boîte de réception avant d\'envoyer à tous.`,
                total_recipients: users.length
            });
        }
        
        // MODE RÉEL : création de la campagne (réponse immédiate)
        console.log(`📧 Création campagne email : ${users.length} destinataires, template: ${template_type}`);
        
        const campaignId = generateTransactionId();
        
        // Sauvegarder la campagne avec les utilisateurs dans metadata
        await supabase
            .from('mass_email_campaigns')
            .insert([{
                id: campaignId,
                admin_id: req.user.id,
                subject: subject,
                template_type: template_type,
                target_role: target_role || 'all',
                total_recipients: users.length,
                success_count: 0,
                fail_count: 0,
                status: 'pending',
                metadata: {
                    custom_message: custom_message,
                    users: users.map(u => ({ id: u.id, email: u.email, username: u.username }))
                },
                started_at: new Date().toISOString()
            }]);
        
        // Log admin
        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'mass_email_start',
                target_type: 'campaign',
                target_id: campaignId,
                description: `Campagne email "${subject}" démarrée pour ${users.length} utilisateurs`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);
        
        // Démarrer le traitement en arrière-plan (SANS AWAIT)
        processMassEmailCampaign(campaignId);
        
        // Réponse immédiate (avant la fin des envois)
        res.json({
            success: true,
            message: `Campagne lancée en arrière-plan pour ${users.length} utilisateurs. Les emails seront envoyés avec un délai de 60s entre chaque.`,
            campaign_id: campaignId,
            total_recipients: users.length,
            status: 'in_progress'
        });
        
    } catch (error) {
        console.error('❌ Erreur envoi massif:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de l\'envoi massif',
            details: error.message 
        });
    }
});

// =============================================
// TRAITEMENT ASYNCHRONE DE LA CAMPAGNE
// =============================================
async function processMassEmailCampaign(campaignId) {
    try {
        console.log(`📧 [BG] Début traitement campagne ${campaignId}`);
        
        // Récupérer la campagne
        const { data: campaign, error } = await supabase
            .from('mass_email_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();
        
        if (error || !campaign) {
            console.error(`❌ [BG] Campagne ${campaignId} non trouvée`);
            return;
        }
        
        if (campaign.status !== 'pending') {
            console.log(`⚠️ [BG] Campagne ${campaignId} déjà traitée (status: ${campaign.status})`);
            return;
        }
        
        // Mettre à jour le statut
        await supabase
            .from('mass_email_campaigns')
            .update({ status: 'in_progress' })
            .eq('id', campaignId);
        
        const users = campaign.metadata?.users || [];
        const template_type = campaign.template_type;
        const subject = campaign.subject;
        const custom_message = campaign.metadata?.custom_message;
        
        let successCount = 0;
        let failCount = 0;
        const errors = [];
        
        console.log(`📧 [BG] Envoi de ${users.length} emails pour la campagne ${campaignId}`);
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const htmlContent = getMassEmailTemplate(user.username, template_type, custom_message, subject);
            
            try {
                const result = await sendEmail(user.email, subject, htmlContent);
                
                if (result.success) {
                    successCount++;
                    console.log(`✅ [BG] [${i+1}/${users.length}] Email envoyé à ${user.email}`);
                } else {
                    failCount++;
                    errors.push({ email: user.email, error: result.error });
                    console.log(`❌ [BG] [${i+1}/${users.length}] Échec pour ${user.email}: ${result.error}`);
                }
            } catch (err) {
                failCount++;
                errors.push({ email: user.email, error: err.message });
                console.log(`❌ [BG] [${i+1}/${users.length}] Erreur pour ${user.email}: ${err.message}`);
            }
            
            // Mise à jour progressive dans la base (pour le frontend polling)
            await supabase
                .from('mass_email_campaigns')
                .update({
                    success_count: successCount,
                    fail_count: failCount,
                    errors: errors.slice(0, 100)
                })
                .eq('id', campaignId);
            
            // Delay de 60 secondes entre chaque email (évite rate limiting)
            if (i < users.length - 1) {
                console.log(`⏳ [BG] Attente 60 secondes avant le prochain email...`);
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
        
        // Terminer la campagne
        await supabase
            .from('mass_email_campaigns')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                success_count: successCount,
                fail_count: failCount,
                errors: errors.slice(0, 100)
            })
            .eq('id', campaignId);
        
        console.log(`✅ [BG] Campagne ${campaignId} terminée: ${successCount} succès, ${failCount} échecs`);
        
        // Log final
        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: campaign.admin_id,
                action_type: 'mass_email_completed',
                target_type: 'campaign',
                target_id: campaignId,
                description: `Campagne email "${subject}" terminée: ${successCount}/${users.length} succès`,
                metadata: {
                    subject,
                    template_type,
                    total: users.length,
                    success: successCount,
                    failed: failCount
                }
            }]);
        
    } catch (error) {
        console.error(`❌ [BG] Erreur traitement campagne ${campaignId}:`, error);
        
        await supabase
            .from('mass_email_campaigns')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                errors: [{ error: error.message }]
            })
            .eq('id', campaignId);
    }
}

app.get('/api/admin/email-campaigns', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data: campaigns, error } = await supabase
            .from('mass_email_campaigns')
            .select(`
                *,
                profiles:admin_id (username)
            `)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        res.json({
            success: true,
            campaigns: campaigns || []
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération campagnes:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ADMIN - RÉCUPÉRER UNE CAMPAGNE SPÉCIFIQUE
// =============================================
app.get('/api/admin/email-campaign/:campaignId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        console.log(`📊 Récupération campagne ${campaignId}`);
        
        const { data: campaign, error } = await supabase
            .from('mass_email_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();
        
        if (error || !campaign) {
            console.error(`❌ Campagne ${campaignId} non trouvée:`, error);
            return res.status(404).json({ 
                success: false, 
                error: 'Campagne non trouvée' 
            });
        }
        
        res.json({
            success: true,
            campaign: {
                id: campaign.id,
                status: campaign.status,
                total_recipients: campaign.total_recipients,
                success_count: campaign.success_count || 0,
                fail_count: campaign.fail_count || 0,
                started_at: campaign.started_at,
                completed_at: campaign.completed_at
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération campagne:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/admin/email-campaigns/:campaignId/cancel', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        const { data: campaign, error } = await supabase
            .from('mass_email_campaigns')
            .select('status')
            .eq('id', campaignId)
            .single();
        
        if (error || !campaign) {
            return res.status(404).json({ success: false, error: 'Campagne non trouvée' });
        }
        
        if (campaign.status !== 'in_progress') {
            return res.status(400).json({ success: false, error: 'Seules les campagnes en cours peuvent être annulées' });
        }
        
        await supabase
            .from('mass_email_campaigns')
            .update({
                status: 'cancelled',
                completed_at: new Date().toISOString()
            })
            .eq('id', campaignId);
        
        res.json({
            success: true,
            message: 'Campagne annulée avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur annulation campagne:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ROUTES ADMIN - SUSPENSION/RÉACTIVATION MANUELLE
// =============================================

app.post('/api/admin/servers/:serverId/suspend', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server, error: fetchError } = await supabase
            .from('servers')
            .select('*, profiles(*)')
            .eq('id', serverId)
            .single();

        if (fetchError || !server) {
            return res.status(404).json({ 
                success: false, 
                error: 'Serveur non trouvé' 
            });
        }

        const pteroSuccess = await suspendPterodactylServer(server.pterodactyl_id);
        if (!pteroSuccess) {
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur de suspension sur Pterodactyl' 
            });
        }

        const { error: updateError } = await supabase
            .from('servers')
            .update({ 
                status: 'suspended'
            })
            .eq('id', serverId);

        if (updateError) {
            console.error('❌ Erreur mise à jour statut:', updateError);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur mise à jour du statut' 
            });
        }

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'manual_suspend',
                target_type: 'server',
                target_id: serverId,
                description: `Suspension manuelle du serveur ${server.server_name}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        if (server.profiles && server.profiles.email) {
            await sendEmail(
                server.profiles.email,
                '🔴 Votre serveur a été suspendu par un administrateur',
                getServerSuspendedHtml(server.profiles.username, server)
            );
        }

        res.json({ 
            success: true, 
            message: 'Serveur suspendu avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur suspension manuelle:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

app.post('/api/admin/servers/:serverId/unsuspend', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { serverId } = req.params;

        const { data: server, error: fetchError } = await supabase
            .from('servers')
            .select('*, profiles(*)')
            .eq('id', serverId)
            .single();

        if (fetchError || !server) {
            return res.status(404).json({ 
                success: false, 
                error: 'Serveur non trouvé' 
            });
        }

        const pteroSuccess = await unsuspendPterodactylServer(server.pterodactyl_id);
        if (!pteroSuccess) {
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur de réactivation sur Pterodactyl' 
            });
        }

        const { error: updateError } = await supabase
            .from('servers')
            .update({ 
                status: 'active'
            })
            .eq('id', serverId);

        if (updateError) {
            console.error('❌ Erreur mise à jour statut:', updateError);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur mise à jour du statut' 
            });
        }

        await supabase
            .from('admin_actions')
            .insert([{
                admin_id: req.user.id,
                action_type: 'manual_unsuspend',
                target_type: 'server',
                target_id: serverId,
                description: `Réactivation manuelle du serveur ${server.server_name}`,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            }]);

        if (server.profiles && server.profiles.email) {
            const html = `
                <h2 style="color: #333; margin: 0 0 15px 0;">✅ Votre serveur a été réactivé</h2>
                <p style="color: #555; line-height: 1.6;">Bonjour ${server.profiles.username},</p>
                <p style="color: #555; line-height: 1.6;">Votre serveur <strong>"${server.server_name}"</strong> a été réactivé par un administrateur.</p>
                <p style="color: #555; line-height: 1.6;">Vous pouvez maintenant y accéder normalement.</p>
                <p style="text-align: center; margin: 30px 0 15px 0;">
                    <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600;">Accéder à mon serveur</a>
                </p>
            `;
            await sendEmail(
                server.profiles.email,
                '✅ Votre serveur a été réactivé',
                getBaseEmailTemplate('Serveur réactivé', html)
            );
        }

        res.json({ 
            success: true, 
            message: 'Serveur réactivé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur réactivation manuelle:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// =============================================
// WEBSOCKET
// =============================================

wss.on('connection', (ws) => {
    console.log('🔌 Nouvelle connexion WebSocket');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'auth' && data.token) {
                try {
                    const decoded = jwt.verify(data.token, SITE_CONFIG.jwtSecret);
                    
                    const { data: user } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', decoded.userId)
                        .single();

                    if (user) {
                        ws.user = user;
                        ws.send(JSON.stringify({ type: 'auth', success: true }));
                    }
                } catch (err) {
                    ws.send(JSON.stringify({ type: 'auth', success: false }));
                }
            }

            if (data.type === 'subscribe' && data.serverId && ws.user) {
                ws.serverId = data.serverId;
                ws.send(JSON.stringify({ type: 'subscribed', serverId: data.serverId }));
            }

            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        } catch (error) {
            console.error('❌ Erreur WebSocket:', error);
        }
    });

    ws.on('close', () => {
        console.log('🔌 Déconnexion WebSocket');
    });
});

// =============================================
// ROUTE DE TÉLÉCHARGEMENT KERM-MD-V1
// =============================================
app.get('/api/download-bot', async (req, res) => {
    try {
        const fileName = 'KERM-MD-V1.zip';
        
        const possiblePaths = [
            path.join(__dirname, 'public', 'downloads', fileName),
            path.join(__dirname, 'bots', fileName),
            path.join(__dirname, fileName)
        ];
        
        let filePath = null;
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                filePath = testPath;
                break;
            }
        }
        
        if (!filePath) {
            return res.status(404).json({ success: false, error: 'Fichier non trouvé' });
        }
        
        const fileBuffer = fs.readFileSync(filePath);
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="KERM-MD-V1.zip"');
        res.setHeader('Content-Length', fileBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        
        res.end(fileBuffer);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// =============================================
// ROUTE DE VÉRIFICATION DU NOM D'UTILISATEUR PTERODACTYL
// =============================================
app.post('/api/check-username', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ 
                success: false, 
                available: false, 
                error: 'Nom d\'utilisateur requis' 
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                success: false, 
                available: false, 
                error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères' 
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ 
                success: false, 
                available: false, 
                error: 'Caractères autorisés: lettres, chiffres et underscore (_)' 
            });
        }

        try {
            let userExists = false;
            
            try {
                const emailToCheck = `${username.toLowerCase()}@kermhosting.local`;
                const userByEmail = await callPterodactylAPI(`/api/application/users?filter[email]=${encodeURIComponent(emailToCheck)}`);
                
                if (userByEmail.data && userByEmail.data.length > 0) {
                    userExists = true;
                }
            } catch (emailError) {
                console.log('⚠️ Erreur recherche par email, tentative par username...');
            }

            if (!userExists) {
                try {
                    const userByUsername = await callPterodactylAPI(`/api/application/users?filter[username]=${encodeURIComponent(username.toLowerCase())}`);
                    
                    if (userByUsername.data && userByUsername.data.length > 0) {
                        userExists = true;
                    }
                } catch (usernameError) {
                    console.log('⚠️ Erreur recherche par username');
                }
            }

            if (!userExists) {
                const { data: existingServers } = await supabase
                    .from('servers')
                    .select('username')
                    .ilike('username', username);

                if (existingServers && existingServers.length > 0) {
                    userExists = true;
                }
            }

            if (userExists) {
                return res.json({ 
                    success: true, 
                    available: false, 
                    error: 'Ce nom d\'utilisateur est déjà utilisé' 
                });
            }

            return res.json({ 
                success: true, 
                available: true 
            });

        } catch (pteroError) {
            console.error('❌ Erreur API Pterodactyl:', pteroError);
            
            const { data: existingServers } = await supabase
                .from('servers')
                .select('username')
                .ilike('username', username);

            if (existingServers && existingServers.length > 0) {
                return res.json({ 
                    success: true, 
                    available: false, 
                    error: 'Ce nom d\'utilisateur est déjà utilisé' 
                });
            }

            return res.json({ 
                success: true, 
                available: true,
                warning: 'Vérification limitée à notre base de données'
            });
        }

    } catch (error) {
        console.error('❌ Erreur vérification username:', error);
        res.status(500).json({ 
            success: false, 
            available: false, 
            error: 'Erreur serveur lors de la vérification' 
        });
    }
});

// =============================================
// ROUTES PAGES HTML
// =============================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/pricing', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pricing.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/buy-coins', (req, res) => res.sendFile(path.join(__dirname, 'public', 'buy-coins.html')));
app.get('/payment-success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'payment-success.html')));
app.get('/payment-cancel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'payment-cancel.html')));
app.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'forgot-password.html')));
app.get('/email-verification', (req, res) => res.sendFile(path.join(__dirname, 'public', 'email-verification.html')));
app.get('/support', (req, res) => res.sendFile(path.join(__dirname, 'public', 'support.html')));
app.get('/transactions', (req, res) => res.sendFile(path.join(__dirname, 'public', 'transactions.html')));
app.get('/bot', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bot.html')));
app.get('/maintenance', (req, res) => res.sendFile(path.join(__dirname, 'public', 'maintenance.html')));
app.get('/server/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'view.html')));
app.get('/server/:id/files', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'files.html')));

app.get('*', (req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// =============================================
// DÉMARRAGE
// =============================================

server.listen(SITE_CONFIG.port, async () => {
    console.log(`\n🚀 KERMHOSTING DÉMARRÉ SUR LE PORT ${SITE_CONFIG.port}`);
    console.log(`💰 Mode paiement: Fapshi LIVE + PayPal + Minipay`);
    console.log(`📧 Email via Resend: ${RESEND_CONFIG.from}`);
    console.log(`🎮 Pterodactyl: ${PTERODACTYL_CONFIG.url}`);
    console.log(`================================\n`);
    
    await createDefaultSuperAdmin();
    await setupAutoRenewTables();

    const balance = await fapshiBalance();
    if (balance.success) {
        console.log(`✅ Fapshi connecté - Solde: ${balance.balance} FCFA`);
    } else {
        console.log(`❌ Erreur Fapshi: ${balance.message}`);
    }
});
