

export class Minimap {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; // Fondo más oscuro para resaltar texto
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
        // Móvil: Franja lateral estrecha (200px) para no tapar el árbol
        // Escritorio: 400px
        const width = isMobile ? 200 : 400;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.top = '20px';

        if (isMobile) {
            this.canvas.style.left = '10px'; // Pegado a la izquierda
            this.canvas.style.right = 'auto';
        } else {
            this.canvas.style.right = '20px';
            this.canvas.style.left = 'auto';
        }
    }

    update(progress, consciousness, activeEvents) {
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

        this.draw(progress, consciousness, activeEvents);
    }

    registerEvent(eventData) {
        this.pastEvents.push({
            p: eventData.t,
            c: eventData.consciousness,
            color: eventData.color
        });
    }

    draw(currentProgress, currentConsciousness, activeEvents) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // Márgenes verticales (padding)
        const padTop = 60;
        const padBottom = 60;
        const availableH = h - padTop - padBottom;

        // Función para mapear tiempo (0-1) a Y con padding
        const mapY = (t) => h - padBottom - (t * availableH);

        ctx.clearRect(0, 0, w, h);

        // Definir zonas
        const textZoneWidth = w * 0.35; // 35% para texto (más espacio para gráfica)
        const graphZoneStart = textZoneWidth;
        const graphZoneWidth = w - graphZoneStart;

        // Calcular límites exactos para la gráfica
        const leftLimitX = graphZoneStart + graphZoneWidth * 0.15;
        const rightLimitX = graphZoneStart + graphZoneWidth * 0.85;

        // 1. Líneas Guía Verticales (Sutiles y elegantes)
        ctx.lineWidth = 1;

        // Centro (0) - Muy sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(graphZoneStart + graphZoneWidth / 2, 0);
        ctx.lineTo(graphZoneStart + graphZoneWidth / 2, h);
        ctx.stroke();

        // Izquierda (Alta Conciencia) - Violeta Neon Sutil
        ctx.strokeStyle = 'rgba(180, 100, 255, 0.4)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(leftLimitX, 0);
        ctx.lineTo(leftLimitX, h);
        ctx.stroke();

        // Derecha (Baja Conciencia) - Naranja Neon Sutil
        ctx.strokeStyle = 'rgba(255, 100, 50, 0.4)';
        ctx.beginPath();
        ctx.moveTo(rightLimitX, 0);
        ctx.lineTo(rightLimitX, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Líneas de Eventos y Texto (Minimalist Style)
        // Usar activeEvents pasados como argumento
        const eventsToDraw = activeEvents || [];

        const isMobile = window.innerWidth < 768;
        const fontSize = isMobile ? '9px' : '10px';
        const fontName = 'Inter, Roboto, sans-serif'; // Fuente moderna

        eventsToDraw.forEach(ev => {
            const y = mapY(ev.t);

            // Línea de conexión (Muy sutil)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Desde el borde de la zona de texto hasta el límite izquierdo de la gráfica
            ctx.moveTo(textZoneWidth - 5, y);
            ctx.lineTo(rightLimitX, y); // Cruzar toda la gráfica para referencia
            ctx.stroke();

            // Marcador en el eje de texto
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(textZoneWidth - 5, y, 2, 0, Math.PI * 2);
            ctx.fill();

            // Texto (Clean & Sharp)
            // Nombre del evento
            ctx.font = `500 ${fontSize} ${fontName}`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(ev.name, textZoneWidth - 15, y - 6);

            // Edad
            ctx.font = `400 ${parseInt(fontSize) - 1}px ${fontName}`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`${ev.age} años`, textZoneWidth - 15, y + 6);
        });

        // Helper para mapear X en la gráfica
        const mapXForPoints = (c) => {
            const norm = (1 - c) / 2;
            return graphZoneStart + (graphZoneWidth * 0.15) + norm * (graphZoneWidth * 0.7);
        };

        // 3. Ruta Histórica (Glow Effect)
        if (this.history.length > 1) {
            // Glow pass
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 3; // Un poco más gruesa

            for (let i = 0; i < this.history.length - 1; i++) {
                const p1 = this.history[i];
                const p2 = this.history[i + 1];

                const x1 = mapXForPoints(p1.c);
                const y1 = mapY(p1.p);
                const x2 = mapXForPoints(p2.c);
                const y2 = mapY(p2.p);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                // Colores vibrantes
                let r, g, b;
                const val = p2.c;
                if (val > 0) {
                    // Violeta/Azul
                    const t = Math.min(1, val * 1.5);
                    r = Math.round(255 + (100 - 255) * t);
                    g = Math.round(255 + (0 - 255) * t);
                    b = 255;
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                } else {
                    // Naranja/Rojo
                    const t = Math.min(1, Math.abs(val) * 1.5);
                    r = 255;
                    g = Math.round(255 + (50 - 255) * t);
                    b = Math.round(255 + (0 - 255) * t);
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                }

                ctx.strokeStyle = `rgb(${r},${g},${b})`;
                ctx.stroke();
            }
            // Reset shadow
            ctx.shadowBlur = 0;
        }

        // 4. Eventos Pasados (Puntos Brillantes)
        this.pastEvents.forEach(ev => {
            const x = mapXForPoints(ev.c);
            const y = mapY(ev.p);

            // Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = ev.color;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = ev.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.shadowBlur = 0;
        });

        // 5. Posición Actual (Cursor Triángulo)
        const curX = mapXForPoints(currentConsciousness);
        const curY = mapY(currentProgress);

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        // Triángulo apuntando arriba
        ctx.moveTo(curX, curY - 6);
        ctx.lineTo(curX - 5, curY + 6);
        ctx.lineTo(curX + 5, curY + 6);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
