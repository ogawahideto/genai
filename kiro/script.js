// Kiro Inspired Webapp - Main Script
// 輝きをテーマにしたインタラクティブなビジュアルエクスペリエンス

// ========================================
// Constants and Configuration
// ========================================

const COLORS = [
    'rgba(255, 223, 0, ',   // 黄金色
    'rgba(255, 193, 7, ',   // 黄色
    'rgba(255, 152, 0, ',   // オレンジ
    'rgba(255, 255, 255, ', // 白
    'rgba(255, 235, 59, '   // 明るい黄色
];

// ========================================
// Particle Class
// ========================================

class Particle {
    constructor(x, y, color, velocity, size) {
        this.x = x;
        this.y = y;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = 0.01;
    }

    update(deltaTime) {
        // Update position based on velocity
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        
        // Apply gravity
        this.vy += 0.05;
        
        // Decay life
        this.life -= this.decay;
    }

    draw(context) {
        if (this.life <= 0) return;
        
        context.save();
        
        // Apply glow effect
        context.shadowBlur = 15;
        context.shadowColor = this.color + '1)';
        
        // Draw particle
        context.globalAlpha = this.life;
        context.fillStyle = this.color + this.life + ')';
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// ========================================
// ParticleSystem Class
// ========================================

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createEffect(x, y) {
        // Create multiple particles for each effect
        const particleCount = 20 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = 2 + Math.random() * 3;
            
            this.particles.push(new Particle(x, y, color, velocity, size));
        }
    }

    update(deltaTime) {
        // Update all particles
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(deltaTime);
        }
        
        // Remove dead particles
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(context) {
        for (let particle of this.particles) {
            particle.draw(context);
        }
    }

    clear() {
        this.particles = [];
    }
}

// ========================================
// Application Controller
// ========================================

const App = {
    canvas: null,
    ctx: null,
    particleSystem: null,
    lastTime: 0,
    
    init() {
        this.setupCanvas();
        this.particleSystem = new ParticleSystem();
        this.setupEventListeners();
        this.animate(0);
    },
    
    setupCanvas() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    },
    
    resizeCanvas() {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.7;
        
        this.canvas.width = Math.min(maxWidth, 1200);
        this.canvas.height = Math.min(maxHeight, 800);
    },
    
    setupEventListeners() {
        // Canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Clear button handler
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => this.handleClear());
        
        // Keyboard shortcut (C key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                this.handleClear();
            }
        });
    },
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.particleSystem.createEffect(x, y);
    },
    
    handleClear() {
        this.particleSystem.clear();
    },
    
    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particleSystem.update(deltaTime);
        this.particleSystem.draw(this.ctx);
        
        // Continue animation loop
        requestAnimationFrame((t) => this.animate(t));
    }
};

// ========================================
// Initialize Application
// ========================================

// Start the application when DOM is ready (only in browser, not during testing)
if (typeof process === 'undefined' || !process.env.NODE_ENV) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }
}

// ========================================
// Exports for Testing
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Particle, ParticleSystem, COLORS };
}
