# Crear Servidor

- Importo e instancio express
- Configuro el puerto, pongo app a la escucha
- Defino la primera ruta GET a la raíz. El callback toma un req (request) que es lo que se le envía al servidor para que ejecute  y res (response) es lo que envía el servidor de respuesta. Envias una información y recibes una respuesta.
- .send muestra info directamente en pantalla en la ruta indicada. Para devolver un json se usa .json()

~~~js
const express = require('express')


const app = express()

app.get('/', function(req,res){
    res.send("Hola mundo en express")
})

app.get('/nosotros', function(req,res){
    res.json({msg: "Desde nosotros"})
})


const port = 4000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
~~~
# Habilitar los módulos 
- Para usar la sintaxis de import hay que cambiar algo en el package.json
- Añadir "type": "module", después del main
- Ahora ya puedo usar import
~~~js
import express from 'express'
~~~

# Routing
- Creo la carpeta /routes y dentro el archivo  usuarioRoutes.js
- Importo express y dclaro el router 
- Añado las rutas que previamente había declarado en el index
    - sustituyo app por router
    - exporto por defecto el router
~~~js
import express from 'express'

const router = express.Router()

router.get('/', function(req,res){
    res.send("Hola mundo en express")
})

router.get('/nosotros', function(req,res){
    res.json({msg: "Desde nosotros"})
})

export default router
~~~
-----
- Ahora hay que importar las rutas en el index. Puedo importar el router con el nombre que yo desee
- Como viene de un archivo que yo estoy creando requiere de la extension .js
- Lo añado a app.use, que soporta todo tipo de verbos y no necesita la ruta exacta. Para agruparlas se usa .use
    - .use lo que buscará es todas las rutas que inicien / (en este caso) en adelante
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express()

app.use('/', usuarioRoutes) // middleware

const port = 4000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
~~~
-----
# Peticiones GET Y POST
- Cambio el endpoint GET de /nosotros por un POST a la raíz('/) 
- Mando los endpoints en POSTMAN para asegurarme que la respuesta es adecuada a http://localhost:4000
    - petición GET y POST
- router.route engloba rutas. Puedo copiar las funciones respectivas de cada verbo
~~~js
import express from 'express'

const router = express.Router()


router.route('/')
    .get( function(req,res){
        res.json({msg:"Hola mundo en express"})
    })
    .post(function(req,res){
        res.json({msg: "Respuesta tipo post"})
    })

export default router
~~~
----
- Sigue funcionando igual, pero lo dejo como estaba, con cada ruta por separado
- También se puede usar una arrow function
~~~js
router.get('/',(req,res)=>{
    res.json({msg:"Hola mundo en express"})
})
~~~
-----
# Template Engine
- Usaré pug
> npm i pug

- Habilito pug
- Primer argumento el qué, segundo cual
- Hay que decirle en qué carpeta estarán las views. 
    - Creo la carpeta views
    - Creo la carpeta auth dentro de views. En ella un archivo llamado login.pug

- /views/auth/login.pug
~~~pug
h2 Login
~~~
-----
- Cambio el routing en el index por /auth
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express()

app.set('view engine', 'pug')
app.set('views', "./views")

app.use('/auth', usuarioRoutes)



const port = 4000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
~~~
----
- En usuarioRoutes cambio el endpoint de GET por /login
- Utilizo res.render para mostrar la vista. Al usar render se coloca directamente en la carpeta views ( no es necesario inidcarlo )

~~~js
import express from 'express'

const router = express.Router()

router.get('/login',(req,res)=>{
    res.render('auth/login')
})

router.post('/', (req,res)=>{
    res.json({msg: "Respuesta tipo post"})
})


export default router
~~~
----
- En pug se usa la indentación para crear hijos en html
- Se le pueden añadir clases con . o id con #
    - Otra manera de agregar clases es  (class="text-center")
~~~pug
div
    h2.text-center Login
    p Inicia sesión

~~~
# Pasar datos hacia las vistas
- Usualmente voy a consultar un modelo en un controlador y los resultados los voy a pasar hacia la vista
~~~js
import express from 'express'

const router = express.Router()

router.get('/login',(req,res)=>{
    res.render('auth/login',{
        autenticado: true
    })
})



export default router
~~~
----
- Cómo imprimo este autenticado en la vista?
- En pug se usa =
~~~pug
div
    h2= autenticado 
    p Inicia sesión
~~~
- Se pueden usar condicionales
~~~pug
div
    if autenticado 
        p Usuario Autenticado
    else
        p Iniciar Sesion
    p Inicia sesión
~~~
# Model View Controller (MVC)
- Es un patrón de arquitectura de software que permite la separación de obligaciones de cada pieza de tu código
- Enfatiza la separación de la lógica de programción con la presentación
- Modelo
    - Encargado de todas las interacciones con la base de datos
    - Obtiene la información pero no la muestra ( eso es trabajo de la vista )
    - Tampoco se encarga de actualizar la info, es el controlador quien decide cuando llamarlo y le pasa la info
- Vista
    - Se encarga de todo lo que se ve en pantalla. React, Vue
- Controlador
    - Comunica modelo y vista. Antes de que el modelo consulte la base de datos, el controlador es el encargado de llamar un modelo en específico
    - Una vez conusltado el modelo, el controlador recibe esa info, manda llamar a la vista y le pasa la info
- Router
    - Encargado de registrar todos los endpoints de la app
- En resumen:
    - El usuario visita /clientes
    - Tengo un controlador que manda a llamar el modelo.
    - El modelo consulta y se la regresa al controlador
    - El controlador se lo pasa hasta la vista
------
# Implementando controllers
- Creo la carpeta /controllers con un archivo que llamaré usuarioController.js
- En usuarioController Le paso el res.render que había en la ruta de usuarioRoutes
~~~js
const formularioLogin  = (req, res) =>{
    res.render('auth/login',{
        autenticado: false
    })
}

export{
    formularioLogin
}
~~~
---
- Añado la función al route
- Cuando las exportaciones no son por defecto hay que usar el mismo nombre
- Así es mas limpio y organizado el código
~~~js
import express from 'express'
import { formularioLogin } from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/login',formularioLogin)



export default router
~~~
-----
# Añadiendo más rutas
- Creo un segundo enpoint con  /registro. Lo exporto y lo importo en usuarioRoutes
~~~js





const formularioLogin  = (req, res) =>{
    res.render('auth/login',{

    })
}
const formularioRegistro  = (req, res) =>{
    res.render('auth/registro', {

    })
}

export {
    formularioLogin,
    formularioRegistro
}
~~~
----
- usuarioRoutes
~~~js
import express from 'express'
import { formularioLogin, formularioRegistro } from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/login',formularioLogin)
router.get('/registro', formularioRegistro )


export default router
~~~
- Cambio el archivo login.pug y dejo solo un h2 con Iniciar Sesión y creo un registro.pug con un h2 que dice crea tu cuenta

## Recuerda, seteé las vistas con app.set en index.js y lo renderio con res.render. 
## Se situa directamente en la carpeta views, por eso la ruta es auth/registro ( de views/ auth/ archivo.pug )
- index.js
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express()

app.set('view engine', 'pug')
app.set('views', "./views")

app.use('/auth', usuarioRoutes)



const port = 4000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
~~~
----
# Instalar TailwindCSS
> npm i -D tailwindcss autoprefixer postcss postcss-cli
- Hay que decirle a node en qué carpeta debe encontrar el css
- en el index habilito una carpeta pública
~~~js

app.use( express.static(`public`))

~~~
- De esta manera va a identificar los archivos estáticos en la carpeta public.
- Creo la carpeta /public en la raíz
- Dentro puedo tener carpetas de img, css. Archivos estáticos
- Dentro de css creo el archivo tailwind.css con tres directivas
~~~css
@tailwind base;
@tailwind components;
@tailwind utilities
~~~

- Ahora escribo en consola
> npx tailwindcss init -p
- esto crea 2 archivos
- En postcss.config.cjs no hay que hacer nada. Importante que termine en .cjs
- En tailwind.config.cjs hay que decirle en content en que carpeta están los archivos que contienen el css
~~~js
module.exports = {
  content: ['./views/**/*.pug'],
  theme: {
    extend: {},
  },
  plugins: [],
}
~~~
----
- Ahora hay que crear el script para compilar tailwindcss
- En scripts del package.json coloco "css": potscss ( por eso instalé postcss-cli ) donde está el archivo fuente, -o de output y la salida
>  "css": "postcss public/css/tailwind.css -o public/css/app.css"
- Todavía no se puede ver el resultado de tailwind
~~~pug
div
    h2.text-center.text-6xl Iniciar Sesión
~~~
- Es porque en public estan los estilos compilados pero las vistas no las están cargando en ningún lado. Por ello creo un layout
-----
# Creando Layout Principal
- Creo la carpeta /layout en views y dentro un index.pug
- Dos extensiones recomendables: pug y tailwind intellisense
- Ahora, como en un html normal, si en index.pug escribo ! + tab me autocompleta con la estructura básica
- Como ya apunta a public le establezco la ruta del link de css
- Le añado unas clases al body
~~~pug
doctype html
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(http-equiv="X-UA-Compatible", content="IE=edge")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title Bienes Raíces
        link(rel="stylesheet", href="/css/app.css")
    body.min-h-screen.bg-gray-50
~~~
- Para aplicar lo estilos en los archivos pug utilizo extends
~~~pug
extends ../layout/index

div
    h2.text-center.text-6xl Iniciar Sesión
~~~
- Esto marca un error.
- Este extends hace que el layout se vea en todas partes donde lo coloque, y el archivo pug SEA UNA EXTENSiÓN de este Layout
- hay que definir el CHILDREN en el archivo index con un BLOQUE
~~~pug
doctype html
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(http-equiv="X-UA-Compatible", content="IE=edge")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title Bienes Raíces
        link(rel="stylesheet", href="/css/app.css")
    body.min-h-screen.bg-gray-50

        main(class="mx-auto container mt-10 px-2")
            block contenido
~~~
- Debo colocar el block contenido y hacer del template su hijo
~~~pug
extends ../layout/index

block contenido

    div
        h2.text-center.text-2xl Iniciar Sesión

~~~
- Para aplicar los cambios debo compilar con npm run css
- le añado un --watch al final del script  en el package.json
~~~js
"css": "postcss public/css/tailwind.css -o public/css/app.css --watch"
~~~
# Primeros pasos con la página de registro

- Voy al controlador, usuarioController.
- En la función formularRegistro, cómo primer parámetro del render se pasa la vista y como segundo parámetro va a ser un objeto con la info que le quieres pasar a esa vista.
- Recuerda: en el archivo pug un = imprime una variable
- usuarioController:
~~~js
const formularioRegistro  = (req, res) =>{
    res.render('auth/registro', {
        pagina: crearCuenta
    })
}
~~~

- registro.pug

~~~pug
extends ../layout/index

block contenido

    div
        h2.text-center.text-2xl= pagina
~~~
- Para crear contenido dinámico en el title del Layout, cuando hay un string y una variable se usa esta sintaxis de numeral y llaves
~~~pug
doctype html
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(http-equiv="X-UA-Compatible", content="IE=edge")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title Bienes Raíces | #{pagina}
        link(rel="stylesheet", href="/css/app.css")
    body.min-h-screen.bg-gray-50

        main(class="mx-auto container mt-10 px-2")
            block contenido
~~~
# Creando el formulario
~~~pug
extends ../layout/index

block contenido

    div
        h1.text-4xl.my-10.font-extrabold.text-center Bienes
            span.font-normal Raices 
        h2.text-center.text-2xl= pagina

        div.mt-8.mx-auto.max-w-md
            div.bg-white.py-8.px-4.shadow
                form
                    div 
                        label.block.text-sm.uppercase.text-gray-600.my-3.font-bold Tu nombre
                        input.w-full.px-3.py-2.border.border-gray-300.rounded
                        .placeholder-gray-400(placeholder="Tu nombre" type="text" name="nombre")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.my-3.font-bold Tu email
                        input.w-full.px-3.py-2.border.border-gray-300.rounded
                        .placeholder-gray-400(placeholder="Tu email" type="email" name="email")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.my-3.font-bold Password
                        input.w-full.px-3.py-2.border.border-gray-300.rounded
                        .placeholder-gray-400(placeholder="Tu password" type="password" name="password")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.my-3.font-bold Repetir password
                        input.w-full.px-3.py-2.border.border-gray-300.rounded
                        .placeholder-gray-400(placeholder="Repite tu password" type="password" name="repetir_password")
                    
                    input( class="w-full bg-indigo-600 text-white hover:bg-indigo-700 text-alihn-center py-2 rounded font-bold" type="submit" value="Crear Cuenta")
~~~
- Para añadir cosas como hover: o mediaquerys se usa esta otra sintaxis para añadir clases

# Creando página de login de usuarios
- Copio el código de registro.pug y lo pego en login.pug
- Voy al controller y le paso pagina: iniciar Sesión como segundo parámetro
~~~js





const formularioLogin  = (req, res) =>{
    res.render('auth/login',{
        pagina: "Iniciar sesión"
    })
}
const formularioRegistro  = (req, res) =>{
    res.render('auth/registro', {
        pagina: "Crear Cuenta"
    })
}

export {
    formularioLogin,
    formularioRegistro
}
~~~
----
# Creando la página de olvidé mi password
- Creo una nueva función similar en el controller llamada formularioOlvidePassword. La exporto del controller y la importo en usuarioRoutes
- Añado la ruta en usuarioRoutes
- Creo la vista olvide-password.pug
- Copio el código de login y dejo solo el div del mail ( es lo único que requiere el formulario ara recuperar el password)
- usuarioController
~~~js
const formularioOlvidePassword  = (req, res) =>{
    res.render('auth/olvide-password', {
        pagina: "Recuperar password"
    })
}
~~~
-----
- usuarioRoutes:
~~~~js
import express from 'express'
import { formularioLogin, formularioOlvidePassword, formularioRegistro } from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/login',formularioLogin)
router.get('/registro', formularioRegistro )
router.get('/olvide-password', formularioOlvidePassword )


export default router
~~~~
----
# Agregando enlaces entre las páginas
- Debo poner /auth primero en los anchor tags porque así es la ruta que he establecido previamente; auth/login, auth/olvide-password, etc

~~~pug
extends ../layout/index
block contenido
    div.py-2
        h1.text-4xl.my-10.font-extrabold.text-center Bienes 
            span.font-normal Raíces 
        h2.text-center.text-2xl.font-extrabold=pagina

        .mt-8.mx-auto.max-w-md 
            .bg-white.py-8.px-4.shadow
                form.space-y-5(method='POST' action="/auth/registro") 
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="nombre") Tu nombre 
                        input#nombre.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Tu nombre" 
                        type="text" name="nombre")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="email") Tu email 
                        input#email.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Tu email" 
                        type="email" name="email")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="password") Tu password
                        input#password.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Tu password" 
                        type="password" name="password")
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="repetir_password") Repite tu password 
                        input#repetir_password.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Repite tu password" 
                        type="password" name="repetir_password")
                    .flex.items-center.justify-between 
                        a.text-gray-500.text-xs(href="/auth/login") ¿Ya tienes cuenta? Inicia Sesión 
                        a.text-gray-500.text-xs(href="/auth/olvide-password") Olvidé mi password
                        
                    input(class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-md cursor-pointer" 
                    type="submit" value="CREAR CUENTA")

~~~
- Hago lo mismo para login y olvide-password con las opciones pertinentes

