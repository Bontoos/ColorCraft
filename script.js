class ColorPaletteGenerator {
    constructor() {
        this.isPremium = this.checkPremiumStatus();
        this.usesLeft = this.getUsesLeft();
        this.currentPalette = [];
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
        this.generateInitialPalette();
        this.initializeAds();
    }

    initializeElements() {
        this.colorCountSlider = document.getElementById('color-count');
        this.colorCountDisplay = document.getElementById('color-count-display');
        this.harmonySelect = document.getElementById('harmony-type');
        this.baseColorInput = document.getElementById('base-color');
        this.generateBtn = document.getElementById('generate-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.paletteContainer = document.getElementById('palette-container');
        this.colorCodesContainer = document.getElementById('color-codes');
        this.upgradeBtn = document.getElementById('upgrade-btn');
        this.usageText = document.getElementById('usage-text');
        this.usesLeftSpan = document.getElementById('uses-left');
        this.premiumModal = document.getElementById('premium-modal');
        this.limitModal = document.getElementById('limit-modal');
    }

    bindEvents() {
        this.colorCountSlider.addEventListener('input', () => {
            this.colorCountDisplay.textContent = this.colorCountSlider.value;
        });

        this.generateBtn.addEventListener('click', () => this.generatePalette());
        this.exportBtn.addEventListener('click', () => this.exportPalette());
        this.upgradeBtn.addEventListener('click', () => this.showPremiumModal());
        
        document.getElementById('upgrade-from-limit').addEventListener('click', () => {
            this.hideLimitModal();
            this.showPremiumModal();
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.hidePremiumModal());
        
        // Subscribe buttons
        document.querySelectorAll('.subscribe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.handleSubscription(plan);
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.premiumModal) this.hidePremiumModal();
            if (e.target === this.limitModal) this.hideLimitModal();
        });

        // Auto-generate on control changes
        this.harmonySelect.addEventListener('change', () => this.generatePalette());
        this.baseColorInput.addEventListener('change', () => this.generatePalette());
    }

    checkPremiumStatus() {
        return localStorage.getItem('isPremium') === 'true';
    }

    getUsesLeft() {
        const today = new Date().toDateString();
        const lastUsageDate = localStorage.getItem('lastUsageDate');
        
        if (lastUsageDate !== today) {
            localStorage.setItem('lastUsageDate', today);
            localStorage.setItem('usesLeft', '5');
            return 5;
        }
        
        return parseInt(localStorage.getItem('usesLeft') || '5');
    }

    updateUsageCount() {
        if (!this.isPremium) {
            this.usesLeft = Math.max(0, this.usesLeft - 1);
            localStorage.setItem('usesLeft', this.usesLeft.toString());
            this.updateUI();
        }
    }

    updateUI() {
        if (this.isPremium) {
            document.body.classList.add('premium-user');
            this.usageText.innerHTML = '<span class="premium-badge">PREMIUM</span>';
            this.upgradeBtn.style.display = 'none';
        } else {
            document.body.classList.remove('premium-user');
            this.usesLeftSpan.textContent = this.usesLeft;
            
            if (this.usesLeft === 0) {
                this.generateBtn.disabled = true;
                this.generateBtn.textContent = 'Upgrade for More';
            } else {
                this.generateBtn.disabled = false;
                this.generateBtn.textContent = 'Generate Palette';
            }
        }
    }

    generatePalette() {
        if (!this.isPremium && this.usesLeft <= 0) {
            this.showLimitModal();
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            const colorCount = parseInt(this.colorCountSlider.value);
            const harmonyType = this.harmonySelect.value;
            const baseColor = this.baseColorInput.value;
            
            this.currentPalette = this.createHarmoniousPalette(baseColor, colorCount, harmonyType);
            this.displayPalette();
            this.displayColorCodes();
            
            this.updateUsageCount();
            this.hideLoading();
        }, 500);
    }

    createHarmoniousPalette(baseColor, count, harmonyType) {
        const baseHsl = this.hexToHsl(baseColor);
        const colors = [];

        switch (harmonyType) {
            case 'complementary':
                colors.push(...this.generateComplementary(baseHsl, count));
                break;
            case 'triadic':
                colors.push(...this.generateTriadic(baseHsl, count));
                break;
            case 'analogous':
                colors.push(...this.generateAnalogous(baseHsl, count));
                break;
            case 'monochromatic':
                colors.push(...this.generateMonochromatic(baseHsl, count));
                break;
            case 'tetradic':
                colors.push(...this.generateTetradic(baseHsl, count));
                break;
            case 'split-complementary':
                colors.push(...this.generateSplitComplementary(baseHsl, count));
                break;
        }

        return colors.slice(0, count).map(hsl => ({
            hex: this.hslToHex(hsl),
            hsl: hsl,
            rgb: this.hslToRgb(hsl),
            name: this.getColorName(this.hslToHex(hsl))
        }));
    }

    generateComplementary(baseHsl, count) {
        const colors = [baseHsl];
        const complementHue = (baseHsl.h + 180) % 360;
        
        for (let i = 1; i < count; i++) {
            if (i % 2 === 1) {
                colors.push({
                    h: complementHue,
                    s: baseHsl.s + (Math.random() - 0.5) * 20,
                    l: baseHsl.l + (Math.random() - 0.5) * 30
                });
            } else {
                colors.push({
                    h: baseHsl.h + (Math.random() - 0.5) * 30,
                    s: Math.max(10, Math.min(90, baseHsl.s + (Math.random() - 0.5) * 40)),
                    l: Math.max(10, Math.min(90, baseHsl.l + (Math.random() - 0.5) * 40))
                });
            }
        }
        
        return colors;
    }

    generateTriadic(baseHsl, count) {
        const colors = [baseHsl];
        const hues = [baseHsl.h, (baseHsl.h + 120) % 360, (baseHsl.h + 240) % 360];
        
        for (let i = 1; i < count; i++) {
            const hue = hues[i % 3];
            colors.push({
                h: hue,
                s: Math.max(20, Math.min(80, baseHsl.s + (Math.random() - 0.5) * 30)),
                l: Math.max(20, Math.min(80, baseHsl.l + (Math.random() - 0.5) * 30))
            });
        }
        
        return colors;
    }

    generateAnalogous(baseHsl, count) {
        const colors = [baseHsl];
        const step = 30;
        
        for (let i = 1; i < count; i++) {
            const hueOffset = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * step;
            colors.push({
                h: (baseHsl.h + hueOffset + 360) % 360,
                s: Math.max(20, Math.min(80, baseHsl.s + (Math.random() - 0.5) * 20)),
                l: Math.max(20, Math.min(80, baseHsl.l + (Math.random() - 0.5) * 20))
            });
        }
        
        return colors;
    }

    generateMonochromatic(baseHsl, count) {
        const colors = [baseHsl];
        
        for (let i = 1; i < count; i++) {
            colors.push({
                h: baseHsl.h,
                s: Math.max(10, Math.min(90, baseHsl.s + (Math.random() - 0.5) * 30)),
                l: Math.max(10, Math.min(90, 20 + (i / count) * 70))
            });
        }
        
        return colors;
    }

    generateTetradic(baseHsl, count) {
        const colors = [baseHsl];
        const hues = [
            baseHsl.h,
            (baseHsl.h + 90) % 360,
            (baseHsl.h + 180) % 360,
            (baseHsl.h + 270) % 360
        ];
        
        for (let i = 1; i < count; i++) {
            const hue = hues[i % 4];
            colors.push({
                h: hue,
                s: Math.max(20, Math.min(80, baseHsl.s + (Math.random() - 0.5) * 25)),
                l: Math.max(20, Math.min(80, baseHsl.l + (Math.random() - 0.5) * 25))
            });
        }
        
        return colors;
    }

    generateSplitComplementary(baseHsl, count) {
        const colors = [baseHsl];
        const complementHue = (baseHsl.h + 180) % 360;
        const hues = [
            baseHsl.h,
            (complementHue - 30 + 360) % 360,
            (complementHue + 30) % 360
        ];
        
        for (let i = 1; i < count; i++) {
            const hue = hues[i % 3];
            colors.push({
                h: hue,
                s: Math.max(20, Math.min(80, baseHsl.s + (Math.random() - 0.5) * 25)),
                l: Math.max(20, Math.min(80, baseHsl.l + (Math.random() - 0.5) * 25))
            });
        }
        
        return colors;
    }

    displayPalette() {
        this.paletteContainer.innerHTML = '';
        
        this.currentPalette.forEach((color, index) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            colorCard.innerHTML = `
                <div class="color-preview" style="background-color: ${color.hex}">
                    <div class="copy-notification">Copied!</div>
                </div>
                <div class="color-info">
                    <div class="color-hex">${color.hex.toUpperCase()}</div>
                    <div class="color-name">${color.name}</div>
                </div>
            `;
            
            colorCard.addEventListener('click', () => this.copyToClipboard(color.hex, colorCard));
            this.paletteContainer.appendChild(colorCard);
        });
    }

    displayColorCodes() {
        this.colorCodesContainer.innerHTML = '';
        
        this.currentPalette.forEach((color, index) => {
            const codeItem = document.createElement('div');
            codeItem.className = 'color-code-item';
            codeItem.style.borderLeftColor = color.hex;
            codeItem.innerHTML = `
                <h4>Color ${index + 1}</h4>
                <code>HEX: ${color.hex.toUpperCase()}</code>
                <code>RGB: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</code>
                <code>HSL: hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)</code>
            `;
            
            this.colorCodesContainer.appendChild(codeItem);
        });
    }

    copyToClipboard(text, element) {
        navigator.clipboard.writeText(text).then(() => {
            const notification = element.querySelector('.copy-notification');
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 1000);
        });
    }

    exportPalette() {
        if (!this.currentPalette.length) return;
        
        const exportData = {
            palette: this.currentPalette,
            harmony: this.harmonySelect.value,
            createdAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `color-palette-${Date.now()}.json`;
        link.click();
    }

    showPremiumModal() {
        this.premiumModal.style.display = 'block';
    }

    hidePremiumModal() {
        this.premiumModal.style.display = 'none';
    }

    showLimitModal() {
        this.limitModal.style.display = 'block';
    }

    hideLimitModal() {
        this.limitModal.style.display = 'none';
    }

    async handleSubscription(plan) {
        try {
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan })
            });
            
            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    }

    showLoading() {
        this.generateBtn.innerHTML = '<span class="loading"></span> Generating...';
        this.generateBtn.disabled = true;
    }

    hideLoading() {
        this.generateBtn.innerHTML = 'Generate Palette';
        this.generateBtn.disabled = this.usesLeft <= 0 && !this.isPremium;
    }

        generateInitialPalette() {
        this.generatePalette();
    }

    initializeAds() {
        if (!this.isPremium) {
            // Initialize Google AdSense ads
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                (adsbygoogle = window.adsbygoogle || []).push({});
                (adsbygoogle = window.adsbygoogle || []).push({});
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log('AdSense not loaded');
            }
        }
    }

    // Color conversion utilities
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    hslToHex(hsl) {
        const h = hsl.h / 360;
        const s = Math.max(0, Math.min(100, hsl.s)) / 100;
        const l = Math.max(0, Math.min(100, hsl.l)) / 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    hslToRgb(hsl) {
        const h = hsl.h / 360;
        const s = Math.max(0, Math.min(100, hsl.s)) / 100;
        const l = Math.max(0, Math.min(100, hsl.l)) / 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    getColorName(hex) {
        const colorNames = {
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#FFA500': 'Orange',
            '#800080': 'Purple',
            '#FFC0CB': 'Pink',
            '#A52A2A': 'Brown',
            '#808080': 'Gray',
            '#000000': 'Black',
            '#FFFFFF': 'White'
        };

        // Simple color name detection based on HSL values
        const hsl = this.hexToHsl(hex);
        const h = hsl.h;
        const s = hsl.s;
        const l = hsl.l;

        if (l < 15) return 'Dark';
        if (l > 85) return 'Light';
        if (s < 20) return 'Gray';

        if (h >= 0 && h < 15) return 'Red';
        if (h >= 15 && h < 45) return 'Orange';
        if (h >= 45 && h < 75) return 'Yellow';
        if (h >= 75 && h < 150) return 'Green';
        if (h >= 150 && h < 210) return 'Cyan';
        if (h >= 210 && h < 270) return 'Blue';
        if (h >= 270 && h < 330) return 'Purple';
        if (h >= 330 && h < 360) return 'Pink';

        return 'Color';
    }
}

// Premium status checker
class PremiumChecker {
    static async checkStatus() {
        try {
            const response = await fetch('/check-premium-status');
            const data = await response.json();
            
            if (data.isPremium) {
                localStorage.setItem('isPremium', 'true');
                localStorage.setItem('premiumExpiry', data.expiryDate);
            } else {
                localStorage.removeItem('isPremium');
                localStorage.removeItem('premiumExpiry');
            }
            
            return data.isPremium;
        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    }

    static isExpired() {
        const expiryDate = localStorage.getItem('premiumExpiry');
        if (!expiryDate) return true;
        
        return new Date() > new Date(expiryDate);
    }
}

// Analytics and tracking
class Analytics {
    static trackEvent(eventName, properties = {}) {
        // Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Custom analytics
        console.log('Event tracked:', eventName, properties);
    }

    static trackPaletteGeneration(harmonyType, colorCount) {
        this.trackEvent('palette_generated', {
            harmony_type: harmonyType,
            color_count: colorCount,
            user_type: localStorage.getItem('isPremium') === 'true' ? 'premium' : 'free'
        });
    }

    static trackSubscription(plan) {
        this.trackEvent('subscription_initiated', {
            plan: plan,
            value: plan === 'yearly' ? 39.99 : 4.99,
            currency: 'USD'
        });
    }

    static trackExport() {
        this.trackEvent('palette_exported', {
            user_type: localStorage.getItem('isPremium') === 'true' ? 'premium' : 'free'
        });
    }
}

// URL parameter handler for success/cancel pages
class URLHandler {
    static handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('success') === 'true') {
            localStorage.setItem('isPremium', 'true');
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            localStorage.setItem('premiumExpiry', expiryDate.toISOString());
            
            // Show success message
            this.showSuccessMessage();
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        if (urlParams.get('canceled') === 'true') {
            this.showCancelMessage();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    static showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div style="background: #2ecc71; color: white; padding: 15px; border-radius: 10px; margin: 20px; text-align: center;">
                🎉 Welcome to Premium! You now have unlimited access to all features.
            </div>
        `;
        document.body.insertBefore(message, document.body.firstChild);
        
        setTimeout(() => message.remove(), 5000);
    }

    static showCancelMessage() {
        const message = document.createElement('div');
        message.className = 'cancel-message';
        message.innerHTML = `
            <div style="background: #e74c3c; color: white; padding: 15px; border-radius: 10px; margin: 20px; text-align: center;">
                Payment was canceled. You can upgrade anytime to unlock premium features.
            </div>
        `;
        document.body.insertBefore(message, document.body.firstChild);
        
        setTimeout(() => message.remove(), 5000);
    }
}

// Keyboard shortcuts
class KeyboardShortcuts {
    static init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + G to generate new palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                document.getElementById('generate-btn').click();
            }
            
            // Ctrl/Cmd + E to export palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                document.getElementById('export-btn').click();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }
}

// Service Worker registration for PWA capabilities
class PWAManager {
    static async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    static async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            }
        }
    }

    static showUpdateNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #667eea; color: white; padding: 15px; border-radius: 10px; z-index: 10000;">
                <p>A new version is available!</p>
                <button onclick="window.location.reload()" style="background: white; color: #667eea; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 10px;">
                    Update Now
                </button>
            </div>
        `;
        document.body.appendChild(notification);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Handle URL parameters first
    URLHandler.handleURLParams();
    
    // Check premium status
    await PremiumChecker.checkStatus();
    
    // Initialize the main application
    const app = new ColorPaletteGenerator();
    
    // Initialize additional features
    KeyboardShortcuts.init();
    PWAManager.registerServiceWorker();
    PWAManager.checkForUpdates();
    
    // Track page view
    Analytics.trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ColorPaletteGenerator,
        PremiumChecker,
        Analytics,
        URLHandler,
        KeyboardShortcuts,
        PWAManager
    };
}
