let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const size_W = 100;
const size_H = 100;
const shooter = new Array(1);
const enemy = new Array(3);

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

    ctx.drawImage(shooter[0], W - 250, H - 100, size_W, size_H);
    ctx.drawImage(enemy[0], 0, 0, size_W, size_H)
    ctx.drawImage(enemy[1], 100, 0, size_W, size_H)
    ctx.drawImage(enemy[2], 200, 0, size_W, size_H)
}

init();