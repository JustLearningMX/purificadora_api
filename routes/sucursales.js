/**
 * Router que maneja los endpoints específicos
 * para las Sucursales */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido } = require('./auth');

//Importamos las funciones del controlador Usuarios
const {
    obtenerSucursales,
    obtenerSucursal,
    crearSucursal,
    actualizarSucursal,
    eliminarSucursal
 } = require('../controllers/sucursales');

//Middlewares para los endpoints de /productos, solo Admins y empleados
router.get('/', requerido, obtenerSucursales); //  Obtener todos las sucursales
router.get('/:id', requerido, obtenerSucursal); // Obtener una venta
router.post('/', requerido, crearSucursal); // Crear uno nuevo
router.put('/:id', requerido, actualizarSucursal); // Actualizar los datos
router.delete('/:id', requerido, eliminarSucursal); // Eliminar uno

//Exportamos el router creado
module.exports = router;