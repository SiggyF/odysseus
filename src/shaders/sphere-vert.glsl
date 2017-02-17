uniform sampler2D videoMap;
uniform float width, height;
uniform float nearClipping, farClipping;
uniform float pointSize;
uniform float zOffset;
varying vec2 vUv;
const float TwoPi = 6.28318530718;
const float Pi = 3.14159265359;
const float HalfPi = 1.57079632679;

float depthFromRangleInverse(float normalizedDepth, float near, float far) {
  // compute depth from sphere inward
  return (far * near) / (far - normalizedDepth * (far - near));
}

vec4 flatToSphereProjection(float radius, vec2 uv, float z) {
  float newRadius = radius - z;
  // http://stackoverflow.com/questions/12732590/how-map-2d-grid-points-x-y-onto-sphere-as-3d-points-x-y-z
  float lon = uv.x * TwoPi;

  // 2 * atan(exp(y/R)) - pi/2
  // float lat = atan(uv.y) * TwoPi  ;
  // uv.y -> 0 - 1
  //
  // float lat = atan(uv.y * Pi) * Pi + Pi/2.0 ;
  float lat = -(uv.y - 0.5) * Pi;

  vec4 res = vec4(newRadius * cos(lat) * sin(lon), newRadius * sin(lat),
                  newRadius * cos(lat) * cos(lon), 1.);
  return res;
}

void main() {
  vUv = vec2(position.x / width,  position.y / height);
  vec4 textureVertex = texture2D(videoMap, vec2(vUv.x, vUv.y/2.0));
  float normalizedDepth = (textureVertex.r + textureVertex.g + textureVertex.b) / 3.0;
  // compute depth from sphere inward
  float z = depthFromRangleInverse(1.0 - normalizedDepth, nearClipping, farClipping);

  // For sphere projection, make sure far and near clipping are the same, or
  // have a difference that is smaller than is radius
  vec4 pos = flatToSphereProjection(100., vUv, z);
  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
