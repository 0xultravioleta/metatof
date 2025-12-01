import * as THREE from 'three';

export class GalaxyBackground {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.init();
        this.scene.add(this.group);
    }

    init() {
        // 1. Textura de Nube Procedural (para nebulosa)
        const cloudTexture = this.createCloudTexture();
        const cloudMaterial = new THREE.SpriteMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.3,
            depthWrite: false, // Importante para que se mezclen bien
            blending: THREE.AdditiveBlending
        });

        // 2. Crear Nebulosa (Sprites grandes)
        const nebulaCount = 60;
        const range = 400; // Espacio amplio

        for (let i = 0; i < nebulaCount; i++) {
            const sprite = new THREE.Sprite(cloudMaterial.clone());

            // Posición aleatoria
            sprite.position.set(
                (Math.random() - 0.5) * range,
                (Math.random() - 0.5) * range,
                (Math.random() - 0.5) * range - 100 // Un poco hacia el fondo
            );

            // Escala aleatoria (nubes grandes)
            const scale = Math.random() * 100 + 50;
            sprite.scale.set(scale, scale, 1);

            // Color aleatorio (Paleta Galáctica)
            // Azul oscuro, Violeta, Magenta
            const colorType = Math.random();
            if (colorType < 0.33) {
                sprite.material.color.setHex(0x000066); // Azul profundo
            } else if (colorType < 0.66) {
                sprite.material.color.setHex(0x330066); // Violeta
            } else {
                sprite.material.color.setHex(0x660033); // Magenta oscuro
            }

            // Rotación aleatoria (Sprite rota con cámara, pero podemos variar opacidad/color)
            sprite.material.rotation = Math.random() * Math.PI;

            this.group.add(sprite);
        }

        // 3. Campo de Estrellas (Puntos distantes)
        const starGeo = new THREE.BufferGeometry();
        const starCount = 15000;
        const posArray = new Float32Array(starCount * 3);
        const colorArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            // Distribución esférica o cúbica muy amplia
            const r = 500 + Math.random() * 500; // Lejos del centro
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            posArray[i] = r * Math.sin(phi) * Math.cos(theta);
            posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            posArray[i + 2] = r * Math.cos(phi);

            // Color estrella (Blanco, Azul claro, Amarillo claro)
            const starType = Math.random();
            if (starType > 0.9) {
                colorArray[i] = 0.8; colorArray[i + 1] = 0.8; colorArray[i + 2] = 1.0; // Azulado
            } else if (starType > 0.8) {
                colorArray[i] = 1.0; colorArray[i + 1] = 0.9; colorArray[i + 2] = 0.6; // Amarillento
            } else {
                colorArray[i] = 1.0; colorArray[i + 1] = 1.0; colorArray[i + 2] = 1.0; // Blanco
            }
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const starMesh = new THREE.Points(starGeo, starMat);
        this.group.add(starMesh);
    }

    createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');

        // Gradiente radial: Blanco en centro -> Transparente en bordes
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    update(time) {
        // Rotación MUY lenta de todo el fondo para dar dinamismo imperceptible
        this.group.rotation.y = time * 0.02;
    }
}
