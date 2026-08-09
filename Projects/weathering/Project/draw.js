let gridSize = 20
let faults = 0
let weathering = 10
let heightMap = false;
let camera = [0., 0.55, -2.]
let ctrlCam = false;
let lightpos = [0.2, 0.5, -1.2];
let rotate = false;
let delta = 0.02
let forward = [0, 0, 1]
let up = [0, 1, 0]
let right = normalize(cross(forward, up))
let angle = 0;
let prevTime = 0.0;
let local_up = normalize(cross(right, forward))
let R = m4fixAxes(forward, local_up)
let center = [0, 0, 0]
let lightCtrl = false;
/**
 * Runs the animation using requestAnimationFrame. This is like a loop that
 * runs once per screen refresh, but a loop won't work because we need to let
 * the browser do other things between ticks. Instead, we have a function that
 * requests itself be queued to be run again as its last step.
 * 
 * @param {Number} milliseconds - milliseconds since web page loaded; 
 *        automatically provided by the browser when invoked with
 *        requestAnimationFrame
 */
function tick(milliseconds) {
    const seconds = milliseconds / 1000
    draw(seconds)
    requestAnimationFrame(tick) // <- only call this here, nowhere else
}


/**
 * Clears the screen, sends two uniforms to the GPU, and asks the GPU to draw
 * several points. Note that no geometry is provided; the point locations are
 * computed based on the uniforms in the vertex shader.
 *
 * @param {Number} seconds - the number of seconds since the animation began
 */
function draw(seconds) {

    
    let elapsed = seconds - prevTime;
    prevTime = seconds;
    if (ctrlCam) {
        update();
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program);
    if (!window.geom) return
    let model;
    if (rotate) {
        angle = angle + (0.5 * elapsed);
    }
    if (lightCtrl) {
        lightpos = camera;
    }


    model = m4mul(m4rotX(Math.PI / 2), m4rotZ(angle));





    const T = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0, -camera[0], -camera[1], -camera[2], 1
    ];

    const view = m4mul(R, T)
    gl.uniformMatrix4fv(program.uniforms.model, false, model)
    gl.uniformMatrix4fv(program.uniforms.view, false, view)
    gl.uniformMatrix4fv(program.uniforms.projection, false, window.p)
    gl.uniform3fv(program.uniforms.camera, new Float32Array(camera));
    gl.uniform3fv(program.uniforms.lightpos, new Float32Array(lightpos));
    gl.uniform1f(program.uniforms.minZ, window.geom.minZ);
    gl.uniform1f(program.uniforms.maxZ, window.geom.maxZ);
    const connection = gl.TRIANGLES
    gl.drawElements(connection, window.geom.count, gl.UNSIGNED_SHORT, 0);
}

/**
 * Resizes the canvas to the largest square the screen can hold
 */
function fillScreen() {
    let canvas = document.querySelector('canvas')
    document.body.style.margin = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    canvas.style.width = ''
    canvas.style.height = ''
    if (window.gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        window.p = m4perspNegZ(0.1, 10, 1.5, canvas.width, canvas.height);
    }
}

window.addEventListener('load',
    document.querySelector('#submit').addEventListener('click', event => {
        gridSize = Number(document.querySelector('#gridsize').value) || 2
        faults = Number(document.querySelector('#faults').value) || 0
        weathering = Number(document.querySelector('#weathering').value) || 0
        window.geom = createGrid(gridSize);
        window.geom = faultify(window.geom, faults);
        const flat = new Float32Array(window.geom.positions.flat())
        gl.bindBuffer(gl.ARRAY_BUFFER, window.geom.positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flat, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, window.geom.normalBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(window.geom.normals.flat()),
            gl.STATIC_DRAW
        );
        fillScreen();
        console.log("PRESS!")
    }))

window.addEventListener('load', document.querySelector('#hmap').addEventListener('click', event => {
    heightMap = !heightMap;
    if (heightMap) {
        window.program = heightProgram;
    } else {
        window.program = normProgram;
    }
    fillScreen();
    console.log("hmap");
}))

window.addEventListener('load', document.querySelector('#ctrlCam').addEventListener('click', event => {
    ctrlCam = !ctrlCam;
    console.log(camera);
}))
window.addEventListener('load', document.querySelector('#rotate').addEventListener('click', event => {
    rotate = !rotate;
}))

function createGrid(gridSize) {

    const positions = []
    const normals = []

    let n = gridSize

    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {

            const x = (i / (n - 1)) * 2 - 1;
            const y = (j / (n - 1)) * 2 - 1;
            positions.push([x, y, 0])
        }
    }

    const triangles = []

    for (let row = 0; row < n - 1; row++) {
        for (let col = 0; col < n - 1; col++) {
            const i = row * n + col

            triangles.push(
                i,
                i + 1,
                i + n,

                i + 1,
                i + n + 1,
                i + n
            )
        }
    }


    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.flat()), gl.STATIC_DRAW)

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    const normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals.flat()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(triangles),
        gl.STATIC_DRAW
    )

    let minZ = Infinity
    let maxZ = -Infinity
    return {
        positions,
        positionBuffer,
        normals,
        normalBuffer,
        gridSize,
        mode: gl.TRIANGLES,
        count: triangles.length,
        minZ,
        maxZ,
        type: gl.UNSIGNED_SHORT

    }
}

function faultify(object, faults) {
    let delta = .05
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let i = 0; i < faults; i++) {
        ranPointidx = Math.floor(Math.random() * object.positions.length)
        ranTheta = Math.random() * 2 * Math.PI
        n = [Math.cos(ranTheta), Math.sin(ranTheta), 0, 0]
        p = object.positions[ranPointidx]
        for (let b of object.positions) {

            if (dot(sub(b, p), n) >= 0) {
                b[2] += delta
            } else {
                b[2] -= delta
            }
            minZ = Math.min(minZ, b[2]);
            maxZ = Math.max(maxZ, b[2]);
        }
    }
    if (faults == 0) {
        minZ = 0
        maxZ = 0
    }

    function get(i, j, def = null) {
        if (i < 0 || i >= gsize || j < 0 || j >= gsize) {
            return def;
        }
        return object.positions[j * gsize + i];
    }
    object.minZ = minZ;
    object.maxZ = maxZ;

    for (let i = 0; i < object.positions.length; i++) {
        locH = object.positions[i][2]
        object.positions[i][2] = (maxZ - minZ) > 0. ? 1.5 * ((locH - 0.5 * (maxZ + minZ)) / (maxZ - minZ)) : locH;
    }
    let gsize = object.gridSize

    for (let w = 0; w < weathering; w++) {
        for (let j = 0; j < gsize; j++) {
            for (let i = 0; i < gsize; i++) {
                let curr = get(i, j);
                let east = get(i + 1, j, curr);
                let west = get(i - 1, j, curr);
                let north = get(i, j - 1, curr);
                let south = get(i, j + 1, curr);
                let nw = get(i - 1, j - 1, curr);
                let ne = get(i + 1, j - 1, curr);
                let sw = get(i - 1, j + 1, curr);
                let se = get(i + 1, j + 1, curr);

                let sum = add(east, west)
                sum = add(sum, north)
                sum = add(sum, south)
                sum = add(sum, nw)
                sum = add(sum, ne)
                sum = add(sum, sw)
                sum = add(sum, se)
                let nmean = div(sum, 8);
                let mean = add(div(curr, 2), div(nmean, 2))
                object.positions[j * gsize + i][2] = mean[2]
            }
        }
    }
    object.normals = []
    for (let j = 0; j < gsize; j++) {
        for (let i = 0; i < gsize; i++) {
            let curr = get(i, j);
            let east = get(i + 1, j, curr);
            let west = get(i - 1, j, curr);
            let north = get(i, j - 1, curr);
            let south = get(i, j + 1, curr);
            let nw = get(i - 1, j - 1, curr);
            let ne = get(i + 1, j - 1, curr);
            let sw = get(i - 1, j + 1, curr);
            let se = get(i + 1, j + 1, curr);

            const ns = sub(north, south);
            const we = sub(west, east);
            const nesw = sub(ne, sw);
            const nwse = sub(nw, se);

            let normal = add((mul(cross(ns, we), 2)), (cross(nesw, nwse)))
            normal = div(normal, 3);
            const n_normal = normalize(normal);
            object.normals.push(n_normal);
        }
    }

    return object
}