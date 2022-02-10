let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const size_W = 50;
const size_H = 50;
const shooterImg = new Array(1);
const enemyImg = new Array(5);
let enemyData = new Array(5 * 5); // { x: x, h: h, exist: true };
let shooterData = { x: W - 250, y: H - size_H, w: size_W, h: size_H, shooting: false };
let direction = 1; // 1の時は右、-1の時は左に動く
let beamData = { x: -100, y: -100, w: 4, h: 15 };
let interval = null;

let keypress = [false, false]; // 左、右の矢印が押されているかどうか

const init = () => {
    ctx.beginPath();
    ctx.fillStyle = 'rgb(54, 50, 50)';
    ctx.fillRect(0, 0, W, H);
    let totalLoadImage = shooterImg.length + enemyImg.length;
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
    loadImage(shooterImg, "shooter");
    loadImage(enemyImg, "enemy")
}
const initGame = () => {
    ctx.drawImage(shooterImg[0], W - 250, H - size_H, size_W, size_H);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.drawImage(enemyImg[i], 2 * size_W + size_W * j, size_H * i, size_W, size_H);
            enemyData[5 * i + j] = { x: 2 * size_W + size_W * j, y: size_H * i, w: size_W, h: size_H, exist: true };
        }
    }
    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);
    document.addEventListener("keypress", keyPressEvent);
    console.log(enemyData);
    interval = setInterval(() => {
        mainGame()
    }, 10);
}
const mainGame = () => {
    ctx.save();
    ctx.fillRect(0, 0, W, H);
    // shooterの操作
    if (keypress[0]) {
        shooterData.x -= 10;
        if (!onBoard(shooterData)) {
            shooterData.x += 10;
            ctx.drawImage(shooterImg[0], shooterData.x, shooterData.y, size_W, size_H);
        }

    } else if (keypress[1]) {
        shooterData.x += 10;
        if (!onBoard(shooterData)) {
            shooterData.x -= 10;
        }
    }
    ctx.drawImage(shooterImg[0], shooterData.x, shooterData.y, size_W, size_H);

    // ビーム打つ
    if (shooterData.shooting) {
        ctx.fillStyle = 'rgb(255, 255, 0)';
        beamData.y -= beamData.h;
        if (onBoard(beamData)) { ctx.fillRect(beamData.x, beamData.y, beamData.w, beamData.h); } else { shooterData.shooting = false; }
    }

    // 敵の操作
    let movable = true;
    for (let i = 0; i < enemyData.length; i++) {
        enemyData[i].x += 1 * direction;
        if (enemyData[i].exist && !onBoard(enemyData[i])) {
            movable = false;
            break;
        }
    }
    // もし誰も壁に当たらなければ、横に移動する
    if (movable) {
        for (let i = 0; i < enemyData.length; i++) {
            if (!enemyData[i].exist) { continue; }
            if (!collisionCheck(beamData, enemyData[i])) {
                ctx.drawImage(enemyImg[i % 5], enemyData[i].x, enemyData[i].y, size_W, size_H);
            } else {
                shooterData.shooting = false;
                enemyData[i].exist = false;
                beamData.x = -100;
                beamData.y = -100;
            }
        }
    }
    // もし誰か壁に当たれば、下に移動する
    else {
        direction *= -1;
        for (let i = 0; i < enemyData.length; i++) {
            if (!enemyData[i].exist) { continue; }
            if (collisionCheck(enemyData[i], shooterData)) {
                console.log("GAME END");
                clearInterval(interval);
                gameEnd();
            }
            enemyData[i].y += size_H;
            ctx.drawImage(enemyImg[i % 5], enemyData[i].x, enemyData[i].y, size_W, size_H);
        }
    }
    ctx.restore();
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
const keyPressEvent = (event) => {
    if (event.keyCode === 32) {
        if (!shooterData.shooting) {
            console.log("space");
            shooterData.shooting = true;
            beamData.x = shooterData.x + size_W / 2;
            beamData.y = shooterData.y;
        }

    }
}

// 対象のオブジェクト？が移動した際に画面内にいるかどうか判定
const onBoard = (data) => {
    if ((0 <= data.x) && (data.x < W - data.w) && (0 <= data.y) && (data.y <= H - data.h)) {
        return true;
    } else {
        return false;
    }
}

// 2つのオブジェクトの当たり判定
const collisionCheck = (obj_1, obj_2) => {
    if ((obj_1.x <= obj_2.x + obj_2.w) && (obj_2.x <= obj_1.x + obj_1.w) &&
        (obj_2.y <= obj_1.y + obj_1.h) && (obj_1.y <= obj_2.y + obj_2.h)) {
        console.log("collide");
        return true;
    }
    return false;
}
const gameEnd = () => {

}

init();