// Terminal typing effect with Alien-inspired boot sequence
class AlienTerminal {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.cursor = document.querySelector('.cursor');
        this.typeSpeed = 50;
        this.lineDelay = 800;
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
            
            // Move cursor after each character
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
        
        // Trigger reflow to ensure animation plays
        line.offsetHeight;
        
        if (typeEffect) {
            await this.typeText(text, line);
        } else {
            line.textContent = text;
            line.style.opacity = '1';
        }
        
        // Move cursor to end
        this.output.appendChild(this.cursor);
        
        await this.sleep(this.lineDelay);
    }

    async bootSequence() {
        // Initial boot delay
        await this.sleep(2000);
        
        // Create burn-in layers
        this.createBurnInLayers();
        
        // System initialization
        await this.addLine('INITIALIZING SYSTEM...', '', true);
        await this.sleep(500);
        
        await this.addLine('LOADING KERNEL MODULES...', '', false);
        await this.sleep(300);
        await this.addLine('[OK] MEMORY CHECK: 16384 KB', '', false);
        await this.sleep(200);
        await this.addLine('[OK] CPU DETECTED: MOS 6502', '', false);
        await this.sleep(200);
        await this.addLine('[OK] INTERFACE: ACTIVE', '', false);
        await this.sleep(500);
        
        await this.addLine('', '', false);
        await this.addLine('ESTABLISHING CONNECTION...', '', true);
        await this.sleep(1000);
        
        // Clear screen effect
        this.output.innerHTML = '';
        this.output.appendChild(this.cursor);
        await this.sleep(500);
        
        // Welcome message
        await this.addLine('Welcome to typedCypher.', '', true);
        await this.sleep(1000);
        
        await this.addLine('', '', false);
        await this.addLine('SELECT INTERFACE:', '', true);
        await this.sleep(500);
        
        // Menu options with links
        await this.createMenuOption('GITHUB', 'https://github.com/typedcypher');
        await this.createMenuOption('X', 'https://x.com/typedcypher');
        
        await this.addLine('', '', false);
        await this.sleep(500);
        await this.addLine('SYSTEM READY_', '', true);
        
        // Add interactive effects after boot
        this.addInteractiveEffects();
    }

    async createMenuOption(text, link) {
        const option = document.createElement('div');
        option.className = 'menu-option terminal-line';
        
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        
        this.output.appendChild(option);
        option.appendChild(anchor);
        
        // Trigger reflow for animation
        option.offsetHeight;
        
        await this.typeText(text, anchor, 30);
        
        // Move cursor after option
        this.output.appendChild(this.cursor);
        
        await this.sleep(300);
    }

    createBurnInLayers() {
        // Add data-text attribute to header for CSS burn-in effect
        const header = document.querySelector('.terminal-header');
        if (header) {
            header.setAttribute('data-text', header.textContent);
        }

        // Create persistent burn-in traces container
        const burnContainer = document.createElement('div');
        burnContainer.className = 'menu-burn';
        document.querySelector('.terminal-content').appendChild(burnContainer);
        
        // Store reference for later use
        this.burnContainer = burnContainer;
    }

    createBurnInText(text, x, y, permanent = false) {
        const burnElement = document.createElement('div');
        burnElement.textContent = text;
        burnElement.className = permanent ? 'burn-in-permanent' : 'burn-in';
        burnElement.style.left = x + 'px';
        burnElement.style.top = y + 'px';
        
        if (this.burnContainer) {
            this.burnContainer.appendChild(burnElement);
        }
        
        // Remove temporary burn-in after animation completes
        if (!permanent) {
            setTimeout(() => {
                if (burnElement.parentNode) {
                    burnElement.remove();
                }
            }, 120000); // 2 minutes
        }
    }

    async addLine(text, className = '', typeEffect = true) {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        this.output.appendChild(line);
        
        // Get position for burn-in effect
        const rect = line.getBoundingClientRect();
        const parentRect = this.output.getBoundingClientRect();
        const relativeY = rect.top - parentRect.top;
        
        // Trigger reflow to ensure animation plays
        line.offsetHeight;
        
        if (typeEffect) {
            await this.typeText(text, line);
            // Create burn-in for typed text
            if (text && Math.random() < 0.3) { // 30% chance for burn-in
                this.createBurnInText(text, 0, relativeY, false);
            }
        } else {
            line.textContent = text;
            line.style.opacity = '1';
        }
        
        // Move cursor to end
        this.output.appendChild(this.cursor);
        
        await this.sleep(this.lineDelay);
    }

    async createMenuOption(text, link) {
        const option = document.createElement('div');
        option.className = 'menu-option terminal-line';
        
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        
        this.output.appendChild(option);
        option.appendChild(anchor);
        
        // Get position for permanent burn-in
        const rect = option.getBoundingClientRect();
        const parentRect = this.output.getBoundingClientRect();
        const relativeY = rect.top - parentRect.top;
        
        // Trigger reflow for animation
        option.offsetHeight;
        
        await this.typeText(text, anchor, 30);
        
        // Create permanent burn-in for menu items
        this.createBurnInText('> ' + text, 0, relativeY, true);
        
        // Move cursor after option
        this.output.appendChild(this.cursor);
        
        await this.sleep(300);
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
            if (Math.random() < 0.004) { // 0.4% chance (reduced)
                container.style.animation = 'intense-flicker 0.8s';
                setTimeout(() => {
                    container.style.animation = 'flicker 15s infinite';
                }, 800);
            }
        }, 10000); // Check every 10 seconds instead of 4
        
        // Random micro-flickers
        setInterval(() => {
            if (Math.random() < 0.015) { // 1.5% chance (reduced)
                const duration = 100 + Math.random() * 200; // Longer duration
                screen.classList.add('random-flicker');
                setTimeout(() => {
                    screen.classList.remove('random-flicker');
                }, duration);
            }
        }, 3000); // Check every 3 seconds instead of 1
        
        // Brightness variation
        setInterval(() => {
            if (Math.random() < 0.008) { // 0.8% chance (reduced)
                const brightness = 0.85 + Math.random() * 0.3; // 0.85 to 1.15 (less extreme)
                const contrast = 0.95 + Math.random() * 0.15; // 0.95 to 1.1 (less extreme)
                screen.style.filter = `brightness(${brightness}) contrast(${contrast})`;
                setTimeout(() => {
                    screen.style.filter = '';
                }, 200 + Math.random() * 300); // Longer duration
            }
        }, 6000); // Check every 6 seconds instead of 2.5

        // Phosphor burn-in effect simulation
        const burnIn = document.createElement('div');
        burnIn.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                ellipse at center,
                transparent 0%,
                transparent 40%,
                rgba(12, 204, 104, 0.01) 70%,
                transparent 100%
            );
            pointer-events: none;
            z-index: 1;
        `;
        document.querySelector('.terminal-screen').appendChild(burnIn);
        
        // Add ghost overlay
        const ghostOverlay = document.createElement('div');
        ghostOverlay.className = 'ghost-overlay';
        document.querySelector('.terminal-screen').appendChild(ghostOverlay);
    }
}

// Initialize terminal on page load
document.addEventListener('DOMContentLoaded', () => {
    new AlienTerminal();
    
    // Add startup sound effect simulation (visual feedback)
    const body = document.body;
    body.style.filter = 'brightness(0)';
    
    setTimeout(() => {
        body.style.transition = 'filter 2s ease-out';
        body.style.filter = 'brightness(1)';
    }, 100);
    
    // Create glow lines
    const screen = document.querySelector('.terminal-screen');
    
    // Horizontal glow line
    const glowLineH = document.createElement('div');
    glowLineH.className = 'glow-line-horizontal';
    screen.appendChild(glowLineH);
    
    // Interference bands (multiple)
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            const band = document.createElement('div');
            band.className = 'interference-band';
            band.style.animationDelay = `${i * 2.5}s`;
            screen.appendChild(band);
        }
    }, 3000);
});

// Keyboard sound effect simulation (visual feedback on keypress)
document.addEventListener('keydown', (e) => {
    const screen = document.querySelector('.terminal-screen');
    if (screen) {
        screen.style.filter = 'brightness(1.05)';
        setTimeout(() => {
            screen.style.filter = 'brightness(1)';
        }, 50);
    }
});