const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const Venta = mongoose.model('Venta'); //Modelo de la venta
const LlenadoGratis = mongoose.model('LlenadoGratis'); //Modelo de los llenados gratis

const { 
    VentasDetallesYProductosPorUsuario,
    LlenadoGratisPorUsuario
} = require('../../utils/mongoDBAgreggations.js');

//Datos para el historial de compras del cliente
async function obtenerVentasPorUsuario(req, res){

    const telefono_cliente = req.usuario.telefono; //Ya logueado

    //Si no existe un usuario o no tiene un telefono
    verificarUsuario(req);

    try {
        //Llamada a la BD
        const detalleVentasProductos = await Venta.aggregate(VentasDetallesYProductosPorUsuario(telefono_cliente));

        if(detalleVentasProductos.length <= 0) { //Sin datos de ventas
            return res.status(401).json({ 
                error: null,
                tieneDatos: false,
                message: `El usuario ${telefono_cliente} no tiene ventas.`,
            })
        } else {  //Si tiene ventas
            return res.status(201).json({ 
                error: null,            
                tieneDatos: true,
                message: `Compras del usuario ${telefono_cliente} generados exitosamente`,
                data: detalleVentasProductos, 
            })
        }
    } catch (error) {
        //Error con el servicio de MongoDB
        return res.status(500).json({ 
            error: true,
            message: `Error en el servidor al consultar las tablas ventas, detalleVentas y productos.`,
            totalError: error,
        })
    }
}

//Datos para el historial de garrafones gratis del cliente
async function obtenerLlenadosGratisPorUsuario(req, res){

    const telefono_cliente = req.usuario.telefono; //Ya logueado

    //Si no existe un usuario o no tiene un telefono
    verificarUsuario(req);

    try {
        //Llamada a la BD
        const detalleLlenadosGratis = await LlenadoGratis.aggregate(LlenadoGratisPorUsuario(telefono_cliente));

        if(detalleLlenadosGratis.length <= 0) { //Sin datos de ventas
            return res.status(401).json({ 
                error: null,
                tieneDatos: false,
                message: `El usuario ${telefono_cliente} no tiene Llenados gratis.`,
            })
        } else {  //Si tiene ventas
            return res.status(201).json({ 
                error: null,            
                tieneDatos: true,
                message: `Datos de los Llenados gratis del usuario ${telefono_cliente} generados exitosamente`,
                data: detalleLlenadosGratis, 
            })
        }
    } catch (error) {
        //Error con el servicio de MongoDB
        return res.status(500).json({ 
            error: true,
            message: `Error en el servidor al consultar las tablas llenadoGratis, ventas.`,
            totalError: error,
        })
    }
}

function verificarUsuario(req) {
    if(!req.usuario || !req.usuario.telefono){
        return res.status(401).json({ 
            error: true,
            message: `No existe el usuario o aún no está registrado.`,
        })
    }
}

module.exports = {
    obtenerVentasPorUsuario,
    obtenerLlenadosGratisPorUsuario
};