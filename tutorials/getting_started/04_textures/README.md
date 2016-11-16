#Textures
\> Tutorial Reference: [Shaders](http://learnopengl.com/#!Getting-started/Textures)

You'll want to read through the opening sections of the tutorial, as there is a ton of useful
information. Ultimately from a coding section you want to refer back to this when you get to the
*Loading and creating textures* section.


###Loading and creating textures

Below is a utility method that will load an image resource, and create a gl `texture` object.

```
function create2DTexture(gl, imageURL, minFilter, magFilter, generateMipmap){
    var image = new Image();
    image.src = imageURL;
    
    var texture = gl.createTexture();
    var loading = true;
    image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if(minFilter){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        }

        if(magFilter){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        }

        if(generateMipmap){
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);
        loading = false;
    }
    
    return {
        id: texture,
        loading: function(){
            return loading;
        }
    };
}
```

In the helper function we use a slightly simpler version of 
[textImage2D()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).
This version takes in an `HTMLImageElement` and uses that to get most of its data. Since we have to
wait for the actually image to be loaded we have returned a object that we can use to determine when
loading is done, before we actually render the texture.

TODO Talk about CORS and onload async.

#### Applying textures
We need to update the triangle data so we render a square.

```
function getTriangleData()
{
    var vertices = [
         //Positions      //Color         //Texture Coords
         0.5,  0.5, 0.0,  1.0, 0.0, 0.0,  1.0, 1.0,
         0.5, -0.5, 0.0,  0.0, 1.0, 0.0,  1.0, 0.0,
        -0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,
        -0.5,  0.5, 0.0,  1.0, 1.0, 0.0,  0.0, 1.0
    ];
    
    var indices = [
        0, 1, 3,
        1, 2, 3
    ]
    
    return {
        vertices: vertices,
        indices: indices
    }
}
```

Udpate the vertex shader to take in texture coordinates.

```
<script id="vertex_shader" type="x-shader/x-vertex">
    attribute vec3 position;
    attribute vec3 color;
    attribute vec2 textureCoord;

    varying vec3 _color;
    varying highp vec2 _texCoord;

    void main()
    {
        gl_Position = vec4(position, 1.0);
        _color = color;
        _texCoord = textureCoord;
    }
</script>
```

And finally update the main code.

```
function main(){

    ...

    var stride = 32; //8 elements x 4 bytes
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);
    
    var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "color");
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    var colorOffset = 12 //3 elements x 4 bytes
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, stride, colorOffset);
    
    var textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "textureCoord");
    gl.enableVertexAttribArray(textureCoordAttributeLocation);
    
    var textureCoordOffset = 24 //6 elements x 4 bytes
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, stride, textureCoordOffset);
    
    ...

}
```

We've changed the stride to account for the 2 extra data elements, and configured the textureCoord `attribute`.
And in the `drawScene()` we bind to the texture we want to use while rendering after it is done loading.

```
function drawScene(timestamp, renderStructure){
    if(renderStructure.texture.loading()){
        return;
    }

    ...
    
    gl.bindTexture(gl.TEXTURE_2D, renderStructure.texture.id);
    
    ...
}
```

You should have a nice quad with our texture applied to it.

For the next step you'll want to update the fragment shade as follows.

```
void main() {
  gl_FragColor = texture2D(ourTexture, _texCoord) * vec4(_color, 1.0);
}
```

###Texture Units

The new fragment shader.

```
<script id="fragment_shader_mixing" type="x-shader/x-fragment">
    precision mediump float;

    varying vec3 _color;
    varying highp vec2 _texCoord;

    uniform sampler2D ourTexture1;
    uniform sampler2D ourTexture2;

    void main() {
        gl_FragColor = mix(texture2D(ourTexture1, _texCoord), texture2D(ourTexture2, _texCoord), 0.2);
    }
</script>

```

Updates to the `drawScene()`.

```
function drawScene(timestamp, renderStructure){
    if(renderStructure.texture.loading() || renderStructure.texture2.loading()){
        return;
    }
    
    ...
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderStructure.texture.id);
    gl.uniform1i(gl.getUniformLocation(renderStructure.shaderProgram, "ourTexture1"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, renderStructure.texture2.id);
    gl.uniform1i(gl.getUniformLocation(renderStructure.shaderProgram, "ourTexture2"), 1);
    
    ...
    
}
```

And finally the fix to fragment shader that flips the `awesomeface.png`.

```
void main() {
    vec2 fixedTexCoord = vec2(_texCoord.x, 1.0 - _texCoord.y);
    gl_FragColor = mix(texture2D(ourTexture1, _texCoord), texture2D(ourTexture2, fixedTexCoord), 0.2);
}
```

###References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
| glGenTextures()      | createTexture()    |
| glBindTexture()      | bindTexture()      |
| glTexImage2D()       | texImage2D()       |
| glTexParameter[fi]() | texParameter[fi]() |
| glGenerateMipmap()   | generateMipmap()   |
| glBindTexture()      | bindTexture()      |
| glActiveTexture()    | activeTexture()    |