# Hello Triangle
\> Tutorial Reference: [Hello Triangle](http://learnopengl.com/#!Getting-started/Hello-Triangle)

Read through the *Tutorial Reference*, and refer back to this for code snippets and comments.

### Vertex Input
We'll place the triangle vertice data in a convenience method to be retrieved when we need it.

```
function getTriangleData()
{
    return [
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.0,  0.5, 0.0
    ];
}
```

### Vertex Shader
At the time this was written WebGL 2.0 had been released, but isn't part of many standard browsers. The reason
this is significant is due to the GLSL language features introduced in GLSL ES 3.00 which is part of the WebGL 2.0
specification. With GLSL ES 3.00 the language starts to support features(`in` and `out` qualifiers) more similar to 
the standard GLSL language.
 
Here is a quick rundown of key differences between GLSL ES 1.00 and GLSL 3.30:
- Use `attribute` instead of `in` for input variables in vertex shader.
- Use `varying` instead of `out` for outputing a variable from your vertex shader.
- Use `varying` instead of `in` for receiving data in your fragment shader passedin by the vertex shader.
- Data type suffixes aren't supported.
- gl_Position is a predefined output variable in your vertex shader for the vertex position data.
- gl_FragColor is a predefined output variable in your fragment shader for the color of the fragment.

This list isn't comprehensive, but calls out several of initial differences you'll run into as you go through
these tutorials.
 
The first obsticle we'll need to across is loading the shader. To make it easier we are going
to place these in `<script>` tags within the index page.

```
<script id="vertex_shader" type="x-shader/x-vertex">
    attribute vec3 position;

    void main()
    {
        gl_Position = vec4(position.x, position.y, position.z, 1.0);
    }
</script>
```

Now we need to be able to read the shader out of the script.

```
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
```

This method will locate a `<script>` by its `id` and read the text out of it. That text will be used as
the source to be compiled. If the compilation is successful the shader's WebGL id will be return.

Finally, we need to create the vertex shader in the `main()` for use later.

```
function main(){
    ...
    
    var vertexShader = createShader(gl, "vertex_shader", gl.VERTEX_SHADER);
    
    ...
}
```

### Fragment Shader
This is pretty much a repeat of the vertex shader section.

```
<script id="fragment_shader" type="x-shader/x-fragment">
    precision mediump float;
    
    void main() {
      gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0);
    }
</script>
```

Finally, we need to create the fragment shader in the main for use later.

```
function main(){
    ...
    
    var fragmentShader = createShader(gl, "fragment_shader", gl.FRAGMENT_SHADER);
    
    ...
}
```

### Shader Program
There really isn't much of a difference here.

```
function createProgram(gl, vertexShader, fragmentShader){
    var shaderProgram = gl.createProgram();
    
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        console.log("Unable to create shader program:\n" + gl.getProgramInfoLog(shaderProgram));
    }
    
    return shaderProgram;
}
```

Once the program is created we can also free up the shader resources.

```
function main(){
    
    ...
    
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    ...

}
```
### Linking Vertex Attributes
The methods and logic start to deverge between WebGL and OpenGL again at this point.

In the current version of WebGL `VertexArrayObject`s don't exist. So we'll be working
with `VertextBufferObjects` only.

```
function createVertexBuffer(gl, bufferData){
    var vertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
    
    return vertexBuffer;
}
```

The [createBuffer()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createBuffer) is the first 
methods we'll encounter that doesn't follow the same naming pattern as its OpenGL equivalent(glGenBuffers).

Also note that in [bufferData()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData)
there is a slight difference. WebGL needs to understand what the data in the array actually is, so we create a 
32 bit floating point array and pass that into the `bufferData()`.

TODO -PLAY WITH THIS- Alternatively, you could do the following to exactly match the OpenGL call.
```
    gl.bufferData(gl.ARRAY_BUFFER, gl.GLfloat, bufferData, gl.STATIC_DRAW);
```

TODO - Do we need to disable the VertexAttribPointer?

Finally we need to actually call the method, and configure the vertex shader `attribute` that will
be receiving the data from the VBO.

```
function main(){

    ...
    
    var positionBuffer = createVertexBuffer(gl, getTriangleData());
    
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    
    ...

}
```

The [getAttribLocation()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation) gets
the location of the position `attribute` defined in the vertex shader.

Next we need to enable `attribute` we'll be pushing data into by calling
[enableVertexAttribArray()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray).

Now all we have left is to configure the `attribute`. We use the 
[vertexAttribPointer()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer),
which is syntactically different than its OpenGL counter part, but accomplishes the same goal.

### The triangle we've all been waiting for

For the most part this follows the same logic as in the *Reference Tutorial*, but we've encapsulated our logic
into a drawing method to make it easier to maintain.

```
function drawScene(timestamp, renderStructure){
    var gl = renderStructure.gl;
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(renderStructure.shaderProgram);
    
    gl.enableVertexAttribArray(renderStructure.attributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, renderStructure.vertexBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```

The major differences are us binding(enabling) the `attribute` and not the `VAO`. We also don't need to swap buffers as this
is handled for us.

You also might be curious about the renderStructure object. This object is created in the main and passed into the `drawScene()`,
providing all the needed data and objects to perform the actual rendering.

```
var renderStructure = {
    gl: gl,
    shaderProgram: shaderProgram,
    attributeLocation: positionAttributeLocation,
    vertexBuffer: positionBuffer
};
```
If everything goes well you should now have a lovely orange triangle rendered in your canvas.

```
function cleanUp(renderStrucure){
    var gl = renderStrucure.gl;
    gl.deleteProgram(renderStrucure.shaderProgram);
    gl.deleteBuffer(renderStrucure.vertexBuffer);
}
```
The `cleanUp()` method will get called when the page is unloaded. In this method we clean up the shader program and vertex buffer.
This isn't technically necessary because when the page is unloaded this will all be cleaned up for you. So you can just allow the
browser to handle it.

### Element Buffer Objects
To keep the code more focused, you'll want to switch to the `main_ebo.js` javascript file.

We get the model data from the following method.

```
function getEBOData()
{
    var vertices = [
         0.5,  0.5, 0.0,
         0.5, -0.5, 0.0,
        -0.5, -0.5, 0.0,
        -0.5,  0.5, 0.0
    ]
    
    var indices = [
        0, 1, 3,
        1, 2, 3
    ]
    
    return {
        indices: indices,
        vertices: vertices
    }
}
```

We create the `EBO` in the following method, which follows the same pattern we used to create the `VBO` earlier.

```
function createElementBuffer(gl, indices)
{
    var elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    return elementBuffer;
}
```

We need to change the `drawScene()`  to [drawElements()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements) instead for arrays.

```
function drawScene(timestamp, renderStructure){
    
    ...
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderStructure.elementBuffer);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
```

And we pull it all together in the `main()`.

```
function main(){

    ...
    
    var rectangleData = getEBOData();
    var elementBuffer = createElementBuffer(gl, rectangleData.indices);
    
    var positionBuffer = createVertexBuffer(gl, rectangleData.vertices);
    
    ...
    
    var renderStructure = {
        gl: gl,
        shaderProgram: shaderProgram,
        attributeLocation: positionAttributeLocation,
        elementBuffer: elementBuffer,
        vertexBuffer: positionBuffer
    };
    
    ...

}
```

If everything goes well you should now have a lovely orange rectangle rendered in your canvas. 
Also if you'd like you can delete the `EBO` in the `cleanUp()`.

### Polygon Model
WebGL doesn't support any other model besides GL_FILL, so to do wireframe you'll have to draw the
object using LINE_LOOP.

### References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
| glGenBuffers()              | createBuffer()            |
| glBindBuffer()              | bindBuffer()              |
| glBufferData()              | bufferData()              |
| glCreateShader()            | createShader()            |
| glShaderSource()            | shaderSource()            |
| glCompileShader()           | compileShader()           |
| glCreateProgram()           | createProgram()           |
| glAttachShader()            | attachShader()            |
| glLinkProgram()             | linkProgram()             |
| glUseProgram()              | useProgram()              |
| glDeleteShader()            | deleteShader()            |
| glGenVertexArrays()         | -X-                       |
| glBindVertexArray()         | -X-                       |
| glVertexAttribPointer()     | vertexAttribPointer()     |
| glEnableVertexAttribArray() | enableVertexAttribArray() |
| glPolygonMode()             | -X-                       |

[canvas]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
