import {body, validationResult} from 'express-validator'
import { generarID } from '../helpers/tokens.js'
import Usuario from '../models/Usuario.js'
import { emailRegistro } from '../helpers/emails.js'


export const formularioLogin = (req,res)=>{
    res.render('auth/login', {
        pagina: "Iniciar Sesión"
    })
}

export const formularioRegistro = (req,res)=>{
   
    res.render('auth/registro',{
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    })
}

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

export const formularioOlvidePassword= (req,res)=>{
    res.render('auth/olvide-password',{
        pagina: "Recupera tu acceso a Bienes Raíces"
    })
}

export const borrarUsuaurio = (req,res)=>{
    res.json({
        msg: "Petición DELETE ok"
    })
}
