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

//Exportamos el router creado
module.exports = router;