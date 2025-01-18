"use strict";

var canvas;
var gl;
var numVertices = 36;
var points = [];
var fieldOfViewRadians = degToRad(60);
var cameraYRotationRadians = degToRad(0);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var then = 0;
var isRotating = true; // 添加一个标志变量来控制旋转

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

window.onload = function() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // 位置缓冲区
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // 法线缓冲区
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    var normals = generateNormals();
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // 获取 uniform 位置
    var projectionLocation = gl.getUniformLocation(program, "u_projection");
    var viewLocation = gl.getUniformLocation(program, "u_view");
    var worldLocation = gl.getUniformLocation(program, "u_world");
    var textureLocation = gl.getUniformLocation(program, "u_texture");
    var worldCameraPositionLocation = gl.getUniformLocation(program, "u_worldCameraPosition");

    // 配置环境贴图
    var cubeTexture = configureCubeMap(gl);
    gl.uniform1i(textureLocation, 0);

    // 添加按钮点击事件
    document.getElementById("Stop").onclick = function() {
        isRotating = !isRotating; // 切换旋转状态
    };

    function render(time) {
        time *= 0.001;
        var deltaTime = time - then;
        then = time;
    
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // 计算投影矩阵
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix = perspective(60, aspect, 1, 2000);
        gl.uniformMatrix4fv(projectionLocation, false, flatten(projectionMatrix));
    
        // 设置相机
        var cameraPosition = vec3(0, 0, 2);
        var target = vec3(0, 0, 0); // 保证观察点不变
        var up = vec3(0, 1, 0);      // 让“上”方向保持一致
        var viewMatrix = lookAt(cameraPosition, target, up);
        gl.uniformMatrix4fv(viewLocation, false, flatten(viewMatrix));
    
        // 更新世界矩阵
        if (isRotating) {
            modelYRotationRadians += -0.4 * deltaTime;
            modelXRotationRadians += -0.4 * deltaTime;

        }
    
        var worldMatrix = mult(rotateX(radToDeg(modelXRotationRadians)), 
                               rotateY(radToDeg(modelYRotationRadians)));
        gl.uniformMatrix4fv(worldLocation, false, flatten(worldMatrix));
        gl.uniform3fv(worldCameraPositionLocation, cameraPosition);
        gl.uniform1i(textureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
        requestAnimFrame(render);
    }
    

    requestAnimFrame(render);
}

function configureCubeMap(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'pos-x.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'neg-x.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'pos-y.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'neg-y.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'pos-z.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'neg-z.jpg' }
    ];

    faceInfos.forEach((faceInfo) => {
        const { target, url } = faceInfo;

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1024;
        const height = 1024;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // 初始化每个面的纹理
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        const image = new Image();
        image.src = url;
        image.crossOrigin = "anonymous";
        image.addEventListener('load', function() {
            console.log(`Loaded image: ${url}`);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP); // 确保 mipmap 在纹理加载后生成
        });
        
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return texture;
}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
    }
}

function generateNormals() {
    var normals = [
        // 正面
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),

        // 背面
        vec3(0.0, 0.0, -1.0),
        vec3(0.0, 0.0, -1.0),
        vec3(0.0, 0.0, -1.0),
        vec3(0.0, 0.0, -1.0),
        vec3(0.0, 0.0, -1.0),
        vec3(0.0, 0.0, -1.0),

        // 顶面
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),

        // 底面
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),

        // 右面
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),

        // 左面
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0)
    ];

    return normals;
}