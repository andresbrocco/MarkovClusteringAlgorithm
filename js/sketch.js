let graphNodes = [];
let value = 155;

function setup() {
  var canvas = createCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
  canvas.parent('sketch-holder');
  console.log("sketch-holder width: "+select('#sketch-holder').style('width')+ "  height: "+select('#sketch-holder').style('height'))
}

function draw() {
  background(color('hsl(180, 37%, 79%)'));
}

function windowResized() {
  resizeCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
  console.log("width:"+windowWidth*2/3+" height:"+min(windowWidth*2/3, windowHeight));
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
