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
    obtenerUsuario
 } = require('../controllers/usuarios');

//Middlewares para los endpoints de /usuarios
router.get('/', requerido, obtenerUsuario); // Un usuario solo puede solicitar info de sí mismo
router.post('/login', login); //purificadora_api/v1/usuarios/login
router.post('/signup', opcional, signup); //purificadora_api/v1/usuarios/signup

//Exportamos el router creado
module.exports = router;