let nodes = [];
let nodeRadius = 5;
let clickedNode = [];
let edges = [];

function setup() {
  var canvas = createCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
  canvas.parent('sketch-holder');
  console.log("sketch-holder width: "+select('#sketch-holder').style('width')+ "  height: "+select('#sketch-holder').style('height'))
  background(color('hsl(180, 37%, 79%)'));
}

function draw() {
  drawNodes();
  drawEdges();
}

function windowResized() {
  resizeCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
  console.log("width:"+windowWidth*2/3+" height:"+min(windowWidth*2/3, windowHeight));
}

function mousePressed() {
  if (mouseX <= width && mouseY <= height){
    clickedNode = getNode(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (dist(clickedNode.posX, clickedNode.posY, mouseX, mouseY) > 2*nodeRadius) {
    line(clickedNode.posX, clickedNode.posY, mouseX, mouseY);
  }
}

function getNode(mouseX, mouseY) {
  for (var node = 0; node < nodes.length; node++) {
    if (dist(nodes[node].posX, nodes[node].posY, mouseX, mouseY) < nodeRadius) {
      console.log("You clicked on the node: " + node);
      return nodes[node];
    }
  }
  console.log("You created a new node: " + node)
  var newNode = createNode(mouseX, mouseY);
  return newNode;
}

function createNode(mouseX, mouseY) {
  nodes.push({
    posX:mouseX,
    posY:mouseY,
    draw: function() {
      fill('rgb(14, 32, 32)');
      circle(this.posX, this.posY, 2*nodeRadius);
    }
  });
  return nodes[nodes.length - 1]
}

function drawNodes() {
  for (var node = 0; node < nodes.length; node++) {
    nodes[node].draw();
  }
}

function drawEdges() {

}
