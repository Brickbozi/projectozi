#version 300 es
precision highp float;
out vec4 fragColor;
in vec3 color2;
void main() {
    fragColor = vec4(color2, 1.);
}