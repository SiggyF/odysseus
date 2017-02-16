uniform sampler2D videoMap;
uniform float opacity;
varying vec2 vUv;

void main() {
  // sample the upper part of the video
  // not sure why we need to do +0.5 here and not in depth part
  vec4 color = texture2D(videoMap, vec2(vUv.x,  (vUv.y / 2.0) + 0.5 ));
  gl_FragColor = vec4(color.rgb, opacity);
}
