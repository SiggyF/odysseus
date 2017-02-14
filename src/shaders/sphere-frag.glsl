uniform sampler2D colorMap;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(colorMap, vUv);
  gl_FragColor = vec4(color.rgb, 0.2);
}
