// IBM 3151-style setup menu terminal
class AlienTerminal {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.cursor = document.querySelector('.cursor');
        this.typeSpeed = 50;
        this.lineDelay = 800;

        this.tabs = [
            {
                label: 'GENERAL',
                items: [
                    { label: 'Welcome to typedCypher' },
                    { label: 'Block Height: ...', id: 'block-height' },
                    { label: 'Relay: ...', id: 'relay-status' },
                ]
            },
            {
                label: 'INTERFACES',
                items: [
                    { label: 'GITHUB', link: 'https://github.com/typedcypher' },
                    { label: 'X', link: 'https://x.com/typedcypher' },
                    { label: 'NOSTR', link: 'https://njump.me/typedcypher.com' },
                ]
            },
            {
                label: 'PROJECTS',
                items: [
                    { label: 'historical-bitcoin-prices', link: 'https://github.com/typedcypher/historical-bitcoin-prices' },
                    { label: 'mailveil-extension', link: 'https://github.com/typedcypher/mailveil-extension' },
                    { label: 'nostr-vanity', link: 'https://github.com/typedcypher/nostr-vanity' },
                ]
            },
        ];

        this.activeTab = 0;
        this.activeItem = 0;
        this.menuReady = false;

        this.bootSequence();
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeText(text, element = null, speed = this.typeSpeed) {
        const targetElement = element || this.output;
        const chars = text.split('');

        for (const char of chars) {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char';
            span.style.animationDelay = '0s';
            targetElement.appendChild(span);

            if (this.cursor && this.cursor.parentNode) {
                targetElement.appendChild(this.cursor);
            }

            await this.sleep(speed);
        }
    }

    async addLine(text, className = '', typeEffect = true) {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        this.output.appendChild(line);
        line.offsetHeight;

        if (typeEffect) {
            await this.typeText(text, line);
        } else {
            line.textContent = text;
            line.style.opacity = '1';
        }

        this.output.appendChild(this.cursor);
        await this.sleep(this.lineDelay);
    }

    async bootSequence() {
        await this.sleep(2000);

        await this.addLine('INITIALIZING SYSTEM...', '', true);
        await this.sleep(500);

        await this.addLine('LOADING KERNEL MODULES...', '', false);
        await this.sleep(300);
        await this.addLine('[OK] BLOCK SYNC: READY', '', false);
        await this.sleep(200);
        await this.addLine('[OK] RELAY CHECK: CONNECTING', '', false);
        await this.sleep(200);
        await this.addLine('[OK] INTERFACE: ACTIVE', '', false);
        await this.sleep(500);

        await this.addLine('', '', false);
        await this.addLine('ESTABLISHING CONNECTION...', '', true);
        await this.sleep(1000);

        // Clear boot output and show setup menu
        this.output.innerHTML = '';
        if (this.cursor) this.cursor.remove();
        await this.sleep(500);

        this.showSetupMenu();
        this.addKeyboardNavigation();
        this.addInteractiveEffects();
    }

    showSetupMenu() {
        const content = document.querySelector('.terminal-content');
        content.innerHTML = '';

        // Box container
        const box = document.createElement('div');
        box.className = 'setup-box';
        content.appendChild(box);

        // Title
        const title = document.createElement('div');
        title.className = 'setup-title';
        title.textContent = 'T Y P E D C Y P H E R';
        box.appendChild(title);

        // Tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'setup-tab-bar';
        this.tabs.forEach((tab, index) => {
            const tabEl = document.createElement('div');
            tabEl.className = 'setup-tab';
            if (index === this.activeTab) tabEl.classList.add('setup-tab-active');
            tabEl.textContent = tab.label;
            tabEl.addEventListener('mouseenter', () => {
                this.activeTab = index;
                this.activeItem = this.firstSelectableItem(this.tabs[index]);
                this.renderMenu();
            });
            tabEl.addEventListener('click', () => {
                this.activeTab = index;
                this.activeItem = this.firstSelectableItem(this.tabs[index]);
                this.renderMenu();
            });
            tabBar.appendChild(tabEl);
        });
        box.appendChild(tabBar);

        // Separator
        const sep = document.createElement('div');
        sep.className = 'setup-separator';
        box.appendChild(sep);

        // Content area
        const contentArea = document.createElement('div');
        contentArea.className = 'setup-content';
        contentArea.id = 'setup-content';
        box.appendChild(contentArea);

        // Status bar
        const statusBar = document.createElement('div');
        statusBar.className = 'setup-status-bar';
        statusBar.textContent = 'h/l:Tab   j/k:Move   Enter:Open';
        content.appendChild(statusBar);

        this.menuReady = true;
        this.renderMenu();
        this.fetchLiveData();
    }

    async fetchLiveData() {
        this.fetchBlockHeight();
        this.fetchRelayStatus();
    }

    async fetchBlockHeight() {
        try {
            const response = await fetch('https://mempool.space/api/blocks/tip/height');
            const height = await response.text();
            this.updateGeneralItem('block-height', `Block Height: ${Number(height).toLocaleString()}`);
        } catch {
            this.updateGeneralItem('block-height', 'Block Height: unavailable');
        }
    }

    async fetchRelayStatus() {
        try {
            const response = await fetch('https://relay.typedcypher.com/health');
            const data = await response.json();
            const status = data.status === 'OK' ? 'ONLINE' : 'OFFLINE';
            this.updateGeneralItem('relay-status', `Relay: ${status}`);
        } catch {
            this.updateGeneralItem('relay-status', 'Relay: OFFLINE');
        }
    }

    updateGeneralItem(id, label) {
        const tab = this.tabs[0];
        const item = tab.items.find(i => i.id === id);
        if (item) item.label = label;

        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.textContent = label;
    }

    renderMenu() {
        // Update tabs
        const tabEls = document.querySelectorAll('.setup-tab');
        tabEls.forEach((el, i) => {
            el.classList.toggle('setup-tab-active', i === this.activeTab);
        });

        // Update content
        const contentArea = document.getElementById('setup-content');
        if (!contentArea) return;
        contentArea.innerHTML = '';

        const currentTab = this.tabs[this.activeTab];
        if (!currentTab) return;

        const hasSelectableItems = currentTab.items.some(item => item.link);

        currentTab.items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'setup-item';
            if (item.link) {
                row.classList.add('setup-item-link');
                if (index === this.activeItem) row.classList.add('setup-item-active');

                row.addEventListener('mouseenter', () => {
                    if (this.activeItem === index) return;
                    this.activeItem = index;
                    this.updateItemHighlight();
                });

                row.addEventListener('click', () => {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                });
            } else {
                row.classList.add('setup-item-static');
            }
            row.textContent = item.label;
            if (item.id) row.setAttribute('data-id', item.id);

            contentArea.appendChild(row);
        });
    }

    firstSelectableItem(tab) {
        const index = tab.items.findIndex(item => item.link);
        return index === -1 ? 0 : index;
    }

    updateItemHighlight() {
        const items = document.querySelectorAll('.setup-item');
        items.forEach((el, i) => {
            el.classList.toggle('setup-item-active', i === this.activeItem);
        });
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.menuReady) return;

            const currentTab = this.tabs[this.activeTab];

            const selectableIndices = currentTab.items
                .map((item, i) => item.link ? i : -1)
                .filter(i => i !== -1);

            if (e.key === 'l' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.activeTab = (this.activeTab + 1) % this.tabs.length;
                this.activeItem = this.firstSelectableItem(this.tabs[this.activeTab]);
                this.renderMenu();
            } else if (e.key === 'h' || e.key === 'ArrowLeft') {
                e.preventDefault();
                this.activeTab = (this.activeTab - 1 + this.tabs.length) % this.tabs.length;
                this.activeItem = this.firstSelectableItem(this.tabs[this.activeTab]);
                this.renderMenu();
            } else if ((e.key === 'j' || e.key === 'ArrowDown') && selectableIndices.length > 0) {
                e.preventDefault();
                const pos = selectableIndices.indexOf(this.activeItem);
                this.activeItem = selectableIndices[(pos + 1) % selectableIndices.length];
                this.updateItemHighlight();
            } else if ((e.key === 'k' || e.key === 'ArrowUp') && selectableIndices.length > 0) {
                e.preventDefault();
                const pos = selectableIndices.indexOf(this.activeItem);
                this.activeItem = selectableIndices[(pos - 1 + selectableIndices.length) % selectableIndices.length];
                this.updateItemHighlight();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = currentTab.items[this.activeItem];
                if (item && item.link) {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                }
            }
        });
    }

    addInteractiveEffects() {
        const screen = document.querySelector('.terminal-screen');
        const container = document.querySelector('.terminal-container');

        // Random glitch effect
        setInterval(() => {
            if (Math.random() < 0.02) {
                screen.style.transform = `translateX(${Math.random() * 2 - 1}px)`;
                setTimeout(() => {
                    screen.style.transform = 'translateX(0)';
                }, 50);
            }
        }, 2000);

        // Occasional intense flicker
        setInterval(() => {
            if (Math.random() < 0.004) {
                container.style.animation = 'intense-flicker 0.8s';
                setTimeout(() => {
                    container.style.animation = 'flicker 15s infinite';
                }, 800);
            }
        }, 10000);

        // Random micro-flickers
        setInterval(() => {
            if (Math.random() < 0.015) {
                const duration = 100 + Math.random() * 200;
                screen.classList.add('random-flicker');
                setTimeout(() => {
                    screen.classList.remove('random-flicker');
                }, duration);
            }
        }, 3000);

        // Brightness variation
        setInterval(() => {
            if (Math.random() < 0.008) {
                const brightness = 0.85 + Math.random() * 0.3;
                const contrast = 0.95 + Math.random() * 0.15;
                screen.style.filter = `brightness(${brightness}) contrast(${contrast})`;
                setTimeout(() => {
                    screen.style.filter = '';
                }, 200 + Math.random() * 300);
            }
        }, 6000);

        // Add ghost overlay
        const ghostOverlay = document.createElement('div');
        ghostOverlay.className = 'ghost-overlay';
        screen.appendChild(ghostOverlay);
    }
}

// Initialize terminal on page load
document.addEventListener('DOMContentLoaded', () => {
    new AlienTerminal();

    const body = document.body;
    body.style.filter = 'brightness(0)';

    setTimeout(() => {
        body.style.transition = 'filter 2s ease-out';
        body.style.filter = 'brightness(1)';
    }, 100);

    const screen = document.querySelector('.terminal-screen');

    // Horizontal glow line
    const glowLineH = document.createElement('div');
    glowLineH.className = 'glow-line-horizontal';
    screen.appendChild(glowLineH);

    // Interference bands
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            const band = document.createElement('div');
            band.className = 'interference-band';
            band.style.animationDelay = `${i * 2.5}s`;
            screen.appendChild(band);
        }
    }, 3000);
});

// Keyboard sound effect simulation
document.addEventListener('keydown', () => {
    const screen = document.querySelector('.terminal-screen');
    if (screen) {
        screen.style.filter = 'brightness(1.05)';
        setTimeout(() => {
            screen.style.filter = 'brightness(1)';
        }, 50);
    }
});
