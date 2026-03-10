// =============================================
// index.js - KERMHOSTING BACKEND ULTIME - VERSION EMAILS SIMPLIFIÉS
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
    apiuser: '42ae50a1-35e3-4422-b422-d238d4548bf1',
    apikey: 'FAK_6c6b308a5566c995c669a7b9cfcc8ac6',
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
    applicationApiKey: 'ptla_fMpRQCBRNa3M99H6NIj5erUSsYjqcCzE7x6chbjR2Fy',
    clientApiKey: 'ptlc_bmegICkSoLH06PmBBjcHA0aUFvK9niMvRweUImEgDfd'
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
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
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
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
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
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
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
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
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
        duration_days: 7,
        egg_id: 15,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_24',
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
app.use(cors({
    origin: SITE_CONFIG.url,
    credentials: true
}));
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
const generateTransactionId = () => crypto.randomUUID();
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
// FONCTIONS EMAIL SIMPLIFIÉES (ANTI-SPAM)
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

// Version pour le support
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

// Template de base simplifié
function getBaseEmailTemplate(title, content) {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KermHosting</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f6f6f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
        <tr>
            <td style="padding: 30px; text-align: center; background-color: #7C3AED; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 500;">KermHosting</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                ${content}
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; text-align: center; background-color: #f9f9f9; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 5px 0;">KermHosting - Hébergement Node.js</p>
                <p style="margin: 5px 0;">© ${year} Tous droits réservés.</p>
                <p style="margin: 5px 0;">
                    <a href="${SITE_CONFIG.url}" style="color: #7C3AED; text-decoration: none;">${SITE_CONFIG.url}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Template de vérification d'email - VERSION SIMPLIFIÉE
function getVerificationEmailHtml(username, code) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Bienvenue ${username} !</h2>
        <p style="color: #555; line-height: 1.6;">Merci de vous être inscrit sur KermHosting. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
        
        <div style="background-color: #f5f5f5; border: 2px solid #7C3AED; border-radius: 5px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #7C3AED; letter-spacing: 5px;">${code}</span>
        </div>
        
        <p style="color: #666; font-size: 14px;">Ce code expirera dans 15 minutes pour des raisons de sécurité.</p>
        
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas créé de compte sur KermHosting, ignorez cet email.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        
        <p style="color: #7C3AED; font-size: 14px; text-align: center;">
            <a href="${SITE_CONFIG.url}" style="color: #7C3AED;">Accéder à KermHosting</a>
        </p>
    `;
    return getBaseEmailTemplate('Vérification de votre compte', content);
}

// Template de bienvenue - VERSION SIMPLIFIÉE
function getWelcomeEmailHtml(username) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Félicitations ${username} !</h2>
        <p style="color: #555; line-height: 1.6;">Votre compte a été vérifié avec succès. Vous pouvez maintenant créer votre premier serveur et profiter de nos services.</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Pour commencer :</h3>
            <ol style="color: #555; margin-left: 20px; padding-left: 0;">
                <li style="margin-bottom: 10px;">Connectez-vous à votre tableau de bord</li>
                <li style="margin-bottom: 10px;">Créez votre premier serveur (offre gratuite 24h incluse)</li>
                <li style="margin-bottom: 10px;">Déployez vos projets Node.js</li>
            </ol>
        </div>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Accéder au tableau de bord</a>
        </p>
    `;
    return getBaseEmailTemplate('Bienvenue sur KermHosting !', content);
}

// Template de réinitialisation de mot de passe - VERSION SIMPLIFIÉE
function getResetEmailHtml(username, code) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous :</p>
        
        <div style="background-color: #f5f5f5; border: 2px solid #7C3AED; border-radius: 5px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #7C3AED; letter-spacing: 5px;">${code}</span>
        </div>
        
        <p style="color: #666; font-size: 14px;">Ce code expirera dans 15 minutes.</p>
        
        <p style="color: #666; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/reset-password" style="color: #7C3AED;">Changer mon mot de passe</a>
        </p>
    `;
    return getBaseEmailTemplate('Réinitialisation de mot de passe', content);
}

// Template de confirmation d'achat de serveur - VERSION SIMPLIFIÉE
function getPurchaseConfirmationHtml(username, plan, serverCredentials) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Serveur créé avec succès</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Votre serveur <strong>${serverCredentials.server_name}</strong> (plan ${plan.name}) a été créé avec succès.</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Informations de connexion :</h3>
            <table width="100%" cellpadding="5" cellspacing="0">
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
        
        <p style="color: #c0392b; font-size: 14px; background-color: #fee; padding: 10px; border-radius: 5px;">Important : conservez ces informations précieusement. Elles ne seront plus affichées.</p>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Gérer mon serveur</a>
        </p>
    `;
    return getBaseEmailTemplate('Confirmation de création de serveur', content);
}

// Template de confirmation d'achat de coins - VERSION SIMPLIFIÉE
function getCoinsPurchaseHtml(username, pack, totalCoins) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Achat de coins confirmé</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Votre achat de coins a été crédité avec succès sur votre compte.</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0; text-align: center;">
            <div style="font-size: 48px; font-weight: bold; color: #7C3AED; margin-bottom: 10px;">${totalCoins}</div>
            <div style="color: #666;">Coins crédités</div>
            <div style="margin-top: 15px; color: #555;">Pack : ${pack.name}</div>
            ${pack.bonus > 0 ? `<div style="color: #27ae60;">Bonus : +${pack.bonus} coins</div>` : ''}
        </div>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/pricing" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Créer un serveur</a>
        </p>
    `;
    return getBaseEmailTemplate('Achat de coins confirmé', content);
}

// Template de notification de parrainage - AVEC LIEN CORRIGÉ
function getReferralNotificationHtml(username, referrerName, referralLink) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Nouveau filleul !</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">${referrerName} vient de s'inscrire sur KermHosting en utilisant votre lien de parrainage.</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #7C3AED; margin-bottom: 5px;">20 coins</div>
            <div style="color: #666;">Crédités sur votre compte</div>
        </div>
        
        <p style="color: #555;">Continuez à partager votre lien de parrainage :</p>
        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 15px 0; word-break: break-all; font-family: monospace; color: #7C3AED;">
            ${referralLink}
        </div>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/profile" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Voir mes statistiques</a>
        </p>
    `;
    return getBaseEmailTemplate('Nouveau filleul !', content);
}

// Template de bienvenue pour filleul - AVEC LIEN CORRIGÉ
function getReferralWelcomeHtml(username, referrerName, referralLink) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Bienvenue sur KermHosting !</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Vous avez été parrainé par ${referrerName}. Bienvenue dans notre communauté !</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Bonus de bienvenue :</strong> 10 coins</p>
            <p style="margin: 5px 0;"><strong>Total de départ :</strong> 15 coins (10 parrainage + 5 inscription)</p>
        </div>
        
        <div style="margin: 25px 0;">
            <p style="color: #555;">Pour commencer :</p>
            <ol style="color: #555;">
                <li style="margin-bottom: 10px;">Vérifiez votre email pour activer votre compte</li>
                <li style="margin-bottom: 10px;">Créez votre premier serveur (offre gratuite 24h)</li>
                <li style="margin-bottom: 10px;">Partagez votre lien de parrainage pour gagner plus de coins</li>
            </ol>
        </div>
        
        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #666;">Votre lien de parrainage :</p>
            <p style="margin: 10px 0 0; word-break: break-all; font-family: monospace; color: #7C3AED;">${referralLink}</p>
        </div>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Accéder au tableau de bord</a>
        </p>
    `;
    return getBaseEmailTemplate('Bienvenue sur KermHosting !', content);
}

// Template d'expiration de serveur
function getServerExpiringHtml(username, server, daysLeft) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Votre serveur expire bientôt</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Votre serveur <strong>"${server.server_name}"</strong> expirera dans <strong>${daysLeft} jours</strong>.</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #856404;">Pour éviter la suppression de votre serveur, veuillez le renouveler avant la date d'expiration.</p>
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
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/dashboard" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Renouveler maintenant</a>
        </p>
    `;
    return getBaseEmailTemplate('Alerte expiration', content);
}

// Template de confirmation de changement d'email
function getEmailChangedConfirmationHtml(username, newEmail) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Email modifié avec succès</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Votre adresse email a été modifiée avec succès.</p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #7C3AED; border-radius: 5px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #555;">Nouvelle adresse : <strong>${newEmail}</strong></p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Pour vous connecter, utilisez désormais cette nouvelle adresse email.</p>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/login" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Se connecter</a>
        </p>
    `;
    return getBaseEmailTemplate('Email modifié', content);
}

// Template de suppression de compte
function getAccountDeletedHtml(username) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Compte supprimé</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Nous confirmons la suppression de votre compte KermHosting conformément à votre demande.</p>
        
        <div style="background-color: #fee; border: 1px solid #fcc; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #c0392b;">Toutes vos données personnelles, serveurs et transactions ont été supprimés.</p>
        </div>
        
        <p style="color: #555;">Nous espérons vous revoir bientôt sur KermHosting.</p>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}" style="color: #7C3AED;">Retour à l'accueil</a>
        </p>
    `;
    return getBaseEmailTemplate('Compte supprimé', content);
}

// =============================================
// ROUTE DE TEST RESEND
// =============================================
app.get('/api/test-resend', async (req, res) => {
    try {
        const result = await sendEmail(
            'bookmakerp@gmail.com',
            'Test Resend - KermHosting',
            '<p>Test réussi !</p>'
        );

        if (result.success) {
            res.json({ success: true, message: 'Email envoyé avec succès !' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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
            dockerImage = 'ghcr.io/parkervcp/yolks:nodejs_24',
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

// Paiement direct (push sur téléphone)
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

// Initier un paiement (redirection)
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

// Vérifier le statut d'une transaction
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

// Vérifier le solde du compte
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
// ROUTES AUTH
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

        let referrerId = null;
        let referrerName = null;
        let referrerData = null;

        if (referral_code) {
            const { data: referrer } = await supabase
                .from('profiles')
                .select('id, username, email')
                .eq('referral_code', referral_code)
                .maybeSingle();

            if (referrer) {
                referrerId = referrer.id;
                referrerName = referrer.username;
                referrerData = referrer;
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
                coins: 10,
                badges: []
            }])
            .select()
            .single();

        if (error) {
            return res.status(500).json({ success: false, error: 'Erreur création compte', code: 'REGISTER_ERROR' });
        }

        await sendEmail(
            email,
            'Code de vérification KermHosting',
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
                    .update({ coins: referrerData.coins + 20 })
                    .eq('id', referrerId);
            }

            const { data: newUserData } = await supabase
                .from('profiles')
                .select('coins')
                .eq('id', newUser.id)
                .single();
            
            if (newUserData) {
                await supabase
                    .from('profiles')
                    .update({ coins: newUserData.coins + 10 })
                    .eq('id', newUser.id);
            }

            await supabase
                .from('referrals')
                .insert([{
                    referrer_id: referrerId,
                    referred_id: newUser.id,
                    coins_rewarded: 20
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
                    'Nouveau filleul sur KermHosting',
                    getReferralNotificationHtml(referrerName, username, referrerLink)
                );
            }

            if (newUser) {
                const userLink = `${SITE_CONFIG.url}/register?ref=${newUser.referral_code}`;
                await sendEmail(
                    email,
                    'Bienvenue sur KermHosting',
                    getReferralWelcomeHtml(username, referrerName, userLink)
                );
            }
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
                coins: user.coins + 5
            })
            .eq('id', user.id);

        await sendEmail(
            email,
            'Bienvenue sur KermHosting',
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
            'Nouveau code de vérification KermHosting',
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
            'Réinitialisation de mot de passe KermHosting',
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
// ROUTES DE PAIEMENT
// =============================================

// Paiement direct pour acheter des serveurs
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

// Paiement direct pour acheter des coins
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
                        'Achat de coins confirmé',
                        getCoinsPurchaseHtml(
                            user.username, 
                            { name: transaction.metadata?.pack?.name || 'Pack de coins' }, 
                            coinsToAdd
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

// =============================================
// WEBHOOK FAPSHI
// =============================================
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
                                'Achat de coins confirmé',
                                getCoinsPurchaseHtml(
                                    user.username, 
                                    { name: transaction.metadata?.pack?.name || 'Pack de coins' }, 
                                    coinsToAdd
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
            'Code de vérification pour votre nouvel email',
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
            'Votre email a été modifié',
            getEmailChangedConfirmationHtml(req.user.username, pendingEmail)
        );

        await sendEmail(
            pendingEmail,
            'Bienvenue sur votre nouvelle adresse',
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
            'Compte supprimé',
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

        const pteroEmail = `${server_username.toLowerCase()}@kermhosting.local`;
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
            'Votre serveur a été créé',
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
                warning_sent: false
            })
            .eq('id', serverId);

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
// ROUTES RÉCOMPENSE QUOTIDIENNE
// =============================================

app.post('/api/daily-reward', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toDateString();
        const now = new Date();

        if (req.user.last_daily_login === today) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vous avez déjà réclamé votre récompense aujourd\'hui. Revenez demain !', 
                code: 'DAILY_REWARD_ALREADY_CLAIMED' 
            });
        }

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
        
        if (req.user.last_daily_login === yesterday) {
            streakCount = (req.user.daily_login_streak || 0) + 1;
            coinsReward = 5 + Math.min(5, streakCount);
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
                total_coins: totalCoins
            }
        });

    } catch (error) {
        console.error('❌ Erreur stats:', error);
        res.status(500).json({ success: false, error: error.message });
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
                'Votre compte KermHosting a été suspendu',
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
                'Votre compte KermHosting a été supprimé',
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
            const servers = await callPterodactylAPI(`/api/application/servers?filter[node_id]=${nodeId}`);
            
            const nodeRAM = node.attributes.memory;
            const nodeDisk = node.attributes.disk;
            
            totalRAM += nodeRAM;
            totalDisk += nodeDisk;
            
            const nodeServers = servers.data || [];
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

// =============================================
// TEMPLATE DE SUSPENSION DE COMPTE
// =============================================
function getAccountSuspendedHtml(username, reason) {
    const content = `
        <h2 style="color: #333; margin-top: 0;">Compte suspendu</h2>
        <p style="color: #555; line-height: 1.6;">Bonjour ${username},</p>
        <p style="color: #555; line-height: 1.6;">Nous vous informons que votre compte KermHosting a été temporairement suspendu.</p>
        
        <div style="background-color: #fee; border: 1px solid #fcc; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #c0392b;">Raison : ${reason || 'Non-respect des conditions d\'utilisation.'}</p>
        </div>
        
        <p style="color: #555;">Pour plus d'informations, veuillez contacter notre support.</p>
        
        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="margin: 5px 0;"><strong>Support :</strong></p>
            <p style="margin: 5px 0;">Email: <a href="mailto:${SITE_CONFIG.supportEmail}" style="color: #7C3AED;">${SITE_CONFIG.supportEmail}</a></p>
            <p style="margin: 5px 0;">WhatsApp: <a href="${SITE_CONFIG.whatsapp}" style="color: #7C3AED;">Cliquez ici</a></p>
            <p style="margin: 5px 0;">Discord: <a href="${SITE_CONFIG.discord}" style="color: #7C3AED;">Rejoindre</a></p>
        </div>
        
        <p style="text-align: center; margin: 25px 0;">
            <a href="${SITE_CONFIG.url}/support" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Contacter le support</a>
        </p>
    `;
    return getBaseEmailTemplate('Compte suspendu', content);
}

// =============================================
// CRON JOBS
// =============================================

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
        
        await sendEmail(
            server.profiles.email,
            'Votre serveur expire bientôt',
            getServerExpiringHtml(server.profiles.username, server, daysLeft)
        );

        await supabase
            .from('servers')
            .update({ warning_sent: true })
            .eq('id', server.id);
    }
});

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

        await sendEmail(
            server.profiles.email,
            'Votre serveur a été supprimé',
            getServerDeletedHtml(server.profiles.username, server)
        );
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
app.get('/transactions', (req, res) => res.sendFile(path.join(__dirname, 'public', 'transactions.html')));
app.get('/server/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'view.html')));
app.get('/server/:id/files', (req, res) => res.sendFile(path.join(__dirname, 'public', 'server', 'files.html')));

app.get('*', (req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// =============================================
// DÉMARRAGE
// =============================================

server.listen(SITE_CONFIG.port, async () => {
    console.log(`\n🚀 KERMHOSTING DÉMARRÉ SUR LE PORT ${SITE_CONFIG.port}`);
    console.log(`💰 Mode paiement: Fapshi LIVE`);
    console.log(`📧 Email via Resend: ${RESEND_CONFIG.from}`);
    console.log(`🎮 Pterodactyl: ${PTERODACTYL_CONFIG.url}`);
    console.log(`================================\n`);
    
    await createDefaultSuperAdmin();

    const balance = await fapshiBalance();
    if (balance.success) {
        console.log(`✅ Fapshi connecté - Solde: ${balance.balance} FCFA`);
    } else {
        console.log(`❌ Erreur Fapshi: ${balance.message}`);
    }
});
