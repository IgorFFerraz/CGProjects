const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {
    vec3 position = u_viewTransform * u_modelTransform * vec3(aPosition, 1.0);
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

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.positionLocation = gl.getAttribLocation(program, "aPosition");
        this.colorLocation = gl.getUniformLocation(program, "uColor");
        this.viewTransformLocation = gl.getUniformLocation(program, "u_viewTransform");
        this.modelTransformLocation = gl.getUniformLocation(program, "u_modelTransform");
        this.viewTransform = m3.identity();
        this.verticesBuffer = gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform = viewTransform;
    }

    draw(object) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform3fv(this.colorLocation, object.color);
        gl.uniformMatrix3fv(this.modelTransformLocation, false, object.modelTransform);
        gl.uniformMatrix3fv(this.viewTransformLocation, false, this.viewTransform);
        gl.drawArrays(gl.TRIANGLES, 0, object.vertices.length / 2);
    }
}

// ==================================================
// AUXILIARY FUNCTIONS
// ==================================================

function rectangleVertices(x,y,width,height){
    return [
        x, y,
        x+width, y+height,
        x, y+height,
        x, y,
        x+width, y,
        x+width, y+height
    ];
}

function circleVertices(radius,numSegments){
    const vertices = [];
    for (let i = 0; i < numSegments; i++) {
        const theta1 = (i / numSegments) * 2 * Math.PI;
        const theta2 = ((i + 1) / numSegments) * 2 * Math.PI;
        vertices.push(0, 0);
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }
    return vertices;
}

// ==================================================
// ROBOT VERTICES
// ==================================================

function robotBodyVertices() {
    return new Float32Array(rectangleVertices(-0.08, -0.2, 0.16, 0.4));
}

function robotHeadVertices() {
    return new Float32Array(rectangleVertices(-0.08, 0.0, 0.16, 0.16));
}

function robotLimbVertices() {
    return new Float32Array(rectangleVertices(-0.03, -0.25, 0.06, 0.25));
}

function robotChestVertices() {
    return new Float32Array(rectangleVertices(0.04, -0.1, 0.06, 0.2));
}

function robotAntennaVertices() {
    return new Float32Array(rectangleVertices(-0.01, 0.16, 0.02, 0.08));
}

function robotMouthBackgroundVertices() {
    return new Float32Array(rectangleVertices(0.02, 0.02, 0.06, 0.04));
}

function robotTeethVertices() {
    const vertices = [];
    vertices.push(...rectangleVertices(0.025, 0.025, 0.02, 0.03));
    vertices.push(...rectangleVertices(0.050, 0.025, 0.02, 0.03));
    return new Float32Array(vertices);
}

// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {
    constructor(vertices, color) {
        this.vertices = vertices;
        this.color = color; 
        this.modelTransform = m3.identity();
    }
    updateModelTransform(modelTransform) {
        this.modelTransform = modelTransform;
    }
}

// ==================================================
// CLASSES DAS PARTES DO ROBÔ
// ==================================================

class RobotPart extends SceneObject {
    constructor(vertices, color) {
        super(vertices, color);
    }
}

class RobotLimb extends SceneObject {
    constructor(color, jointX, jointY) {
        super(robotLimbVertices(), color);
        this.jointX = jointX; 
        this.jointY = jointY;
        this.angle = 0.0;
    }
    updateRotation(angle) {
        this.angle = angle;
    }
    updateModelTransform(bodyTransform) {
        const localTransform = m3.multiply(
            m3.translation(this.jointX, this.jointY), 
            m3.rotation(this.angle)                   
        );
        this.modelTransform = m3.multiply(bodyTransform, localTransform);
    }
}

// ==================================================
// CLASSE ROBOT
// ==================================================

class Robot {
    constructor(tx, ty, speed) {
        this.tx = tx;
        this.baseTy = ty; 
        this.ty = ty;
        this.speed = speed;
        this.time = 0; 
        this.direction = 1;

        const cinza = new Float32Array([0.6, 0.6, 0.6]);
        const branco = new Float32Array([1.0, 1.0, 1.0]);
        const amarelo = new Float32Array([1.0, 1.0, 0.0]);
        const amareloEscuro = new Float32Array([0.7, 0.7, 0.0]);    
        const vermelho = new Float32Array([1.0, 0.2, 0.2]);    
        const cinzaEscuro = new Float32Array([0.3, 0.3, 0.3]); 
        const preto = new Float32Array([0.1, 0.1, 0.1]); 

        this.body = new RobotPart(robotBodyVertices(), cinza);
        this.head = new RobotPart(robotHeadVertices(), cinza);
        
        this.chestPlate = new RobotPart(robotChestVertices(), cinzaEscuro);
        this.antennaRod = new RobotPart(robotAntennaVertices(), cinzaEscuro);
        
        this.antennaBulb = new RobotPart(new Float32Array(circleVertices(0.03, 12)), vermelho);
        
        this.eye = new RobotPart(new Float32Array(circleVertices(0.015, 12)), amarelo); 

        this.mouthBg = new RobotPart(robotMouthBackgroundVertices(), preto);
        this.teeth = new RobotPart(robotTeethVertices(), branco);

        this.leftArm = new RobotLimb(amareloEscuro, 0.0, 0.12); 
        this.rightArm = new RobotLimb(amarelo, 0.0, 0.12);     
        this.leftLeg = new RobotLimb(amareloEscuro, 0.0, -0.15); 
        this.rightLeg = new RobotLimb(amarelo, 0.0, -0.15);     
    }

    move() {
        this.tx += this.speed;
        
        if (this.tx > 1.8 || this.tx < -1.8) {
            this.speed = -this.speed;
        }
        
        this.direction = (this.speed > 0) ? 1 : -1;

        this.time += 0.05; 
        const swingAngle = Math.sin(this.time) * 0.6; 
        this.ty = this.baseTy + Math.abs(Math.sin(this.time)) * 0.03;

        const translationMatrix = m3.translation(this.tx, this.ty);
        const scaleMatrix = m3.scaling(this.direction, 1.0);
        const bodyTransform = m3.multiply(translationMatrix, scaleMatrix);

        this.body.updateModelTransform(bodyTransform);
        this.chestPlate.updateModelTransform(bodyTransform); 

        const headTransform = m3.multiply(bodyTransform, m3.translation(0.0, 0.2));
        this.head.updateModelTransform(headTransform);
        this.antennaRod.updateModelTransform(headTransform); 
        
        this.mouthBg.updateModelTransform(headTransform);
        this.teeth.updateModelTransform(headTransform);

        const bulbTransform = m3.multiply(headTransform, m3.translation(0.0, 0.25));
        this.antennaBulb.updateModelTransform(bulbTransform);

        const eyeTransform = m3.multiply(headTransform, m3.translation(0.04, 0.1));
        this.eye.updateModelTransform(eyeTransform);
        
        this.leftArm.updateRotation(swingAngle);
        this.leftLeg.updateRotation(-swingAngle);
        this.rightArm.updateRotation(-swingAngle); 
        this.rightLeg.updateRotation(swingAngle);

        this.leftArm.updateModelTransform(bodyTransform);
        this.rightArm.updateModelTransform(bodyTransform);
        this.leftLeg.updateModelTransform(bodyTransform);
        this.rightLeg.updateModelTransform(bodyTransform);
    }

    draw(renderer) {
        renderer.draw(this.leftArm);
        renderer.draw(this.leftLeg);
        
        renderer.draw(this.body);
        renderer.draw(this.chestPlate);
        renderer.draw(this.head);
        
        renderer.draw(this.mouthBg);
        renderer.draw(this.teeth);
        
        renderer.draw(this.antennaRod);
        renderer.draw(this.antennaBulb);
        renderer.draw(this.eye);
        
        renderer.draw(this.rightArm);
        renderer.draw(this.rightLeg);
    }
}

// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {
    constructor(gl, program) {
        this.renderer = new Renderer(gl,program);
        this.viewTransform = m3.setClippingWindow(-2.0,-1.0,2.0,1.0);
        this.renderer.defineViewTransform(this.viewTransform);

        this.robots = [
            new Robot(0.0, -0.1, 0.003) 
        ];
    }

    update() {
        for (const robot of this.robots) {
            robot.move();
        }
    }

    draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        for (const robot of this.robots) {
            robot.draw(this.renderer);
        }
    }

    execute() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.execute());
    }

    init() {
        requestAnimationFrame(() => this.execute());
    }
}

// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.viewport(0, 0, canvas.width, canvas.height);

const scene = new Scene(gl,program);
scene.init();