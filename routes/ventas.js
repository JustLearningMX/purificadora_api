/**
 * Router que maneja los endpoints específicos
 * para las Ventas */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido } = require('./auth');

//Importamos las funciones del controlador Usuarios
const {
    obtenerVentas,
    obtenerVenta,
    crearVenta,
    actualizarVenta,
    eliminarVenta
 } = require('../controllers/ventas');

//Middlewares para los endpoints de /productos, solo Admins y empleados
router.get('/', requerido, obtenerVentas); //  Obtener todos las ventas
router.get('/:id', requerido, obtenerVenta); // Obtener una venta
router.post('/', requerido, crearVenta); // Crear uno nuevo
router.put('/:id', requerido, actualizarVenta); // Actualizar los datos
router.delete('/:id', requerido, eliminarVenta); // Eliminar uno

//Exportamos el router creado
module.exports = router;