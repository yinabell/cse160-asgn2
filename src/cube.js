class Cube{

    constructor(){
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1,1,1,1];
        //this.sCount = g_selectedSegments;
        //this.size = 5;
        this.opacity = 100;

        this.matrix = new Matrix4(); 
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        var opacity = this.opacity/100;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], opacity); 

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); 

        // front of cube 
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]); 
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]); 

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, opacity); 

        // top of cube 
        drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]); 
        drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]); 

        // bottom of cube 
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0]); 
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0]); 

        // left of cube 
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0]); 
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]); 

        // right of cube
        drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0]); 
        drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]); 

        // back of cube
        drawTriangle3D([0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0]); 
        drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]); 


        // Draw
        /*
        var d = this.size/200;
        var angleStep = 360/this.sCount;

        for(var angle = 0; angle < 360; angle += angleStep){
            let centerPt = [xy[0], xy[1]];
            let a1 = angle;
            let a2 = angle + angleStep;
            let vec1 = [Math.cos(a1*Math.PI/180)*d, Math.sin(a1*Math.PI/180)*d];
            let vec2 = [Math.cos(a2*Math.PI/180)*d, Math.sin(a2*Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
        }
        */ 

    }
}