# Crear Modelo 
- creo la carpeta models con el archivo Usuario.js ( en mayuscula por que lo crea como un objeto)
- Importo DataTypes de sequelize y la db
- Con defino defino la tabla que se va a crear con el nombre que yo le ponga
    - como segundo parámetro el objeto con los atributos que definen la tabla. Nombre crea la columna de nombre, etc
    - DataTypes.STRING ( es más facil que poner var_char de SQL)
    - allowNull: false, porque no puede ir vacío
    - Cuando solo es un parámetro puedo obviar las llaves del objeto
~~~js
import {DataTypes} from 'sequelize'
import db from '../config/db.js'

const usuario= db.define('usuarios',{
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
     
})

export default Usuario
~~~
----
- Lo siguiente es a partir del formulario de crear cuenta generar a los usuarios
# Autenticando la vista con el routing y el controller
- En usuarioRoutes creo el endpoint POST con la función registrar
- En usuarioController creo la función registrar y la exporto
# NOTA: este procedimiento de crear el endpoint y la funcióne n el controller es siempre así. Lo resumiré en una linea y no pondré ejemplo de código
- UsuarioRoutes:
~~~js
import express from 'express'
import { formularioLogin, formularioOlvidePassword, formularioRegistro, registrar } from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/login',formularioLogin)
router.get('/registro', formularioRegistro )

router.post('/registro', registrar )

router.get('/olvide-password', formularioOlvidePassword )


export default router
~~~
----
- UsuarioController
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

const formularioOlvidePassword  = (req, res) =>{
    res.render('auth/olvide-password', {
        pagina: "Recuperar password"
    })
}

const registrar =(req,res)=>{

}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar
}
~~~
----
- En el template engine de views/registro debo colocar el metodo POST y la ruta del endpoint POST en el form
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
- Si ahora le coloco un console.log a la función de registrar y en la pantall lleno los datos y doy al botón aparece en consola
----
# Cómo leer los datos ingresados en el formulario
- Toda la info que se envía forma parte del request ( req ) de la función
- Con req.body accedo a la info pero antes debo habilitarlo en el index.js
~~~js
app.use(express.urlencoded({extended: true}))
app.use(express.json())
~~~

# Creando un usuario desde el formulario
- Importo el modelo de usuario en el controller
~~~js
import usuario from '../models/Usuario,js'
~~~
- Ahora puedo usar todos los métodos de sequelize para manejar la info con la base de datos, actualizar, eliminar, etc
- Como voy a interactuar con la base de datos hago la función async

~~~js
const registrar = async (req,res)=>{
    const usuario= await Usuario.create(req.body)

    res.json(usuario)
}
~~~
- Esto da error, dice que la tabla usuarios no existe en 'bienesraices_node_mvc.usuarios'
- Añado db.sync() en el index.js lo que creará una tabla si no existe
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'


const app = express()

//habilitar lectura de formularios
app.use(express.urlencoded({extended: true}))
app.use(express.json())



//conexion DB
try {
    await db.authenticate()
    db.sync()
    console.log("conexión correcta a la base de datos")
} catch (error) {
    console.log(error)
}



app.set('view engine', 'pug')
app.set('views', "./views")

app.use('/auth', usuarioRoutes)

//Carpeta pública

app.use( express.static(`public`))



const port = 4000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
~~~
- Al poner res.json(usuario) imprime en pantalla el json del usuario y en consola puedo ver el INSERT de MySQL
# Añadiendo validación al formulario
- Evitar que el usuario pueda enviar el formulario dejando espacios en blanco
- Usaré express-validator
> npm i express-validator
- Importo de express-validator en el controller 
    - body: revisa por un campo en especifico
    - validationResult: va a mantener o guardar el resultado  de la validación
- Hay que validar todo, que el nombre y el mail esten rellenados, que el password tenga más de 6 caracteres, etc
- Lo que se pasa como primer parametro es el valor de name en el input
- .run ejecuta la función, le paso el req para que lea el valor
- Validationresult va a revisar las reglas que haya definido y regresa un arreglo con los errores que puedes mostrar en pantalla
- Puedo personalizar el error con withMessage
- Uso el .array para convertirlo en un arreglo que se pueda iterar
- usuarioController:

~~~js
const registrar = async (req,res)=>{
    
    await body('nombre').notEmpty().withMessage("El nombre es obligatorio").run(req)
    await body('email').isEmail().withMessage("Email no válido").run(req)
    let resultado = validationResult(req)

    res.json(resultado.array())
    
    const usuario= await Usuario.create(req.body)
}

~~~

----
- Para deshabilitar la validacion del html coloco  un novalidate en el form ( del template engine )
~~~pug
extends ../layout/index
block contenido
    div.py-2
        h1.text-4xl.my-10.font-extrabold.text-center Bienes 
            span.font-normal Raíces 
        h2.text-center.text-2xl.font-extrabold=pagina

        .mt-8.mx-auto.max-w-md 
            .bg-white.py-8.px-4.shadow
                form.space-y-5(method='POST' action="/auth/registro" novalidate)  
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
----
- Debo validar también el password y que matcheen los dos passwords
- Ahora falta que no cree el usuario si no pasa alguna de estas validaciones
- En un if, niego la condición ( es decir, si resultado NO está vacio es que hay errores)
    - el return lo pongo para asegurarme de que no se ejecuten las lineas.
    - gracias a ese return no sigue ejecutando si hay errores y no guarda el usuario
    - le añado el valor errores en el objeto. Así renderiza la página y añade esta propiedad
~~~js
import {body} from 'express-validator
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('/auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array()            
        })
    }

    const usuario = await Usuario.create(req.body)

    res.json(
        resultado.array()
    )
}
~~~
- El error lo voy a mostrar en el template engine
- pug proporciona el método each
- Lo que contiene el mensaje de error es msg( si hago un return res.json(resultado.array()) lo puedo ver)  
~~~pug
extends ../layout/index
block contenido
    div.py-2
        h1.text-4xl.my-10.font-extrabold.text-center Bienes 
            span.font-normal Raíces 
        h2.text-center.text-2xl.font-extrabold=pagina

        if errores 
            div(class="max-w-md mx-auto my-10")
                each error in errores 
                    p.bg-red-600.text-white.uppercase.text-xs.text-center.p-2.mb-1.font-bold=error.msg

        .mt-8.mx-auto.max-w-md 
            .bg-white.py-8.px-4.shadow
                form.space-y-5(method='POST' action="/auth/registro" novalidate)  
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
----

# Autollenando los campos que pasaron la validación
~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }

    const usuario = await Usuario.create(req.body)

    res.json({
        msg: "Usuario creado correctamente"
    })
}





~~~

- En el archivo registro.pug añado el value= usuario.nombre en el input
- Pero esto da error porque cuando yo visite por primera vez esta página la variable no existe
    - entonces guardo la variable de forma condicional
    - lomismo para el mail

- registro.pug:
~~~pug
extends ../layout/index
block contenido
    div.py-2
        h1.text-4xl.my-10.font-extrabold.text-center Bienes 
            span.font-normal Raíces 
        h2.text-center.text-2xl.font-extrabold=pagina

        if errores 
            div(class="max-w-md mx-auto my-10")
                each error in errores 
                    p.bg-red-600.text-white.uppercase.text-xs.text-center.p-2.mb-1.font-bold=error.msg

        .mt-8.mx-auto.max-w-md 
            .bg-white.py-8.px-4.shadow
                form.space-y-5(method='POST' action="/auth/registro" novalidate)  
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="nombre") Tu nombre 
                        input#nombre.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Tu nombre" 
                        type="text" name="nombre" value =usuario ? usuario.nombre : '')
                    div 
                        label.block.text-sm.uppercase.text-gray-600.mb-2.font-bold(for="email") Tu email 
                        input#email.w-full.px-3.py-2.border.border-gray-300.rounded-md.placeholder-gray-400(placeholder="Tu email" 
                        type="email" name="email" value= email ? usuario.email : '')
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
------

# Prevenir usuarios duplicados
- Se hace a través del email, en la función registrar del controller 
- Uso el método findOne
- Creo un arreglo al vuelo del error porque la lógica ya la tengo en el archivo registro.pug
~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }
    const {nombre, email}= req.body

    const existeUsuario = await Usuario.findOne({where:{email} })
    

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario: {
                nombre,
                email,        
            }
                
        })
    }


    const usuario = await Usuario.create(req.body)

    res.json({
        msg: "Usuario creado correctamente"
    })
}

~~~
----
- Puedo extraer con desestructuración del req.body el nombre, email y password
# HASHEAR LOS PASSWORDS
- Uso un hook de sequelize en el modelo, beforeCreate
- Genero el salto de 10 rondas
- Sobreescribo el password
- Antes de guardar hasheará el password
~~~js
import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Usuario = db.define('usuarios',{
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false

    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
    
}, {
    hooks:{
        beforeCreate: async function(usuario){
            const salt = await bcrypt.genSalt(10)
            usuario.password= await bcrypt.hash(usuario.password, salt)
        }
    }
})


export default Usuario
~~~
----------
- Le paso los datos de la desestructuración al Usuario.create()
- Me invento un token ( crearlo será lo siguiente con generarID )
~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }

    const {nombre, email,password}= req.body
    const existeUsuario = await Usuario.findOne({where:{email} })

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario: {
                nombre,
                email,        
            }
                
        })
    }


    await Usuario.create({
        nombre,
        email, 
        password,
        token: generarID()
    })

    res.json({
        msg: "Usuario creado correctamente"
    })
}
~~~
----

# Generar TokenID
- Creo la carpeta de helpers con el archivo tokens.js
- Creo la función de generarId
- Lo importo en el controller
~~~js
const generarId= () => Math.random().toString(32).substring(2) + Date.now().toString(32)

export {
    generarId
}
~~~

---
# Mostrar mensaje de confirmación

~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }

    const {nombre, email,password}= req.body
    const existeUsuario = await Usuario.findOne({where:{email} })

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario: {
                nombre,
                email,        
            }
                
        })
    }


    await Usuario.create({
        nombre,
        email, 
        password,
        token: generarID()
    })

    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje:'Hemos enviado un mail de confirmación, presiona en el enlace'
    })
}
~~~
- Creo la carpeta templates en views con el archivo mensaje.pug
- Copio el "header" del login y lo pego
~~~pug
extends ../layout/index

block contenido

    div
        h1.text-4xl.my-10.font-extrabold.text-center Bienes
            span.font-normal Raices 
        h2.text-center.text-2xl= pagina

        p.text-xl.font-bold.text-center.my-10= mensaje
~~~


# Enviando mails con NodeMailer y Mailtrap
- Mailtrap se asegura de que todos los emails lleguen a destino. Es ideal para hacer pruebas

> npm i nodemailer
- Coloco en variables de entorno lo que hay en SMTP SETTINGS
    - En la pestaña de integrations coloco Nodemailer
    - No las coloco aquí por seguridad
- En .env:
~~~js
BD_NOMBRE=bienesraices_node_mvc
BD_USER=
BD_PASS=
BD_HOST=localhost
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
~~~

- Creo en helpers un archivo llamado emails.js

- Creo la función, copio y pego el código de SMTP settings y le coloco las variables de entorno que he definido previamente
~~~js
import nodemailer from 'nodemailer'



const emailRegistro= async(datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASSWORD
        }
      });
      console.log(datos)
}

export {
    emailRegistro
}
~~~
# Probando el envío de emails

- Una vez se registra el usuario voy a extraer el email, el nombre y el token
- Guardo el crear usuario en una variable
~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }

    const {nombre, email,password}= req.body
    const existeUsuario = await Usuario.findOne({where:{email} })

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario: {
                nombre,
                email,        
            }
                
        })
    }


    const usuario= await Usuario.create({
        nombre,
        email, 
        password,
        token: generarID()
    })

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje:'Hemos enviado un mail de confirmación, presiona en el enlace'
    })
}
~~~
- debajo de usuario es donde debo enviar el email de confirmacion, importo de helper emailRegistro
    - Le coloco un conssole.log a los datos en el transport para visualizar la data
    - Creo un objeto con los parametros que requiero
~~~js
const registrar = async (req,res)=>{
    
    await check('nombre').notEmpty().withMessage("El nombre es obligatorio").run(req)
    await check('email').isEmail().withMessage("Eso no es un email").run(req)
    await check('password').isLength({ min: 6}).withMessage("El password debe ser de al menos 6 caracteres").run(req)
    //await check('repetir_password').equals('password').withMessage("Los passwords no son iguales").run(req)
    
    let resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario:{
               nombre: req.body.nombre,
               email: req.body.email
            }
        })
    }
    
    const {nombre,email, password} = req.body
    
    const existeUsuario = await Usuario.findOne({where:{email}})

    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario:{
               nombre,
               email
            }
        })
    }

    const usuario= await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // envia email  de confirmacion

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje:'Hemos enviado un mail de confirmación, presiona en el enlace'
    })
}
~~~
- Con el console.log de datos en helpers/emails puedo ver en consola cómo están los datos correctamente
- Los extraigo con desestructuración en emailregistro  de emails.js
~~~js

const emailRegistro= async(datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASSWORD
        }
      });

      const {email, nombre, token} = datos;

      //Enviar el email
}
~~~
- Este transport va a autenticarse en mailtrap, va a usar los servicios de mailtrap y me da acceso a los métodos como sendMail
- Todo esto es interno de Nodemailer pero requiere de las credenciales de mailtrap
- Dentro de sendMail se coloca que cuenta envia el email, a que persona, el mensaje, etc
- Le coloco un template literal para crear el cuerpo del mensaje
~~~js
import nodemailer from 'nodemailer'



const emailRegistro= async(datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASSWORD
        }
      });

      const {email, nombre, token} = datos;

      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject:'Confirma tu cuenta en BienesRaices.com',
        text:'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
            <p>Tu cuenta ya está lista, sólo debes confirmarla con este enlace: 
            <a href="#">Confirmar Cuenta</a> </p>
            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje</p>
        `
      })
}

export {
    emailRegistro
}

~~~
- Ahora si consulto mailtrap tengo un mensaje!!!!!
- Ahora hay que crear un endpoint nuevo de confirmar-cuenta y va a poder leer el token de la url

# Leer el token del usuario
- En el enlace que se envío por email, hay que volver al dominio. El mail va a contener el token, hay que encontrar la forma de leerlo
- En usuarioRoutes.js:
~~~js
router.get('/confirmar/:token', confirmar)
~~~
- Creo la función confirmar en usuarioController
- Hay que leer el token de la url con req.params
- Extraigo el token de req.params
~~~js
const confirmar =(req,res)=>{
    const {token}= req.params

    console.log(token)
}
~~~
- Volviendo al mail en helpers/emails.js
- Voy a necesitar una variable de entorno para la url del backend.
    - La pongo en BACKEND_URL= http://localhost
    - También lo hago con PORT
~~~js
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject:'Confirma tu cuenta en BienesRaices.com',
        text:'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
            <p>Tu cuenta ya está lista, sólo debes confirmarla con este enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 4000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>
            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje</p>
        `
      })
~~~
----

- Si ahora hago el proceso de registro y doy click al enlace aparece el token en la url

- confirmar-cuenta.pug: añado link de iniciar sesión si no hay error
    - renderizo de forma consicional error o success

~~~pug
extends ../layout/index
block contenido
    div.py-2
        h1.text-4xl.my-10.font-extrabold.text-center Bienes 
            span.font-normal Raíces 
        h2.text-center.text-2xl.font-extrabold= pagina

    div(class="bg-white shadow py-8 px-4 rounded-lg max-w-md mx-auto")
        p(class= error ? 'bg-red-500': 'bg-green-500').py-2.px-5.rounded-lg.w-full.text-white.text-center.font-bold= mensaje

        if !error
            a(href="/auth/login" class="text-center font-bold text-sm text-slate-600 uppercase mt-10 block") Ya puedes iniciar sesión
~~~
# Confirmar cuenta

- Puedo acceder a los valores con notación de punto, son objetos al fin y al cabo
- Entonces, le hago los cambios a usuario y luego lo guardo
    - Elimino el token
    - Cambio usuario.confirmado a true

~~~js

export const confirmar = async(req,res)=>{
    const {token}= req.params

   const usuario = await Usuario.findOne({where: {token}})
   
   if(!usuario){
    return res.render('auth/confirmar-cuenta',{
        error: true,
        pagina: "Error al confirmar",
        mensaje: "Error en la confirmación del token"
    })
   }

   usuario.token= null
   usuario.confirmado = true

   await usuario.save()

   return res.render('auth/confirmar-cuenta',{
        error: false,
        pagina: "Confirmación realizada",
        mensaje: "Tu cuenta se confirmó correctamente"
   })
   
    
}

~~~
---
# Habilitar protección  CSRF
> npm i csurf cookie-parser
- Lo importo en el index.js.
- Configuro el csrf con cookie, asi estará de forma global en la app
~~~js
import csrf from 'csurf'
import cookieParser from 'cookie-parser'


app.use(cookieParser())

app.use(csrf({cookie: true}))
~~~
- Voy al controlador y concretamente al formulario registro, que es el que muestra la vista del formulario
- Como lo configuré de forma global con cookie: true tengo acceso a  req.csrfToken
- usuarioController.js:
~~~js
const formularioRegistro  = (req, res) =>{
    console.log(req.csrfToken())
    
    res.render('auth/registro', {
        pagina: "Crear Cuenta"
    })
}
~~~
- Este token público se genera con una llave privada que comprueba que el req venga de esta url
- Requiere que se envíe con el formulario. Para ello lo renderizaré y enviaré como parte del formulario
~~~js
const formularioRegistro  = (req, res) =>{
    
    
    res.render('auth/registro', {
        pagina: "Crear Cuenta",
        csrfToken: req.csrfToken()
    })
}
~~~
- Ahora en el form de registro.pug hay que colocar un input de tipo oculto con el name="_csrf"
~~~pug
 form.space-y-5(method='POST' action="/auth/registro" novalidate)
    input(type="hidden" name="_csrf" value=csrfToken)
    div (...)
~~~
- De esta manera forma parte del req., va a comprobarlo la dependencia de csurf, va a leer ese valor y lo compara. 
- Genero la variable en el controller pero la tengo que imprimir en el value 
- Como la funcionalidad se da también en registrar, debo añadir el csrfToken tambien a la función de registrar, para que cuando haga la validación, luego no me de error de invalid Token
~~~js
export const registrar = async (req,res)=>{

    await body('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await body('email').isEmail().withMessage('Email no válido').run(req)
    await body('password').isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await body('repetir_password').equals(req.body.password).withMessage("Los passwords no coinciden").run(req)

    let resultado = validationResult(req)


    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre:req.body.nombre,
                email:req.body.email        
            }
                
        })
    }

    const {nombre, email,password}= req.body
    const existeUsuario = await Usuario.findOne({where:{email} })

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario ya está registrado"}],
            usuario: {
                nombre,
                email,        
            }
                
        })
    }



~~~
- Y LISTO!