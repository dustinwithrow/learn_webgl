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
    
    var vertexShader = createShader(gl, "vertex_shader", gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
    
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    var positionBuffer = createVertexBuffer(gl, getTriangleData());
    
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        vertexBuffer: positionBuffer
    };

    var unload = function(event){
        cleanUp(renderStructure);
    }
    
    window.addEventListener("unload", cleanUp);
    
    var render = function(timestamp){
        drawScene(timestamp, renderStructure);
    };
    
    requestAnimationFrame(render);
}

function resizeCanvasToDisplaySize(canvas) {
    var width  = canvas.clientWidth;
    var height = canvas.clientHeight;
    
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    
    return false;
}

function drawScene(timestamp, renderStructure){
    console.log('tick');
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

function getVersionInformation(gl){
    console.log("WebGL Version: " + gl.getParameter(gl.VERSION));
    console.log("Shading Language Version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
}

function getGLContext(canvas){
    if(!canvas){
        return null;
    }
    
    var gl = canvas.getContext("webgl");
    
    if(!gl){
        console.log("Unable to get standard WebGL context. Falling back to experimental context.");
        gl = canvas.getContext("experimental-webgl");
    }
    
    if(!gl){
        console.log("Unable to get a WebGL context.");
    }
    
    return gl;
}

function getTriangleData()
{
    return [
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.0,  0.5, 0.0
    ];
}

function createVertexBuffer(gl, bufferData){
    var vertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
    
    return vertexBuffer;
}

function createProgram(gl, vertexShader, fragmentShader){
    var shaderProgram = gl.createProgram();
    
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        console.log("Unable to create shader program:\n" + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram();
    }
    
    return shaderProgram;
}

function createShader(gl, shaderId, shaderType){
    var shaderScript = document.getElementById(shaderId);
    if(!shaderScript){
        return null;
    }
    
    var shaderSource = shaderScript.text;
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.log("Unable to compile shader[" + shaderId + "].\n" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    
    return shader;
}