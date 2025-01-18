////脚和嘴
var Ikunfeetandmouth = {
  name: "Ikunfeetandmouth",
  //明暗材质属性
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
    var image = document.getElementById("orgImage");
    Ikunfeetandmouth.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, Ikunfeetandmouth.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    //初始化三个数组。
    var vertices = [];
    var normals = [];
    var textures = [];
    var shape_data = {
      origin: vec3(0, 0, 0),

      axis_length: vec3(
        Ikunfeetandmouth.size * 2, 
        Ikunfeetandmouth.size * 2,
        Ikunfeetandmouth.size * 2
      ), //2:2:2
      angle_range_vertical: vec2(0, 180),
      angle_range_horizontal: vec2(0, 360),

      ellipse_axis: vec2(0, 0),
      angle_range: vec2(0, 360),

      height: 0,
      top_point: vec3(0, 0, 0),
    };
    var head_vertices = ellipsoid_generator(shape_data, texture_coordinate);
    vertices = vertices.concat(head_vertices.vertices);
    normals = normals.concat(head_vertices.normals);
    textures = textures.concat(head_vertices.textures);


    shape_data.ellipse_axis = vec2(Ikunfeetandmouth.size * 0.5, Ikunfeetandmouth.size * 0.5);
    shape_data.top_point = vec3(
      -Ikunfeetandmouth.size * 0,
      +Ikunfeetandmouth.size * 1,
      0
    );
    var mouth_vertices = taper_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      translate(+Ikunfeetandmouth.size * 0, -Ikunfeetandmouth.size * 0.5, +Ikunfeetandmouth.size * 1.8),
      mouth_vertices.vertices
    );
    vertices = vertices.concat(mouth_vertices.vertices);
    normals = normals.concat(mouth_vertices.normals);
    textures = textures.concat(mouth_vertices.textures);


    shape_data.axis_length = vec3(
      Ikunfeetandmouth.size * 2.3,
      Ikunfeetandmouth.size * 2.7,
      Ikunfeetandmouth.size * 2.3
    );
    var body_vertices = ellipsoid_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      translate(0, -Ikunfeetandmouth.size * 2.5, -Ikunfeetandmouth.size * 3),
      body_vertices.vertices
    );
    vertices = vertices.concat(body_vertices.vertices);
    normals = normals.concat(body_vertices.normals);
    textures = textures.concat(body_vertices.textures);

    shape_data.angle_range = vec2(0, 360);
    shape_data.height = Ikunfeetandmouth.size * 4; //length
    shape_data.ellipse_axis = vec2(Ikunfeetandmouth.size * 0.3, Ikunfeetandmouth.size * 0.3);
    var lefthand_vertices = cylinder_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      mult(
        mult(rotateZ(5), rotateX(0)),
        translate(-Ikunfeetandmouth.size * 0.2, -Ikunfeetandmouth.size * 4.5, -Ikunfeetandmouth.size * 3)
      ),
      lefthand_vertices.vertices
    );
    vertices = vertices.concat(lefthand_vertices.vertices);
    normals = normals.concat(lefthand_vertices.normals);
    textures = textures.concat(lefthand_vertices.textures);

    var righthand_vertices = cylinder_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      mult(
        mult(rotateZ(-5), rotateX(0)),
        translate(+Ikunfeetandmouth.size * 0.2, -Ikunfeetandmouth.size * 4.5, -Ikunfeetandmouth.size * 3)
      ),
      righthand_vertices.vertices
    );
    vertices = vertices.concat(righthand_vertices.vertices);
    normals = normals.concat(righthand_vertices.normals);
    textures = textures.concat(righthand_vertices.textures);
    
    shape_data.height=Ikunfeetandmouth.size * 1.5;
    shape_data.ellipse_axis = vec3(
      Ikunfeetandmouth.size * 0.5,
      Ikunfeetandmouth.size * 0.5,
      Ikunfeetandmouth.size * 0.3
    );
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      mult(
        mult(rotateZ(0), rotateX(0)),
        translate(+Ikunfeetandmouth.size * 0.8, -Ikunfeetandmouth.size * 6.5, -Ikunfeetandmouth.size * 3.2)
      ),
      hair_vertices.vertices
    );
    vertices = vertices.concat(hair_vertices.vertices);
    normals = normals.concat(hair_vertices.normals);
    textures = textures.concat(hair_vertices.textures);

    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(0), rotateX(0)),
         translate(-Ikunfeetandmouth.size * 0.8, -Ikunfeetandmouth.size * 6.5, -Ikunfeetandmouth.size * 3.2)
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //头发参数
     shape_data.height=Ikunfeetandmouth.size * 4;
     shape_data.ellipse_axis = vec3(
       Ikunfeetandmouth.size * 1,
       Ikunfeetandmouth.size * 0.5,
       Ikunfeetandmouth.size * 0.3
     );

    //生成头发1左下的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发1所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult( 
         mult(rotateZ(-30),rotateY(90),rotateX(30)),
         translate(+Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      //第一个参数变大上移  第二个参数变小下移  第三个参数变小后移
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //生成头发2右下的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发2所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(30),rotateY(-90),rotateX(0)),
         translate(-Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //生成头发3左中的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发3所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(-20),rotateY(90),rotateX(0)),
         translate(+Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //生成头发4右中的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发4所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(20),rotateY(-90),rotateX(0)),
         translate(-Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      //第一个参数变小左移  第二个参数变小下移  第三个参数变小后移
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //生成头发5左上的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发5所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(-10),rotateY(90),rotateX(0)),
         translate(+Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      //第一个参数变小左移  第二个参数变小下移  第三个参数变小后移
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);

    //生成头发6右上的坐标和顶点法向量。它是一个椎形。取缺省纹理坐标。
    var hair_vertices = pyramid_generator(shape_data, texture_empty);
    //对头发6所有顶点坐一个相对于身体的变换。先做一个平移，再做一个旋转。和左腿是对称的。
    Ikunfeetandmouth.constructMatrix(
      mult(
         mult(rotateZ(10),rotateY(-90),rotateX(0)),
         translate(-Ikunfeetandmouth.size * 1, +Ikunfeetandmouth.size * 1.8, -Ikunfeetandmouth.size * 0.45)      //第一个参数变小左移  第二个参数变小下移  第三个参数变小后移
       ),
      hair_vertices.vertices
     );
     vertices = vertices.concat(hair_vertices.vertices);
     normals = normals.concat(hair_vertices.normals);
     textures = textures.concat(hair_vertices.textures);




    //保存顶点个数，用于drawArray。
    Ikunfeetandmouth.vertexNum = vertices.length;

    //创建存放顶点坐标的buffer，并传入数据vertices。
    Ikunfeetandmouth.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunfeetandmouth.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //创建存放顶点法向量的buffer，并传入数据normals。
    Ikunfeetandmouth.nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunfeetandmouth.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //创建存放纹理坐标的buffer，并传入数据textures。
    Ikunfeetandmouth.tbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Ikunfeetandmouth.tbo);
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
    var RE = scalem(Ikunfeetandmouth.size, Ikunfeetandmouth.size, Ikunfeetandmouth.size);
    var T = translate(
      Ikunfeetandmouth.position[0],
      Ikunfeetandmouth.position[1],
      Ikunfeetandmouth.position[2]
    );
    var R = rotateY(Ikunfeetandmouth.RotateAngle);
    Ikunfeetandmouth.transformMatrix = mult(T, mult(R, RE));
  },
  rotateRight: function () {
    //整只鲲鲲向右转的函数。
    Ikunfeetandmouth.RotateAngle += Ikunfeetandmouth.ROTATE_STEP;
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  },
  rotateLeft: function () {
    //整只鲲鲲向左转的函数。
    Ikunfeetandmouth.RotateAngle -= Ikunfeetandmouth.ROTATE_STEP;
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  },
  walkForward: function () {
    //整只鲲鲲向后退一步的函数。
    //后退修改的是鲲鲲的位置，位置的变化量分解到x和z轴上（不考虑沿y轴的平移）。
    //这里做了一个正交分解。
    Ikunfeetandmouth.position[0] +=
      Ikunfeetandmouth.FORWARD_STEP * -1 * Math.sin(radians(Ikunfeetandmouth.RotateAngle));
    Ikunfeetandmouth.position[2] +=
      Ikunfeetandmouth.FORWARD_STEP * Math.cos(radians(Ikunfeetandmouth.RotateAngle));
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  },
  walkBackward: function () {
    //整只鲲鲲向前走一步的函数。
    //前进修改的是鲲鲲的位置，位置的变化量分解到x和z轴上（不考虑沿y轴的平移）。
    //这里也做了一个正交分解。
    Ikunfeetandmouth.position[0] +=
      Ikunfeetandmouth.FORWARD_STEP * Math.sin(radians(Ikunfeetandmouth.RotateAngle));
    Ikunfeetandmouth.position[2] +=
      Ikunfeetandmouth.FORWARD_STEP * -1 * Math.cos(radians(Ikunfeetandmouth.RotateAngle));
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  },
  shrink: function () {
    //整只鲲鲲缩小的函数
    Ikunfeetandmouth.size -= Ikunfeetandmouth.RESIZE_STEP;
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  },
  expand: function () {
    //整只鲲鲲变大的函数
    Ikunfeetandmouth.size += Ikunfeetandmouth.RESIZE_STEP;
    Ikunfeetandmouth.updateTransformMatrix();
    if (Ikunfeetandmouth.onChange) {
      Ikunfeetandmouth.onChange();
    }
  }
};
