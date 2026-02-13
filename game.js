// Game State
const gameState = {
    heartsCaught: 0,
    heartsMissed: 0,
    lovePercentage: 0,
    maxHearts: 30, // Total hearts needed to fill the meter
    gameActive: true,
    hearts: []
};

// DOM Elements
const gameCanvas = document.getElementById('gameCanvas');
const basket = document.getElementById('basket');
const loveMeterFill = document.getElementById('loveMeterFill');
const loveMeterText = document.getElementById('loveMeterText');
const heartsCaughtDisplay = document.getElementById('heartsCaught');
const heartsMissedDisplay = document.getElementById('heartsMissed');
const loveLetterOverlay = document.getElementById('loveLetterOverlay');
const closeLetterBtn = document.getElementById('closeLetterBtn');

// Heart emojis to randomly choose from
const heartEmojis = ['❤️', '💕', '💖', '💗', '💝', '💘', '💞'];

// Basket movement (follows mouse)
let basketX = gameCanvas.offsetWidth / 2;

gameCanvas.addEventListener('mousemove', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    basketX = e.clientX - rect.left;
    
    // Keep basket within canvas bounds
    const basketWidth = basket.offsetWidth;
    basketX = Math.max(basketWidth / 2, Math.min(basketX, rect.width - basketWidth / 2));
    
    basket.style.left = basketX + 'px';
});

// Touch support for mobile
gameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = gameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    basketX = touch.clientX - rect.left;
    
    const basketWidth = basket.offsetWidth;
    basketX = Math.max(basketWidth / 2, Math.min(basketX, rect.width - basketWidth / 2));
    
    basket.style.left = basketX + 'px';
});

// Create a falling heart
function createHeart() {
    if (!gameState.gameActive) return;
    
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    
    // Random horizontal position
    const canvasWidth = gameCanvas.offsetWidth;
    const heartSize = 40;
    const randomX = Math.random() * (canvasWidth - heartSize);
    heart.style.left = randomX + 'px';
    
    // Random fall duration (3-6 seconds)
    const fallDuration = 3 + Math.random() * 3;
    heart.style.animationDuration = `${fallDuration}s, 2s`;
    
    gameCanvas.appendChild(heart);
    
    const heartData = {
        element: heart,
        x: randomX,
        caught: false,
        startTime: Date.now(),
        duration: fallDuration * 1000
    };
    
    gameState.hearts.push(heartData);
    
    // Check for collision periodically
    const collisionCheck = setInterval(() => {
        if (heartData.caught) {
            clearInterval(collisionCheck);
            return;
        }
        
        if (checkCollision(heartData)) {
            catchHeart(heartData);
            clearInterval(collisionCheck);
        }
    }, 50);
    
    // Remove heart when animation ends
    setTimeout(() => {
        if (!heartData.caught && heart.parentNode) {
            heart.remove();
            gameState.heartsMissed++;
            updateScore();
            gameState.hearts = gameState.hearts.filter(h => h !== heartData);
        }
    }, fallDuration * 1000 + 100);
}

// Check collision between heart and basket
function checkCollision(heartData) {
    const heart = heartData.element;
    const heartRect = heart.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();
    
    return !(heartRect.right < basketRect.left || 
             heartRect.left > basketRect.right || 
             heartRect.bottom < basketRect.top || 
             heartRect.top > basketRect.bottom);
}

// Catch a heart
function catchHeart(heartData) {
    heartData.caught = true;
    heartData.element.classList.add('caught');
    
    gameState.heartsCaught++;
    updateScore();
    updateLoveMeter();
    
    // Play catch animation then remove
    setTimeout(() => {
        if (heartData.element.parentNode) {
            heartData.element.remove();
        }
        gameState.hearts = gameState.hearts.filter(h => h !== heartData);
    }, 500);
    
    // Check if love meter is full
    if (gameState.lovePercentage >= 100) {
        setTimeout(() => {
            showLoveLetter();
        }, 800);
    }
}

// Update score display
function updateScore() {
    heartsCaughtDisplay.textContent = gameState.heartsCaught;
    heartsMissedDisplay.textContent = gameState.heartsMissed;
}

// Update love meter
function updateLoveMeter() {
    gameState.lovePercentage = Math.min(100, (gameState.heartsCaught / gameState.maxHearts) * 100);
    loveMeterFill.style.width = gameState.lovePercentage + '%';
    loveMeterText.textContent = Math.round(gameState.lovePercentage) + '%';
}

// Show love letter
function showLoveLetter() {
    gameState.gameActive = false;
    
    // Stop spawning hearts
    if (heartSpawnInterval) {
        clearInterval(heartSpawnInterval);
    }
    
    // Remove all remaining hearts
    gameState.hearts.forEach(heartData => {
        if (heartData.element.parentNode) {
            heartData.element.remove();
        }
    });
    gameState.hearts = [];
    
    // Show overlay
    loveLetterOverlay.classList.add('active');
}

// Close love letter
closeLetterBtn.addEventListener('click', () => {
    loveLetterOverlay.classList.remove('active');
    resetGame();
});

// Reset game
function resetGame() {
    gameState.heartsCaught = 0;
    gameState.heartsMissed = 0;
    gameState.lovePercentage = 0;
    gameState.gameActive = true;
    gameState.hearts = [];
    
    updateScore();
    updateLoveMeter();
    
    // Restart heart spawning
    startGame();
}

// Start the game
let heartSpawnInterval;

function startGame() {
    // Spawn hearts at random intervals (0.5-2 seconds)
    function spawnHeart() {
        if (gameState.gameActive) {
            createHeart();
            const nextSpawnTime = 500 + Math.random() * 1500;
            setTimeout(spawnHeart, nextSpawnTime);
        }
    }
    
    spawnHeart();
}

// Initialize game when page loads
window.addEventListener('load', () => {
    startGame();
});

// ============================================
// INTERFACE FOR C BACKEND
// ============================================

/**
 * Function to be called from C backend to update love letter content
 * @param {string} letterHTML - HTML content for the love letter
 */
function updateLoveLetterContent(letterHTML) {
    const letterContent = document.getElementById('letterContent');
    letterContent.innerHTML = letterHTML;
}

/**
 * Function to be called from C backend to set game parameters
 * @param {number} maxHearts - Maximum hearts needed to fill meter
 */
function setGameParameters(maxHearts) {
    gameState.maxHearts = maxHearts;
}

/**
 * Function to get current game state (for C backend to read)
 * @returns {object} Current game state
 */
function getGameState() {
    return {
        heartsCaught: gameState.heartsCaught,
        heartsMissed: gameState.heartsMissed,
        lovePercentage: gameState.lovePercentage,
        gameActive: gameState.gameActive
    };
}

/**
 * Function to manually trigger love letter display (from C backend)
 */
function triggerLoveLetter() {
    showLoveLetter();
}

// Make functions available globally for C backend integration
window.updateLoveLetterContent = updateLoveLetterContent;
window.setGameParameters = setGameParameters;
window.getGameState = getGameState;
window.triggerLoveLetter = triggerLoveLetter;
