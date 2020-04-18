let nodes = [];
let nodeRadius = 5;
let pressedNode = [];
let isMakingNewEdge = false;
let isMovingNode = false;
let isDeletingNode = false;
let edges = math.matrix([0]);

function setup() {
  var canvas = createCanvas(parseFloat(select('#sketch-holder').style('width')), parseFloat( select('#sketch-holder').style('height')));
  canvas.parent('sketch-holder');
}

function draw() {
  background(color('hsl(180, 37%, 79%)'));
  drawNodes();
  drawEdges();
}

function windowResized() {
  resizeCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
}

function mousePressed() {
  if (mouseIsOnCanvas()){
    pressedNode = getNode(mouseX, mouseY);
    if (keyIsDown(77)) { // 77: keyCode for "m"
      isMovingNode = true;
    } else if (keyIsDown(68)) { // 68: keycode for "d"
      isDeletingNode = true;
    } else { // No key pressed
      isMakingNewEdge = true;
    }
  }
}

function mouseReleased() {
  if (mouseIsOnCanvas()) {
    releasedNode = getNode(mouseX, mouseY);
    if (pressedNode != releasedNode) { // CHANGE THIS WHEN DIRECTED/UNDIRECTED IS IMPLEMENTED!
      edges.set([pressedNode, releasedNode], 1);
      edges.set([releasedNode, pressedNode], 1);
    } else if (isDeletingNode) {
      deleteNode(pressedNode);
    }
  }
  pressedNode = [];
  releasedNode = [];
  isMovingNode = false;
  isMakingNewEdge = false;
  isDeletingNode = false;
}

function mouseDragged() {
  if (mouseIsOnCanvas()) {
    if (isMovingNode) {
      nodes[pressedNode].posX = mouseX;
      nodes[pressedNode].posY = mouseY;
    }
  }
}

function getNode(mouseX, mouseY) {
  for (var node = 0; node < nodes.length; node++) { // Try to find node where mouse clicked:
    if (dist(nodes[node].posX, nodes[node].posY, mouseX, mouseY) < 4*nodeRadius) { // Avoid creating nodes too close to each other
      return node;
    }
  }
  // If didn't find node, create one:
  createNode(mouseX, mouseY);
  return nodes.length-1;
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
  // Increase edge matrix size:
  edges = math.resize(edges, [nodes.length, nodes.length], 0);
}

function deleteNode(node) {
  if(nodes.length > 1){
    if(node === 0) {
      edges = edges.subset(math.index(math.range(1, nodes.length), math.range(1, nodes.length)));
    } else if (node === nodes.length-1) {
      edges = edges.subset(math.index(math.range(0, nodes.length-1), math.range(0, nodes.length-1)));
    } else {
      // Remove row:
      edges = math.concat(edges.subset(math.index(math.range(0, nodes.length), math.range(0,         node))),
                          edges.subset(math.index(math.range(0, nodes.length), math.range(node+1, nodes.length))), 1);
      // Remove column:
      edges = math.concat(edges.subset(math.index(math.range(0,         node),      math.range(0, nodes.length-1))),
                          edges.subset(math.index(math.range(node+1, nodes.length), math.range(0, nodes.length-1))), 0);
    }
  } else {
    edges = math.matrix([0])
  }
  // Remove node:
  nodes.splice(node, 1);
}

function drawNodes() {
  for (var node = 0; node < nodes.length; node++) {
    nodes[node].draw();
  }
}

function drawEdges() {
  // Draw edge that is being connected:
  if(isMakingNewEdge){
    if (dist(nodes[pressedNode].posX, nodes[pressedNode].posY, mouseX, mouseY) > 2*nodeRadius) {
      line(nodes[pressedNode].posX, nodes[pressedNode].posY, mouseX, mouseY);
    }
  }
  // Draw the already connected edges:
  if(nodes.length > 1) {
    edges.forEach(
      function (value, index, matrix) {
        if (value != 0) {
          line(nodes[index[0]].posX, nodes[index[0]].posY, nodes[index[1]].posX, nodes[index[1]].posY);
        }
      }
    );
  }
}

function mouseIsOnCanvas() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    return true;
  } else {
    return false;
  }
}
