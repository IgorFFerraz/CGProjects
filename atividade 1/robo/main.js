// =========================================================
// PASSO 1: CONEXÃO COM A TELA (HTML) E INICIALIZAÇÃO
// =========================================================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado no seu navegador.");
}
// =========================================================
// PASSO 2: VÉRTICES
// =========================================================

const vertices = new Float32Array([
    // --- 1. PEÇAS CINZAS (42 vértices) ---
    // Tronco
    -0.3,-0.4,   0.3,-0.4,  -0.3, 0.4,     0.3,-0.4,   0.3, 0.4,  -0.3, 0.4,
    // Cabeça
    -0.15, 0.4,  0.15, 0.4, -0.15,0.65,    0.15, 0.4,  0.15,0.65, -0.15,0.65,
    // Perna Esquerda
    -0.2,-0.8,  -0.05,-0.8, -0.2,-0.4,    -0.05,-0.8, -0.05,-0.4, -0.2,-0.4,
    // Perna Direita
     0.05,-0.8,  0.2,-0.8,   0.05,-0.4,    0.2,-0.8,   0.2,-0.4,   0.05,-0.4,
    
    // Braço Esquerdo
    -0.2, 0.2,   -0.3, 0.3,  -0.55,-0.15,  -0.3, 0.3,  -0.65,-0.05, -0.55,-0.15,
    // Braço Direito 
     0.2, 0.2,    0.3, 0.3,   0.55,-0.15,   0.3, 0.3,   0.65,-0.05,  0.55,-0.15,
    
    // Antena Base
    -0.02,0.65,  0.02,0.65, -0.02,0.8,     0.02,0.65,  0.02,0.8,  -0.02,0.8,

    // --- 2. PEÇAS AMARELAS (66 vértices) ---
    // Pé Esquerdo
    -0.28,-0.92, -0.02,-0.92, -0.28,-0.8,   -0.02,-0.92, -0.02,-0.8, -0.28,-0.8,
    // Pé Direito
     0.02,-0.92,  0.28,-0.92,  0.02,-0.8,    0.28,-0.92,  0.28,-0.8,  0.02,-0.8,
    // Antena Ponta
    -0.04, 0.8,  0.04, 0.8, -0.04,0.88,    0.04, 0.8,  0.04,0.88, -0.04,0.88,
    // Olho Esquerdo
    -0.12,0.48, -0.04,0.48, -0.12,0.56,   -0.04,0.48, -0.04,0.56, -0.12,0.56,
    // Olho Direito
     0.04,0.48,  0.12,0.48,  0.04,0.56,    0.12,0.48,  0.12,0.56,  0.04,0.56,
    
    // GARRA ESQUERDA
    // Base da garra
    -0.52, -0.18,  -0.68, -0.02,  -0.60, -0.26,   -0.68, -0.02,  -0.76, -0.10,  -0.60, -0.26,
    // Dedo Superior 
    -0.76, -0.10,  -0.72, -0.14,  -0.84, -0.18,   -0.72, -0.14,  -0.80, -0.22,  -0.84, -0.18,
    // Dedo Inferior
    -0.64, -0.22,  -0.60, -0.26,  -0.72, -0.30,   -0.60, -0.26,  -0.68, -0.34,  -0.72, -0.30,
    
    // GARRA DIREITA
     0.52, -0.18,   0.68, -0.02,   0.60, -0.26,    0.68, -0.02,   0.76, -0.10,   0.60, -0.26,
    // Dedo Superior 
     0.76, -0.10,   0.72, -0.14,   0.84, -0.18,    0.72, -0.14,   0.80, -0.22,   0.84, -0.18,
    // Dedo Inferior
     0.64, -0.22,   0.60, -0.26,   0.72, -0.30,    0.60, -0.26,   0.68, -0.34,   0.72, -0.30,

    // --- 3. PEÇA BRANCA (6 vértices) ---
    // Fundo da Boca
    -0.12, 0.4,  0.12, 0.4, -0.12,0.45,    0.12, 0.4,  0.12,0.45, -0.12,0.45,

    // --- 4. PEÇAS PRETAS (24 vértices) ---
    // Dentes da Boca
    -0.08, 0.4, -0.07, 0.4, -0.08,0.45,   -0.07, 0.4, -0.07,0.45, -0.08,0.45,
    -0.03, 0.4, -0.02, 0.4, -0.03,0.45,   -0.02, 0.4, -0.02,0.45, -0.03,0.45,
     0.02, 0.4,  0.03, 0.4,  0.02,0.45,    0.03, 0.4,  0.03,0.45,  0.02,0.45,
     0.07, 0.4,  0.08, 0.4,  0.07,0.45,    0.08, 0.4,  0.08,0.45,  0.07,0.45,

    // --- 5. PEÇAS VERMELHAS (12 vértices) ---
    -0.2,  0.1, -0.05, 0.1, -0.2, 0.25,   -0.05, 0.1, -0.05,0.25, -0.2, 0.25,
     0.05,-0.2,  0.2, -0.2,  0.05,-0.05,   0.2, -0.2,  0.2,-0.05,  0.05,-0.05,

    // --- 6. PEÇAS LARANJAS (12 vértices) ---
    -0.15,-0.2, -0.05,-0.2, -0.15,-0.1,   -0.05,-0.2, -0.05,-0.1, -0.15,-0.1,
     0.05, 0.1,  0.2,  0.1,  0.05, 0.25,   0.2,  0.1,  0.2, 0.25,  0.05,0.25
]);

// =========================================================
// PASSO 3: BUFFER
// =========================================================

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// =========================================================
// PASSO 4: VERTEX SHADER
// =========================================================
// Mini-programa que posiciona cada triângulo no espaço 2D da tela.
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
void main() { 
    gl_Position = vec4(aPosition, 0.0, 1.0); 
}`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// =========================================================
// PASSO 5: FRAGMENT SHADER
// =========================================================
const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec4 uColor; 
out vec4 outColor;
void main() { 
    outColor = uColor; 
}`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// =========================================================
// PASSO 6: PROGRAMA WEBGL
// =========================================================
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// =========================================================
// PASSO 7: ATRIBUTOS
// =========================================================
const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// =========================================================
// PASSO 8: UNIFORM
// =========================================================
const colorLocation = gl.getUniformLocation(program, "uColor");

// =========================================================
// PASSO 9: LIMPAR A TELA
// =========================================================
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);


// =========================================================
// PASSO 10: DESENHAR O ROBÔ
// =========================================================

// 1. CINZA (Corpo, Cabeça, Braços integrados)
gl.uniform4f(colorLocation, 0.6, 0.6, 0.6, 1.0); 
gl.drawArrays(gl.TRIANGLES, 0, 42); 

// 2. AMARELO (Pernas, Garras perfeitas, Antena, Olhos)
gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 42, 66); 

// 3. BRANCO (Boca Fundo)
gl.uniform4f(colorLocation, 1.0, 1.0, 1.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 108, 6); 

// 4. PRETO (Dentes)
gl.uniform4f(colorLocation, 0.0, 0.0, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 114, 24); 

// 5. VERMELHO (Botões)
gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 138, 12); 

// 6. LARANJA (Botões)
gl.uniform4f(colorLocation, 1.0, 0.5, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 150, 12);