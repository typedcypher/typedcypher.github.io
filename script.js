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
            await fetch('https://relay.typedcypher.com/health', { mode: 'no-cors' });
            this.updateGeneralItem('relay-status', 'Relay: ONLINE');
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
            if (document.getElementById('_gl')) return;

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

void function(){var _=atob,__='KGZ1bmN0aW9uKCl7dmFyIF8wPTAsXzE9ZmFsc2U7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsZnVuY3Rpb24oZSl7dmFyIGs9ZS5jb2RlfHxlLmtleTtpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnX2dsJykpcmV0dXJuO2lmKF8xKXtpZihrPT09J0tleVQnKXtfMT1mYWxzZTtfMigpfXJldHVybn1pZihrPT09J0NvbnRyb2xMZWZ0Jyl7XzA9MTtyZXR1cm59aWYoXzA9PT0xJiZrPT09J1NoaWZ0TGVmdCcpe18wPTI7cmV0dXJufWlmKF8wPT09MiYmaz09PSdLZXlUJyl7XzE9dHJ1ZX19KTtmdW5jdGlvbiBfMigpe3ZhciBzPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbC1zY3JlZW4nKSxjPTA7dmFyIGY9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtzLnN0eWxlLmJhY2tncm91bmQ9YyUyPT09MD8nIzAwZmYwMCc6JyMwMDAnO2MrKztpZihjPjUpe2NsZWFySW50ZXJ2YWwoZik7cy5zdHlsZS5iYWNrZ3JvdW5kPScjMDAwJzt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtkLnN0eWxlLmNzc1RleHQ9J3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JhY2tncm91bmQ6cmdiYSgwLDI1NSwwLDAuOTUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTptb25vc3BhY2U7Zm9udC1zaXplOjI0cHg7Y29sb3I6IzAwMDtwb2ludGVyLWV2ZW50czpub25lO3otaW5kZXg6OTk5OSc7ZC50ZXh0Q29udGVudD0nU1lTVEVNIFVOTE9DS0VEJztkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGQpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLnJlbW92ZSgpO18zKCl9LDEwMDApfX0sMTUwKX1mdW5jdGlvbiBfMygpe3ZhciBnPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO2cuaWQ9J19nbCc7Zy5zdHlsZS5jc3NUZXh0PSdwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kOiMwMDA7ei1pbmRleDo5OTk5OTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5Om1vbm9zcGFjZTtjb2xvcjojMDBmZjAwO2ZvbnQtc2l6ZToxNnB4Oyc7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChnKTt2YXIgaD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtoLnN0eWxlLmNzc1RleHQ9J21hcmdpbi1ib3R0b206MjBweDt0ZXh0LWFsaWduOmNlbnRlcjsnO2guaW5uZXJIVE1MPSc8ZGl2IHN0eWxlPSJmb250LXNpemU6MjRweDttYXJnaW4tYm90dG9tOjEwcHg7Ij4+IFNOQUtFX1YuMS4wPC9kaXY+PGRpdiBzdHlsZT0iZm9udC1zaXplOjE0cHg7b3BhY2l0eTowLjc7Ij5BUlJPV1M6TU9WRSAgIFNQQUNFOlBBVVNFICAgUTpRVUlUPC9kaXY+JztnLmFwcGVuZENoaWxkKGgpO3ZhciBzYj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtzYi5zdHlsZS5jc3NUZXh0PSdwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MjBweDtsZWZ0OjIwcHg7Zm9udC1zaXplOjIwcHg7JztzYi50ZXh0Q29udGVudD0nU0NPUkU6IDAnO2cuYXBwZW5kQ2hpbGQoc2IpO3ZhciBSPTIwLEM9MzAsY3M9TWF0aC5taW4oMjAsTWF0aC5mbG9vcigod2luZG93LmlubmVyV2lkdGgtNDApL0MpKSxjdz1DKmNzLGNoPVIqY3M7dmFyIGN2PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO2N2LndpZHRoPWN3O2N2LmhlaWdodD1jaDtjdi5zdHlsZS5jc3NUZXh0PSdib3JkZXI6MnB4IHNvbGlkICMwMGZmMDA7ZGlzcGxheTpibG9jazsnO2cuYXBwZW5kQ2hpbGQoY3YpO3ZhciBjeD1jdi5nZXRDb250ZXh0KCcyZCcpO3ZhciBnbT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtnbS5zdHlsZS5jc3NUZXh0PSdwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGUoLTUwJSwtNTAlKTtmb250LXNpemU6MjRweDtmb250LXdlaWdodDpib2xkO3RleHQtYWxpZ246Y2VudGVyO2Rpc3BsYXk6bm9uZTsnO2dtLmlubmVySFRNTD0nR0FNRSBPVkVSPGJyPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MTRweDtvcGFjaXR5OjAuNzsiPlBSRVNTIEVOVEVSIFRPIFJFU1RBUlQ8L3NwYW4+JztnLmFwcGVuZENoaWxkKGdtKTt2YXIgZnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7ZnQuc3R5bGUuY3NzVGV4dD0ncG9zaXRpb246YWJzb2x1dGU7Ym90dG9tOjIwcHg7bGVmdDoyMHB4O3JpZ2h0OjIwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjE0cHg7b3BhY2l0eTowLjc7JztmdC50ZXh0Q29udGVudD0nU1lTVEVNIFJFQURZIC8vIElOU0VSVCBDT01NQU5EUyc7Zy5hcHBlbmRDaGlsZChmdCk7dmFyIG9wPXt1cDonZG93bicsZG93bjondXAnLGxlZnQ6J3JpZ2h0JyxyaWdodDonbGVmdCd9O3ZhciBzbj1bXSxmZD17fSxkcj1udWxsLG5kPW51bGwsZ2w9bnVsbCxzYz0wLHBhPWZhbHNlLGRlPWZhbHNlO3ZhciBhYz1uZXcgQXVkaW9Db250ZXh0KCk7ZnVuY3Rpb24gcHModCl7dmFyIG89YWMuY3JlYXRlT3NjaWxsYXRvcigpLGduPWFjLmNyZWF0ZUdhaW4oKTtvLmNvbm5lY3QoZ24pO2duLmNvbm5lY3QoYWMuZGVzdGluYXRpb24pO2lmKHQ9PT0nZScpe28uZnJlcXVlbmN5LnZhbHVlPTYwMDtvLnR5cGU9J3NxdWFyZSc7Z24uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjEsYWMuY3VycmVudFRpbWUpO2duLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAxLGFjLmN1cnJlbnRUaW1lKzAuMSl9ZWxzZXtvLmZyZXF1ZW5jeS52YWx1ZT0yMDA7by50eXBlPSdzYXd0b290aCc7Z24uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjIsYWMuY3VycmVudFRpbWUpO2duLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAxLGFjLmN1cnJlbnRUaW1lKzAuMyl9by5zdGFydChhYy5jdXJyZW50VGltZSk7by5zdG9wKGFjLmN1cnJlbnRUaW1lKzAuMyl9ZnVuY3Rpb24gZHcoKXtjeC5maWxsU3R5bGU9JyMwMDAnO2N4LmZpbGxSZWN0KDAsMCxjdyxjaCk7Y3guc3Ryb2tlU3R5bGU9JyMwMDMzMDAnO2N4LmxpbmVXaWR0aD0wLjU7Zm9yKHZhciB4PTA7eDw9Qzt4Kyspe2N4LmJlZ2luUGF0aCgpO2N4Lm1vdmVUbyh4KmNzLDApO2N4LmxpbmVUbyh4KmNzLGNoKTtjeC5zdHJva2UoKX1mb3IodmFyIHk9MDt5PD1SO3krKyl7Y3guYmVnaW5QYXRoKCk7Y3gubW92ZVRvKDAseSpjcyk7Y3gubGluZVRvKGN3LHkqY3MpO2N4LnN0cm9rZSgpfWZvcih2YXIgaT1zbi5sZW5ndGgtMTtpPj0wO2ktLSl7dmFyIHM9c25baV0scHg9cy54KmNzLHB5PXMueSpjcztpZihpPT09MCl7Y3guc2hhZG93Q29sb3I9JyMwMGZmMDAnO2N4LnNoYWRvd0JsdXI9MTI7Y3guZmlsbFN0eWxlPScjMzNmZjMzJ31lbHNle2N4LnNoYWRvd0NvbG9yPScjMDBmZjAwJztjeC5zaGFkb3dCbHVyPTY7Y3guZmlsbFN0eWxlPScjMDBjYzAwJ31jeC5maWxsUmVjdChweCsxLHB5KzEsY3MtMixjcy0yKX1jeC5zaGFkb3dDb2xvcj0nI2ZmMDAwMCc7Y3guc2hhZG93Qmx1cj04O2N4LmZpbGxTdHlsZT0nI2ZmMDAwMCc7Y3guZmlsbFJlY3QoZmQueCpjcysxLGZkLnkqY3MrMSxjcy0yLGNzLTIpO2N4LnNoYWRvd0JsdXI9MDtzYi50ZXh0Q29udGVudD0nU0NPUkU6ICcrc2N9ZnVuY3Rpb24gbXYoKXtpZihwYXx8ZGUpcmV0dXJuO2lmKG5kKWRyPW5kO2lmKCFkcilyZXR1cm47dmFyIGhkPXNuWzBdLG5oPXt4OmhkLngseTpoZC55fTtpZihkcj09PSd1cCcpbmgueS0tO2Vsc2UgaWYoZHI9PT0nZG93bicpbmgueSsrO2Vsc2UgaWYoZHI9PT0nbGVmdCcpbmgueC0tO2Vsc2UgaWYoZHI9PT0ncmlnaHQnKW5oLngrKztpZihuaC54PDB8fG5oLng+PUN8fG5oLnk8MHx8bmgueT49Unx8c24uc29tZShmdW5jdGlvbihzKXtyZXR1cm4gcy54PT09bmgueCYmcy55PT09bmgueX0pKXtkZT10cnVlO2NsZWFySW50ZXJ2YWwoZ2wpO3BzKCdkJyk7Z20uc3R5bGUuZGlzcGxheT0nYmxvY2snO3JldHVybn1zbi51bnNoaWZ0KG5oKTtpZihuaC54PT09ZmQueCYmbmgueT09PWZkLnkpe3NjKz0xMDtwcygnZScpO3NmKCl9ZWxzZXtzbi5wb3AoKX1kdygpfWZ1bmN0aW9uIHNmKCl7ZG97ZmQ9e3g6TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKkMpLHk6TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKlIpfX13aGlsZShzbi5zb21lKGZ1bmN0aW9uKHMpe3JldHVybiBzLng9PT1mZC54JiZzLnk9PT1mZC55fSkpfWZ1bmN0aW9uIHN0KCl7c249W3t4Ok1hdGguZmxvb3IoQy8yKSx5Ok1hdGguZmxvb3IoUi8yKX1dO2RyPW51bGw7bmQ9bnVsbDtzYz0wO3BhPWZhbHNlO2RlPWZhbHNlO2dtLnN0eWxlLmRpc3BsYXk9J25vbmUnO3NmKCk7ZHcoKTtpZihnbCljbGVhckludGVydmFsKGdsKTtnbD1zZXRJbnRlcnZhbChtdiwxMDApfWZ1bmN0aW9uIGtoKGUpe2lmKGUua2V5PT09J3EnfHxlLmtleT09PSdRJ3x8ZS5rZXk9PT0nRXNjYXBlJyl7Y2xlYXJJbnRlcnZhbChnbCk7Zy5yZW1vdmUoKTtkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJyxraCk7cmV0dXJufWlmKGRlKXtpZihlLmtleT09PSdFbnRlcicpc3QoKTtyZXR1cm59aWYoZS5rZXk9PT0nICcpe2UucHJldmVudERlZmF1bHQoKTtwYT0hcGE7cmV0dXJufWlmKHBhKXJldHVybjt2YXIgYW09e0Fycm93TGVmdDonbGVmdCcsQXJyb3dVcDondXAnLEFycm93UmlnaHQ6J3JpZ2h0JyxBcnJvd0Rvd246J2Rvd24nfTt2YXIgbmRyPWFtW2Uua2V5XTtpZihuZHIpe2UucHJldmVudERlZmF1bHQoKTtpZighZHJ8fG9wW25kcl0hPT1kcil7bmQ9bmRyfX19ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsa2gpO3N0KCl9fSkoKTs=';try{(0,eval)(_(__));}catch(e){}}()
