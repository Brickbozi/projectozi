#version 300 es
layout(location=0) in vec4 position;
uniform vec3 color;
out vec3 color2;
uniform mat4 mv;
uniform mat4 p;
void main() {
    gl_Position = p * mv * position;
    color2 = color;
}