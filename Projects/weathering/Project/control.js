window.keysBeingPressed = {};

window.addEventListener("keydown", e => {
    window.keysBeingPressed[e.key] = true;
});

window.addEventListener("keyup", e => {
    window.keysBeingPressed[e.key] = false;
});

// Example: check inside a loop / animation frame
function update() {

    const speed = 0.02;

    if (keysBeingPressed['w']) {

        camera[0] += forward[0] * speed;
        camera[1] += forward[1] * speed;
        camera[2] += forward[2] * speed;
    }
    if (keysBeingPressed['a']) {
        camera[0] -= right[0] * speed;
        camera[1] -= right[1] * speed;
        camera[2] -= right[2] * speed;
    }
    if (keysBeingPressed['s']) {
        camera[0] -= forward[0] * speed;
        camera[1] -= forward[1] * speed;
        camera[2] -= forward[2] * speed;
    }
    if (keysBeingPressed['d']) {
        camera[0] += right[0] * speed;
        camera[1] += right[1] * speed;
        camera[2] += right[2] * speed;
    }
    if (keysBeingPressed['ArrowUp']) {
        forward = rotateVecAroundAxis(forward, right, delta)
    }
    if (keysBeingPressed['ArrowDown']) {
        forward = rotateVecAroundAxis(forward, right, -delta)
    }
    if (keysBeingPressed['ArrowLeft']) {
        forward = rotateVecAroundAxis(forward, up, delta)
    }
    if (keysBeingPressed['ArrowRight']) {
        forward = rotateVecAroundAxis(forward, up, -delta)
    }
    forward = normalize(forward);
    right = normalize(cross(forward, up));
    local_up = normalize(cross(right, forward))
    R = m4fixAxes(forward, local_up)

}

function rotateVecAroundAxis(v, axis, angle) {
    const k = normalize(axis);

    const cosθ = Math.cos(angle);
    const sinθ = Math.sin(angle);

    const dotKV = dot(k, v);
    const crossKV = cross(k, v)
    const term1 = [v[0] * cosθ, v[1] * cosθ, v[2] * cosθ];
    const term2 = [crossKV[0] * sinθ, crossKV[1] * sinθ, crossKV[2] * sinθ];
    const term3Scale = dotKV * (1 - cosθ);
    const term3 = [k[0] * term3Scale, k[1] * term3Scale, k[2] * term3Scale];

    return [
        term1[0] + term2[0] + term3[0],
        term1[1] + term2[1] + term3[1],
        term1[2] + term2[2] + term3[2]
    ];
}

update();