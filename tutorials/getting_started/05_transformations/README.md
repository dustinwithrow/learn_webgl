#Transformations
\> Tutorial Reference: [Shaders](http://learnopengl.com/#!Getting-started/Transformations)

Go read the tutorial. No seriously go read it. Come back when you get to the section *In Practice*.

###In practice

Hopefully, this isn't shocking, but we won't be using the **GLM** library for doing matrix base math. Instead, we'll
use [glMatrix](http://glmatrix.net). At the time this was written glMatrix was at version 2.3.0.

The glMatrix library will feel similar to the **GLM** API, but it is still very different. 

I'm including the code snippet for the first code box in this section just in show more example of the API.

```
var vec = vec4.fromValues(1.0, 0.0, 0.0, 1.0);
var trans = mat4.fromTranslation(mat4.create(), vec3.fromValues(1.0, 1.0, 0.0))
vec4.transformMat4(vec, vec, trans);
console.log(vec);
```

Now for the actual code that will be going into the demo.

```
function drawScene(timestamp, renderStructure){

    ...
    
    var angle = glMatrix.toRadian(90.0);
    //var transform = mat4.create();
    //transform = mat4.rotate(transform, transform, angle, vec3.fromValues(0.0, 0.0, 1.0));
    var transform = mat4.fromRotation(mat4.create(), angle, vec3.fromValues(0.0, 0.0, 1.0));
    transform = mat4.scale(transform, transform, vec3.fromValues(0.5, 0.5, 0.5));
    
    var transformUniformLocation = gl.getUniformLocation(renderStructure.shaderProgram, "transform");
    gl.uniformMatrix4fv(transformUniformLocation, false, transform);
    
    ...
    
}
```

In the code above we use `fromRotation` over `rotation` because of performance differences. For this example there really isn't any need
to go this direction.

And the updates to the shader.

```
<script id="vertex_shader" type="x-shader/x-vertex">
    attribute vec3 position;
    attribute vec3 color;
    attribute vec2 textureCoord;

    varying vec3 _color;
    varying highp vec2 _texCoord;

    uniform mat4 transform;

    void main()
    {
        gl_Position = transform * vec4(position, 1.0);
        _color = color;
        _texCoord = textureCoord;
    }
</script>
```

And now for the rotation-over-time code.

```
function drawScene(timestamp, renderStructure){

    ...
    
    var angle = glMatrix.toRadian(getTime(renderStructure.startTime) * 50.0);
    var transform = mat4.fromTranslation(mat4.create(), vec3.fromValues(0.5, -0.5, 0.0));
    transform = mat4.rotate(mat4.create(), transform, angle, vec3.fromValues(0.0, 0.0, 1.0));
    
    ...
    
}
```

###References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
| glUniformMatrix[234]fv | uniformMatrix[234]fv |