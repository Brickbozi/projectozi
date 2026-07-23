let scaleStep = 0.1;
let transStep = 0.002;
let angleStep = 10.0;
let isDragging = false;
let horReflect = false;
let vertReflect = false;
let canvas
let device, context, pipeline, uniformBuffer, sampler, bindGroup, renderPassDescriptor;
let scale, angle, translationX, translationY;
let currentTexture = null;


async function initViewer() {

    canvas = document.getElementById("test")
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

   
    document.addEventListener("keyup", (event) => {
        if (event.key === 'ArrowUp') {
            vertReflect = !vertReflect;
        }
        if (event.key === 'ArrowLeft') {
            horReflect = !horReflect;
        }
    });

    document.addEventListener("ArrowLeft", (event) => {
        console.log("left");
        horReflect = !horReflect;
    });

    canvas.addEventListener("wheel", (event) => {
        

        if (event.deltaY > 0) {
            if (isDragging) {
                angle = angle - angleStep
            } else {
                if (scale > 0.5) {
                    scale = scale - scaleStep;
                }
            }
        } else {
            if (isDragging) {
                angle = angle + angleStep
            } else {
                scale += scaleStep;
            }
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
    });
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    document.addEventListener('mousemove', (e) => {
        let dx = e.movementX;
        let dy = e.movementY;
        
        if (isDragging) {
            if (e.movementX > 0) {
                translationX = translationX + (transStep * dx);
            } else if (e.movementX < 0) {
                translationX = translationX + (transStep * dx);
            }
            if (e.movementY > 0) {
                translationY = translationY - (transStep * dy);
            } else if (e.movementY < 0) {
                translationY = translationY - (transStep * dy);
            }
        }
    });

    const adapter = await navigator.gpu?.requestAdapter();
    device = await adapter?.requestDevice();
    if (!device) {
        console.log("damn u old")
        return;
    }

    context = canvas.getContext('webgpu');

    if (!context) {
        console.log("fail")
    }
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });



    const module = device.createShaderModule({
        label: 'our hardcoded red triangle shaders',
        code: /* wgsl */ `
        struct AnimationUniforms {
            matrix: mat3x3f,
            time: f32,
        };
        struct vertexOut {
            @builtin(position) position: vec4f,
            @location(0) texcoord: vec2f,
        };
        @group(0) @binding(0) var<uniform> uniforms: AnimationUniforms;

        @vertex fn vs(
            @builtin(vertex_index) vertexIndex : u32
        
        ) -> vertexOut {
            let pos = array(
            vec2f( -1.0,  1.0),  // top left
            vec2f( 1.0, 1.0),     // top right
            vec2f(-1.0, -1.0),  // bottom left
            vec2f( 1.0, -1.0)   // bottom right
            );
            let uvs = array(
                vec2f(0.0, 0.0),  // top left
                vec2f(1.0, 0.0),  // top right
                vec2f(0.0, 1.0),  // bottom left
                vec2f(1.0, 1.0)   // bottom right
            );
            let x = pos[vertexIndex][0];
            let y = pos[vertexIndex][1];
            let tvec = uniforms.matrix * vec3f(x,y,1.0);
            var output: vertexOut;
            output.position = vec4f(tvec.xy, 0.0, 1.0);
            output.texcoord = uvs[vertexIndex];
            return output;
        }
        @group(0) @binding(1) var ourSampler: sampler;
        @group(0) @binding(2) var ourTexture: texture_2d<f32>;
        @fragment fn fs(fsInput: vertexOut) -> @location(0) vec4f {
            return textureSample(ourTexture, ourSampler, fsInput.texcoord);
        }
        `,
    });

    uniformBuffer = device.createBuffer({
        label: `uniforms`,
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    pipeline = device.createRenderPipeline({
        label: 'our hardcoded red triangle pipeline',
        layout: 'auto',
        primitive: { topology: 'triangle-strip', },
        vertex: {
            entryPoint: 'vs',
            module,
        },
        fragment: {
            entryPoint: 'fs',
            module,
            targets: [{ format: presentationFormat }],
        },
    });

    sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
        maxAnisotropy: 16,

    });

    renderPassDescriptor = {
        label: 'our basic canvas renderPass',
        colorAttachments: [
            {
                // view: <- to be filled out when we render
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };
}

function createModelMatrix() {
    const imageRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;

    let imgScaleX = 1.0;
    let imgScaleY = 1.0;

    let radians = angle * (Math.PI / 180)

    if (imageRatio > 1.0) {
        imgScaleY = 1.0 / imageRatio;
    } else {
        imgScaleX = imageRatio;
    }

    const finalScaleX = imgScaleX * scale;
    const finalScaleY = imgScaleY * scale;


    const c = Math.cos(radians);
    const s = Math.sin(radians);

    const hFlip = horReflect ? -1.0 : 1.0;
    const vFlip = vertReflect ? -1.0 : 1.0;

    return new Float32Array([
        (c * finalScaleX * hFlip) / canvasRatio, s * finalScaleX * hFlip, 0, 0,
        (-s * finalScaleY) / canvasRatio * vFlip, c * finalScaleY * vFlip, 0, 0,
        translationX, translationY, 1.0, 0
    ]);
}


function viewNewImage() {

    angle = 0.0;
    scale = 1.5;
    translationX = 0.0;
    translationY = 0.0;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    if (currentTexture) {
        currentTexture.destroy();
    }

    currentTexture = device.createTexture({
        label: 'image',
        size: [img.width, img.height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
        { source: img, flipY: false },
        { texture: currentTexture },
        [img.width, img.height]
    );


    bindGroup = device.createBindGroup({
        label: `triangle bind group`,
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: sampler },
            { binding: 2, resource: currentTexture.createView() },
        ],
    });

}



function render(timestamp) {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.

    //matrix = createModelMatrix(translationX, translationY, angle, scale)

    if (bindGroup) {
        elapsed = timestamp;
        let mat = createModelMatrix();

        renderPassDescriptor.colorAttachments[0].view =
            context.getCurrentTexture().createView();
        // make a command encoder to start encoding commands
        const encoder = device.createCommandEncoder({ label: 'our encoder' });

        // make a render pass encoder to encode render specific commands

        const combinedData = new Float32Array(13); // 12 elements for matrix + 1 for time
        combinedData.set(mat, 0);                  // Put the matrix at offset 0
        combinedData.set([elapsed], 12);           // Put the elapsed float at index 12
        device.queue.writeBuffer(uniformBuffer, 0, combinedData);
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup)
        pass.draw(4);  // call our vertex shader 3 times
        pass.end();
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

    }
    requestAnimationFrame(render);
}

requestAnimationFrame(render);