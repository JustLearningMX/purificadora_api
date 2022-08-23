/**Controlador con las funciones que se implementan
 * en el endpoint /ventas, una vez creada la venta 
 * se crea su detalle de las ventas*/

const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const DetalleVenta = mongoose.model('DetalleVenta'); //Modelo a utilizar

/**Funcion que Crea los productos de una venta */
async function crearDetalleDeVenta(body){
       
    //Creamos un nuevo detalle de venta basado en el modelo y su esquema
    const detalleVenta = new DetalleVenta(body);

    try {
        const item = await detalleVenta.save();
        const dataDetalleVenta = item.publicData();

        //Retornamos la respuesta
        return { 
            error: null,
            message: 'Detalle de la Venta guardada exitosamente',
            datos: dataDetalleVenta,
        };
    } catch (e) { //Si hubo un error
        return {
            error: true,
            message: 'No se puedo guardar el Detalle de la Venta',
            venta: body,
            totalError: e,
        };
    }
}

/**Funcion que obtiene los productos de una o varias ventas */
async function obtenerDetalleDeVentas(id){
    const todos = await DetalleVenta.find();
    const arrayDetalleVentas = todos
        .filter( detalleVenta => detalleVenta.id_venta.toString() && detalleVenta.id_venta.toString() === id )
        .map( detalleVenta => detalleVenta.publicData());
    
    return arrayDetalleVentas;
}

/**Funcion que elimina los productos de una venta */
async function eliminarDetalleDeVentas(id){
    const datosEliminados = await obtenerDetalleDeVentas(id);
    await DetalleVenta.deleteMany( {id_venta: id});
    
    return datosEliminados;
}

/**Funcion que Actualiza los productos de una venta */
async function actualizarDetalleDeVentas(idProducto, nuevaInfo){
    const detalleVentaActualizada = await DetalleVenta.findByIdAndUpdate(idProducto, nuevaInfo, { new: true});
    
    return detalleVentaActualizada.publicData();
}

module.exports = {
    crearDetalleDeVenta,
    obtenerDetalleDeVentas,
    eliminarDetalleDeVentas,
    actualizarDetalleDeVentas
}