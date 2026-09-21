# Select

Componente de selección (dropdown) hecho a medida, con soporte para selección única o múltiple, búsqueda por texto, agrupación de opciones, posicionamiento automático (arriba/abajo) y ancho dinámico según el contenido.

## Importación

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTags,
} from "./select" // ajustar la ruta según tu proyecto
```

## Anatomía

Todo `Select` se compone combinando estas piezas dentro de un `<Select>` raíz:

| Componente        | Rol                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `Select`           | Provee el contexto (estado, valor, dirección, etc). Envuelve todo.   |
| `SelectTrigger`    | El botón visible que abre/cierra el dropdown.                        |
| `SelectValue`      | Texto que se muestra dentro del trigger (valor actual o placeholder).|
| `SelectContent`    | El panel desplegable con las opciones. Incluye buscador integrado.   |
| `SelectItem`       | Una opción individual, seleccionable.                                |
| `SelectLabel`       | Encabezado de una categoría/grupo de opciones (no seleccionable).    |
| `SelectSeparator`  | Línea divisoria entre grupos de opciones.                            |
| `SelectTags`       | (Solo modo múltiple) Muestra los valores seleccionados como tags.    |

## Ejemplo básico (selección única)

```tsx
<Select onValueChange={(value) => console.log(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="manzana">Manzana</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="uva">Uva</SelectItem>
  </SelectContent>
</Select>
```

`value` de `SelectItem` es el identificador interno; los `children` (texto) son lo que se muestra y también lo que usa el buscador para filtrar.

## Selección múltiple

Activá `multiple` en el `Select` raíz. En este modo, `SelectValue` **no** muestra los valores elegidos (siempre muestra el `placeholder`); para visualizar la selección actual se usa `SelectTags`, que renderiza un chip por cada valor con un botón de quitar (✕).

```tsx
<Select multiple onValueChange={(values) => console.log(values)}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona países" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ar">Argentina</SelectItem>
    <SelectItem value="br">Brasil</SelectItem>
    <SelectItem value="cl">Chile</SelectItem>
  </SelectContent>
</Select>
<SelectTags />
```

`SelectTags` debe ir dentro del mismo `<Select>` (puede ir fuera del `SelectTrigger`, debajo, como en el ejemplo) ya que consume el mismo contexto.

## Búsqueda integrada

`SelectContent` incluye un input de búsqueda **siempre presente pero visualmente invisible** (vía CSS: `opacity: 0`, alto de 1px). Al abrir el dropdown, el foco se mueve automáticamente a ese input, así que el usuario puede empezar a tipear de inmediato para filtrar las opciones por su texto, sin que se vea un campo de búsqueda en pantalla.

- La búsqueda filtra por el texto visible de cada `SelectItem` (o por su `value` si el contenido no es un string simple).
- Si usás `SelectLabel`/`SelectSeparator` para agrupar, esos encabezados se ocultan automáticamente si ninguna opción de su grupo coincide con la búsqueda.
- Si no hay ningún resultado, se muestra "No results found.".
- La búsqueda se reinicia cada vez que se abre el dropdown.

> Si en algún caso necesitás un buscador **visible**, hay que modificar las reglas `.select-search-wrapper` / `.select-search-input` en el CSS (actualmente están forzadas a ser invisibles).

## Agrupar opciones

```tsx
<SelectContent>
  <SelectLabel>Frutas</SelectLabel>
  <SelectItem value="manzana">Manzana</SelectItem>
  <SelectItem value="banana">Banana</SelectItem>

  <SelectSeparator />

  <SelectLabel>Verduras</SelectLabel>
  <SelectItem value="papa">Papa</SelectItem>
  <SelectItem value="zanahoria">Zanahoria</SelectItem>
</SelectContent>
```

## Opciones deshabilitadas

```tsx
<SelectItem value="agotado" disabled>
  Agotado
</SelectItem>
```

Una opción deshabilitada no responde a click ni teclado, y se muestra con estilo atenuado (`select-item[data-disabled]`).

## Dirección de apertura (`direction`)

```tsx
<Select direction="auto"> {/* default */}
<Select direction="up">
<Select direction="down">
```

- `"auto"` (default): antes de abrir, calcula si hay más espacio arriba o abajo del trigger (considerando contenedores con scroll, modales y tablas) y decide automáticamente.
- `"up"` / `"down"`: fuerza la dirección sin calcular nada.

## Ancho del componente

```tsx
<Select width={320}>      {/* px */}
<Select width="100%">     {/* cualquier valor CSS válido */}
```

Si no se especifica `width`, el componente mide automáticamente el texto de la opción más larga registrada y usa ese ancho como mínimo (`min-width`), tanto para el trigger como para el panel desplegable.

## Modo controlado vs no controlado

```tsx
// No controlado: el componente maneja su propio estado interno
<Select defaultValue="banana" onValueChange={(v) => console.log(v)}>
  ...
</Select>

// Controlado: vos manejas el estado
const [value, setValue] = useState("banana")

<Select value={value} onValueChange={setValue}>
  ...
</Select>
```

Si se pasa `value`, el componente queda en modo controlado (ignora su estado interno y siempre refleja el `value` recibido). Si no se pasa, usa `defaultValue` como valor inicial y maneja el estado solo.

## Referencia de props

### `Select`

| Prop             | Tipo                                  | Default   | Descripción                                      |
| ----------------- | -------------------------------------- | --------- | -------------------------------------------------- |
| `value`           | `string \| string[]`                   | —         | Valor controlado (string en modo simple, array en múltiple). |
| `defaultValue`    | `string \| string[]`                   | `""`/`[]` | Valor inicial en modo no controlado.                |
| `onValueChange`   | `(value: string \| string[]) => void`  | —         | Callback al cambiar la selección.                   |
| `multiple`        | `boolean`                              | `false`   | Habilita selección múltiple.                        |
| `direction`       | `"up" \| "down" \| "auto"`             | `"auto"`  | Dirección de apertura del panel.                    |
| `width`           | `number \| string`                     | —         | Ancho fijo del trigger/panel.                       |

### `SelectTrigger`

| Prop       | Tipo              | Descripción                          |
| ----------- | ------------------ | --------------------------------------- |
| `children` | `React.ReactNode`  | Normalmente un `<SelectValue />`.       |

### `SelectValue`

| Prop          | Tipo     | Descripción                                          |
| -------------- | -------- | ------------------------------------------------------- |
| `placeholder` | `string` | Texto mostrado cuando no hay selección (o siempre, en modo múltiple). |

### `SelectContent`

| Prop       | Tipo              | Descripción                                  |
| ----------- | ------------------ | ----------------------------------------------- |
| `children` | `React.ReactNode`  | `SelectItem`, `SelectLabel`, `SelectSeparator`. |

### `SelectItem`

| Prop       | Tipo              | Descripción                                  |
| ----------- | ------------------ | ----------------------------------------------- |
| `value`    | `string`           | Identificador único de la opción (requerido).   |
| `children` | `React.ReactNode`  | Texto/contenido visible de la opción.           |
| `disabled` | `boolean`          | Deshabilita la opción.                          |

### `SelectLabel`

| Prop       | Tipo              | Descripción                  |
| ----------- | ------------------ | -------------------------------- |
| `children` | `React.ReactNode`  | Texto del encabezado de grupo.   |

### `SelectSeparator`

Sin props.

### `SelectTags`

Sin props. Solo tiene efecto cuando `multiple` está activo; lee la selección y el callback `onValueChange` directamente del contexto del `Select`.

## Accesibilidad

- El trigger usa `role` implícito de `button`, `aria-haspopup="listbox"` y `aria-expanded`.
- El panel usa `role="listbox"` y cada opción `role="option"` con `aria-selected`.
- Cada `SelectItem` es navegable por teclado (`tabIndex`), y responde a `Enter`/`Espacio`.
- El trigger responde a `Enter`/`Espacio`/`Flecha abajo` para abrir, y `Flecha arriba` para cerrar.
- `Escape` cierra el dropdown desde cualquier punto mientras está abierto.
- El foco visible por teclado en las opciones usa `:focus-visible` (outline propio, distinto del hover con mouse).

## Notas / limitaciones conocidas

- No hay navegación con flechas (↑/↓) **entre** opciones dentro del panel abierto; cada `SelectItem` es alcanzable con `Tab` normal del navegador.
- El buscador integrado siempre está montado pero invisible; no hay (todavía) una variante con buscador visible vía prop.
- En modo múltiple, `SelectValue` no refleja la cantidad de elementos seleccionados — para eso hay que renderizar `SelectTags`.
