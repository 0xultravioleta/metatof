import * as THREE from 'three';
import { TreeVessel } from './TreeVessel.js';
import { LifeLine } from './LifeLine.js';
import { VesicaPiscis } from './VesicaPiscis.js';
import { ConsciousnessController } from './ConsciousnessController.js';
import { EventSystem } from './EventSystem.js';

// Configuración básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005); // Fondo cósmico oscuro
scene.fog = new THREE.FogExp2(0x000005, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejor color
document.body.appendChild(renderer.domElement);

// Fondo de Galaxia (Partículas)
const starGeo = new THREE.BufferGeometry();
const starCount = 5000;
const posArray = new Float32Array(starCount * 3);
const colorArray = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
  posArray[i] = (Math.random() - 0.5) * 400; // X
  posArray[i + 1] = (Math.random() - 0.5) * 400; // Y
  posArray[i + 2] = (Math.random() - 0.5) * 400 - 100; // Z (Profundidad)

  // Colores galácticos (Azul, Violeta, Rosa)
  const colorType = Math.random();
  if (colorType < 0.33) {
    colorArray[i] = 0.5; colorArray[i + 1] = 0.5; colorArray[i + 2] = 1.0; // Azul
  } else if (colorType < 0.66) {
    colorArray[i] = 1.0; colorArray[i + 1] = 0.0; colorArray[i + 2] = 1.0; // Magenta
  } else {
    colorArray[i] = 1.0; colorArray[i + 1] = 1.0; colorArray[i + 2] = 1.0; // Blanco
  }
}

starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
const starMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8 });
const starMesh = new THREE.Points(starGeo, starMat);
scene.add(starMesh);
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
uiDiv.style.position = 'absolute';
uiDiv.style.top = '20px';
uiDiv.style.left = '20px';
uiDiv.style.color = 'white';
uiDiv.style.fontFamily = 'monospace';
uiDiv.innerHTML = `
    <h1>Árbol de la Vida - Nave de Conciencia</h1>
    <p>Conciencia: <span id="cons-val">0.0</span></p>
    <p>Controles: Flecha Arriba (Luz) / Abajo (Sombra)</p>
`;
document.body.appendChild(uiDiv);
const consValSpan = document.getElementById('cons-val');

// Loop de animación
function animate() {
  requestAnimationFrame(animate);

  time += 0.01;

  // Actualizar controlador
  consciousnessController.update();
  const consciousness = consciousnessController.getValue();

  // Actualizar UI
  consValSpan.innerText = consciousness.toFixed(2);
  consValSpan.style.color = consciousness > 0 ? '#ffff00' : (consciousness < 0 ? '#ff0000' : '#ffffff');

  // Mover cámara a lo largo de la línea
  progress += speed;
  if (progress > 1) progress = 0;

  // Posición base en la línea (siempre centro/neutro para la referencia física de la línea)
  // La "línea" que vemos es la estructura física.
  // Pero visualmente queremos que el nodo activo esté "sobre" la línea correspondiente.
  // El usuario dijo: "la sephirota actual es la que navega en ese momento por la LINEA".

  // Obtenemos el punto en la curva interpolada según la conciencia actual
  // Esto hace que subamos a la línea Verde o bajemos a la Roja físicamente
  const position = lifeLine.getPointAt(progress, consciousness);
  const tangent = lifeLine.getTangentAt(progress);

  // Obtener la posición local del nodo activo dentro del árbol
  const activeNodePos = new THREE.Vector3(...treeVessel.getActiveNodePosition(consciousness));

  // Compensar la rotación del árbol
  // El árbol rota en Y, así que debemos rotar el vector de posición local del nodo
  activeNodePos.applyAxisAngle(new THREE.Vector3(0, 1, 0), treeVessel.group.rotation.y);

  // Mover el Árbol-Nave
  // Queremos que (TreePos + RotatedActiveNodePos) = LinePos
  // Por tanto: TreePos = LinePos - RotatedActiveNodePos

  const treePos = position.clone();
  treePos.sub(activeNodePos); // Restar vector rotado completo (X, Y, Z)

  // Mantenemos Z alineado con la curva?
  // Si restamos Z, el árbol se moverá adelante/atrás para que el nodo coincida en Z.
  // Esto es correcto si queremos que el nodo esté EXACTAMENTE en el punto de la curva.

  treeVessel.group.position.copy(treePos);

  // Orientar el árbol hacia adelante
  // Miramos un punto futuro en la MISMA trayectoria interpolada
  const lookAtPos = lifeLine.getPointAt(Math.min(1, progress + 0.01), consciousness);
  // Ajustar lookAt para que el árbol no se incline locamente, solo rote en Y
  treeVessel.group.lookAt(lookAtPos.x, treeVessel.group.position.y, lookAtPos.z);
  // Rotación sutil basada en movimiento
  // treeVessel.group.rotation.z = -consciousness * 0.5; // ELIMINADO para evitar torcedura
  treeVessel.group.rotation.x = Math.sin(time) * 0.1;

  // Cámara en 1ra/3ra persona
  // Debe estar alineada con la línea (Y=0 aprox) mirando adelante
  // "First person... ruta que deberia manejar un plano"

  const camPos = position.clone();
  camPos.y += 2; // Un poco arriba de la línea para verla
  camPos.z += 10; // Detrás
  // Ajustar con tangente
  const backOffset = tangent.clone().multiplyScalar(-8);
  camPos.add(backOffset);

  camera.position.lerp(camPos, 0.1);
  camera.lookAt(position.clone().add(tangent.clone().multiplyScalar(20))); // Mirar lejos adelante

  // Actualizar componentes
  vesica.update(time);
  treeVessel.update(consciousness);
  lifeLine.update(consciousness);
  eventSystem.checkEvents(progress, consciousness);

  updateDimensionUI(consciousness);

  // Animar fondo
  starMesh.rotation.z += 0.0005;

  renderer.render(scene, camera);
}

// Manejo de resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
