# Modal

Componente React reutilizable que combina un botón trigger y un diálogo modal animado. Gestiona su propio estado de apertura/cierre, animaciones de entrada y salida, accesibilidad WAI-ARIA y trampa de foco.

---

## Instalación

El componente requiere dos archivos en el mismo directorio:

```
components/
└── modal/
    ├── index.tsx
    └── modal.css
```

No tiene dependencias externas; usa solo React y CSS propio.

---

## Uso básico

```tsx
import Modal from "@/components/modal"

<Modal title="Editar usuario">
  <p>Contenido del modal aquí.</p>
</Modal>
```

El botón trigger se renderiza en línea donde se coloque el componente. Al pulsarlo aparece el modal centrado en la pantalla con animación.

---

## Props

### `title`

```ts
title?: string
```

Texto que se muestra en el encabezado del modal **y** como etiqueta del botón trigger (cuando no se usa `type="btn"`).

Si se omite, el encabezado del modal muestra `"Modal"` por defecto.

---

### `icon`

```ts
icon?: React.ReactNode
```

Ícono que aparece tanto en el botón trigger como en el encabezado del modal. Acepta cualquier nodo React (componente SVG, imagen, emoji, etc.).

```tsx
import { Pencil } from "lucide-react"

<Modal title="Editar" icon={<Pencil size={16} />}>
  ...
</Modal>
```

---

### `children`

```ts
children: React.ReactNode | (() => React.ReactNode)
```

Contenido que se renderiza dentro del cuerpo del modal. Acepta nodos React estáticos o una función que los retorna (útil para diferir la construcción del árbol hasta la primera apertura).

```tsx
// Nodo estático
<Modal title="Info">
  <p>Texto del modal.</p>
</Modal>

// Función (lazy factory)
<Modal title="Info" lazy={false}>
  {() => <FormularioPesado />}
</Modal>
```

---

### `buttonText`

```ts
buttonText?: string    // default: "Guardar"
```

Etiqueta del botón de confirmación en el footer del modal.

```tsx
<Modal title="Eliminar" buttonText="Confirmar eliminación">
  ...
</Modal>
```

---

### `buttonClassName`

```ts
buttonClassName?: string
```

Clases CSS adicionales que se aplican al botón trigger. El componente incluye variantes predefinidas en `modal.css`:

| Clase | Descripción |
|-------|-------------|
| *(sin clase)* | Fondo oscuro `#020817`, texto blanco |
| `outline` | Fondo transparente, borde oscuro. Al hover invierte colores |
| `secondary` | Fondo gris `#6c757d` |
| `danger` | Fondo rojo `#dc3545` |

```tsx
<Modal title="Eliminar" buttonClassName="danger">
  ...
</Modal>
```

---

### `onclick`

```ts
onclick?: () => void
```

Callback que se ejecuta al pulsar el botón de confirmación (Guardar). Se llama **antes** de cerrar el modal. Si se usa `onValidateClose`, el cierre ocurre solo si la validación pasa; el `onclick` se ejecuta igualmente.

```tsx
<Modal title="Guardar cambios" onclick={() => guardarDatos()}>
  ...
</Modal>
```

---

### `maxWidth`

```ts
maxWidth?: string    // default: "500px"
```

Ancho máximo del panel del modal. Acepta cualquier valor CSS válido.

```tsx
<Modal title="Tabla amplia" maxWidth="900px">
  ...
</Modal>
```

---

### `cancel`

```ts
cancel?: boolean    // default: false
```

Controla si se muestra el botón de cancelar en el footer. Cuando es `true`, el footer muestra dos botones (cancelar y guardar) a partes iguales. En móvil se apilan verticalmente.

---

### `cancelText`

```ts
cancelText?: string    // default: "Cancelar"
```

Etiqueta del botón de cancelar. Solo tiene efecto cuando `cancel={true}`.

---

### `onCancel`

```ts
onCancel?: () => void
```

Callback que se ejecuta al pulsar el botón de cancelar. El modal siempre se cierra después, independientemente del resultado del callback.

```tsx
<Modal
  title="Formulario"
  cancel
  onCancel={() => resetearFormulario()}
>
  ...
</Modal>
```

---

### `lazy`

```ts
lazy?: boolean    // default: true
```

Controla cuándo se monta el contenido del modal en el DOM.

| Valor | Comportamiento |
|-------|----------------|
| `true` *(default)* | Los hijos se montan la primera vez que se abre el modal. El overlay se elimina del DOM al cerrar. Ideal para contenido pesado que no necesita pre-cargarse. |
| `false` | Los hijos se montan desde el primer render del componente. El overlay permanece en el DOM (oculto) entre aperturas. Los hijos conservan su estado interno (formularios, scroll, etc.) entre aperturas y cierres. |

```tsx
// Formulario que debe conservar datos al cerrar y reabrir
<Modal title="Editar perfil" lazy={false}>
  <FormularioComplejo />
</Modal>
```

---

### `preventClose`

```ts
preventClose?: boolean    // default: false
```

Bloquea los cierres **accidentales**: tecla `Escape` y clic en el overlay fuera del panel. Los cierres **explícitos** (botón ×, Cancelar, Guardar) siempre funcionan, independientemente de este prop.

```tsx
<Modal title="Proceso en curso" preventClose>
  <IndicadorProgreso />
</Modal>
```

---

### `onValidateClose`

```ts
onValidateClose?: () => boolean
```

Función de validación que se ejecuta únicamente al pulsar el botón de **Guardar**. Si retorna `false`, el modal no se cierra. No afecta a los cierres por ×, Cancelar, Escape ni clic exterior.

```tsx
<Modal
  title="Nuevo registro"
  onValidateClose={() => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio")
      return false
    }
    return true
  }}
>
  <input value={nombre} onChange={e => setNombre(e.target.value)} />
</Modal>
```

---

### `type`

```ts
type?: "btn"
```

Cuando se pasa `"btn"`, el trigger muestra **solo el ícono** (sin texto), con dimensiones fijas de `40×40 px`. Requiere que `icon` esté definido. El `title` se traslada al atributo `title` del botón para accesibilidad (tooltip nativo).

```tsx
<Modal type="btn" title="Editar" icon={<Pencil size={16} />}>
  ...
</Modal>
```

---

## Comportamiento de accesibilidad

El componente implementa el patrón [WAI-ARIA Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

- El panel tiene `role="dialog"` y `aria-modal="true"`.
- El título del modal está vinculado al panel con `aria-labelledby`.
- Al abrir, el foco se mueve automáticamente al panel del modal.
- Al cerrar, el foco vuelve al botón trigger que lo abrió.
- `Tab` / `Shift+Tab` quedan atrapados dentro del modal mientras está abierto.
- `Escape` cierra el modal (respeta `preventClose`).

---

## Animaciones

El modal usa animaciones CSS (`@keyframes`) en entrada y salida. Las clases se aplican automáticamente:

| Clase | Cuándo se aplica |
|-------|------------------|
| *(sin clase)* | Entrada: `overlayShow` + `contentShow` |
| `modal-overlay-closing` | Salida del overlay |
| `modal-content-closing` | Salida del panel |

El componente detecta `prefers-reduced-motion: reduce` y omite las animaciones, cerrando el modal de inmediato.

---

## Clases CSS disponibles para personalización

| Clase | Elemento |
|-------|----------|
| `.modal-trigger` | Botón trigger |
| `.modal-trigger-icon-only` | Trigger cuando `type="btn"` |
| `.modal-overlay` | Fondo semitransparente |
| `.modal-content` | Panel del modal |
| `.modal-header` | Encabezado (sticky) |
| `.modal-title` | Título del encabezado |
| `.modal-close` | Botón × de cerrar |
| `.modal-body` | Cuerpo del modal |
| `.modal-footer` | Footer con botones |
| `.modal-save-button` | Botón de guardar |
| `.modal-cancel-button` | Botón de cancelar |
| `.modal-input` | Input con estilo predefinido |
| `.modal-label` | Label para inputs |
| `.modal-input-group` | Contenedor input + botón inline |
| `.modal-info-message` | Texto de ayuda en cursiva |

---

## Ejemplos completos

### Modal simple de confirmación

```tsx
<Modal
  title="Eliminar registro"
  buttonText="Eliminar"
  buttonClassName="danger"
  cancel
  cancelText="No, volver"
  onclick={() => eliminar(id)}
>
  <p>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
</Modal>
```

### Modal con validación antes de cerrar

```tsx
const [email, setEmail] = useState("")

<Modal
  title="Cambiar email"
  onclick={() => actualizarEmail(email)}
  onValidateClose={() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
  cancel
>
  <label className="modal-label">Nuevo email</label>
  <input
    className="modal-input"
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
  />
</Modal>
```

### Modal con estado persistente entre aperturas

```tsx
<Modal title="Filtros" lazy={false} cancel onCancel={() => resetFiltros()}>
  <FiltrosBusqueda />  {/* conserva su estado interno al cerrar y reabrir */}
</Modal>
```

### Trigger de solo ícono

```tsx
<Modal type="btn" title="Configuración" icon={<Settings size={18} />} maxWidth="400px">
  <PanelConfiguracion />
</Modal>
```

### Modal bloqueado durante proceso

```tsx
<Modal
  title="Subiendo archivo"
  preventClose
  buttonText="Cerrar"
  onclick={() => cancelarSubida()}
>
  <BarraProgreso porcentaje={progreso} />
</Modal>
```
