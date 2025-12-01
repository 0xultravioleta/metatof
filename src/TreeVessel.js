import * as THREE from 'three';

// Colores Neón Vibrantes
// Ajuste de posiciones: Desplazamiento vertical (+4) para separar de Qliphoth y dejar espacio a la Vesica
const SEFIROT_DATA = [
    { name: "Kéter", meaning: "Corona", color: 0xffffff, position: [0, 14, 0] },
    { name: "Jojmá", meaning: "Sabiduría", color: 0x00ffff, position: [3, 12, 0] },
    { name: "Biná", meaning: "Entendimiento", color: 0x111111, position: [-3, 12, 0], outline: 0xffffff },
    { name: "Jesed", meaning: "Misericordia", color: 0x0000ff, position: [3, 10, 0] },
    { name: "Gevurá", meaning: "Rigor", color: 0xff0000, position: [-3, 10, 0] },
    { name: "Tiféret", meaning: "Belleza", color: 0xffff00, position: [0, 8, 0] },
    { name: "Netsaj", meaning: "Victoria", color: 0x00ff00, position: [3, 6, 0] },
    { name: "Hod", meaning: "Gloria", color: 0xffa500, position: [-3, 6, 0] },
    { name: "Yesod", meaning: "Fundamento", color: 0x9932cc, position: [0, 4, 0] },
    { name: "Maljut", meaning: "Reino", color: 0x8b4513, position: [0, 2, 0] }
];

const QLIPHOTH_DATA = [
    { name: "Thaumiel", meaning: "Gemelos de Dios", color: 0x333333, position: [0, -14, 0], outline: 0x550000 },
    { name: "Ghagiel", meaning: "El Estorbo", color: 0x444444, position: [3, -12, 0], outline: 0x550000 },
    { name: "Satariel", meaning: "El Ocultador", color: 0x111111, position: [-3, -12, 0], outline: 0x555555 },
    { name: "Gha'agsheblah", meaning: "El Devorador", color: 0x000066, position: [3, -10, 0], outline: 0x0000aa },
    { name: "Golachab", meaning: "El Quemador", color: 0x660000, position: [-3, -10, 0], outline: 0xff0000 },
    { name: "Thagirion", meaning: "Los Disputadores", color: 0x666600, position: [0, -8, 0], outline: 0xffff00 },
    { name: "A'arab Zaraq", meaning: "Cuervos de la Muerte", color: 0x004400, position: [3, -6, 0], outline: 0x00ff00 },
    { name: "Samael", meaning: "Veneno de Dios", color: 0x442200, position: [-3, -6, 0], outline: 0xffaa00 },
    { name: "Gamaliel", meaning: "Los Obscenos", color: 0x330033, position: [0, -4, 0], outline: 0xff00ff },
    { name: "Lilith", meaning: "Reina de la Noche", color: 0x221100, position: [0, -2, 0], outline: 0x884400 }
];

// Las 22 Conexiones Canónicas del Árbol de la Vida
const CONNECTIONS = [
    // Horizontales
    [1, 2], // Jojma-Binah
    [3, 4], // Jesed-Gevura
    [6, 7], // Netsaj-Hod

    // Verticales (Pilares)
    [0, 5], // Keter-Tiferet (Pilar Medio)
    [5, 8], // Tiferet-Yesod (Pilar Medio)
    [8, 9], // Yesod-Maljut (Pilar Medio)
    [1, 3], // Jojma-Jesed (Pilar Derecho)
    [3, 6], // Jesed-Netsaj (Pilar Derecho)
    [2, 4], // Binah-Gevura (Pilar Izquierdo)
    [4, 7], // Gevura-Hod (Pilar Izquierdo)
    [6, 9], // Netsaj-Maljut (Derecho inferior)
    [7, 9], // Hod-Maljut (Izquierdo inferior)

    // Diagonales
    [0, 1], [0, 2], // Keter a Jojma/Binah
    [1, 5], [2, 5], // Jojma/Binah a Tiferet
    [3, 5], [4, 5], // Jesed/Gevura a Tiferet
    [5, 6], [5, 7], // Tiferet a Netsaj/Hod
    [6, 8], [7, 8]  // Netsaj/Hod a Yesod
];

export class TreeVessel {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.sefirotMeshes = [];
        this.qliphothMeshes = [];
        this.init();
    }

    init() {
        const geometry = new THREE.SphereGeometry(0.6, 32, 32);

        // Crear Sefirot
        SEFIROT_DATA.forEach(data => {
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.8,
                roughness: 0.2,
                metalness: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...data.position);

            if (data.outline) {
                const outlineGeo = new THREE.SphereGeometry(0.65, 32, 32);
                const outlineMat = new THREE.MeshBasicMaterial({ color: data.outline, side: THREE.BackSide });
                const outline = new THREE.Mesh(outlineGeo, outlineMat);
                mesh.add(outline);
            }

            mesh.userData = { ...data, type: 'sefira', originalPos: new THREE.Vector3(...data.position) };
            this.group.add(mesh);
            this.sefirotMeshes.push(mesh);
        });

        // Crear Qliphoth
        QLIPHOTH_DATA.forEach((data, index) => {
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.8,
                metalness: 0.2,
                emissive: data.color,
                emissiveIntensity: 0.4
            });
            const mesh = new THREE.Mesh(geometry, material);
            const sefiraPos = SEFIROT_DATA[index].position;
            // Reflejo exacto hacia abajo
            const pos = new THREE.Vector3(sefiraPos[0], -sefiraPos[1], sefiraPos[2]);
            mesh.position.copy(pos);

            if (data.outline) {
                const outlineGeo = new THREE.SphereGeometry(0.65, 32, 32);
                const outlineMat = new THREE.MeshBasicMaterial({ color: data.outline, side: THREE.BackSide, transparent: true, opacity: 0.5 });
                const outline = new THREE.Mesh(outlineGeo, outlineMat);
                mesh.add(outline);
            }

            mesh.userData = { ...data, type: 'qlipha', originalPos: pos };
            this.group.add(mesh);
            this.qliphothMeshes.push(mesh);
        });

        this.drawConnections();
        this.scene.add(this.group);
    }

    drawConnections() {
        const sefiraMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
        const qliphaMat = new THREE.MeshBasicMaterial({ color: 0x880000, transparent: true, opacity: 0.4 });

        CONNECTIONS.forEach(([i1, i2]) => {
            // Sefirot
            this.createCylinder(
                new THREE.Vector3(...SEFIROT_DATA[i1].position),
                new THREE.Vector3(...SEFIROT_DATA[i2].position),
                sefiraMat
            );

            // Qliphoth
            const p1 = new THREE.Vector3(...SEFIROT_DATA[i1].position);
            const p2 = new THREE.Vector3(...SEFIROT_DATA[i2].position);
            this.createCylinder(
                new THREE.Vector3(p1.x, -p1.y, p1.z),
                new THREE.Vector3(p2.x, -p2.y, p2.z),
                qliphaMat
            );
        });
    }

    createCylinder(pointX, pointY, material) {
        const direction = new THREE.Vector3().subVectors(pointY, pointX);
        const orientation = new THREE.Matrix4();
        orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
        orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
            0, 0, 1, 0,
            0, -1, 0, 0,
            0, 0, 0, 1));

        const edgeGeometry = new THREE.CylinderGeometry(0.1, 0.1, direction.length(), 8, 1);
        const edge = new THREE.Mesh(edgeGeometry, material);
        edge.applyMatrix4(orientation);

        edge.position.x = (pointX.x + pointY.x) / 2;
        edge.position.y = (pointX.y + pointY.y) / 2;
        edge.position.z = (pointX.z + pointY.z) / 2;

        this.group.add(edge);
    }

    update(consciousness) {
        this.group.rotation.y += 0.002;

        this.sefirotMeshes.forEach(mesh => {
            const pulse = Math.sin(Date.now() * 0.002) * 0.2 + 1;
            mesh.scale.setScalar(pulse * (0.8 + Math.max(0, consciousness) * 0.2));
            mesh.material.emissiveIntensity = 0.8 + Math.max(0, consciousness);
        });

        this.qliphothMeshes.forEach(mesh => {
            if (consciousness < -0.3) {
                // Glitch visual: Vibrar alrededor de la posición original
                const noiseX = (Math.random() - 0.5) * 0.2;
                const noiseY = (Math.random() - 0.5) * 0.2;

                mesh.position.copy(mesh.userData.originalPos); // Reset
                mesh.position.x += noiseX;
                mesh.position.y += noiseY;
            } else {
                // Asegurar que vuelvan a su sitio si sube la conciencia
                mesh.position.copy(mesh.userData.originalPos);
            }
        });
    }

    getActiveNodePosition(consciousness) {
        if (consciousness > 0) {
            const index = Math.round(10 - (consciousness * 10));
            const safeIndex = Math.max(0, Math.min(9, index));
            return SEFIROT_DATA[safeIndex].position;
        } else if (consciousness < 0) {
            const absCons = Math.abs(consciousness);
            const index = Math.round(10 - (absCons * 10));
            const safeIndex = Math.max(0, Math.min(9, index));
            const sefiraPos = SEFIROT_DATA[safeIndex].position;
            return [sefiraPos[0], -sefiraPos[1], sefiraPos[2]];
        } else {
            return [0, 0, 0];
        }
    }

    getActiveNodeData(consciousness) {
        if (consciousness > 0) {
            const index = Math.round(10 - (consciousness * 10));
            const safeIndex = Math.max(0, Math.min(9, index));
            return SEFIROT_DATA[safeIndex];
        } else if (consciousness < 0) {
            const absCons = Math.abs(consciousness);
            const index = Math.round(10 - (absCons * 10));
            const safeIndex = Math.max(0, Math.min(9, index));
            return QLIPHOTH_DATA[safeIndex];
        } else {
            return null; // Vesica
        }
    }
}
