/**
 * KermHosting - Système de traduction multilingue
 * Supporte Français (fr) et Anglais (en)
 */

const I18n = {
    // Langue actuelle
    currentLocale: 'fr',
    
    // Traductions chargées
    translations: {},
    
    // Langues disponibles
    availableLocales: ['fr', 'en'],
    
    // Noms des langues
    localeNames: {
        fr: 'Français',
        en: 'English'
    },
    
    // Drapeaux des langues
    localeFlags: {
        fr: '🇫🇷',
        en: '🇬🇧'
    },
    
    /**
     * Initialise le système de traduction
     * @param {string} locale - Code de langue (fr, en)
     */
    async init(locale = null) {
        // Déterminer la langue à utiliser
        let targetLocale = locale || this.detectLocale();
        
        // Valider la langue
        if (!this.availableLocales.includes(targetLocale)) {
            targetLocale = 'fr';
        }
        
        this.currentLocale = targetLocale;
        
        // Charger les traductions
        try {
            const response = await fetch(`/locales/${targetLocale}.json`);
            if (!response.ok) throw new Error('Erreur chargement traductions');
            this.translations = await response.json();
            
            // Mettre à jour l'attribut lang de la page
            document.documentElement.setAttribute('lang', targetLocale);
            
            // Traduire la page
            this.translatePage();
            
            // Mettre à jour les sélecteurs de langue
            this.updateLanguageSwitchers();
            
            // Sauvegarder la préférence
            localStorage.setItem('language', targetLocale);
            
            // Émettre un événement pour les composants dynamiques
            window.dispatchEvent(new CustomEvent('i18n:loaded', { 
                detail: { locale: targetLocale } 
            }));
            
            console.log(`🌐 Langue chargée: ${this.localeNames[targetLocale]}`);
            
        } catch (error) {
            console.error('❌ Erreur chargement traductions:', error);
            // Fallback: utiliser les textes par défaut en dur
        }
    },
    
    /**
     * Détecte la langue préférée de l'utilisateur
     */
    detectLocale() {
        // 1. Vérifier localStorage
        const saved = localStorage.getItem('language');
        if (saved && this.availableLocales.includes(saved)) {
            return saved;
        }
        
        // 2. Vérifier la langue du navigateur
        const browserLang = navigator.language.split('-')[0];
        if (this.availableLocales.includes(browserLang)) {
            return browserLang;
        }
        
        // 3. Vérifier les préférences complètes du navigateur
        const browserLocales = navigator.languages || [navigator.language];
        for (const lang of browserLocales) {
            const shortLang = lang.split('-')[0];
            if (this.availableLocales.includes(shortLang)) {
                return shortLang;
            }
        }
        
        // 4. Par défaut: français
        return 'fr';
    },
    
    /**
     * Traduit une clé
     * @param {string} key - Clé de traduction (ex: "home.hero.title")
     * @param {object} params - Paramètres de remplacement
     */
    t(key, params = {}) {
        if (!this.translations) return key;
        
        // Naviguer dans l'objet de traductions
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`⚠️ Clé de traduction manquante: ${key}`);
                return key;
            }
        }
        
        // Si ce n'est pas une chaîne, retourner la clé
        if (typeof value !== 'string') {
            return key;
        }
        
        // Remplacer les paramètres {{param}}
        return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    },
    
    /**
     * Traduit tous les éléments de la page avec data-i18n
     */
    translatePage() {
        // Traduire le contenu texte
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // Traduire les placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // Traduire les titres (title)
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
        
        // Traduire les attributs aria-label
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });
        
        // Traduire les valeurs (value) pour les inputs
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            el.value = this.t(key);
        });
        
        // Traduire les options de select
        document.querySelectorAll('[data-i18n-options]').forEach(select => {
            const keys = select.getAttribute('data-i18n-options').split(',');
            const options = select.querySelectorAll('option');
            options.forEach((option, index) => {
                if (keys[index]) {
                    option.textContent = this.t(keys[index].trim());
                }
            });
        });
    },
    
    /**
     * Change la langue
     * @param {string} locale - Code de langue
     */
    async switchLanguage(locale) {
        if (locale === this.currentLocale) return;
        
        // Animation de transition
        document.body.style.opacity = '0.5';
        document.body.style.transition = 'opacity 0.15s ease';
        
        await this.init(locale);
        
        // Sauvegarder côté serveur si connecté
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/user/language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ language: locale })
            }).catch(console.error);
        }
        
        // Restaurer l'opacité
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);
    },
    
    /**
     * Met à jour tous les sélecteurs de langue sur la page
     */
    updateLanguageSwitchers() {
        document.querySelectorAll('[data-lang-switcher]').forEach(container => {
            const currentLangName = this.localeNames[this.currentLocale];
            const currentFlag = this.localeFlags[this.currentLocale];
            
            // Mettre à jour le bouton principal
            const btn = container.querySelector('[data-lang-current]');
            if (btn) {
                btn.innerHTML = `${currentFlag} ${currentLangName} <i class="fas fa-chevron-down"></i>`;
            }
            
            // Mettre à jour le dropdown
            const dropdown = container.querySelector('[data-lang-dropdown]');
            if (dropdown) {
                dropdown.innerHTML = this.availableLocales.map(locale => `
                    <button type="button" 
                            data-lang-option="${locale}" 
                            class="lang-option ${locale === this.currentLocale ? 'active' : ''}">
                        ${this.localeFlags[locale]} ${this.localeNames[locale]}
                    </button>
                `).join('');
                
                // Ajouter les écouteurs d'événements
                dropdown.querySelectorAll('[data-lang-option]').forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const locale = option.getAttribute('data-lang-option');
                        this.switchLanguage(locale);
                        dropdown.classList.remove('show');
                    });
                });
            }
        });
        
        // Écouteurs pour ouvrir/fermer le dropdown
        document.querySelectorAll('[data-lang-toggle]').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = toggle.closest('[data-lang-switcher]')
                    .querySelector('[data-lang-dropdown]');
                dropdown.classList.toggle('show');
            });
        });
        
        // Fermer le dropdown quand on clique ailleurs
        document.addEventListener('click', () => {
            document.querySelectorAll('[data-lang-dropdown]').forEach(d => {
                d.classList.remove('show');
            });
        });
    },
    
    /**
     * Traduit un élément HTML dynamique
     * @param {HTMLElement} element - Élément à traduire
     */
    translateElement(element) {
        // Traduire l'élément lui-même
        if (element.hasAttribute('data-i18n')) {
            element.textContent = this.t(element.getAttribute('data-i18n'));
        }
        if (element.hasAttribute('data-i18n-placeholder')) {
            element.placeholder = this.t(element.getAttribute('data-i18n-placeholder'));
        }
        if (element.hasAttribute('data-i18n-title')) {
            element.title = this.t(element.getAttribute('data-i18n-title'));
        }
        
        // Traduire les enfants
        element.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.getAttribute('data-i18n'));
        });
        element.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
        });
        element.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.getAttribute('data-i18n-title'));
        });
    },
    
    /**
     * Formate une date relative
     * @param {string|Date} date - Date à formater
     */
    formatTimeAgo(date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 5) return this.t('notifications.just_now');
        if (diffSec < 60) return this.t('notifications.minutes_ago', { count: diffSec });
        if (diffMin < 60) return this.t('notifications.minutes_ago', { count: diffMin });
        if (diffHour < 24) return this.t('notifications.hours_ago', { count: diffHour });
        if (diffDay < 7) return this.t('notifications.days_ago', { count: diffDay });
        
        return then.toLocaleDateString(this.currentLocale === 'fr' ? 'fr-FR' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
};

// Exposer globalement
window.I18n = I18n;

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await I18n.init();
    
    // Observer les mutations pour les contenus dynamiques
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    I18n.translateElement(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Helper pour utiliser dans les templates
window.__ = (key, params) => I18n.t(key, params);
