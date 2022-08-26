/** Router que maneja los endpoints específicos para el
 ** inventario de garrafones actuales que tiene el cliente */

//Instanciamos un elemento router de Express
const router = require('express').Router();
const { requerido } = require('./auth');

//Importamos las funciones del controlador inventarioClientes
const { 
    obtenerInventarioCliente,
} = require('../controllers/inventarioClientes');

//Middlewares para los endpoints de /inventarioClientes, solo Admins y empleados
router.get('/:telefono', requerido, obtenerInventarioCliente); // Obtener inventario de un solo cliente

//Exportamos el router creado
module.exports = router;