var canvas = document.getElementById("logo");
var ctx = canvas.getContext("2d");

// draw pacman
ctx.beginPath();
ctx.arc(120, 60, 40, 0.2 * Math.PI, 1.8 * Math.PI);
ctx.lineTo(120, 60);
ctx.lineTo(152, 85);
ctx.stroke(); // draw border
ctx.fillStyle = "yellow";
ctx.fill();


// this function draws a circle with a given radius and center coordinates
function drawCircle(x, y, r) {
    if (ctx.fillStyle != '#000000') {
        ctx.globalAlpha = 0.5; // so that the circles are more transparent (unless the circle color is black - pacman's eye...)
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, true); // draws counter-clockwise
    ctx.fill();
    ctx.globalAlpha = 1; // returning to original transparency (fully not transparent)
}

// this function draws an image with a given source and center coordinates of the circle inside which we draw it
function drawImageInCircle(url, x, y) {
    if (url != '') {
        const image = new Image();
        image.src = url;
        image.onload = function() {
            ctx.drawImage(image, x - 20, y - 20, 40, 40); // passing top-left coordinates, so we need a slight offset from the center
        }
    }
}

var circlesAndImgs = [
    { color: "#7f93ae", x: 50, y: 30, r: 28, img: 'public/assets/images/mario.png' },
    { color: "#4a8e29", x: 50, y: 90, r: 28, img: 'public/assets/images/galaxian.png' },
    { color: "#2031a3", x: 185, y: 30, r: 28, img: 'public/assets/images/pacman-ghost.png' },
    { color: "#d28245", x: 185, y: 90, r: 28, img: 'public/assets/images/space-invaders.png' },
    { color: "black", x: 120, y: 35, r: 5, img: '' } // pacman's eye
];

// drawing all circles and images inside them
for (var element of circlesAndImgs) {
    ctx.fillStyle = element.color;
    drawCircle(element.x, element.y, element.r);
    drawImageInCircle(element.img, element.x, element.y);
}
