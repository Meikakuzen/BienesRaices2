# ORM

> npm i sequelize mysql2

- Creo la base de datos en MySQL, con la consola CLI de MySQL
> CREATE DATABASE bienesraices_node_mvc ;
- Creo una carpeta nueva en la raíz llamada config y dentro un archivo llamado db.js con esto
~~~js
import Sequelize from 'sequelize'

const db = new Sequelize()
~~~
- Toma 4 parámetros
    - La base de datos
    - El nombre de usuario
    - El password
    - Objeto de configuración:
    - Servidor, el puerto, el motor( dialect ), timestamps ( agrega dos columnas, cuando fue creado y actualizado)
    - pool
- Este pool configura el comportamiento para conexiones.
    - max 5 conexiones va a tratar de mantener
    - min ninguna
    - Acquire son 30000 milisegundos ( 30 segundos ) el tiempo que va a pasar de tratar de hacer una conexión antes de marcar error
    - idle, ve que no hay nada de movimiento le da 10 segundos para finalizar la conexión
- Aliases ya no los usa pero con esta linea nos aseguramos
- Lo exportopor default
~~~js
import Sequelize from 'sequelize'

const db = new Sequelize('bienesraices_node_mvc', 'root', 'root',{
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    define:{
        timestamps:true
    },
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorAliases: false
});

export default db
~~~
---
- Uso untry catch en el index para hacer la conexión a la base de datos
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'


const app = express()

try {
    await db.authenticate()
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

- Hay que usar variables de entorno para ocultar información como el nombre de la base de datos, password , etc
-----
# Variables de entorno
> npm i dotenv
- En el archivo .env en la raiz:
~~~
BD_NOMBRE=bienesraices_node_mvc
BD_USER=root
BD_PASS=root
BD_HOST=localhost
~~~
- En el archivo db debo importar dotenv y decirle el path del archivo .env que está en la raíz:
~~~js
import Sequelize from 'sequelize'
import dotenv from 'dotenv'

dotenv.config({path: '.env'})

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS,{
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    define:{
        timestamps:true
    },
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorAliases: false
});

export default db
~~~
----
- En el index.js:
~~~js
import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'


const app = express()

try {
    await db.authenticate()
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
- Lo siguiente es definir un modelo
