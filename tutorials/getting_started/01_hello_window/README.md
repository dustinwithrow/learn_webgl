#Hello Window
\> Tutorial Reference: [Hello Window](http://learnopengl.com/#!Getting-started/Hello-Window)

This tutorial will deviate from the original tutorial quite a bit, due to the differences in how you need to step of the Window. Typically you'll
want to read *Tutorial Reference*, and just reference this for the code snippets and comments, but not for this one.

## First Steps
The first step we need to accomplish is creating a WebGL context. Fortunately, this can be accomplished quite easily using an HTML5 [canvas][].

You'll first need to add a [canvas][] element to your HTML page. You can get a the start HTML5 project [here](../../resources/skeleton)
```html
<canvas id="webGLCanvas"></canvas>
```

You'll also want to set the `height` and `width` of the `canvas` object using css.
```css
#webGLCanvas{
    height: 600px;
    width: 800px;
}
```

Next we'll need to do the following tasks in our javascript code in-order to actually start rendering some graphic data.
1. Get the canvas.
2. Get the WebGL context through the [canvas.getContext()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext).
3. Initalize the gl context.

```
function main(){
    var canvas = document.getElementById("webGLCanvas");
    if(!canvas){
        console.log("Unable to find the canvas element [id=" + webGLCanvas + "].");
    }
    
    var gl = getGLContext(canvas);
}
```
The `main()` is called `onload` of the `<body>` of the HTML document. The method will find a `canvas` element with an id of **webGLCanvas**.
If the `canvas` is found we'll attempt to get the GL context, so we can get do some rendering.

```
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
```
To obtain the the GL context from the `canvas` we request it by name, **webgl**. If you are using a relatively modern browser you should have successfully
retrieved the context. If not we attempt to fall back to the pre-standard context by requesting the **experimental-webgl** named context. If that fails
we have to give up.

If getGLContext() successfully find the GL context we need to do some quick initialization work.
```
function main(){

    ...
    if(!gl){
        return;
    }
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
```

First we need to set the GL [viewport](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport). We want to
set the `viewport`'s width and height of that of the `canvas`'s dimensions. It is probably worth noting that this point we don't handle
the canvas resizing. We'll cover that later.

The `resizeCanvasToDisplaySize()` sets the `gl`'s canvas to `clientWidth` and `clientHeight` of the `canvas`. The end result is that our
`gl` context is rendering a 800x600.

```
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
```

###Rendering
Next we want to setup a rendering loop. For this we'll use the [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
method to drive our refresh. This browser will typically call this once every 60 times a minute, but this isn't guaranteed.

```
function main(){

    ...

    var renderStructure = {
        gl: gl,
    };
    
    var render = function(timestamp){
        drawScene(timestamp, renderStructure);
    };
    
    requestAnimationFrame(render);
}
```

We've used [bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) to work around a limitation of the
`requestAnimationFrame()`. Since `requestAnimationFrame()` doesn't allow for any additional arguments to be passed to your callback method, we use `bind()`
to pass along the `gl` context. There are several ways to accomplish what I just did, but this is the solution I liked the best.

Now we have the ability to render on a per frame basis by adding logic to the `step()`.

```
function drawScene(timestamp){
    step(timestamp, this);
}

function step(timestamp, gl){
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT)
}
```

Finally we want to clear the `viewport` with every frame. We set the [color](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearColor)
we want to clear with and then [clear](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear) the viewport. When you
perform a clear there are a few options to clear (COLOR_BUFFER_BIT, DEPTH_BUFFER_BIT, STENCIL_BUFFER_BIT). For the moment we only care about
color so that is the bit clear for now.

If everything went right you should have a lovely blue GL `viewport` rendering in your browser.

###References

#### OpenGL to WebGL Method Translations
| OpengGL Method | WebGL Method   |
|----------------|----------------|
|glViewport()    | viewport()     |
|glClear()       | clear()        |
|glClearColor()  | glClearColor() |

[canvas]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API