// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const COLS = Math.floor(CANVAS_WIDTH / GRID_SIZE);
const ROWS = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = generateApple();
let score = 0;
let applesEaten = 0;
let highScore = localStorage.getItem('appleRushHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100; // milliseconds between moves
let gameLoopInterval = null;

// DOM Elements
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const applesEatenDisplay = document.getElementById('applesEaten');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialize
updateScore();
highScoreDisplay.textContent = highScore;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

function generateApple() {
    let newApple;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newApple = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
        
        for (let segment of snake) {
            if (segment.x === newApple.x && segment.y === newApple.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    return newApple;
}

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoopInterval = setInterval(update, gameSpeed);
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Check collision with walls
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        endGame();
        return;
    }
    
    // Check collision with self
    for (let segment of snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
            endGame();
            return;
        }
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if apple eaten
    if (newHead.x === apple.x && newHead.y === apple.y) {
        score += 10;
        applesEaten++;
        apple = generateApple();
        
        // Increase difficulty every 5 apples
        if (applesEaten % 5 === 0) {
            gameSpeed = Math.max(50, gameSpeed - 10);
            clearInterval(gameLoopInterval);
            gameLoopInterval = setInterval(update, gameSpeed);
        }
        
        updateScore();
    } else {
        // Remove tail
        snake.pop();
    }
    
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        if (i === 0) {
            // Head
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            
            // Eyes
            ctx.fillStyle = 'white';
            const eyeOffset = 3;
            const eyeSize = 2;
            
            if (direction.x === 1) { // Right
                ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
            } else if (direction.x === -1) { // Left
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
            } else if (direction.y === -1) { // Up
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
            } else if (direction.y === 1) { // Down
                ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
            }
        } else {
            // Body
            ctx.fillStyle = '#00CC00';
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
    }
    
    // Draw apple
    const appleX = apple.x * GRID_SIZE;
    const appleY = apple.y * GRID_SIZE;
    
    // Apple body
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(appleX + GRID_SIZE / 2, appleY + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Apple stem
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(appleX + GRID_SIZE / 2, appleY + 2);
    ctx.lineTo(appleX + GRID_SIZE / 2, appleY + 6);
    ctx.stroke();
    
    // Apple leaf
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(appleX + GRID_SIZE / 2 + 4, appleY + 4, 3, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

function handleKeyPress(e) {
    if (!gameRunning && e.code !== 'Space') return;
    
    switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case 'Space':
            togglePause();
            e.preventDefault();
            break;
    }
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function endGame() {
    gameRunning = false;
    clearInterval(gameLoopInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('appleRushHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    alert(`Game Over!\nScore: ${score}\nApples Eaten: ${applesEaten}\nHigh Score: ${highScore}`);
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoopInterval);
    
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    apple = generateApple();
    score = 0;
    applesEaten = 0;
    gameSpeed = 100;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    
    updateScore();
    draw();
}

function updateScore() {
    scoreDisplay.textContent = score;
    applesEatenDisplay.textContent = applesEaten;
}

// Initial draw
draw();
