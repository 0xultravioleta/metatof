# Metatof - Árbol de la Vida 3D

Simulación 3D interactiva del Árbol de la Vida cabalístico. Navega entre los 10 Sefirot (luz) y 10 Qliphoth (sombra) modulando tu nivel de consciencia.

## Descripción

Experiencia contemplativa en WebGL que permite explorar el Árbol de la Vida y el Árbol de la Muerte como un viaje espiritual interactivo. El usuario modula su nivel de consciencia (-1.0 oscuridad a +1.0 luz) atravesando la Vesica Piscis central, experimentando 6 eventos vitales que reaccionan dinámicamente según el estado de consciencia.

### Características

- **20 Nodos Dimensionales**: 10 Sefirot (reino de luz) + 10 Qliphoth (reino de sombra)
- **Vesica Piscis**: Portal geométrico sagrado como punto de equilibrio central
- **Sistema de Líneas de Vida**: 3 trayectorias parametrizadas según nivel de consciencia
- **6 Eventos Vitales**: Nacimiento, Primer Desafío, Amor/Unión, Pérdida/Crisis, Revelación, Trascendencia
- **Visuales Adaptativos**: Efectos que responden al estado de consciencia
- **Campo Estelar**: 5000+ partículas cósmicas de fondo

## Requisitos

- Node.js (v18+)
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/0xultravioleta/metatof.git
cd metatof

# Instalar dependencias
npm install
```

## Uso

### Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

### Build de producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

## Controles

- **Flechas Arriba/Abajo** o **W/S**: Modular nivel de consciencia
- **Mouse**: Rotar cámara (click + arrastrar)

## Stack Tecnológico

- [Three.js](https://threejs.org/) v0.181.2 - Motor 3D WebGL
- [Vite](https://vitejs.dev/) v7.2.4 - Build tool

## Estructura del Proyecto

```
metatof/
├── src/
│   ├── main.js                 # Setup principal, escena, loop de animación
│   ├── TreeVessel.js           # Estructura del árbol (20 nodos, 22 conexiones)
│   ├── VesicaPiscis.js         # Portal geométrico central
│   ├── LifeLine.js             # Curvas de trayectoria de consciencia
│   ├── ConsciousnessController.js  # Control de input del usuario
│   └── EventSystem.js          # Sistema de eventos vitales
├── index.html
├── package.json
└── vite.config.js
```

## Licencia

MIT
