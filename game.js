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
let apple = generateFruit();
let score = 0;
let applesEaten = 0;
let lives = 3;
let highScore = localStorage.getItem('appleRushHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let gameSpeed = 100;
let gameLoopInterval = null;

// DOM Elements
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const applesEatenDisplay = document.getElementById('applesEaten');
const livesDisplay = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialize
updateScore();
highScoreDisplay.textContent = highScore;
livesDisplay.textContent = lives;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Get animal based on score
function getAnimal() {
    if (score < 100) return 'worm';
    if (score < 200) return 'fish';
    if (score < 300) return 'hippo';
    return 'crocodile';
}

// Get fruit based on score
function getFruit() {
    if (score < 100) return 'apple';
    if (score < 200) return 'orange';
    if (score < 300) return 'strawberry';
    return 'banana';
}

function generateFruit() {
    let newFruit;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFruit = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
        
        for (let segment of snake) {
            if (segment.x === newFruit.x && segment.y === newFruit.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    return newFruit;
}

function startGame() {
    if (gameRunning) return;
    if (gameOver) return; // Don't allow start if game is over
    
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
    
    // Check collision with walls or self
    let collision = false;
    
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        collision = true;
    }
    
    // Check collision with self
    for (let segment of snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
            collision = true;
            break;
        }
    }
    
    if (collision) {
        loseLife();
        return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if fruit eaten
    if (newHead.x === apple.x && newHead.y === apple.y) {
        score += 10;
        applesEaten++;
        apple = generateFruit();
        
        // Increase difficulty every 5 fruits
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
    
    // Draw animal based on score
    drawAnimal();
    
    // Draw fruit based on score
    drawFruit();
    
    // Draw game over message if needed
    if (gameOver) {
        drawGameOver();
    }
}

function drawAnimal() {
    const animal = getAnimal();
    
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        if (i === 0) {
            // Head
            drawHead(x, y, animal);
        } else {
            // Body
            drawBody(x, y, animal);
        }
    }
}

function drawHead(x, y, animal) {
    switch(animal) {
        case 'worm':
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(x + 5, y + 5, 2, 2);
            ctx.fillRect(x + 12, y + 5, 2, 2);
            break;
        case 'fish':
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.ellipse(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, GRID_SIZE / 3 - 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(x + 8, y + 6, 2, 2);
            ctx.fillRect(x + 8, y + 12, 2, 2);
            break;
        case 'hippo':
            ctx.fillStyle = '#9966CC';
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(x + 5, y + 5, 2, 2);
            ctx.fillRect(x + 12, y + 5, 2, 2);
            break;
        case 'crocodile':
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(x + 1, y + 5, GRID_SIZE - 2, GRID_SIZE - 10);
            ctx.fillStyle = '#00CC00';
            ctx.fillRect(x + 2, y + 4, GRID_SIZE - 4, 3);
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(x + 4, y + 3, 2, 2);
            ctx.fillRect(x + 13, y + 3, 2, 2);
            break;
    }
}

function drawBody(x, y, animal) {
    switch(animal) {
        case 'worm':
            ctx.fillStyle = '#00CC00';
            ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            break;
        case 'fish':
            ctx.fillStyle = '#FF1493';
            ctx.beginPath();
            ctx.ellipse(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, GRID_SIZE / 3 - 2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'hippo':
            ctx.fillStyle = '#8844BB';
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'crocodile':
            ctx.fillStyle = '#009900';
            ctx.fillRect(x + 2, y + 5, GRID_SIZE - 4, GRID_SIZE - 10);
            break;
    }
}

function drawFruit() {
    const fruit = getFruit();
    const fruitX = apple.x * GRID_SIZE;
    const fruitY = apple.y * GRID_SIZE;
    
    switch(fruit) {
        case 'apple':
            // Apple body
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(fruitX + GRID_SIZE / 2, fruitY + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Stem
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fruitX + GRID_SIZE / 2, fruitY + 2);
            ctx.lineTo(fruitX + GRID_SIZE / 2, fruitY + 6);
            ctx.stroke();
            break;
        case 'orange':
            // Orange
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(fruitX + GRID_SIZE / 2, fruitY + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // Segments
            ctx.strokeStyle = '#FF9500';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(fruitX + GRID_SIZE / 2, fruitY + 4);
            ctx.lineTo(fruitX + GRID_SIZE / 2, fruitY + 16);
            ctx.stroke();
            break;
        case 'strawberry':
            // Strawberry body
            ctx.fillStyle = '#FF1493';
            ctx.beginPath();
            ctx.ellipse(fruitX + GRID_SIZE / 2, fruitY + GRID_SIZE / 2 + 2, GRID_SIZE / 2 - 2, GRID_SIZE / 2 - 3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Leaves
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2);
                const lx = fruitX + GRID_SIZE / 2 + Math.cos(angle) * 5;
                const ly = fruitY + 2 + Math.sin(angle) * 2;
                ctx.beginPath();
                ctx.ellipse(lx, ly, 2, 3, angle, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'banana':
            // Banana
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(fruitX + GRID_SIZE / 2, fruitY + GRID_SIZE / 2, GRID_SIZE / 3, 0.2, Math.PI - 0.2);
            ctx.stroke();
            break;
    }
}

function drawGameOver() {
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game Over text
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    
    // Score text
    ctx.fillStyle = '#FFD700';
    ctx.font = '30px Arial';
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    
    // Restart instruction
    ctx.fillStyle = '#00FF00';
    ctx.font = '20px Arial';
    ctx.fillText(`Press 'R' to Restart`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
}

function handleKeyPress(e) {
    if (gameOver) {
        if (e.key.toLowerCase() === 'r') {
            resetGame();
        }
        return;
    }
    
    if (!gameRunning && e.key !== 'Enter' && e.code !== 'Space') return;
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
        case 'enter':
            if (!gameRunning && !gameOver) startGame();
            e.preventDefault();
            break;
    }
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume (Space)' : 'Pause (Space)';
}

function loseLife() {
    lives--;
    livesDisplay.textContent = lives;
    
    if (lives <= 0) {
        endGame();
    } else {
        // Reset snake position but keep score
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        draw();
    }
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    clearInterval(gameLoopInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause (Space)';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('appleRushHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    draw(); // Draw game over screen
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    gameOver = false;
    clearInterval(gameLoopInterval);
    
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    apple = generateFruit();
    score = 0;
    applesEaten = 0;
    lives = 3;
    gameSpeed = 100;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause (Space)';
    
    updateScore();
    livesDisplay.textContent = lives;
    draw();
}

function updateScore() {
    scoreDisplay.textContent = score;
    applesEatenDisplay.textContent = applesEaten;
}

// Initial draw
draw();
