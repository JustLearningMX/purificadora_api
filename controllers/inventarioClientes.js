/**Controlador con las funciones que se implementan
 * en el endpoint /ventas, una vez creada la venta y sus detalles de productos
 * se actualiza el inventario final de compras del usuario*/

const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const InventarioCliente = mongoose.model('InventarioCliente'); //Modelo a utilizar

/**Funcion que Crea o Actualiza la cantidad 
 *de botellones de 19lts actuales del cliente */
async function gestionarInventarioCliente(body){

    //Primero buscar si ya existe un usuario con ese telefono
    const usuarios = await InventarioCliente.find();

    const usuario = usuarios
        .filter( usuario => usuario.telefono_cliente === body.telefono_cliente );
    
    if(usuario.length > 0) {//Si existe el usuario, se actualiza su inventario
        const idInventario = usuario[0]._id.toString();

        //Actualizamos la cantidad actual de garrafones del cliente
        try {
            const inventarioActualizado = await InventarioCliente.findByIdAndUpdate(idInventario, body, { new: true});
            const dataInventarioCliente = inventarioActualizado.publicData();

            //Retornamos la respuesta
            return { 
                error: null,
                message: 'Inventario del cliente actualizado exitosamente',
                datos: dataInventarioCliente,
            };
        } catch (e) {
            return {
                error: true,
                message: 'No se puedo guardar el Inventario de la compra del cliente',
                venta: body,
                totalError: e,
            };
        }
    } 
    else {//Si no existe el usuario, se crea su inventario        
        //Creamos una instancia basado en el modelo y su esquema
        const inventarioCliente = new InventarioCliente(body);

        try {
            const item = await inventarioCliente.save();
            const dataInventarioCliente = item.publicData();
    
            //Retornamos la respuesta
            return { 
                error: null,
                message: 'Inventario del cliente creado y guardado exitosamente',
                datos: dataInventarioCliente,
            };
        } catch (e) { //Si hubo un error
            return {
                error: true,
                message: 'No se puedo guardar el Inventario de la compra del cliente',
                venta: body,
                totalError: e,
            };
        }
    }
}

module.exports = {
    gestionarInventarioCliente
}