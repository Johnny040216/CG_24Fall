//
var TIMER_ID = -1;
var RENDER_RATE = 100;
var key_move = 0.1;
var now_point_id = -1;
var stopAnimate = true;
var changeAngle = 0;
var isFirst = true;

function App(ch, lh, dh) {
  this.load = () => {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(100.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    viewportHeight = canvas.height;
    viewportWidth = canvas.width;
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //创建相机并绑定相机鼠标交互。
    camera = new Camera();
    camera.setLocation(0, 2, 10);
    camera.onChange = this.draw;
    interactor = new CameraInteractor(camera, canvas);

    //初始化各个着色器变量。
    aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    aVertexColor = gl.getAttribLocation(program, "aVertexColor");
    aVertexTextureCoords = gl.getAttribLocation(
      program,
      "aVertexTextureCoords"
    );
    uNMatrix = gl.getUniformLocation(program, "uNMatrix");
    uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");
    uPMatrix = gl.getUniformLocation(program, "uPMatrix");
    uColor = gl.getUniformLocation(program, "uColor");
    uLightPosition = gl.getUniformLocation(program, "uLightPosition");
    aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
    uAmbientProduct = gl.getUniformLocation(program, "uAmbientProduct");
    uDiffuseProduct = gl.getUniformLocation(program, "uDiffuseProduct");
    uSpecularProduct = gl.getUniformLocation(program, "uSpecularProduct");
    uShininess = gl.getUniformLocation(program, "uShininess");
    uTexture_0_Ikun = gl.getUniformLocation(program, "uTexture_0_Ikun");
    uUseTexture = gl.getUniformLocation(program, "uUseTexture");
    aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");

    //创建球，并添加到Scene对象中。
    basketball = new Basketball();
    basketball2 = new Basketball2();
    basketball.setLocation(3, 0, -3);
    basketball2.setLocation(3, 0, -3);
    basketball.onChange = this.draw;
    basketball2.onChange = this.draw;
    basketball.build();
    basketball2.build();
    Scene.addObject(basketball);
    Scene.addObject(basketball2);

    //创建ikun，并添加到Scene对象中。
    Ikunhead.build();
    Ikunhead.onChange = this.draw;
    Scene.addObject(Ikunhead);
    Ikunbody.build();
    Ikunbody.onChange = this.draw;
    Scene.addObject(Ikunbody);
    Ikunfeetandmouth.build();
    Ikunfeetandmouth.onChange = this.draw;
    Scene.addObject(Ikunfeetandmouth);

    //构造光源对象，并添加到Scene对象中。
    Light.build();
    Scene.addObject(Light);

    //设置按钮点击事件。
    document.getElementById("RotateLeft").onclick = () => {
      Ikunhead.rotateLeft();
      Ikunhair.rotateLeft();
      Ikunbody.rotateLeft();
      Ikunfeetandmouth.rotateLeft();
    };
    document.getElementById("RotateRight").onclick = () => {
      Ikunhead.rotateRight();
      Ikunhair.rotateRight();
      Ikunbody.rotateRight();
      Ikunfeetandmouth.rotateRight();
    };
    document.getElementById("Forward").onclick = () => {
      Ikunhead.walkForward();
      Ikunhair.walkForward();
      Ikunbody.walkForward();
      Ikunfeetandmouth.walkForward();
    };
    document.getElementById("Backward").onclick = () => {
      Ikunhead.walkBackward();
      Ikunhair.walkBackward();
      Ikunbody.walkBackward();
      Ikunfeetandmouth.walkBackward();
    };
    document.getElementById("Shrink").onclick = () => {
      Ikunhead.shrink();
      Ikunhair.shrink();
      Ikunbody.shrink();
      Ikunfeetandmouth.shrink();
    };
    document.getElementById("Expand").onclick = () => {
      Ikunhead.expand();
      Ikunhair.expand();
      Ikunbody.expand();
      Ikunfeetandmouth.expand();
    };
    document.getElementById("RotateLeft1").onclick = () => {
      basketball.rotateLeft();
      basketball2.rotateLeft();
    };
    document.getElementById("RotateRight1").onclick = () => {
      basketball.rotateRight();
      basketball2.rotateRight();
    };
    document.getElementById("Forward1").onclick = () => {
      basketball.walkForward();
      basketball2.walkForward();
    };
    document.getElementById("Backward1").onclick = () => {
      basketball.walkBackward();
      basketball2.walkBackward();
    };
    document.getElementById("Shrink1").onclick = () => {
      basketball.shrink();
      basketball2.shrink();
    };
    document.getElementById("Expand1").onclick = () => {
      basketball.expand();
      basketball2.expand();
    };
    document.getElementById("walk").onclick = () => {
      if (!isFirst) {
        camera.azimuth = 0;
        camera.elevation = 0;
        camera.setLocation(vec3(0, 2, 10));
        now_point_id = -1;
        isFirst = true;
      }
      stopAnimate = false;
      animate();
    };
    //开始场景漫游（动画效果）
    document.getElementById("stop_move").onclick = () => {
      stopAnimate = true;
    }
    //下面五个分别对应俯视图、前视图、左视图、右视图、后视图
    document.getElementById("down_look").onclick = () => {
      camera.setLocation(vec3(0, 15, 0));
      camera.azimuth = 0;
      camera.elevation = 0;
      camera.changeElevation(90);
      isFirst = false;
      stopAnimate = true;
    };
    document.getElementById("toward_look").onclick = () => {
      camera.azimuth = 0;
      camera.elevation = 0;
      camera.setLocation(vec3(0, 2, 10));
      isFirst = false;
      stopAnimate = true;
    };
    document.getElementById("left_look").onclick = () => {
      camera.setLocation(vec3(-10, 2, -3));
      camera.azimuth = 0;
      camera.elevation = 0;
      camera.changeAzimuth(90);
      isFirst = false;
      stopAnimate = true;
    };
    document.getElementById("right_look").onclick = () => {
      camera.setLocation(vec3(10, 2, -3));
      camera.azimuth = 0;
      camera.elevation = 0;
      camera.changeAzimuth(-90);
      isFirst = false;
      stopAnimate = true;
    };
    document.getElementById("back_look").onclick = () => {
      camera.elevation = 0;
      camera.azimuth = 0;
      camera.changeAzimuth(-180);
      camera.setLocation(vec3(0, 2, -15));
      isFirst = false;
      stopAnimate = true;
    };
    document.getElementById("uplight").onclick = () => {
        Light.lightUp();
        this.draw();
    };
    document.getElementById("lighter").onclick = () => {
      Light.lighter();
      this.draw();
  };
  document.getElementById("lightre").onclick = () => {
    Light.lightre();
    this.draw();
};
    document.getElementById("downlight").onclick = () => {
        Light.lightDown();
        this.draw();
    };
    document.getElementById("leftlight").onclick = () => {
        Light.lightLeft();
        this.draw();
    };
    document.getElementById("rightlight").onclick = () => {
        Light.lightRight();
        this.draw();
    };
    document.getElementById("towardlight").onclick = () => {
      Light.lightForward();
      this.draw();
    };
    document.getElementById("backlight").onclick = () => {
      Light.lightBackward();
      this.draw();
    };
    Ikunbody.updateTransformMatrix();
    Ikunhair.updateTransformMatrix();
    Ikunhead.updateTransformMatrix();
    Ikunfeetandmouth.updateTransformMatrix();
    basketball.updateTransformMatrix();
    basketball2.updateTransformMatrix();
    Light.updateTransformMatrix();
  };

  /**
   *
   * @param {*} object 传递object的材质属性到uniform变量中，用于计算明暗。
   */
  this.updateLight = object => {
    if (object.materialAmbient) {
      var ambientProduct = mult(Light.lightAmbient, object.materialAmbient);
      var diffuseProduct = mult(Light.lightDiffuse, object.materialDiffuse);
      var specularProduct = mult(Light.lightSpecular, object.materialSpecular);

      gl.uniform4fv(uAmbientProduct, ambientProduct);
      gl.uniform4fv(uDiffuseProduct, diffuseProduct);
      gl.uniform4fv(uSpecularProduct, specularProduct);
      gl.uniform1f(uShininess, object.shininess);

      var modelViewMatrix;
      if (camera.transformMatrix) {
        modelViewMatrix = mult(camera.getViewMatrix(), Light.transformMatrix)
      } else {
        modelViewMatrix = camera.getViewMatrix();
      }
      var lightPosition = mult(modelViewMatrix, Light.lightPosition);
      gl.uniform4fv(uLightPosition, vec4(lightPosition, 1.0));
    } else {
      gl.uniform4fv(uAmbientProduct, vec4());
      gl.uniform4fv(uDiffuseProduct, vec4());
      gl.uniform4fv(uSpecularProduct, vec4());
      gl.uniform1f(uShininess, 100);
    }
  };

  //
  this.draw = () => {
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewMatrix = camera.getViewMatrix();
    perspectiveMatrix = perspective(
      50,
      viewportWidth / viewportHeight,
      1,
      1000.0
    );

    gl.uniformMatrix4fv(uPMatrix, false, flatten(perspectiveMatrix));

    //遍历Scene对象中的每个需要绘制的对象。
    for (var i = 0; i < Scene.objects.length; i++) {
      var object = Scene.objects[i];

      //传递该对象的光照属性。
      this.updateLight(object);

      //传递一个布尔值到片元着色器中，这样便于在片元着色器中采取不同的行动。
      //如果useTexture为true，最后的颜色为明暗颜色*光照颜色。
      //如果为false，就直接采用光照颜色。
      if (!object.useTexture) {
        object.useTexture = false;
      }
      gl.uniform1i(uUseTexture, object.useTexture);

      var modelViewMatrix;
      if (object.transformMatrix) {
        modelViewMatrix = mult(viewMatrix, object.transformMatrix);
      } else {
        modelViewMatrix = viewMatrix;
      }
      gl.uniformMatrix4fv(uMVMatrix, false, flatten(modelViewMatrix));
      gl.uniformMatrix3fv(uNMatrix, false, flatten(normalMatrix(modelViewMatrix, true)));

      //绑定纹理坐标的buffer到attribute变量。
      if (object.useTexture) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.tbo);
        gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTextureCoord);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.texture);
        gl.uniform1i(uTexture_0_Ikun, 0);
      }

      //如果不是线框图，就传顶点法向量buffer。
      if (!object.wireframe) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
        gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexNormal);
      }

      //绑定顶点坐标buffer到attribute变量。
      gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aVertexPosition);

      if (object.ibo) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
        if (object.wireframe) {
          //如果是线框图，LINES。
          gl.drawElements(gl.LINES, object.indicesNum, gl.UNSIGNED_SHORT, 0);
        } else {
          //如果不是线框图，TRIANGLES。
          gl.drawElements(
            gl.TRIANGLES,
            object.indicesNum,
            gl.UNSIGNED_SHORT,
            0
          );
        }
      } else {
        //没有ibo，根据vbo，drawArrays
        gl.drawArrays(gl.TRIANGLES, 0, object.vertexNum);
      }

      gl.disableVertexAttribArray(aVertexNormal);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  };

  this.run = () => {
    this.load();
    this.draw();
  };

  //场景漫游（动画效果）
  function animate() {
    //设置每一次往前走0.1
    var step = 0.05;
    //从初始位置往前走5个单位
    if (now_point_id == -1) {
      if (camera.position[2] > 5)
        camera.setLocation(vec3(
          camera.position[0],
          camera.position[1],
          camera.position[2] - step
        ));
      else
        now_point_id = 0;
    }
    //开始绕圈
    else {
      switch (now_point_id % 4) {
        case 0: {
          if (camera.position[0] < 8) {
            camera.setLocation(vec3(
              camera.position[0] + step,
              camera.position[1],
              camera.position[2]
            ));
          }
          else {
            changeCameraAngle();
          }
          break;
        }
        case 1: {
          if (camera.position[2] > -10) {
            camera.setLocation(vec3(
              camera.position[0],
              camera.position[1],
              camera.position[2] - step
            ));
          }
          else {
            changeCameraAngle();
          }
          break;
        }
        case 2: {
          if (camera.position[0] > -8) {
            camera.setLocation(vec3(
              camera.position[0] - step,
              camera.position[1],
              camera.position[2]
            ));
          }
          else {
            changeCameraAngle();
          }
          break;
        }
        case 3: {
          if (camera.position[2] < 5) {
            camera.setLocation(vec3(
              camera.position[0],
              camera.position[1],
              camera.position[2] + step
            ));
          }
          else {
            changeCameraAngle();
          }
          break;
        }
      }
    }
    if (!stopAnimate)
      requestAnimationFrame(animate);
  }


  function changeCameraAngle() {
    var angle_step = 3;
    if (changeAngle < 90) {
      changeAngle += angle_step;
      camera.changeAzimuth(-angle_step);
    } else {
      now_point_id++;
      changeAngle = 0;
    }
  }
}
