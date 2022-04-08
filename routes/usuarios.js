/**
 * Router que maneja los endpoints específicos
 * para los Usuarios
 */

//Instanciamos un elemento router de Express
const router = require('express').Router();

//Importamos las funciones del controlador Usuarios
const {
    login,
    signup
 } = require('../controllers/usuarios');

//Middlewares para los endpoints de /usuarios
router.get('/', login); // Reenvía al Login
router.get('/login', login); //purificadora_api/v1/usuarios/login
router.get('/signup', signup); //purificadora_api/v1/usuarios/signup

//Exportamos el router creado
module.exports = router;