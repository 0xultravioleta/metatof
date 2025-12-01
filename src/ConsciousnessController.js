export class ConsciousnessController {
    constructor() {
        this.value = 0.0; // -1.0 a 1.0
        this.step = 0.1;
        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                this.changeValue(this.step);
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.changeValue(-this.step);
            }
        });
    }

    changeValue(delta) {
        // Actualizar valor con precisión de 1 decimal para evitar errores de punto flotante
        let newValue = this.value + delta;
        newValue = Math.round(newValue * 10) / 10;

        // Clampear entre -1.0 y 1.0
        this.value = Math.max(-1.0, Math.min(1.0, newValue));

        console.log(`Conciencia: ${this.value}`);
    }

    update() {
        // Ya no necesitamos interpolación si queremos pasos inmediatos ("hit")
        // Pero si queremos suavidad visual, podemos interpolar un valor de visualización separado.
        // Por ahora, retornamos el valor directo.
    }

    getValue() {
        return this.value;
    }
}
