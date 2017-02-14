uniform sampler2D displacementMap;
uniform sampler2D colorMap;
uniform float width, height;
uniform float nearClipping, farClipping;
uniform float pointSize;
uniform float zOffset;
varying vec2 vUv;
const float TwoPi = 6.28318530718;
const float Pi = 3.14159265359;
const float HalfPi = 1.57079632679;

float depthFromRangleLinear(float normalizedDepth, float near, float far) {
  return normalizedDepth * (far - near) + near;
}

float depthFromRangleInverse(float normalizedDepth, float near, float far) {
  return (far * near) / (far - normalizedDepth * (far - near));
}

vec4 flatToSphereProjection(float radius, vec2 uv, float z) {
  float newRadius = radius - z;
  float newX = ((1. - uv.x) * TwoPi); // 1- is to invert the ball
  float newY = (uv.y) * TwoPi;
  // http://stackoverflow.com/questions/12732590/how-map-2d-grid-points-x-y-onto-sphere-as-3d-points-x-y-z
  float lon = (1. - uv.x) * TwoPi;
  float lat =
    atan(uv.y * 2.) * TwoPi; //*2, because we only use half the texture.
  vec4 res = vec4(newRadius * cos(lat) * sin(lon), newRadius * sin(lat),
                  newRadius * cos(lat) * cos(lon), 1.);
  return res;
}

void main() {
  vUv = vec2(position.x / width, position.y * .5 / height);
  vec4 textureVertex = texture2D(displacementMap, vUv);
  float normalizedDepth = (textureVertex.r + textureVertex.g + textureVertex.b) / 3.0;
  float z = depthFromRangleInverse(1. - normalizedDepth, nearClipping, farClipping);

  // For sphere projection, make sure far and near clipping are the same, or
  // have a difference that is smaller than is radius
  vec4 pos = flatToSphereProjection(100., vUv, z);
  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * pos;
}