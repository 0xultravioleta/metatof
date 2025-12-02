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
        this.neutralPath.material.opacity = 0.3; // Más visible (antes 0.1)
        this.neutralPath.material.emissiveIntensity = 0.5; // Más brillo (antes 0.2)

        // 3. Camino Sombra (Low) - Standard Material (Mejor integración con Bloom)
        // Usamos depthTest false para que se vea siempre (X-Ray) pero con shading bonito
        this.lowPath = this.createPath(length, segments, -1, 0xffaa00, 'standard');
        this.lowPath.material.emissiveIntensity = 3.0; // Brillante pero no cegador
        this.lowPath.material.depthTest = false; // Siempre visible
        this.lowPath.material.depthWrite = false;
        this.lowPath.mesh.renderOrder = 9999; // Dibujar al final
    }

    createPath(length, segments, type, colorHex, matType) {
        let points = [];

        if (type === 1) {
            // High Path (Sefirot Central Column): Maljut(2) -> Yesod(4) -> Tiferet(8) -> Keter(14)
            // Distribuimos los puntos a lo largo de Z
            points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 2, -length * 0.2),
                new THREE.Vector3(0, 4, -length * 0.4),
                new THREE.Vector3(0, 8, -length * 0.7),
                new THREE.Vector3(0, 14, -length)
            ];
        } else if (type === -1) {
            // Low Path (Qliphoth Central Column): Lilith(-2) -> Gamaliel(-4) -> Thagirion(-8) -> Thaumiel(-14)
            points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, -2, -length * 0.2),
                new THREE.Vector3(0, -4, -length * 0.4),
                new THREE.Vector3(0, -8, -length * 0.7),
                new THREE.Vector3(0, -14, -length)
            ];
        } else {
            // Neutral Path (Straight)
            points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -length)
            ];
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

        if (Math.abs(consciousness) < 0.05) {
            // --- ZONA VESICA ---
            this.neutralPath.mesh.visible = true;
            this.neutralPath.material.opacity = 0.3; // Más visible
            this.neutralPath.material.emissiveIntensity = 0.5;
        } else if (consciousness > 0) {
            // --- ZONA LUZ ---
            this.highPath.mesh.visible = true;
            this.highPath.material.emissiveIntensity = 1.2; // Brillo reducido (antes 1.5)
        } else {
            // --- ZONA SOMBRA ---
            this.lowPath.mesh.visible = true;
            this.lowPath.material.emissiveIntensity = 2.0; // Brillo reducido (antes 3.0)
            this.lowPath.material.emissive.setHex(0xffaa00);
        }
    }
}
