# Tipografías — origen y condiciones de uso

> Este archivo existe porque la **ADR-002** lo exige: quien mantenga el sitio dentro de dos años
> tiene que poder saber bajo qué condición están acá estos archivos, sin preguntarle a nadie.

## Qué hay acá

| Archivo                        | Familia          | Peso |
| ------------------------------ | ---------------- | ---- |
| `GoogleSans-Regular.woff2`     | Google Sans      | 400  |
| `GoogleSans-Medium.woff2`      | Google Sans      | 500  |
| `GoogleSans-Bold.woff2`        | Google Sans      | 700  |
| `GoogleSansMono-Regular.woff2` | Google Sans Mono | 400  |
| `GoogleSansMono-Medium.woff2`  | Google Sans Mono | 500  |

## De dónde salieron

De la descarga del **Community Kit para organizers** de Google Developer Groups. Los `.ttf`
originales **no están en el repositorio y no deben entrar**: `.gitignore` los bloquea
explícitamente.

Conversión a woff2, reproducible:

```bash
npx --yes --package wawoff2@2.0.1 node -e "…"   # ver el commit que agrego estos archivos
```

La conversión se verificó comparando la tabla `cmap` de origen y destino: **no se perdió un solo
glifo**. Google Sans mapea 3281 puntos de código; Google Sans Mono, 230.

## Condiciones

La **ADR-002** registra que el organizer del capítulo revisó los términos de la descarga del kit
y confirmó que el uso cubre este caso: el sitio oficial de un capítulo GDG, con material de GDG.

Condiciones de esa ADR que aplican a esta carpeta:

- Se sirven **solo los pesos que el diseño usa**, no la familia completa.
- Los archivos se usan **solo para este sitio**. No se enlazan desde otros proyectos y esta
  carpeta no se expone como si fuera un CDN de fuentes.
- La pila de respaldo es una fuente real y parecida, no `sans-serif` genérico, para que un fallo
  de carga no cambie la métrica de la página.

## Sobre generar subconjuntos

Las tres Google Sans traen más de 7 000 glifos —incluyendo alfabetos que este sitio no usa—, y
partirlas por rango Unicode reduciría el peso servido de forma importante. **No se hace, y la
regla es la siguiente:**

> **El silencio no es permiso.** Generar un subconjunto es crear un archivo derivado, o sea
> modificar la fuente. Si los términos del kit no autorizan explícitamente obras derivadas, se
> asume que **no** está permitido. Una tipografía propietaria no concede por omisión, y tratar el
> silencio como autorización —en un asset de marca de Google, para un capítulo de Google— sería
> exactamente el tipo de razonamiento que este proyecto viene corrigiendo.

Si aparece un documento que autoriza derivados, el trabajo ya está pensado: cortes en latín
básico, latín-1, latín extendido-A y resto, servidos con `unicode-range` para que el navegador
baje solo el primero y pida los otros nada más si aparece un carácter fuera.

Mientras tanto, lo que **sí** se hizo sin tocar la licencia: servir únicamente los pesos que el
diseño usa, como pide la ADR-002. Eso solo bajó la primera visita de 1577 KiB a 1027 KiB.

## ⚠️ Pendiente

**Falta pegar acá el texto textual de los términos de la descarga del kit.** La ADR-002 lo pide
—«se copia el texto de la licencia del kit junto a los archivos»— y hoy solo está la
interpretación del equipo, no la fuente.

No bloquea el uso, porque la decisión ya está tomada y registrada, pero sí conviene cerrarlo:
si algún día alguien del programa pregunta, la respuesta tiene que estar en esta carpeta y no en
la memoria de una persona.

## Limitación conocida

**Google Sans Mono no cubre Latín Extendido-A** (`ł ś ż č ř š ž ğ ş İ`). Cubre español,
portugués, francés, alemán y nórdico sin faltantes.

Importa porque el rol mono son nombres de speakers, y la comunidad recibe gente de fuera. Se
resuelve con la pila de respaldo: en CSS el respaldo de tipografía funciona **por glifo**, así
que una `ł` que falte cae sola al siguiente tipo de la lista sin romper el resto de la palabra.
