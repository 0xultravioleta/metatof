import * as THREE from 'three';
import { TreeVessel } from './TreeVessel.js';
import { LifeLine } from './LifeLine.js';
import { VesicaPiscis } from './VesicaPiscis.js';
import { ConsciousnessController } from './ConsciousnessController.js';
import { EventSystem } from './EventSystem.js';
import { GalaxyBackground } from './GalaxyBackground.js';
import { Minimap } from './Minimap.js';
import { LifeStoryCollector } from './LifeStoryCollector.js';
import { StoryPanel } from './StoryPanel.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// API Configuration - Update this after deploying infrastructure
const LIFE_STORY_API_ENDPOINT = import.meta.env.VITE_LIFE_STORY_API || '';

// Configuración básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005); // Fondo cósmico oscuro
scene.fog = new THREE.FogExp2(0x000005, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejor color
document.body.appendChild(renderer.domElement);

// Fondo de Galaxia (Nuevo Componente)
const galaxy = new GalaxyBackground(scene);

// Configuración de Post-Procesado (Bloom / Glow)
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0; // Brillar todo lo que tenga luz
bloomPass.strength = 1.5; // Intensidad reducida (antes 2.5) para no cansar la vista
bloomPass.radius = 0.5; // Radio de dispersión

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(1, 1, 1);
scene.add(dirLight);

// Inicialización de componentes
const treeVessel = new TreeVessel(scene);
const vesica = new VesicaPiscis(scene);
// Vincular Vesica al Árbol para que viajen juntos
treeVessel.group.add(vesica.group);

const lifeLine = new LifeLine(scene);
const consciousnessController = new ConsciousnessController();
const eventSystem = new EventSystem(scene);
const minimap = new Minimap();

// Life Story Generation
const storyCollector = new LifeStoryCollector(LIFE_STORY_API_ENDPOINT);
const storyPanel = new StoryPanel();

// Callbacks for story generation
storyCollector.onStoryGenerated = (result) => {
  console.log("Story generated successfully");
  storyPanel.displayStory(result);
};

storyCollector.onError = (error) => {
  console.error("Story generation error:", error);
  storyPanel.showError(error.message);
};

// Conectar EventSystem con Minimapa y StoryCollector
eventSystem.onEvent = (data) => {
  minimap.registerEvent(data);
  storyCollector.recordEvent(data);
};

// UI para Info de Dimensión
const dimInfoDiv = document.createElement('div');
dimInfoDiv.id = 'dimension-info';
dimInfoDiv.style.position = 'absolute';
dimInfoDiv.style.top = '20px';
dimInfoDiv.style.left = '50%';
dimInfoDiv.style.transform = 'translateX(-50%)';
dimInfoDiv.style.color = '#fff';
dimInfoDiv.style.fontFamily = 'Arial, sans-serif';
dimInfoDiv.style.textAlign = 'center';
dimInfoDiv.style.textShadow = '0 0 10px #000';
dimInfoDiv.style.pointerEvents = 'none';
document.body.appendChild(dimInfoDiv);

function updateDimensionUI(consciousness) {
  let name = "", meaning = "", color = "#fff";

  if (Math.abs(consciousness) < 0.05) {
    name = "Vesica Piscis";
    meaning = "El Portal de la Unión";
    color = "#ffd700";
  } else {
    const data = treeVessel.getActiveNodeData(consciousness);
    if (data) {
      name = data.name;
      meaning = data.meaning;
      color = '#' + data.color.toString(16).padStart(6, '0');
    }
  }

  dimInfoDiv.innerHTML = `
        <h2 style="margin:0; font-size: 2em; color: ${color}">${name}</h2>
        <p style="margin:5px 0; font-size: 1.2em;">${meaning}</p>
        <small style="opacity: 0.8;">Nivel de Conciencia: ${consciousness.toFixed(1)}</small>
    `;
}

// Variables de estado
let time = 0;
let progress = 0; // Progreso a lo largo de la línea de vida (0 a 1)
const speed = 0.0002; // Velocidad aumentada un poco (antes 0.0001, orig 0.0005)
let reincarnationEnabled = false; // Control de loop

// UI Overlay
const uiDiv = document.createElement('div');
uiDiv.id = 'main-ui'; // ID para CSS
uiDiv.innerHTML = `
    <h1>Arbol de la Vida</h1>
    <p>Conciencia: <span id="cons-val">0.0</span></p>
    <p class="desktop-hint">Teclado: ↑ Luz / ↓ Sombra</p>
    <div style="margin-top: 10px;">
        <label style="font-size: 0.9em; cursor: pointer;">
            <input type="checkbox" id="reincarnation-toggle"> Reencarnacion (Loop)
        </label>
    </div>
`;
document.body.appendChild(uiDiv);

// Story panel toggle button (shows when API is configured)
if (LIFE_STORY_API_ENDPOINT) {
  const storyToggleBtn = document.createElement('button');
  storyToggleBtn.id = 'story-toggle';
  storyToggleBtn.textContent = 'Historia';
  storyToggleBtn.style.cssText = `
    position: fixed;
    top: 20px;
    left: 380px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    z-index: 150;
    transition: all 0.2s;
  `;
  storyToggleBtn.onmouseenter = () => storyToggleBtn.style.background = 'rgba(153, 0, 255, 0.5)';
  storyToggleBtn.onmouseleave = () => storyToggleBtn.style.background = 'rgba(0, 0, 0, 0.7)';
  storyToggleBtn.onclick = () => storyPanel.toggle();
  document.body.appendChild(storyToggleBtn);
}

// Event Listener para Reencarnación
document.getElementById('reincarnation-toggle').addEventListener('change', (e) => {
  reincarnationEnabled = e.target.checked;
});

// Controles Móviles (Botones)
const controlsDiv = document.createElement('div');
controlsDiv.className = 'controls-container';
controlsDiv.innerHTML = `
    <div class="control-btn" id="btn-up">▲</div>
    <div class="control-btn" id="btn-down">▼</div>
`;
document.body.appendChild(controlsDiv);

// Lógica de botones
document.getElementById('btn-up').addEventListener('click', (e) => {
  e.preventDefault();
  consciousnessController.changeValue(0.1);
});
document.getElementById('btn-down').addEventListener('click', (e) => {
  e.preventDefault();
  consciousnessController.changeValue(-0.1);
});
// Prevenir doble disparo en touch devices si es necesario, pero click suele bastar.
// Añadimos touchstart para respuesta más rápida
document.getElementById('btn-up').addEventListener('touchstart', (e) => {
  e.preventDefault(); // Evitar click fantasma
  consciousnessController.changeValue(0.1);
}, { passive: false });
document.getElementById('btn-down').addEventListener('touchstart', (e) => {
  e.preventDefault();
  consciousnessController.changeValue(-0.1);
}, { passive: false });
const consValSpan = document.getElementById('cons-val');

// Loop de animación
function animate(timestamp = 0) {
  const seconds = timestamp * 0.001;
  requestAnimationFrame(animate);

  // Actualizar controlador
  consciousnessController.update();
  const consciousness = consciousnessController.getValue();

  // Actualizar UI
  consValSpan.innerText = consciousness.toFixed(2);
  // Colores Espectrales: Ultravioleta vs Terracota
  consValSpan.style.color = consciousness > 0 ? '#9900ff' : (consciousness < 0 ? '#cc4400' : '#ffffff');

  // Mover cámara a lo largo de la línea
  if (progress < 1.0 || reincarnationEnabled) {
    progress += speed;
  }

  // Record consciousness for story generation
  storyCollector.record(progress, consciousness);

  if (progress >= 1.0) {
    if (reincarnationEnabled) {
      // REENCARNACIÓN: Calcular Karma y generar nueva vida

      // Generate story before resetting (if API is configured)
      if (LIFE_STORY_API_ENDPOINT && !storyCollector.isGenerating) {
        storyPanel.showLoading();
        storyCollector.generateStory();
      }

      // Calcular promedio de conciencia de la vida pasada usando el historial del minimapa
      let avgConsciousness = 0;
      if (minimap.history.length > 0) {
        const sum = minimap.history.reduce((acc, curr) => acc + curr.c, 0);
        avgConsciousness = sum / minimap.history.length;
      } else {
        avgConsciousness = consciousness; // Fallback
      }

      progress = 0;
      eventSystem.generateLifeEvents(avgConsciousness);

      minimap.history = []; // Limpiar rastro de vida anterior
      minimap.pastEvents = [];
      storyCollector.reset(); // Reset collector for new life
    } else {
      progress = 1.0; // Detener al final

      // Generate story when life ends (one-time, no reincarnation)
      if (LIFE_STORY_API_ENDPOINT && !storyCollector.isGenerating && storyCollector.history.length > 50) {
        storyPanel.showLoading();
        storyCollector.generateStory();
      }
    }
  }

  // Posición base en la línea
  const position = lifeLine.getPointAt(progress, consciousness);
  const tangent = lifeLine.getTangentAt(progress);

  // Obtener la posición local del nodo activo dentro del árbol
  const activeNodePos = new THREE.Vector3(...treeVessel.getActiveNodePosition(consciousness));

  // Compensar la rotación del árbol
  activeNodePos.applyAxisAngle(new THREE.Vector3(0, 1, 0), treeVessel.group.rotation.y);

  // Mover el Árbol-Nave
  const treePos = position.clone();
  treePos.sub(activeNodePos);
  treeVessel.group.position.copy(treePos);

  // Orientar el árbol hacia adelante (SOLO ROTACIÓN Y)
  // Evitamos lookAt completo para que no se incline (pitch/roll) y parezca "skewed"
  // Si estamos parados al final (progress=1), lookAtPos puede fallar si no manejamos el límite
  const lookAtT = Math.min(1, progress + 0.01);
  const lookAtPos = lifeLine.getPointAt(lookAtT, consciousness);

  // Si estamos al final exacto, usar la tangente anterior o mantener rotación
  if (progress < 1.0) {
    const direction = new THREE.Vector3().subVectors(lookAtPos, position).normalize();
    const angleY = Math.atan2(direction.x, direction.z);
    treeVessel.group.rotation.set(0, angleY, 0);
  }

  // Rotación X eliminada ("no tiene por que rotar")
  // treeVessel.group.rotation.x = Math.sin(seconds) * 0.1;

  // Cámara en 1ra/3ra persona
  // Cámara dinámica según conciencia
  let camY = 3;
  let camZ = 25;
  let backDist = 15;

  if (consciousness < 0) {
    // En la sombra (abajo), alejarse más para ver la estructura completa y la caída
    const factor = Math.abs(consciousness); // 0 a 1
    camY += factor * 10; // Subir más (hasta +13) para ver desde arriba
    camZ += factor * 30; // Alejar mucho más (hasta +55) para perspectiva amplia
    backDist += factor * 15; // Alejarse en la tangente (hasta 30)
  }

  const camPos = position.clone();
  camPos.y += camY;
  camPos.z += camZ;

  const backOffset = tangent.clone().multiplyScalar(-backDist);
  camPos.add(backOffset);

  camera.position.lerp(camPos, 0.1);
  camera.lookAt(position.clone().add(tangent.clone().multiplyScalar(20)));

  // Actualizar componentes
  vesica.update(seconds);
  treeVessel.update(seconds, consciousness);
  lifeLine.update(consciousness);
  eventSystem.checkEvents(progress, consciousness);

  // Pasar los eventos activos al minimapa para dibujar solo los de esta vida
  minimap.update(progress, consciousness, eventSystem.activeEvents);

  updateDimensionUI(consciousness);

  // Animar fondo
  galaxy.update(seconds);

  // Renderizar con Bloom
  composer.render();
}

requestAnimationFrame(animate);
// Manejo de resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
