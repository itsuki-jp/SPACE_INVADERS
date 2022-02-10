let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const size_W = 50;
const size_H = 50;
const shooterImg = new Array(1);
const enemyImg = new Array(5);
let enemyData = new Array(5 * 5); // { x: x, h: h, exist: true };
let shooterData = { x: W - 250, y: H - size_H, w: size_W, h: size_H };
let direction = 1; // 1の時は右、-1の時は左に動く
let shooterBeamData = { x: -100, y: -100, w: 4, h: 15, shooting: false };
let enemyBeamData = [];
let walls = [];
let enemyCount = 25;
let cnt = 0;
let interval = null;
const intervalTime = 15;

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
    ctx.save()
    ctx.drawImage(shooterImg[0], W - 250, H - size_H, size_W, size_H);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.drawImage(enemyImg[i], 2 * size_W + size_W * j, size_H * i, size_W, size_H);
            enemyData[5 * i + j] = { x: 2 * size_W + size_W * j, y: size_H * i, w: size_W, h: size_H, exist: true };
        }
    }
    ctx.fillStyle = 'rgb(255, 255, 0)';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 100 / 20; j++) {
            for (let k = 0; k < 100 / 20; k++) {
                let temp = { x: 25 + 150 * i + 20 * k, y: 300 + 20 * j, w: 20, h: 20 };
                walls.push(temp);
                ctx.fillRect(temp.x, temp.y, temp.w, temp.h);
            }
        }
    }

    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);
    document.addEventListener("keypress", keyPressEvent);
    ctx.restore();
    interval = setInterval(() => {
        mainGame()
    }, intervalTime);
}
const mainGame = () => {
    if (enemyCount === 0) {
        clear_Interval(1);
    }
    ctx.save();
    ctx.fillRect(0, 0, W, H);
    // shooterの操作
    if (keypress[0]) {
        shooterData.x -= 10;
        if (!onBoard(shooterData)) {
            shooterData.x += 5;
        }

    } else if (keypress[1]) {
        shooterData.x += 10;
        if (!onBoard(shooterData)) {
            shooterData.x -= 5;
        }
    }
    ctx.drawImage(shooterImg[0], shooterData.x, shooterData.y, size_W, size_H);

    // ビーム打つ(shooter)
    if (shooterBeamData.shooting) {
        ctx.fillStyle = 'rgb(255, 255, 0)';
        shooterBeamData.y -= shooterBeamData.h;
        if (onBoard(shooterBeamData)) { ctx.fillRect(shooterBeamData.x, shooterBeamData.y, shooterBeamData.w, shooterBeamData.h); } else { shooterBeamData.shooting = false; }
    }
    // ビームを打つ(enemy)
    let newEnemyBeamData = [];
    ctx.fillStyle = 'rgb(255, 0, 0)';
    for (let i = 0; i < enemyBeamData.length; i++) {
        enemyBeamData[i].y += enemyBeamData[i].h;
        if (onBoard(enemyBeamData[i])) {
            if (collisionCheck(enemyBeamData[i], shooterData)) {
                clear_Interval(0);
            }
            ctx.fillRect(enemyBeamData[i].x, enemyBeamData[i].y, enemyBeamData[i].w, enemyBeamData[i].h);
            newEnemyBeamData.push(enemyBeamData[i]);
        }
    }
    enemyBeamData = newEnemyBeamData;

    // 敵の操作
    let movable = true;
    enemyCount = 0;
    for (let i = 0; i < enemyData.length; i++) {
        enemyData[i].x += 1 * direction;
        if (enemyData[i].exist && !onBoard(enemyData[i])) {
            movable = false;
        }
        if (enemyData[i].exist) {
            enemyCount++;
        }
    }
    // もし誰も壁に当たらなければ、横に移動する
    if (movable) {
        for (let i = 0; i < enemyData.length; i++) {
            if (!enemyData[i].exist) { continue; }
            if (!collisionCheck(shooterBeamData, enemyData[i])) {
                ctx.drawImage(enemyImg[i % 5], enemyData[i].x, enemyData[i].y, size_W, size_H);
            } else {
                shooterBeamData.shooting = false;
                enemyData[i].exist = false;
                shooterBeamData.x = -100;
                shooterBeamData.y = -100;
            }
            if (cnt % Math.floor(1000 / intervalTime) === 0) {
                let temp = Math.floor(Math.random() * enemyCount);
                if (temp === 0) {
                    let obj = { x: enemyData[i].x, y: enemyData[i].y, w: 4, h: 15 };
                    enemyBeamData.push(obj);
                }
            }
        }
    }

    // もし誰か壁に当たれば、下に移動する
    else {
        direction *= -1;
        for (let i = 0; i < enemyData.length; i++) {
            if (!enemyData[i].exist) { continue; }
            if (collisionCheck(enemyData[i], shooterData)) {
                clear_Interval(0);
            }
            enemyData[i].y += size_H;
            ctx.drawImage(enemyImg[i % 5], enemyData[i].x, enemyData[i].y, size_W, size_H);
        }
    }

    // 壁関連
    if (walls.length != 0 && (shooterBeamData.shooting || enemyBeamData.length != 0)) {
        let newWall = [];
        for (let i = 0; i < walls.length; i++) {
            let TF = true;
            let newEnemyBeam = [];
            if (shooterBeamData.shooting && collisionCheck(shooterBeamData, walls[i])) {
                shooterBeamData.shooting = false;
                TF = false;
            }
            for (let j = 0; j < enemyBeamData.length; j++) {

                if (collisionCheck(enemyBeamData[j], walls[i])) {
                    TF = false;
                } else {
                    newEnemyBeam.push(enemyBeamData[j]);
                }
            }
            if (TF) {
                newWall.push(walls[i])
            }
            enemyBeamData = newEnemyBeam.concat();
        }
        walls = newWall;
    }
    ctx.fillStyle = 'rgb(255, 255, 0)';
    for (let i = 0; i < walls.length; i++) {
        let temp = walls[i];
        ctx.fillRect(temp.x, temp.y, temp.w, temp.h);
    }
    ctx.restore();
    cnt++;
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
        if (!shooterBeamData.shooting) {
            shooterBeamData.shooting = true;
            shooterBeamData.x = shooterData.x + size_W / 2;
            shooterBeamData.y = shooterData.y;
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
        return true;
    }
    return false;
}
const clear_Interval = (win_lose) => {
    clearInterval(interval);
    setTimeout(() => { gameEnd(win_lose) }, 200)

}
const gameEnd = (win_lose) => {
    ctx.beginPath();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, W, H);

    // 文字を描写
    ctx.font = "48px serif";
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgb(255, 255, 0)';
    ctx.textAlign = "center";
    if (win_lose) {
        let text = "Yout Won!!!";
        ctx.fillText(text, W / 2, H / 2);
    } else {
        let text = "Yout Lose...";
        ctx.fillText(text, W / 2, H / 2);
    }

}

init();