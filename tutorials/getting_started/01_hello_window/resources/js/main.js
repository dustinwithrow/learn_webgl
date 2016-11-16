function main(){
    var canvas = document.getElementById("webGLCanvas");
    if(!canvas){
        console.log("Unable to find the canvas element [id=" + webGLCanvas + "].");
    }
    var gl = getGLContext(canvas);
    if(!gl){
        return;
    }
    
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var renderStructure = {
        gl: gl,
    };
    
    var render = function(timestamp){
        drawScene(timestamp, renderStructure);
    };
    
    var unload = function(event){
        cleanUp(renderStructure);
    }
    
    window.addEventListener("unload", cleanUp);
    
    requestAnimationFrame(render);
}

function drawScene(timestamp, renderStructure){
    var gl = renderStructure.gl;
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function cleanUp(renderStrucure){

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