let nodes = [];
let nodeRadius = 5;
let pressedNode = [];
let isMakingNewEdge = false;
let isMovingNode = false;
let isDeletingNode = false;
let edges = math.matrix([0]);
let graphDirection = 'undirectedGraph';
let graphWeight = 'simpleGraph';
let inflationValue = 2;
let pruneTresholdValue = 1;
let animationSpeedValue = 1;
let animationRunning = false;

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
      nodes[pressedNode].posX = mouseX/width;
      nodes[pressedNode].posY = mouseY/height;
    }
  }
}

function mouseWheel(event) {
  let edge = getEdge(mouseX, mouseY);
  if (edge != false) { // If cursor is over an edge
    edges.set(edge, edges.get(edges)+event.delta/30);
  }
}

function getEdge(mouseX, mouseY) {
  if (true) { // Check if cursor is over an edge

    return // return edge coordinates 
  } else {
    // otherwise return false
    return false
  }
}

function getNode(mouseX, mouseY) {
  for (var node = 0; node < nodes.length; node++) { // Try to find node where mouse clicked:
    if (dist(nodes[node].posX*width, nodes[node].posY*height, mouseX, mouseY) < 4*nodeRadius) { // Avoid creating nodes too close to each other
      return node;
    }
  }
  // If didn't find node, create one:
  createNode(mouseX, mouseY);
  return nodes.length-1;
}

function createNode(mouseX, mouseY) {
  nodes.push({
    posX:mouseX/width,
    posY:mouseY/height,
    draw: function() {
      fill('rgb(14, 32, 32)');
      circle(this.posX*width, this.posY*height, 2*nodeRadius);
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
    if (dist(nodes[pressedNode].posX*width, nodes[pressedNode].posY*height, mouseX, mouseY) > 2*nodeRadius) {
      line(nodes[pressedNode].posX*width, nodes[pressedNode].posY*height, mouseX, mouseY);
    }
  }
  // Draw the already connected edges:
  if(nodes.length > 1) {
    edges.forEach(
      function (value, index, matrix) {
        if (value != 0) {
          line(nodes[index[0]].posX*width, nodes[index[0]].posY*height, nodes[index[1]].posX*width, nodes[index[1]].posY*height);
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

function setInflationValue(value) {
  inflationValue = value;
}

function setPruneTresholdValue(value) {
  pruneTresholdValue = value;
}

function setAnimationSpeed(value) {
  animationSpeedValue = value;
}

function setGraphDirection(value) {
  graphDirection = value;
}

function setGraphWeight(value) {
  graphWeight = value;
}

function playPauseAnimation() {
  animationRunning = !animationRunning;
  if (animationRunning) {
    $('#playPauseButton').html('<i class="fa fa-pause"></i>');
  } else {
    $('#playPauseButton').html('<i class="fa fa-play"></i>');
  }
}
