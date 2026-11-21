# Respuestas — TP N° 4 "Biblioteca IPF"

Alumno: Natanael Duarte. Cito mi código como `archivo:línea`. La app usa Expo SDK 58.

# Parte B — Estado, efectos y renderizado

## B1. El ciclo de vida de useLibros

Mi hook es `src/hooks/useLibros.ts`. Guarda dos estados: `intento` y `respuesta` (que es `{ intento, libros, error }` o `null`). No guardo `cargando`: lo calculo en cada render (`useLibros.ts:47`):

```ts
const cargando = respuesta === null || respuesta.intento !== intento;
```

Lo hago así para no llamar a `setCargando(true)` dentro del efecto, que suma un render de más.

### a) Render por render

Cuando sale bien:

| Render | Qué lo provoca | libros | cargando | error |
|---|---|---|---|---|
| 1 | Se monta el Catálogo | `[]` | `true` | `false` |
| 2 | Llega la respuesta (~800 ms): `setRespuesta(...)` | los 17 libros | `false` | `false` |

Son 2 renders. El pedido lo dispara el efecto después del render 1, pero eso no cuenta como render porque todavía no cambia ningún estado.

Cuando falla y toco "Reintentar":

| Render | Qué lo provoca | libros | cargando | error |
|---|---|---|---|---|
| 1 | Montaje | `[]` | `true` | `false` |
| 2 | Falla: el `catch` hace `setRespuesta({ ..., error: true })` | `[]` | `false` | `true` |
| 3 | Toco "Reintentar": `setIntento(1)`, ahora `respuesta.intento` (0) ≠ `intento` (1) | `[]` | `true` | `false` |
| 4 | Llega la respuesta del intento 1 | 17 libros (o `[]` si vuelve a fallar) | `false` | `false` (o `true`) |

En el render 3, `error` da `false` aunque la respuesta guardada diga `error: true`, porque solo lo muestro si no estoy cargando (`useLibros.ts:52`).

### b) ¿Se desmonta el Catálogo?

Lo probé con un `console.log` temporal en la limpieza del efecto, en una copia fuera del repo (en el repo no hay ningún `console.log`). Esto se imprimió:

- Cambiar de pestaña a "Mis reservas": **nada**.
- Volver a "Catálogo": nada.
- Abrir un detalle: se monta el `useLibros` del detalle, no se limpia el del Catálogo.
- Atrás desde el detalle: se limpia el del detalle.

O sea, el Catálogo **no se desmonta** al cambiar de pestaña ni al abrir un detalle: las tabs lo dejan montado abajo. La limpieza que escribí (`obsoleto = true`) se ejecuta en la práctica cuando toco "Reintentar" (cambia `intento`) y cuando se desmontan las otras pantallas que también usan `useLibros` (detalle, reserva, escáner, mostrador). Ahí sirve para descartar una respuesta que llega tarde.

### c) ¿Por qué no pasar una función async a useEffect?

Porque una función `async` siempre devuelve una Promise, y `useEffect` espera que el efecto no devuelva nada o devuelva una función de limpieza. Si le paso una async, React recibe una Promise donde esperaba la limpieza: no la puede usar y mi limpieza real se pierde.

Lo resolví definiendo la async **adentro** del efecto y llamándola; el efecto en sí es sincrónico y devuelve la limpieza (`useLibros.ts:23-41`).

### d) ¿Cómo implementé reintentar?

Solo sube un contador (`useLibros.ts:43`):

```ts
const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), []);
```

`intento` está en las dependencias del efecto, así que al cambiar React limpia el efecto viejo y corre uno nuevo, que hace otro pedido. Uso un contador y no un booleano porque necesito un valor **distinto cada vez**: un `true → true` no cambiaría nada. Tampoco uso `error` o `libros` como dependencia (uno no dispararía si el error se repite, el otro haría un bucle).

## B2. La condición de carrera del buscador

Mi buscador (`src/hooks/useBusqueda.ts`) tiene debounce de 300 ms, así que el pedido de "bor" ni sale. Lo verifiqué en una copia con `buscarLibros` falso ("bor" 1.400 ms, "borges" 300 ms) y timers falsos.

| Momento | Qué pasa | Sin limpieza | Con mi código |
|---|---|---|---|
| t = 0 | Escribe "bor" → pide "bor" (1.400 ms) | sale el pedido de "bor"; lista vacía | "Buscando…"; arranca el timer de 300 ms, todavía no pide |
| t = 200 | Escribe "borges" → pide "borges" (300 ms) | sale "borges"; dos pedidos en vuelo | la limpieza cancela el timer de "bor" (nunca sale) y arranca otro para "borges" |
| t = 500 | Llega "borges" | muestra "borges" | recién ahora sale "borges" (llega a los 800 ms); sigue "Buscando…" |
| t = 1.400 | Llega "bor" | muestra **"bor"**, que pisa a "borges" | no cambia nada: sigue "borges" |

Salida real:

```
SIN LIMPIEZA:   t=500 ["borges"]   t=1400 ["bor"]
CON MI CÓDIGO:  t=800 ["borges"]   t=1400 ["borges"]
```

### a) Qué hace la limpieza

Está en `useBusqueda.ts:42-45`:

```ts
return () => {
  clearTimeout(temporizador);
  obsoleta = true;
};
```

`clearTimeout` cancela el pedido si todavía no salió; `obsoleta = true` hace que, si ya salió, su respuesta se descarte (el `if (!obsoleta)` antes del `setRespuesta`). Cada ejecución del efecto tiene su propia `obsoleta`, así que marcar la vieja no toca la nueva. Se ejecuta en el render siguiente a cada tecla.

### b) `if (texto === q) setResultados(datos)`

No funciona. Esa función es una **clausura**: ve el valor de `q` del render en que se creó, no el actual. Como el pedido se hizo con ese mismo `q`, la comparación siempre da verdadero (`"bor" === "bor"`), aunque ya haya escrito "borges". En JavaScript una función recuerda las variables del momento en que se creó; el `q` nuevo vive en otro render. Mi limpieza con el flag no necesita saber cuál es la búsqueda actual: solo que la mía dejó de serlo.

### c) La URL y el botón atrás

Cada tecla llama a `router.setParams({ q: texto })` (`buscar.tsx:39`), que **reemplaza** el parámetro de la pantalla actual: no apila nada. Atrás sale del buscador de una. El `TextInput` tiene su propio estado local (`CampoBusqueda.tsx:20`) espejado a la URL, para responder al instante. Con `router.push` cada letra sería una pantalla nueva: atrás iría borrando letras de a una y se perdería el foco.

## B3. Mutar o reemplazar

### a) Toca "Anotarme" tres veces

Sigue mostrando **0**. `encolar` modifica el arreglo de adentro de la Cola, pero no hay ningún `setState`, así que React no re-renderiza (es la misma referencia) y el texto no se actualiza. Por dentro la cola sí tiene a "Ana" tres veces.

### b) El número "salta" a 3

Al escribir en el `TextInput`, su `onChangeText` hace un `setState` y eso sí provoca un render. En ese render se vuelve a leer `espera.tamanio`, que ya era 3, y el texto "salta". Un error que aparece "a veces" es peor que uno que aparece siempre porque depende de algo que no tiene relación (escribir en otro campo), es difícil de reproducir, puede pasar las pruebas y la persona ve datos viejos sin darse cuenta.

### c) Cómo lo resolví

Nunca muto la Cola guardada: uso **copia al escribir** (`src/lib/copiaAlEscribir.ts`). Cada cambio arma una estructura nueva desde `aArray()` y aplica el cambio sobre la copia:

```ts
export function cambiarCola<T>(original: Cola<T>, cambio: (copia: Cola<T>) => void): Cola<T> {
  const copia = colaDesde(original.aArray());
  cambio(copia);
  return copia;
}
```

En el Context, al anotarme (`BibliotecaContext.tsx:79`):

```ts
esperas: { ...actual.esperas, [libro.isbn]: cambiarCola(cola, (copia) => copia.encolar(USUARIO)) },
```

Como la cola es otra referencia, React re-renderiza. Tengo tests de que la original no cambia.

| Alternativa | Ventaja | Costo |
|---|---|---|
| Crear una cola nueva (la mía) | React detecta el cambio por referencia; la vieja nunca cambia, así lo guardado y los `useMemo` quedan consistentes | copia O(n) en cada cambio; hay que acordarse de usar `cambiarCola` (lo centralicé en el Context) |
| Contador de versión (mutar + `setVersion(v+1)`) | no copia nada, O(1) | la instancia guardada se sigue mutando: un `useMemo` que dependa de la cola no se entera, y si se olvida el `setVersion` vuelve el error de B3 |
| useReducer | ordena las transiciones y es fácil de testear | igual tenés que devolver una cola nueva; y el reducer no le puede devolver un resultado al que hizo el `dispatch`, y mi `reservar` necesita devolver préstamo/espera/repetido en el momento. Por eso usé `useState` + un ref (`estadoRef`) con el estado más nuevo |

## B4. ¿Dónde vive cada dato?

| Dato | Dónde vive | Por qué ahí |
|---|---|---|
| Texto del buscador | URL (`q`) + estado local del campo | En la URL se comparte y sobrevive al atrás; el estado local es para que el campo responda al instante. No lo usa ninguna otra pantalla. |
| Préstamos y reservas | Context, guardado en AsyncStorage | Los usan varias pantallas y tienen que sobrevivir a cerrar la app. |
| Listas de espera | Context (una `Cola` por ISBN), guardadas | Las tocan la reserva y el mostrador; una sola fuente evita que dos pantallas vean filas distintas. |
| Vistos recientemente | Context (una `Pila`), guardado | Lo escribe el detalle y lo lee el Catálogo. |
| Sesión del personal | Context, **sin** guardar | La usa el layout raíz para `Stack.Protected`. No la guardo a propósito: al reabrir hay que ingresar de nuevo. |
| Ejemplares disponibles | **Se calcula** con `calcularDisponibles(libro, prestamos)` (`lib/biblioteca.ts:24`) | Sale de dos datos que ya existen; si lo guardara tendría que sincronizarlo a mano (ver E4d). |
| Estado del permiso de cámara | En el sistema operativo; copia local en `usePermiso` | La verdad la tiene el sistema y puede cambiar en Ajustes. Guardarlo quedaría viejo. |
| Id de la notificación | En el préstamo (`notificacionId`), guardado | Lo necesito para cancelarla al devolver, aunque la app se haya cerrado. Al arrancar limpio los que ya no existen. |

**¿Qué se re-renderiza al cambiar el `value` del Context?** Todos los componentes que llaman a `useBiblioteca()`, aunque usen un solo campo. El `value` está memorizado con `useMemo` y las funciones con `useCallback`, así que solo cambia cuando cambia un dato.

Si el Catálogo solo usa "recientes", igual se re-renderizan `VistosRecientemente` y `EnlacePersonal` (que llaman a `useBiblioteca`) al activar un recordatorio en otra pestaña, porque cambia `prestamos` y eso crea un `value` nuevo. Para evitarlo podría partir el Context en varios (uno por tipo de dato) o usar un store con selectores. **No vale la pena acá**: son pocos componentes livianos y los cambios ocurren por acciones de la persona, no muchas veces por segundo. Antes de optimizar lo mediría con el Profiler de React DevTools.

# Parte C — Navegación y rutas

Mis navegadores: el **Stack raíz** (`src/components/NavegadorRaiz.tsx`, anchor `'(tabs)'`), las **Tabs** (`src/app/(tabs)/_layout.tsx`) y el **Stack de la tab Catálogo** (`src/app/(tabs)/(catalogo)/_layout.tsx`, anchor `'index'`).

## C1. La pila en tu app

Lo comprobé en una copia con `renderRouter`, imprimiendo el estado después de cada paso. De base a tope:

| # | Acción | Pilas |
|---|---|---|
| 1 | Abre la app. | Raíz: `[(tabs)]` · Tab Catálogo: `[index]` |
| 2 | Toca un libro. | Tab Catálogo: `[index, libro/9788499089508]` |
| 3 | Toca "Reservar". | Raíz: `[(tabs), reservar (modal)]` · Tab Catálogo: `[index, libro]` |
| 4 | Toca "Confirmar". | Raíz: `[(tabs)]` (el modal sale) · tab **Mis reservas** activa · Tab Catálogo sigue `[index, libro]` |
| 5 | Atrás (Android). | tab **Catálogo** activa, se ve el detalle `[index, libro]` |
| 6 | Toca la tab "Catálogo". | Tab Catálogo: `[index]` → se ve el Catálogo |

En el paso 5, "Mis reservas" no tiene historia propia y las tabs por defecto vuelven a la primera tab, que conserva su Stack con el detalle arriba. (Al paso 5 lo simulé con `router.back()`; el botón atrás físico lo tengo que probar en el teléfono.)

### a) ¿Qué método usé en el paso 4?

`router.dismissTo('/reservas')` (`ConfirmacionReserva.tsx:45`), después de aplicar la reserva. Saca el modal y vuelve a la `(tabs)` que ya existe, cambiando a "Mis reservas".

- Con `push`: quedaría una **segunda** `(tabs)` encima del modal, y atrás volvería a la confirmación (podría confirmar de nuevo).
- Con `replace`: el modal se reemplaza por otra `(tabs)`: quedan dos Catálogos montados.
- Con `dismissTo` (el mío): nada duplicado y atrás nunca vuelve a la confirmación.

Elegí `dismissTo` porque lleva a `/reservas` y evita que atrás vuelva a la confirmación, sin duplicar navegadores.

### b) En el paso 6, ¿qué se ve?

El **Catálogo**. Al tocar una tab ya activa, su Stack hace `popToTop` (vuelve a la primera pantalla). Si la persona tocara "Catálogo" estando en "Mis reservas" sin pasar por el atrás del paso 5, vería primero el detalle (el Stack guardó `[index, libro]`) y con otro toque volvería al Catálogo. Me parece correcto: es como andan las apps con pestañas, y la persona nunca queda sin salida.

## C2. El escáner que dispara de más

### a) `router.push` sin protección

`onBarcodeScanned` se llama muchas veces por segundo. Cada `push` suma una acción a la cola de navegación (como la cola del TP 2) y apila un detalle más: quedarían cinco o diez detalles iguales y habría que tocar atrás muchas veces.

### b) ¿useState o useRef?

Usé **`useRef`** (`useLecturaIsbn.ts:38-39`):

```ts
if (navegando.current) return;
navegando.current = true;
```

Un `useState` en `true` no alcanza porque `setNavegando(true)` no cambia la variable en el acto: pide un render. Las llamadas que llegan antes de ese render usan la clausura vieja, donde `navegando` sigue en `false`, y navegan igual. El ref es el mismo objeto en todos los renders y el cambio se ve en la llamada siguiente.

### c) ¿Por qué replace?

Para que el escáner no quede debajo del detalle: si toco atrás, quiero volver al Catálogo, no a la cámara prendida. Con `push`, atrás volvería al escáner.

En mi app uso `router.dismissTo` (`useLecturaIsbn.ts:42`) en vez de `replace`, porque en SDK 58 un `replace` desde el Stack raíz hacia la tab duplica `(tabs)`:

| Método | Atrás desde el detalle |
|---|---|
| `push` | vuelve al escáner y quedan dos tabs |
| `replace` | vuelve a la tabs original: tabs duplicadas |
| `dismissTo` (el mío) | vuelve al Catálogo |

### d) ISBN que no está

Muestro un aviso **en la pantalla** (no un `Alert`) y la cámara **sigue leyendo**. Para que no aparezca diez veces, guardo el último código desconocido en un ref (`useLecturaIsbn.ts:56`):

```ts
if (ultimoDesconocido.current === isbn) return;
```

Si el mismo código sigue frente a la cámara, no se repite el aviso. Un timer de 4 s lo borra (con `clearTimeout` en la limpieza) y un código distinto lo reemplaza.

## C3. Deep links y rutas protegidas

Probado en la copia con `renderRouter({ initialUrl })`. En el teléfono, con Expo Go, es `exp://IP:8081/--/...`.

| Link | Qué ve | Qué queda debajo | Qué parte decide |
|---|---|---|---|
| `libro/9788499089508` | Detalle de *Ficciones* | el Catálogo (`[index, libro]`); atrás → Catálogo | anchor `'index'` + validación en `useLibroPorIsbn.ts:18` |
| `libro/123` | "Ese ISBN no es válido" y "Volver al catálogo" | el Catálogo | `esIsbnValido` (`useLibroPorIsbn.ts:18`) |
| `buscar?q=borges` | el buscador con "borges" y sus resultados | las tabs: `[(tabs), buscar]`; atrás → Catálogo | anchor `'(tabs)'`; `useLocalSearchParams` (`buscar.tsx:18`) |
| `mostrador` (sin sesión) | el login | las tabs: `[(tabs), login]`; al ingresar, el login se reemplaza por el mostrador | `Stack.Protected guard={sesion} redirectTo="/login"` (`NavegadorRaiz.tsx:28`) |
| `reserva` | "Mis reservas" | el Stack raíz queda `[(tabs), (tabs)']`; atrás → Catálogo | `<Redirect href="/reservas" />` (`reserva.tsx:5`), que hace un `replace` |
| `escanear` (cámara bloqueada) | "Cámara: permiso desactivado", pasos, "Abrir Ajustes" y el ISBN a mano | las tabs: `[(tabs), escanear]` | `usePermiso('camara')` + `estadoDesde` (`Escaner.tsx:31`) |

El link `/libro/123` llega a mi pantalla aunque no exista ese libro porque Expo Router solo compara la **forma** de la URL con los archivos: `[isbn]` acepta cualquier valor; el router no sabe nada de libros. La **responsabilidad de responder bien es de mi pantalla**, que valida el ISBN y muestra un mensaje con salida (`useLibroPorIsbn`). En Expo Go, `bibliotecaipf://` no abre la app (eso necesita un development build); por eso pruebo con `exp://...`.

## C4. Foco, montaje y primer plano

### a) Qué detecta cada una

- `useEffect` con `[]`: el **montaje** (y el desmontaje en la limpieza).
- `useFocusEffect`: que la pantalla **gana el foco** (y lo pierde).
- `AppState`: que la **app entera** pasa de segundo plano a primer plano.

### b) Quién se entera

- Habilita las notificaciones en Ajustes y vuelve: solo **AppState** (la pantalla nunca perdió el foco, el componente nunca se desmontó).
- Va a Catálogo y vuelve a "Mis reservas": solo **`useFocusEffect`** (las tabs no desmontan, y la app nunca salió de primer plano).

### c) Cuáles usé

En `usePermiso` uso **las dos juntas**: `useFocusEffect` (consulta al recuperar el foco, por ejemplo al cerrarse el modal de permisos) y `useRevisarAlVolver` con `AppState` (vuelve a consultar al regresar de Ajustes). Si usara solo una, la pantalla mostraría un estado viejo: solo `useFocusEffect` no se enteraría del cambio hecho en Ajustes, y solo `AppState` no se enteraría del permiso concedido en el modal. Para las notificaciones no guardo el estado: lo consulto en el momento en que activo "Recordarme".

# Parte D — Permisos en tu app

## D1. Recorrido completo de la cámara

Android 14, app recién instalada. En mi app "Escanear" nunca pide el permiso: muestra "Usar la cámara", que abre la pantalla previa `/permisos/camara`, y ahí "Continuar" muestra el diálogo.

| # | Acción | Qué muestra mi app | status | canAskAgain |
|---|---|---|---|---|
| 1 | "Escanear" por primera vez | un instante "Revisando el permiso…" y después "Usar la cámara" + el ISBN a mano | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | el modal se cierra; sigue "Usar la cámara" | `denied` | `true` |
| 3 | "Escanear" otra vez | "Usar la cámara" | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | pasa a **bloqueado**: pasos en Ajustes y "Abrir Ajustes" | `denied` | `false` |
| 5 | "Escanear" otra vez | bloqueado directo (ya no aparece "Usar la cámara") | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | **concedido**: la cámara leyendo | `granted` | `true` |

### a) En iOS

Lo razono (no tengo iPhone). En iOS el diálogo se muestra **una sola vez**: el primer "No permitir" ya deja `canAskAgain: false`. El resultado cambia en el **paso 2**: ahí ya pasa a bloqueado, con los pasos de iOS. No existe el paso 4.

### b) La línea que decide entre "Continuar" y "Abrir Ajustes"

`permisos.ts:21`:

```ts
if (respuesta.canAskAgain) return 'preguntable';
```

Usa `canAskAgain`. Con `status` no alcanza porque `denied` es igual cuando todavía se puede preguntar (pasos 2-3) y cuando ya no (pasos 4-5). Si decidiera solo por `status`, en el paso 5 mostraría "Continuar" y al tocarlo no pasaría nada. Tengo un test de esto.

### c) ¿Quién se entera de que volvió de Ajustes?

`useRevisarAlVolver` (`useRevisarAlVolver.ts:11`), con `AppState`: vuelve a consultar cuando la app pasa a `active`. Si no existiera, la app seguiría mostrando "bloqueado" aunque ya lo hubiera habilitado, hasta salir y volver a entrar.

## D2. Notificaciones y consistencia

### a) Activa "Recordarme" y toca "Devolver" antes de los 15 s

Si no cancelara, a los 15 s llegaría "Devolvé tu libro" de un libro que ya devolví: un aviso falso que hace que la persona deje de confiar. En mi app "Devolver" cancela la notificación con el id que devuelve el Context. Y si devuelvo mientras se está programando, cuando vuelve el id ya no existe el préstamo y la cancelo ahí mismo (`useRecordatorios.ts:77`):

```ts
if (!definirRecordatorio(prestamo.isbn, id)) await cancelarRecordatorio(id);
```

### b) ¿Dónde guardo el id?

En el préstamo (`notificacionId`), que se guarda en AsyncStorage. Si la app se cierra antes de que llegue, la **notificación la tiene el sistema**, así que llega igual; el **id** vuelve con la app porque está guardado. El problema es que el id puede quedar **viejo** (si la notificación ya llegó, o se reinstaló): el interruptor mentiría. Lo resuelvo al arrancar: pido las notificaciones programadas con `getAllScheduledNotificationsAsync` y limpio los ids que ya no están (`reconciliar`). Si esa consulta falla, dejo todo igual.

### c) El canal antes del permiso en Android 13+

Desde Android 13, mostrar notificaciones necesita el permiso `POST_NOTIFICATIONS`. La documentación de expo-notifications dice: "This prompt will not appear until at least one notification channel is created." O sea, sin un canal creado el diálogo **no aparece**. Por eso `pedirPermisoNotificaciones` crea el canal primero (`notificaciones.ts:59`) y recién después pide el permiso. En **Android 12** ese permiso no existe: las notificaciones están permitidas desde que se instala la app y el pedido devuelve concedido sin mostrar diálogo. El canal igual hace falta (desde Android 8 toda notificación va por un canal), pero no condiciona el pedido.

### d) Permiso denegado y te entregan un libro

Me entero con un **aviso dentro de la app**, en "Mis reservas". El código (`useMostrador.ts:55-56`):

```ts
const notificada = (await permisoConcedido()) && (await notificarLibroDisponible(resultado.titulo));
if (!notificada) agregarAviso(MENSAJES.yaPodesRetirar(resultado.titulo));
```

**Consulta el permiso en ese momento** (`getPermissionsAsync`), no un valor guardado. Importa porque el permiso pudo cambiar en Ajustes: con un valor viejo que dijera "concedido" intentaría una notificación que no se muestra y no dejaría el aviso; la persona no se enteraría por ningún lado. Lo verifiqué: sin permiso, al entregarme un libro quedaron 0 notificaciones y 1 aviso.

## D3. Lo que mi app pide y lo que no

Lo saqué de `npx expo config --type introspect` (corre los mismos plugins que `prebuild`) en una copia, y de los manifest en `node_modules`. (`npx expo prebuild` se cuelga en Windows en el paso que renombra el paquete.)

| Plataforma | Permiso / clave | Qué lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `CAMERA` | escáner | plugin de expo-camera |
| Android | `POST_NOTIFICATIONS` | recordatorio y aviso | manifest de expo-notifications |
| Android | `RECEIVE_BOOT_COMPLETED` | reprogramar recordatorios tras reiniciar | manifest de expo-notifications |
| Android | `VIBRATE` | vibración de las notificaciones (no lo bloqueo) | plantilla de Expo |
| Android | `INTERNET` | red (Metro); es permiso normal | plantilla de Expo |
| Android | RECORD_AUDIO, ubicación, almacenamiento, READ_MEDIA_*, SYSTEM_ALERT_WINDOW con `tools:node="remove"` | ninguna: se **quitan** | yo, con `blockedPermissions` |
| iOS | `NSCameraUsageDescription` (mi texto) | escáner | plugin de expo-camera |
| iOS | **sin** `NSMicrophoneUsageDescription` ni `aps-environment` | — | `microphonePermission: false` y `enableRemoteNotifications: false` |

### a) ¿Por qué no declara RECORD_AUDIO?

Porque expo-camera también sirve para grabar video con sonido, y su plugin agrega `RECORD_AUDIO` por defecto. Mi app solo lee códigos de barras, así que lo apago en el plugin y además lo bloqueo. Fragmento de `app.json`:

```json
[
  "expo-camera",
  {
    "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrirlo al instante",
    "microphonePermission": false,
    "recordAudioAndroid": false
  }
]
```

`microphonePermission: false` hace lo mismo en iOS: no declara el texto del micrófono.

### b) "Elegir una foto de portada desde la galería"

Usaría **expo-image-picker** con `launchImageLibraryAsync`, instalándolo con `npx expo install`. Para elegir de la galería **no hace falta pedir ningún permiso**: la documentación lo dice ("No permissions request is necessary for launching the image library"). Sí revisaría el `app.json` (el plugin agrega CAMERA y almacenamiento por defecto en Android), pondría `microphonePermission: false` y un texto de propósito. Hace falta una **build nueva**, no alcanza con OTA: expo-image-picker trae código nativo y cambia el manifest y el Info.plist, que son parte del binario. La excepción es Expo Go, que ya lo trae incluido, así que para probarlo en clase alcanzaría con recargar.

### c) Lo que no pude verificar en Expo Go

- El **texto de propósito** de la cámara: en Expo Go el diálogo muestra el texto de Expo Go, no el mío.
- `blockedPermissions` y el **manifest**: lo vi con la introspección, no en un binario instalado.
- El **canal "prestamos"** de Android: puede no crearse en Expo Go (por eso el `try/catch`).
- El esquema `bibliotecaipf://`: en Expo Go no abre la app.

Lo verificaría con un **development build** (`npx expo run:android` o `eas build`): ahí vería el diálogo con mi texto, el canal en Ajustes y los permisos reales.

# Parte E — Buenas prácticas y decisiones de diseño

## E1. Revisión de código

### a) Problemas

| # | Línea | Problema | Tipo | Cómo lo corrijo |
|---|---|---|---|---|
| 1 | 18-20 | `useEffect` **sin array de dependencias** | rendimiento (bucle) | array `[intento]` y un hook `useLibros` |
| 2 | 19 | la promesa no tiene `catch` | error de ejecución | `try/catch` y un estado `error` con "Reintentar" |
| 3 | 18-20 | el efecto no tiene limpieza | advertencia | flag `obsoleto` en la limpieza |
| 4 | 10, 22 | `any` | mala práctica | usar el tipo `Libro` |
| 5 | 22-30 | el componente `Fila` está **dentro** de `Catalogo` | rendimiento | declararlo a nivel de módulo (`TarjetaLibro`) |
| 6 | 33-36 | `ScrollView` + `map` | rendimiento | `FlatList` (virtualiza) |
| 7 | 35 | `key={i}` (el índice) | advertencia | `keyExtractor` por ISBN |
| 8 | 11, 14 | pide la cámara **al abrir el Catálogo** | mala práctica | pedirla en el escáner, con pantalla previa |
| 9 | 15 | pide notificaciones al montar | mala práctica | pedirlas al activar "Recordarme", con canal |
| 10 | 24, 37 | `Pressable` sin `accessibilityRole`; botón de ícono sin `accessibilityLabel`; ícono de 28 | accesibilidad | rol, label y área de 44 |
| 11 | 24 | `router` de módulo y `'/libro/' + isbn` | mala práctica | `useRouter`/`Link` tipado |
| 12 | 25 | estilos en línea con color fijo `#333` | mala práctica | `StyleSheet` + tema |
| 13 | 32-41 | sin estados de carga, error ni vacío | mala práctica | `Cargando`, `MensajeError`, `MensajeVacio` |

### b) El primer minuto sin array de dependencias

El efecto corre después de cada render. `obtenerLibros()` devuelve un arreglo **nuevo**, `setLibros` provoca otro render, ese render vuelve a correr el efecto… y así sin parar: en un minuto son unos 75 pedidos, con unos 15 que fallan sin manejarse. Además, como `Fila` está adentro, todas las filas se desmontan y se montan de nuevo cada 800 ms (parpadeo).

Si `obtenerLibros()` devolviera **siempre el mismo array**, en el segundo pedido `setLibros(mismoArray)` no provocaría render (React compara con `Object.is`), y sin render el efecto no vuelve a correr: el bucle se cortaría. El efecto seguiría mal, pero el síntoma desaparecería y sería más difícil de ver. La API de la consigna devuelve objetos nuevos a propósito, justo para que el error se note.

### c) La pantalla reescrita

Es mi Catálogo (`src/app/(tabs)/(catalogo)/index.tsx`): los pedidos y el reintento en `useLibros`, "Vistos recientemente" y "Escanear"/"Buscar" en `EncabezadoCatalogo`, cada fila en `TarjetaLibro` con `Link` tipado y accesibilidad, y los permisos pedidos en el escáner, no acá.

```tsx
export default function Catalogo() {
  const estilos = useEstilos(crearEstilos);
  const { libros, cargando, error, reintentar } = useLibros();

  let estadoSinLibros = <MensajeVacio texto={MENSAJES.catalogoVacio} />;
  if (cargando) estadoSinLibros = <Cargando texto={MENSAJES.cargandoCatalogo} />;
  else if (error) estadoSinLibros = <MensajeError texto={MENSAJES.errorCatalogo} accion="Reintentar" onAccion={reintentar} />;

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <TarjetaLibro libro={item} />}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={estadoSinLibros}
      contentInsetAdjustmentBehavior="automatic"
      style={estilos.pantalla}
    />
  );
}
```

### d) Tienda y desinstalación

- **Rechazo en una tienda:** pedir la cámara y las notificaciones **apenas abre la app**, sin que la persona haga nada que las necesite y sin explicar para qué (líneas 11, 14, 15). Apple (pauta 5.1.1) pide solicitar datos sensibles solo cuando hace falta y con un texto que explique el beneficio.
- **Desinstalación:** lo mismo. Antes de ver un libro le aparecen dos diálogos de permisos; si dice que no, no hay alternativa; y la lista parpadea cada 800 ms por el bucle. La primera impresión es "pide cosas raras y anda mal". Un error escondido como la key por índice quizás nunca lo note; esto lo ve en los primeros segundos.

## E2. Organización y acoplamiento

### a) Qué carpeta importa a cuál

Lo calculé con un script que recorre `src/` y cuenta los imports:

```
app         → components, hooks, constants, lib, context
components  → hooks, constants, types, lib
hooks       → lib, constants, types, context
context     → lib, types, estructuras, constants, hooks
lib         → types, estructuras, constants, data
data        → types
types       → estructuras
constants   → lib
estructuras → (nada)
```

De arriba hacia abajo: `app → components → hooks → lib → (estructuras, data, types, constants)`.

**No hay ninguna importación hacia `src/app`**: ninguna carpeta importa de `app`. Lo que el script marcó como "de costado" son imports de **solo tipos** (`context → hooks`, `types → estructuras`, `constants → lib`), que desaparecen al compilar y no forman ciclos entre archivos.

Un hook que importara de `src/app` sería un problema: se formaría un ciclo, el hook ya no se podría reutilizar ni testear sin la pantalla, y Expo Router trataría ese archivo como una ruta.

### b) Si el catálogo viniera de una API real

Cambiarían pocos archivos: `src/lib/api.ts` (haría `fetch`, misma firma `Promise<Libro[]>`), `src/data/libros.ts` (se borra) y `src/lib/biblioteca.ts` (`crearEstadoInicial` toma las esperas de `data`). Ni las pantallas ni los hooks cambian, porque solo dependen de la firma. Que sean tres archivos me dice que el acceso a datos está detrás de una sola puerta (`api.ts`). El único acoplamiento que podría mejorar es que el estado inicial no dependa de `data/`.

### c) `<ConPermiso recurso="camara">...</ConPermiso>`

**Ganaría** menos código repetido. **Perdería** flexibilidad: mi escáner muestra más cosas además de la cámara (el ISBN a mano, el estado del catálogo, el aviso de ISBN desconocido), y la pantalla previa como ruta propia (`/permisos/[recurso]`) se puede abrir desde cualquier lado y probar por deep link. **Para las notificaciones no sirve**: no envuelven ninguna pantalla, se piden desde un interruptor y lo que hay que hacer con el resultado es una acción (programar o avisar), no mostrar u ocultar hijos. Mi diseño (hook + modal) me sirvió para los dos casos; el envoltorio solo para la cámara.

## E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
|---|---|---|
| `obtenerLibros()` falla | "No pudimos conectarnos…" y "Reintentar" | `useLibros.ts:32` y `MensajeError.tsx` |
| Se abre `/libro/abc` | "Ese ISBN no es válido" y "Volver al catálogo" | `useLibroPorIsbn.ts:18` y `LibroNoEncontrado.tsx` |
| ISBN escaneado que no está | aviso en pantalla; la cámara sigue; no se repite | `useLecturaIsbn.ts:56` |
| Cámara bloqueada | "Cámara: permiso desactivado", pasos, "Abrir Ajustes" y el ISBN a mano | `permisos.ts:21` y `Escaner.tsx:31` |
| Notificaciones denegadas | el interruptor apagado + "Sin notificaciones no podemos recordártelo…"; si te entregan un libro, aviso en Mis reservas | `useRecordatorios.ts:98` y `useMostrador.ts:55` |
| Reservar algo ya reservado | el motivo + "Ver mis reservas"; doble toque → "Esta reserva ya estaba hecha…" | `biblioteca.ts:50-53` y `ConfirmacionReserva.tsx:38` |
| "Entregar al siguiente" con la lista vacía | la fila desaparece; si igual se llama, "Ya no queda nadie esperando ese libro." | `mostrador.ts:12`, `BibliotecaContext.tsx:132`, `useMostrador.ts:43` |
| Login con clave incorrecta | "El usuario o la clave no son correctos…", borra la clave, no navega | `BibliotecaContext.tsx:180` y `FormularioLogin.tsx:28` |

## E4. Decisiones con argumentos

### a) Identificador: ISBN

Elegí el **ISBN** como parámetro de ruta y como key:
- Es lo que lee el escáner: el código EAN-13 de la contratapa **es** el ISBN, así que del escáner al detalle voy directo sin traducir.
- Dos ediciones del mismo título tienen ISBN distinto, y para una biblioteca son libros distintos; un id por título las mezclaría.
- Encaja con lo que devuelve `useLocalSearchParams`, que son strings: el ISBN es un string de dígitos y no hay que convertir ni perder ceros a la izquierda. Con un id numérico tendría el problema del E1 del TP 2: `"12" === 12` da `false`.

El punto débil son los libros **sin ISBN**: ahí usaría un id propio pero también string (`IPF-000123`), y el cambio quedaría en `esIsbnValido` y en los datos.

### b) Estructuras: clase o arreglo

Usé las clases `Pila` y `Cola`. **Me dieron** encapsulamiento (nadie toca `#items` ni se cuela en la fila), el `desencolar` en O(1) (sin `shift()`) y un vocabulario que coincide con el problema ("entregar al siguiente" es `frente()` + `desencolar()`). **Me complicaron** porque React no ve los cambios internos de un objeto mutable (el error de B3): tuve que copiar en cada cambio (perdiendo el O(1)), y no son serializables (tuve que pasarlas a arreglos para AsyncStorage). **Mi postura:** para el estado de React un arreglo inmutable es más simple; la clase conviene cuando vive afuera de React o es muy grande. Acá me quedé con la clase porque la consigna la pide y la copia al escribir encierra el costo en dos funciones.

### c) Memorización

Usé `useMemo` y `useCallback`, y apagué el React Compiler para que se ejecute lo que escribí. **Aportan** en el `value` del Context y sus funciones (`BibliotecaContext.tsx`): sin eso se re-renderizarían todos los consumidores, y además hay efectos que dependen de esas funciones (el de `useMostrador` que cierra la sesión en la limpieza correría en cada render si `cerrarSesion` cambiara). **Serían ruido** el `useCallback` de `reintentar`, que se pasa a un `MensajeError` sin `React.memo` (se re-renderiza igual). **Lo comprobaría** con el Profiler de React DevTools: grabo una interacción, miro renders y tiempos, y repito sin el `useMemo`; si no cambia, era ruido.

### d) Datos duplicados: los disponibles se calculan

Los **calculo**, no los guardo (`lib/biblioteca.ts:24`):

```ts
return Math.max(0, libro.ejemplares - prestados);
```

El error que aparece cuando un dato vive en dos lugares es la **desincronización**: hay que acordarse de actualizar las dos copias en cada operación, y alguna vez no pasa. Si guardara `disponibles`, al devolver (o al rehidratar) podría olvidarme de sumarlo y el detalle diría "0" con el estante lleno. Mi diseño lo evita porque hay **una sola fuente para cada cosa**: `ejemplares` de la API y los préstamos del Context; lo demás se deriva. Además la regla de reserva es una sola función (`preverReserva`) que usan la pantalla y el Context, así que lo que la persona ve antes de confirmar y lo que pasa al confirmar no pueden contradecirse.
