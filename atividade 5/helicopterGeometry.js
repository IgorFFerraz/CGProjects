// ==================================================
// HELPER: CONSTRUTOR DE CAIXAS
// ==================================================

function addBox(v, c, i, cx, cy, cz, w, h, d, color) {
    const x1 = cx - w/2, x2 = cx + w/2;
    const y1 = cy - h/2, y2 = cy + h/2;
    const z1 = cz - d/2, z2 = cz + d/2;
    const start = v.length / 3;

    v.push(
        x1,y1,z2, x2,y1,z2, x2,y2,z2, x1,y2,z2, // Front
        x1,y1,z1, x1,y2,z1, x2,y2,z1, x2,y1,z1, // Back
        x1,y2,z1, x1,y2,z2, x2,y2,z2, x2,y2,z1, // Top
        x1,y1,z1, x2,y1,z1, x2,y1,z2, x1,y1,z2, // Bottom
        x2,y1,z1, x2,y2,z1, x2,y2,z2, x2,y1,z2, // Right
        x1,y1,z1, x1,y1,z2, x1,y2,z2, x1,y2,z1  // Left
    );

    // Iluminação Falsa baseada na cor original
    const cFront = [color[0]*0.9, color[1]*0.9, color[2]*0.9];
    const cBack  = [color[0]*0.8, color[1]*0.8, color[2]*0.8];
    const cTop   = [color[0]*1.0, color[1]*1.0, color[2]*1.0];
    const cBot   = [color[0]*0.5, color[1]*0.5, color[2]*0.5];
    const cRight = [color[0]*0.85, color[1]*0.85, color[2]*0.85];
    const cLeft  = [color[0]*0.75, color[1]*0.75, color[2]*0.75];

    const faceColors = [cFront, cBack, cTop, cBot, cRight, cLeft];
    for (let face of faceColors) {
        for (let j = 0; j < 4; j++) c.push(face[0], face[1], face[2]);
    }

    // Índices para formar os triângulos de cada face
    const faceIndices = [
        0,1,2, 0,2,3,       // Front
        4,5,6, 4,6,7,       // Back
        8,9,10, 8,10,11,    // Top
        12,13,14, 12,14,15, // Bottom
        16,17,18, 16,18,19, // Right
        20,21,22, 20,22,23  // Left
    ];
    for (let idx of faceIndices) i.push(start + idx);
}

// Construtor principal
function buildGeometry(builderFunc) {
    const v = [], c = [], i = [];
    builderFunc(v, c, i);
    return {
        vertices: new Float32Array(v),
        colors: new Float32Array(c),
        indices: new Uint16Array(i)
    };
}

// ==================================================
// GEOMETRY BUILDERS
// ==================================================

const helicopterBodyGeometry = buildGeometry((v, c, i) => {
    const cinza = [0.6, 0.6, 0.6];
    const escuro = [0.1, 0.1, 0.1];
    const metal = [0.3, 0.3, 0.3];

    // 1. Cabine Principal (Centro: 0, 0, 0)
    addBox(v, c, i,  0.0, 0.0, 0.0,  0.4, 0.4, 0.3,  cinza);

    // 2. Janela Frontal (Cockpit protuberante no bico -X)
    addBox(v, c, i, -0.21, 0.05, 0.0,  0.05, 0.15, 0.26, escuro);

    // 3. Janelas Laterais
    addBox(v, c, i, -0.05, 0.05, 0.16,  0.2, 0.15, 0.05, escuro);
    addBox(v, c, i, -0.05, 0.05, -0.16, 0.2, 0.15, 0.05, escuro);

    // 4. Pernas de Pouso (Skids)
    addBox(v, c, i,  0.0, -0.3, 0.15,  0.6, 0.04, 0.04, metal);
    addBox(v, c, i,  0.0, -0.3, -0.15, 0.6, 0.04, 0.04, metal);

    // 5. Hastes de suporte das pernas
    addBox(v, c, i, -0.15, -0.2, 0.15,  0.03, 0.2, 0.03, metal);
    addBox(v, c, i, -0.15, -0.2, -0.15, 0.03, 0.2, 0.03, metal);
    addBox(v, c, i,  0.15, -0.2, 0.15,  0.03, 0.2, 0.03, metal);
    addBox(v, c, i,  0.15, -0.2, -0.15, 0.03, 0.2, 0.03, metal);
});

const helicopterTopShaftGeometry = buildGeometry((v, c, i) => {
    addBox(v, c, i,  0.0, 0.25, 0.0,  0.06, 0.1, 0.06, [0.3, 0.3, 0.3]);
});

const helicopterTailGeometry = buildGeometry((v, c, i) => {
    const metal = [0.3, 0.3, 0.3];
    
    addBox(v, c, i,  0.45, 0.0, 0.0,  0.5, 0.1, 0.1, metal);
    
    addBox(v, c, i,  0.65, 0.05, 0.0, 0.1, 0.3, 0.04, metal);
});

const helicopterPropellersGeometry = buildGeometry((v, c, i) => {
    const laranja = [1.0, 0.5, 0.0];
    const metal = [0.4, 0.4, 0.4];
    addBox(v, c, i,  0.0, 0.32, 0.0,  1.8, 0.02, 0.1, laranja); 
    addBox(v, c, i,  0.0, 0.34, 0.0,  0.1, 0.02, 1.8, laranja); 
    addBox(v, c, i,  0.0, 0.33, 0.0,  0.15, 0.06, 0.15, metal);
});

const helicopterTailPropellerGeometry = buildGeometry((v, c, i) => {
    const laranja = [1.0, 0.6, 0.0];
    const metal = [0.4, 0.4, 0.4];
    addBox(v, c, i,  0.0, 0.0, 0.0,  0.4, 0.03, 0.04, laranja);
    addBox(v, c, i,  0.0, 0.0, 0.0,  0.04, 0.4, 0.04, laranja);
    addBox(v, c, i,  0.0, 0.0, 0.0,  0.06, 0.06, 0.06, metal);
});