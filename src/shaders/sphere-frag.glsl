uniform sampler2D videoMap;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(videoMap, vec2(vUv.x, vUv.y/2.0));
  gl_FragColor = vec4(color.rgb, 1.0);
}
