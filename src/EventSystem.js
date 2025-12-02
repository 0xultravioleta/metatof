import * as THREE from 'three';

// API endpoint for event generation (set from environment)
let EVENT_API_ENDPOINT = null;

export function setEventApiEndpoint(endpoint) {
    EVENT_API_ENDPOINT = endpoint;
}

// Fallback Event Pool (used when API is unavailable)
const EVENT_POOL = {
    universal: [
        { t: 0.00, name: "Nacimiento", age: 0 },
        { t: 0.18, name: "Mayoría de Edad", age: 18 },
        { t: 0.99, name: "Muerte Física", age: 99 }
    ],
    standard: [
        { t: 0.04, name: "Primeros Pasos", age: 4 },
        { t: 0.06, name: "Primer Día de Escuela", age: 6 },
        { t: 0.10, name: "Mejor Amigo/a", age: 10 },
        { t: 0.14, name: "Primer Beso", age: 14 },
        { t: 0.16, name: "Licencia de Conducir", age: 16 },
        { t: 0.22, name: "Graduación Universitaria", age: 22 },
        { t: 0.24, name: "Viaje al Extranjero", age: 24 },
        { t: 0.25, name: "Primer Empleo Real", age: 25 },
        { t: 0.27, name: "Mudanza Independiente", age: 27 },
        { t: 0.28, name: "Boda / Matrimonio", age: 28 },
        { t: 0.30, name: "Ascenso Laboral", age: 30 },
        { t: 0.32, name: "Compra de Casa", age: 32 },
        { t: 0.35, name: "Nacimiento Primer Hijo", age: 35 },
        { t: 0.38, name: "Nacimiento Segundo Hijo", age: 38 },
        { t: 0.45, name: "Crisis de Mediana Edad", age: 45 },
        { t: 0.52, name: "Boda de Hijo/a", age: 52 },
        { t: 0.60, name: "Retiro Parcial", age: 60 },
        { t: 0.65, name: "Fiesta de Jubilación", age: 65 },
        { t: 0.70, name: "Bodas de Oro", age: 70 },
        { t: 0.75, name: "Nacimiento Primer Nieto", age: 75 }
    ],
    karmic: [ // Pruebas Duras / "Mal Karma"
        { t: 0.08, name: "Accidente Doméstico", age: 8 },
        { t: 0.12, name: "Bullying Escolar Severo", age: 12 },
        { t: 0.15, name: "Suspensión Escolar", age: 15 },
        { t: 0.20, name: "Accidente de Auto", age: 20 },
        { t: 0.23, name: "Ruptura Amorosa Dolorosa", age: 23 },
        { t: 0.26, name: "Deuda Inesperada", age: 26 },
        { t: 0.30, name: "Despido Fulminante", age: 30 },
        { t: 0.34, name: "Traición de Socio", age: 34 },
        { t: 0.38, name: "Divorcio Conflictivo", age: 38 },
        { t: 0.42, name: "Bancarrota Total", age: 42 },
        { t: 0.48, name: "Diagnóstico de Cáncer", age: 48 },
        { t: 0.55, name: "Incendio del Hogar", age: 55 },
        { t: 0.60, name: "Muerte de Cónyuge", age: 60 },
        { t: 0.68, name: "Estafa Financiera", age: 68 },
        { t: 0.72, name: "Caída Grave", age: 72 },
        { t: 0.80, name: "Demencia Senil", age: 80 },
        { t: 0.88, name: "Soledad Absoluta", age: 88 }
    ],
    dharmic: [ // Regalos / "Buen Karma"
        { t: 0.07, name: "Premio Escolar", age: 7 },
        { t: 0.16, name: "Descubrimiento de Talento", age: 16 },
        { t: 0.19, name: "Mentor Inspirador", age: 19 },
        { t: 0.24, name: "Beca Prestigiosa", age: 24 },
        { t: 0.29, name: "Oportunidad de Negocio", age: 29 },
        { t: 0.33, name: "Éxito Viral / Fama", age: 33 },
        { t: 0.40, name: "Premio de Lotería", age: 40 },
        { t: 0.46, name: "Obra Maestra Creada", age: 46 },
        { t: 0.50, name: "Curación Milagrosa", age: 50 },
        { t: 0.58, name: "Herencia Inesperada", age: 58 },
        { t: 0.62, name: "Reencuentro Emotivo", age: 62 },
        { t: 0.70, name: "Reconocimiento Mundial", age: 70 },
        { t: 0.78, name: "Bisnieto Conocido", age: 78 },
        { t: 0.85, name: "Lucidez Extraordinaria", age: 85 },
        { t: 0.92, name: "Paz Espiritual Profunda", age: 92 }
    ]
};

export class EventSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEvents = []; // Eventos de la vida actual
        this.lastProgress = 0;
        this.effectGroup = new THREE.Group();
        this.scene.add(this.effectGroup);
        this.activeEffects = [];
        this.onEvent = null;

        // Iniciar primera vida (Karma Neutro)
        this.generateLifeEvents(0);
    }

    generateLifeEvents(prevKarma) {
        // Use local fallback
        this._generateLocalEvents(prevKarma);
    }

    // Async version that tries API first
    async generateLifeEventsAsync(prevKarma) {
        if (EVENT_API_ENDPOINT) {
            try {
                console.log("Fetching life events from API...");
                const response = await fetch(EVENT_API_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ karma: prevKarma })
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const result = await response.json();
                console.log("Events received from API:", result.events.length);

                // Use API events
                this.activeEvents = result.events.map(e => ({ ...e, triggered: false }));
                this.activeEvents.sort((a, b) => a.t - b.t);

                console.log("Nueva Vida (API). Karma:", prevKarma.toFixed(2));
                console.log("Eventos:", this.activeEvents.map(e => `${e.name} (${e.age})`));
                return;
            } catch (error) {
                console.warn("API event generation failed, using fallback:", error.message);
            }
        }

        // Fallback to local generation
        this._generateLocalEvents(prevKarma);
    }

    _generateLocalEvents(prevKarma) {
        // 1. Siempre incluir Universales
        let newEvents = [...EVENT_POOL.universal];

        // 2. Configuración de Generación
        const targetEventCount = 25; // Aumentado para "meter los que más puedas"
        const minSpacing = 0.03; // Reducido a 3% (aprox 3 años) para permitir más densidad sin overlap excesivo

        // Intentos de generación
        for (let i = 0; i < 100; i++) { // Loop de seguridad aumentado
            if (newEvents.length >= targetEventCount) break;

            const r = Math.random();
            let type = 'standard';

            // Lógica de Karma (Probabilidades)
            if (prevKarma < -0.2) {
                // Vida previa en sombra -> Más pruebas
                if (r < 0.5) type = 'karmic';
                else if (r < 0.8) type = 'standard';
                else type = 'dharmic';
            } else if (prevKarma > 0.2) {
                // Vida previa en luz -> Más regalos
                if (r < 0.5) type = 'dharmic';
                else if (r < 0.8) type = 'standard';
                else type = 'karmic';
            } else {
                // Neutro
                if (r < 0.3) type = 'karmic';
                else if (r < 0.6) type = 'dharmic';
                else type = 'standard';
            }

            // Seleccionar evento candidato
            const pool = EVENT_POOL[type];
            const candidate = pool[Math.floor(Math.random() * pool.length)];

            // Validaciones Estrictas
            // 1. No duplicados
            const isDuplicate = newEvents.some(e => e.name === candidate.name);

            // 2. Espaciado Visual (Overlap Check)
            const isTooClose = newEvents.some(e => Math.abs(e.t - candidate.t) < minSpacing);

            if (!isDuplicate && !isTooClose) {
                newEvents.push({ ...candidate, triggered: false });
            }
        }

        // Ordenar por tiempo
        newEvents.sort((a, b) => a.t - b.t);
        this.activeEvents = newEvents;

        console.log("Nueva Vida (Local). Karma:", prevKarma.toFixed(2));
        console.log("Eventos:", this.activeEvents.map(e => `${e.name} (${e.age})`));
    }

    checkEvents(progress, consciousness) {
        if (progress < this.lastProgress) {
            // Reset loop detectado externamente, pero aquí solo reseteamos triggers
            this.activeEvents.forEach(e => e.triggered = false);
        }

        this.activeEvents.forEach(event => {
            if (!event.triggered && progress >= event.t && this.lastProgress < event.t) {
                this.triggerEvent(event, consciousness);
                event.triggered = true;
            }
        });

        this.lastProgress = progress;
        this.updateEffects();
    }

    triggerEvent(event, consciousness) {
        let message = "";
        let color = "";

        if (consciousness > 0.3) {
            message = `✨ ${event.name}: Transmutado`;
            color = "#ffff00";
            this.createLightEffect();
        } else if (consciousness < -0.3) {
            message = `💀 ${event.name}: Caída`;
            color = "#ff0000";
            this.createShadowEffect();
        } else {
            message = `⚖️ ${event.name}: Vivido`;
            color = "#ffffff";
            this.createNeutralEffect();
        }

        if (this.onEvent) {
            this.onEvent({
                name: event.name,
                t: event.t,
                consciousness: consciousness,
                color: color,
                age: event.age
            });
        }

        this.showToast(message, color);
    }

    showToast(message, color) {
        const toast = document.createElement('div');
        toast.innerText = message;
        toast.style.color = color;
        toast.style.fontSize = '20px';
        toast.style.fontWeight = 'bold';
        toast.style.textShadow = '0 0 5px ' + color;
        toast.style.marginTop = '10px';
        toast.style.opacity = '1';
        toast.style.transition = 'opacity 2s';

        const container = document.getElementById('main-ui'); // Usar main-ui
        if (container) {
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2000);
            }, 3000);
        }
    }

    createLightEffect() {
        const flash = new THREE.PointLight(0xffff00, 5, 50);
        this.effectGroup.add(flash);
        this.activeEffects.push({ light: flash, age: 0 });
    }

    createShadowEffect() {
        const flash = new THREE.PointLight(0xff0000, 5, 50);
        this.effectGroup.add(flash);
        this.activeEffects.push({ light: flash, age: 0 });
    }

    createNeutralEffect() {
        const flash = new THREE.PointLight(0xffffff, 2, 50);
        this.effectGroup.add(flash);
        this.activeEffects.push({ light: flash, age: 0 });
    }

    updateEffects() {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.age += 0.05;
            effect.light.intensity = Math.max(0, 5 - effect.age * 5);
            if (effect.age > 1) {
                this.effectGroup.remove(effect.light);
                this.activeEffects.splice(i, 1);
            }
        }
    }
}
