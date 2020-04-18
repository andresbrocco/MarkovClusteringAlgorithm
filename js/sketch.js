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
      edges.set([pressedNode.id, releasedNode.id], 1);
      edges.set([releasedNode.id, pressedNode.id], 1);
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
      pressedNode.posX = mouseX;
      pressedNode.posY = mouseY;
    }
  }
}

function getNode(mouseX, mouseY) {
  for (var node = 0; node < nodes.length; node++) { // Try to find node where mouse clicked:
    if (dist(nodes[node].posX, nodes[node].posY, mouseX, mouseY) < 4*nodeRadius) { // Deny nodes too close to each other
      return nodes[node];
    }
  }
  // If didn't find node, create one:
  var newNode = createNode(mouseX, mouseY);
  return newNode;
}

function createNode(mouseX, mouseY) {
  nodes.push({
    id:nodes.length,
    posX:mouseX,
    posY:mouseY,
    draw: function() {
      fill('rgb(14, 32, 32)');
      circle(this.posX, this.posY, 2*nodeRadius);
    }
  });
  // Increase edge matrix size:
  edges = math.resize(edges, [nodes.length, nodes.length], 0);
  return nodes[nodes.length - 1]
}

function deleteNode(node) {
  console.log("original edges: "+edges);
  // Remove row:
  console.log("keep ranges: "+math.index(math.range(0, nodes.length), math.range(0, node.id)) + " and " + math.index(math.range(0, nodes.length), math.range(node.id+1, nodes.length)));
  console.log("first range: " +edges.subset(math.index(math.range(0, nodes.length), math.range(0,         node.id))));
  console.log("second range: "+edges.subset(math.index(math.range(0, nodes.length), math.range(node.id+1, nodes.length))));

  edges = math.concat(edges.subset(math.index(math.range(0, nodes.length), math.range(0,         node.id))),
                      edges.subset(math.index(math.range(0, nodes.length), math.range(node.id+1, nodes.length))), 1);
  console.log("edges without row: "+edges);
  // Remove column:
  edges = math.concat(edges.subset(math.index(math.range(0,         node.id),      math.range(0, nodes.length-1))),
                      edges.subset(math.index(math.range(node.id+1, nodes.length), math.range(0, nodes.length-1))), 0);
  console.log("edges without column: "+edges);
  // Remove node:
  nodes.splice(node.id, 1);
}

function drawNodes() {
  for (var node = 0; node < nodes.length; node++) {
    nodes[node].draw();
  }
}

function drawEdges() {
  // Draw edge that is being connected:
  if(isMakingNewEdge){
    if (dist(pressedNode.posX, pressedNode.posY, mouseX, mouseY) > 2*nodeRadius) {
      line(pressedNode.posX, pressedNode.posY, mouseX, mouseY);
    }
  }
  // Draw the already connected edges:
  edges.forEach(
    function (value, index, matrix) {
      if (value != 0) {
        line(nodes[index[0]].posX, nodes[index[0]].posY, nodes[index[1]].posX, nodes[index[1]].posY);
      }
    }
  );
}

function mouseIsOnCanvas() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    return true;
  } else {
    return false;
  }
}
