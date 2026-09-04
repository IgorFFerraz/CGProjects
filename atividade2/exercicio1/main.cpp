#include <GL/glut.h>
#include <cstdlib>
#include <cmath>

int corAtual = 0; // Inicia no índice 0 (Azul)
int cliques = 0;
// Linha inicial entre (0,0) e (0,0) conforme exigido no enunciado
int pontos[2][2] = {{0, 0}, {0, 0}}; 

float cores[10][3] = {
    {0.0F, 0.0F, 1.0F}, // 0: Azul
    {1.0F, 0.0F, 0.0F}, // 1: Vermelho
    {0.0F, 1.0F, 0.0F}, // 2: Verde
    {1.0F, 1.0F, 0.0F}, // 3: Amarelo
    {1.0F, 0.0F, 1.0F}, // 4: Magenta
    {0.0F, 1.0F, 1.0F}, // 5: Ciano
    {1.0F, 0.5F, 0.0F}, // 6: Laranja
    {0.5F, 0.0F, 0.5F}, // 7: Roxo
    {0.5F, 0.5F, 0.5F}, // 8: Cinza
    {1.0F, 1.0F, 1.0F}  // 9: Branco
};

// Implementação que substitui o GL_LINES
void write_pixel(int x, int y) {
    glBegin(GL_POINTS);
    glVertex2i(x, y);
    glEnd();
}

// Algoritmo de Bresenham generalizado
void bresenham(int x1, int y1, int x2, int y2) {
    int dx = std::abs(x2 - x1);
    int dy = std::abs(y2 - y1);
    int sx = (x1 < x2) ? 1 : -1; 
    int sy = (y1 < y2) ? 1 : -1; 
    int p = dx - dy; 

    int x = x1;
    int y = y1;

    while (true) {
        write_pixel(x, y);
        if (x == x2 && y == y2) break;
        int e2 = 2 * p;
        if (e2 > -dy) {
            p -= dy;
            x += sx;
        }
        if (e2 < dx) {
            p += dx;
            y += sy;
        }
    }
}

void display() {
    glClear(GL_COLOR_BUFFER_BIT);
    
    // Altera a cor baseada no índice do teclado
    glColor3fv(cores[corAtual]);

    // Sempre traça a linha com os pontos armazenados
    bresenham(pontos[0][0], pontos[0][1], pontos[1][0], pontos[1][1]);
    
    glutSwapBuffers();
}

void mouse(int button, int state, int x, int y) {
    if (button == GLUT_LEFT_BUTTON && state == GLUT_DOWN) {
        if (cliques >= 2) cliques = 0; 
        
        pontos[cliques][0] = x;
        pontos[cliques][1] = y;
        cliques++;
        
        // Redesenha a tela apenas quando captura o par de coordenadas (inicial e final)
        if (cliques == 2) {
            glutPostRedisplay(); 
        }
    }
}

void keyboard(unsigned char key, int x, int y) {
    if (key == 27) std::exit(EXIT_SUCCESS); // Tecla Esc para sair
    
    // Altera a cor se a tecla for um número de 0 a 9
    if (key >= '0' && key <= '9') {
        corAtual = key - '0';
        glutPostRedisplay();
    }
}

void reshape(int width, int height) {
    glViewport(0, 0, width, height);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluOrtho2D(0, width, height, 0); 
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
}

int main(int argc, char* argv[]) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Exercicio 1 - Reta Bresenham");

    glClearColor(0.055F, 0.07F, 0.11F, 1.0F); 
    
    glutDisplayFunc(display);
    glutReshapeFunc(reshape);
    glutMouseFunc(mouse);
    glutKeyboardFunc(keyboard);

    glutMainLoop();
    return EXIT_SUCCESS;
}