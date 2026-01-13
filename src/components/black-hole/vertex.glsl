in vec3 position;
void main() {
  // Push far back inside the frustum so other content can sit on top.
  gl_Position = vec4(position.xy, -0.999, 1.0);
}