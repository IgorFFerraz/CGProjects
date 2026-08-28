console.log("Iniciando script main.js...");

const canvas = document.getElementById("canvas");
if (!canvas) {
    console.error("Erro: Elemento canvas com ID 'canvas' não foi encontrado!");
}

const gl = canvas.getContext("webgl2");
if (!gl) {
    throw new Error("WebGL 2 não é suportado pelo seu navegador.");
}
console.log("WebGL 2 inicializado com sucesso.");

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

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        console.error("Erro de compilação do Shader:", error);
        throw new Error(error);
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    console.error("Erro ao linkar o programa:", error);
    throw new Error(error);
}
console.log("Shaders compilados e programa linkado com sucesso.");

gl.useProgram(program);

const posLoc = gl.getAttribLocation(program, "aPosition");
const colLoc = gl.getAttribLocation(program, "aColor");

// --------------------------------------------------
// 2. LIMPAR TELA (Fundo cinza claro para testar)
// --------------------------------------------------
gl.clearColor(0.8, 0.8, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 3. FUNÇÃO DE DESENHO
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
// 4. DESENHANDO O CARRO
// --------------------------------------------------

// A. Chassi
desenharParte(
    new Float32Array([-0.6,-0.2,  0.6,-0.2,  0.6,0.1,  -0.6,0.1]),
    new Float32Array([0.0, 0.4, 0.8,  0.0, 0.4, 0.8,  0.0, 0.4, 0.8,  0.0, 0.4, 0.8]),
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.TRIANGLES
);

// B. Cabine (Triangle Strip)
desenharParte(
    new Float32Array([-0.4,0.1,  -0.2,0.4,  0.4,0.1,  0.2,0.4]),
    new Float32Array([0.3, 0.7, 1.0,  0.3, 0.7, 1.0,  0.3, 0.7, 1.0,  0.3, 0.7, 1.0]),
    null,
    gl.TRIANGLE_STRIP
);

// C. Rodas (Triangle Fan)
function criarRoda(cx, cy, raio) {
    let v = [cx, cy];
    let c = [0.1, 0.1, 0.1];
    let segmentos = 30;
    for(let i = 0; i <= segmentos; i++) {
        let angulo = (i * 2 * Math.PI) / segmentos;
        v.push(cx + raio * Math.cos(angulo), cy + raio * Math.sin(angulo));
        c.push(0.1, 0.1, 0.1);
    }
    return { v: new Float32Array(v), c: new Float32Array(c) };
}

const roda1 = criarRoda(-0.35, -0.2, 0.15);
desenharParte(roda1.v, roda1.c, null, gl.TRIANGLE_FAN);

const roda2 = criarRoda(0.35, -0.2, 0.15);
desenharParte(roda2.v, roda2.c, null, gl.TRIANGLE_FAN);