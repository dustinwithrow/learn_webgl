#Shaders
\> Tutorial Reference: [Shaders](http://learnopengl.com/#!Getting-started/Shaders)

If you take a quick look at the source you'll notice the code has been rearranged to make it easier to
follow. Many of the helper methods have been moved to the `gl_utils.js` file.

###GLSL

If you are following along from the previous tutorial the next sections are a repeat...

At the time this was written WebGL 2.0 had been released, but isn't part of many standard browsers. The reason
this is significant is due to the GLSL language features introduced in GLSL ES 3.00 which is part of the WebGL 2.0
specification. With GLSL ES 3.00 the language starts to support features(`in` and `out` qualifiers) more similar to 
the standard GLSL language.
 
Here is a quick rundown of key differences between GLSL ES 1.00 and GLSL 3.30:
- Use `attribute` instead of `in` for input variables in vertex shader.
- Use `varying` instead of `out` for outputing a variable from your vertex shader.
- Use `varying` instead of `in` for receiving data in your fragment shader.
- Data type suffixes aren't supported.
- gl_Position is a predefined output variable in your vertex shader for the vertex position data.
- gl_FragColor is a predefined output variable in your fragment shader for the color of the fragment.

###Ins and outs

On top of the list above `layout (location=0)` isn't part of the GLSL ES specification, so if you want to
reference an attribute you must look it up using the 
[getAttribLocation()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation).

Here are the first set of translated shaders.

**Vertex Shader**
```
<script id="vertex_shader" type="x-shader/x-vertex">
    attribute vec3 position;

    varying vec4 vertexColor;

    void main()
    {
        gl_Position = vec4(position, 1.0);
        vertexColor = vec4(0.5, 0.0, 0.0, 1.0);
    }
</script>
```
**Fragment Shader**

```
<script id="fragment_shader" type="x-shader/x-fragment">
    precision mediump float;

    varying vec4 vertexColor;

    void main() {
      gl_FragColor = vertexColor;
    }
</script>
```

###Uniforms

Uniforms in GLSL ES work exactly like those of standard GLSL.

**Fragment Shader**
```
<script id="fragment_shader_uniforms" type="x-shader/x-fragment">
    precision mediump float;

    uniform vec4 ourColor;

    void main() {
      gl_FragColor = ourColor;
    }
</script>
```

Now that our fragment shader exists we need to get.

```
function main(){

    ...
    
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
    
    ...

}
```

We also add it into our renderStructure along with the time the rendering started. We'll use this time
to create a timing effect in `drawScene()`.

```
function drawScene(timestamp, renderStructure){
 
    ...
    
    var timeValue = getTime(renderStructure.startTime);
    var greenValue = (Math.sin(timeValue) / 2) + 0.5;
    gl.uniform4f(renderStructure.colorUniformLocation, 0.0, greenValue, 0.0, 1.0);
    
    ...
    
}

function getTime(start)
{
    return (Date.now() - start) / 1000;
}
```

The only aspect that is really different than the tutorial is that we don't really have an equivalent
to the `glfwGetTime()`, so we create our own version, `getTime()`.

To actually cause the color transition we need to render more than one frame.

```
function main(){
    
    ...
    
    var render = function(timestamp){
        drawScene(timestamp, renderStructure);
        requestAnimationFrame(render);
    };
    
    ...
    
}
```

You should now see a triangle that gradually changes shades of green.

###More Attributes!

At this point we create `main_more.js` to make it easier to follow along.

We've updated our triangle data.

```
function getTriangleData()
{
    return [
        //Positions       //Colors
        -0.5, -0.5, 0.0,  1.0, 0.0, 0.0,
         0.5, -0.5, 0.0,  0.0, 1.0, 0.0,
         0.0,  0.5, 0.0,  0.0, 0.0, 1.0
    ];
}
```

We create the new vertex shader.
```
<script id="vertex_shader_more" type="x-shader/x-vertex">
    attribute vec3 position;
    attribute vec3 color;

    varying vec3 vertexColor;

    void main()
    {
        gl_Position = vec4(position, 1.0);
        vertexColor = vec4(color, 1.0);
    }
</script>
```

We call the new vectex shader and configure the `attribute`s correctly.
```
function main(){
    ...
    
    var vertexShader = createShader(gl, "vertex_shader_more", gl.VERTEX_SHADER);
    
    ...
    
    var stride = 24; // gl.FLOAT is 4 bytes and there are 6 in our stride.
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    
    var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    var offset = 12; //gl.Float is 4 bytes and there are 3 data points to be offset
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, stride, 12);
 
    ...
}

```

###Our own shader class

TODO...

###References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
| glGetUniformLocation()   | getUniformLocation()   |
| glUniform[1234][fi][v]() | uniform[1234][fi][v]() |