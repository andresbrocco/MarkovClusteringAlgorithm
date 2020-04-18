let nodes = [];
let nodeRadius = 5;
let pressedNodeId = [];
let releasedNodeId = [];
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
    pressedNodeId = getNodeId(mouseX, mouseY);
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
    releasedNodeId = getNodeId(mouseX, mouseY);
    if (pressedNodeId != releasedNodeId) { // CHANGE THIS WHEN DIRECTED/UNDIRECTED IS IMPLEMENTED!
      edges.set([pressedNodeId, releasedNodeId], 1);
      edges.set([releasedNodeId, pressedNodeId], 1);
    } else if (isDeletingNode) {
      deleteNode(pressedNodeId);
    }
  }
  pressedNodeId = [];
  releasedNodeId = [];
  isMovingNode = false;
  isMakingNewEdge = false;
  isDeletingNode = false;
}

function mouseDragged() {
  if (mouseIsOnCanvas()) {
    if (isMovingNode) {
      nodes[pressedNodeId].posX = mouseX/width;
      nodes[pressedNodeId].posY = mouseY/height;
    }
  }
}

function mouseWheel(event) {
  let weightFactor = 1;
  if(event.delta > 0) { weightFactor = 1.1;
  } else {              weightFactor = 0.9;
  }
  if(nodes.length > 1){
    let edgesUnderCursor = getEdgesUnderCursor(mouseX, mouseY);
    if (edgesUnderCursor != []) { // If cursor is over an edge
      for (var edge = 0; edge < edgesUnderCursor.length; edge++) {
        edges.set(edgesUnderCursor[edge], constrain(edges.get(edgesUnderCursor[edge])*weightFactor, 0, 1));
      }
    }
  }
}

function getEdgesUnderCursor(mouseX, mouseY) {
  let edgesUnderCursor = [];
  edges.forEach(
    function (value, index, matrix) {
      if(value > 0) { // if edge exists
        if(distToEdge(mouseX, mouseY, nodes[index[0]].posX*width, nodes[index[0]].posY*height, nodes[index[1]].posX*width, nodes[index[1]].posY*height) < nodeRadius) {
          edgesUnderCursor.push(index);
        }
      }
    }
  );
  return edgesUnderCursor;
}

function getNodeId(mouseX, mouseY) {
  for (var nodeId = 0; nodeId < nodes.length; nodeId++) { // Try to find node where mouse clicked:
    if (dist(nodes[nodeId].posX*width, nodes[nodeId].posY*height, mouseX, mouseY) < 4*nodeRadius) { // Avoid creating nodes too close to each other
      return nodeId;
    }
  }
  // If didn't find node, create one:
  createNode(mouseX, mouseY);
  return nodes.length-1;
}

function createNode(mouseX, mouseY) {
  nodes.push({
    posX: mouseX/width,
    posY: mouseY/height,
    draw: function() {
      fill(color(0, 0, 0, 255));
      stroke(color(0, 0, 0, 255));
      strokeWeight(1)
      circle(this.posX*width, this.posY*height, 2*nodeRadius);
    }
  });
  // Increase edge matrix size:
  edges = math.resize(edges, [nodes.length, nodes.length], 0);
}

function deleteNode(nodeId) {
  if(nodes.length > 1){
    if(nodeId === 0) {
      edges = edges.subset(math.index(math.range(1, nodes.length), math.range(1, nodes.length)));
    } else if (nodeId === nodes.length-1) {
      edges = edges.subset(math.index(math.range(0, nodes.length-1), math.range(0, nodes.length-1)));
    } else {
      // Remove row:
      edges = math.concat(edges.subset(math.index(math.range(0, nodes.length), math.range(0,         nodeId))),
                          edges.subset(math.index(math.range(0, nodes.length), math.range(nodeId+1, nodes.length))), 1);
      // Remove column:
      edges = math.concat(edges.subset(math.index(math.range(0,         nodeId),      math.range(0, nodes.length-1))),
                          edges.subset(math.index(math.range(nodeId+1, nodes.length), math.range(0, nodes.length-1))), 0);
    }
  } else {
    edges = math.matrix([0])
  }
  // Remove node:
  nodes.splice(nodeId, 1);
}

function drawNodes() {
  for (var nodeId = 0; nodeId < nodes.length; nodeId++) {
    nodes[nodeId].draw();
  }
}

function drawEdges() {
  // Draw edge that is being connected:
  if(isMakingNewEdge){
    if (dist(nodes[pressedNodeId].posX*width, nodes[pressedNodeId].posY*height, mouseX, mouseY) > 2*nodeRadius) {
      stroke(color(0, 0, 0, 255));
      strokeWeight(nodeRadius*0.75)
      line(nodes[pressedNodeId].posX*width, nodes[pressedNodeId].posY*height, mouseX, mouseY);
    }
  }
  // Draw the already connected edges:
  if(nodes.length > 1) {
    edges.forEach(
      function (value, index, matrix) {
        if (value != 0) {
          stroke(color(0, 0, 0, 255*value));
          strokeWeight(nodeRadius*value*0.75)
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

function distToEdge(px, py, e1x, e1y, e2x, e2y) {
  var edgeLengthSquared = sq(e1x-e2x)+ sq(e1y-e2y);
  if (edgeLengthSquared === 0) return dist(px, py, e1x, e1y); // Should never fall here, but anyway...
  var t = ((px - e1x) * (e2x - e1x) + (py - e1y) * (e2y - e1y))/edgeLengthSquared;
  t = constrain(t, 0, 1);
  return dist(px, py, e1x + t*(e2x - e1x), e1y + t*(e2y - e1y));
}
