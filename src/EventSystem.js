import * as THREE from 'three';

export const EVENTS_DATA = [
    { t: 0.02, name: "Nacimiento", weight: 1.0 },
    { t: 0.05, name: "Primera Infancia", weight: 0.5 },
    { t: 0.08, name: "Escuela / Socialización", weight: 0.5 },
    { t: 0.11, name: "Primeras Amistades", weight: 0.6 },
    { t: 0.14, name: "Primer Amor", weight: 0.7 },
    { t: 0.17, name: "Adolescencia", weight: 0.8 },
    { t: 0.20, name: "Graduación", weight: 0.6 },
    { t: 0.23, name: "Primer Empleo", weight: 0.7 },
    { t: 0.26, name: "Independencia", weight: 0.8 },
    { t: 0.29, name: "Mudanza / Cambio", weight: 0.6 },
    { t: 0.32, name: "Pareja Estable", weight: 0.9 },
    { t: 0.35, name: "Paternidad / Maternidad", weight: 1.0 },
    { t: 0.38, name: "Duelo / Pérdida", weight: 1.0 },
    { t: 0.41, name: "Crisis de Salud", weight: 0.9 },
    { t: 0.44, name: "Crisis Económica", weight: 0.8 },
    { t: 0.47, name: "Ruptura / Divorcio", weight: 0.9 },
    { t: 0.50, name: "Crisis Existencial", weight: 0.7 },
    { t: 0.53, name: "Cambio de Rumbo", weight: 0.6 },
    { t: 0.56, name: "Éxito / Logros", weight: 0.8 },
    { t: 0.59, name: "Trauma / Golpe", weight: 1.0 },
    { t: 0.62, name: "Migración / Entorno", weight: 0.7 },
    { t: 0.65, name: "Crisis Mediana Edad", weight: 0.8 },
    { t: 0.68, name: "Jubilación / Retiro", weight: 0.7 },
    { t: 0.71, name: "Redefinición Identidad", weight: 0.9 },
    { t: 0.74, name: "Conexión Profunda", weight: 0.9 },
    { t: 0.77, name: "Misión de Vida", weight: 1.0 },
    { t: 0.80, name: "Decepción / Caída", weight: 0.8 },
    { t: 0.83, name: "Búsqueda Espiritual", weight: 0.9 },
    { t: 0.86, name: "Cambio de Círculo", weight: 0.6 },
    { t: 0.89, name: "Despertar Conciencia", weight: 0.8 },
    { t: 0.92, name: "Evento Externo", weight: 1.0 },
    { t: 0.95, name: "Vocación Real", weight: 0.9 },
    { t: 0.97, name: "Mentores / Guías", weight: 0.8 },
    { t: 0.99, name: "Muerte / Transición", weight: 1.0 }
];

export class EventSystem {
    constructor(scene, uiElement) {
        this.scene = scene;
        this.uiElement = uiElement; // Elemento DOM para mostrar mensajes
        this.events = EVENTS_DATA.map(e => ({ ...e, triggered: false }));
        this.lastProgress = 0;

        // Grupo para efectos visuales temporales
        this.effectGroup = new THREE.Group();
        this.scene.add(this.effectGroup);

        this.onEvent = null; // Callback para minimapa u otros
    }

    checkEvents(progress, consciousness) {
        // Detectar cruce de eventos
        // Asumimos avance positivo
        if (progress < this.lastProgress) {
            // Reset al reiniciar loop
            this.events.forEach(e => e.triggered = false);
        }

        this.events.forEach(event => {
            if (!event.triggered && progress >= event.t && this.lastProgress < event.t) {
                this.triggerEvent(event, consciousness);
                event.triggered = true;
            }
        });

        this.lastProgress = progress;

        // Actualizar efectos activos
        this.updateEffects();
    }

    triggerEvent(event, consciousness) {
        console.log(`Evento disparado: ${event.name} (Conciencia: ${consciousness.toFixed(2)})`);

        let message = "";
        let color = "";

        if (consciousness > 0.3) {
            // Alta Conciencia
            message = `✨ ${event.name}: Transmutado en Luz`;
            color = "#ffff00";
            this.createLightEffect();
        } else if (consciousness < -0.3) {
            // Baja Conciencia
            message = `💀 ${event.name}: Caída en Sombra`;
            color = "#ff0000";
            this.createShadowEffect();
        } else {
            // Neutro
            message = `⚖️ ${event.name}: Experiencia Equilibrada`;
            color = "#ffffff";
            this.createNeutralEffect();
            this.createNeutralEffect();
        }

        // Notificar listeners (Minimapa)
        if (this.onEvent) {
            this.onEvent({
                name: event.name,
                t: event.t,
                consciousness: consciousness,
                color: color
            });
        }

        // Mostrar en UI
        this.showToast(message, color);
    }

    showToast(message, color) {
        const toast = document.createElement('div');
        toast.innerText = message;
        toast.style.color = color;
        toast.style.fontSize = '24px';
        toast.style.fontWeight = 'bold';
        toast.style.textShadow = '0 0 10px ' + color;
        toast.style.marginTop = '10px';
        toast.style.opacity = '1';
        toast.style.transition = 'opacity 2s';

        // Añadir al contenedor UI (asumimos que uiElement es un contenedor)
        // Si uiElement es solo un span, mejor añadimos al body o a un contenedor específico
        const container = document.getElementById('event-container');
        if (container) {
            container.appendChild(toast);
            // Fade out
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => container.removeChild(toast), 2000);
            }, 3000);
        }
    }

    createLightEffect() {
        // Explosión de partículas doradas
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        for (let i = 0; i < 20; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            // Posición relativa a la cámara o al centro... 
            // Simplificación: Efecto en el origen (0,0,0) o frente a la cámara?
            // Mejor: Efecto "pantalla" o ambiental.
            // Por ahora, solo un flash ambiental
        }
        // Flash de luz ambiental
        const flash = new THREE.PointLight(0xffff00, 5, 50);
        this.effectGroup.add(flash);

        // Animar y remover
        const anim = { light: flash, age: 0 };
        this.activeEffects.push(anim);
    }

    createShadowEffect() {
        // Flash rojo/oscuro
        const flash = new THREE.PointLight(0xff0000, 5, 50);
        this.effectGroup.add(flash);
        const anim = { light: flash, age: 0 };
        this.activeEffects.push(anim);
    }

    createNeutralEffect() {
        const flash = new THREE.PointLight(0xffffff, 2, 50);
        this.effectGroup.add(flash);
        const anim = { light: flash, age: 0 };
        this.activeEffects.push(anim);
    }

    updateEffects() {
        if (!this.activeEffects) this.activeEffects = [];

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.age += 0.05;
            effect.light.intensity = Math.max(0, 5 - effect.age * 5); // Fade out rápido

            if (effect.age > 1) {
                this.effectGroup.remove(effect.light);
                this.activeEffects.splice(i, 1);
            }
        }
    }
}
