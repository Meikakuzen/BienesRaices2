import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'


const app = express()
app.use(express.urlencoded({extended: true}))

app.use(cookieParser()) // lo requiere csurf para funcionar correctamente

app.use(csrf({cookie: true})) // va a utilizar cookies, va a estar de forma global

//habilitar lectura de formularios

app.use(express.json())



//conexión a db

try {
    await db.authenticate()
    db.sync()
    console.log("Conexión correcta a la DB")

} catch (error) {
    console.log(error)
}




app.set('view engine', 'pug')
app.set('views', './views')


app.use(express.static('public')) //para indicar dónde estan los archivos estáticos: librerías, fotos, estilos...

app.use('/auth', usuarioRoutes)




app.listen(process.env.PORT || 4000, ()=>{
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})

