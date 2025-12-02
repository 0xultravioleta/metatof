import * as THREE from 'three';
import { TreeVessel } from './TreeVessel.js';
import { LifeLine } from './LifeLine.js';
import { VesicaPiscis } from './VesicaPiscis.js';
import { ConsciousnessController } from './ConsciousnessController.js';
import { EventSystem } from './EventSystem.js';
import { GalaxyBackground } from './GalaxyBackground.js';
import { Minimap } from './Minimap.js';

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

// Conectar EventSystem con Minimapa
eventSystem.onEvent = (data) => {
  minimap.registerEvent(data);
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
const speed = 0.0005; // Velocidad de avance

// UI Overlay
const uiDiv = document.createElement('div');
uiDiv.id = 'main-ui'; // ID para CSS
uiDiv.innerHTML = `
    <h1>Árbol de la Vida</h1>
    <p>Conciencia: <span id="cons-val">0.0</span></p>
    <p class="desktop-hint">Teclado: ↑ Luz / ↓ Sombra</p>
`;
document.body.appendChild(uiDiv);

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
  progress += speed;
  if (progress > 1) progress = 0;

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
  const lookAtPos = lifeLine.getPointAt(Math.min(1, progress + 0.01), consciousness);
  const direction = new THREE.Vector3().subVectors(lookAtPos, position).normalize();
  const angleY = Math.atan2(direction.x, direction.z);

  treeVessel.group.rotation.set(0, angleY, 0); // Solo rotación Y, árbol vertical

  // Rotación X eliminada ("no tiene por que rotar")
  // treeVessel.group.rotation.x = Math.sin(seconds) * 0.1;

  // Cámara en 1ra/3ra persona
  const camPos = position.clone();
  camPos.y += 3; // Un poco más arriba
  camPos.z += 25; // MUCHO más atrás (Zoom out solicitado)

  const backOffset = tangent.clone().multiplyScalar(-15); // Más distancia hacia atrás en la curva
  camPos.add(backOffset);

  camera.position.lerp(camPos, 0.1);
  camera.lookAt(position.clone().add(tangent.clone().multiplyScalar(20)));

  // Actualizar componentes
  vesica.update(seconds);
  treeVessel.update(seconds, consciousness);
  lifeLine.update(consciousness);
  eventSystem.checkEvents(progress, consciousness);
  minimap.update(progress, consciousness);

  updateDimensionUI(consciousness);

  // Animar fondo
  galaxy.update(seconds);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
// Manejo de resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
