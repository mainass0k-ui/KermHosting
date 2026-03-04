// =============================================
// index.js - KERMHOSTING BACKEND COMPLET (CORRIGÉ)
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
import Mailgun from 'mailgun.js';
import formData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// =============================================
// CONFIGURATION SUPABASE (À MODIFIER)
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
    apiuser: '42ae50a1-35e3-4422-b422-d238d4548bf1',
    apikey: 'FAK_850bbe31d0093e30ad220b5a08e91671',
    webhookSecret: 'kermhosting_webhook_secret_2024'
};

// Headers Fapshi
const fapshiHeaders = {
    apiuser: FAPSHI_CONFIG.apiuser,
    apikey: FAPSHI_CONFIG.apikey
};

// =============================================
// CONFIGURATION MAILGUN SANDBOX
// =============================================
const MAILGUN_CONFIG = {
    apiKey: '82cf32bf-54866ad5',
    domain: 'sandboxe7ebd2a141ff47379c7254dffc97aaf2.mailgun.org',
    from: 'KermHosting <postmaster@sandboxe7ebd2a141ff47379c7254dffc97aaf2.mailgun.org>'
};

// Initialisation Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: MAILGUN_CONFIG.apiKey,
    url: 'https://api.mailgun.net/v3'
});

// =============================================
// CONFIGURATION PTERODACTYL
// =============================================
const PTERODACTYL_CONFIG = {
    url: 'https://votre-panel.com',
    applicationApiKey: 'ptlc_votre_cle_application',
    clientApiKey: 'ptlc_votre_cle_client'
};

const SITE_CONFIG = {
    url: 'https://kermhosting.com',
    name: 'KermHosting',
    supportEmail: 'bookmakerp@gmail.com',
    whatsapp: 'https://wa.me/237659535227',
    discord: 'https://discord.gg/kermhosting',
    twitter: 'https://twitter.com/kermhosting',
    jwtSecret: 'kermhosting_super_secret_key_2024_changez_ceci',
    port: process.env.PORT || 3000
};

// Initialisation Supabase
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

// =============================================
// CONFIGURATION DES PLANS
// =============================================
const PLANS = {
    'free': {
        id: 'free',
        name: 'Free',
        memory: 256,
        disk: 5120,
        cpu: 50,
        swap: 0,
        io: 500,
        price_fcfa: 0,
        coins_needed: 0,
        duration_days: 1,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        features: [
            '256 MB RAM',
            '5 GB Stockage SSD',
            '50% CPU',
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
        disk: 10240,
        cpu: 100,
        swap: 0,
        io: 500,
        price_fcfa: 500,
        coins_needed: 100,
        duration_days: 30,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        features: [
            '1 GB RAM DDR4',
            '10 GB Stockage NVMe',
            '100% CPU',
            '30 jours',
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
        disk: 20480,
        cpu: 200,
        swap: 0,
        io: 500,
        price_fcfa: 800,
        coins_needed: 160,
        duration_days: 30,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        features: [
            '2 GB RAM DDR4',
            '20 GB Stockage NVMe',
            '200% CPU',
            '30 jours',
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
        disk: 40960,
        cpu: 400,
        swap: 0,
        io: 500,
        price_fcfa: 1300,
        coins_needed: 260,
        duration_days: 30,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        features: [
            '4 GB RAM DDR4',
            '40 GB Stockage NVMe',
            '400% CPU',
            '30 jours',
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
        disk: 81920,
        cpu: 800,
        swap: 0,
        io: 500,
        price_fcfa: 1700,
        coins_needed: 340,
        duration_days: 30,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        features: [
            '8 GB RAM DDR4',
            '80 GB Stockage NVMe',
            '800% CPU',
            '30 jours',
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
app.use(cors());
app.use(express.static('public'));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

const generateApiKey = () => `KERM_${crypto.randomBytes(32).toString('hex')}`;
const generateReferralCode = () => `KERM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateUUID = () => crypto.randomUUID();
const generateTransactionId = () => `TRX_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const generateUsername = () => `user_${crypto.randomBytes(4).toString('hex')}`;
const generatePassword = () => crypto.randomBytes(12).toString('hex');

// Fonction pour générer un mot de passe avec préfixe Kh-
function generateServerPassword() {
    const randomPart = crypto.randomBytes(2).toString('hex');
    return `Kh-${randomPart}`;
}

// Fonction de validation du nom d'utilisateur
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
// FONCTIONS EMAIL AVEC MAILGUN
// =============================================

async function sendEmail(to, subject, htmlContent) {
    try {
        // En mode sandbox, il faut autoriser les destinataires
        // Ajoute bookmakerp@gmail.com dans les authorized recipients du dashboard Mailgun
        const result = await mg.messages.create(MAILGUN_CONFIG.domain, {
            from: MAILGUN_CONFIG.from,
            to: [to],
            subject: subject,
            html: htmlContent
        });
        
        console.log(`✅ Email envoyé à ${to}:`, result.id);
        return { success: true, id: result.id };
    } catch (error) {
        console.error('❌ Erreur Mailgun:', error);
        // Ne pas bloquer le processus, juste logger l'erreur
        return { success: false, error: error.message };
    }
}

function getVerificationEmailHtml(username, code) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7C3AED; margin: 0;">KermHosting</h1>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px;">Vérification de votre compte</h2>
            <p>Bonjour ${username},</p>
            <p>Merci de vous être inscrit sur KermHosting ! Voici votre code de vérification :</p>
            <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #7C3AED; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
            </div>
            <p>Ce code expirera dans 15 minutes.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">© 2024 KermHosting. Tous droits réservés.</p>
        </div>
    `;
}

function getWelcomeEmailHtml(username) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7C3AED; margin: 0;">KermHosting</h1>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px;">Bienvenue ${username} !</h2>
            <p>Votre compte a été vérifié avec succès !</p>
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Vous avez reçu 15 coins</strong> (10 pour l'inscription + 5 pour la vérification)</p>
            </div>
            <p>Vous pouvez maintenant créer votre premier serveur.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_CONFIG.url}/dashboard" style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Tableau de bord</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">© 2024 KermHosting. Tous droits réservés.</p>
        </div>
    `;
}

function getResetEmailHtml(username, code) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7C3AED; margin: 0;">KermHosting</h1>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>
            <p>Bonjour ${username},</p>
            <p>Voici votre code de réinitialisation :</p>
            <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #7C3AED; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
            </div>
            <p>Ce code expirera dans 15 minutes.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">© 2024 KermHosting. Tous droits réservés.</p>
        </div>
    `;
}

function getPaymentConfirmationHtml(username, amount, type) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7C3AED; margin: 0;">KermHosting</h1>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px; color: #10B981;">✅ Paiement confirmé</h2>
            <p>Bonjour ${username},</p>
            <p>Votre paiement de <strong>${amount} ${type === 'coins' ? 'coins' : 'FCFA'}</strong> a été confirmé.</p>
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Merci pour votre confiance !</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_CONFIG.url}/dashboard" style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Voir mon tableau de bord</a>
            </div>
        </div>
    `;
}

// =============================================
// FONCTIONS PTERODACTYL
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
        const payload = {
            username: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
            email: email,
            first_name: username.substring(0, 10),
            last_name: 'KermHosting',
            password: generatePassword()
        };

        const result = await callPterodactylAPI('/api/application/users', 'POST', payload);
        
        return {
            id: result.attributes.id,
            username: result.attributes.username,
            email: result.attributes.email,
            password: payload.password
        };
    } catch (error) {
        console.error('❌ Erreur création utilisateur Pterodactyl:', error);
        throw error;
    }
}

async function createPterodactylServer(serverData) {
    try {
        const {
            name,
            userId,
            eggId = 15,
            dockerImage = 'ghcr.io/parkervcp/yolks:nodejs_18',
            memory,
            disk,
            cpu,
            locationId = 1
        } = serverData;

        const MAIN_FILE = "index.js";
        const startupCommand =
            'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; ' +
            'if [[ ! -z ${NODE_PACKAGES} ]]; then npm install ${NODE_PACKAGES}; fi; ' +
            'if [ -f /home/container/package.json ]; then npm install; fi; ' +
            '/usr/local/bin/node /home/container/' + MAIN_FILE;

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
                CMD_RUN: `node ${MAIN_FILE}`,
                MAIN_FILE: MAIN_FILE,
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

async function fapshiInitiatePay(data) {
    try {
        if (!data?.amount) return fapshiError('Montant requis', 400);
        if (!Number.isInteger(data.amount)) return fapshiError('Le montant doit être un entier', 400);
        if (data.amount < 100) return fapshiError('Le montant minimum est de 100 FCFA', 400);

        const config = {
            method: 'post',
            url: `${FAPSHI_CONFIG.baseUrl}/initiate-pay`,
            headers: fapshiHeaders,
            data: {
                amount: data.amount,
                email: data.email,
                userId: data.userId,
                externalId: data.externalId,
                redirectUrl: data.redirectUrl,
                message: data.message || 'Paiement KermHosting'
            }
        };

        const response = await axios(config);
        return {
            ...response.data,
            statusCode: response.status
        };
    } catch (e) {
        return {
            ...e.response?.data,
            statusCode: e.response?.status || 500
        };
    }
}

async function fapshiDirectPay(data) {
    try {
        if (!data?.amount) return fapshiError('Montant requis', 400);
        if (!Number.isInteger(data.amount)) return fapshiError('Le montant doit être un entier', 400);
        if (data.amount < 100) return fapshiError('Le montant minimum est de 100 FCFA', 400);
        if (!data?.phone) return fapshiError('Numéro de téléphone requis', 400);
        if (!/^6[\d]{8}$/.test(data.phone)) return fapshiError('Numéro de téléphone invalide', 400);

        const config = {
            method: 'post',
            url: `${FAPSHI_CONFIG.baseUrl}/direct-pay`,
            headers: fapshiHeaders,
            data: {
                amount: data.amount,
                phone: data.phone,
                medium: data.medium || 'MTN',
                name: data.name,
                email: data.email,
                userId: data.userId,
                externalId: data.externalId,
                message: data.message || 'Paiement KermHosting'
            }
        };

        const response = await axios(config);
        return {
            ...response.data,
            statusCode: response.status
        };
    } catch (e) {
        return {
            ...e.response?.data,
            statusCode: e.response?.status || 500
        };
    }
}

async function fapshiPaymentStatus(transId) {
    try {
        if (!transId || typeof transId !== 'string') return fapshiError('ID de transaction invalide', 400);

        const config = {
            method: 'get',
            url: `${FAPSHI_CONFIG.baseUrl}/payment-status/${transId}`,
            headers: fapshiHeaders
        };

        const response = await axios(config);
        return {
            ...response.data,
            statusCode: response.status
        };
    } catch (e) {
        return {
            ...e.response?.data,
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
            ...response.data,
            statusCode: response.status
        };
    } catch (e) {
        return {
            ...e.response?.data,
            statusCode: e.response?.status || 500
        };
    }
}

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
// ROUTES AUTH CORRIGÉES
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

        // Vérifier si l'utilisateur existe déjà
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

        let referrerId = null;
        let referrerName = null;

        // Vérifier le code de parrainage
        if (referral_code) {
            const { data: referrer } = await supabase
                .from('profiles')
                .select('id, username')
                .eq('referral_code', referral_code)
                .maybeSingle();

            if (referrer) {
                referrerId = referrer.id;
                referrerName = referrer.username;
            }
        }

        // Créer l'utilisateur
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
                coins: 10,
                badges: []
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur création:', error);
            return res.status(500).json({ success: false, error: 'Erreur création compte', code: 'REGISTER_ERROR' });
        }

        // Email de vérification
        await sendEmail(
            email,
            '🔐 Code de vérification KermHosting',
            getVerificationEmailHtml(username, verificationCode)
        );

        // Traiter le parrainage si existant
        if (referrerId) {
            // Récupérer les coins actuels du parrain
            const { data: referrerData } = await supabase
                .from('profiles')
                .select('coins')
                .eq('id', referrerId)
                .single();
            
            if (referrerData) {
                // Mettre à jour les coins du parrain
                await supabase
                    .from('profiles')
                    .update({ coins: referrerData.coins + 20 })
                    .eq('id', referrerId);
            }

            // Récupérer les coins actuels du nouveau user
            const { data: newUserData } = await supabase
                .from('profiles')
                .select('coins')
                .eq('id', newUser.id)
                .single();
            
            if (newUserData) {
                // Mettre à jour les coins du nouveau user
                await supabase
                    .from('profiles')
                    .update({ coins: newUserData.coins + 10 })
                    .eq('id', newUser.id);
            }

            // Enregistrer le parrainage
            await supabase
                .from('referrals')
                .insert([{
                    referrer_id: referrerId,
                    referred_id: newUser.id,
                    coins_rewarded: 20
                }]);
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

        // Mettre à jour l'utilisateur
        await supabase
            .from('profiles')
            .update({
                email_verified: true,
                email_verification_code: null,
                email_verification_code_expires: null,
                coins: user.coins + 5
            })
            .eq('id', user.id);

        // Email de bienvenue
        await sendEmail(
            email,
            '🎉 Bienvenue sur KermHosting !',
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

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email et mot de passe requis', code: 'MISSING_FIELDS' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ success: false, error: 'Email ou mot de passe incorrect', code: 'INVALID_CREDENTIALS' });
        }

        if (user.banned) {
            return res.status(403).json({ success: false, error: 'Compte suspendu', code: 'ACCOUNT_BANNED' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ success: false, error: 'Email ou mot de passe incorrect', code: 'INVALID_CREDENTIALS' });
        }

        if (!user.email_verified) {
            return res.status(403).json({ 
                success: false, 
                error: 'Email non vérifié', 
                requiresVerification: true, 
                code: 'EMAIL_NOT_VERIFIED' 
            });
        }

        // Token avec expiration à 3 jours (259200 secondes)
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
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'INTERNAL_ERROR' });
    }
});

// Route pour demander la réinitialisation du mot de passe
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

        // Pour des raisons de sécurité, on renvoie toujours le même message
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

        // Envoyer l'email
        await sendEmail(
            email,
            '🔐 Réinitialisation de votre mot de passe KermHosting',
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

// Route pour réinitialiser le mot de passe
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

// Route pour changer le mot de passe (utilisateur connecté)
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
// ROUTES PAIEMENT FAPSHI CORRIGÉES
// =============================================

// Paiement direct par Mobile Money pour serveur
app.post('/api/payment/direct-server', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { plan_id, phone, medium } = req.body;

        if (!plan_id || !PLANS[plan_id] || plan_id === 'free') {
            return res.status(400).json({ success: false, error: 'Plan invalide', code: 'INVALID_PLAN' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        const plan = PLANS[plan_id];
        const transactionId = generateTransactionId();

        // Note: La colonne 'phone' doit exister dans ta table transactions
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                id: transactionId,
                user_id: req.user.id,
                type: 'server_purchase',
                plan_key: plan_id,
                server_name: 'À définir', // À remplacer par le nom du serveur
                amount: plan.price_fcfa,
                currency: 'FCFA',
                medium: medium,
                status: 'pending',
                metadata: { plan, phone }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction:', error);
            return res.status(500).json({ success: false, error: 'Erreur création transaction' });
        }

        const payment = await fapshiDirectPay({
            amount: plan.price_fcfa,
            phone: phone,
            medium: medium,
            name: req.user.username,
            email: req.user.email,
            userId: req.user.id,
            externalId: transactionId,
            message: `Serveur ${plan.name} - ${req.user.username}`
        });

        if (payment.statusCode !== 200) {
            return res.status(400).json({
                success: false,
                error: payment.message || 'Erreur lors du paiement',
                code: 'FAPSHI_ERROR'
            });
        }

        await supabase
            .from('transactions')
            .update({
                fapshi_transaction_id: payment.transId,
                payment_url: payment.link
            })
            .eq('id', transactionId);

        res.json({
            success: true,
            message: 'Demande de paiement envoyée. Confirmez sur votre téléphone.',
            transaction_id: transactionId,
            transId: payment.transId
        });

    } catch (error) {
        console.error('❌ Erreur paiement direct:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'PAYMENT_ERROR' });
    }
});

// Paiement direct pour acheter des coins
app.post('/api/payment/buy-coins', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { pack_id, phone, medium } = req.body;

        if (!pack_id || !COIN_PACKS[pack_id]) {
            return res.status(400).json({ success: false, error: 'Pack invalide', code: 'INVALID_PACK' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        const pack = COIN_PACKS[pack_id];
        const totalCoins = pack.coins + (pack.bonus || 0);
        const transactionId = generateTransactionId();

        // Note: La colonne 'phone' a été retirée car elle n'existe pas dans ta table
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
                medium: medium,
                status: 'pending',
                metadata: { pack, phone } // Le téléphone est stocké dans metadata
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction:', error);
            return res.status(500).json({ success: false, error: 'Erreur création transaction' });
        }

        const payment = await fapshiDirectPay({
            amount: pack.price_fcfa,
            phone: phone,
            medium: medium,
            name: req.user.username,
            email: req.user.email,
            userId: req.user.id,
            externalId: transactionId,
            message: `Achat ${totalCoins} coins`
        });

        if (payment.statusCode !== 200) {
            return res.status(400).json({
                success: false,
                error: payment.message || 'Erreur lors du paiement',
                code: 'FAPSHI_ERROR'
            });
        }

        await supabase
            .from('transactions')
            .update({
                fapshi_transaction_id: payment.transId,
                payment_url: payment.link
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
        res.status(500).json({ success: false, error: 'Erreur serveur', code: 'PAYMENT_ERROR' });
    }
});

// Vérifier statut paiement
app.get('/api/payment/status/:transId', async (req, res) => {
    try {
        const { transId } = req.params;
        const status = await fapshiPaymentStatus(transId);

        if (status.statusCode !== 200) {
            return res.status(400).json({ success: false, error: status.message });
        }

        res.json({
            success: true,
            status: status.status,
            data: status
        });

    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Webhook Fapshi
app.post('/api/fapshi-webhook', express.json(), async (req, res) => {
    try {
        const { transId } = req.body;

        if (!transId) {
            return res.status(400).json({ message: 'transId requis' });
        }

        const event = await fapshiPaymentStatus(transId);

        if (event.statusCode !== 200) {
            return res.status(400).json({ message: event.message });
        }

        const { data: transaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('fapshi_transaction_id', transId)
            .single();

        if (error || !transaction) {
            return res.status(404).json({ message: 'Transaction non trouvée' });
        }

        if (transaction.status === event.status.toLowerCase()) {
            return res.json({ received: true });
        }

        await supabase
            .from('transactions')
            .update({
                status: event.status.toLowerCase(),
                completed_at: event.status === 'SUCCESSFUL' ? new Date().toISOString() : null
            })
            .eq('id', transaction.id);

        if (event.status === 'SUCCESSFUL') {
            if (transaction.type === 'coins_purchase') {
                // Récupérer l'utilisateur
                const { data: user } = await supabase
                    .from('profiles')
                    .select('coins, email, username')
                    .eq('id', transaction.user_id)
                    .single();

                if (user) {
                    // Mettre à jour les coins
                    await supabase
                        .from('profiles')
                        .update({ coins: user.coins + transaction.coins_amount })
                        .eq('id', transaction.user_id);

                    // Email de confirmation
                    await sendEmail(
                        user.email,
                        '💰 Achat de coins confirmé',
                        getPaymentConfirmationHtml(user.username, transaction.coins_amount, 'coins')
                    );
                }
            } else if (transaction.type === 'server_purchase') {
                // Récupérer l'utilisateur
                const { data: user } = await supabase
                    .from('profiles')
                    .select('email, username')
                    .eq('id', transaction.user_id)
                    .single();

                if (user) {
                    // Email de confirmation
                    await sendEmail(
                        user.email,
                        '✅ Paiement serveur confirmé',
                        getPaymentConfirmationHtml(user.username, transaction.amount, 'fcfa')
                    );
                }
            }
        }

        res.json({ received: true });

    } catch (error) {
        console.error('❌ Erreur webhook:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// =============================================
// ROUTE RÉCOMPENSE QUOTIDIENNE CORRIGÉE (24h)
// =============================================
app.post('/api/daily-reward', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toDateString();
        const now = new Date();

        // Vérifier si l'utilisateur a déjà réclamé aujourd'hui
        if (req.user.last_daily_login === today) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vous avez déjà réclamé votre récompense aujourd\'hui. Revenez demain !', 
                code: 'DAILY_REWARD_ALREADY_CLAIMED' 
            });
        }

        // Vérifier que 24h se sont écoulées depuis la dernière réclamation
        if (req.user.last_daily_login) {
            const lastClaim = new Date(req.user.last_daily_login);
            const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
            
            if (hoursSinceLastClaim < 24) {
                const hoursLeft = Math.ceil(24 - hoursSinceLastClaim);
                return res.status(400).json({
                    success: false,
                    error: `Vous pourrez réclamer votre prochaine récompense dans ${hoursLeft} heures.`,
                    code: 'TOO_EARLY'
                });
            }
        }

        let coinsReward = 5;
        let streakCount = 1;

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        // Vérifier la série
        if (req.user.last_daily_login === yesterday) {
            streakCount = (req.user.daily_login_streak || 0) + 1;
            coinsReward = 5 + Math.min(5, streakCount); // Bonus de série
        }

        // Mettre à jour l'utilisateur
        await supabase
            .from('profiles')
            .update({
                daily_login_streak: streakCount,
                last_daily_login: today,
                total_login_days: (req.user.total_login_days || 0) + 1,
                coins: (req.user.coins || 0) + coinsReward
            })
            .eq('id', req.user.id);

        // Journaliser l'activité
        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'daily_login',
                coins_earned: coinsReward,
                description: `Récompense quotidienne - Série: ${streakCount} jours`
            }]);

        res.json({
            success: true,
            message: `Félicitations ! Vous avez gagné ${coinsReward} coins (série: ${streakCount} jours)`,
            coins: coinsReward,
            streak: streakCount
        });

    } catch (error) {
        console.error('❌ Erreur récompense quotidienne:', error);
        res.status(500).json({ success: false, error: 'Erreur récompense' });
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

// Récupérer les activités de l'utilisateur
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

// Régénérer la clé API
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

// Récupérer les identifiants d'un serveur
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

        // Journaliser la consultation des identifiants
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

        // Validation du nom d'utilisateur
        const usernameValidation = validateUsername(server_username);
        if (!usernameValidation.valid) {
            return res.status(400).json({ 
                success: false, 
                error: usernameValidation.reason, 
                code: 'INVALID_USERNAME' 
            });
        }

        const plan = PLANS[plan_id];

        // Vérifier le paiement si ce n'est pas gratuit
        if (plan_id !== 'free') {
            if (payment_method === 'coins') {
                // Paiement par coins
                if (req.user.coins < plan.coins_needed) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Coins insuffisants', 
                        code: 'INSUFFICIENT_COINS' 
                    });
                }
            } else {
                // Paiement par Mobile Money
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

        // Créer l'utilisateur Pterodactyl avec le nom d'utilisateur choisi
        const pteroEmail = `${server_username.toLowerCase()}@kermhosting.local`;
        const pteroUser = await createPterodactylUser(server_username, pteroEmail);

        // Créer le serveur Pterodactyl
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

        // Sauvegarder dans Supabase
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
            // Déduire les coins
            await supabase
                .from('profiles')
                .update({ coins: req.user.coins - plan.coins_needed })
                .eq('id', req.user.id);

            // Créer une transaction
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

        // Journaliser l'activité
        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'server_creation',
                coins_earned: payment_method === 'coins' ? -plan.coins_needed : 0,
                description: `Création du serveur "${server_name}" (plan ${plan.name})`
            }]);

        // Email de confirmation
        await sendEmail(
            req.user.email,
            '✅ Votre serveur a été créé !',
            `<p>Bonjour ${req.user.username},</p>
             <p>Votre serveur <strong>${server_name}</strong> a été créé avec succès.</p>
             <p><strong>Identifiants :</strong></p>
             <ul>
                <li>Nom d'utilisateur : ${pteroUser.username}</li>
                <li>Mot de passe : ${pteroUser.password}</li>
                <li>Panel : ${PTERODACTYL_CONFIG.url}</li>
             </ul>`
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

// Actions sur le serveur (start/stop/restart)
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

        // Journaliser l'activité
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

// Récupérer les ressources du serveur
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

// =============================================
// ROUTE DE RENOUVELLEMENT DE SERVEUR
// =============================================
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

        // Déduire les coins
        await supabase
            .from('profiles')
            .update({ coins: req.user.coins - coins })
            .eq('id', req.user.id);

        // Mettre à jour la date d'expiration
        await supabase
            .from('servers')
            .update({ 
                expires_at: newExpiry.toISOString(),
                warning_sent: false
            })
            .eq('id', serverId);

        // Créer une transaction
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

        // Journaliser l'activité
        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'server_renewal',
                coins_earned: -coins,
                description: `Renouvellement du serveur "${server.server_name}" pour ${coins} coins`
            }]);

        // Email de confirmation
        await sendEmail(
            req.user.email,
            '✅ Serveur renouvelé avec succès',
            `<p>Bonjour ${req.user.username},</p>
             <p>Votre serveur <strong>${server.server_name}</strong> a été renouvelé.</p>
             <p>Nouvelle date d'expiration : ${newExpiry.toLocaleDateString('fr-FR')}</p>`
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
        message: '🚀 KermHosting opérationnel',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        payment: 'Fapshi Live',
        features: {
            payments: 'FCFA',
            mobile_money: true,
            pterodactyl: true,
            referrals: true,
            daily_rewards: true
        }
    });
});

// =============================================
// ROUTES ADMIN (simplifiées)
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

// =============================================
// CRON JOBS
// =============================================

// Vérification des serveurs expirant bientôt (toutes les 6 heures)
cron.schedule('0 */6 * * *', async () => {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 3);

    const { data: expiringServers } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .lte('expires_at', warningDate.toISOString())
        .eq('warning_sent', false)
        .eq('status', 'active');

    for (const server of expiringServers || []) {
        const daysLeft = Math.ceil((new Date(server.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
        
        try {
            await sendEmail(
                server.profiles.email,
                '⚠️ Votre serveur expire bientôt',
                `<p>Bonjour ${server.profiles.username},</p>
                 <p>Votre serveur <strong>${server.server_name}</strong> expire dans ${daysLeft} jours.</p>
                 <p><a href="${SITE_CONFIG.url}/dashboard">Renouveler maintenant</a></p>`
            );
        } catch (emailError) {
            console.error('❌ Erreur email expiration:', emailError);
        }

        await supabase
            .from('servers')
            .update({ warning_sent: true })
            .eq('id', server.id);
    }
});

// Suppression des serveurs expirés (tous les jours à 2h)
cron.schedule('0 2 * * *', async () => {
    const { data: expiredServers } = await supabase
        .from('servers')
        .select('*, profiles(*)')
        .lte('expires_at', new Date().toISOString())
        .eq('status', 'active');

    for (const server of expiredServers || []) {
        await deletePterodactylServer(server.pterodactyl_id);
        
        await supabase
            .from('servers')
            .update({ status: 'deleted' })
            .eq('id', server.id);

        try {
            await sendEmail(
                server.profiles.email,
                '🗑️ Votre serveur a été supprimé',
                `<p>Bonjour ${server.profiles.username},</p>
                 <p>Votre serveur <strong>${server.server_name}</strong> a été supprimé car il a expiré.</p>`
            );
        } catch (emailError) {
            console.error('❌ Erreur email suppression:', emailError);
        }
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
app.get('/server/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'view.html')));
app.get('/server/:id/files', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'files.html')));

app.get('*', (req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// =============================================
// DÉMARRAGE
// =============================================

server.listen(SITE_CONFIG.port, async () => {
    console.log(`\n🚀 KERMHOSTING DÉMARRÉ SUR LE PORT ${SITE_CONFIG.port}`);
    console.log(`💰 Mode paiement: Fapshi LIVE`);
    console.log(`📧 Email: ${MAILGUN_CONFIG.from}`);
    console.log(`🎮 Pterodactyl: ${PTERODACTYL_CONFIG.url}`);
    console.log(`================================\n`);
    
    await createDefaultSuperAdmin();
});
