// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size; 
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }` 

// global variables
let canvas; 
let gl; 
let a_Position; 
let u_FragColor; 
let u_Size;

// UI global variables
let g_selectedColor = [1,1,1,1];
let g_selectedSize = 5;
let g_selectedType = 0;
let g_selectedSegments = 12;
let g_Opacity = 100;

function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl', {preserveDrawingBuffer: true});

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function addActionsforHtmlUI(){
    // Clear Canvas button
    document.getElementById('erase').onclick = function(){
        g_shapesList = [];
        renderAllShapes();
    };
    // Circle button
    document.getElementById('circle').onclick = function(){
        g_selectedType = 2;
    };
    // Square button
    document.getElementById('square').onclick = function(){
        g_selectedType = 0;
    };
    // Triangle button
    document.getElementById('triangle').onclick = function(){
        g_selectedType = 1;
    };
    // Red color slider
    document.getElementById('redSlide').addEventListener('mouseup', function(){
        g_selectedColor[0] = this.value/100;
    });
    // Green color slider
    document.getElementById('greenSlide').addEventListener('mouseup', function(){
        g_selectedColor[1] = this.value/100;
    });
    // Blue color slider
    document.getElementById('blueSlide').addEventListener('mouseup', function(){
        g_selectedColor[2] = this.value/100;
    });
    // Brush size slider
    document.getElementById('sizeSlide').addEventListener('mouseup', function(){
        g_selectedSize = this.value;
    });
    // Circles
    document.getElementById('sCount').addEventListener('mouseup', function(){
        g_selectedSegments = this.value;
        //console.log("is this working now here");
    });
    document.getElementById('opacitySlide').addEventListener('mouseup', function(){
        g_Opacity = this.value;
        //console.log("is this working now here");
    });
}

function main() {
  
  setupWebGL(); 
  connectVariablesToGLSL();
  addActionsforHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  canvas.onmousemove = function(ev){
    if(ev.buttons == 1){
        click(ev);
    }
    let [x,y] = convertCoordinatesEventToGL(ev);
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []; // The array for all shapes
var g_sizes = []; // The array for all sizes
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point

function click(ev){
    let [x,y] = convertCoordinatesEventToGL(ev);
    let point;

    if(g_selectedType == 0){
        point = new Point();

    }else if(g_selectedType == 1){
        point = new Triangle();
    }else if(g_selectedType == 2){
        point = new Circle();
    }
    point.opacity = g_Opacity;
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return([x,y]);
}

function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    //rendering
    var len = g_shapesList.length;
    for(var i=0; i<len; i++) {
        g_shapesList[i].render();
    }
}
