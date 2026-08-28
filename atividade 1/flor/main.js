const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. SHADERS
// --------------------------------------------------
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
in vec3 aColor;
out vec3 vColor;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
    outColor = vec4(vColor, 1.0);
}`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);
gl.useProgram(program);

const posLoc = gl.getAttribLocation(program, "aPosition");
const colLoc = gl.getAttribLocation(program, "aColor");

// --------------------------------------------------
// 2. BUFFERS E ATRIBUTOS
// --------------------------------------------------
gl.clearColor(0.9, 0.9, 0.9, 1.0); // Fundo cinza claro
gl.clear(gl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 3. FUNÇÃO PARA DESENHAR PARTES DA FLOR
// --------------------------------------------------
function desenharParte(vertices, cores, indices, modo) {
    const vBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const cBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuf);
    gl.bufferData(gl.ARRAY_BUFFER, cores, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colLoc);
    gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 0, 0);

    if (indices) {
        const iBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.drawElements(modo, indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawArrays(modo, 0, vertices.length / 2);
    }
}

// --------------------------------------------------
// 4. CONSTRUINDO AS PEÇAS DA FLOR
// --------------------------------------------------

// Função genérica para criar círculos (usada para o miolo e para as pétalas)
function criarCirculo(cx, cy, raio, r, g, b) {
    let v = [cx, cy];
    let col = [r, g, b];
    let segmentos = 35;
    for (let i = 0; i <= segmentos; i++) {
        let angulo = (i * 2 * Math.PI) / segmentos;
        v.push(cx + raio * Math.cos(angulo), cy + raio * Math.sin(angulo));
        col.push(r, g, b);
    }
    return { vertices: new Float32Array(v), cores: new Float32Array(col) };
}

// A. CAULE DA FLOR (Retângulo usando TRIANGLES + Índices)
const cauleVerts = new Float32Array([
    -0.04, -0.8,
     0.04, -0.8,
     0.04,  0.0,
    -0.04,  0.0
]);
const cauleCores = new Float32Array([
    0.1, 0.6, 0.2,
    0.1, 0.6, 0.2,
    0.1, 0.6, 0.2,
    0.1, 0.6, 0.2
]);
const cauleIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

desenharParte(cauleVerts, cauleCores, cauleIndices, gl.TRIANGLES);


// B. PÉTALAS (Desenhadas em círculo ao redor do centro usando TRIANGLE_FAN)
const numPetalas = 6;
const distanciaPetala = 0.3;
const raioPetala = 0.22;

for (let i = 0; i < numPetalas; i++) {
    let angulo = (i * 2 * Math.PI) / numPetalas;
    let px = distanciaPetala * Math.cos(angulo);
    let py = distanciaPetala * Math.sin(angulo);
    
    // Cores para as pétalas (rosa)
    let petala = criarCirculo(px, py, raioPetala, 1.0, 0.3, 0.5);
    desenharParte(petala.vertices, petala.cores, null, gl.TRIANGLE_FAN);
}


// C. MIOLO DA FLOR
const miolo = criarCirculo(0.0, 0.0, 0.18, 1.0, 0.8, 0.0);
desenharParte(miolo.vertices, miolo.cores, null, gl.TRIANGLE_FAN);

console.log("Flor renderizada com sucesso!");