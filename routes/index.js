/**
 * Control de endpoints de la API.
 * Desde aquí se rutea el acceso a cada sección
 */

//Instanciamos un router de Express
const router = require('express').Router();

//Raíz de la  API: purificadora_api/v1
router.get('/', (req, res)=>{ 
    res.json({
        error: null,
        message: 'Bienvenido a la API de Purificadora Río Jordán'
    });
});

//Middlewares para gestionar endpoints de la API
router.use('/usuarios', require('./usuarios')); //purificadora_api/v1/usuarios
router.use('/productos', require('./productos')); //purificadora_api/v1/productos
router.use('/sucursales', require('./sucursales')); //purificadora_api/v1/sucursales
router.use('/ventas', require('./ventas')); //purificadora_api/v1/ventas
router.use('/inventarioClientes', require('./inventarioClientes')); //purificadora_api/v1/inventarioClientes

//Exportamos el router creado
module.exports = router;