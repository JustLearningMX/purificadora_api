/**
 * Router que maneja los endpoints específicos
 * para los Usuarios
 */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido, opcional } = require('./auth');

//Importamos las funciones del controlador Usuarios
const {
    login,
    signup,
    obtenerUsuario,
    modificarUsuario,
    eliminarUsuario
 } = require('../controllers/usuarios');

//Middlewares para los endpoints de /usuarios
router.get('/', requerido, obtenerUsuario); // Un usuario solo puede solicitar info de sí mismo
router.post('/login', login); //Un usuario Registrado puede iniciar sesión
router.post('/signup', opcional, signup); //Un usuario no registrado puede darse de alta, o un Admin puede agregar usuarios
router.put('/update', requerido, modificarUsuario) //Un usuario puede modificar sus propios datos
router.delete('/delete', requerido, eliminarUsuario) //Un usuario puede eliminar su cuenta

//Exportamos el router creado
module.exports = router;