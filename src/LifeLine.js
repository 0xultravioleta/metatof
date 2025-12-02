import * as THREE from 'three';

export class LifeLine {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.highPath = null;
        this.neutralPath = null;
        this.lowPath = null;

        this.init();
    }

    init() {
        const length = 200;
        const segments = 200;

        // Crear 3 caminos visuales (Alta, Media, Baja Conciencia)
        // Colores Espectrales: Ultravioleta (Luz) vs Terracota (Tierra/Denso)
        this.highPath = this.createPath(length, segments, 1, 0x9900ff); // Ultravioleta
        this.neutralPath = this.createPath(length, segments, 0, 0xffffff); // Blanco/Gris
        this.lowPath = this.createPath(length, segments, -1, 0xcc4400); // Terracota
    }

    createPath(length, segments, type, colorHex) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const z = -t * length; // Avanzar hacia el fondo (Z negativo)

            let y = 0;
            if (type === 1) {
                // Alta conciencia: Sube
                y = Math.sin(t * Math.PI) * 2 + t * 10;
            } else if (type === -1) {
                // Baja conciencia: Baja
                y = -Math.sin(t * Math.PI) * 2 - t * 10;
            } else {
                // Neutra: Recta
                y = 0;
            }

            points.push(new THREE.Vector3(0, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.1, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 1.0, // Opaco para mejor visibilidad
            wireframe: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false; // Oculto por defecto
        this.group.add(mesh);

        return { curve, mesh, material };
    }

    getPointAt(t, consciousness) {
        // Retornar punto de la curva ACTIVA (sin interpolación)
        if (consciousness > 0) {
            return this.highPath.curve.getPointAt(t);
        } else if (consciousness < 0) {
            return this.lowPath.curve.getPointAt(t);
        } else {
            return this.neutralPath.curve.getPointAt(t);
        }
    }

    getTangentAt(t) {
        // Tangente aproximada (usando la neutra por simplicidad de dirección general)
        return this.neutralPath.curve.getTangentAt(t);
    }

    update(consciousness) {
        // Mostrar SOLO la línea activa
        this.highPath.mesh.visible = false;
        this.lowPath.mesh.visible = false;
        this.neutralPath.mesh.visible = false;

        if (consciousness > 0) {
            this.highPath.mesh.visible = true;
        } else if (consciousness < 0) {
            this.lowPath.mesh.visible = true;
        } else {
            this.neutralPath.mesh.visible = true;
        }
    }
}
