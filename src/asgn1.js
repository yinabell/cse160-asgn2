
// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_GlobalRotateMatrix; 
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix; 
let u_GlobalRotateMatrix; 

// UI global variables
let g_selectedColor = [1,1,1,1];
let g_selectedSize = 5;
let g_selectedType = 0;
let g_selectedSegments = 12;
let g_Opacity = 100;
let g_globalAngle = 0; 
let g_yellowAngle = 0; 
let g_magentaAngle = 0; 
let g_yellowAnimation = false; 
let g_magentaAnimation = false; 

function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl', {preserveDrawingBuffer: true});

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST); 

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
    /*
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
    */

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix'); 
    if (!u_ModelMatrix){ 
        console.log('Failed to get the storage location of u_ModelMatrix'); 
        return; 
    } 

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix'); 
    if (!u_GlobalRotateMatrix){ 
        console.log('Failed to get the storage location of u_GlobalRotateMatrix'); 
        return; 
    }

    var identityM = new Matrix4(); 
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements); 


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
    document.getElementById('angleSlide').addEventListener('mousemove', function(){
        g_globalAngle = this.value;
        renderAllShapes(); 
        //console.log("is this working now here");
    });

    // yellow slider 
    document.getElementById('yellowSlide').addEventListener('mousemove', function(){
        g_yellowAngle = this.value;
        renderAllShapes(); 
        //console.log("is this working now here");
    });

    // magenta slider
    document.getElementById('magentaSlide').addEventListener('mousemove', function(){
        g_magentaAngle = this.value;
        renderAllShapes(); 
        //console.log("is this working now here");
    });

    // on / off buttons YELLOW
    document.getElementById('animationYellowOffButton').onclick = function() {
        g_yellowAnimation = false; 
        renderAllShapes(); 
        //console.log("is this working now here");
    };
    document.getElementById('animationYellowOnButton').onclick = function() {
        g_yellowAnimation = true; 
        renderAllShapes(); 
        //console.log("is this working now here");
    };

    // on / off buttons MAGENTA
    document.getElementById('animationMagentaOffButton').onclick = function() {
        g_magentaAnimation = false; 
        renderAllShapes(); 
        //console.log("is this working now here");
    };
    document.getElementById('animationMagentaOnButton').onclick = function() {
        g_magentaAnimation = true; 
        renderAllShapes(); 
        //console.log("is this working now here");
    };
    

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
  //gl.clear(gl.COLOR_BUFFER_BIT); 

  //renderAllShapes(); 
  requestAnimationFrame(tick); 

} 

function updateAnimationAngles(){ 
    if (g_yellowAnimation){ 
        g_yellowAngle = (45 * Math.sin(g_seconds)); 
    }
    if (g_magentaAnimation){ 
        g_magentaAngle = (45 * Math.sin(3 * g_seconds))
    }
}

var g_startTime = performance.now()/1000.0; 
var g_seconds = performance.now()/1000.0 - g_startTime; 

function tick() { 

    // save current time
    g_seconds = performance.now()/1000.0 - g_startTime; 
    // print some debug info so we know we are running 
    console.log(g_seconds); 

    // update animation angles
    updateAnimationAngles(); 

    // draw everything 
    renderAllShapes(); 

    // tell browser to update again when it has time
    requestAnimationFrame(tick); 
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

    /*
    var startTime = performance.now(); 
    var duration = performance.now() - startTime; 
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)); 
    */ 

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0.0, 1.0, 0.0); 
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); 

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT); 

    //rendering
    var len = g_shapesList.length;
    for(var i=0; i<len; i++) {
        g_shapesList[i].render();
    }

    // triangle 
    //gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); 
    //drawTriangle3D([-1.0, 0.0, 0.0,  -0.5, -1.0, 0.0,  0.0, 0.0, 0.0]);  

    // red cube 
    /*
    var body = new Cube(); 
    body.color = [1.0, 0.0, 0.0, 1.0]; 
    body.matrix.translate(0, 0, 0); 
    body.matrix.rotate(5, 1.0, 0.0, 0.0); 
    body.matrix.scale(0.5, 0.3, 0.5); 
    body.render(); 
    */
    
    // guardian body 
    // red core 
    var body = new Cube(); 
    body.color = [1.0, 0.0, 0.0, 1.0]; 
    body.matrix.translate(-0.5, -.4, 0.0); // Center of screen
    body.matrix.scale(.5, .5, .5);     // Optional: visible size
    body.render(); 
    
    // right plate
    var rightPlate = new Cube(); 
    rightPlate.color = [0.412, 0.549, 0.510, 1.0]; 
    rightPlate.matrix.translate(0, -.4, 0.0); 
    rightPlate.matrix.scale(.1, .5, .5);     
    rightPlate.render(); 

    // left plate
    var leftPlate = new Cube(); 
    leftPlate.color = [0.412, 0.549, 0.510, 1.0]; 
    leftPlate.matrix.translate(-0.6, -.4, 0.0); 
    leftPlate.matrix.scale(.1, .5, .5);     
    leftPlate.render(); 

    // bottom plate
    var bottomPlate = new Cube(); 
    bottomPlate.color = [0.412, 0.549, 0.510, 1.0]; 
    bottomPlate.matrix.translate(-0.5, -0.5, 0.0);  
    bottomPlate.matrix.scale(0.5, 0.1, 0.5);        
    bottomPlate.render();

    // top plate
    var topPlate = new Cube(); 
    topPlate.color = [0.412, 0.549, 0.510, 1.0]; 
    topPlate.matrix.translate(-0.5, 0.1, 0.0);   
    topPlate.matrix.scale(0.5, 0.1, 0.5);        
    topPlate.render();

    // front plate
    var frontPlate = new Cube();
    frontPlate.color = [0.412, 0.549, 0.510, 1.0];
    frontPlate.matrix.translate(-0.5, -0.4, -0.1);  
    frontPlate.matrix.scale(0.5, 0.5, 0.1);         
    frontPlate.render();

    // back plate
    var backPlate = new Cube();
    backPlate.color = [0.412, 0.549, 0.510, 1.0];
    backPlate.matrix.translate(-0.5, -0.4, 0.5);  
    backPlate.matrix.scale(0.5, 0.5, 0.1);        
    backPlate.render(); 

    

    
    
    /*
    // left arm yellow
    var leftArm = new Cube(); 
    leftArm.color = [1, 1, 0, 1]; 
    leftArm.matrix.setTranslate(0.0, -0.5, 0.0); 
    leftArm.matrix.rotate(-5, 1, 0, 0); 

    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1); 

    if (g_yellowAnimation){ 
        leftArm.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1);
    } else { 
        leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);

    }


    var yellowCoordinatesMat = new Matrix4(leftArm.matrix); 
    leftArm.matrix.scale(0.25, 0.7, 0.5); 
    leftArm.matrix.translate(-0.5, 0, 0); 
    leftArm.render(); 

    // purple cube 
    var box = new Cube(); 
    box.color = [1.0, 0.0, 1.0, 1.0]; 
    box.matrix = yellowCoordinatesMat; 
    box.matrix.translate(0, 0.65, 0); 
    box.matrix.rotate(g_magentaAngle, 0, 0, 1); 
    box.matrix.scale(0.3, 0.3, 0.3); 
    box.matrix.translate(-0.5, 0, -0.001); 
    box.render(); 

    */

}

/*
// set text of HTML element 
function sendTextToHTML(){ 
    var htmlElm = document.getElementById(htmlElm); 
    if (!htmlElm){ 
        console.log("Failed to get " + htmlID + " from HTML"); 
        return; 
    }
    htmlElm.innerHTML = text; 
}
*/ 