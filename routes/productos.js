/**
 * Router que maneja los endpoints específicos
 * para los Productos
 */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido } = require('./auth');

//Importamos las funciones del controlador Usuarios
const {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
 } = require('../controllers/productos');

//Middlewares para los endpoints de /productos, solo Admins y empleados
router.get('/', requerido, obtenerProductos); //  Obtener todos los Productos
router.get('/:id', requerido, obtenerProducto); // Obtener un Producto
router.post('/', requerido, crearProducto); // Crear uno nuevo
router.put('/:id', requerido, actualizarProducto); // Actualizar los datos
router.delete('/:id', requerido, eliminarProducto); // Eliminar uno

//Exportamos el router creado
module.exports = router;