/**Controlador con las funciones que se implementan
 * en el endpoint /ventas, una vez creada la venta y sus detalles de productos
 * se actualiza el inventario final de compras del usuario*/

const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const InventarioCliente = mongoose.model('InventarioCliente'); //Modelo a utilizar

/**Funcion que Crea o Actualiza la cantidad 
 *de botellones de 19lts actuales del cliente */
async function gestionarInventarioCliente(body){

    //Se busca al cliente en la tabla inventarioCliente
    const usuario = await encontrarClienteEnTabla(body.telefono_cliente);
    
    if(usuario.length > 0) {//Si existe el usuario, se actualiza su inventario
        const idInventario = usuario[usuario.length-1]._id.toString();

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
                message: 'No se pudo guardar el Inventario de la compra del cliente',
                venta: body,
                totalError: e,
            };
        }
    }
}

/**Este metodo recibe el telefono del cliente, lo busca en la tabla inventarioCliente,
 * si existe devuelve un objeto con la cantidad_actual que tiene el cliente de su ultimo
 * llenado, en caso de no existir aun devuelve FALSE */
async function obtenerInventarioCliente(req,res) {
    const telefono_cliente = req.params.telefono; //Telefono del cliente
    
    const usuario = verificarUsuario(req, res); //Si el usuario existe

    //Si el usuario es Admin o Empleado
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) { 

        try {
            //Se busca al cliente en la tabla inventarioCliente
            const cliente = await encontrarClienteEnTabla(telefono_cliente); 

            //Si se encontro un cliente
            if(cliente.length > 0) {
                const dataCliente = cliente[cliente.length-1].publicData();

                //Retornamos la cantidad que tiene el cliente
                return res.status(201).json({ 
                    error: null,
                    message: 'Cliente encontrado exitosamente en la tabla inventarioCliente',
                    fueEncontrado: true,
                    datos: dataCliente,
                });
            } else {
                //Retornamos que el cliente no existe en la tabla
                return res.status(404).json({ 
                    error: null,
                    message: 'Cliente no existe en la tabla.',
                    fueEncontrado: false,
                    telefono_cliente: telefono_cliente,
                });
            }
            
        } catch (e) {
            return res.status(500).json({
                error: true,
                message: 'Error en el servidor al buscar Cliente en la tabla inventarioCliente.',
                telefono_cliente: telefono_cliente,
                totalError: e,
            });
        }
    }
}

/**Este metodo trae todos los datos de la tabla inventarioCliente,
 * y devuelve un array de objetos con la cantidad_actual que tienen
 * los clientes de su ultimo llenado*/
 async function obtenerInventarioClientes(req,res) {
    // const telefono_cliente = req.params.telefono; //Telefono del cliente
    
    const usuario = verificarUsuario(req, res); //Si el usuario existe

    //Si el usuario es Admin o Empleado
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {

        try {
            //Se buscan todos los clientes y sus datos en la tabla inventarioCliente
            const todos = await InventarioCliente.find();

            //Mapeamos lo encontrado
            const usuariosInventario = todos.map( inventario => {
                return inventario.publicData();
            });

            //Retornamos la informacion al usuario
            return res.status(201).json({ 
                error: null,
                message: 'Inventario de clientes encontrado exitosamente.',
                datos: usuariosInventario,
            });
            
        } catch (e) {
            return res.status(500).json({
                error: true,
                message: 'Error en el servidor al buscar Cliente en la tabla inventarioCliente.',
                totalError: e,
            });
        }
    }
}

/**Verificar si ya existe un cliente con ese telefono en la tabla inventarioCliente de MongoDB*/
async function encontrarClienteEnTabla(telefono_cliente) {
    const usuarios = await InventarioCliente.find(); //Todos los usuarios
    
    //Filtramos para encontrar al usuario especifico
    const usuario = usuarios 
        .filter( usuario => usuario.telefono_cliente === telefono_cliente );

    return usuario; //Retornamos lo que encontro o no.
}

/**Verificar que un usuario exista y sea Admin  o Empleado */
function verificarUsuario(req, res){    
    const usuario = req.usuario; // Usuario existente

    if(!usuario || (usuario && usuario.tipo === 'cliente')) {
        return (res.status(401).json({
            error: true,
            message: 'Es necesario autenticarse como Administrador o Empleado para acceder a este recurso',
        }));
    }

    return usuario;
}

module.exports = {
    gestionarInventarioCliente,
    obtenerInventarioCliente,
    obtenerInventarioClientes
}