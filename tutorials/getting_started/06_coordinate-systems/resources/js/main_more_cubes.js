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
        cubePositions: getCubePositions(),
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
    
    var viewUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniformLocation, false, renderStructure.view);
    
    var projectionUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "projection");
    gl.uniformMatrix4fv(projectionUniformLocation, false, renderStructure.projection);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, renderStructure.vertexBuffer);
    
    var modelUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "model");
    
    //Render 10 cubes
    renderStructure.cubePositions.forEach(function(position, index){
        
        model = mat4.fromTranslation(mat4.create(), position);
        
        var angle = glMatrix.toRadian(20.0 * index);
        model = mat4.rotate(mat4.create(), model, angle, vec3.fromValues(1.0, 0.3, 0.5));
        
        gl.uniformMatrix4fv(modelUniformLocation, false, model);
        
        gl.drawArrays(gl.TRIANGLES, 0, 36);    
    });
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

function getCubePositions(){
    return [
      vec3.fromValues( 0.0,  0.0,  0.0), 
      vec3.fromValues( 2.0,  5.0, -15.0), 
      vec3.fromValues(-1.5, -2.2, -2.5),  
      vec3.fromValues(-3.8, -2.0, -12.3),  
      vec3.fromValues( 2.4, -0.4, -3.5),  
      vec3.fromValues(-1.7,  3.0, -7.5),  
      vec3.fromValues( 1.3, -2.0, -2.5),  
      vec3.fromValues( 1.5,  2.0, -2.5), 
      vec3.fromValues( 1.5,  0.2, -1.5), 
      vec3.fromValues(-1.3,  1.0, -1.5)
    ]
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