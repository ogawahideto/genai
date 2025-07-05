const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let mouse = {
    x: undefined,
    y: undefined
};

// Gemini constellation coordinates (normalized) and connections
const geminiStars = [
    { x: 0.45, y: 0.3, name: 'Castor', radius: 3 },
    { x: 0.55, y: 0.35, name: 'Pollux', radius: 3.5 },
    { x: 0.6, y: 0.5, name: 'Alhena', radius: 2.5 },
    { x: 0.65, y: 0.65, name: '', radius: 2 },
    { x: 0.4, y: 0.4, name: '', radius: 2 },
    { x: 0.3, y: 0.5, name: '', radius: 2 },
    { x: 0.25, y: 0.6, name: '', radius: 2 }
];

const geminiLines = [
    [0, 1], [1, 2], [2, 3], [1, 4], [0, 4], [4, 5], [5, 6]
];

function createStars() {
    stars = [];
    for (let i = 0; i < 800; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            velocity: {
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5
            }
        });
    }
}

function drawStars() {
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        star.x += star.velocity.x;
        star.y += star.velocity.y;

        if (star.x < 0 || star.x > canvas.width) star.velocity.x = -star.velocity.x;
        if (star.y < 0 || star.y > canvas.height) star.velocity.y = -star.velocity.y;
    }
}

function drawGemini() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.8;

    const scaledStars = geminiStars.map(star => ({
        ...star,
        screenX: centerX + (star.x - 0.5) * scale,
        screenY: centerY + (star.y - 0.5) * scale
    }));

    // Draw lines
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const line of geminiLines) {
        const startStar = scaledStars[line[0]];
        const endStar = scaledStars[line[1]];
        ctx.moveTo(startStar.screenX, startStar.screenY);
        ctx.lineTo(endStar.screenX, endStar.screenY);
    }
    ctx.stroke();

    // Draw stars and handle interaction
    for (const star of scaledStars) {
        let radius = star.radius;
        const dist = Math.hypot(mouse.x - star.screenX, mouse.y - star.screenY);

        if (dist < 50) {
            radius *= 2; // Glow effect
            if (star.name) {
                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                ctx.font = '16px Times New Roman';
                ctx.fillText(star.name, star.screenX + 15, star.screenY - 15);
            }
        }

        ctx.beginPath();
        ctx.arc(star.screenX, star.screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawGemini();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

createStars();
animate();
