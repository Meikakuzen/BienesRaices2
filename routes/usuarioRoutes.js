import {Router} from 'express'
import { formularioLogin, borrarUsuaurio,formularioRegistro, confirmar, registrar, formularioOlvidePassword } from '../controllers/usuarioController.js'

const router = Router()


router.get('/login', formularioLogin)
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)
router.get('/confirmar/:token', confirmar)
router.get('/olvide-password', formularioOlvidePassword)
router.delete('/', borrarUsuaurio)




export default router