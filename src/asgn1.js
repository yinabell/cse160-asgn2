
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


// FOR THE GUARDIAN : 
let g_mouseX = 0; 
let g_mouseY = 0; 
let g_lookAtMouse = true; 

let g_tailAnimation = false; 
let g_tailAngle = 0; 
let g_tailSlider = 0; 

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

    // camera angle slider
    document.getElementById('angleSlide').addEventListener('mousemove', function(){
        g_globalAngle = this.value;

        /*
        if (!g_tailAnimation){ 
            g_tailAngle = g_globalAngle; 
        }
        */ 

        renderAllShapes(); 
        //console.log("is this working now here");
    });

    // tail slider 
    document.getElementById('tailSlide').addEventListener('mousemove', function(){
        g_tailSlider = this.value;
        
        // Only update the tail angle if animation is OFF
        if (!g_tailAnimation) {
            g_tailAngle = g_tailSlider;
            renderAllShapes();
        }
    });


    // cursor movement for eyeball tracking
    document.getElementById('eyeTrackingToggle').onclick = function(){ 
        g_lookAtMouse = !g_lookAtMouse; 
        if (g_lookAtMouse){ 
            this.textContent = "Eye Tracking: ON"; 
        } else{ 
            this.textContent = "Eye Tracking: OFF"; 
        }
        renderAllShapes(); 
    }; 

    // tail animation 
    document.getElementById('animationTailOffButton').onclick = function() {
        g_tailAnimation = false;

        g_tailAngle = g_tailSlider; 
        renderAllShapes();
    };
    document.getElementById('animationTailOnButton').onclick = function() {
        g_tailAnimation = true;
        renderAllShapes();
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

    g_mouseX = x; 
    g_mouseY = y; 

  }

  // let cursor track outside 
  document.onmousemove = function(ev){ 
    
    // convert screen coords to relative position 
    let rect = canvas.getBoundingClientRect(); 
    let canvasCenterX = rect.left + canvas.width/2; 
    let canvasCenterY = rect.top + canvas.height/2; 

  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT); 

  //renderAllShapes(); 
  requestAnimationFrame(tick); 

} 

function updateAnimationAngles(){ 

    if (g_tailAnimation){
        g_tailAngle = (30 * Math.sin(2 * g_seconds)); 
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
    
    // guardian body 
    // red core 
    var body = new Cube(); 
    body.color = [1.0, 0.0, 0.0, 1.0]; 
    body.matrix.translate(-0.5, -.4, 0.0); // Center of screen
    body.matrix.scale(.5, .5, .5);     // Optional: visible size
    body.render(); 
    
    // right plate
    var rightPlate = new Cube(); 
    rightPlate.color = [0.486, 0.647, 0.604, 1.0]; 
    rightPlate.matrix.translate(0, -.4, 0.0); 
    rightPlate.matrix.scale(.1, .5, .5);     
    rightPlate.render(); 

    // left plate
    var leftPlate = new Cube(); 
    leftPlate.color = [0.365, 0.490, 0.451, 1.0]; 
    leftPlate.matrix.translate(-0.6, -.4, 0.0); 
    leftPlate.matrix.scale(.1, .5, .5);     
    leftPlate.render(); 

    // bottom plate
    var bottomPlate = new Cube(); 
    bottomPlate.color = [0.306, 0.416, 0.388, 1.0]
    bottomPlate.matrix.translate(-0.5, -0.5, 0.0);  
    bottomPlate.matrix.scale(0.5, 0.1, 0.5);        
    bottomPlate.render();

    // top plate
    var topPlate = new Cube(); 
    topPlate.color = [0.565, 0.741, 0.698, 1.0]; 
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


    // HERE 

    // face / eye
    // White eyeball (base)
    var eyeball = new Cube();
    eyeball.color = [0.827, 0.824, 0.788, 1.0]; // white

    eyeball.matrix.translate(-0.4, -0.28, -0.11); // Front plate is at -0.1, so -0.13 floats it
    eyeball.matrix.scale(0.3, 0.18, 0.01); 
    eyeball.render();

    // Iris
    var iris = new Cube();
    iris.color = [0.188, 0.251, 0.231, 1.0]; // Teal
    iris.matrix.translate(-0.45, -0.1, -0.11); // Slightly in front of eyeball
    iris.matrix.scale(0.4, 0.03, 0.01); 
    iris.render();

    // pupil with eye tracking 
    var pupil = new Cube(); 
    pupil.color = [0.545, 0.063, 0.059, 1.0]; // red

    // base position
    let pupilX = -0.3; 
    let pupilY = -0.2; 
    const pupilZ = -0.12; 
    
    // adjust pupil pos based on mouse 
    if (g_lookAtMouse){ 
        let offsetX = g_mouseX * 0.05; // scale down movement
        let offsetY = g_mouseY * 0.03; 

        // apply offsets with constraints to keep pupil in eyeball 
        pupilX = Math.max(-0.35, Math.min(-0.25, -0.3 + offsetX)); 
        pupilY = Math.max(-0.23, Math.min(-0.17, -0.2 + offsetY)); 
    }

    pupil.matrix.translate(pupilX, pupilY, pupilZ);
    pupil.matrix.scale(0.1, 0.1, 0.01); 
    pupil.render();  
    

    // Guardian spikes (orange)
    // Top spike DONE
    var topSpike = new Cube();
    topSpike.color = [1.0, 0.647, 0.0, 1.0]; 
    topSpike.matrix.translate(-0.3, 0.1, 0.0);
    topSpike.matrix.rotate(-45, 1.0, 0.0, 0.0); 
    topSpike.matrix.scale(0.1, 0.3, 0.1);
    topSpike.render();

    // Right spike 2 bottom DONE
    var rightSpike2 = new Cube();
    rightSpike2.color = [0.839, 0.373, 0.157, 1.0]; 
    rightSpike2.matrix.translate(-0.1, -0.4, .2);
    rightSpike2.matrix.rotate(45, 0, 0, -1.0); 
    rightSpike2.matrix.scale(0.3, 0.1, 0.1);
    rightSpike2.render();

    // Right spike 1 top DONE
    var rightSpike3 = new Cube();
    rightSpike3.color = [1.0, 0.647, 0.0, 1.0]; 
    rightSpike3.matrix.translate(0.04, 0.05, 0.2);
    rightSpike3.matrix.rotate(45, 0.0, 0.0, 1.0);
    rightSpike3.matrix.scale(0.4, 0.1, 0.1);
    rightSpike3.render();

    // Right spike 1 right DONE
    var rightSpike4 = new Cube();
    rightSpike4.color = [1.0, 0.549, 0.0, 1.0]; 
    rightSpike4.matrix.translate(0.1, -0.2, 0.5);
    rightSpike4.matrix.rotate(45, 0, -1, 0); 
    rightSpike4.matrix.scale(0.3, 0.1, 0.1);
    rightSpike4.render(); 

    // below is correct DONE
    var rightSpike1 = new Cube();
    rightSpike1.color = [1.0, 0.498, 0.196, 1.0]; 
    rightSpike1.matrix.rotate(45, 0, 1, 0); 
    rightSpike1.matrix.translate(-0.1, -0.2, 0.0);
    rightSpike1.matrix.scale(0.3, 0.1, 0.1);
    rightSpike1.render();

    // Left spike 4 (right) DONE
    var leftSpike1 = new Cube();
    leftSpike1.color = [0.61, 0.30, 0.11, 1.0]; 
    leftSpike1.matrix.translate(-0.6, -0.2, -0.1);  
    leftSpike1.matrix.rotate(-45, 0, 1, 0);
    leftSpike1.matrix.scale(0.5, 0.1, 0.1);         
    leftSpike1.render(); 

    // Left spike 4 (right) - darker DONE
    var leftSpike4 = new Cube();
    leftSpike4.color = [0.61, 0.30, 0.11, 1.0]; // Darker orange
    leftSpike4.matrix.translate(-0.75, -0.2, 0.7);
    leftSpike4.matrix.rotate(45, 0, 1, 0); 
    leftSpike4.matrix.scale(0.3, 0.1, 0.1);
    leftSpike4.render(); 
    
    // Left spike 2 (bottom) - darker red-orange DONE 
    var leftSpike2 = new Cube();
    leftSpike2.color = [0.48, 0.24, 0.11, 1.0];
    leftSpike2.matrix.translate(-0.6, -0.6, 0.2);
    leftSpike2.matrix.rotate(45, 0, 0, 1);
    leftSpike2.matrix.scale(0.25, 0.1, 0.1);
    leftSpike2.render(); 

    // Left spike 3 (top) - darker DONE
    var leftSpike3 = new Cube();
    leftSpike3.color = [0.78, 0.41, 0.2, 1.0]; // Darker orange
    leftSpike3.matrix.translate(-0.75, 0.25, 0.2);
    leftSpike3.matrix.rotate(-45, 0, 0, 1); 
    leftSpike3.matrix.scale(0.3, 0.1, 0.1);
    leftSpike3.render();
 

    /*
    // Guardian tail
    // Tail base (first segment) DONE 
    var tailBase = new Cube();
    tailBase.color = [0.486, 0.647, 0.604, 1.0]; // Match body plates
    //tailBase.color = [1, 0, 0, 1] 
    tailBase.matrix.translate(-0.4, -0.3, 0.6); // Position right behind the back plate 

    tailBase.matrix.rotate(g_tailAngle, 0, 1, 0); 
    var tailCoordinatesMat = new Matrix4(tailBase.matrix); 

    tailBase.matrix.scale(0.3, 0.25, 0.25);     // Larger first segment 
    tailBase.render(); 

    // Tail middle (second segment) DONE
    var tailMiddle = new Cube();
    tailMiddle.color = [0.412, 0.549, 0.510, 1.0]; // Slightly darker 

    tailMiddle.matrix = tailCoordinatesMat; 

    tailMiddle.matrix.translate(-0.375, -0.275, 0.85); // Connect to first segment
    tailMiddle.matrix.scale(0.25, 0.2, 0.25);     // Larger middle segment
    tailMiddle.render();

    // Tail tip (third segment)
    var tailTip = new Cube();
    tailTip.color = [0.365, 0.490, 0.451, 1.0]; // Even darker 

    tailTip.matrix = new Matrix4(tailCoordinatesMat); 

    tailTip.matrix.translate(-0.35, -0.25, 1.1); // Connect to second segment
    tailTip.matrix.scale(0.2, 0.15, 0.2);       // Larger tip segment
    tailTip.render();

    // Tail spike (orange)
    var tailSpike = new Cube();
    tailSpike.color = [1.0, 0.5, 0.0, 1.0]; // Orange 

    tailSpike.matrix = new Matrix4(tailCoordinatesMat); 
    
    tailSpike.matrix.translate(-0.35, -0.25, 1.3); // Connect to third segment
    tailSpike.matrix.scale(0.1, 0.1, 0.2);      // Larger spike
    tailSpike.render(); 
    */

    // Tail base (first segment)
    var tailBase = new Cube();
    tailBase.color = [0.486, 0.647, 0.604, 1.0]; // Match body plates
    
    // Position the entire tail at the correct starting point
    tailBase.matrix.translate(-0.4, -0.3, 0.6); // Position right behind the back plate 
    
    // Apply the animation rotation to the entire tail
    tailBase.matrix.rotate(g_tailAngle, 0, 1, 0); 
    
    // Scale the first segment
    tailBase.matrix.scale(0.3, 0.25, 0.25);     
    tailBase.render(); 

    // Tail middle (second segment)
    var tailMiddle = new Cube();
    tailMiddle.color = [0.412, 0.549, 0.510, 1.0]; // Slightly darker 
    
    // Start with the same position and rotation as tailBase
    tailMiddle.matrix.translate(-0.4, -0.3, 0.6);
    tailMiddle.matrix.rotate(g_tailAngle, 0, 1, 0);
    
    // Then move it to connect with the first segment (in the rotated coordinate system)
    tailMiddle.matrix.translate(0, 0, 0.25); // Move along the z-axis in the rotated space
    
    // Scale the middle segment
    tailMiddle.matrix.scale(0.25, 0.2, 0.25);
    tailMiddle.render();

    // Tail tip (third segment)
    var tailTip = new Cube();
    tailTip.color = [0.365, 0.490, 0.451, 1.0]; // Even darker 
    
    // Start with the same position and rotation as tailBase
    tailTip.matrix.translate(-0.4, -0.3, 0.6);
    tailTip.matrix.rotate(g_tailAngle, 0, 1, 0);
    
    // Then move it to connect with the second segment (in the rotated coordinate system)
    tailTip.matrix.translate(0, 0, 0.5); // Move further along the z-axis
    
    // Scale the tip segment
    tailTip.matrix.scale(0.2, 0.15, 0.2);
    tailTip.render();

    // Tail spike (orange)
    var tailSpike = new Cube();
    tailSpike.color = [1.0, 0.5, 0.0, 1.0]; // Orange 
    
    // Start with the same position and rotation as tailBase
    tailSpike.matrix.translate(-0.4, -0.3, 0.6);
    tailSpike.matrix.rotate(g_tailAngle, 0, 1, 0);
    
    // Then move it to connect with the tip segment (in the rotated coordinate system)
    tailSpike.matrix.translate(0, 0, 0.7); // Move even further along the z-axis
    
    // Scale the spike
    tailSpike.matrix.scale(0.1, 0.1, 0.2);
    tailSpike.render();

}
