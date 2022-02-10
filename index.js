let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const size_W = 50;
const size_H = 50;
const shooter = new Array(1);
const enemy = new Array(5);
let enemyData = new Array(5 * 5); // { x: x, h: h, exist: true };
let shooterData = { x: W - 250, y: H - size_H, shooting: false };

let keypress = [false, false]; // 左、右の矢印が押されているかどうか

const init = () => {
    ctx.beginPath();
    ctx.fillStyle = 'rgb(54, 50, 50)';
    ctx.fillRect(0, 0, W, H);
    let totalLoadImage = shooter.length + enemy.length;
    const loadImage = (arr, imgName) => {
        for (let i = 0; i < arr.length; i++) {
            let img = new Image();
            img.src = `images/${imgName}${i + 1}.png`;
            img.onload = () => {
                arr[i] = img;
                totalLoadImage--;
                if (totalLoadImage === 0) { initGame() }
            }
        }
    }
    loadImage(shooter, "shooter");
    loadImage(enemy, "enemy")
}
const initGame = () => {
    ctx.drawImage(shooter[0], W - 250, H - size_H, size_W, size_H);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.drawImage(enemy[i], 2 * size_W + size_W * j, size_H * i, size_W, size_H);
            enemyData[4 * i + j] = [2 * size_W + size_W * j, size_H * i, i];
            enemyData[4 * i + j] = { x: 2 * size_W + size_W * j, h: size_H * i, exist: true };
        }
    }
    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);
    let inerval = setInterval(() => {
        mainGame()
    }, 200);
}
const keyDownEvent = (event) => {
    if (event.key === "ArrowLeft") {
        keypress = [true, false];
    }
    if (event.key === "ArrowRight") {
        keypress = [false, true];
    }
}
const keyUpEvent = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        keypress = [false, false];
    }
}
const mainGame = () => {
    if (keypress[0]) {
        shooterData.x -= 10;
        ctx.drawImage(shooter[0], shooterData.x, shooterData.y, size_W, size_H);
    }
    if (keypress[1]) {
        shooterData.x += 10;
        ctx.drawImage(shooter[0], shooterData.x, shooterData.y, size_W, size_H);
    }

}

init();