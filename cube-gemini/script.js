const cube = document.querySelector('.cube');
const resetButton = document.getElementById('reset');
const scrambleButton = document.getElementById('scramble');

let rotateX = 0;
let rotateY = 0;

function updateCubeRotation() {
    cube.style.transform = `translateZ(-100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

resetButton.addEventListener('click', () => {
    rotateX = 0;
    rotateY = 0;
    updateCubeRotation();
});

scrambleButton.addEventListener('click', () => {
    rotateX = Math.floor(Math.random() * 360);
    rotateY = Math.floor(Math.random() * 360);
    updateCubeRotation();
});

let isDragging = false;
let previousX = 0;
let previousY = 0;

cube.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousX = e.clientX;
    previousY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousX;
    const deltaY = e.clientY - previousY;

    rotateY += deltaX * 0.5;
    rotateX -= deltaY * 0.5;

    updateCubeRotation();

    previousX = e.clientX;
    previousY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
