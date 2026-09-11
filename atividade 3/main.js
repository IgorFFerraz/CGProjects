const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();
let corBarraDireita = new Float32Array([0.5, 0.5, 0.5]);

let verticesBarraEsquerda = verticesBarra();
let corBarraEsquerda = new Float32Array([1.0, 1.0, 1.0]);

let verticesBolaCentro = verticesBola();
let corBolaCentro = new Float32Array([1.0, 0.5, 0.0]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);
let MbarraDireita = m3.translation(0.9, 0.0);
let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER & SHADERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
uniform mat3 u_transform;
out vec3 vColor;
void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 outColor;
void main() {
    outColor = vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
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
    throw new Error(gl.getProgramInfoLog(program));
}

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
const transformLocation = gl.getUniformLocation(program, "u_transform");

// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);
const numComponents = 2;

function drawScene(){
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarra(vertices, cor, transformMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, cor);
    gl.uniformMatrix3fv(transformLocation, false, transformMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / numComponents);
}

function drawBarraEsquerda(){ drawBarra(verticesBarraEsquerda, corBarraEsquerda, MbarraEsquerda); }
function drawBarraDireita(){ drawBarra(verticesBarraDireita, corBarraDireita, MbarraDireita); }
function drawBolaCentro(){ drawBarra(verticesBolaCentro, corBolaCentro, MbolaCentro); }

// --------------------------------------------------
// CONTROLES (TECLADO)
// --------------------------------------------------
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);


// --------------------------------------------------
// PARÂMETROS E LÓGICA DE ANIMAÇÃO / COLISÃO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
const velocidadeBarra = 0.015; // Velocidade da barra reduzida pela metade
const alturaBarra = 0.2; 
const larguraBarra = 0.05; 

let txBola = 0.0;
let tyBola = 0.0;

// Valores iniciais mais lentos
const velocidadeBaseX = 0.005;
const velocidadeBaseY = 0.005;
const multiplicadorVelocidade = 1.1; // Aumenta a velocidade em 10% a cada rebatida

let txBola_offset = velocidadeBaseX;
let tyBola_offset = velocidadeBaseY;
const raioBola = 0.05;

function atualizaAnimacao(){
    // 1. Movimentação das Barras
    if ((keys['w'] || keys['W']) && tyBE + alturaBarra < 1.0) tyBE += velocidadeBarra;
    if ((keys['s'] || keys['S']) && tyBE - alturaBarra > -1.0) tyBE -= velocidadeBarra;
    
    if (keys['ArrowUp'] && tyBD + alturaBarra < 1.0) tyBD += velocidadeBarra;
    if (keys['ArrowDown'] && tyBD - alturaBarra > -1.0) tyBD -= velocidadeBarra;

    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);

    // 2. Movimentação da Bola
    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // 3. Colisão com o Teto e Chão
    if (tyBola + raioBola > 1.0 || tyBola - raioBola < -1.0) {
        tyBola_offset = -tyBola_offset;
    }

    // 4. Colisão com a Barra Esquerda
    if (txBola - raioBola < -0.9 + larguraBarra && txBola + raioBola > -0.9 - larguraBarra &&
        tyBola + raioBola > tyBE - alturaBarra && tyBola - raioBola < tyBE + alturaBarra) {
        txBola = -0.9 + larguraBarra + raioBola; 
        
        // Inverte a direção e aplica o multiplicador de velocidade
        txBola_offset = -txBola_offset * multiplicadorVelocidade;
        tyBola_offset = tyBola_offset * multiplicadorVelocidade;
    }

    // 5. Colisão com a Barra Direita
    if (txBola + raioBola > 0.9 - larguraBarra && txBola - raioBola < 0.9 + larguraBarra &&
        tyBola + raioBola > tyBD - alturaBarra && tyBola - raioBola < tyBD + alturaBarra) {
        txBola = 0.9 - larguraBarra - raioBola; 
        
        // Inverte a direção e aplica o multiplicador de velocidade
        txBola_offset = -txBola_offset * multiplicadorVelocidade;
        tyBola_offset = tyBola_offset * multiplicadorVelocidade;
    }

    // 6. Pontuação (Reseta a bola e a velocidade)
    if (txBola > 1.2 || txBola < -1.2) {
        // Volta a bola pro centro
        txBola = 0.0;
        tyBola = 0.0;
        
        // Reseta a velocidade para o valor base lento
        // O operador ternário (?:) garante que a bola vá na direção de quem perdeu
        txBola_offset = (txBola_offset > 0) ? -velocidadeBaseX : velocidadeBaseX;
        tyBola_offset = (tyBola_offset > 0) ? -velocidadeBaseY : velocidadeBaseY;
    }

    MbolaCentro = m3.translation(txBola, tyBola);
}

// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------
drawScene();