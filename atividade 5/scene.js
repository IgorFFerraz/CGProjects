// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {
    constructor(gl, program) {
        this.renderer = new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();
        this.helicopterTopShaft = new HelicopterTopShaft();
        this.helicopterTail = new HelicopterTail();
        this.helicopterPropellers = new HelicopterPropellers();
        this.helicopterTailPropeller = new HelicopterTailPropeller();

        // Variáveis de posição e rotação
        this.tx = 0.0;
        this.ty = 0.0;
        this.speed = 0.02;         // Velocidade de movimento pelo teclado
        this.propellerTheta = 0.0; // Ângulo para as hélices girarem continuamente

        this.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
    }

    update() {
        if (this.keys.ArrowUp) this.ty += this.speed;
        if (this.keys.ArrowDown) this.ty -= this.speed;
        if (this.keys.ArrowLeft) this.tx -= this.speed;
        if (this.keys.ArrowRight) this.tx += this.speed;

        this.propellerTheta += 0.25;

        const gl = this.renderer.gl;
        const aspect = gl.canvas.width / gl.canvas.height;
        const zoom = 0.45; 

        // 1. Matriz Base
        let baseTransform = m4.scaling(zoom / aspect, zoom, zoom);
        
        // 2. Translação
        baseTransform = m4.multiply(baseTransform, m4.translation(this.tx, this.ty, 0.0));

        // 3. Câmera Top-Down Isométrica
        baseTransform = m4.multiply(baseTransform, m4.xRotation(-0.5));  
        baseTransform = m4.multiply(baseTransform, m4.yRotation(-0.8)); 

        this.helicopterBody.update(baseTransform);
        this.helicopterTopShaft.update(baseTransform);
        this.helicopterTail.update(baseTransform);

        // Hélice Principal
        const topPropTransform = m4.multiply(baseTransform, m4.yRotation(this.propellerTheta));
        this.helicopterPropellers.update(topPropTransform);

        // Hélice da Cauda
        let tailPropTransform = m4.zRotation(this.propellerTheta);
        tailPropTransform = m4.multiply(m4.translation(0.7, 0.05, 0.08), tailPropTransform);
        tailPropTransform = m4.multiply(baseTransform, tailPropTransform);

        this.helicopterTailPropeller.update(tailPropTransform);
    }

    draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        this.helicopterBody.draw(this.renderer);
        this.helicopterTopShaft.draw(this.renderer);
        this.helicopterTail.draw(this.renderer);
        this.helicopterPropellers.draw(this.renderer);
        this.helicopterTailPropeller.draw(this.renderer);
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