let graphNodes = [];
let value = 155;

function setup() {
  var canvas = createCanvas(windowWidth*2/3, min(windowWidth*2/3, windowHeight));
  canvas.parent('sketch-holder');
}

function draw() {
  background(value);
}

function windowResized() {
  resizeCanvas(windowWidth*2/3, min(windowWidth*2/3, windowHeight));
}

function mousePressed() {
  if (mouseX <= width && mouseY <= height){
    if (value === 0) {
      value = 155;
    } else {
      value = 0;
    }
  }
}
