let nodes = math.matrix();
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
      nodes.set([pressedNodeId, 0], mouseX/width);
      nodes.set([pressedNodeId, 1], mouseY/height);
    }
  }
}

function mouseWheel(event) {
  let weightFactor = 1;
  if(event.delta > 0) { weightFactor = 1.05;
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
  // Increase edge matrix size:
  edges = math.resize(edges, [nodes.size()[0], nodes.size()[0]], 0);
}

function deleteNode(nodeId) {
  console.log("I will delete the nodeId: "+nodeId);
  console.log("current edge matrix: "+ edges);
  let nOfNodes = nodes.size()[0];
  console.log("number of nodes: "+nOfNodes);
  if(nOfNodes > 1){
    if(nodeId === 0) {
      console.log("deleting first node");
      edges = edges.subset(math.index(math.range(1, nOfNodes), math.range(1, nOfNodes)));
      nodes = nodes.subset(math.index(math.range(1, nOfNodes), [0, 1]));
    } else if (nodeId === nOfNodes-1) {
      console.log("deleting last node");
      edges = edges.subset(math.index(math.range(0, nOfNodes-1), math.range(0, nOfNodes-1)));
      nodes = nodes.subset(math.index(math.range(0, nOfNodes-1), [0, 1]));
    } else {
      console.log("deleting middle node");
      // Remove row:
      edges = math.concat(edges.subset(math.index(math.range(0,         nodeId),  math.range(0, nOfNodes))),
                          edges.subset(math.index(math.range(nodeId+1, nOfNodes), math.range(0, nOfNodes))), 0);
      nodes = math.concat(nodes.subset(math.index(math.range(0, nodeId), [0, 1])),
                          nodes.subset(math.index(math.range(nodeId+1, nOfNodes), [0, 1])), 0);
      console.log("removed row: " +edges);
      // Remove column:
      edges = math.concat(edges.subset(math.index(math.range(0, nOfNodes-1), math.range(0,         nodeId))),
                          edges.subset(math.index(math.range(0, nOfNodes-1), math.range(nodeId+1, nOfNodes))), 1);
      console.log("removed column: " +edges);
    }
  } else {
    edges = math.matrix([0]);
    nodes = math.matrix();
  }
  console.log("final edge matrix: "+ edges);
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
