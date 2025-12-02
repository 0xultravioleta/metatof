import { EVENTS_DATA } from './EventSystem.js';

export class Minimap {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 200;
        this.canvas.height = 300;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '20px';
        this.canvas.style.right = '20px';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.canvas.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.zIndex = '100';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.history = []; // {p: progress, c: consciousness}
        this.pastEvents = []; // {p: progress, c: consciousness, color: string}

        this.frameCount = 0;
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
        EVENTS_DATA.forEach(ev => {
            const y = h - (ev.t * h); // Invertir Y (0 abajo, 1 arriba)

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Texto pequeño del evento
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '10px Arial';
            ctx.fillText(ev.name.split('/')[0], 5, y - 2);
        });

        // 3. Ruta Histórica
        if (this.history.length > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();

            this.history.forEach((point, index) => {
                // Normalizar X de -1..1 a 0..1 INVERTIDO
                // +1 (Alta) -> 0 (Izquierda)
                // -1 (Baja) -> 1 (Derecha)
                const normX = (1 - point.c) / 2;
                const x = w * 0.1 + normX * (w * 0.8);
                const y = h - (point.p * h);

                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
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
