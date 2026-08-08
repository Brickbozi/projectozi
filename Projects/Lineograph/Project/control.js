window.keysBeingPressed = {};

window.addEventListener("keydown", e => {
    window.keysBeingPressed[e.key] = true;
});

window.addEventListener("keyup", e => {
    window.keysBeingPressed[e.key] = false;
});

function update() {

    const speed = 0.02;

    if (keysBeingPressed['w']) {
        position[1] += .02
    }
    if (keysBeingPressed['a']) {
        console.log("press")
        position[0] -= .02
    }
    if (keysBeingPressed['s']) {
        position[1] -= .02
    }
    if (keysBeingPressed['d']) {
        position[0] += .02
    }
    if (keysBeingPressed['q']) {
        position[2] -= 0.02
    }
    if (keysBeingPressed['e']) {
        position[2] += .02
    }

}


update();