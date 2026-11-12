// Game constants
const CANVAS_WIDTH = 500;  // Increased width
const CANVAS_HEIGHT = 600;
const HEX_SIZE = 18;      // Slightly smaller hexagons
const GRID_COLS = 12;
const GRID_ROWS = 20;

// Game state
let canvas, ctx;
let currentPiece;
let gameBoard;
let score = 0;
let gameLoop;
let currentLevel = 1;
let fallSpeed;
let gameStarted = false;
let gamePaused = false; // new variable to track pause state

// Define 5 specific hexagonal pieces (using offset coordinate system for hexagons)
const PIECES = [
    {
        // Long piece (4 hexagons in a row)
        shape: [[0, 0], [1, 0], [2, 0],[3,0]],
        color: '#FFD700'
    },

    {
        // Long piece (3 hexagons in a row)
        shape: [[0, 0], [1, 0], [2, 0]],
        color: '#91ba85'
    },


    {
        // L shape
        shape: [[0, 0], [0, 1], [1, 1],[1,2]],
        color: '#FFA500'
    },
    {
        //square shape
        shape: [[0,0],[0,1],[1,0],[1,1]] ,
        color: '#946126'
    },
    {
        // Triangle shape
        shape: [[0, 0], [1, 0], [0, 1]],
        color: '#f3e088'
    },
    {
        // Zigzag shape
        // shape: [[0, 0], [1, 0], [1, 1], [2, 1]],
        //color: '#FF4500'
    },

    {
        // Hexagon shape (compact)
        shape: [[0, 0], [1, 0], [0, 1], [1, -1]],
        color: '#e09278'
    },
    //{
    //one Hexagon
    // shape: [[1,1],[1,1]],
    //color: "#003cff"
    //},





];

// Colors for different levels (affects falling speed)
const LEVEL_SPEEDS = {
    1: 1000,  // 1 second
    2: 800,   // 0.8 seconds
    3: 600,   // 0.6 seconds
    4: 400    // 0.4 seconds
};

function initGame(level) {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    currentLevel = level;
    fallSpeed = LEVEL_SPEEDS[level];

    // Initialize empty game board
    gameBoard = Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(null));

    // Create first piece
    createNewPiece();

    // Reset paused state
    gamePaused = false;

    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, fallSpeed);

    // Setup event listeners
    document.addEventListener('keydown', handleInput);
}

function createNewPiece() {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    const piece = PIECES[pieceIndex];

    currentPiece = {
        shape: [...piece.shape], // Clone the shape array
        color: piece.color,
        x: Math.floor(GRID_COLS / 2) - 1,
        y: 0
    };
}

function checkGameOver() {
    // Only check the top row for filled cells
    return gameBoard[0].some(cell => cell !== null);
}

function handleInput(event) {
    // Prevent default behavior for arrow keys and space bar
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
        event.preventDefault();
    }

    // Allow toggling pause regardless of other inputs
    if (event.key.toLowerCase() === 'p') {
        togglePause();
        return;
    }

    // If the game is paused or not started, ignore other inputs
    if (!gameStarted || gamePaused) return;

    switch (event.key) {
        case 'ArrowLeft':
            if (canMove(-1, 0)) currentPiece.x--;
            break;
        case 'ArrowRight':
            if (canMove(1, 0)) currentPiece.x++;
            break;
        case 'ArrowDown':
            if (canMove(0, 1)) {
                currentPiece.y++;
                score += 1; // Bonus points for soft drop
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ': // Space bar for hard drop
            hardDrop();
            break;
    }
    draw();
}
function togglePause() {
    const pauseButton = document.getElementById('pauseButton');
    if (gamePaused) {
        // Resume game
        gamePaused = false;
        gameLoop = setInterval(update, fallSpeed);
        if (pauseButton) pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        // Pause game
        gamePaused = true;
        clearInterval(gameLoop);
        if (pauseButton) pauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
    draw(); // Redraw to show/hide the paused overlay
}

function hardDrop() {
    while (canMove(0, 1)) {
        currentPiece.y++;
        score += 2; // Bonus points for hard drop
    }
    lockPiece();
}

function canMove(dx, dy) {
    return currentPiece.shape.every(([x, y]) => {
        const newX = currentPiece.x + x + dx;
        const newY = currentPiece.y + y + dy;
        return isValidPosition(newX, newY);
    });
}

function isValidPosition(x, y) {
    return x >= 0 && x < GRID_COLS &&
        y >= 0 && y < GRID_ROWS &&
        (gameBoard[y] === undefined || gameBoard[y][x] === null);
}

function rotatePiece() {
    const rotated = currentPiece.shape.map(([x, y]) => [-y, x]);

    // Try normal rotation
    if (rotated.every(([x, y]) => isValidPosition(currentPiece.x + x, currentPiece.y + y))) {
        currentPiece.shape = rotated;
        return;
    }

    // Try wall kicks
    for (let offset of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (rotated.every(([x, y]) =>
            isValidPosition(currentPiece.x + x + offset[0], currentPiece.y + y + offset[1]))) {
            currentPiece.x += offset[0];
            currentPiece.y += offset[1];
            currentPiece.shape = rotated;
            return;
        }
    }
}

function update() {
    if (canMove(0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
        if (checkGameOver()) {
            gameOver();
        }
    }
    draw();
}

function lockPiece() {
    // Add the piece to the game board
    currentPiece.shape.forEach(([x, y]) => {
        const boardX = currentPiece.x + x;
        const boardY = currentPiece.y + y;
        if (boardY >= 0 && boardY < GRID_ROWS && boardX >= 0 && boardX < GRID_COLS) {
            gameBoard[boardY][boardX] = currentPiece.color;
        }
    });

    // Check for completed lines
    checkLines();

    // Create new piece
    createNewPiece();

    // Update score display
    document.getElementById('currentScore').textContent = score;
}


function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background grid
    drawGrid();

    // Draw locked pieces
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (gameBoard[y][x]) {
                drawHexagon(x, y, gameBoard[y][x]);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        currentPiece.shape.forEach(([x, y]) => {
            drawHexagon(
                currentPiece.x + x,
                currentPiece.y + y,
                currentPiece.color
            );
        });
    }

    // If the game is paused, overlay a pause message
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
}

function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            drawHexagon(x, y, null, true);
        }
    }
}

function drawHexagon(x, y, color, isGrid = false) {
    // Adjusted positioning to center the game board
    const xPos = x * HEX_SIZE * 1.75 + CANVAS_WIDTH / 6;
    const yPos = y * HEX_SIZE * 1.5 + 30;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const xPoint = xPos + HEX_SIZE * Math.cos(angle);
        const yPoint = yPos + HEX_SIZE * Math.sin(angle);
        if (i === 0) ctx.moveTo(xPoint, yPoint);
        else ctx.lineTo(xPoint, yPoint);
    }
    ctx.closePath();

    if (isGrid) {
        ctx.stroke();
    } else {
        ctx.fillStyle = color || '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}




// Replace the getHighScore and setHighScore functions with new ones that don't use localStorage
function getHighScore() {
    // Read from the DOM element instead of localStorage
    const highScoreElement = document.getElementById('summary-high-score');
    return highScoreElement ? parseInt(highScoreElement.textContent) || 0 : 0;
}

// This function will be called less frequently now
function setHighScore(score) {
    // Just update the DOM element
    const highScoreElement = document.getElementById('summary-high-score');
    if (highScoreElement) {
        highScoreElement.textContent = score;
    }
}

function checkLines() {
    let linesCleared = 0;

    // Add line cleared effect
    const clearedLines = [];
    for (let y = 0; y < GRID_ROWS; y++) {
        if (gameBoard[y].every(cell => cell !== null)) {
            clearedLines.push(y);
            gameBoard[y].forEach((_, x) => {
                const hex = document.getElementById(`hex-${x}-${y}`);
                if (hex) {
                    hex.classList.add('line-cleared');
                    setTimeout(() => hex.classList.remove('line-cleared'), 500);
                }
            });
            linesCleared++;
            gameBoard.splice(y, 1);
            gameBoard.unshift(Array(GRID_COLS).fill(null));
        }
    }

    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * currentLevel;
        score += points;

        // Update current score display
        document.getElementById('currentScore').textContent = score;

        // Check and update high score in real-time
        const highScore = getHighScore();
        if (score > highScore) {
            setHighScore(score);
            document.getElementById('summary-high-score').textContent = score;
            
            // Save the new high score to the backend immediately
            saveHighScoreToBackend(score);
        }
    }
}

// Function to show celebration popup with confetti
function showCelebration(score) {
    // Update the celebration score
    document.getElementById('celebrationScore').textContent = score;
    
    // Show the celebration popup
    document.getElementById('celebrationPopup').classList.remove('hidden');
    
    // Trigger confetti animation
    launchConfetti();
}

// Function to close the celebration popup
function closeCelebration() {
    document.getElementById('celebrationPopup').classList.add('hidden');
    
    // Get the high score value
    const newScore = parseInt(document.getElementById('celebrationScore').textContent);
    
    // Update the score in the game over screen
    document.getElementById('finalScore').textContent = newScore;
    
    // Add a congratulatory motivational message for new high score
    const highScoreMessages = [
        "Amazing achievement! You've set a new personal record!",
        "Outstanding performance! Your skills are really improving!",
        "Fantastic job! Keep up the great work!",
        "Remarkable score! You're mastering the HexaHive game!",
        "Exceptional playing! Your dedication is paying off!"
    ];
    
    // Set a random congratulatory message
    document.getElementById('motivationalMessage').textContent = 
        highScoreMessages[Math.floor(Math.random() * highScoreMessages.length)];
    
    // Show the game over screen with proper score
    document.getElementById('gameOver').classList.remove('hidden');
}

// Function to launch confetti with bee-themed elements
function launchConfetti() {
    // Duration in milliseconds
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    
    // Confetti colors (bee-themed: yellow, black, honey gold)
    const colors = ['#FFD700', '#FFA500', '#000000', '#F8E473'];
    
    // Launch initial burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['circle', 'square'],
        disableForReducedMotion: true
    });
    
    // Create continuous confetti
    const interval = setInterval(function() {
        if (Date.now() > animationEnd) {
            return clearInterval(interval);
        }
        
        // Launch confetti from random positions
        confetti({
            particleCount: 50,
            angle: Math.random() * 60 + 60,
            spread: 80,
            origin: { x: 0, y: 0.7 },
            colors: colors,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true
        });
        confetti({
            particleCount: 50,
            angle: Math.random() * 60 + 240,
            spread: 80,
            origin: { x: 1, y: 0.7 },
            colors: colors,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true
        });
        
        // Randomly add some emoji confetti (bees and honey)
        if (Math.random() > 0.7) {
            confetti({
                particleCount: 5,
                angle: Math.random() * 360,
                spread: 100,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                scalar: 2,
                shapes: ['emoji'],
                disableForReducedMotion: true,
                shapeOptions: {
                    emoji: {
                        value: ['🐝', '🍯', '🐝', '🍯', '🐝'][Math.floor(Math.random() * 5)]
                    }
                }
            });
        }
    }, 250);
}

// Update the gameOver function
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;

    // Hide the pause button when the game ends
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) pauseButton.classList.add('hidden');

    const highScore = getHighScore();
    
    // Update the best score in the game over popup
    document.getElementById('gameOverBestScore').textContent = highScore;
    
    if (score > highScore) {
        // Update high score
        setHighScore(score);
        document.getElementById('summary-high-score').textContent = score;
        document.getElementById('gameOverBestScore').textContent = score; // Also update in game over
        
        // Set the score in the celebration popup
        document.getElementById('celebrationScore').textContent = score;
        
        // Also set the final score in the game over screen (even though it's hidden now)
        document.getElementById('finalScore').textContent = score;
        
        // Save to backend
        saveHighScoreToBackend(score);
        
        // Show celebration with confetti instead of alert
        showCelebration(score);
    } else {
        // Regular game over display
        document.getElementById('finalScore').textContent = score;
        
        // If score is close to high score (within 10%), add encouraging message
        let closeToHighScore = false;
        if (highScore > 0 && score > highScore * 0.9) {
            closeToHighScore = true;
        }
        
        // Update motivational message with a randomly selected message
        const messages = [
            "Great effort! Take more courses to unlock higher levels!",
            "Keep learning to become even better!",
            "Your dedication to learning will pay off!",
            "Every course completed brings new opportunities!",
            "Bee-lieve in yourself! You'll do better next time!",
            "Even the best bees have off days. Keep buzzing!",
        ];
        
        const closeMessages = [
            "So close to your best score! Just a little more!",
            "Almost there! You're getting better each time!",
            "Nearly beat your record! Keep trying!",
            "You're very close to a new personal best!"
        ];
        
        if (closeToHighScore) {
            document.getElementById('motivationalMessage').textContent = 
                closeMessages[Math.floor(Math.random() * closeMessages.length)];
        } else {
            document.getElementById('motivationalMessage').textContent = 
                messages[Math.floor(Math.random() * messages.length)];
        }
        
        // Show the enhanced game over screen with animation
        document.getElementById('gameOver').classList.remove('hidden');
        
        // Add a small delay for the animations to be noticeable
        setTimeout(() => {
            // You could add additional animations or effects here if desired
        }, 500);
    }
}


function startGame(level) {
    // Hide the instructions section
    const instructionsButton = document.getElementById("instructionsButton");
    const instructionsContent = document.getElementById("instructionsContent");

    if (instructionsButton && instructionsContent) {
        instructionsButton.style.display = "none"; // Hide the button
        instructionsContent.style.display = "none"; // Hide the content
    }

    // Hide the level selection screen
    document.querySelector('.level-selection').classList.add('hidden');

    // Show the game canvas
    document.getElementById('gameCanvas').classList.remove('hidden');

    // Hide the game over screen (if visible)
    document.getElementById('gameOver').classList.add('hidden');

    // Show the pause button
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) pauseButton.classList.remove('hidden');

    // Reset the score
    score = 0;
    document.getElementById('currentScore').textContent = '0';

    // Fetch the overall high score from the backend
    fetch(`/hexahive/score`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const highScore = data.highScore || 0;
            document.getElementById('summary-high-score').textContent = highScore;
        })
        .catch(error => {
            console.error('Error fetching high score:', error);
        });

    // Start the game
    gameStarted = true;
    initGame(level);
}


function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame(currentLevel);
}

function backToLevels() {
    // Hide the game over screen and game canvas
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('gameCanvas').classList.add('hidden');

    // Show the level selection screen
    document.querySelector('.level-selection').classList.remove('hidden');

    // Show the instructions section
    const instructionsButton = document.getElementById('instructionsButton');
    const instructionsContent = document.getElementById('instructionsContent');
    if (instructionsButton && instructionsContent) {
        instructionsButton.style.display = "block"; // Show the button
        instructionsContent.style.display = "block"; // Show the content
    }

    // Reset game state
    gameStarted = false;
    if (gameLoop) clearInterval(gameLoop);

    // Hide pause button when navigating away from the game
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) pauseButton.classList.add('hidden');
}



function saveHighScoreToBackend(score) {
    fetch('/hexahive/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `level=${currentLevel}&score=${score}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('High score saved:', data);
        // Update any other level displays if needed
        document.getElementById('summary-high-score').textContent = score;
    })
    .catch(error => {
        console.error('Error saving high score:', error);
    });
}



const collapsible = document.querySelector(".collapsible");
const content = document.querySelector(".content");

collapsible.addEventListener("click", function () {
    this.classList.toggle("active");
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('gamePopup');
    const getStartedButton = document.getElementById('getStartedButton');

    // Show the pop-up when the page loads
    popup.style.display = 'flex';

    // Hide the pop-up and start the game when the "Get Started" button is clicked
    getStartedButton.addEventListener('click', function () {
        popup.style.display = 'none';
        // You can add any additional logic here to start the game
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch user's high score from the backend
    fetch('/hexahive/score')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the high score display
            document.getElementById('summary-high-score').textContent = data.highScore || 0;
        })
        .catch(error => {
            console.error('Error fetching high score:', error);
        });
});

function backToDashboard() {
    // Navigate to the dashboard page
    window.location.href = '/dashboard';
}

