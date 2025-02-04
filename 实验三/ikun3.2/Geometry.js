function ellipsoid_generator(shape_data, texture_generator) {
  var a = shape_data["axis_length"][0];
  var b = shape_data["axis_length"][1];
  var c = shape_data["axis_length"][2];
  var abias = shape_data["origin"][0];
  var bbias = shape_data["origin"][1];
  var cbias = shape_data["origin"][2];
  var points = [];
  var normals = [];
  var textures = [];
  var theta_step = 3;
  var fai_step = 3;
//
  for (
    var theta = shape_data["angle_range_vertical"][0];
    theta < shape_data["angle_range_vertical"][1];
    theta += theta_step
  ) {
    for (
      var fai = shape_data["angle_range_horizontal"][0];
      fai < shape_data["angle_range_horizontal"][1];
      fai += fai_step
    ) {
      var p1 = vec3(
        a * Math.sin(theta / 180 * Math.PI) * Math.cos(fai / 180 * Math.PI) +
          abias,
        c * Math.cos(theta / 180 * Math.PI) + bbias,
        b * Math.sin(theta / 180 * Math.PI) * Math.sin(fai / 180 * Math.PI) +
          cbias
      );
      var n1 = get_ellipsoid_normals(a, b, c, abias, bbias, cbias, p1);
      if (texture_generator != undefined) {
        var t1 = texture_generator(
          p1[0] - abias,
          p1[1] - bbias,
          p1[2] - cbias,
          2.0 * a,
          2.0 * c
        );
      }
      var p2 = vec3(
        a *
          Math.sin((theta + theta_step) / 180 * Math.PI) *
          Math.cos(fai / 180 * Math.PI) +
          abias,
        c * Math.cos((theta + theta_step) / 180 * Math.PI) + bbias,
        b *
          Math.sin((theta + theta_step) / 180 * Math.PI) *
          Math.sin(fai / 180 * Math.PI) +
          cbias
      );
      var n2 = get_ellipsoid_normals(a, b, c, abias, bbias, cbias, p2);
      if (texture_generator != undefined) {
        var t2 = texture_generator(
          p2[0] - abias,
          p2[1] - bbias,
          p2[2] - cbias,
          2.0 * a,
          2.0 * c
        );
      }
      var p3 = vec3(
        a *
          Math.sin((theta + theta_step) / 180 * Math.PI) *
          Math.cos((fai + fai_step) / 180 * Math.PI) +
          abias,
        c * Math.cos((theta + theta_step) / 180 * Math.PI) + bbias,
        b *
          Math.sin((theta + theta_step) / 180 * Math.PI) *
          Math.sin((fai + fai_step) / 180 * Math.PI) +
          cbias
      );
      var n3 = get_ellipsoid_normals(a, b, c, abias, bbias, cbias, p3);
      if (texture_generator != undefined) {
        var t3 = texture_generator(
          p3[0] - abias,
          p3[1] - bbias,
          p3[2] - cbias,
          2.0 * a,
          2.0 * c
        );
      }
      var p4 = vec3(
        a *
          Math.sin(theta / 180 * Math.PI) *
          Math.cos((fai + fai_step) / 180 * Math.PI) +
          abias,
        c * Math.cos(theta / 180 * Math.PI) + bbias,
        b *
          Math.sin(theta / 180 * Math.PI) *
          Math.sin((fai + fai_step) / 180 * Math.PI) +
          cbias
      );
      var n4 = get_ellipsoid_normals(a, b, c, abias, bbias, cbias, p1);
      if (texture_generator != undefined) {
        var t4 = texture_generator(
          p4[0] - abias,
          p4[1] - bbias,
          p4[2] - cbias,
          2.0 * a,
          2.0 * c
        );
      }
      points.push(p1);
      normals.push(n1);
      points.push(p2);
      normals.push(n2);
      points.push(p3);
      normals.push(n3);
      points.push(p1);
      normals.push(n1);
      points.push(p3);
      normals.push(n3);
      points.push(p4);
      normals.push(n4);
      if (texture_generator != undefined) {
        textures.push(t1);
        textures.push(t2);
        textures.push(t3);
        textures.push(t1);
        textures.push(t3);
        textures.push(t4);
      }
    }
  }

  return {
    vertices: points,
    normals: normals,
    textures: textures
  };
}
function cylinder_generator(shape_data, texture_generator) {
  var points = [];
  var normals = [];
  var textures = [];
  var abias = shape_data["origin"][0];
  var bbias = shape_data["origin"][1];
  var cbias = shape_data["origin"][2];
  var a = shape_data["ellipse_axis"][0];
  var b = shape_data["ellipse_axis"][1];

  for (
    var theta = shape_data["angle_range"][0];
    theta <= shape_data["angle_range"][1];
    theta += 1
  ) {
    var p1 = vec3(
      a * Math.cos(theta / 180 * Math.PI) + abias,
      -shape_data["height"] / 2 + bbias,
      b * Math.sin(theta / 180 * Math.PI) + cbias
    );
    var p2 = vec3(
      a * Math.cos(theta / 180 * Math.PI) + abias,
      shape_data["height"] / 2 + bbias,
      b * Math.sin(theta / 180 * Math.PI) + cbias
    );
    var p3 = vec3(
      a * Math.cos((theta + 1) / 180 * Math.PI) + abias,
      shape_data["height"] / 2 + bbias,
      b * Math.sin((theta + 1) / 180 * Math.PI) + cbias
    );
    var p4 = vec3(
      a * Math.cos((theta + 1) / 180 * Math.PI) + abias,
      -shape_data["height"] / 2 + bbias,
      b * Math.sin((theta + 1) / 180 * Math.PI) + cbias
    );
    var normal = vec3(cross(subtract(p2, p1), subtract(p3, p1)));
    if (texture_generator != undefined) {
      var t1 = texture_generator(theta, 0, 512);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
    }
    points.push(p1);
    points.push(p2);
    points.push(p3);
    points.push(p1);
    points.push(p3);
    points.push(p4);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
  }

  return {
    vertices: points,
    normals: normals,
    textures: textures
  };
}

function pyramid_generator(shape_data, texture_generator) {
  var points = [];
  var normals = [];
  var textures = [];
  var abias = shape_data["origin"][0];
  var bbias = shape_data["origin"][1];
  var cbias = shape_data["origin"][2];
  var a = shape_data["ellipse_axis"][0];
  var b = shape_data["ellipse_axis"][1];

    var p1 = vec3(
      abias,
      bbias,
      cbias+shape_data["height"]
    );
    var p2 = vec3(
      abias+a,
      bbias,
      cbias
    );
    var p3 = vec3(
      abias,
      b+ bbias,
      cbias
    );
    var p4 = vec3(
      abias-a,
      bbias,
      cbias
    );

    var normal = vec3(cross(subtract(p2, p1), subtract(p3, p1)));
    normal = subtract(vec3(), normal);
    if (texture_generator != undefined) {
      var t1 = texture_generator(0, 0, 512);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
    }
    points.push(p1);
    points.push(p2);
    points.push(p3);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);



    var normal = vec3(cross(subtract(p3, p1), subtract(p4, p1)));
    normal = subtract(vec3(), normal);
    if (texture_generator != undefined) {
      var t1 = texture_generator(0, 0, 512);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
    }
    points.push(p1);
    points.push(p3);
    points.push(p4);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);



    var normal = vec3(cross(subtract(p2, p1), subtract(p4, p1)));
    normal = subtract(vec3(), normal);
    if (texture_generator != undefined) {
      var t1 = texture_generator(0, 0, 512);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
    }
    points.push(p1);
    points.push(p2);
    points.push(p4);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);


  return {
    vertices: points,
    normals: normals,
    textures: textures
  };
}

function taper_generator(shape_data, texture_generator) {
  var points = [];
  var normals = [];
  var textures = [];
  var abias = shape_data["origin"][0];
  var bbias = shape_data["origin"][1];
  var cbias = shape_data["origin"][2];
  var a = shape_data["ellipse_axis"][0];
  var b = shape_data["ellipse_axis"][1];

  for (
    var theta = shape_data["angle_range"][0];
    theta < shape_data["angle_range"][1];
    theta++
  ) {
    var p1 = vec3(
      shape_data["top_point"][0],
      shape_data["top_point"][2],
      shape_data["top_point"][1]
    );
    var p2 = vec3(
      a * Math.cos(theta / 180 * Math.PI) + abias,
      b * Math.sin(theta / 180 * Math.PI) + cbias,
      bbias
    );
    var p3 = vec3(
      a * Math.cos((theta + 1) / 180 * Math.PI) + abias,
      b * Math.sin((theta + 1) / 180 * Math.PI) + cbias,
      bbias
    );
    var normal = vec3(cross(subtract(p2, p1), subtract(p3, p1)));
    normal = subtract(vec3(), normal);
    if (texture_generator != undefined) {
      var t1 = texture_generator(theta, 0, 512);
      textures.push(t1);
      textures.push(t1);
      textures.push(t1);
    }
    points.push(p1);
    points.push(p2);
    points.push(p3);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
  }

  return {
    vertices: points,
    normals: normals,
    textures: textures
  };
}

function get_ellipsoid_normals(a, b, c, abias, bbias, cbias, p) {
  return vec3(
    Math.sqrt(a * a + b * b + c * c) /
      2 /
      Math.sqrt(
        Math.pow(p[0] - abias, 2) +
          Math.pow(p[1] - cbias, 2) +
          Math.pow(p[2] - bbias, 2)
      ) *
      2 *
      (p[0] - abias) /
      a /
      a,
    Math.sqrt(a * a + b * b + c * c) /
      2 /
      Math.sqrt(
        Math.pow(p[0] - abias, 2) +
          Math.pow(p[1] - cbias, 2) +
          Math.pow(p[2] - bbias, 2)
      ) *
      2 *
      (p[1] - cbias) /
      c /
      c,
    Math.sqrt(a * a + b * b + c * c) /
      2 /
      Math.sqrt(
        Math.pow(p[0] - abias, 2) +
          Math.pow(p[1] - cbias, 2) +
          Math.pow(p[2] - bbias, 2)
      ) *
      2 *
      (p[2] - bbias) /
      b /
      b
  );
}

function cuboid_generator(shape_data) {
  var pointArray = [];
  var points = [];
  var normals = [];
  var indice = [
    1,
    3,
    8,
    1,
    8,
    5,
    1,
    6,
    7,
    1,
    7,
    3,
    6,
    2,
    4,
    6,
    4,
    7,
    2,
    5,
    8,
    2,
    8,
    4,
    3,
    7,
    4,
    3,
    4,
    8,
    1,
    5,
    2,
    1,
    2,
    6
  ];

  for (var k = 0; k < 36; k++) indice[k]--;

  var p1 = vec3(
    shape_data["bottom_leftup"][0],
    shape_data["bottom_leftup"][1],
    shape_data["bottom_leftup"][2]
  );
  pointArray.push(p1);
  var p2 = vec3(
    shape_data["bottom_rightdown"][0],
    shape_data["bottom_rightdown"][1],
    shape_data["bottom_rightdown"][2]
  );
  pointArray.push(p2);
  var p3 = vec3(
    shape_data["bottom_leftup"][0],
    shape_data["bottom_leftup"][1] + shape_data["height"],
    shape_data["bottom_leftup"][2]
  );
  pointArray.push(p3);
  var p4 = vec3(
    shape_data["bottom_rightdown"][0],
    shape_data["bottom_rightdown"][1] + shape_data["height"],
    shape_data["bottom_rightdown"][2]
  );
  pointArray.push(p4);
  var p5 = vec3(
    shape_data["bottom_leftdown"][0],
    shape_data["bottom_leftdown"][1],
    shape_data["bottom_leftdown"][2]
  );
  pointArray.push(p5);
  var p6 = vec3(
    shape_data["bottom_rightup"][0],
    shape_data["bottom_rightup"][1],
    shape_data["bottom_rightup"][2]
  );
  pointArray.push(p6);
  var p7 = vec3(
    shape_data["bottom_rightup"][0],
    shape_data["bottom_rightup"][1] + shape_data["height"],
    shape_data["bottom_rightup"][2]
  );
  pointArray.push(p7);
  var p8 = vec3(
    shape_data["bottom_leftdown"][0],
    shape_data["bottom_leftdown"][1] + shape_data["height"],
    shape_data["bottom_leftdown"][2]
  );
  pointArray.push(p8);

  var normal_tmp;
  for (var i = 0; i < 36; i += 6) {
    normal_tmp = get_rectangle_normals([
      pointArray[indice[i]],
      pointArray[indice[i + 1]],
      pointArray[indice[i + 2]],
      pointArray[indice[i + 5]]
    ]);
    for (var j = 0; j < 6; j++) {
      normals.push(normal_tmp[j]);
      points.push(pointArray[indice[i + j]]);
    }
  }

  return {
    vertices: points,
    normals: normals
  };
}

function get_rectangle_normals(vertices) {
  var t1 = subtract(vertices[2], vertices[0]);
  var t2 = subtract(vertices[1], vertices[3]);

  var normal = vec3(cross(t1, t2));

  return [normal, normal, normal, normal, normal, normal];
}
