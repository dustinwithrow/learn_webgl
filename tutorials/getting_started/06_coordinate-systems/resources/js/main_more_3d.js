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
    
    gl.enable(gl.DEPTH_TEST);
    
    var vertexShader = createShader(gl, "vertex_shader", gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
    
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    var modelData = getTriangleData();
    var positionBuffer = createVertexBuffer(gl, modelData.vertices);
    
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    var stride = 20; //5 elements x 4 bytes
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    
    var textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "textureCoord");
    gl.enableVertexAttribArray(textureCoordAttributeLocation);
    
    var textureCoordOffset = 12 //3 elements x 4 bytes
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, stride, textureCoordOffset);
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var texture = create2DTexture(gl, "resources/images/container.jpg", null, null, true);
    var texture2 = create2DTexture(gl, "resources/images/awesomeface.png", null, null, true);
    
    //Transformation matrices
    var view = mat4.fromTranslation(mat4.create(), vec3.fromValues(0.0, 0.0, -3.0));
    
    var fov = glMatrix.toRadian(45.0);
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = mat4.perspective(mat4.create(), fov, aspect, 0.1, 100.0);
    
    var startTime = Date.now();
    
    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        vertexBuffer: positionBuffer,
        texture: texture,
        texture2: texture2,
        startTime: startTime,
        view: view,
        projection: projection
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
    if(renderStructure.texture.loading() || renderStructure.texture2.loading()){
        return;
    }
    
    var gl = renderStructure.gl;
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(renderStructure.shaderProgram);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderStructure.texture.id);
    gl.uniform1i(gl.getUniformLocation(renderStructure.shaderProgram, "ourTexture1"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, renderStructure.texture2.id);
    gl.uniform1i(gl.getUniformLocation(renderStructure.shaderProgram, "ourTexture2"), 1);
    
    var angle = glMatrix.toRadian(getTime(renderStructure.startTime) * 50.0);
    var model = mat4.fromRotation(mat4.create(), angle, vec3.fromValues(0.5, 1.0, 0.0));
    
    var modelUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "model");
    gl.uniformMatrix4fv(modelUniformLocation, false, model);
    
    var viewUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniformLocation, false, renderStructure.view);
    
    var projectionUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "projection");
    gl.uniformMatrix4fv(projectionUniformLocation, false, renderStructure.projection);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderStructure.elementBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
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
    var vertices = [
         //Positions      //Texture Coords
        -0.5, -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 0.0,

        -0.5, -0.5,  0.5,  0.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,

        -0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5,  1.0, 0.0,

         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,

        -0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,

        -0.5,  0.5, -0.5,  0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0
    ];
    
    return {
        vertices: vertices,
    }
}