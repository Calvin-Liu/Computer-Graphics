var canvas;
var gl;
var length = 0.5;
var time = 0.0;
var timer = new Timer();
var omega = 40;

var UNIFORM_mvpMatrix;
var UNIFORM_lightPosition;
var UNIFORM_shininess;
var ATTRIBUTE_position;
var ATTRIBUTE_normal;

var positionBuffer; 
var normalBuffer;

var myTexture;
var myTexture1;

var viewMatrix;
var projectionMatrix;
var mvpMatrix;

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);

var eye = vec3(0, 1.0, 1.8);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

var frontBack = 0;
var leftRight = 1;
var rotateFalse = true;
var secondCube = false;
var points = [];
var normals = [];
var uv = [];
var uv1 =[];
var program;

document.addEventListener('keydown', function(event)
{
    switch(event.keyCode)
    {
        case 73: //i
            frontBack += .1;
        break; 
        case 79: //o
            frontBack -= .1;
        break;
        case 82: //r
            rotateFalse = !rotateFalse;
        break;
        case 84: //t

        break;
    }
});

function Cube(vertices, points, normals, uv, uv1){
    Quad(vertices, points, normals, uv, uv1, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices, points, normals, uv, uv1, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices, points, normals, uv, uv1, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices, points, normals, uv, uv1, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices, points, normals, uv, uv1, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices, points, normals, uv, uv1, 1, 5, 3, 7, vec3(1, 1, 0 ));
}

function Quad( vertices, points, normals, uv, uv1, v1, v2, v3, v4, normal){
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    uv.push(vec2(0,0));
    uv.push(vec2(2,0));
    uv.push(vec2(2,2));
    uv.push(vec2(0,0));
    uv.push(vec2(2,2));
    uv.push(vec2(0,2));


    uv1.push(vec2(0,0));
    uv1.push(vec2(1,0));
    uv1.push(vec2(1,1));
    uv1.push(vec2(0,0));
    uv1.push(vec2(1,1));
    uv1.push(vec2(0,1));

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    vertices = [
        vec3(  length,   length, length ), //vertex 0
        vec3(  length,  -length, length ), //vertex 1
        vec3( -length,   length, length ), //vertex 2
        vec3( -length,  -length, length ),  //vertex 3 
        vec3(  length,   length, -length ), //vertex 4
        vec3(  length,  -length, -length ), //vertex 5
        vec3( -length,   length, -length ), //vertex 6
        vec3( -length,  -length, -length )  //vertex 7   
    ];

    Cube(vertices, points, normals, uv, uv1);

    myTexture = gl.createTexture();
    myTexture.image = new Image();
    myTexture.image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, myTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    myTexture.image.src = "./Images/chrome.jpg";

    myTexture1 = gl.createTexture();
    myTexture1.image = new Image();
    myTexture1.image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, myTexture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture1.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    myTexture1.image.src = "./Images/chrome.jpg";

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    UNIFORM_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    UNIFORM_pMatrix = gl.getUniformLocation(program, "pMatrix");
    UNIFORM_lightPosition = gl.getUniformLocation(program, "lightPosition");
    UNIFORM_shininess = gl.getUniformLocation(program, "shininess");
    UNIFORM_sampler = gl.getUniformLocation(program, "uSampler");

    projectionMatrix = perspective(90, 1, 0.001, 1000);

    timer.reset();
    gl.enable(gl.DEPTH_TEST);

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mvMatrix = lookAt(eye, at, up);
    time += timer.getElapsedTime() / 1000;

    positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    uvBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uv), gl.STATIC_DRAW );

    ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position );
    ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );
    ATTRIBUTE_uv = gl.getAttribLocation( program, "vUV" );
    gl.enableVertexAttribArray( ATTRIBUTE_uv);

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_position, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_normal, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_uv, 2, gl.FLOAT, false, 0, 0 );

    mvMatrix = mult(mvMatrix, translate( vec3(0, 0, frontBack) ) );
    mvMatrix = mult(mvMatrix, translate( vec3(-.7, 0, 0) ) );
    if(rotateFalse)
    {
        mvMatrix = mult(mvMatrix, rotate(time * omega, [0, 1, 0]));
    }

    gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);

    gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
    gl.uniform1f(UNIFORM_shininess,  shininess);
    gl.uniform1i(UNIFORM_sampler, 0)

    gl.drawArrays( gl.TRIANGLES, 0, 36);
    
    ////////////////////////////Second Cube///////////////////////////

    positionBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    normalBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    uvBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uv1), gl.STATIC_DRAW );

    ATTRIBUTE_position1 = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position1 );
    ATTRIBUTE_normal1 = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal1 );
    ATTRIBUTE_uv1 = gl.getAttribLocation( program, "vUV" );
    gl.enableVertexAttribArray( ATTRIBUTE_uv1);

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer1 );
    gl.vertexAttribPointer( ATTRIBUTE_position1, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer1 );
    gl.vertexAttribPointer( ATTRIBUTE_normal1, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
    gl.vertexAttribPointer( ATTRIBUTE_uv1, 2, gl.FLOAT, false, 0, 0 );

    mvMatrix = lookAt(eye, at, up);
    // for(var k = 0; k < 36; k++)
    // {
    //     uv1[k] = mult( uv1[k], rotate( 5, normals[] ) );
    // }
    mvMatrix = mult(mvMatrix, translate( vec3(0, 0, frontBack) ) );
    if(rotateFalse)
    {
        mvMatrix = mult(mvMatrix, rotate(time * omega, [1, 0, 0]));
    }
    mvMatrix = mult(mvMatrix, translate ( vec3(.7, 0, 0) ) );

    gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTexture1);

    gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
    gl.uniform1f(UNIFORM_shininess,  shininess);
    gl.uniform1i(UNIFORM_sampler, 0)    

    gl.drawArrays( gl.TRIANGLES, 0, 36);

    window.requestAnimFrame( render );
}
