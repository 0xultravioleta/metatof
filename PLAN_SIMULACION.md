# Plan de Simulación: El Árbol de la Vida y la Muerte como Nave de Conciencia

## 1. Contexto Simbólico y Espiritual
La simulación representa la vida como un viaje de conciencia a través de una estructura de 20 dimensiones: el Árbol de la Vida (10 Sefirot luminosas) y su contraparte sombría, el Árbol de la Muerte (10 Qliphoth).

### El Portal: Vesica Piscis
- **Concepto Central**: La Vesica Piscis actúa como el **eje geométrico y espiritual**, el "útero cósmico" y punto de partida.
- **Función**: Es la zona de transición donde la conciencia se engendra. Es el punto `0` de equilibrio entre la luz y la sombra.
- **Visualización**: Dos círculos/toros 3D intersectados, generando la mandorla central.

## 2. Las 20 Dimensiones (Nodos)

### 2.1 Sefirot Luminosas (Conciencia +1)
Representan la manifestación divina y la estructura armónica.

| # | Sefirá (Hebreo) | Significado | Atributo Espiritual | Visualización Sugerida |
|---|---|---|---|---|
| 1 | **Kéter** | Corona | Voluntad divina, unidad, origen puro. | Luz blanca cegadora, punto singular, etéreo. |
| 2 | **Jojmá** | Sabiduría | Chispa divina, intuición, fuerza creativa masculina. | Destellos, energía dinámica, gris perla/plata. |
| 3 | **Biná** | Entendimiento | Matriz, forma, estructura, lógica divina. | Estructura cristalina, negro brillante (como absorción de luz para dar forma). |
| 4 | **Jesed** | Misericordia | Expansión, gracia, abundancia, amor incondicional. | Azul profundo/púrpura, formas suaves y expansivas. |
| 5 | **Gevurá** | Rigor | Fuerza, límites, juicio, disciplina. | Rojo intenso, formas angulares, fuego contenido. |
| 6 | **Tiféret** | Belleza | Armonía, corazón, equilibrio, compasión. | Amarillo/Dorado solar, esfera perfecta, radiante. |
| 7 | **Netsaj** | Victoria | Persistencia, creatividad vital, instinto. | Verde esmeralda, naturaleza viva, pulsante. |
| 8 | **Hod** | Gloria | Intelecto, comunicación, reverberación. | Naranja brillante, patrones geométricos complejos. |
| 9 | **Yesod** | Fundamento | Conexión, canal, sueño, base astral. | Violeta/Púrpura, neblina onírica, fluido. |
| 10| **Maljut** | Reino | Mundo físico, manifestación final, realidad tangible. | Marrón/Tierra/Multicolor, texturas rocosas o densas. |

### 2.2 Qliphoth / Nodos Oscuros (Conciencia -1)
La sombra invertida, "cáscaras" vacías o fuerzas de desequilibrio.

| # | Qlifá (Contraparte) | Significado Sombra | Atributo Oscuro | Visualización Sugerida |
|---|---|---|---|---|
| 1 | **Thaumiel** (vs Kéter) | Gemelos de Dios | Dualidad, división, ateísmo, conflicto eterno. | Dos cabezas monstruosas luchando, oscuridad dividida, glitch severo. |
| 2 | **Ghagiel** (vs Jojmá) | El Estorbo | Arbitrariedad, caos sin propósito, sabiduría falsa. | Formas caóticas, ruido visual, gris sucio. |
| 3 | **Satariel** (vs Biná) | El Ocultador | Esterilidad, absurdo, ocultamiento de la luz. | Niebla negra densa, laberinto sin salida, vacío frío. |
| 4 | **Gha'agsheblah** (vs Jesed) | El Devorador | Desmesura, tiranía, amor asfixiante. | Masas amorfas que atrapan, azul/púrpura enfermizo. |
| 5 | **Golachab** (vs Gevurá) | El Quemador | Crueldad, destrucción, ira desmedida. | Fuego volcánico, explosiones, rojo sangre, violencia visual. |
| 6 | **Thagirion** (vs Tiféret) | Los Disputadores | Fealdad, egoísmo, orgullo, corazón negro. | Sol negro, eclipse, formas retorcidas, amarillo bilioso. |
| 7 | **A'arab Zaraq** (vs Netsaj) | Cuervos de la Muerte | Dispersión, lujuria vacía, energía desperdiciada. | Partículas erráticas, verde podrido, descomposición. |
| 8 | **Samael** (vs Hod) | Veneno de Dios | Mentira, falsedad, intelecto corrupto. | Patrones rotos, naranja óxido, distorsión lógica. |
| 9 | **Gamaliel** (vs Yesod) | Los Obscenos | Fantasía distorsionada, perversión, pesadilla. | Formas sexuales grotescas, violeta oscuro, lodo. |
| 10| **Lilith** (vs Maljut) | La Reina de la Noche | Materialismo crudo, alienación, terror físico. | Oscuridad total, texturas de roca muerta, sensación de peso aplastante. |

## 3. Geometría Sagrada y Estructura

### 3.1 Vesica Piscis (Spawn Point)
- **Construcción**: Dos toros/círculos de radio R, centros en la circunferencia del otro.
- **Rol**: Inicio de la simulación. Ancla del Árbol.
- **Material**: Semitransparente, "glow" místico, portal de luz.

### 3.2 Línea de la Vida (LifeLine)
- **Forma**: Espiral dorada (Fibonacci) o Spline (CatmullRom) que nace de la Vesica.
- **Trayectoria**: El camino predeterminado por el cual viaja la "Nave Árbol".

### 3.3 El Árbol-Nave
- Estructura jerárquica que contiene los 20 nodos.
- Se ancla a la Vesica y viaja por la LifeLine.
- Puede rotar y transformarse según la conciencia.

## 4. Mecánica de Conciencia (`ConsciousnessController`)

Variable continua `consciousness` [-1.0 a 1.0].

- **+1.0 (Kéter)**:
    - Orientación hacia Sefirot.
    - Materiales: Luz, cristal, oro, resplandor.
    - Ambiente: Estrellas brillantes, nebulosas claras.
- **0.0 (Vesica Piscis)**:
    - Estado Neutro / Equilibrio.
    - Punto medio, mezcla de materiales, "Vesica" visible como centro.
- **-1.0 (Thaumiel)**:
    - Orientación hacia Qliphoth.
    - Materiales: Oscuridad, óxido, ruido, distorsión ("glitch").
    - Ambiente: Vacío, sombras, partículas de "ceniza".

**Efectos en tiempo real**:
- Posición vertical/radial del árbol.
- Interpolación de shaders (Bloom vs Noise).
- Activación/Visibilidad de nodos.

## 5. Sistema de Eventos (`EventNode`)

Puntos fijos en la `LifeLine` (checkpoints).

### Estructura del Evento
- `t` (posición en curva 0..1)
- `type` (Bendición, Trauma, Aprendizaje, etc.)
- `weight` (Impacto espiritual)

### Reacción Dinámica
Al cruzar un evento, se dispara una visualización basada en `consciousness`:

1.  **Conciencia Alta**: "Versión Luz". Transmutación, aprendizaje, elevación. Efectos suaves y armónicos.
2.  **Conciencia Neutra**: "Versión Equilibrio". Lección objetiva.
3.  **Conciencia Baja**: "Versión Sombra". Trauma, dolor, caos. Efectos de choque, distorsión visual y sonora.

## 6. Arquitectura Técnica (Three.js)

- **Escena**: `THREE.Scene` con fondo estelar dinámico.
- **Geometrías**:
    - `VesicaGeometry`: Procedural o primitiva compuesta (Torus/Circle).
    - `SefiraMesh` / `QliphaMesh`: Esferas con `ShaderMaterial` personalizado.
- **Control**:
    - Input de usuario (W/S o Flechas) para modificar `consciousness`.
    - Movimiento automático de cámara sobre `LifeLine`.
- **Shaders**:
    - Uso de `emissive` y `bloom` para luz.
    - Uso de `noise` y desplazamiento de vértices para oscuridad/qliphoth.

## 7. Interfaz de Usuario (UI)

- **HUD Minimalista**:
    - Barra de Conciencia (Vertical, gradiente Luz-Oscuridad).
    - Indicador de Evento Próximo.
    - Nombre del Nodo actual (Sefirá/Qlifá).
- **Controles**:
    - `Subir Conciencia`: Acercarse a Kéter.
    - `Bajar Conciencia`: Caer hacia Thaumiel/Qliphoth.
    - `Pausa/Meditación`: Vista orbital del Árbol completo.

## 8. Guía de Interpretación
Esta simulación es una herramienta de introspección.
- **El Viaje**: Tu vida no es lineal, pero el tiempo sí. La conciencia determina *cómo* experimentas el tiempo.
- **La Vesica**: Recuerda siempre tu origen y tu centro.
- **Luz y Sombra**: No se trata de eliminar la sombra, sino de navegarla. Las Qliphoth son cáscaras; la luz las llena y las transforma.
