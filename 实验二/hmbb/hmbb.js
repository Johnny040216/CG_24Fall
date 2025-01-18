"use strict";

var canvas;
var gl;

var ms = 180; // 画圆的面数

// 海绵宝宝
var points = []; // 顶点容器
var colors = []; // 颜色容器
var vColor, vPosition;
var cBuffer, vBuffer; // 海绵宝宝的buffer
var numVertices = 36*9 + ms*3*2*3 + 12; // 海绵宝宝顶点个数
var modelViewMatrix = mat4(); // 当前变换矩阵
var modelViewMatrixLoc; // shader变量
var CubeTx = 0, CubeTy = 0, CubeTz = 0; //海绵宝宝平移量
var CubeRotateAngleX = 0; //海绵宝宝绕x轴旋转角度
var CubeRotateAngleY = 0; //海绵宝宝绕y轴旋转角度
var CubeRotateAngleZ = 0; //海绵宝宝绕z轴旋转角度
var scalePercent = 0.5; // 缩放比例
var direct = vec4( 0.0, 0.0, 1.0, 1.0 ); // 当前正面方向

// 粉色海绵宝宝
var points2 = []; // 顶点容器
var colors2 = []; // 颜色容器
var vColor2, vPosition2;
var cBuffer2, vBuffer2; // 粉色海绵宝宝的buffer
var numVertices2 = 36*9 + ms*3*2*3 + 12; // 粉色海绵宝宝顶点个数
var CubeTx2 = 0, CubeTy2 = 0, CubeTz2 = 0; // 粉色海绵宝宝平移量
var CubeRotateAngle2 = 0; // 粉色海绵宝宝旋转角度
var scalePercent2 = 0.5; // 缩放比例
var direct2 = vec4( 0.0, 0.0, 1.0, 1.0 ); // 当前正面方向

var viewMatrixLoc; // 视图矩阵的存储地址
var viewMatrix; // 当前视图矩阵
var viewIndex = 0; // 视图编号

var body = vec3( 0.4, 0.45, 0.2 );
var cloth = vec3( 0.4, 0.05, 0.2 );
var pants = vec3( 0.4, 0.1, 0.2 );
var leg = vec3( 0.06, 0.25, 0.05 );
var shoe = vec3( 0.12, 0.05, 0.05 );

var rotationMatrix;
var rotationMatrixLoc;

var  angle = 0.0;
var  axis = [0, 0, 1];

var 	trackingMouse = false;
var   trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

// 所有的备选颜色
var chooseColors = [
    vec4(1.0, 0.96, 0.30, 1.0), // 黄色
    vec4(1.0, 1.0, 1.0, 1.0), // 白色
    vec4(0.51, 0.33, 0.24, 1.0), // 褐色
    vec4(0.0, 0.0, 0.0, 1.0), // 黑色
    vec4(0.96, 0.64, 0.66, 1.0) // 粉色
];

function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

         lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
    render();
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}
function resetAll() {
    location.reload(); // 刷新页面
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    document.getElementById("resetButton").onclick = resetAll;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.68, 0.85, 0.90, 1.0 ); // 浅蓝色背景色

    setPoints(); // 设置所有顶点位置及颜色
    gl.enable(gl.DEPTH_TEST); // 消除隐藏面

    // 初始化着色器
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // 获取viewMatrix变量的存储地址
    viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
    // 设置视点、视线和上方向
    viewMatrix = lookAt(vec3(0, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0));
    // 将视图矩阵传递给viewMatrix变量
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    // 创建缓冲区，并向缓冲区写入立方体每个面的颜色信息
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    //获取着色器中vColor变量，并向其传递数据
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( vColor );

   
    // 创建缓冲区，并向缓冲区写入立方体的顶点信息
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    // 获取着色器中vPosition变量，并向其传递数据
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    


    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );
    //event listeners for buttons
    document.getElementById("adjustView").onclick = function() {
        if (viewIndex === 0) {
            viewIndex = 1;
            // 设置视点、视线和上方向
            viewMatrix = lookAt(vec3(0.10, 0.15, 0.15), vec3(0, 0, 0), vec3(0, 1, 0));
            // 将视图矩阵传递给viewMatrix变量
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        } else if (viewIndex === 1) {
            viewIndex = 0;
            // 设置视点、视线和上方向
            viewMatrix = lookAt(vec3(0, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0));
            // 将视图矩阵传递给viewMatrix变量
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        }
    };
    // 海绵宝宝
    document.getElementById("cubeForward").onclick = function() {
        CubeTx += 0.1 * direct[0];
        CubeTy += 0.1 * direct[1];
        CubeTz += 0.1 * direct[2];
    };
    document.getElementById("cubeBack").onclick = function() {
        CubeTx -= 0.1 * direct[0];
        CubeTy -= 0.1 * direct[1];
        CubeTz -= 0.1 * direct[2];
    };
    document.getElementById("cubeR1").onclick = function() {
        CubeRotateAngleY -= 5;
    };
    document.getElementById("cubeR2").onclick = function() {
        CubeRotateAngleY += 5;
    };
    document.getElementById("small").onclick = function() {
        scalePercent -= 0.05;
    };
    document.getElementById("big").onclick = function() {
        scalePercent += 0.05;
    };
// 设置键盘事件监听器
window.addEventListener("keydown", onKeyDown);
    
    render();
}


function onKeyDown(event) {
    switch (event.key) {
        case "w":
            CubeRotateAngleX += 5;
            break;
        case "s":
            CubeRotateAngleX -= 5;
            break;
        case "a":
            CubeRotateAngleY += 5;
            break;
        case "d":
            CubeRotateAngleY -= 5;
            break;
        case "q":
            CubeRotateAngleZ -= 5;
            break;
        case "e":
            CubeRotateAngleZ += 5;
            break;
         case "W":
            CubeRotateAngleX += 5;
            break;
        case "S":
            CubeRotateAngleX -= 5;
            break;
        case "A":
            CubeRotateAngleY += 5;
            break;
        case "D":
            CubeRotateAngleY -= 5;
            break;
        case "Q":
            CubeRotateAngleZ -= 5;
            break;
        case "E":
            CubeRotateAngleZ += 5;
            break;
        case "ArrowUp":
            CubeTy += 0.1;
            break;
        case "ArrowDown":
            CubeTy -= 0.1;
            break;
        case "ArrowLeft":
            CubeTx -= 0.1;
            break;
        case "ArrowRight":
            CubeTx += 0.1;
            break;
    }
    
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (trackballMove) {
        axis = normalize(axis);
        rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
        gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    var init = translate(0, 0, 0); // 初始变换矩阵，用于设置模型的初始位置
    var S = scalem(scalePercent, scalePercent, scalePercent);
    var T = translate(CubeTx, CubeTy, CubeTz);
    var Rx = rotateX(CubeRotateAngleX);
    var Ry = rotateY(CubeRotateAngleY);
    var Rz = rotateZ(CubeRotateAngleZ);

    modelViewMatrix = mult(mult(mult(mult(mult(init, T), Rx), Ry), Rz), S);
    var m = mult(mult(mult(T, Rx), Ry), Rz); // 用于处理正面的方向

    // 记录正面的方向
    direct = vec4( 0.0, 0.0, 1.0, 1.0 ); // 初始化初始方向
    direct = multMat4Vec4(m, direct);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // 海绵宝宝颜色
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    // 海绵宝宝顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);



    requestAnimFrame(render);
}

// 计算矩阵作用于向量的结果，mat4 * vec4
function multMat4Vec4(mat4, vector) {
    var newVec = [];
    for (var i = 0; i < 4; i++) {
        newVec.push(mat4[i][0] * vector[0] +
            mat4[i][1] * vector[1] +
            mat4[i][2] * vector[2] +
            mat4[i][3] * vector[3]);
    }
    return newVec;
}

function setPoints() {
    // 画海绵宝宝
    drawMouse(points, colors, 0);

    drawBody(0, 1, 2, 3, 0, points, colors); // 身体的第一个面，黄色
    drawBody(0, 3, 7, 4, 0, points, colors); // 身体的第二个面，黄色
    drawBody(4, 5, 6, 7, 0, points, colors); // 身体的第三个面，黄色
    drawBody(1, 5, 6, 2, 0, points, colors); // 身体的第四个面，黄色
    drawBody(0, 4, 5, 1, 0, points, colors); // 身体的第五个面，黄色
    drawBody(3, 7, 6, 2, 0, points, colors); // 身体的第六个面，黄色

    drawCloth(0, 1, 2, 3, 1, points, colors); // 衣服的第一个面，白色
    drawCloth(0, 3, 7, 4, 1, points, colors); // 衣服的第二个面，白色
    drawCloth(4, 5, 6, 7, 1, points, colors); // 衣服的第三个面，白色
    drawCloth(1, 5, 6, 2, 1, points, colors); // 衣服的第四个面，白色
    drawCloth(0, 4, 5, 1, 1, points, colors); // 衣服的第五个面，白色
    drawCloth(3, 7, 6, 2, 1, points, colors); // 衣服的第六个面，白色

    drawPants(0, 1, 2, 3, 2, points, colors); // 裤子的第一个面，褐色
    drawPants(0, 3, 7, 4, 2, points, colors); // 裤子的第二个面，褐色
    drawPants(4, 5, 6, 7, 2, points, colors); // 裤子的第三个面，褐色
    drawPants(1, 5, 6, 2, 2, points, colors); // 裤子的第四个面，褐色
    drawPants(0, 4, 5, 1, 2, points, colors); // 裤子的第五个面，褐色
    drawPants(3, 7, 6, 2, 2, points, colors); // 裤子的第六个面，褐色

    drawLeftLeg(0, 1, 2, 3, 1, points, colors); // 左腿的第一个面，白色
    drawLeftLeg(0, 3, 7, 4, 1, points, colors); // 左腿的第二个面，白色
    drawLeftLeg(4, 5, 6, 7, 1, points, colors); // 左腿的第三个面，白色
    drawLeftLeg(1, 5, 6, 2, 1, points, colors); // 左腿的第四个面，白色
    drawLeftLeg(0, 4, 5, 1, 1, points, colors); // 左腿的第五个面，白色
    drawLeftLeg(3, 7, 6, 2, 1, points, colors); // 左腿的第六个面，白色

    drawRightLeg(0, 1, 2, 3, 1, points, colors); // 右腿的第一个面，白色
    drawRightLeg(0, 3, 7, 4, 1, points, colors); // 右腿的第二个面，白色
    drawRightLeg(4, 5, 6, 7, 1, points, colors); // 右腿的第三个面，白色
    drawRightLeg(1, 5, 6, 2, 1, points, colors); // 右腿的第四个面，白色
    drawRightLeg(0, 4, 5, 1, 1, points, colors); // 右腿的第五个面，白色
    drawRightLeg(3, 7, 6, 2, 1, points, colors); // 右腿的第六个面，白色

    drawLeftShoe(0, 1, 2, 3, 3, points, colors); // 左腿鞋子的第一个面，黑色
    drawLeftShoe(0, 3, 7, 4, 3, points, colors); // 左腿鞋子的第二个面，黑色
    drawLeftShoe(4, 5, 6, 7, 3, points, colors); // 左腿鞋子的第三个面，黑色
    drawLeftShoe(1, 5, 6, 2, 3, points, colors); // 左腿鞋子的第四个面，黑色
    drawLeftShoe(0, 4, 5, 1, 3, points, colors); // 左腿鞋子的第五个面，黑色
    drawLeftShoe(3, 7, 6, 2, 3, points, colors); // 左腿鞋子的第六个面，黑色

    drawRightShoe(0, 1, 2, 3, 3, points, colors); // 右腿鞋子的第一个面，黑色
    drawRightShoe(0, 3, 7, 4, 3, points, colors); // 右腿鞋子的第二个面，黑色
    drawRightShoe(4, 5, 6, 7, 3, points, colors); // 右腿鞋子的第三个面，黑色
    drawRightShoe(1, 5, 6, 2, 3, points, colors); // 右腿鞋子的第四个面，黑色
    drawRightShoe(0, 4, 5, 1, 3, points, colors); // 右腿鞋子的第五个面，黑色
    drawRightShoe(3, 7, 6, 2, 3, points, colors); // 右腿鞋子的第六个面，黑色

    drawLeftArm(0, 1, 2, 3, 0, points, colors); // 左手臂的第一个面，黄色
    drawLeftArm(0, 3, 7, 4, 0, points, colors); // 左手臂的第二个面，黄色
    drawLeftArm(4, 5, 6, 7, 0, points, colors); // 左手臂的第三个面，黄色
    drawLeftArm(1, 5, 6, 2, 0, points, colors); // 左手臂的第四个面，黄色
    drawLeftArm(0, 4, 5, 1, 0, points, colors); // 左手臂的第五个面，黄色
    drawLeftArm(3, 7, 6, 2, 0, points, colors); // 左手臂的第六个面，黄色

    drawRightArm(0, 1, 2, 3, 0, points, colors); // 右手臂的第一个面，黄色
    drawRightArm(0, 3, 7, 4, 0, points, colors); // 右手臂的第二个面，黄色
    drawRightArm(4, 5, 6, 7, 0, points, colors); // 右手臂的第三个面，黄色
    drawRightArm(1, 5, 6, 2, 0, points, colors); // 右手臂的第四个面，黄色
    drawRightArm(0, 4, 5, 1, 0, points, colors); // 右手臂的第五个面，黄色
    drawRightArm(3, 7, 6, 2, 0, points, colors); // 右手臂的第六个面，黄色

    drawLeftEye(points, colors);
    drawRightEye(points, colors);
    drawTeeth(points, colors);

}

// 绘制身体
function drawBody(a, b, c, d, colorIndex, points, colors) {
    // 身体的八个顶点(x,y,z,a)
    var bodyVertices = [
        vec4(-body[0]/2, body[1]*2/3, body[2]/2, 1.0),
        vec4(body[0]/2, body[1]*2/3, body[2]/2, 1.0),
        vec4(body[0]/2, -body[1]/3, body[2]/2, 1.0),
        vec4(-body[0]/2, -body[1]/3, body[2]/2, 1.0),
        vec4(-body[0]/2, body[1]*2/3, -body[2]/2, 1.0),
        vec4(body[0]/2, body[1]*2/3, -body[2]/2, 1.0),
        vec4(body[0]/2, -body[1]/3, -body[2]/2, 1.0),
        vec4(-body[0]/2, -body[1]/3, -body[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(bodyVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制衣服
function drawCloth(a, b, c, d, colorIndex, points, colors) {
    // 衣服的八个顶点(x,y,z,a)
    var clothVertices = [
        vec4(-cloth[0]/2, -body[1]/3, cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3, cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3 - cloth[1], cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3 - cloth[1], cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3, -cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3, -cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3 - cloth[1], -cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3 - cloth[1], -cloth[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(clothVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制裤子
function drawPants(a, b, c, d, colorIndex, points, colors) {
    // 裤子的八个顶点(x,y,z,a)
    var clothVertices = [
        vec4(-pants[0]/2, -body[1]/3 - cloth[1], pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1], pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1] - pants[1], pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1] - pants[1], pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1], -pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1], -pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1] - pants[1], -pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1] - pants[1], -pants[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(clothVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制左腿
function drawLeftLeg(a, b, c, d, colorIndex, points, colors) {
    // 左腿的八个顶点(x,y,z,a)
    var leftLegVertices = [
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftLegVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制右腿
function drawRightLeg(a, b, c, d, colorIndex, points, colors) {
    // 右腿的八个顶点(x,y,z,a)
    var rightLegVertices = [
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(rightLegVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制左腿鞋子
function drawLeftShoe(a, b, c, d, colorIndex, points, colors) {
    // 左腿鞋子的八个顶点(x,y,z,a)
    var leftShoeVertices = [
        vec4(-pants[0]/4 - shoe[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], shoe[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], shoe[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], shoe[2]/2, 1.0),
        vec4(-pants[0]/4 - shoe[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], shoe[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -shoe[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -shoe[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], -shoe[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], -shoe[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftShoeVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

// 绘制右腿鞋子
function drawRightShoe(a, b, c, d, colorIndex, points, colors) {
    // 右腿鞋子的八个顶点(x,y,z,a)
    var rightShoeVertices = [
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], shoe[2]/2, 1.0),
        vec4(pants[0]/4 + shoe[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], shoe[2]/2, 1.0),
        vec4(pants[0]/4 + shoe[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], shoe[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], shoe[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -shoe[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -shoe[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], -shoe[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1] - shoe[1], -shoe[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(rightShoeVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]); // 黑色
    }
}

// 画左手臂
function drawLeftArm(a, b, c, d, colorIndex, points, colors) {
    // 左手臂的八个顶点(x,y,z,a)
    var leftArmVertices = [
        vec4(-0.2, 0.0, 0.025, 1.0),
        vec4(-0.2, 0.0, -0.025, 1.0),
        vec4(-0.2, -0.05, -0.025, 1.0),
        vec4(-0.2, 0.05, 0.025, 1.0),
        vec4(-0.3, -0.3, 0.025, 1.0),
        vec4(-0.3, -0.3, -0.025, 1.0),
        vec4(-0.25, -0.3, -0.025, 1.0),
        vec4(-0.25, -0.3, 0.025, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftArmVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]); // 黄色
    }
}

// 画右手臂
function drawRightArm(a, b, c, d, colorIndex, points, colors) {
    // 右手臂的八个顶点(x,y,z,a)
    var leftArmVertices = [
        vec4(0.2, 0.0, 0.025, 1.0),
        vec4(0.2, 0.0, -0.025, 1.0),
        vec4(0.2, -0.05, -0.025, 1.0),
        vec4(0.2, 0.05, 0.025, 1.0),
        vec4(0.3, -0.3, 0.025, 1.0),
        vec4(0.3, -0.3, -0.025, 1.0),
        vec4(0.25, -0.3, -0.025, 1.0),
        vec4(0.25, -0.3, 0.025, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; // 顶点索引顺序
    // 存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftArmVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]); // 黄色
    }
}

// 画左眼
function drawLeftEye(points, colors) {
    // 画眼白
    var leftEyeVertices = getCircleVertex(-0.08, 0.15, 0.103, 0.06, ms, 360, 0);
    for (var i = 0; i < leftEyeVertices.length; i++) {
        points.push(leftEyeVertices[i]);
        colors.push(chooseColors[1]); // 白色
    }
    // 画眼球
    leftEyeVertices = getCircleVertex(-0.06, 0.15, 0.104, 0.02, ms, 360, 0);
    for (var i = 0; i < leftEyeVertices.length; i++) {
        points.push(leftEyeVertices[i]);
        colors.push(chooseColors[3]); // 黑色
    }
}

// 画右眼
function drawRightEye(points, colors) {
    var rightEyeVertices = getCircleVertex(0.08, 0.15, 0.103, 0.06, ms, 360, 0);
    for (var i = 0; i < rightEyeVertices.length; i++) {
        points.push(rightEyeVertices[i]);
        colors.push(chooseColors[1]); // 白色
    }
    var rightEyeVertices = getCircleVertex(0.06, 0.15, 0.104, 0.02, ms, 360, 0);
    for (var i = 0; i < rightEyeVertices.length; i++) {
        points.push(rightEyeVertices[i]);
        colors.push(chooseColors[3]); // 黑色
    }
}

// 画嘴巴
function drawMouse(points, colors, colorIndex) {
    var mouseVertices = getCircleVertex(0.0, 0.24, 0.1019, 0.21, ms, 80, 140);
    for (var i = 0; i < mouseVertices.length; i++) {
        points.push(mouseVertices[i]);
        colors.push(chooseColors[3]); // 黑色
    }
    mouseVertices = getCircleVertex(0.0, 0.24, 0.102, 0.205, ms, 80, 140);
    for (var i = 0; i < mouseVertices.length; i++) {
        points.push(mouseVertices[i]);
        colors.push(chooseColors[colorIndex]); // 黄色
    }
}

// 画牙齿
function drawTeeth(points, colors) {
    // 左牙
    points.push(vec4(-0.05, 0.036, 0.102, 1.0));
    points.push(vec4(-0.02, 0.032, 0.102, 1.0));
    points.push(vec4(-0.05, 0.01, 0.102, 1.0));
    points.push(vec4(-0.02, 0.032, 0.102, 1.0));
    points.push(vec4(-0.05, 0.01, 0.102, 1.0));
    points.push(vec4(-0.02, 0.005, 0.102, 1.0));

    // 右牙
    points.push(vec4(0.02, 0.032, 0.102, 1.0));
    points.push(vec4(0.05, 0.036, 0.102, 1.0));
    points.push(vec4(0.02, 0.005, 0.102, 1.0));
    points.push(vec4(0.05, 0.036, 0.102, 1.0));
    points.push(vec4(0.02, 0.005, 0.102, 1.0));
    points.push(vec4(0.05, 0.01, 0.102, 1.0));

    // 设置牙齿颜色
    for (var i = 0; i < 12; i++) {
        colors.push(chooseColors[1]); // 白色
    }
}

// 画圆
// 半径r 面数m 度数c 偏移量offset
function getCircleVertex(x, y, z, r, m, c, offset) {
    var arr = [];
    var addAng = c / m;
    var angle = 0;
    for (var i = 0; i < m; i++) {
        arr.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y + Math.cos(Math.PI / 180 * (angle+offset)) * r, z, 1.0));
        arr.push(vec4(x, y, z, 1.0));
        angle = angle + addAng;
        arr.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y + Math.cos(Math.PI / 180 * (angle+offset)) * r, z, 1.0));
    }
    return arr;
}
