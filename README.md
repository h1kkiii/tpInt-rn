# Biblioteca IPF

App de la biblioteca del Instituto Politécnico Formosa (TP N° 4 de React Native II). Permite consultar el catálogo, buscar libros, abrirlos escaneando el código de barras de la contratapa, reservarlos (préstamo por 7 días o lista de espera), recibir un recordatorio antes de devolverlos y, para el personal, entregar los libros respetando el orden de las reservas.

- **Expo SDK 58** (`expo` 58.0.26) con **Expo Router** 58.0.32 y **TypeScript** 6.0.3.
- React 19.3.0 y React Native 0.88.1.
- Módulos nativos: solo `expo-camera` 58.0.14 y `expo-notifications` 58.1.9. Persistencia con `@react-native-async-storage/async-storage` 2.2.0.
- Probada en Expo Go.

## Cómo ejecutarla

```bash
npm install          # instala las dependencias
npx expo start       # levanta Metro; escaneá el QR con Expo Go (Android) o con la cámara (iOS)
npm test             # tests unitarios con jest-expo
npx expo lint        # lint
npx tsc --noEmit     # chequeo de tipos
```

Los paquetes se agregaron solo con `npx expo install`, así las versiones son las compatibles con el SDK 58.

### Datos de prueba

| Qué | Valor |
|---|---|
| Usuario del personal | `biblioteca` |
| Clave del personal | `ipf2026` |
| ISBN real 1 | `9788499089508` — *Ficciones*, Jorge Luis Borges (2011) |
| ISBN real 2 | `9788420437484` — *Rayuela*, Julio Cortázar (2019) |
| Libro sin ejemplares con 2 personas esperando | `9789500401036` — *Sobre héroes y tumbas* (Lucía y Tomás) |
| Libro sin ejemplares con 1 persona esperando | `9789500712347` — *Pedro Páramo* (Pedro) |

El escáner se probó apuntando la cámara a los códigos de barras de esos dos ISBN mostrados en pantalla (generados a partir del número), no a los libros impresos.

La API es simulada (`src/lib/api.ts`): tarda 800 ms y falla 1 de cada 5 veces a propósito, para ver los estados de error. El recordatorio está en **modo demostración** (`MODO_DEMOSTRACION` en `src/constants/biblioteca.ts`): llega a los 15 segundos en lugar de un día antes del vencimiento.

## Rutas (`src/app`)

```
src/app/
├── _layout.tsx                 Stack raíz (NavegadorRaiz) + BibliotecaProvider · anchor: '(tabs)'
├── (tabs)/
│   ├── _layout.tsx             Tabs (expo-router/js-tabs): "Catálogo" y "Mis reservas"
│   ├── (catalogo)/
│   │   ├── _layout.tsx         Stack de la tab Catálogo · anchor: 'index' · link "Personal" en el header
│   │   ├── index.tsx           /                 Catálogo
│   │   └── libro/[isbn].tsx    /libro/[isbn]     Detalle del libro
│   └── reservas.tsx            /reservas         Mis reservas
├── buscar.tsx                  /buscar?q=        Buscador (Stack raíz)
├── escanear.tsx                /escanear         Escáner (Stack raíz)
├── reservar/[isbn].tsx         /reservar/[isbn]  Confirmación — modal
├── permisos/[recurso].tsx      /permisos/[recurso] Pantalla previa al permiso — modal
├── login.tsx                   /login            Ingreso del personal — modal, protegido: Stack.Protected guard={!sesion} redirectTo="/mostrador"
├── mostrador.tsx               /mostrador        Mostrador — protegido: Stack.Protected guard={sesion} redirectTo="/login"
├── reserva.tsx                 /reserva          URL vieja: <Redirect href="/reservas" />
└── +not-found.tsx              cualquier otra    404 que muestra la URL (usePathname)
```

- El `<Stack>` raíz y los `Stack.Protected` están en `src/components/NavegadorRaiz.tsx`, que el `_layout.tsx` raíz renderiza dentro del `BibliotecaProvider` (la guarda necesita la sesión del Context).
- `anchor: '(tabs)'` deja las pestañas debajo de cualquier pantalla del Stack raíz abierta por deep link; `anchor: 'index'` deja el Catálogo debajo de un detalle.
- Del escáner al detalle y de la confirmación a "Mis reservas" se navega con `router.dismissTo(...)`: vuelve a la `(tabs)` existente en lugar de apilar otra.

## Plugins de `app.json`

```jsonc
"plugins": [
  // Rutas basadas en archivos (src/app).
  "expo-router",
  // Splash: queda visible hasta que la app termina de leer lo guardado en AsyncStorage.
  [
    "expo-splash-screen",
    { "backgroundColor": "#208AEF", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }
  ],
  [
    "expo-camera",
    {
      // NSCameraUsageDescription en iOS, con el molde "Usamos tu [dato] para [beneficio concreto]".
      "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrirlo al instante",
      // La app no graba video: no se declara NSMicrophoneUsageDescription.
      "microphonePermission": false,
      // Y en Android el plugin no agrega RECORD_AUDIO.
      "recordAudioAndroid": false
    }
  ],
  [
    "expo-notifications",
    // Solo notificaciones locales: no se agrega el entitlement aps-environment (push) en iOS.
    { "enableRemoteNotifications": false }
  ]
]
```

Además: `"scheme": "bibliotecaipf"`, `"userInterfaceStyle": "automatic"` (modo oscuro), `experiments.typedRoutes: true` y `experiments.reactCompiler: false`.

## Permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si no se concede |
|---|---|---|---|
| Cámara | `expo-camera` | Al tocar "Usar la cámara" en `/escanear`: primero se muestra `/permisos/camara` (beneficio en una frase y un único botón "Continuar") y recién ahí el diálogo del sistema. | Escribir el ISBN a mano (el campo está visible en los cuatro estados del escáner). Si queda bloqueado: pasos en Ajustes y "Abrir Ajustes". |
| Notificaciones | `expo-notifications` | Solo al activar "Recordarme" en un préstamo de "Mis reservas". Si no está concedido se abre `/permisos/notificaciones`. En Android el canal `prestamos` se crea antes de pedir. | La fecha de devolución queda siempre en "Mis reservas" y, cuando te entregan un libro desde el mostrador, el aviso aparece dentro de la app. |

El permiso se consulta con `usePermiso` (`src/hooks/usePermiso.ts`), que distingue cuatro estados (cargando, concedido, preguntable, bloqueado) con `granted` y `canAskAgain`, y se actualiza al recuperar el foco y al volver a primer plano (por ejemplo, desde Ajustes). Ningún permiso denegado bloquea la app.

### `android.blockedPermissions`

```json
"blockedPermissions": [
  "android.permission.RECORD_AUDIO",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.READ_MEDIA_AUDIO",
  "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
  "android.permission.SYSTEM_ALERT_WINDOW"
]
```

- **RECORD_AUDIO**: la cámara solo lee códigos de barras, nunca graba. Se bloquea además de `recordAudioAndroid: false` por si otra librería lo sumara.
- **Ubicación (coarse y fine)**: la app no usa ubicación.
- **READ/WRITE_EXTERNAL_STORAGE y READ_MEDIA_\***: la app no lee ni guarda fotos, videos ni audio. La plantilla nativa de Expo trae READ/WRITE_EXTERNAL_STORAGE como permisos opcionales.
- **SYSTEM_ALERT_WINDOW**: dibujar sobre otras apps; también viene en la plantilla y no se usa.
- **No se bloquea VIBRATE**: lo usan las notificaciones del recordatorio; es un permiso "normal" (no se le pregunta a la persona).
- `blockedPermissions` agrega `tools:node="remove"` en el AndroidManifest, así ningún manifest de una librería puede volver a sumarlos. Verificado con `npx expo config --type introspect`: quedan INTERNET, VIBRATE y CAMERA, y los diez de la lista figuran con `tools:node="remove"`. Al compilar, expo-notifications suma POST_NOTIFICATIONS y RECEIVE_BOOT_COMPLETED.
- `enableRemoteNotifications: false`: la app solo programa notificaciones locales, así que no declara la capacidad de push (`aps-environment`) en iOS.

## Deep links de prueba

En Expo Go el esquema propio no abre la app: se usa la URL equivalente `exp://IP:8081/--/…` (IP de la computadora que corre `npx expo start`). `bibliotecaipf://…` funciona en un development build o una app instalada.

| Ruta | Esquema propio | Expo Go | Qué se ve |
|---|---|---|---|
| Catálogo | `bibliotecaipf://` | `exp://IP:8081/--/` | Catálogo |
| Detalle existente | `bibliotecaipf://libro/9788499089508` | `exp://IP:8081/--/libro/9788499089508` | *Ficciones*, con el Catálogo debajo |
| Detalle con ISBN inválido | `bibliotecaipf://libro/123` | `exp://IP:8081/--/libro/123` | "Ese ISBN no es válido" y "Volver al catálogo" |
| Detalle inexistente | `bibliotecaipf://libro/9780000000002` | `exp://IP:8081/--/libro/9780000000002` | "No tenemos ese libro" |
| Buscador | `bibliotecaipf://buscar?q=borges` | `exp://IP:8081/--/buscar?q=borges` | Resultados de "borges", con las tabs debajo |
| Escáner | `bibliotecaipf://escanear` | `exp://IP:8081/--/escanear` | Escáner en el estado del permiso |
| Confirmar reserva | `bibliotecaipf://reservar/9788420437484` | `exp://IP:8081/--/reservar/9788420437484` | Modal de reserva de *Rayuela* |
| Mis reservas | `bibliotecaipf://reservas` | `exp://IP:8081/--/reservas` | Tab "Mis reservas" |
| Pantalla previa (cámara) | `bibliotecaipf://permisos/camara` | `exp://IP:8081/--/permisos/camara` | Modal del permiso de cámara |
| Pantalla previa (notificaciones) | `bibliotecaipf://permisos/notificaciones` | `exp://IP:8081/--/permisos/notificaciones` | Modal del permiso de notificaciones |
| Recurso desconocido | `bibliotecaipf://permisos/ubicacion` | `exp://IP:8081/--/permisos/ubicacion` | "No conocemos el permiso…" y "Volver" |
| Login | `bibliotecaipf://login` | `exp://IP:8081/--/login` | Sin sesión: formulario. Con sesión: el mostrador |
| Mostrador | `bibliotecaipf://mostrador` | `exp://IP:8081/--/mostrador` | Sin sesión: el login. Con sesión: el mostrador |
| URL vieja | `bibliotecaipf://reserva` | `exp://IP:8081/--/reserva` | Redirige a "Mis reservas" |
| 404 | `bibliotecaipf://no-existe` | `exp://IP:8081/--/no-existe` | "Esta página no existe" con la URL |

## Capturas

Las capturas van en [`capturas/`](capturas/).

| | |
|---|---|
| ![Catálogo cargando](capturas/01-catalogo-cargando.png) | **01 · Catálogo cargando.** Indicador mientras llega la API; "Vistos recientemente" y los accesos ya se ven. |
| ![Catálogo con error](capturas/02-catalogo-error.png) | **02 · Catálogo con error.** Mensaje propio y "Reintentar" cuando la API simulada falla. |
| ![Catálogo con datos](capturas/03-catalogo-datos.png) | **03 · Catálogo con datos.** Lista de libros, vistos recientemente y link "Personal". |
| ![Buscador](capturas/04-buscador.png) | **04 · Buscador.** Resultados de "borges"; la búsqueda vive en la URL. |
| ![Detalle inexistente](capturas/05-detalle-inexistente.png) | **05 · Detalle inexistente.** `/libro/123`: mensaje claro y "Volver al catálogo". |
| ![Reserva con ejemplares](capturas/06-reserva-con-ejemplares.png) | **06 · Reserva con ejemplares.** Préstamo por 7 días con la fecha de devolución. |
| ![Reserva sin ejemplares](capturas/07-reserva-sin-ejemplares.png) | **07 · Reserva sin ejemplares.** Ingreso a la lista de espera con la posición. |
| ![Escáner cargando](capturas/08-escaner-cargando.png) | **08 · Escáner cargando.** "Revisando el permiso de la cámara…". |
| ![Escáner preguntable](capturas/09-escaner-preguntable.png) | **09 · Escáner preguntable.** Beneficio y "Usar la cámara", que abre la pantalla previa. |
| ![Escáner concedido](capturas/10-escaner-concedido.png) | **10 · Escáner concedido.** Cámara leyendo EAN-13 y el ISBN a mano arriba. |
| ![Escáner bloqueado](capturas/11-escaner-bloqueado.png) | **11 · Escáner bloqueado.** Pasos en Ajustes, "Abrir Ajustes" y el ISBN a mano. |
| ![Notificación](capturas/12-notificacion.png) | **12 · Notificación recibida.** Recordatorio de devolución a los 15 s (modo demostración). |
| ![Mostrador antes](capturas/13-mostrador-antes.png) | **13 · Mostrador antes.** Libros con espera, quién está al frente y cuántos esperan. |
| ![Mostrador después](capturas/14-mostrador-despues.png) | **14 · Mostrador después.** Confirmación de a quién se entregó y la fila actualizada. |
| ![Pantalla 404](capturas/15-pantalla-404.png) | **15 · Pantalla 404.** Muestra la URL inexistente y lleva al Catálogo. |

## Lint y tipos

Salida de los comandos, corridos sobre la versión entregada:

```
$ npx expo lint
$ npx tsc --noEmit
$
```

Ninguno de los dos muestra errores ni advertencias (terminan sin salida y con código 0). `npm test`: 10 suites, 80 tests, todos pasan.

## Desafíos opcionales

| Desafío | Estado | Dónde |
|---|---|---|
| Persistencia | Hecho | `src/hooks/usePersistencia.ts`, `src/lib/persistencia.ts`, `src/lib/almacenamiento.ts`. Guarda préstamos (con el id de la notificación), esperas, recientes, avisos y títulos; la sesión no. El splash sigue visible hasta terminar de leer, así nunca se ve la app vacía. Al arrancar, limpia los ids de notificaciones que ya no están programadas. |
| Tests | Hecho | 80 tests con jest-expo: Pila y Cola (8 casos, incluido desencolar una cola vacía), copia al escribir, reglas de reserva, parámetros e ISBN, fechas, permisos, reservas, mostrador, persistencia y contraste del tema. |
| Debounce | Hecho | `src/hooks/useBusqueda.ts`: espera 300 ms sin escribir; la limpieza hace `clearTimeout` y descarta respuestas viejas. |
| Modo oscuro | Hecho | `useColorScheme` en `src/hooks/useTema.ts`, colores de `src/constants/tema.ts` (contraste ≥ 4.5:1 comprobado con un test) y tema de navegación para headers, tabs y modales. |
| Development build | No hecho | No generé un development build, así que no hay captura del diálogo de cámara con el texto de propósito propio (en Expo Go el diálogo muestra el texto de Expo Go). |

## Carpetas de `src/`

| Carpeta | Para qué sirve |
|---|---|
| `app/` | Solo rutas de Expo Router (pantallas y `_layout`). |
| `components/` | Componentes visuales, uno por archivo (tarjetas, mensajes de estado, formularios, navegador raíz…). |
| `hooks/` | Lógica con estado y efectos: `useLibros`, `useBusqueda`, `usePermiso`, `useRecordatorios`, `useMostrador`, `usePersistencia`, `useTema`… |
| `lib/` | Funciones puras y acceso a servicios: API simulada, reglas de la biblioteca, copia al escribir, fechas, parámetros, permisos, notificaciones, persistencia y almacenamiento. |
| `context/` | `BibliotecaContext`: préstamos, listas de espera (Cola), recientes (Pila), avisos, títulos y sesión. |
| `estructuras/` | Clases `Pila` y `Cola` con campos privados (`#items`). |
| `data/` | Catálogo de libros y listas de espera iniciales. |
| `types/` | Tipos: `Libro` (de la consigna) y los de la biblioteca. |
| `constants/` | Tema (colores, tamaños, espaciados), textos de mensajes, constantes de la biblioteca y textos de permisos. |
