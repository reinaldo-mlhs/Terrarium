const canvas_width = 1000;
const canvas_height = 1000;

//marching squares with water
var drew_once = false;
var noise_img;
var rez = 40;
var threshold = 128;
var previous_frame;
var step;
var half_step;

class Water {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.radius = 5;
    }

    step(img) {
        var n = Math.floor((Math.random() * 2) + 1);
        var cheat = 0;
        if (this.y + step == height || this.x + step == width) { cheat = 1; }

        // check to move down
        let value = img.get(this.x, this.y + step - cheat);
        if (value[0] > 200) {
            this.y += height / rez;
            n = 0
        }

        // check to move right or left
        value = img.get(this.x + step - cheat, this.y);
        if (value[0] > 200 && n == 2) {
            this.x += width / rez;
        }
        value = img.get(this.x - step, this.y);
        if (value[0] > 200 && n == 1) {
            this.x -= width / rez;
        }

        this.draw();
    }

    draw() {
        fill(color(0, 0, 255));
        circle(this.x, this.y, this.radius);
    }
}
var water = [];


function setup() {
    createCanvas(canvas_width, canvas_height);

    step = Math.round(width / rez);
    half_step = Math.round(step / 2);

    pixelDensity(1);
    stroke(0);
    noise_img = perlinNoise();
    previous_frame = get();
}


function draw() {
    background(220);
    march(noise_img, rez, previous_frame);

    water.forEach(w => {
        w.step(previous_frame);
    })

    previous_frame = get();
}

function mousePressed() {
    noise_img.loadPixels();
    var pos = [mouseX, mouseY, 30]
    for (var x = 0; x < noise_img.width; x++) {
        for (var y = 0; y < noise_img.height; y++) {
            if ((x - pos[0]) * (x - pos[0]) + (y - pos[1]) * (y - pos[1]) <= (pos[2] * pos[2])) {
                let index = (x + y * width) * 4;
                noise_img.pixels[index] = 0;
                noise_img.pixels[index + 1] = 0;
                noise_img.pixels[index + 2] = 0;
                noise_img.pixels[index + 3] = 255;
            }

        }
    }
    noise_img.updatePixels();
    redraw();
}

function drawState(state, fill_color, a, b, c, d, x, y, step) {
    switch (state) {
        case 0:
            break;
        case 1:
            fill(fill_color)
            triangle(c[0], c[1], d[0], d[1], x - step, y);
            break;
        case 2:
            fill(fill_color);
            triangle(b[0], b[1], c[0], c[1], x, y);
            break;
        case 3:
            fill(fill_color);
            quad(b[0], b[1], d[0], d[1], x - step, y, x, y);
            break;
        case 4:
            fill(fill_color);
            triangle(a[0], a[1], b[0], b[1], x, y - step);
            break;
        case 5:
            fill(fill_color);
            beginShape();
            vertex(a[0], a[1]);
            vertex(d[0], d[1]);
            vertex(x - step, y);
            vertex(c[0], c[1]);
            vertex(b[0], b[1]);
            vertex(x, y - step);
            endShape(CLOSE);
            break;
        case 6:
            fill(fill_color);
            quad(a[0], a[1], c[0], c[1], x, y, x, y - step);
            break;
        case 7:
            fill(fill_color);
            beginShape();
            vertex(a[0], a[1]);
            vertex(d[0], d[1]);
            vertex(x - step, y);
            vertex(x, y);
            vertex(x, y - step);
            endShape(CLOSE);
            break;
        case 8:
            fill(fill_color);
            triangle(a[0], a[1], d[0], d[1], x - step, y - step);
            break;
        case 9:
            fill(fill_color);
            quad(a[0], a[1], c[0], c[1], x - step, y, x - step, y - step);
            break;
        case 10:
            fill(fill_color);
            beginShape();
            vertex(d[0], d[1]);
            vertex(c[0], c[1]);
            vertex(x, y);
            vertex(b[0], b[1]);
            vertex(a[0], a[1]);
            vertex(x - step, y - step);
            endShape(CLOSE);
            break;
        case 11:
            fill(fill_color);
            beginShape();
            vertex(a[0], a[1]);
            vertex(b[0], b[1]);
            vertex(x, y);
            vertex(x - step, y);
            vertex(x - step, y - step);
            endShape(CLOSE);
            break;
        case 12:
            fill(fill_color);
            quad(b[0], b[1], d[0], d[1], x - step, y - step, x, y - step);
            break;
        case 13:
            fill(fill_color);
            beginShape();
            vertex(b[0], b[1]);
            vertex(c[0], c[1]);
            vertex(x - step, y);
            vertex(x - step, y - step);
            vertex(x, y - step);
            endShape(CLOSE);
            break;
        case 14:
            fill(fill_color);
            beginShape();
            vertex(c[0], c[1]);
            vertex(d[0], d[1]);
            vertex(x - step, y - step);
            vertex(x, y - step);
            vertex(x, y);
            endShape(CLOSE);
            break;
        case 15:
            fill(fill_color);
            rect(x - step, y - step, step, step);
            break;
    }
}

function createNDimArray(dimensions) {
    if (dimensions.length > 0) {
        var dim = dimensions[0];
        var rest = dimensions.slice(1);
        var newArray = new Array();
        for (var i = 0; i < dim; i++) {
            newArray[i] = createNDimArray(rest);
        }
        return newArray;
    } else {
        return undefined;
    }
}

function getState(a, b, c, d) {
    var value = a * 8 + b * 4 + c * 2 + d * 1;
    return value;
}

function march(img, rez, pre_frame) {

    var square_colors = createNDimArray([rez + 1, rez + 1]);
    var square_colors_water = createNDimArray([rez + 1, rez + 1]);

    for (var row = 0; row < rez + 1; row++) {
        for (var column = 0; column < rez + 1; column++) {

            var y = Math.round(step * row);
            var x = Math.round(step * column);
            var square_color = 0;
            let index = (x + y * width) * 4;

            let cheat = 0;
            if (y == height || x == width) { cheat = 1; }
            let p = pre_frame.get(x - cheat, y - cheat);

            if (img.pixels[index] >= threshold) {
                square_color = 1;
                square_colors[column][row] = 1;
            }
            else {
                square_color = 0;
                square_colors[column][row] = 0;
            }

            if (p[2] == 255) {
                square_color_water = 1;
                square_colors_water[column][row] = 1;
            }
            else {
                square_color_water = 0;
                square_colors_water[column][row] = 0;
            }

            if (drew_once == false && img.pixels[index] < 80) {
                water.push(new Water(x, y));
            }

            a = [x - half_step, y - step];
            b = [x, y - half_step];
            c = [x - half_step, y];
            d = [x - step, y - half_step];

            var state_blocks = 0;
            var state_water = 0;
            if (column != 0 && row != 0) {
                state_blocks = getState(square_colors[column - 1][row - 1], square_colors[column][row - 1], square_colors[column][row], square_colors[column - 1][row]);
                state_water = getState(square_colors_water[column - 1][row - 1], square_colors_water[column][row - 1], square_colors_water[column][row], square_colors_water[column - 1][row]);
            }

            drawState(state_blocks, 50, a, b, c, d, x, y, step);
            drawState(state_water, color(0, 0, 255), a, b, c, d, x, y, step);

        }

    }
    drew_once = true;
}

function perlinNoise() {
    var img = createImage(width + step, height + step);
    var yOffset = 0.0;
    img.loadPixels();

    for (var x = 0; x < img.width; x++) {
        var xOffset = 0.0;
        for (var y = 0; y < img.height; y++) {
            var noise_value = noise(xOffset, yOffset) * y;
            let index = (x + y * width) * 4;
            img.pixels[index] = noise_value;
            img.pixels[index + 1] = noise_value;
            img.pixels[index + 2] = noise_value;
            img.pixels[index + 3] = 255;

            xOffset += 0.01;
        }
        yOffset += 0.01;
    }
    img.updatePixels();
    image(img, 0, 0);
    return img;
}