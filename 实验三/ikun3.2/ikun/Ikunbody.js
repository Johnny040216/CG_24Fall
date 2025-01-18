//身体
var Ikunbody = {
  name: "Ikunbody",
  //明暗材质属性//
  materialAmbient: vec4(1.0, 1.0, 1.0, 1.0),
  materialDiffuse: vec4(1.0, 1.0, 1.0, 1.0),
  materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
  shininess: 10.0,//高光度
  texture: null,
  FORWARD_STEP: 0.2, //平移步长
  ROTATE_STEP: 10,
  RotateAngle: 0, //立方体旋转角度
  RESIZE_STEP: 0.1, //放缩幅度
  position: vec3(0, 1.8, 0), //位置状态
  vbo: null,//存放顶点坐标的buffer，由createBuffer得到。
  nbo: null,//存放顶点法向量的buffer，由createBuffer得到。
  tbo: null,//存放纹理坐标的buffer，由createBuffer得到。
  size: 0.5,
  vertexNum: 0,//包含的顶点个数，drawArray的时候要用。
  useTexture: true,//是否有使用纹理映射的一个标志。
  transformMatrix: null,//代表鲲鲲整个对象的变换矩阵。
  build: () => {
    //初始化纹理
    var image = document.getElementById("blackImage");
    Ikunbody.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, Ikunbody.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    //初始化三个数组。
    var vertices = [];
    var normals = [];
    var textures = [];

    //shape_data是一个包含了一些生成顶点所必要的参数的数据结构。
    //具体shape_data各属性的意义，见Geometry.js。
    var shape_data = {
      origin: vec3(0, 0, 0),

      axis_length: vec3(
        Ikunbody.size * 2, //脸宽
        Ikunbody.size * 2,
        Ikunbody.size * 2
      ), //2:2:2
      angle_range_vertical: vec2(0, 180),
      angle_range_horizontal: vec2(0, 360),

      ellipse_axis: vec2(0, 0),
      angle_range: vec2(0, 360),

      height: 0,
      top_point: vec3(0, 0, 0),
    };

    shape_data.ellipse_axis = vec2(Ikunbody.size * 0.5, Ikunbody.size * 0.5);
    shape_data.top_point = vec3(
      -Ikunbody.size * 0,
      +Ikunbody.size * 1,
      0
    );

    shape_data.axis_length = vec3(
      Ikunbody.size * 2.3,
      Ikunbody.size * 2.7,
      Ikunbody.size * 2.3
    );
    //生成身体顶点坐标法向量。它是一个椭球。取缺省纹理坐标。
    var body_vertices = ellipsoid_generator(shape_data, texture_empty);
    //对身体所有顶点作相对于鲲鲲身体的变换。是一个平移变换，把身体平移到头部的后侧。
    Ikunbody.constructMatrix(
      translate(0, -Ikunbody.size * 2.5, -Ikunbody.size * 3),
      body_vertices.vertices
    );
    vertices = vertices.concat(body_vertices.vertices);
    normals = normals.concat(body_vertices.normals);
    textures = textures.concat(body_vertices.textures);

    //保存顶点个数，用于drawArray。
    Ikunbody.vertexNum = vertices.length;

    //创建存放顶点坐标的buffer，并传入数据vertices。
    Ikunbody.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunbody.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //创建存放顶点法向量的buffer，并传入数据normals。
    Ikunbody.nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunbody.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //创建存放纹理坐标的buffer，并传入数据textures。
    Ikunbody.tbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunbody.tbo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textures), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  },
  constructMatrix: function (matrix, vertices) {
    //matrix是一个变换矩阵，vertices是一个顶点坐标的数组。
    //这个函数实现对vertices中每个顶点坐matrix变换。
    //这个函数的主要用途是把在原地生成的基本几何形体变换到身体某部分相对于身体的合适位置。
    for (var i = 0; i < vertices.length; i++) {
      var temp = mult(
        matrix,
        vec4(vertices[i][0], vertices[i][1], vertices[i][2], 1)
      );
      vertices[i] = vec3(temp[0], temp[1], temp[2]);
    }
  },
  updateTransformMatrix: function () {
    //更新整只鲲鲲的变换矩阵。在App.js的App.draw的时候会用到这个矩阵，传递到顶点着色器的uTMatrix中。
    //先绕原点缩放，再绕y轴旋转，再平移，即可到达最终位置。
    var RE = scalem(Ikunbody.size, Ikunbody.size, Ikunbody.size);
    var T = translate(
      Ikunbody.position[0],
      Ikunbody.position[1],
      Ikunbody.position[2]
    );
    var R = rotateY(Ikunbody.RotateAngle);
    Ikunbody.transformMatrix = mult(T, mult(R, RE));
  },
  rotateRight: function () {
    //整只鲲鲲向右转的函数。
    Ikunbody.RotateAngle += Ikunbody.ROTATE_STEP;
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  },
  rotateLeft: function () {
    //整只鲲鲲向左转的函数。
    Ikunbody.RotateAngle -= Ikunbody.ROTATE_STEP;
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  },
  walkForward: function () {
    //整只鲲鲲向后退一步的函数。
    //后退修改的是鲲鲲的位置，位置的变化量分解到x和z轴上（不考虑沿y轴的平移）。
    //这里做了一个正交分解。
    Ikunbody.position[0] +=
      Ikunbody.FORWARD_STEP * -1 * Math.sin(radians(Ikunbody.RotateAngle));
    Ikunbody.position[2] +=
      Ikunbody.FORWARD_STEP * Math.cos(radians(Ikunbody.RotateAngle));
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  },
  walkBackward: function () {
    //整只鲲鲲向前走一步的函数。
    //前进修改的是鲲鲲的位置，位置的变化量分解到x和z轴上（不考虑沿y轴的平移）。
    //这里也做了一个正交分解。
    Ikunbody.position[0] +=
      Ikunbody.FORWARD_STEP * Math.sin(radians(Ikunbody.RotateAngle));
    Ikunbody.position[2] +=
      Ikunbody.FORWARD_STEP * -1 * Math.cos(radians(Ikunbody.RotateAngle));
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  },
  shrink: function () {
    //整只鲲鲲缩小的函数
    Ikunbody.size -= Ikunbody.RESIZE_STEP;
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  },
  expand: function () {
    //整只鲲鲲变大的函数
    Ikunbody.size += Ikunbody.RESIZE_STEP;
    Ikunbody.updateTransformMatrix();
    if (Ikunbody.onChange) {
      Ikunbody.onChange();
    }
  }
};
