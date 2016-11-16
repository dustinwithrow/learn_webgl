#Coordinate Systems
\> Tutorial Reference: [Shaders](http://learnopengl.com/#!Getting-started/Coordinate-Systems)

Just like with *Transformations* go read the tutorial. No seriously go read it. Come back when you get to the section *Going 3D*.

###Going 3D

Time to go 3D.

```
function main(){

    ...
    
    //Transformation matrices
    var angle = glMatrix.toRadian(-55.0);
    var model = mat4.fromRotation(mat4.create(), angle, vec3.fromValues(1.0, 0.0, 0.0));
    var view = mat4.fromTranslation(mat4.create(), vec3.fromValues(0.0, 0.0, -3.0));
    
    var fov = glMatrix.toRadian(45.0);
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projection = mat4.prespective(mat4.create(), fov, aspect, 0.1, 100.0);
    
    var startTime = Date.now();
    
    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        elementBuffer: elementBuffer,
        vertexBuffer: positionBuffer,
        texture: texture,
        texture2: texture2,
        startTime: startTime,
        model: model,
        view: view,
        projection: projection
    };
    
    ...

}
```

```
<script id="vertex_shader" type="x-shader/x-vertex">
    attribute vec3 position;
    attribute vec2 textureCoord;

    varying highp vec2 _texCoord;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main()
    {
        gl_Position = projection * view * model * vec4(position, 1.0);
        _texCoord = textureCoord;
    }
</script>
```

```
function drawScene(timestamp, renderStructure){

    ...
    
    var modelUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "model");
    gl.uniformMatrix4fv(modelUniformLocation, false, renderStructure.model);
    
    var viewUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniformLocation, false, renderStructure.view);
    
    var projectionUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "projection");
    gl.uniformMatrix4fv(projectionUniformLocation, false, renderStructure.projection);
    
    ...
    
}

```

###More 3D

```
function main(){

    ...
    
    var stride = 20; //5 elements x 4 bytes
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    
    var textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "textureCoord");
    gl.enableVertexAttribArray(textureCoordAttributeLocation);
    
    var textureCoordOffset = 12 //3 elements x 4 bytes
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, stride, textureCoordOffset);
    
    ...
    
}
```

We move the `model` matrix to the `drawScene()` and switch `glDrawArrays()`.

```
function drawScene(timestamp, renderStructure){

    ...
    
    var angle = glMatrix.toRadian(getTime(renderStructure.startTime) * 50.0);
    var model = mat4.fromRotation(mat4.create(), angle, vec3.fromValues(0.5, 1.0, 0.0));
    
    var modelUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "model");
    gl.uniformMatrix4fv(modelUniformLocation, false, model);

    ...
    
    gl.bindBuffer(gl.ARRAY_BUFFER, renderStructure.vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    
    ...
    
}
```

And the final piece need to correct the z-buffer.

```
function main(){
    
    ...

    gl.enable(gl.DEPTH_TEST);

    ...

}


function drawScene(timestamp, renderStructure){

    ...
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    ...
    
}

```

###More Cubes

The cube position data.

```
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

function main(){

    ...
    
    var renderStructure = {
        
        ...
        
        cubePositions: getCubePositions(),
        
        ...
    };
    
    ...
}
```

And update the `drawScene()` to render 10 cubes.

```
function drawScene(timestamp, renderStructure){

    ...

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
```

###References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
| glUniformMatrix[234]fv | uniformMatrix[234]fv |