# Respuestas — TP N° 4 "Biblioteca IPF"

Alumno: Natanael Duarte. Las referencias son a archivos del repositorio (`archivo:línea`). La app usa Expo SDK 58.

# Parte B — Estado, efectos y renderizado

## B1. El ciclo de vida de useLibros

### a) Render por render

Mi hook está en `src/hooks/useLibros.ts`. Guarda dos estados: `intento` (línea 20) y `respuesta` (línea 21), que es `{ intento, libros, error }` o `null`. `cargando` no es un estado: lo calculo en cada render (línea 47):

```ts
const cargando = respuesta === null || respuesta.intento !== intento;
```

Lo hice así para no llamar a `setCargando(true)` dentro del efecto: eso es un `setState` síncrono en el efecto (el linter de React lo marca) y además suma un render por cada pedido.

**Cuando todo sale bien:**

| Render | Qué lo provoca | `libros` | `cargando` | `error` | En pantalla |
|---|---|---|---|---|---|
| 1 | Se monta el Catálogo | `[]` | `true` | `false` | "Vistos recientemente", accesos y "Cargando el catálogo…" |
| — | Después del render 1 corre el efecto (línea 23): define `cargar` y llama a `obtenerLibros()`. No cambia ningún estado, así que no hay render. | | | | |
| 2 | ~800 ms después llega la respuesta y se ejecuta `setRespuesta({ intento: 0, libros, error: false })` (línea 31) | los 17 libros | `false` | `false` | La lista |

Son **2 renders**. Si hubiera usado un `useState` para `cargando` y lo pusiera en `true` al empezar el efecto, serían 3 (el del montaje, el del `setCargando(true)` y el de la respuesta).

**Cuando `obtenerLibros()` falla y toco "Reintentar":**

| Render | Qué lo provoca | `libros` | `cargando` | `error` | En pantalla |
|---|---|---|---|---|---|
| 1 | Montaje | `[]` | `true` | `false` | "Cargando el catálogo…" |
| 2 | Falla el pedido: el `catch` hace `setRespuesta({ intento: 0, libros: [], error: true })` (línea 33) | `[]` | `false` | `true` | "No pudimos conectarnos con la biblioteca…" y "Reintentar" |
| 3 | Toco "Reintentar": `reintentar` hace `setIntento(1)` (línea 43). Ahora `respuesta.intento` (0) ≠ `intento` (1) | `[]` | `true` | `false` | "Cargando el catálogo…" |
| — | Después del render 3 React ejecuta la limpieza del efecto anterior (`obsoleto = true` del intento 0) y corre el efecto con `intento = 1`, que hace un pedido nuevo | | | | |
| 4 | Llega la respuesta del intento 1 | 17 libros (o `[]` si vuelve a fallar) | `false` | `false` (o `true`) | La lista (o de nuevo el error) |

En el render 3 `error` vale `false` aunque la respuesta guardada tenga `error: true`, porque en la línea 52 solo lo muestro si no estoy cargando: `error: !cargando && respuesta.error`.

### b) ¿Se desmonta el Catálogo?

Lo comprobé con un `console.log` temporal en la limpieza del efecto de `useLibros`, en una copia del proyecto fuera del repositorio (el repo no tiene ningún `console.log`). Lo corrí con `renderRouter` de `expo-router/testing-library`, que monta mis rutas reales. Esto fue lo que se imprimió en cada paso:

| Paso | Lo que se imprimió |
|---|---|
| Se monta el Catálogo | `EFECTO useLibros intento 0` |
| Cambio a la pestaña "Mis reservas" | nada |
| Vuelvo a "Catálogo" | nada |
| Abro el detalle de *Ficciones* | `EFECTO useLibros intento 0` (es el `useLibros` **del detalle**, que también lo usa) |
| Atrás desde el detalle | `LIMPIEZA useLibros intento 0` (es la limpieza **del detalle**, que se desmonta) |
| Abro `/buscar` (Stack raíz, encima de las tabs) | nada |

O sea: el Catálogo **no** se desmonta al cambiar de pestaña (las tabs mantienen montadas las pantallas que ya se visitaron) ni al abrir un detalle (el Stack de la tab apila el detalle encima y deja el Catálogo montado debajo). Tampoco cuando se abre algo en el Stack raíz.

La limpieza que escribí (`obsoleto = true`, líneas 38 a 40) se ejecuta en la práctica:
- cada vez que toco "Reintentar", porque cambia `intento` y React limpia el efecto anterior antes de correr el nuevo;
- cuando la pantalla que usa el hook se desmonta de verdad: en mi app eso pasa sobre todo con el **detalle**, la **confirmación de reserva**, el **escáner** y el **mostrador**, que también usan `useLibros` y se desmontan al volver atrás. Si la persona sale antes de los 800 ms, la respuesta que llega tarde se descarta y no se hace `setState` sobre una pantalla que ya no existe;
- el Catálogo en sí solo se desmontaría si se descarta toda la `(tabs)` (por ejemplo, al recargar la app).

### c) ¿Por qué no se puede pasar una función async directamente a useEffect?

Porque una función `async` **siempre devuelve una Promise**, y `useEffect` espera que el efecto devuelva `undefined` o una función de limpieza. Si escribiera `useEffect(async () => { … }, [])`, React recibiría una Promise como "limpieza": no la puede ejecutar (en desarrollo avisa que el efecto devolvió algo que no es una función) y, además, perdería la posibilidad de devolver mi limpieza real, porque lo que pusiera en el `return` de la función async quedaría envuelto en la Promise.

Lo resolví definiendo la función async **adentro** del efecto y llamándola, mientras el efecto (que es síncrono) devuelve la limpieza (`src/hooks/useLibros.ts:23-41`):

```ts
useEffect(() => {
  let obsoleto = false;

  async function cargar() {
    try {
      const libros = await obtenerLibros();
      if (!obsoleto) setRespuesta({ intento, libros, error: false });
    } catch {
      if (!obsoleto) setRespuesta({ intento, libros: [], error: true });
    }
  }

  cargar();
  return () => {
    obsoleto = true;
  };
}, [intento]);
```

### d) ¿Cómo implementé reintentar?

`reintentar` solo incrementa un contador (`src/hooks/useLibros.ts:43`):

```ts
const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), []);
```

Lo que hace que el pedido se vuelva a ejecutar es que `intento` está en el array de dependencias del efecto (línea 41). Al cambiar, React ejecuta la limpieza del efecto anterior y vuelve a correr el efecto, que hace un pedido nuevo.

¿Por qué un contador y no otro valor?
- Necesito un valor que sea **distinto cada vez** que toco el botón. Un booleano (`setReintentar(true)`) no sirve: la segunda vez pasaría de `true` a `true` y React no volvería a correr el efecto.
- Tampoco sirve depender de `error` o de `libros`: si el pedido vuelve a fallar, `error` sigue siendo `true` y no cambia nada; y depender de `libros` haría un bucle (cada respuesta trae objetos nuevos y volvería a pedir).
- Además, el número me sirve para saber a qué pedido corresponde cada respuesta: guardo `intento` dentro de `respuesta` y así derivo `cargando` (línea 47). Con `Date.now()` también cambiaría siempre, pero el contador es más claro y predecible.
- Uso la forma funcional (`anterior => anterior + 1`) para que `reintentar` no dependa de `intento` y sea estable (`useCallback` con `[]`).

## B2. La condición de carrera del buscador

Mi buscador (`src/hooks/useBusqueda.ts`) tiene además un debounce de 300 ms, así que con mi código el pedido de "bor" ni siquiera sale. Lo verifiqué en una copia del proyecto fuera del repo, con un test que reemplaza `buscarLibros` por uno con demoras fijas ("bor" 1.400 ms, "borges" 300 ms) y temporizadores falsos de Jest. La columna "sin limpieza" es un efecto que hace `buscarLibros(q).then(setResultados)` sin limpieza ni debounce; la otra es mi hook real.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe "bor" → se pide `buscarLibros("bor")`, que tarda 1.400 ms | El pedido de "bor" sale enseguida. En la lista no hay nada todavía. | "Buscando…". Todavía no se pide nada: arranca el temporizador de 300 ms. |
| t = 200 ms | Escribe "borges" → se pide `buscarLibros("borges")`, que tarda 300 ms | Sale el pedido de "borges"; ahora hay dos pedidos en vuelo. La lista sigue vacía. | La limpieza del efecto anterior cancela el temporizador de "bor" (ese pedido nunca sale) y arranca uno nuevo para "borges". "Buscando…". |
| t = 500 ms | Llega la respuesta de "borges" | Se muestran los resultados de "borges". | Recién ahora vence el debounce y sale el pedido de "borges" (llega a los 800 ms). Se sigue viendo "Buscando…". A los 800 ms aparecen los resultados de "borges". |
| t = 1.400 ms | Llega la respuesta de "bor" | Se muestran los resultados de **"bor"**, que pisan a los de "borges": el campo dice "borges" pero la lista es de la búsqueda vieja. | No cambia nada: siguen los resultados de "borges". |

Salida literal de la verificación:

```
SIN LIMPIEZA
t=0 pide "bor"
t=200 pide "borges"
t=500 llega "borges"
t=1400 llega "bor"
t=0 []   t=200 []   t=500 ["borges"]   t=1400 ["bor"]

CON MI CÓDIGO
t=500 pide "borges"
t=800 llega "borges"
t=0 cargando   t=200 cargando   t=500 cargando   t=800 ["borges"]   t=1400 ["borges"]
```

En mi catálogo "bor" y "borges" encuentran los mismos dos libros (*Ficciones* y *El Aleph*), así que en este caso el error no se notaría a simple vista; con otras búsquedas (por ejemplo "sa" y después "sabato") la lista vieja sí sería distinta, o mostraría "No encontramos libros…" de una búsqueda anterior.

También probé el caso en que **sí** salen los dos pedidos (escribiendo con pausas de más de 300 ms): "bor" se pidió a los 300 ms y "borges" a los 700 ms; "borges" llegó a los 1.000 ms y "bor" a los 1.700 ms. En pantalla quedó `["borges"]` todo el tiempo, porque la respuesta de "bor" llegó con su flag `obsoleta` en `true`.

### a) Qué hace la limpieza

La limpieza está en `src/hooks/useBusqueda.ts:42-45`:

```ts
return () => {
  clearTimeout(temporizador);
  obsoleta = true;
};
```

Hace dos cosas:
1. `clearTimeout(temporizador)`: si la persona todavía no dejó de escribir durante 300 ms, el pedido de la búsqueda vieja **nunca se hace**.
2. `obsoleta = true`: si el pedido ya había salido, cuando llegue la respuesta el `if (!obsoleta)` de las líneas 33 y 35 evita el `setRespuesta`. Cada ejecución del efecto tiene su propia variable `obsoleta` (vive en la clausura de esa ejecución), así que marcar la vieja no afecta a la nueva.

Se ejecuta **antes de que el efecto vuelva a correr**, es decir, en el render siguiente a cada cambio de `consulta` o de `intento` (línea 46), y también cuando la pantalla se desmonta. Como protección extra, la respuesta guarda la `consulta` y el `intento` y solo se muestra si coinciden con los actuales (`vigente`, línea 50).

### b) La propuesta del compañero: `if (texto === q) setResultados(datos)`

No funciona. La función del `.then()` es una **clausura**: se creó durante un render determinado y "ve" el valor de `q` de **ese** render, no el actual. Como el pedido se hizo con `texto = q` de ese mismo render, cuando llega la respuesta la comparación es `"bor" === "bor"`, siempre verdadera, aunque la persona ya haya escrito "borges". El valor nuevo de `q` vive en otro render, en otra clausura, y la función vieja no lo puede ver.

En JavaScript una función recuerda las variables del ámbito donde se creó con el valor que tenían en ese momento (en un componente, cada render es un ámbito nuevo con sus propias constantes). Para que la idea funcionara habría que comparar contra un valor que no quede congelado, por ejemplo un `useRef` con la última consulta (`if (texto === ultimaConsulta.current)`). La limpieza con el flag hace lo mismo de forma más directa: no necesito saber cuál es la búsqueda actual, solo que la mía dejó de serlo.

### c) La URL y el botón atrás

Mientras escribo, cada cambio llama a `router.setParams({ q: texto })` (`src/app/buscar.tsx:39`). La URL va cambiando: `/buscar?q=b`, `/buscar?q=bo`, `/buscar?q=bor`… pero `setParams` **reemplaza los parámetros de la pantalla actual**: no agrega entradas al historial. El botón atrás sale del buscador de una vez y vuelve a la pantalla anterior (por ejemplo, el Catálogo).

El `TextInput` no lee directamente de la URL: tiene un estado local en `CampoBusqueda` (`src/components/CampoBusqueda.tsx:20`) que se actualiza en el acto y se copia a la URL en cada cambio (líneas 22 a 25). Así el campo responde al instante aunque la actualización de la URL tarde un poco.

Con `router.push` cada letra sería una pantalla nueva en el Stack: después de escribir "borges" habría seis buscadores apilados y para salir habría que tocar atrás seis veces, viendo cómo se "borra" la búsqueda de a una letra. Además, cada `push` monta un componente nuevo: el campo perdería el foco y el teclado en cada tecla.

## B3. Mutar o reemplazar

### a) Toca "Anotarme" tres veces

El texto sigue mostrando **"Personas en espera: 0"**. `encolar` modifica el arreglo privado de la Cola, pero nadie le avisa a React: no hay ningún `setState`. React solo vuelve a renderizar cuando cambia un estado (o las props, o un contexto); el objeto `espera` que devuelve `useState` sigue siendo la misma referencia, así que no hay render y el texto que ya está en pantalla no se actualiza. Por dentro la cola sí tiene a "Ana" tres veces.

### b) El número "salta" a 3 al escribir

Cuando la persona escribe en un `TextInput` controlado, su `onChangeText` hace un `setState`, y eso sí provoca un render. En ese render se vuelve a evaluar `espera.tamanio`, que ahora es 3 (la cola estaba mutada desde antes), y el texto "salta". El valor estaba bien guardado; lo que faltaba era un render que lo mostrara.

Un error que aparece "a veces" es peor que uno que aparece siempre porque:
- depende de algo que no tiene relación (escribir en otro campo, un temporizador, el padre que se re-renderiza…), así que es muy difícil de reproducir y de explicar;
- puede pasar las pruebas: si justo algo re-renderiza, "funciona";
- la persona ve datos viejos sin saberlo y puede tomar decisiones con ellos (por ejemplo, creer que no hay nadie esperando);
- un error que aparece siempre se detecta enseguida y se arregla; uno intermitente llega a producción.

### c) Cómo lo resolví en mi Context

Nunca muto la Cola ni la Pila guardadas en el estado. Uso **copia al escribir**: cada cambio crea una estructura nueva desde `aArray()` y aplica el cambio sobre la copia (`src/lib/copiaAlEscribir.ts:22-32`):

```ts
export function cambiarCola<T>(original: Cola<T>, cambio: (copia: Cola<T>) => void): Cola<T> {
  const copia = colaDesde(original.aArray());
  cambio(copia);
  return copia;
}
```

Y en el Context, al anotarme en una espera (`src/context/BibliotecaContext.tsx:75-82`):

```ts
if (resultado.tipo === 'espera') {
  const cola = actual.esperas[libro.isbn] ?? new Cola<string>();
  aplicar({
    ...actual,
    esperas: { ...actual.esperas, [libro.isbn]: cambiarCola(cola, (copia) => copia.encolar(USUARIO)) },
    titulos: { ...actual.titulos, [libro.isbn]: libro.titulo },
  });
}
```

`aplicar` (línea 53) guarda el estado nuevo en un ref y llama a `setEstado`. Como la cola es otra referencia, React re-renderiza a quienes la usan. Tengo tests que verifican que la original no cambia (`src/lib/__tests__/copiaAlEscribir.test.ts`).

Comparación con otras alternativas:

| Alternativa | Ventaja | Costo |
|---|---|---|
| **Crear una cola nueva a partir de la anterior** (la mía) | React detecta el cambio por referencia. Las instancias viejas no cambian nunca: un `useMemo` o un efecto que dependa de la cola se recalcula cuando debe, y lo que ya se guardó (por ejemplo, en AsyncStorage) es una foto fija. Se puede testear que la original queda intacta. | Copia O(n) en cada cambio y más objetos para el recolector de basura. Con listas de espera de pocas personas no se nota. Hay que acordarse de usar siempre `cambiarCola` (lo resolví centralizando todos los cambios en el Context). |
| **Contador de versión** (`espera.encolar('Ana'); setVersion(v => v + 1)`) | No copia nada: O(1). Es el cambio más chico sobre el fragmento original. | La instancia guardada se sigue mutando: cualquier `useMemo`/`useEffect` que tenga a `espera` como dependencia no se entera (es la misma referencia); un render que se interrumpe puede ver la cola a mitad de un cambio; y si alguien se olvida el `setVersion`, vuelve exactamente el error de B3. Tengo dos estados que tienen que moverse juntos. |
| **useReducer** | Centraliza todas las transiciones en una función pura, fácil de testear y de leer ("encolar", "entregar"…). | No evita copiar: el reducer tiene que devolver un estado nuevo (si mutara, en modo estricto React llama al reducer dos veces y encolaría a "Ana" dos veces). Además el reducer no le puede devolver un resultado a quien hizo el `dispatch`, y mi `reservar` tiene que devolver `préstamo`/`espera`/`repetido` en el momento; por eso usé `useState` + un ref (`estadoRef`, línea 50) que siempre tiene el estado más nuevo, así un doble toque en "Confirmar" ve la reserva ya hecha. |

## B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | En la **URL** (`q`, leído con `useLocalSearchParams` en `src/app/buscar.tsx:18`) y espejado en un **estado local** de `CampoBusqueda` (`src/components/CampoBusqueda.tsx:20`) | En la URL se puede compartir y abrir por deep link (`/buscar?q=borges`) y sobrevive al volver atrás desde un detalle. El estado local es solo para que el campo responda al instante mientras se tipea. No tiene sentido en el Context: no lo usa ninguna otra pantalla. |
| Préstamos y reservas | **Context** (`prestamos` en `src/context/BibliotecaContext.tsx`), persistido en **AsyncStorage** | Los usan varias pantallas (detalle, confirmación, Mis reservas, mostrador) y tienen que sobrevivir a la navegación y a cerrar la app. En un estado local se perderían al desmontar la pantalla. |
| Listas de espera | **Context** (`esperas`: una `Cola<string>` por ISBN), persistidas en AsyncStorage como arreglos | Las modifican la confirmación de reserva y el mostrador, y las leen el detalle y Mis reservas. Una sola fuente de verdad evita que dos pantallas vean filas distintas. |
| Vistos recientemente | **Context** (`recientes`: una `Pila`), persistido | Lo escribe el detalle y lo lee el Catálogo, que son pantallas distintas. |
| Sesión del personal | **Context** (`sesion`), **sin** persistir | La necesita el layout raíz para `Stack.Protected` y el link "Personal". No la guardo en AsyncStorage a propósito: al reabrir la app hay que volver a ingresar. Tampoco va en la URL: cualquiera podría escribir `/mostrador`. |
| Ejemplares disponibles de un libro | **Se calcula** con `calcularDisponibles(libro, prestamos)` (`src/lib/biblioteca.ts:24-26`), en cada render del detalle (`src/components/DetalleLibro.tsx:20`) | Sale de dos datos que ya existen (`ejemplares` de la API y los préstamos del Context). Si lo guardara, tendría que mantenerlo sincronizado a mano en cada reserva y devolución (ver E4d). |
| Estado del permiso de cámara | En el **sistema operativo**. Mi app guarda una copia local en `usePermiso` (`src/hooks/usePermiso.ts`) que vuelvo a consultar al recuperar el foco y al volver a primer plano | La verdad la tiene el sistema y puede cambiar afuera de la app (en Ajustes). Si lo guardara en el Context o en AsyncStorage quedaría viejo. |
| Identificador de la notificación programada | En el **préstamo** (`notificacionId`, Context), persistido en AsyncStorage. La notificación en sí la tiene el sistema | Lo necesito para cancelarla al devolver o al apagar "Recordarme", aunque la app se haya cerrado en el medio. Al arrancar lo comparo con `getAllScheduledNotificationsAsync` y limpio los que ya no existen. |

**¿Qué se re-renderiza cuando cambia el `value` del Context?** Todos los componentes que llaman a `useBiblioteca()` (que usa `useContext`), aunque usen un solo campo. En mi app son: `NavegadorRaiz` (`src/components/NavegadorRaiz.tsx:10`), `EnlacePersonal` (`src/components/EnlacePersonal.tsx:11`), `VistosRecientemente` (`src/components/VistosRecientemente.tsx:12`), `DetalleLibro` (línea 19), `ConfirmacionReserva` (línea 27), `FormularioLogin` (línea 17), `ItemReservas` (línea 14) y los componentes que usan `useMisReservas`, `useRecordatorios`, `useMostrador` y `useRegistrarReciente`. El `value` está memorizado con `useMemo` (`src/context/BibliotecaContext.tsx:193`) y las funciones con `useCallback`, así que solo cambia cuando cambia algún dato, no en cada render del provider.

**Si el Catálogo solo usa "recientes", ¿se re-renderiza al activar un recordatorio en otra pestaña?** La pantalla del Catálogo en sí no llama a `useBiblioteca()`, así que no. Pero `VistosRecientemente` (dentro del encabezado del Catálogo) y `EnlacePersonal` (en su header) sí: activar un recordatorio cambia `prestamos`, eso crea un `value` nuevo y esos dos componentes se vuelven a renderizar aunque `recientes` y `sesion` no hayan cambiado. También se re-renderiza `NavegadorRaiz`.

**¿Cómo lo evitaría?**
- Dividir el Context en varios (`SesionContext`, `RecientesContext`, `PrestamosContext`…), para que cada componente se suscriba solo a lo que usa.
- Usar un store externo con selectores (`useSyncExternalStore`, o una librería como Zustand), donde el componente se re-renderiza solo si cambia el pedazo que seleccionó.
- `React.memo` no alcanza: un componente memorizado igual se re-renderiza si el contexto que consume cambia.

**¿Vale la pena acá?** No. Son pocos componentes, livianos, y los cambios del Context ocurren por acciones de la persona (reservar, devolver, activar un recordatorio), no muchas veces por segundo. Dividir el Context complicaría el código (más providers y más archivos) sin una mejora que alguien pueda notar. Antes de optimizar lo mediría con el Profiler de React DevTools ("Highlight updates when components render"); si un render costara mucho, empezaría por separar la sesión, que es lo que lee el layout raíz.

# Parte C — Navegación y rutas

Mis navegadores (ver el árbol en el README):
- **Stack raíz**: `src/components/NavegadorRaiz.tsx`, que renderiza `src/app/_layout.tsx` (anchor `'(tabs)'`, `src/app/_layout.tsx:14`).
- **Tabs**: `src/app/(tabs)/_layout.tsx` ("Catálogo" y "Mis reservas").
- **Stack de la tab Catálogo**: `src/app/(tabs)/(catalogo)/_layout.tsx` (anchor `'index'`, línea 6), con `index` y `libro/[isbn]`.

## C1. La pila en tu app

Las pilas las comprobé en una copia del proyecto fuera del repo con `renderRouter` (`expo-router/testing-library`) sobre mis rutas reales, imprimiendo `getRouterState()` después de cada paso. Escribo de base a tope.

| # | Acción | Pilas resultantes |
|---|---|---|
| 1 | Abre la app. | Stack raíz: `[(tabs)]` · Tabs: Catálogo activa · Stack de la tab Catálogo: `[index]` |
| 2 | Toca un libro del Catálogo. | Stack raíz: `[(tabs)]` · Stack de la tab Catálogo: `[index, libro/9788499089508]` |
| 3 | Toca "Reservar". | Stack raíz: `[(tabs), reservar/9788499089508 (modal)]` · Stack de la tab Catálogo: `[index, libro/9788499089508]` |
| 4 | Toca "Confirmar". | Stack raíz: `[(tabs)]` (el modal sale) · Tabs: **Mis reservas** activa · Stack de la tab Catálogo: `[index, libro/9788499089508]` (queda guardado) |
| 5 | Toca atrás (Android). | Stack raíz: `[(tabs)]` · Tabs: **Catálogo** activa · Stack de la tab Catálogo: `[index, libro/9788499089508]` → se ve el detalle |
| 6 | Toca la tab "Catálogo". | Stack raíz: `[(tabs)]` · Stack de la tab Catálogo: `[index]` → se ve el Catálogo |

Salida de la verificación (resumida):

```
1 /                        __root{(tabs){(catalogo){index}}}
2 /libro/9788499089508     __root{(tabs){(catalogo){index, libro/[isbn]} | activa=(catalogo)}}
3 /reservar/9788499089508  __root{(tabs){(catalogo){index, libro/[isbn]} | activa=(catalogo)}, reservar/[isbn]}
4 /reservas                __root{(tabs){(catalogo){index, libro/[isbn]}, reservas | activa=reservas}}
5 /libro/9788499089508     __root{(tabs){(catalogo){index, libro/[isbn]}, reservas | activa=(catalogo)}}
6 /                        __root{(tabs){(catalogo){index}}}
```

En el paso 5 la tab "Mis reservas" no tiene historia propia; el router de las tabs tiene `backBehavior: 'firstRoute'` por defecto (lo vi en `node_modules/expo-router/build/react-navigation/routers/TabRouter.js`), así que atrás vuelve a la primera tab, que conserva su Stack con el detalle arriba. El paso 5 lo simulé con `router.back()`, que es lo que dispara el botón atrás físico; el botón físico en sí lo tengo que probar en el teléfono.

### a) ¿Qué método usé en el paso 4?

`router.dismissTo('/reservas')` (`src/components/ConfirmacionReserva.tsx:45`), después de aplicar la reserva con `reservar(libro)` (línea 37). `dismissTo` va hacia atrás en el Stack raíz hasta la `(tabs)` que ya existe (saca el modal) y dentro de ella cambia a la tab "Mis reservas".

Qué habría pasado con cada opción:
- **`push('/reservas')`**: el Stack raíz quedaría `[(tabs), reservar (modal), (tabs)']`: una **segunda** instancia de las tabs encima del modal, porque `/reservas` vive dentro de `(tabs)`. Atrás volvería a la confirmación, y la persona podría tocar "Confirmar" otra vez.
- **`replace('/reservas')`**: el modal se reemplaza, pero por otra `(tabs)`: el Stack raíz queda `[(tabs), (tabs)']`. Atrás no vuelve a la confirmación, pero sí a la `(tabs)` vieja con el detalle; hay dos Catálogos montados (y dos pedidos a la API).
- **`dismissTo('/reservas')`** (el que usé): `[(tabs)]` con "Mis reservas" activa. Atrás nunca vuelve a la confirmación y no hay tabs duplicadas.

Elegí `dismissTo` porque cumple las dos cosas que pide la consigna (llevar a `/reservas` y que atrás no vuelva a la confirmación) sin duplicar navegadores. Mientras el modal se cierra sigo mostrando lo que se confirmó (estado `confirmado`, línea 29), porque el Context ya cambió y la previsión diría "ya reservado".

### b) En el paso 6, ¿qué ve la persona?

Ve el **Catálogo**. Al tocar una tab que ya está enfocada, el Stack de esa tab hace `popToTop`: el native stack escucha el evento `tabPress` y, si la tab está enfocada y hay más de una pantalla, vuelve a la primera (lo vi en `node_modules/expo-router/build/react-navigation/native-stack/navigators/createNativeStackNavigator.js`). Si en cambio la persona tocara "Catálogo" estando en "Mis reservas" (sin pasar por el atrás del paso 5), vería primero el detalle, porque el Stack de la tab conservó `[index, libro]`, y con un segundo toque volvería al Catálogo.

Me parece correcto para esta app: es el comportamiento estándar de las apps con pestañas en Android e iOS (cada pestaña recuerda dónde estabas y tocarla de nuevo te lleva a su inicio), y la persona nunca queda sin salida.

## C2. El escáner que dispara de más

### a) `router.push` sin protección

`onBarcodeScanned` se llama muchas veces por segundo mientras el código sigue frente a la cámara. Cada llamada a `router.push` agrega una acción a la cola de acciones de navegación; el navegador las procesa en orden, como la cola del TP 2, y cada una apila un detalle más. Resultado: cinco o diez detalles del mismo libro uno encima del otro, animaciones encadenadas y la persona tiene que tocar atrás muchas veces (y cada atrás vuelve a mostrar el mismo libro). Además, como el detalle vive dentro de `(tabs)`, desde el Stack raíz cada `push` crearía otra `(tabs)` encima.

### b) ¿useState o useRef?

Usé **`useRef`** (`src/hooks/useLecturaIsbn.ts:16`), y la protección está en `abrir` (líneas 36 a 45):

```ts
const navegando = useRef(false);
// ...
const abrir = useCallback(
  (isbn: string) => {
    if (navegando.current) return;
    navegando.current = true;
    router.dismissTo({ pathname: '/libro/[isbn]', params: { isbn } });
  },
  [router],
);
```

Un `useState` puesto en `true` en el primer escaneo no alcanza porque `setNavegando(true)` no cambia la variable en el momento: pide un render nuevo. Todas las llamadas de `onBarcodeScanned` que llegan antes de ese render usan la función creada en el render anterior, cuya clausura tiene `navegando === false`, así que todas pasan el `if` y navegan. El ref, en cambio, es el mismo objeto en todos los renders y `navegando.current = true` se ve en la llamada siguiente, aunque no haya habido render. El ref vuelve a `false` cuando la pantalla recupera el foco (línea 24).

### c) ¿Por qué conviene replace para ir del escáner al detalle?

Porque el escáner no tiene que quedar debajo del detalle: si la persona toca atrás, lo esperable es volver al Catálogo, no a la cámara (que además se volvería a encender y podría leer otra vez el mismo código). Con **`push`**, atrás volvería al escáner.

En mi app, en lugar de `replace` uso **`router.dismissTo`** (línea 42), porque en el SDK 58 un `replace` desde el Stack raíz (donde está `/escanear`) hacia una ruta de la tab Catálogo crea **otra** `(tabs)` en lugar de usar la existente:

| Método | Stack raíz después | Stack de la tab Catálogo | Atrás desde el detalle |
|---|---|---|---|
| `push` | `[(tabs), escanear, (tabs)']` | en `(tabs)'`: `[index, libro]` | vuelve al escáner (cámara prendida) y quedan dos tabs |
| `replace` | `[(tabs), (tabs)']` | en `(tabs)'`: `[index, libro]` | vuelve a la `(tabs)` original: tabs duplicadas |
| `dismissTo` (el mío) | `[(tabs)]` | `[index, libro]` | vuelve al Catálogo |

`dismissTo` logra lo que se busca con `replace` (que el escáner salga de la pila) sin duplicar las tabs.

### d) ISBN que no está en el catálogo

La app muestra un aviso **en la pantalla** (no un `Alert`, que frenaría todo): "El código … no es de ningún libro de la biblioteca. Probá con otro libro o escribí el ISBN abajo." y **sigue escaneando** (`src/hooks/useLecturaIsbn.ts:47-61`). Para que no aparezca diez veces seguidas guardo el último código desconocido en un ref (líneas 56 a 58):

```ts
if (ultimoDesconocido.current === isbn) return;
ultimoDesconocido.current = isbn;
setAviso(MENSAJES.isbnEscaneadoDesconocido(isbn));
```

Si el mismo código sigue frente a la cámara, las llamadas siguientes salen en el `return`. Un efecto con un temporizador de 4 segundos borra el aviso y su limpieza hace `clearTimeout` (líneas 30 a 34); si aparece un código distinto, el aviso se reemplaza y la limpieza cancela el temporizador anterior antes de empezar uno nuevo. Además, mientras el catálogo está cargando o falló, la cámara no consume lecturas: `onBarcodeScanned` queda en `undefined` (`src/components/VisorCamara.tsx:25`).

## C3. Deep links y rutas protegidas

Probé cada link en la copia de verificación con `renderRouter(..., { initialUrl })`, que hace lo mismo que abrir la URL al iniciar la app. En el teléfono, con Expo Go, el equivalente es `exp://IP:8081/--/libro/9788499089508`, etc. (las URL están en la tabla del README).

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte de mi código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9788499089508` | El detalle de *Ficciones* (título en el header, disponibles, espera y "Reservar") | El Catálogo: Stack de la tab `[index, libro]` dentro de `(tabs)`; atrás → Catálogo | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx:6` y la validación de `src/hooks/useLibroPorIsbn.ts:18-24` |
| `bibliotecaipf://libro/123` | "Ese ISBN no es válido", el mensaje "123 no es un ISBN: tiene que tener 13 números, sin letras." y "Volver al catálogo" | Igual: el Catálogo | `esIsbnValido` en `src/hooks/useLibroPorIsbn.ts:18` y `src/components/LibroNoEncontrado.tsx` |
| `bibliotecaipf://buscar?q=borges` | El buscador con "borges" escrito y sus resultados | Las tabs con el Catálogo: Stack raíz `[(tabs), buscar]`; atrás → Catálogo | `anchor: '(tabs)'` en `src/app/_layout.tsx:14`; `q` se lee con `useLocalSearchParams` en `src/app/buscar.tsx:18` |
| `bibliotecaipf://mostrador` (sin sesión) | El login (modal "Ingreso del personal") | Las tabs: Stack raíz `[(tabs), login]`; al ingresar, el login se reemplaza por el mostrador | `Stack.Protected guard={sesion} redirectTo="/login"` en `src/components/NavegadorRaiz.tsx:28` |
| `bibliotecaipf://reserva` | "Mis reservas" | El Stack raíz queda `[(tabs), (tabs)']`: abajo, la `(tabs)` del anchor con el Catálogo; arriba, otra `(tabs)` con "Mis reservas". Atrás → Catálogo | `<Redirect href="/reservas" />` en `src/app/reserva.tsx:5`, que hace un `replace` desde el Stack raíz |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner en estado bloqueado: "Cámara: permiso desactivado", pasos en Ajustes, "Abrir Ajustes" y el campo para escribir el ISBN a mano | Las tabs: Stack raíz `[(tabs), escanear]` | `anchor: '(tabs)'`; `usePermiso('camara')` y `estadoDesde` deciden el estado (`src/components/Escaner.tsx:29-32`) |

Sobre `/reserva`: el `<Redirect>` de expo-router hace `router.replace` (lo vi en `node_modules/expo-router/build/link/Redirect.js`), y un replace desde el Stack raíz hacia una ruta de las tabs crea otra `(tabs)`. Probé dos alternativas para evitarlo (marcar la `(tabs)` como `dangerouslySingular` y mover `reserva.tsx` adentro de `(tabs)` oculta de la barra) y ninguna funcionó bien: la primera seguía duplicando y la segunda terminaba en `/`. Como la persona igual ve "Mis reservas" y atrás la lleva al Catálogo, dejé el `<Redirect>` en el raíz, como pide la consigna.

En Expo Go, la URL con el esquema `bibliotecaipf://` no abre la app (el esquema propio lo registra un development build); por eso las pruebas en el teléfono son con `exp://IP:8081/--/…`.

**¿Por qué `/libro/123` llega a mi pantalla de detalle aunque no exista ese libro?** Porque Expo Router solo compara la **forma** de la URL con el árbol de archivos: `libro/[isbn].tsx` es un segmento dinámico que acepta cualquier valor, así que `123` es un `isbn` tan válido como cualquier otro para el router. El router no sabe nada de libros ni de ISBN. La responsabilidad de responder bien es de **mi pantalla**: tiene que validar el parámetro (formato y existencia) y mostrar un mensaje claro con una salida. Por eso todo pasa por `useLibroPorIsbn` (`src/hooks/useLibroPorIsbn.ts`), que también usa la confirmación de reserva.

## C4. Foco, montaje y primer plano

### a) Qué detecta cada una

- **`useEffect` con `[]`**: el **montaje** del componente (y su desmontaje, en la limpieza). Corre una sola vez mientras el componente siga montado.
- **`useFocusEffect`**: que la pantalla **gana el foco** dentro de la navegación (y en la limpieza, que lo pierde): al montarse enfocada, al volver desde otra pantalla apilada encima, al cerrarse un modal o al volver a su tab.
- **`AppState`**: que **la app entera** cambia entre primer plano y segundo plano (`active`, `background`, `inactive`), por ejemplo al ir a Ajustes y volver.

### b) Quién se entera

- La persona sale a Ajustes, habilita las notificaciones y vuelve: se entera solo **AppState** (la app pasa de `background` a `active`). Para la navegación la pantalla nunca perdió el foco y el componente nunca se desmontó.
- Va a la pestaña Catálogo y vuelve a "Mis reservas": se entera solo **`useFocusEffect`**. Las tabs no desmontan la pantalla (lo comprobé en B1b), así que un `useEffect` con `[]` no vuelve a correr, y la app nunca salió de primer plano.

### c) Cuáles usé

En `usePermiso` (`src/hooks/usePermiso.ts`) uso **las dos que hacen falta juntas**:
- `useFocusEffect` (línea 65): consulta al montar y cada vez que la pantalla recupera el foco. Es lo que hace que el escáner cambie de estado solo cuando se cierra el modal `/permisos/camara`. Tiene limpieza: un flag `vigente` descarta la respuesta si la pantalla perdió el foco antes de que llegara.
- `useRevisarAlVolver` (línea 84; `src/hooks/useRevisarAlVolver.ts:11-14`): se suscribe a `AppState` y vuelve a consultar cuando la app pasa de no activa a `active`, por ejemplo al volver de Ajustes. La suscripción se limpia con `suscripcion.remove()`.

No uso un `useEffect` con `[]` aparte porque `useFocusEffect` ya corre al montar si la pantalla está enfocada.

En "Mis reservas" no guardo el estado del permiso de notificaciones: lo **consulto en el momento** en que la persona activa "Recordarme" (`src/hooks/useRecordatorios.ts:111`) y, si se abrió el modal, otra vez cuando la pantalla recupera el foco (línea 85). Así nunca decido con un valor viejo.

Si hubiera usado solo una:
- Solo `useEffect` con `[]`: el escáner seguiría mostrando "preguntable" después de conceder el permiso en el modal (la pantalla no se desmonta) y "bloqueado" después de habilitarlo en Ajustes.
- Solo `useFocusEffect`: si la persona tiene el escáner abierto, va a Ajustes, habilita la cámara y vuelve, la pantalla seguiría en "bloqueado" (nunca perdió el foco) hasta que saliera y volviera a entrar.
- Solo `AppState`: después de cerrar el modal de permisos la pantalla seguiría en "preguntable", porque la app nunca salió de primer plano.
