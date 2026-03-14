

## Hacer la landing de captacion de leads la pagina principal

### Cambio

Actualmente `/` muestra el catalogo de productos y `/manual-profesional` muestra la landing de captacion de leads. El cambio es simple: intercambiar las rutas para que la landing del manual sea lo primero que vean los visitantes.

### Rutas resultantes

| Ruta | Contenido |
|---|---|
| `/` | Landing de captacion de leads (ManualProfesional) |
| `/catalogo` | Catalogo de productos (Index) |
| `/manual-confirmacion` | Confirmacion post-formulario |

### Archivo a modificar

**`src/App.tsx`** - Cambiar el elemento de la ruta `/` a `ManualProfesional` y mover `Index` a `/catalogo`.

### Consideraciones

- Los enlaces internos que apunten a `/manual-profesional` se actualizaran a `/`.
- El enlace del hero "Descargar ahora" que apunta a `#formulario` seguira funcionando igual.
- La pagina de confirmacion puede incluir un CTA hacia `/catalogo` para que los leads descubran los productos.

