/**
 * Router que maneja los endpoints específicos
 * para los diferentes Reportes */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido } = require('./auth');

//Importamos las funciones para los historiales del cliente. reportes/clientes
const {
    obtenerVentasPorUsuario,
    obtenerLlenadosGratisPorUsuario,
 } = require('../controllers/reports/clientes');

 //Importamos las funciones para ventas. reportes/ventas
const {
    obtenerTodasLasVentas
 } = require('../controllers/reports/ventas');

//Middlewares para los endpoints de /reportes, solo usuarios logueados
router.get('/ventas/todos', requerido, obtenerTodasLasVentas); //  Obtener todas las ventas y sus detalles
router.get('/historialDeCompras', requerido, obtenerVentasPorUsuario); //  Obtener todas las ventas y sus detalles de un usuario
router.get('/historialDeLlenadosGratis', requerido, obtenerLlenadosGratisPorUsuario); //  Obtener todos los llenados gratis de un usuario

//Exportamos el router creado
module.exports = router;