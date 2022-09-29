const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const Venta = mongoose.model('Venta'); //Modelo de la venta

const { 
    VentasDetallesYProductosTodos
} = require('../../utils/mongoDBAgreggations.js');

//Todas las ventas
async function obtenerTodasLasVentas(req, res){

    //Si no existe un usuario o no tiene un telefono
    verificarUsuario(req, res);

    try {
        //Llamada a la BD
        const detalleVentasProductos = await Venta.aggregate(VentasDetallesYProductosTodos());

        if(detalleVentasProductos.length <= 0) { //Sin datos de ventas
            return res.status(401).json({ 
                error: null,
                tieneDatos: false,
                message: `No existen ventas.`,
            })
        } else {  //Si tiene ventas
            return res.status(201).json({ 
                error: null,            
                tieneDatos: true,
                message: `Todas las ventas generadas exitosamente`,
                data: detalleVentasProductos, 
            })
        }
    } catch (error) {
        //Error con el servicio de MongoDB
        return res.status(500).json({ 
            error: true,
            message: `Error en el servidor de MongooDB al consultar las tablas ventas, detalleVentas, productos, usuarios.`,
            totalError: error,
        })
    }
}

function verificarUsuario(req, res) {
    const usuario = req.usuario; // Usuario existente

    if(!usuario || (usuario && usuario.tipo === 'cliente')) {
        return res.status(401).json({
            error: true,
            message: 'Es necesario autenticarse como Administrador o Empleado para acceder a este recurso',
        });
    }
}

module.exports = {
    obtenerTodasLasVentas,
};