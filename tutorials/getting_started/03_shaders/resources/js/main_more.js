function main(){
    var canvas = document.getElementById("webGLCanvas");
    if(!canvas){
        console.log("Unable to find the canvas element [id=" + webGLCanvas + "].");
    }
    var gl = getGLContext(canvas);
    if(!gl){
        return;
    }
    
    getVersionInformation(gl);
    
    var vertexShader = createShader(gl, "vertex_shader_more", gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
    
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    var positionBuffer = createVertexBuffer(gl, getTriangleData());
    
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    var stride = 24; // gl.FLOAT is 4 bytes and there are 6 in our stride.
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    
    var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    var offset = 12; //gl.Float is 4 bytes and there are 3 data points to be offset
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, stride, 12);
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var startTime = Date.now();
    
    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        vertexBuffer: positionBuffer,
        startTime: startTime
    };

    var unload = function(event){
        cleanUp(renderStructure);
    }
    
    window.addEventListener("unload", cleanUp);
    
    var render = function(timestamp){
        drawScene(timestamp, renderStructure);
        requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
}

function drawScene(timestamp, renderStructure){
    var gl = renderStructure.gl;
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(renderStructure.shaderProgram);
    
    gl.enableVertexAttribArray(renderStructure.attributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, renderStructure.vertexBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function cleanUp(renderStrucure){
    var gl = renderStrucure.gl;
    gl.deleteProgram(renderStrucure.shaderProgram);
    gl.deleteBuffer(renderStrucure.vertexBuffer);
}

function getTriangleData()
{
    return [
        //Positions       //Colors
        -0.5, -0.5, 0.0,  1.0, 0.0, 0.0,
         0.5, -0.5, 0.0,  0.0, 1.0, 0.0,
         0.0,  0.5, 0.0,  0.0, 0.0, 1.0
    ];
}