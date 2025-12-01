import * as THREE from 'three';

export class VesicaPiscis {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        // Vesica Piscis: La intersección de dos discos/esferas
        // Ajustado para encajar entre Malchut (Y=2) y Lilith (Y=-2) sin tocar
        // Espacio disponible aprox: -1.4 a 1.4

        const radius = 1.0; // Reducido para que quepa
        const tube = 0.04;
        const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);

        // Material brillante y sagrado
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700, // Dorado
            emissive: 0xffffff,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });

        // Círculo Superior
        const circle1 = new THREE.Mesh(geometry, material);
        circle1.position.y = 0.5; // Centro ajustado
        this.group.add(circle1);

        // Círculo Inferior
        const circle2 = new THREE.Mesh(geometry, material);
        circle2.position.y = -0.5; // Centro ajustado
        this.group.add(circle2);

        // Núcleo brillante en el centro (La Almendra / Mandorla)
        const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(coreGeo, coreMat);
        // Escalar para que parezca la forma de la vesica (más pequeña ahora)
        core.scale.set(0.6, 0.9, 0.3);
        this.group.add(core);

        // Luz puntual en el centro
        const light = new THREE.PointLight(0xffffff, 1.5, 5);
        this.group.add(light);
    }

    update(time) {
        // Rotación ELIMINADA por petición del usuario
        // this.group.rotation.y = time * 0.2;

        // Pulsación suave se mantiene para dar "vida"
        const scale = 1 + Math.sin(time * 2) * 0.05;
        this.group.scale.setScalar(scale);
    }
}
