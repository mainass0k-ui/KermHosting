# KermHosting Backend 🚀

**Hébergement Node.js nouvelle génération** - Solution complète avec Pterodactyl, multiples passerelles de paiement (Fapshi, PayPal, Minipay), système de coins, parrainage et gestion automatique des serveurs.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Système de paiement](#-système-de-paiement)
- [Cron Jobs](#-cron-jobs)
- [Variables d'environnement](#-variables-denvironnement)
- [Déploiement](#-déploiement)
- [Support](#-support)

## ✨ Fonctionnalités

### 👤 Gestion utilisateurs
- Inscription / Connexion (email ou username)
- Vérification email avec codes temporaires
- Réinitialisation de mot de passe
- Changement d'email avec vérification
- Suppression de compte
- Clé API personnalisable

### 💰 Système de paiement
- **Fapshi** - Paiement Mobile Money (MTN, Orange) en direct
- **PayPal** - Paiements internationaux avec confirmation manuelle
- **Minipay** - Paiement manuel avec upload de capture d'écran
- Support de +40 devises africaines (XAF, XOF, NGN, GHS, KES, etc.)
- Conversion automatique FCFA vers devises locales

### 🎮 Gestion des serveurs
- Création automatique sur Pterodactyl Panel
- Plans : Free, Starter, Basic, Pro, Business
- Auto-renouvellement avec coins
- Suspension automatique à expiration
- Suppression après 7 jours de suspension
- Monitoring des ressources (CPU, RAM, Disk)
- Actions power (start/stop/restart)

### 🪙 Système de coins
- Achat de coins via toutes les méthodes de paiement
- Récompense quotidienne (série de connexions)
- Parrainage : 20 coins pour le parrain, 10 coins pour le filleul
- Utilisation des coins pour créer/renouveler des serveurs

### 🔧 Administration
- Dashboard admin complet
- Gestion des utilisateurs (ban, coins, suppression)
- Gestion des serveurs (suspend, reactivate, delete)
- Confirmation manuelle des transactions PayPal/Minipay
- Logs d'administration
- Mode maintenance avec IP whitelist
- Stats financières détaillées

### 📧 Emails (Resend)
- Templates HTML responsives
- Vérification email
- Confirmation d'achat
- Notifications d'expiration
- Suspension/suppression de serveur
- Parrainage

### 🔄 Automatisations (Cron)
- Vérification auto-renouvellement (toutes les heures)
- Rappels expiration J-3 (toutes les 6 heures)
- Suspension serveurs expirés (toutes les heures)
- Suppression définitive J+7 (tous les jours à 2h)
- Expiration transactions Fapshi (toutes les heures)

## 🛠 Technologies

- **Backend**: Node.js + Express.js
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: JWT + bcrypt
- **Paiements**: Fapshi API, PayPal, Minipay
- **Emails**: Resend
- **WebSocket**: ws (pour monitoring temps réel)
- **Task scheduling**: node-cron
- **File upload**: multer
- **HTTP client**: axios

## 📦 Installation

### Prérequis
- Node.js 20+
- npm ou yarn
- Compte Supabase
- Compte Resend
- Compte Fapshi (live)
- Panel Pterodactyl

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/hostt11/kermhosting/backend.git
cd backend
