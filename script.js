const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lives = 3;
let gamState = "playing";

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
    y: canvas.height - 120,
    width: 50,
    height: 110,
    speed: 13,
    isThrown: false;
}

let fruits = [];

function spawnFruits() {
    fruits = [];
    let spacing  = canvas.width / 6;

    for (let i = 0; i < 5; i++) {
        fruits.push({
            x: spacing * (i + 1) - 40,
            y: 80 + (i % 2 * 35),
            width: 75,
            height: 75,
            speed: (i % 2 === 0 ? 3.5 : -3.5),
            imgIndex: i
        });
    }
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

function update() {
    if (gameState !== "playing") return;

    fruit.forEach(f => {
        f.x += f.speed;
        if (f.x <= 20 || f.x + f.width >= canvas.width - 20) {
            f.speed *= -1;
        }
    });

    if (pen.isThrown) {
        pen.y -= pen.speed;

        let hitIndex = -1;
        for (let i = 0; i < fruits.length; i++) {
            let f = fruits[i];
            if (
                pen.x < f.x + f.width &&
                pen.x + pen.width > f.x &&
                pen.y < f.y + f.height &&
                pen.y + pen.height > f.y                
            ) {
                hitIndex = i;
                break;
            }
        }

        if (hitIndex !== -1){
            score += 100;
            pen.isThrown = false;
            pen.y = canvas.height - 120;
            fruits[hitIndex].x = Math.random() * (canvas.width - 150) + 50;
            fruits[hitIndex].speed = (Math.random() > 0.5 ? 4 : -4);
            fruits[hitIndex].imgIndex = Math.floor(Math.random() * fruitImages.length);
        }

        if (pen.y < -pen.height) {
            lives--;
            pen.isThrown = false;
            pen.y = canvas.height - 120;

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
    ctx.drawImage(heartImg, canvas.width - 180 + (i * 45), 30, 35, 35);
}

fruits.forEach(f => {
    ctx.drawImage(fruitImage[f.imgIndex], f.x, f.y, f.width, f.height);
});

ctx.drawImage(penImg, pen.x, pen.y, pen.width, pen.height);

if (gameState === "gameover") {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.fillStyle = "#38bdf8";
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