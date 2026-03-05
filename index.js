// =============================================
// index.js - KERMHOSTING BACKEND ULTIME - VERSION FINALE
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

const fapshiHeaders = {
    apiuser: FAPSHI_CONFIG.apiuser,
    apikey: FAPSHI_CONFIG.apikey
};

// =============================================
// CONFIGURATION EMAIL AVEC MAILGUN
// =============================================
const MAILGUN_CONFIG = {
    apiKey: '63d0998dc9c741d099cfa966429ec4f8-82cf32bf-e8564515',
    domain: 'sandboxe7ebd2a141ff47379c7254dffc97aaf2.mailgun.org',
    from: 'KermHosting☁️ <postmaster@sandboxe7ebd2a141ff47379c7254dffc97aaf2.mailgun.org>'
};

// =============================================
// CONFIGURATION PTERODACTYL
// =============================================
const PTERODACTYL_CONFIG = {
    url: 'https://panel.lionelmelo.qzz.io',
    applicationApiKey: 'ptla_iKK0lnh3qpJ4ScboEk98uWvBqpU2BX9hwwrW4es3Atr',
    clientApiKey: 'ptlc_ncE2HpncTdjD8sqNIcQZ1oBOhCq7N4lZ0bpoK8MtXgk'
};

const SITE_CONFIG = {
    url: 'https://kerm-hosting.vercel.app',
    name: 'KermHosting',
    supportEmail: 'bookmakerp@gmail.com',
    whatsapp: 'https://wa.me/237659535227',
    discord: 'https://discord.gg/kermhosting',
    twitter: 'https://twitter.com/kermhosting',
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
// FONCTIONS EMAIL AVEC MAILGUN - TEMPLATES PROFESSIONNELS
// =============================================

async function sendEmail(to, subject, htmlContent) {
    try {
        const formData = new URLSearchParams();
        formData.append('from', MAILGUN_CONFIG.from);
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('html', htmlContent);

        const response = await axios({
            method: 'post',
            url: `https://api.mailgun.net/v3/${MAILGUN_CONFIG.domain}/messages`,
            auth: {
                username: 'api',
                password: MAILGUN_CONFIG.apiKey
            },
            data: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log(`✅ Email envoyé à ${to}`);
        return { success: true };
    } catch (error) {
        // En sandbox, on ignore les erreurs d'autorisation
        if (error.response?.status === 403 || error.response?.status === 401) {
            console.log(`⚠️ Mode sandbox: Email à ${to} non envoyé (destinataire non autorisé)`);
            return { success: true, sandbox: true };
        }
        console.error('❌ Erreur email:', error.response?.data || error.message);
        return { success: false };
    }
}

// Template de base réutilisable pour tous les emails
function getBaseEmailTemplate(title, content, username = '') {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KermHosting</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0B1120 0%, #1A1F2E 100%);
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #1A2332;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid #2D3748;
            position: relative;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #7C3AED, #10B981, #F59E0B);
        }
        .header {
            background: linear-gradient(135deg, #7C3AED 0%, #10B981 100%);
            padding: 48px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 50px;
            margin-bottom: 24px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .logo i {
            font-size: 28px;
            color: white;
        }
        .logo span {
            color: white;
            font-size: 24px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
        }
        .header h1 {
            color: white;
            font-size: 36px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 4px 6px rgba(0,0,0,0.2);
            position: relative;
            font-family: 'Space Grotesk', sans-serif;
        }
        .content {
            padding: 48px 30px;
            background: #1A2332;
        }
        .content h2 {
            color: #F3F4F6;
            font-size: 28px;
            margin-bottom: 20px;
            font-family: 'Space Grotesk', sans-serif;
        }
        .content p {
            color: #9CA3AF;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        .content strong {
            color: #F3F4F6;
        }
        .code-box {
            background: #111827;
            border: 2px solid #7C3AED;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 0 30px rgba(124, 58, 237, 0.2);
        }
        .code {
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: 700;
            color: #7C3AED;
            letter-spacing: 8px;
            text-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
        }
        .code-label {
            color: #6B7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 12px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #7C3AED, #10B981);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(124, 58, 237, 0.4);
        }
        .button.secondary {
            background: transparent;
            border: 2px solid #7C3AED;
            color: #7C3AED;
            box-shadow: none;
        }
        .button.secondary:hover {
            background: rgba(124, 58, 237, 0.1);
        }
        .button.danger {
            background: #EF4444;
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
        }
        .button.danger:hover {
            background: #DC2626;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .info-item {
            background: #111827;
            padding: 20px;
            border-radius: 16px;
            border-left: 4px solid #7C3AED;
        }
        .info-item.warning {
            border-left-color: #F59E0B;
        }
        .info-item.danger {
            border-left-color: #EF4444;
        }
        .info-item.success {
            border-left-color: #10B981;
        }
        .info-item strong {
            color: #F3F4F6;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .info-item span {
            color: #7C3AED;
            font-size: 24px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
        }
        .info-item.warning span {
            color: #F59E0B;
        }
        .info-item.danger span {
            color: #EF4444;
        }
        .info-item.success span {
            color: #10B981;
        }
        .info-item p {
            margin: 10px 0 0;
            font-size: 14px;
        }
        .credentials-box {
            background: #111827;
            border: 2px solid #10B981;
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0;
        }
        .credential-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #2D3748;
        }
        .credential-row:last-child {
            border-bottom: none;
        }
        .credential-label {
            color: #9CA3AF;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .credential-label i {
            color: #7C3AED;
            width: 20px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 600;
            color: #10B981;
            background: #0B1120;
            padding: 6px 12px;
            border-radius: 8px;
            letter-spacing: 1px;
        }
        .warning-box {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid #F59E0B;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #F59E0B;
        }
        .warning-box i {
            font-size: 24px;
        }
        .danger-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #EF4444;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #EF4444;
        }
        .danger-box i {
            font-size: 24px;
        }
        .success-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10B981;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #10B981;
        }
        .success-box i {
            font-size: 24px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #2D3748, transparent);
            margin: 30px 0;
        }
        .footer {
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2D3748;
        }
        .footer p {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #9CA3AF;
            font-size: 20px;
            transition: color 0.3s;
            text-decoration: none;
        }
        .social-links a:hover {
            color: #7C3AED;
        }
        .contact-info {
            background: #111827;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-info p {
            margin: 5px 0;
        }
        .contact-info a {
            color: #7C3AED;
            text-decoration: none;
            font-weight: 600;
        }
        .contact-info a:hover {
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 20px;
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
            .code {
                font-size: 32px;
            }
            .header h1 {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>KermHosting</span>
            </div>
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${year} KermHosting. Tous droits réservés.</p>
            <p>Hébergement Node.js nouvelle génération - Paiement en FCFA</p>
            <div class="social-links">
                <a href="${SITE_CONFIG.discord}"><i class="fab fa-discord"></i></a>
                <a href="${SITE_CONFIG.twitter}"><i class="fab fa-twitter"></i></a>
                <a href="${SITE_CONFIG.whatsapp}"><i class="fab fa-whatsapp"></i></a>
                <a href="#"><i class="fab fa-github"></i></a>
            </div>
            <p style="font-size: 12px; margin-top: 20px;">
                Cet email a été envoyé à l'adresse fournie lors de votre inscription.<br>
                Si vous n'êtes pas à l'origine de cette action, ignorez cet email.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

// Template de vérification d'email
function getVerificationEmailHtml(username, code) {
    const content = `
        <h2>Bienvenue sur KermHosting, ${username} !</h2>
        <p>Nous sommes ravis de vous accueillir. Pour activer votre compte et profiter de tous nos services, veuillez confirmer votre adresse email en utilisant le code ci-dessous :</p>
        
        <div class="code-box">
            <div class="code">${code}</div>
            <div class="code-label">Code de vérification</div>
        </div>
        
        <div class="info-grid">
            <div class="info-item">
                <strong>⏰ Expiration</strong>
                <span>15 minutes</span>
                <p>Le code expirera dans 15 minutes pour des raisons de sécurité</p>
            </div>
            <div class="info-item">
                <strong>🎁 Bonus</strong>
                <span>5 coins</span>
                <p>Vous recevrez 5 coins gratuits après vérification</p>
            </div>
        </div>
        
        <div class="warning-box">
            <i class="fas fa-shield-alt"></i>
            <div>
                <strong>Pourquoi vérifier votre email ?</strong>
                <p style="margin-top: 10px; color: #F59E0B;">La vérification de votre email nous permet de sécuriser votre compte et de vous envoyer des notifications importantes concernant vos serveurs.</p>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/email-verification?email=${encodeURIComponent(username)}" class="button">
                <i class="fas fa-check-circle"></i>
                Vérifier mon email
            </a>
        </p>
        
        <div class="divider"></div>
        
        <p style="font-size: 14px; text-align: center;">
            <i class="fas fa-lightbulb" style="color: #F59E0B;"></i>
            <strong>Astuce :</strong> Après vérification, vous pourrez créer votre premier serveur et commencer à déployer vos projets !
        </p>
    `;
    return getBaseEmailTemplate('Vérification de votre compte', content, username);
}

// Template de bienvenue
function getWelcomeEmailHtml(username) {
    const content = `
        <h2>Félicitations ${username} ! 🎉</h2>
        <p>Votre compte a été vérifié avec succès. Vous faites maintenant partie de la communauté KermHosting, l'hébergement Node.js nouvelle génération.</p>
        
        <div class="success-box">
            <i class="fas fa-check-circle"></i>
            <div><strong> Compte activé avec succès !</strong></div>
        </div>
        
        <div class="info-grid">
            <div class="info-item success">
                <strong>💰 Coins gratuits</strong>
                <span>15 coins</span>
                <p>10 (inscription) + 5 (vérification email)</p>
            </div>
            <div class="info-item">
                <strong>🎁 Serveur gratuit</strong>
                <span>24h d'essai</span>
                <p>Testez nos services sans engagement</p>
            </div>
        </div>
        
        <h3 style="color: #F3F4F6; margin: 30px 0 20px;">🚀 Prochaines étapes :</h3>
        
        <div style="background: #111827; border-radius: 16px; padding: 20px; margin: 20px 0;">
            <ol style="color: #9CA3AF; margin-left: 20px;">
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7C3AED;">Connectez-vous chaque jour</strong> - Gagnez des coins quotidiens
                </li>
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7C3AED;">Parrainez des amis</strong> - 20 coins par filleul
                </li>
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7C3AED;">Créez votre premier serveur</strong> - Déployez vos projets
                </li>
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7C3AED;">Rejoignez notre Discord</strong> - Échangez avec la communauté
                </li>
            </ol>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/dashboard" class="button">
                <i class="fas fa-tachometer-alt"></i>
                Accéder à mon tableau de bord
            </a>
        </p>
        
        <div class="divider"></div>
        
        <p style="font-size: 14px; text-align: center;">
            <i class="fas fa-question-circle" style="color: #7C3AED;"></i>
            Besoin d'aide ? Rejoignez notre <a href="${SITE_CONFIG.discord}" style="color: #7C3AED; text-decoration: none;">Discord</a> ou contactez-nous sur <a href="${SITE_CONFIG.whatsapp}" style="color: #7C3AED; text-decoration: none;">WhatsApp</a>
        </p>
    `;
    return getBaseEmailTemplate('Bienvenue sur KermHosting !', content, username);
}

// Template de réinitialisation de mot de passe
function getResetEmailHtml(username, code) {
    const content = `
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${username},</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte KermHosting. Si vous êtes à l'origine de cette demande, veuillez utiliser le code ci-dessous :</p>
        
        <div class="code-box">
            <div class="code">${code}</div>
            <div class="code-label">Code de réinitialisation</div>
        </div>
        
        <div class="info-grid">
            <div class="info-item">
                <strong>⏰ Expiration</strong>
                <span>15 minutes</span>
                <p>Ce code expirera dans 15 minutes</p>
            </div>
            <div class="info-item">
                <strong>🔒 Sécurité</strong>
                <span>Protégé</span>
                <p>Ne partagez jamais ce code avec personne</p>
            </div>
        </div>
        
        <div class="warning-box">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong> Attention !</strong>
                <p style="margin-top: 10px; color: #F59E0B;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et changez votre mot de passe immédiatement si vous avez des doutes.</p>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/reset-password?email=${encodeURIComponent(username)}" class="button">
                <i class="fas fa-lock"></i>
                Réinitialiser mon mot de passe
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Réinitialisation de mot de passe', content, username);
}

// Template de confirmation d'achat de serveur
function getPurchaseConfirmationHtml(username, plan, serverCredentials) {
    const content = `
        <h2>Merci pour votre confiance, ${username} !</h2>
        <p>Votre serveur <strong>${serverCredentials.server_name}</strong> (plan ${plan.name}) a été créé avec succès !</p>
        
        <div class="success-box">
            <i class="fas fa-check-circle"></i>
            <div><strong> Serveur prêt à être utilisé !</strong></div>
        </div>
        
        <h3 style="color: #7C3AED; margin: 30px 0 20px;">🔑 Identifiants de connexion</h3>
        
        <div class="credentials-box">
            <div class="credential-row">
                <span class="credential-label">
                    <i class="fas fa-server"></i>
                    Nom du serveur
                </span>
                <span class="credential-value">${serverCredentials.server_name}</span>
            </div>
            <div class="credential-row">
                <span class="credential-label">
                    <i class="fas fa-user"></i>
                    Nom d'utilisateur
                </span>
                <span class="credential-value">${serverCredentials.username}</span>
            </div>
            <div class="credential-row">
                <span class="credential-label">
                    <i class="fas fa-lock"></i>
                    Mot de passe
                </span>
                <span class="credential-value">${serverCredentials.password}</span>
            </div>
            <div class="credential-row">
                <span class="credential-label">
                    <i class="fas fa-globe"></i>
                    Panel URL
                </span>
                <span class="credential-value">${PTERODACTYL_CONFIG.url}</span>
            </div>
            <div class="credential-row">
                <span class="credential-label">
                    <i class="fas fa-id"></i>
                    ID du serveur
                </span>
                <span class="credential-value">${serverCredentials.identifier}</span>
            </div>
        </div>
        
        <div class="warning-box">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong> IMPORTANT :</strong>
                <p style="margin-top: 10px; color: #F59E0B;">Conservez ces identifiants précieusement. Ils ne seront plus jamais affichés ! Le mot de passe commence par "Kh-" pour KermHosting.</p>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/dashboard" class="button">
                <i class="fas fa-tachometer-alt"></i>
                Gérer mon serveur
            </a>
        </p>
        
        <div class="contact-info">
            <p><strong>📧 Support :</strong> <a href="mailto:${SITE_CONFIG.supportEmail}">${SITE_CONFIG.supportEmail}</a></p>
            <p><strong>💬 WhatsApp :</strong> <a href="${SITE_CONFIG.whatsapp}">Cliquez ici</a></p>
            <p><strong>🎮 Discord :</strong> <a href="${SITE_CONFIG.discord}">Rejoindre la communauté</a></p>
        </div>
    `;
    return getBaseEmailTemplate('Serveur créé avec succès', content, username);
}

// Template de confirmation d'achat de coins
function getCoinsPurchaseHtml(username, pack, totalCoins) {
    const content = `
        <h2>Félicitations ${username} !</h2>
        <p>Votre achat de coins a été crédité avec succès sur votre compte. Vous pouvez maintenant les utiliser pour créer ou renouveler vos serveurs.</p>
        
        <div class="success-box">
            <i class="fas fa-check-circle"></i>
            <div><strong> ${totalCoins} coins ont été ajoutés à votre compte !</strong></div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 60px; color: #F59E0B; margin-bottom: 20px;">
                <i class="fas fa-coins"></i>
            </div>
            <div style="font-size: 48px; font-weight: 700; color: #F59E0B; margin-bottom: 10px;">
                ${totalCoins}
            </div>
            <div style="color: #9CA3AF; font-size: 18px;">Coins crédités</div>
        </div>
        
        <div class="info-grid">
            <div class="info-item success">
                <strong>📦 Pack</strong>
                <span>${pack.name}</span>
            </div>
            <div class="info-item">
                <strong>💰 Montant</strong>
                <span>${pack.price_fcfa} FCFA</span>
            </div>
            ${pack.bonus > 0 ? `
            <div class="info-item warning">
                <strong>🎁 Bonus</strong>
                <span>+${pack.bonus} coins</span>
            </div>
            ` : ''}
            <div class="info-item">
                <strong>💳 Paiement</strong>
                <span>Mobile Money</span>
            </div>
        </div>
        
        <h3 style="color: #F3F4F6; margin: 30px 0 20px;">🎯 Utilisez vos coins pour :</h3>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 30px;">
            <div style="flex: 1; min-width: 120px; background: #111827; border-radius: 12px; padding: 15px; text-align: center;">
                <i class="fas fa-plus-circle" style="color: #7C3AED; font-size: 24px; margin-bottom: 10px;"></i>
                <div style="color: #F3F4F6; font-weight: 600;">Créer</div>
                <div style="color: #9CA3AF; font-size: 14px;">Nouveaux serveurs</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #111827; border-radius: 12px; padding: 15px; text-align: center;">
                <i class="fas fa-sync-alt" style="color: #10B981; font-size: 24px; margin-bottom: 10px;"></i>
                <div style="color: #F3F4F6; font-weight: 600;">Renouveler</div>
                <div style="color: #9CA3AF; font-size: 14px;">Serveurs existants</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #111827; border-radius: 12px; padding: 15px; text-align: center;">
                <i class="fas fa-gift" style="color: #F59E0B; font-size: 24px; margin-bottom: 10px;"></i>
                <div style="color: #F3F4F6; font-weight: 600;">Offrir</div>
                <div style="color: #9CA3AF; font-size: 14px;">À des amis</div>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/pricing" class="button">
                <i class="fas fa-server"></i>
                Créer un serveur maintenant
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Achat de coins confirmé', content, username);
}

// Template d'expiration de serveur
function getServerExpiringHtml(username, server, daysLeft) {
    const content = `
        <h2>Votre serveur expire bientôt</h2>
        <p>Bonjour ${username},</p>
        <p>Nous vous informons que votre serveur <strong>"${server.server_name}"</strong> expirera dans <strong>${daysLeft} jours</strong>.</p>
        
        <div class="warning-box">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong> Action requise</strong>
                <p style="margin-top: 10px; color: #F59E0B;">Pour éviter la suppression de votre serveur et la perte de vos données, veuillez le renouveler avant la date d'expiration.</p>
            </div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <i class="fas fa-server" style="color: #7C3AED; font-size: 30px;"></i>
                <div>
                    <div style="color: #F3F4F6; font-weight: 600; font-size: 18px;">${server.server_name}</div>
                    <div style="color: #9CA3AF;">${server.server_type}</div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <strong>📅 Création</strong>
                    <span>${new Date(server.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="info-item warning">
                    <strong>⏰ Expiration</strong>
                    <span>${new Date(server.expires_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="info-item">
                    <strong>💰 Prix renouvellement</strong>
                    <span>${PLANS[server.server_type]?.price_fcfa || 0} FCFA</span>
                </div>
                <div class="info-item">
                    <strong>🪙 ou en coins</strong>
                    <span>${Math.floor((PLANS[server.server_type]?.price_fcfa || 0) / 5)} coins</span>
                </div>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/dashboard" class="button">
                <i class="fas fa-sync-alt"></i>
                Renouveler maintenant
            </a>
        </p>
        
        <div class="contact-info">
            <p><strong>❓ Des questions ?</strong> Notre équipe de support est là pour vous aider.</p>
            <p>📧 <a href="mailto:${SITE_CONFIG.supportEmail}">${SITE_CONFIG.supportEmail}</a> | 💬 <a href="${SITE_CONFIG.whatsapp}">WhatsApp</a></p>
        </div>
    `;
    return getBaseEmailTemplate('⚠️ Alerte expiration', content, username);
}

// Template de suppression de serveur
function getServerDeletedHtml(username, server) {
    const content = `
        <h2>Votre serveur a été supprimé</h2>
        <p>Bonjour ${username},</p>
        <p>Votre serveur <strong>"${server.server_name}"</strong> a été automatiquement supprimé car il a expiré.</p>
        
        <div class="danger-box">
            <i class="fas fa-trash-alt"></i>
            <div>
                <strong> Suppression effectuée</strong>
                <p style="margin-top: 10px; color: #EF4444;">Toutes les données associées à ce serveur ont été supprimées définitivement.</p>
            </div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <div class="info-item danger" style="margin-bottom: 0;">
                <strong>📋 Détails du serveur supprimé</strong>
                <p style="margin-top: 10px;">
                    Plan : ${PLANS[server.server_type]?.name || server.server_type}<br>
                    Date de création : ${new Date(server.created_at).toLocaleDateString('fr-FR')}<br>
                    Date d'expiration : ${new Date(server.expires_at).toLocaleDateString('fr-FR')}
                </p>
            </div>
        </div>
        
        <p>Vous pouvez toujours recréer un serveur quand vous le souhaitez. Vos coins et votre compte sont toujours actifs.</p>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/pricing" class="button">
                <i class="fas fa-plus-circle"></i>
                Créer un nouveau serveur
            </a>
        </p>
        
        <div class="contact-info">
            <p><strong>❓ Vous pensez qu'il s'agit d'une erreur ?</strong></p>
            <p>Contactez notre support : <a href="mailto:${SITE_CONFIG.supportEmail}">${SITE_CONFIG.supportEmail}</a> ou <a href="${SITE_CONFIG.whatsapp}">WhatsApp</a></p>
        </div>
    `;
    return getBaseEmailTemplate('🗑️ Serveur supprimé', content, username);
}

// Template de notification de parrainage
function getReferralNotificationHtml(username, referrerName) {
    const content = `
        <h2>🎉 Quelqu'un a utilisé votre lien de parrainage !</h2>
        <p>Bonjour ${username},</p>
        <p><strong>${referrerName}</strong> vient de s'inscrire sur KermHosting en utilisant votre lien de parrainage.</p>
        
        <div class="success-box">
            <i class="fas fa-check-circle"></i>
            <div><strong> +20 coins ont été crédités sur votre compte !</strong></div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 48px; color: #F59E0B; margin-bottom: 20px;">
                <i class="fas fa-coins"></i>
            </div>
            <div style="font-size: 36px; font-weight: 700; color: #F3F4F6; margin-bottom: 10px;">
                20 coins
            </div>
            <div style="color: #9CA3AF;">Crédités instantanément</div>
        </div>
        
        <p>Continuez à partager votre lien de parrainage pour gagner encore plus de coins !</p>
        
        <div style="background: #111827; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <div style="color: #9CA3AF; margin-bottom: 5px;">Votre lien de parrainage</div>
            <div style="color: #7C3AED; font-weight: 600; word-break: break-all;">${SITE_CONFIG.url}/register?ref=${username}</div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/profile" class="button secondary">
                <i class="fas fa-chart-line"></i>
                Voir mes statistiques
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Nouveau filleul !', content, username);
}

// Template de bienvenue pour filleul
function getReferralWelcomeHtml(username, referrerName) {
    const content = `
        <h2>Bienvenue sur KermHosting, ${username} !</h2>
        <p>Vous avez été parrainé par <strong>${referrerName}</strong>. Bienvenue dans notre communauté !</p>
        
        <div class="success-box">
            <i class="fas fa-gift"></i>
            <div><strong> +10 coins de bienvenue ont été crédités sur votre compte !</strong></div>
        </div>
        
        <div class="info-grid">
            <div class="info-item success">
                <strong>🎁 Votre bonus</strong>
                <span>10 coins</span>
                <p>Offerts grâce à votre parrain</p>
            </div>
            <div class="info-item">
                <strong>💰 Total de départ</strong>
                <span>15 coins</span>
                <p>10 (parrainage) + 5 (inscription)</p>
            </div>
        </div>
        
        <h3 style="color: #F3F4F6; margin: 30px 0 20px;">🚀 Pour commencer :</h3>
        
        <ol style="color: #9CA3AF; margin-left: 20px;">
            <li style="margin-bottom: 15px;">✅ <strong style="color: #7C3AED;">Vérifiez votre email</strong> - 5 coins bonus</li>
            <li style="margin-bottom: 15px;">✅ <strong style="color: #7C3AED;">Créez votre premier serveur</strong> - Profitez de votre serveur gratuit 24h</li>
            <li style="margin-bottom: 15px;">✅ <strong style="color: #7C3AED;">Parrainez à votre tour</strong> - Gagnez 20 coins par ami</li>
        </ol>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/dashboard" class="button">
                <i class="fas fa-tachometer-alt"></i>
                Commencer maintenant
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Bienvenue sur KermHosting !', content, username);
}

// Template de renouvellement de serveur
function getRenewalConfirmationHtml(username, server, newExpiry, coins) {
    const content = `
        <h2>Renouvellement confirmé !</h2>
        <p>Bonjour ${username},</p>
        <p>Votre serveur <strong>"${server.server_name}"</strong> a été renouvelé avec succès.</p>
        
        <div class="success-box">
            <i class="fas fa-check-circle"></i>
            <div><strong> Renouvellement effectué</strong></div>
        </div>
        
        <div class="info-grid">
            <div class="info-item success">
                <strong>📅 Nouvelle expiration</strong>
                <span>${newExpiry.toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-item">
                <strong>💰 Coins déduits</strong>
                <span>${coins} coins</span>
            </div>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/dashboard" class="button">
                <i class="fas fa-tachometer-alt"></i>
                Voir mon serveur
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Renouvellement confirmé', content, username);
}

// Template de suspension de compte (NOUVEAU)
function getAccountSuspendedHtml(username, reason) {
    const content = `
        <h2>⚠️ Compte suspendu</h2>
        <p>Bonjour ${username},</p>
        <p>Nous vous informons que votre compte KermHosting a été temporairement suspendu.</p>
        
        <div class="danger-box">
            <i class="fas fa-ban"></i>
            <div>
                <strong> Suspension de compte</strong>
                <p style="margin-top: 10px; color: #EF4444;">${reason || 'Pour non-respect des conditions d\'utilisation.'}</p>
            </div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #F3F4F6; margin-bottom: 15px;">❓ Que faire ?</h3>
            <ul style="color: #9CA3AF; margin-left: 20px;">
                <li style="margin-bottom: 10px;">Vérifiez vos emails pour plus d'informations</li>
                <li style="margin-bottom: 10px;">Contactez notre support pour plus de détails</li>
                <li style="margin-bottom: 10px;">Si vous pensez qu'il s'agit d'une erreur, notre équipe est là pour vous aider</li>
            </ul>
        </div>
        
        <div class="contact-info">
            <p><strong>📞 Contactez le support :</strong></p>
            <p>📧 <a href="mailto:${SITE_CONFIG.supportEmail}">${SITE_CONFIG.supportEmail}</a></p>
            <p>💬 <a href="${SITE_CONFIG.whatsapp}">WhatsApp</a></p>
            <p>🎮 <a href="${SITE_CONFIG.discord}">Discord</a></p>
        </div>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/support" class="button secondary">
                <i class="fas fa-headset"></i>
                Contacter le support
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Compte suspendu', content, username);
}

// Template de suppression de compte (NOUVEAU)
function getAccountDeletedHtml(username) {
    const content = `
        <h2>🗑️ Compte supprimé</h2>
        <p>Bonjour ${username},</p>
        <p>Votre compte KermHosting a été supprimé conformément à votre demande ou suite à une période d'inactivité prolongée.</p>
        
        <div class="danger-box">
            <i class="fas fa-trash-alt"></i>
            <div>
                <strong> Suppression définitive</strong>
                <p style="margin-top: 10px; color: #EF4444;">Toutes les données associées à ce compte ont été supprimées définitivement.</p>
            </div>
        </div>
        
        <div style="background: #111827; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #F3F4F6; margin-bottom: 15px;">📋 Information importante</h3>
            <p style="color: #9CA3AF;">Conformément à notre politique de confidentialité, toutes vos données personnelles, serveurs et transactions ont été effacés de nos systèmes.</p>
        </div>
        
        <p>Si vous souhaitez revenir chez KermHosting, vous pouvez créer un nouveau compte à tout moment. Nous serions ravis de vous revoir !</p>
        
        <p style="text-align: center;">
            <a href="${SITE_CONFIG.url}/register" class="button">
                <i class="fas fa-user-plus"></i>
                Créer un nouveau compte
            </a>
        </p>
        
        <p style="text-align: center; margin-top: 20px;">
            <a href="${SITE_CONFIG.url}/support" class="button secondary">
                <i class="fas fa-question-circle"></i>
                Questions ? Contactez le support
            </a>
        </p>
    `;
    return getBaseEmailTemplate('Compte supprimé', content, username);
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
                .select('email')
                .eq('id', referrerId)
                .single();
            
            if (referrerEmail) {
                await sendEmail(
                    referrerEmail.email,
                    '🎉 Quelqu\'un a utilisé votre lien de parrainage !',
                    getReferralNotificationHtml(referrerName, username)
                );
            }

            await sendEmail(
                email,
                '🎁 Bienvenue sur KermHosting !',
                getReferralWelcomeHtml(username, referrerName)
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
                coins: user.coins + 5
            })
            .eq('id', user.id);

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
// ROUTES PAIEMENT FAPSHI (CORRIGÉES - sans champ medium)
// =============================================

app.post('/api/payment/direct-server', authenticateToken, requireEmailVerification, async (req, res) => {
    try {
        const { plan_id, phone, medium, server_name, server_username } = req.body;

        if (!plan_id || !PLANS[plan_id] || plan_id === 'free') {
            return res.status(400).json({ success: false, error: 'Plan invalide', code: 'INVALID_PLAN' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Numéro de téléphone requis', code: 'PHONE_REQUIRED' });
        }

        const plan = PLANS[plan_id];
        const transactionId = generateTransactionId();

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
                    medium,
                    server_name,
                    server_username 
                }
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
                    pack, 
                    phone,
                    medium 
                }
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur insertion transaction:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erreur création transaction',
                details: error.message 
            });
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
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur', 
            details: error.message,
            code: 'PAYMENT_ERROR' 
        });
    }
});

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
                const { data: user } = await supabase
                    .from('profiles')
                    .select('coins, email, username')
                    .eq('id', transaction.user_id)
                    .single();

                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ coins: user.coins + transaction.coins_amount })
                        .eq('id', transaction.user_id);

                    const pack = COIN_PACKS[transaction.pack_id];
                    await sendEmail(
                        user.email,
                        '💰 Achat de coins confirmé',
                        getCoinsPurchaseHtml(user.username, pack, transaction.coins_amount)
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

// 1. Modifier le nom d'utilisateur
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

        // Vérifier si le nom d'utilisateur est déjà pris
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

        // Mettre à jour le nom d'utilisateur
        const { error } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', req.user.id);

        if (error) throw error;

        // Journaliser l'activité
        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'profile_update',
                description: `Changement de nom d'utilisateur`
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

// 2. Demander le changement d'email (envoi de code)
app.post('/api/user/request-email-change', authenticateToken, async (req, res) => {
    try {
        const { new_email } = req.body;

        if (!new_email || !new_email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email invalide' 
            });
        }

        // Vérifier si l'email est déjà utilisé
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

        // Générer un code de vérification
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Stocker temporairement la demande (dans metadata ou table séparée)
        // Ici on utilise les metadata du profil
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

        // Envoyer l'email avec le code
        await sendEmail(
            new_email,
            '🔐 Code de vérification pour votre nouvel email',
            getVerificationEmailHtml(req.user.username, verificationCode)
        );

        res.json({ 
            success: true, 
            message: 'Code de vérification envoyé' 
        });

    } catch (error) {
        console.error('❌ Erreur request email change:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// 3. Confirmer le changement d'email avec le code
app.post('/api/user/confirm-email-change', authenticateToken, async (req, res) => {
    try {
        const { new_email, code } = req.body;

        if (!new_email || !code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email et code requis' 
            });
        }

        // Récupérer les données temporaires
        const pendingEmail = req.user.metadata?.pending_email;
        const pendingCode = req.user.metadata?.pending_email_code;
        const pendingExpires = req.user.metadata?.pending_email_expires;

        if (!pendingEmail || pendingEmail !== new_email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Aucune demande en cours pour cet email' 
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

        // Mettre à jour l'email
        const { error } = await supabase
            .from('profiles')
            .update({ 
                email: new_email,
                metadata: {
                    ...req.user.metadata,
                    pending_email: null,
                    pending_email_code: null,
                    pending_email_expires: null
                }
            })
            .eq('id', req.user.id);

        if (error) throw error;

        // Journaliser l'activité
        await supabase
            .from('user_activities')
            .insert([{
                user_id: req.user.id,
                activity_type: 'profile_update',
                description: `Changement d'email`
            }]);

        // Envoyer un email de confirmation à l'ancienne adresse
        await sendEmail(
            req.user.email,
            '📧 Votre email a été modifié',
            `<p>Bonjour ${req.user.username},</p>
             <p>Votre adresse email a été changée pour ${new_email}.</p>
             <p>Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement le support.</p>`
        );

        res.json({ 
            success: true, 
            message: 'Email mis à jour avec succès' 
        });

    } catch (error) {
        console.error('❌ Erreur confirm email change:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});

// 4. Supprimer le compte utilisateur
app.post('/api/user/delete-account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe requis' 
            });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, req.user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mot de passe incorrect' 
            });
        }

        // Récupérer tous les serveurs de l'utilisateur pour les supprimer de Pterodactyl
        const { data: servers } = await supabase
            .from('servers')
            .select('pterodactyl_id')
            .eq('user_id', req.user.id);

        // Supprimer les serveurs de Pterodactyl
        for (const server of servers || []) {
            if (server.pterodactyl_id) {
                await deletePterodactylServer(server.pterodactyl_id);
            }
        }

        // Envoyer un email de confirmation avant suppression
        await sendEmail(
            req.user.email,
            '👋 Au revoir et merci !',
            `<p>Bonjour ${req.user.username},</p>
             <p>Votre compte KermHosting a été supprimé conformément à votre demande.</p>
             <p>Toutes vos données personnelles, serveurs et transactions ont été effacés définitivement.</p>
             <p>Nous espérons vous revoir bientôt !</p>`
        );

        // Supprimer l'utilisateur (les serveurs et transactions seront supprimés en cascade)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', req.user.id);

        if (error) throw error;

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
            '✅ Votre serveur a été créé !',
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
// ROUTES RÉCOMPENSE QUOTIDIENNE
// =============================================

app.post('/api/daily-reward', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toDateString();
        const now = new Date();

        if (req.user.last_daily_login === today) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vous avez déjà réclamé votre récompense aujourd\'hui🚨. Revenez demain🙏🏽 !', 
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
            message: `Félicitations ! Vous avez gagné ${coinsReward} coins (série: ${streakCount} jours🫦)`,
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
        message: '🚀 KermHosting opérationnel',
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
// ROUTES ADMIN COMPLÈTES (AVEC TOUTES LES DONNÉES)
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

// Récupérer tous les utilisateurs
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

// Récupérer tous les serveurs
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

// Récupérer toutes les transactions
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

// Récupérer les logs admin
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

// Statistiques admin
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

// Bannir/Débannir un utilisateur
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

        // Envoyer un email si banni
        if (banned && user) {
            await sendEmail(
                user.email,
                '⚠️ Votre compte KermHosting a été suspendu',
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

// Ajouter des coins
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

// Retirer des coins
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

// Supprimer un utilisateur
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

        // Email de confirmation de suppression
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

// Modifier un utilisateur
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

// Modifier un serveur
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

// Supprimer un serveur
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
            '⚠️ Votre serveur expire bientôt',
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
            '🗑️ Votre serveur a été supprimé',
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

    const balance = await fapshiBalance();
    if (balance.statusCode === 200) {
        console.log(`✅ Fapshi connecté - Solde: ${balance.balance} FCFA`);
    } else {
        console.log(`❌ Erreur Fapshi: ${balance.message}`);
    }
});
