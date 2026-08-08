#version 300 es
precision mediump float;
in float intensity;
in float specular;
out vec4 fragColor;
in vec3 v_normal;
in float z_pos;

void main() {
    float h = z_pos + 0.5;
    float greenDim = 0.05;
    float blueDim = 0.5;
    float blueEnd = 0.8;
    float redStart = 0.6;
    float redEnd = 1.0;
    float green = 1. - smoothstep(greenDim, 0.35, h);
    float blue = smoothstep(0.1, 0.2, h);
    float red = smoothstep(0.5, 0.7, h);
    float bluego = 1.0 - smoothstep(blueDim, blueEnd, h);
    float redFade = 1. - smoothstep(0.7, 0.85, h);
    //float redcon = h >= 0.85 ? 1. - smoothstep(0.7, 1.5,h): 0.;
    vec3 baseColor = vec3(h >= 0.5 ? red : 0., h >= redStart? smoothstep(redStart + 0.1, redStart + 0.3, h) : green, h <= 0.5 ? blue: 1. - smoothstep(0.6, 0.7,h));

    fragColor = vec4((baseColor * intensity + .2) + vec3(1.0) * (specular * 0.25), 1.0);
}
