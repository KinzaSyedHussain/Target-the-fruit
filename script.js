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

const pens = [
    { id: 0, name: "Default Pen", scoreCost: 0, unlocked: true, src: "pen.png" },
    { id: 1, name: "Pen 1", scoreCost: 1000, unlocked: false, src: "pen1.png" },
    { id: 2, name: "Pen 2", scoreCost: 1700, unlocked: false, src: "pen2.png" },
    { id: 3, name: "Pen 3", scoreCost: 2000, unlocked: false, src: "pen3.png" }
];
let currentPenIndex = 0;

const penImages = pens.map(p => {
    const img = new Image();
    img.src = p.src;
    return img;
});

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
    width: 80,
    height: 80,
    baseSpeed: 2.5,
    speed: 4,
    imgIndex: 0
};

function spawnFruits() {
    fruit.width = 80;
    fruit.height = 80;
    fruit.x = Math.random() * (canvas.width - 200) + 100;
    let direction = (Math.random() > 0.5 ? 1 : -1);
    fruit.speed = fruit.baseSpeed * direction;
    fruit.imgIndex = Math.floor(Math.random() * fruitImages.length);
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing") shootPen();
        else if (gameState === "gameover") resetGame();
    }
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === "playing") {
        if (mouseX >= 220 && mouseX <= 330 && mouseY >= 30 && mouseY <= 70) {
            gameState = "shop";
            return;
        }
        shootPen();
    } else if (gameState === "shop") {
        let boxWidth = 420;
        let boxHeight = 390;
        let boxX = canvas.width / 2 - boxWidth / 2;
        let boxY = canvas.height / 2 - boxHeight / 2;

        if (mouseX >= boxX + boxWidth - 45 && mouseX <= boxX + boxWidth - 15 && mouseY >= boxY + 15 && mouseY <= boxY + 45) {
            gameState = "playing";
            return;
        }

        pens.forEach((p, index) => {
            let itemY = boxY + 65 + (index * 75);
            if (mouseX >= boxX + 20 && mouseX <= boxX + boxWidth - 20 && mouseY >= itemY && mouseY <= itemY + 65) {
                if (p.unlocked || score >= p.scoreCost) {
                    p.unlocked = true;
                    currentPenIndex = index;
                }
            }
        });
    } else if (gameState === "gameover") {
        resetGame();
    }
});

function shootPen() {
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
    } else if (fruit.x + fruit.width >= canvas.width - 10) {
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

            pens.forEach(p => {
                if (score >= p.scoreCost) {
                    p.unlocked = true;
                }
            });

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

    ctx.fillStyle ="rgb(255, 184, 254)";
    ctx.fillRect(220, 30, 110, 40);
    ctx.fillStyle ="#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Shop", 250, 57);
    

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

    let activePenImg = penImages[currentPenIndex];
    if (activePenImg && activePenImg.complete && activePenImg.naturalWidth !== 0) {
        ctx.drawImage(activePenImg, pen.x, pen.y, pen.width, pen.height);
    } else {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(pen.x, pen.y, pen.width, pen.height);
    }

    if (gameState === "shop") {
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let boxWidth = 420;
        let boxHeight = 390;
        let boxX = canvas.width / 2 - boxWidth / 2;
        let boxY = canvas.height / 2 - boxHeight / 2;

        ctx.fillStyle ="rgb(255, 235, 255)";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle ="rgb(248, 147, 255)";
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PEN SHOP", canvas.width / 2, boxY + 40);

        ctx.fillStyle = "rgb(248, 147, 255)";
        ctx.fillRect(boxX + boxWidth - 45, boxY + 15, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("X", boxX + boxWidth - 30, boxY + 36);

        pens.forEach((p, index) => {
            let itemY = boxY + 65 + (index * 75);
            
            ctx.fillStyle = (index === currentPenIndex) ? "#f752ea" :"rgb(255, 148, 221)";
            ctx.fillRect(boxX + 20, itemY, boxWidth - 40, 60);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(p.name, boxX + 35, itemY + 35);

            ctx.textAlign = "right";
            if (index === currentPenIndex) {
                ctx.fillStyle = "rgb(248, 147, 255)";
                ctx.fillText("EQUIPPED", boxX + boxWidth - 35, itemY + 35);
            } else if (p.unlocked || score >= p.scoreCost) {
                ctx.fillStyle = "#4ade80";
                ctx.fillText("SELECT", boxX + boxWidth - 35, itemY + 35);
            } else {
                ctx.fillStyle = "#facc15";
                ctx.fillText(`🔒 Need ${p.scoreCost} Score`, boxX + boxWidth - 35, itemY + 35);
            }
        });
        ctx.textAlign = "left";
    }

    if (gameState === "gameover") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
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