let nodes = math.matrix();
let nodeRadius = 5;
let pressedNodeId = [];
let releasedNodeId = [];
let isMakingNewEdge = false;
let isMovingNode = false;
let isDeletingNode = false;
let edges = math.matrix([0]);
let graphDirection = 'undirectedGraph';
let inflationValue = 2;
let pruneTresholdValue = 1;
let animationSpeedValue = 1;
let animationRunning = false;
let nodeToNodeRepulsionFactor = 1;
let nodeToNodeAttractionFactor = 1;
let nodeToCenterAttractionFactor = 1;
let dampingFactor = 0.1;
let nodesVelocity = math.matrix();
let randomForce = math.matrix();

math.DenseMatrix.prototype.broadcast = function () {
  let broadcasted;
  // Check vector shape:
  let mySize = this.size();
  if(mySize.length === 2){
    if (mySize[0] == 1)  { // Row vector
      broadcasted = this;
      for (var col = 0; col < mySize[1]-1; col++) {
        broadcasted = math.concat(broadcasted, this, 0);
      }
    } else if (mySize[1] == 1)  { // Column vector
      broadcasted = this;
      for (var row = 0; row < mySize[0]-1; row++) {
        broadcasted = math.concat(broadcasted, this, 1);
      }
    } else {
      console.log("Error: matrix is 2-dimensional but is not a vector");
    }
  } else {
    console.log("Error: matrix has more than 2 dimensions");
  }
  return broadcasted;
}

math.DenseMatrix.prototype.rowSum = function() {
  let nRows = this.size()[0];
  let nCols = this.size()[1];
  let rowSum = math.zeros(nRows, 1);
  for (var row = 0; row < nRows; row++) {
    for (var col = 0; col < nCols; col++) {
      rowSum.set([row, 0], rowSum.get([row, 0])+this.get([row, col]));
    }
  }
  return rowSum
}

math.DenseMatrix.prototype.colSum = function() {
  let nRows = this.size()[0];
  let nCols = this.size()[1];
  let colSum = math.zeros(1, nCols);
  for (var col = 0; col < nCols; col++) {
    for (var row = 0; row < nRows; row++) {
      colSum.set([0, col], colSum.get([0, col])+this.get([row, col]));
    }
  }
  return colSum
}

math.DenseMatrix.prototype.colAverage = function() {
  return math.dotDivide(this.colSum(), this.size()[0]);
}

function setup() {
  var canvas = createCanvas(parseFloat(select('#sketch-holder').style('width')), parseFloat( select('#sketch-holder').style('height')));
  canvas.parent('sketch-holder');
  frameRate(40);
  // let dumb = math.matrix([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]);
};

let counter = 0;
function draw() {
  if(animationRunning) relaxGraph();
  background(color('hsl(180, 37%, 79%)'));
  drawNodes();
  drawEdges();
  // counter++;
  // if(counter == 100){
  //   console.log(frameRate());
  //   console.log("number of nodes: "+nodes.size()[0]);
  //   counter = 0;
  // }
};

function relaxGraph(){
  if(nodes.size()[0] > 1 && !isMovingNode){ // Need more than 1 node to relax and cant be moving a node
    if(frameCount%10 === 0){ // If frameRate is low, skip calculation and use previous velocities
      // Calculate Forces:
      let farthestNodeDistToCenter = math.max(math.abs(math.subtract(nodes, 0.5)));
      nodeToCenterAttractionFactor += math.pow((farthestNodeDistToCenter-0.4), 3)*20;
      // if(math.min(nodes) < 0.1 || math.max(nodes) > 0.9){ // If a node is outside the canvas
      //   nodeToCenterAttractionFactor = nodeToCenterAttractionFactor*1.02;
      // } else if (math.max(math.abs(math.subtract(nodes, 0.5))) < 0.25){ // If the nodes are all concentrated in the canvas center
      //   nodeToCenterAttractionFactor = nodeToCenterAttractionFactor*0.98;
      // }
      let colAverage = nodes.colAverage();
      let deltaPosX = math.subtract(math.row(math.transpose(nodes), 0).broadcast(), math.column(nodes, 0).broadcast());
      let deltaPosY = math.subtract(math.row(math.transpose(nodes), 1).broadcast(), math.column(nodes, 1).broadcast());
      let deltaPosNorm = math.add(math.sqrt(math.add(math.square(deltaPosX), math.square(deltaPosY))), 0.00001);//Avoid division by zero
      let nodeToNodeRepulsionForceNorm = math.dotMultiply(nodeToNodeRepulsionFactor, math.exp(math.dotMultiply(-3, deltaPosNorm)));
      let nodeToNodeRepulsionForceX = math.dotMultiply(nodeToNodeRepulsionForceNorm, math.dotDivide(deltaPosX, deltaPosNorm)).rowSum();
      let nodeToNodeRepulsionForceY = math.dotMultiply(nodeToNodeRepulsionForceNorm, math.dotDivide(deltaPosY, deltaPosNorm)).rowSum();
      let nodeToNodeRepulsionForce = math.dotMultiply(math.concat(nodeToNodeRepulsionForceX, nodeToNodeRepulsionForceY), -nodeToNodeRepulsionFactor);
      // console.log("nodeToNodeRepulsionForce: "+nodeToNodeRepulsionForce);
      let nodeToNodeAttractionForceX = math.dotMultiply(edges, deltaPosX).rowSum();
      let nodeToNodeAttractionForceY = math.dotMultiply(edges, deltaPosY).rowSum();
      let nodeToNodeAttractionForce = math.dotMultiply(math.concat(nodeToNodeAttractionForceX, nodeToNodeAttractionForceY), nodeToNodeAttractionFactor);
      // console.log("nodeToNodeAttractionForce: "+nodeToNodeAttractionForce);
      let nodeToCanvasCenterAttractionForce = math.dotMultiply(math.subtract(0.5, nodes), nodeToCenterAttractionFactor);
      // Random force to insert some entropy:
      if(frameCount%100 === 0) randomForce = math.random(nodes.size(), -0.2, 0.2); // Put some entropy
      let randomForce_ = math.dotMultiply(randomForce, math.sin(math.pi*(frameCount%100)/99));
      // Calculate accelerations:
      let nodesMasses = 50;
      let nodesAccelerations = math.dotDivide(math.add(nodeToNodeRepulsionForce, nodeToNodeAttractionForce, nodeToCanvasCenterAttractionForce, randomForce_), nodesMasses);
      // Update Velocities
      nodesVelocity = math.dotMultiply(math.add(nodesVelocity, nodesAccelerations), dampingFactor);
    }
    // Update Positions
    nodes = math.add(nodes, nodesVelocity);
  }
}

function windowResized() {
  resizeCanvas(parseFloat(select('#sketch-holder').style('width')),parseFloat( select('#sketch-holder').style('height')));
};

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
      nodes.set([pressedNodeId, 0], mouseX/width);
      nodes.set([pressedNodeId, 1], mouseY/height);
    }
  }
}

function mouseWheel(event) {
  let weightFactor = 1;
  if(event.delta < 0) { weightFactor = 1.05;
  } else {              weightFactor = 0.95;
  }
  if(nodes.size()[0] > 1){ // More than 1 node
    let edgesUnderCursor = getEdgesUnderCursor(mouseX, mouseY);
    if (edgesUnderCursor != []) { // If cursor is over an edge
      for (var edge = 0; edge < edgesUnderCursor.length; edge++) {
        let newEdgeWeight = constrain(edges.get(edgesUnderCursor[edge])*weightFactor, 0.1, 1);
        if (newEdgeWeight == 0.1) newEdgeWeight = 0;
        edges.set(edgesUnderCursor[edge], newEdgeWeight);
      }
    }
  }
}

function getEdgesUnderCursor(mouseX, mouseY) {
  let edgesUnderCursor = [];
  edges.forEach(
    function (value, edgeNodesIds, matrix) {
      if(value > 0) { // if edge exists
        if(distToEdge(mouseX, mouseY, nodes.get([edgeNodesIds[0], 0])*width,
                                      nodes.get([edgeNodesIds[0], 1])*height,
                                      nodes.get([edgeNodesIds[1], 0])*width,
                                      nodes.get([edgeNodesIds[1], 1])*height) < nodeRadius) {
          edgesUnderCursor.push(edgeNodesIds);
        }
      }
    }
  );
  return edgesUnderCursor;
}

function getNodeId(mouseX, mouseY) {
  for (var nodeId = 0; nodeId < nodes.size()[0]; nodeId++) { // Try to find node where mouse clicked:
    if (dist(nodes.get([nodeId, 0])*width,
             nodes.get([nodeId, 1])*height,
             mouseX, mouseY) < 4*nodeRadius) { // Avoid creating nodes too close to each other
      return nodeId;
    }
  }
  // If didn't find node, create one:
  createNode(mouseX, mouseY);
  return nodes.size()[0]-1;
}

function createNode(mouseX, mouseY) {
  nodes.subset(math.index(nodes.size()[0], [0, 1]), [mouseX/width, mouseY/height]);
  nodesVelocity.subset(math.index(nodesVelocity.size()[0], [0, 1]), [0, 0]);
  randomForce = math.resize(randomForce, [nodes.size()[0], 2], 0);
  edges = math.resize(edges, [nodes.size()[0], nodes.size()[0]], 0);
}

function deleteNode(nodeId) {
  let nOfNodes = nodes.size()[0];
  if(nOfNodes > 1){
    if(nodeId === 0) {
      edges = edges.subset(math.index(math.range(1, nOfNodes), math.range(1, nOfNodes)));
      nodes = nodes.subset(math.index(math.range(1, nOfNodes), [0, 1]));
      nodesVelocity = nodesVelocity.subset(math.index(math.range(1, nOfNodes), [0, 1]));
      randomForce = randomForce.subset(math.index(math.range(1, nOfNodes), [0, 1]));
    } else if (nodeId === nOfNodes-1) {
      edges = edges.subset(math.index(math.range(0, nOfNodes-1), math.range(0, nOfNodes-1)));
      nodes = nodes.subset(math.index(math.range(0, nOfNodes-1), [0, 1]));
      nodesVelocity = nodesVelocity.subset(math.index(math.range(0, nOfNodes-1), [0, 1]));
      randomForce = randomForce.subset(math.index(math.range(0, nOfNodes-1), [0, 1]));
    } else {
      // Remove row:
      edges = math.concat(edges.subset(math.index(math.range(0,         nodeId),  math.range(0, nOfNodes))),
                          edges.subset(math.index(math.range(nodeId+1, nOfNodes), math.range(0, nOfNodes))), 0);
      nodes = math.concat(nodes.subset(math.index(math.range(0, nodeId), [0, 1])),
                          nodes.subset(math.index(math.range(nodeId+1, nOfNodes), [0, 1])), 0);
      nodesVelocity = math.concat(nodesVelocity.subset(math.index(math.range(0, nodeId), [0, 1])),
                                  nodesVelocity.subset(math.index(math.range(nodeId+1, nOfNodes), [0, 1])), 0);
      randomForce = math.concat(randomForce.subset(math.index(math.range(0, nodeId), [0, 1])),
                                randomForce.subset(math.index(math.range(nodeId+1, nOfNodes), [0, 1])), 0);
      // Remove column:
      edges = math.concat(edges.subset(math.index(math.range(0, nOfNodes-1), math.range(0,         nodeId))),
                          edges.subset(math.index(math.range(0, nOfNodes-1), math.range(nodeId+1, nOfNodes))), 1);
    }
  } else {
    edges = math.matrix([0]);
    nodes = math.matrix();
    nodesVelocity = math.matrix();
    randomForce = math.matrix();
  }
}

function drawNodes() {
  for (var nodeId = 0; nodeId < nodes.size()[0]; nodeId++) {
    fill(color(0, 0, 0, 255));
    stroke(color(0, 0, 0, 255));
    strokeWeight(1)
    circle(nodes.get([nodeId, 0])*width, nodes.get([nodeId, 1])*height, 2*nodeRadius);
  }
}

function drawEdges() {
  // Draw edge that is being connected:
  if(isMakingNewEdge){
    if (dist(nodes.get([pressedNodeId, 0])*width, nodes.get([pressedNodeId, 1])*height, mouseX, mouseY) > 2*nodeRadius) {
      stroke(color(0, 0, 0, 255));
      strokeWeight(nodeRadius*0.75)
      line(nodes.get([pressedNodeId, 0])*width, nodes.get([pressedNodeId, 1])*height, mouseX, mouseY);
    }
  }
  // Draw the already connected edges:
  if(nodes.size()[0] > 1) {
    edges.forEach(
      function (edgeWeight, edgeNodesIds, matrix) {
        if (edgeWeight != 0) {
          stroke(color(0, 0, 0, 255*edgeWeight));
          strokeWeight(nodeRadius*edgeWeight*0.75)
          line(nodes.get([edgeNodesIds[0], 0])*width,
               nodes.get([edgeNodesIds[0], 1])*height,
               nodes.get([edgeNodesIds[1], 0])*width,
               nodes.get([edgeNodesIds[1], 1])*height);
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
