import { EVENTS_DATA } from './EventSystem.js';

export class Minimap {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.canvas.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.zIndex = '100';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.history = []; // {p: progress, c: consciousness}
        this.pastEvents = []; // {p: progress, c: consciousness, color: string}

        this.frameCount = 0;

        // Inicializar tamaño y posición
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const isMobile = window.innerWidth < 768;

        // Altura completa menos márgenes
        const height = window.innerHeight - 40;
        const width = isMobile ? 120 : 200; // Más estrecho en móvil para no tapar tanto? O igual? Usuario dijo "mas alargada"

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.top = '20px';

        if (isMobile) {
            this.canvas.style.left = '20px';
            this.canvas.style.right = 'auto';
        } else {
            this.canvas.style.right = '20px';
            this.canvas.style.left = 'auto';
        }
    }

    update(progress, consciousness) {
        // Muestrear historial cada 5 frames para suavidad sin exceso de datos
        this.frameCount++;
        if (this.frameCount % 5 === 0) {
            // Si el progreso se reinicia (loop), limpiar historial
            if (this.history.length > 0 && progress < this.history[this.history.length - 1].p) {
                this.history = [];
                this.pastEvents = [];
            }
            this.history.push({ p: progress, c: consciousness });
        }

        this.draw(progress, consciousness);
    }

    registerEvent(eventData) {
        this.pastEvents.push({
            p: eventData.t,
            c: eventData.consciousness,
            color: eventData.color
        });
    }

    draw(currentProgress, currentConsciousness) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        // 1. Líneas Guía Verticales
        // Centro (0) - Gris Claro
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();

        // Izquierda (Alta Conciencia / Ultravioleta)
        ctx.strokeStyle = 'rgba(153, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(w * 0.1, 0);
        ctx.lineTo(w * 0.1, h);
        ctx.stroke();

        // Derecha (Baja Conciencia / Terracota)
        ctx.strokeStyle = 'rgba(204, 68, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(w * 0.9, 0);
        ctx.lineTo(w * 0.9, h);
        ctx.stroke();

        // 2. Líneas de Eventos (Horizontales)
        const isMobile = window.innerWidth < 768;
        const fontSize = isMobile ? '12px' : '10px'; // Fuente más grande en móvil

        EVENTS_DATA.forEach(ev => {
            const y = h - (ev.t * h); // Invertir Y (0 abajo, 1 arriba)

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Texto del evento
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = `${fontSize} Arial`;
            // En móvil, si está a la izquierda, el texto quizás deba estar alineado diferente?
            // Por defecto fillText dibuja desde la coordenada dada hacia la derecha.
            ctx.fillText(ev.name, 5, y - 2);
        });

        // 3. Ruta Histórica con Gradiente Dinámico
        if (this.history.length > 1) {
            ctx.lineWidth = 2;

            for (let i = 0; i < this.history.length - 1; i++) {
                const p1 = this.history[i];
                const p2 = this.history[i + 1];

                // Normalizar X (Invertido: +1 -> 0, -1 -> 1)
                const x1 = w * 0.1 + ((1 - p1.c) / 2) * (w * 0.8);
                const y1 = h - (p1.p * h);
                const x2 = w * 0.1 + ((1 - p2.c) / 2) * (w * 0.8);
                const y2 = h - (p2.p * h);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                // Calcular color basado en la conciencia del punto destino
                // Centro (0) = Blanco
                // Izquierda (+1) = Ultravioleta (#9900ff)
                // Derecha (-1) = Terracota (#cc4400)

                let r, g, b;
                const val = p2.c; // -1 a 1

                if (val > 0) {
                    // Interpolación Blanco -> Ultravioleta
                    // Blanco: 255, 255, 255
                    // UV: 153, 0, 255
                    const t = Math.min(1, val * 1.5); // Intensificar rápido
                    r = Math.round(255 + (153 - 255) * t);
                    g = Math.round(255 + (0 - 255) * t);
                    b = 255; // Ambos tienen 255 en azul (aprox) -> UV es 255, Blanco 255.
                } else {
                    // Interpolación Blanco -> Terracota
                    // Blanco: 255, 255, 255
                    // Terracota: 204, 68, 0
                    const t = Math.min(1, Math.abs(val) * 1.5);
                    r = Math.round(255 + (204 - 255) * t);
                    g = Math.round(255 + (68 - 255) * t);
                    b = Math.round(255 + (0 - 255) * t);
                }

                ctx.strokeStyle = `rgb(${r},${g},${b})`;
                ctx.stroke();
            }
        }

        // 4. Eventos Pasados (Puntos)
        this.pastEvents.forEach(ev => {
            const normX = (1 - ev.c) / 2; // Invertido
            const x = w * 0.1 + normX * (w * 0.8);
            const y = h - (ev.p * h);

            ctx.fillStyle = ev.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Halo
            ctx.strokeStyle = ev.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 5. Posición Actual (Cursor)
        const normX = (1 - currentConsciousness) / 2; // Invertido
        const curX = w * 0.1 + normX * (w * 0.8);
        const curY = h - (currentProgress * h);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(curX, curY - 5);
        ctx.lineTo(curX - 4, curY + 4);
        ctx.lineTo(curX + 4, curY + 4);
        ctx.fill();
    }
}
