const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lives = 3;
let gameState = "playing";

const fruitSources = ['apple.png', 'grape.png', 'watermelon.png', 'banana.png', 'pear.png'];
const fruitImages = fruitSources.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

const penImg = new Image();
penImg.src = 'pen.png';

const heartImg = new Image();
heartImg.src = 'heart.png';

const pen = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 140,
    width: 40,
    height: 140,
    speed: 13,
    isThrown: false
};

let fruit = {
    x: canvas.width / 2 - 40,
    y: 100,
    width: 100,
    height: 80,
    baseSpeed: 2.5,
    speed: 4,
    imgIndex: 0
};

function spawnFruits() {
    fruit.width = 80;
    fruit.height = 80;
    fruit.x = Math.random() * (canvas.width - 200) + 100;

    let direction  = (Math.random() > 0.5 ? 1 : -1);
    fruit.speed = fruit.baseSpeed * direction;
    fruit.imgIndex = Math.floor(Math.random() * fruitImages.length);
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        shootPen();
    }
});

canvas.addEventListener("click", () => {
    shootPen();
});

function shootPen() {
    if (gameState === "gameover") {
        resetGame();
        return;
    }
    if (!pen.isThrown) {
        pen.isThrown = true;
    }
}

function resetGame() {
    score = 0;
    lives = 3;
    fruit.baseSpeed = 2.5;
    gameState = "playing";
    pen.isThrown = false;
    pen.y = canvas.height - 140;
    spawnFruits();
}

function update() {
    if (gameState !== "playing") return;

    fruit.x += fruit.speed;
    if (fruit.x <= 10) {
        fruit.x = 10;
        fruit.speed *= -1;
    } else if ( fruit.x + fruit.width >= canvas.width - 10) {
        fruit.x = canvas.width - 10 - fruit.width;
        fruit.speed *= -1;
    }

    if (pen.isThrown) {
        pen.y -= pen.speed;

        if (
            pen.x < fruit.x + fruit.width &&
            pen.x + pen.width > fruit.x &&
            pen.y < fruit.y + fruit.height &&
            pen.y + pen.height > fruit.y                
        ) {
            score += 100;
            if (fruit.baseSpeed < 10) {
                fruit.baseSpeed += 0.6;
            }
            pen.isThrown = false;
            pen.y = canvas.height - 140;
            spawnFruits();
        }

        if (pen.y < -pen.height) {
            lives--;
            pen.isThrown = false;
            pen.y = canvas.height - 140;

            if (lives <= 0) {
                gameState = "gameover";
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(`Score: ${score}`, 40, 60);
    ctx.shadowBlur = 0;

    for (let i = 0; i < lives; i++) {
        let heartX = canvas.width - 180 + (i * 45);
        if (heartImg.complete && heartImg.naturalWidth !== 0) {
            ctx.drawImage(heartImg, heartX, 30, 35, 35);
        } else {
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(heartX + 15, 45, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let img = fruitImages[fruit.imgIndex];
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, fruit.x, fruit.y, fruit.width, fruit.height);
    } else {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(fruit.x + fruit.width / 2, fruit.y + fruit.height / 2, fruit.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (penImg.complete && penImg.naturalWidth !== 0) {
        ctx.drawImage(penImg, pen.x, pen.y, pen.width, pen.height);
    } else {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(pen.x, pen.y, pen.width, pen.height);
    }

    if (gameState === "gameover") {
        ctx.fillStyle = "rgba(95, 95, 95, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#fa78e4";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#f5fa5f";
        ctx.fillText("Click or Press Space to Restart", canvas.width / 2, canvas.height / 2 + 80);
        ctx.textAlign = "left";
    }
}

spawnFruits();

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();