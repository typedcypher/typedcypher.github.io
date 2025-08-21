// CRT phosphor burn-in effect
function createPhosphorBurnIn() {
    const title = document.querySelector('.title');
    if (!title) return;
    
    // Create a ghost image for burn-in effect
    const burnIn = title.cloneNode(true);
    burnIn.style.position = 'absolute';
    burnIn.style.top = '0';
    burnIn.style.left = '0';
    burnIn.style.opacity = '0.08';
    burnIn.style.filter = 'blur(2px)';
    burnIn.style.pointerEvents = 'none';
    burnIn.style.animation = 'none';
    burnIn.style.color = '#ff6600';
    burnIn.style.zIndex = '-2';
    
    title.style.position = 'relative';
    title.appendChild(burnIn);
}

// Random interference glitches
function addInterference() {
    setInterval(() => {
        if (Math.random() < 0.01) { // 1% chance every 100ms
            const title = document.querySelector('.title');
            title.style.transform = `translateX(${Math.random() * 4 - 2}px)`;
            title.style.filter = `brightness(${1 + Math.random() * 0.3}) contrast(${1 + Math.random() * 0.5})`;
            
            setTimeout(() => {
                title.style.transform = 'translateX(0)';
                title.style.filter = 'contrast(1.2) brightness(1.1)';
            }, 50);
        }
    }, 100);
}

// Occasional static burst
function staticBurst() {
    setInterval(() => {
        if (Math.random() < 0.005) { // 0.5% chance
            const body = document.body;
            const originalBg = body.style.background;
            
            // Create static overlay
            const static = document.createElement('div');
            static.style.position = 'fixed';
            static.style.top = '0';
            static.style.left = '0';
            static.style.width = '100%';
            static.style.height = '100%';
            static.style.background = `
                repeating-conic-gradient(
                    from 0deg at 50% 50%,
                    rgba(255, 176, 0, 0.1) 0deg,
                    transparent 1deg,
                    transparent 2deg,
                    rgba(255, 176, 0, 0.1) 3deg
                )
            `;
            static.style.zIndex = '9998';
            static.style.pointerEvents = 'none';
            static.style.mixBlendMode = 'screen';
            static.style.animation = 'static-noise 0.05s steps(5) 5';
            
            body.appendChild(static);
            
            setTimeout(() => {
                body.removeChild(static);
            }, 250);
        }
    }, 1000);
}

// Warm up sequence
function warmUpSequence() {
    const title = document.querySelector('.title');
    const container = document.querySelector('.title-container');
    
    // Simulate degaussing effect
    container.style.animation = 'degauss 0.5s ease-out';
    
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

// Add CSS for new animations
const style = document.createElement('style');
style.textContent = `
    @keyframes static-noise {
        0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        20% { transform: translate(-2%, 2%) scale(1.1); opacity: 0.8; }
        40% { transform: translate(2%, -2%) scale(0.9); opacity: 0.3; }
        60% { transform: translate(-1%, -1%) scale(1.05); opacity: 0.6; }
        80% { transform: translate(1%, 1%) scale(0.95); opacity: 0.4; }
        100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
    }
    
    @keyframes degauss {
        0% { 
            transform: scale(1) rotate(0deg);
            filter: blur(0);
        }
        10% { 
            transform: scale(1.02) rotate(0.5deg);
            filter: blur(3px) hue-rotate(180deg);
        }
        20% { 
            transform: scale(0.98) rotate(-0.5deg);
            filter: blur(2px) hue-rotate(-90deg);
        }
        30% { 
            transform: scale(1.01) rotate(0.2deg);
            filter: blur(1px) hue-rotate(90deg);
        }
        40% { 
            transform: scale(0.99) rotate(-0.2deg);
            filter: blur(0.5px) hue-rotate(-45deg);
        }
        100% { 
            transform: scale(1) rotate(0deg);
            filter: blur(0) hue-rotate(0deg);
        }
    }
`;
document.head.appendChild(style);

// Initialize all CRT effects
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(createPhosphorBurnIn, 2500); // After startup flicker
    setTimeout(addInterference, 3000);
    setTimeout(staticBurst, 3500);
    
    // Occasional degauss
    setInterval(() => {
        if (Math.random() < 0.001) {
            warmUpSequence();
        }
    }, 10000);
});