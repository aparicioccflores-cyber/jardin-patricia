# 🌼 El jardín de Patricia — regalo interactivo

Página web con:
1. **Portada** (hero nocturno estilo "landing page") con botón para ir al juego.
2. **Sección "Cómo jugar"**.
3. **Minijuego** en un recuadro aparte: mueves a Patricia (pelo rojo, corona 👑)
   con **WASD** o las flechas por un jardín visto desde arriba y debes tocar
   las 8 flores amarillas escondidas entre las demás. Al encontrarlas todas,
   se arma un ramo animado con confeti y un mensaje final.

Está hecho como proyecto **Spring Boot** (Java): el backend solo sirve los
archivos web (HTML/CSS/JS/imágenes) que están en
`src/main/resources/static/`, no necesita base de datos ni nada más.

> ⚠️ Nota: este proyecto lo armé en un entorno sandbox sin acceso a Maven
> Central, así que no pude ejecutar `mvn spring-boot:run` aquí para probarlo
> como app Java. Sí probé a fondo el HTML/CSS/JS (que es donde vive toda la
> lógica del juego) sirviéndolo como archivos estáticos, y funciona bien.
> Al abrirlo en tu compu con internet normal, Maven va a poder descargar
> Spring Boot sin problema.

## Estructura

```
flores-patricia-springboot/
├── pom.xml
├── src/main/java/com/patricia/floresgame/
│   └── FloresGameApplication.java   (arranca el servidor)
└── src/main/resources/static/
    ├── index.html
    ├── css/styles.css
    ├── js/game.js                   (toda la lógica del juego)
    └── assets/                      (sprites pixel-art generados)
```

## Personalizar

Abre `src/main/resources/static/js/game.js` y edita al principio del archivo:

```js
const MENSAJE_FINAL = `¡Feliz día, Patricia! ...`;  // mensaje al ganar
const FLORES_AMARILLAS = 8;      // cuántas flores hay que encontrar
const FLORES_DECORATIVAS = 26;   // cuántas flores "señuelo" (no cuentan)
```

Los sprites (personaje, flores, lazo) están en `static/assets/` como PNG.
Si quieres regenerarlos o cambiar colores, el script que los crea está en
`assets_src/gen_sprites.py` (usa Python + Pillow: `pip install pillow` y
luego `python3 gen_sprites.py`).

## Cómo correrlo en Visual Studio Code

1. Abre la carpeta `flores-patricia-springboot` en VS Code
   (`Archivo > Abrir carpeta...`).
2. Instala la extensión **Extension Pack for Java** (te la va a sugerir VS
   Code solo al abrir un `.java`).
3. Necesitas tener **Java 17+** y **Maven** instalados en tu compu. Si no
   los tienes, instala primero el JDK (por ejemplo Temurin 21) y Maven.
4. En la terminal, dentro de la carpeta del proyecto:
   ```bash
   mvn spring-boot:run
   ```
   (la primera vez va a tardar un poco porque descarga las dependencias de
   Spring Boot desde internet)
5. Abre en el navegador: **http://localhost:8080**

También puedes simplemente abrir `src/main/resources/static/index.html`
directo en el navegador (doble clic) para ver el diseño y el juego sin
correr Java — solo que así no estarías usando Spring Boot, sino el archivo
suelto.

## Cómo subirlo a GitHub para que sea público

### 1. Crea el repositorio en GitHub

1. Entra a **https://github.com/new**.
2. Ponle un nombre, por ejemplo `jardin-patricia`.
3. Marca la opción **Public** (así cualquiera con el link puede verlo).
4. **No** marques "Add a README" (ya tenemos uno) — déjalo vacío.
5. Dale a **Create repository**.

### 2. Sube el proyecto desde tu compu

Abre la terminal en VS Code, dentro de la carpeta `flores-patricia-springboot`, y corre:

```bash
git init
git add .
git commit -m "Jardín interactivo de flores para Patricia"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/jardin-patricia.git
git push -u origin main
```

Cambia `TU_USUARIO` por tu usuario de GitHub (GitHub te muestra estos mismos
comandos exactos apenas creas el repo, por si prefieres copiarlos de ahí).
Con esto, cualquiera puede entrar a `github.com/TU_USUARIO/jardin-patricia`
y ver el código — pero todavía no es una página que se pueda **abrir y
jugar** directo desde un link, para eso sigue el paso 3.

### 3. Publica el juego como página web pública y gratis (GitHub Pages)

Aunque el proyecto está armado como Spring Boot, el juego en sí (HTML, CSS,
JS e imágenes) es 100% front-end — el "servidor" de Java solo entrega esos
archivos tal cual. Por eso ya te dejé una copia de esos mismos archivos en
la carpeta **`docs/`**, que es justo lo que GitHub Pages sabe publicar
gratis sin necesitar Java corriendo en ningún lado:

1. En GitHub, entra a tu repositorio → pestaña **Settings** → **Pages**
   (en el menú de la izquierda).
2. En "Build and deployment" → **Source**, elige **Deploy from a branch**.
3. En "Branch" selecciona **main** y la carpeta **/docs** → **Save**.
4. Espera 1-2 minutos. Tu link público va a quedar en:
   `https://TU_USUARIO.github.io/jardin-patricia/`

Ese es el link que le compartes a Patricia — lo puede abrir desde el
celular o la compu, sin instalar nada.

> Si más adelante editas el juego (por ejemplo cambias el mensaje en
> `src/main/resources/static/js/game.js`), corre `./sync-docs.sh` antes de
> hacer `git push` — ese script copia tus cambios a `docs/` para que
> GitHub Pages los muestre también.

### (Opcional) Publicarlo como servidor Java real

Si en algún momento quieres que sea Spring Boot corriendo de verdad (por
ejemplo para guardar puntajes en una base de datos más adelante), puedes
desplegarlo gratis en **Render.com** o **Railway.app**: conectas el mismo
repo de GitHub, detectan solos que es un proyecto Maven, lo compilan y te
dan otra URL pública corriendo el `.jar`. Para el juego tal como está hoy
no hace falta — GitHub Pages con la carpeta `docs/` ya es gratis, público e
instantáneo.
