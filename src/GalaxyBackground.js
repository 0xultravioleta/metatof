import * as THREE from 'three';

export class GalaxyBackground {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.uniforms = {
            time: { value: 0 }
        };
        this.init();
        this.scene.add(this.group);
    }

    init() {
        this.initStars();
        this.initNebulaParticles();
    }

    initStars() {
        const starCount = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const colors = new Float32Array(starCount * 3);

        const colorPalette = [
            new THREE.Color(0xffffff), // Blanco
            new THREE.Color(0xaaccff), // Azulado
            new THREE.Color(0xffccaa)  // Amarillento
        ];

        for (let i = 0; i < starCount; i++) {
            // Distribución esférica lejana
            const r = 800 + Math.random() * 800;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = Math.random() * 2.0;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Shader de Estrellas (Twinkle)
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                uniform float time;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vColor;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    if(length(coord) > 0.5) discard;
                    
                    // Efecto de parpadeo
                    float twinkle = sin(time * 3.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) * 0.5 + 0.5;
                    gl_FragColor = vec4(vColor * (0.5 + 0.5 * twinkle), 1.0);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(geometry, material);
        this.group.add(stars);
    }

    initNebulaParticles() {
        // Nube de partículas para la Nebulosa
        const particleCount = 20000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const galaxyColors = [
            new THREE.Color(0x4400cc), // Violeta
            new THREE.Color(0x0044aa), // Azul
            new THREE.Color(0xcc0044)  // Magenta
        ];

        for (let i = 0; i < particleCount; i++) {
            // Posición aleatoria en volumen
            const x = (Math.random() - 0.5) * 600;
            const y = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600 - 100;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
            // Variación de color
            colors[i * 3] = color.r + (Math.random() - 0.5) * 0.1;
            colors[i * 3 + 1] = color.g + (Math.random() - 0.5) * 0.1;
            colors[i * 3 + 2] = color.b + (Math.random() - 0.5) * 0.1;

            sizes[i] = Math.random() * 4.0 + 1.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Shader de Nebulosa (Suave)
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if(dist > 0.5) discard;
                    
                    // Borde suave
                    float alpha = 1.0 - (dist * 2.0);
                    alpha = pow(alpha, 1.5);
                    
                    gl_FragColor = vec4(vColor, alpha * 0.4);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Points(geometry, material);
        this.group.add(nebula);
    }

    update(time) {
        this.uniforms.time.value = time;
        this.group.rotation.y = time * 0.01; // Rotación lenta global
    }
}
