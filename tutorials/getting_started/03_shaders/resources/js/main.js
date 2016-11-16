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
//    var fragmentShader = createShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
    var fragmentShader = createShader(gl, "fragment_shader_uniforms", gl.FRAGMENT_SHADER);
    
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    var positionBuffer = createVertexBuffer(gl, getTriangleData());
    
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var ourColorUniformLocation = gl.getUniformLocation(shaderProgram, "ourColor");
    
    var startTime = Date.now();
    
    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        vertexBuffer: positionBuffer,
        colorUniformLocation: ourColorUniformLocation,
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
    
    var timeValue = getTime(renderStructure.startTime);
    var greenValue = (Math.sin(timeValue) / 2) + 0.5;
    gl.uniform4f(renderStructure.colorUniformLocation, 0.0, greenValue, 0.0, 1.0);
    
    gl.enableVertexAttribArray(renderStructure.attributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, renderStructure.vertexBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function getTime(start)
{
    return (Date.now() - start) / 1000;
}

function cleanUp(renderStrucure){
    var gl = renderStrucure.gl;
    gl.deleteProgram(renderStrucure.shaderProgram);
    gl.deleteBuffer(renderStrucure.vertexBuffer);
}

function getTriangleData()
{
    return [
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.0,  0.5, 0.0
    ];
}