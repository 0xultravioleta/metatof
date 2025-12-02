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

        // 1. Camino de Luz (High) - Standard Material para Bloom bonito
        this.highPath = this.createPath(length, segments, 1, 0x9900ff, 'standard');
        this.highPath.material.emissiveIntensity = 2.0;

        // 2. Camino Vesica (Neutral) - Standard pero muy sutil
        this.neutralPath = this.createPath(length, segments, 0, 0xffffff, 'standard');
        this.neutralPath.material.opacity = 0.1; // Muy transparente
        this.neutralPath.material.emissiveIntensity = 0.2; // Poco brillo

        // 3. Camino Sombra (Low) - Standard Material (Mejor integración con Bloom)
        // Usamos depthTest false para que se vea siempre (X-Ray) pero con shading bonito
        this.lowPath = this.createPath(length, segments, -1, 0xffaa00, 'standard');
        this.lowPath.material.emissiveIntensity = 3.0; // Brillante pero no cegador
        this.lowPath.material.depthTest = false; // Siempre visible
        this.lowPath.material.depthWrite = false;
        this.lowPath.mesh.renderOrder = 9999; // Dibujar al final
    }

    createPath(length, segments, type, colorHex, matType) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const z = -t * length;

            let y = 0;
            if (type === 1) {
                y = Math.sin(t * Math.PI) * 2 + t * 10;
            } else if (type === -1) {
                y = -Math.sin(t * Math.PI) * 2 - t * 10;
            } else {
                y = 0;
            }
            points.push(new THREE.Vector3(0, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.4, 8, false);

        let material;
        if (matType === 'basic') {
            material = new THREE.MeshBasicMaterial({
                color: colorHex,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: colorHex,
                emissiveIntensity: 2.0,
                transparent: true,
                opacity: 1.0,
                roughness: 0.4,
                metalness: 0.6,
                depthTest: true,
                depthWrite: false
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        mesh.frustumCulled = false; // Prevent culling issues
        this.group.add(mesh);

        return { curve, mesh, material, mesh }; // Return mesh property explicitly
    }

    getPointAt(t, consciousness) {
        if (consciousness > 0) return this.highPath.curve.getPointAt(t);
        if (consciousness < 0) return this.lowPath.curve.getPointAt(t);
        return this.neutralPath.curve.getPointAt(t);
    }

    getTangentAt(t) {
        return this.neutralPath.curve.getTangentAt(t);
    }

    update(consciousness) {
        // Ocultar todos
        this.highPath.mesh.visible = false;
        this.lowPath.mesh.visible = false;
        this.neutralPath.mesh.visible = false;

        if (Math.abs(consciousness) < 0.15) {
            // --- ZONA VESICA ---
            this.neutralPath.mesh.visible = true;
            this.neutralPath.material.opacity = 0.1; // Mantener sutil
            this.neutralPath.material.emissiveIntensity = 0.2;
        } else if (consciousness > 0) {
            // --- ZONA LUZ ---
            this.highPath.mesh.visible = true;
            this.highPath.material.emissiveIntensity = 1.5; // Brillo reducido
        } else {
            // --- ZONA SOMBRA ---
            this.lowPath.mesh.visible = true;
            this.lowPath.material.emissiveIntensity = 3.0;
            this.lowPath.material.emissive.setHex(0xffaa00);
        }
    }
}
