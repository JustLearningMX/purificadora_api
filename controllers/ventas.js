/**Controlador con las funciones que se implementan
 * en el endpoint /ventas para Crear, Leer, Actualizar 
 * y Eliminar Ventas mediante las funciones que
 * nos proporciona mongoose*/

 const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
 const Venta = mongoose.model('Venta'); //Modelo a utilizar
 
 const { 
    crearDetalleDeVenta,
    obtenerDetalleDeVentas,
    eliminarDetalleDeVentas,
    actualizarDetalleDeVentas
} = require('./detalleVentas'); //../controllers/detalleVentas

const { gestionarInventarioCliente } = require('./inventarioClientes');
const { crearLlenadoGratis } = require('./llenadosGratis');

function obtenerVentas(req, res, next){

    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los productos
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {      
        
        Venta.find()
            .then( async (todos) => {
                
                const arrayVentas = await Promise.all(
                    todos.map( async (venta) => {
                        
                        /**AQUI TRAEMOS LOS DETALLES DE LAS VENTAS */
                        const detallesVenta = await obtenerDetalleDeVentas(venta.id);                        

                        return {datos: venta.publicData(), productos: detallesVenta ? detallesVenta : null}
                    })
                );

                return (res.status(201).json({
                    error: null,
                    message: 'Lista de ventas generada exitosamente',
                    ventas: arrayVentas
                }));
            })
            .catch(next)
    }
}

function obtenerVenta(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idVenta = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía la venta que coincida con el ID de venta
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        if(idVenta) {
            Venta.findById(idVenta)
            .then( async venta => {

                /**AQUI TRAEMOS LOS DETALLES DE LAS VENTAS */
                const detallesVenta = await obtenerDetalleDeVentas(idVenta);

                return (res.status(201).json({
                    error: null,
                    message: 'Venta existente.',
                    venta: venta.publicData(),
                    detallesVentas: detallesVenta
                }));
            })
            .catch(next)
        }
    }
}

async function crearVenta(req, res, next){
    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        
        const bodyVenta = req.body.venta; //Cuerpo para guardar una venta
        const bodyDetallesVenta = req.body.detalleVenta; //Cuerpo para guardar detalle de la venta
        const bodyInventarioCliente = req.body.inventarioCliente; //Cuerpo para guardar la nueva cantidad
        const bodyLlenadosGratis = req.body.llenadoGratis; //Cuerpo para guardar la cantidad de llenados gratis

        //Creamos una nueva venta basado en el modelo y su esquema
        const venta = new Venta(bodyVenta);        

        /**********AQUI SE MANDA A CREAR EL DETALLE DE LA VENTA *******/
        const resDetalleVentas = await Promise.all(
            bodyDetallesVenta.map( async (body) => {
                body.id_venta = venta._id.toString();
                return await crearDetalleDeVenta(body);
            })
        );
        /**************************************************************/

        /**AQUI SE MANDA A CREAR O ACTUALIZAR EL INVENTARIO DE COMPRA DEL CLIENTE */
        let inventarioClienteActualizado = null;
        if(bodyVenta.telefono_cliente !== '0000000000') {
            bodyInventarioCliente.telefono_cliente = bodyVenta.telefono_cliente;
            bodyInventarioCliente.id_venta = venta._id.toString();
            inventarioClienteActualizado = await gestionarInventarioCliente(bodyInventarioCliente);
        }
        /**************************************************************************/

        /**AQUI SE MANDA A CREAR EL REGISTRO DE LOS LLENADOS GRATIS DE LA COMPRA DEL CLIENTE */
        let llenadoGratisActualizado = null;
        if(bodyLlenadosGratis.cantidad > 0) { //Solo si hay llenados gratis
            bodyLlenadosGratis.telefono_cliente = bodyVenta.telefono_cliente;
            bodyLlenadosGratis.id_venta = venta._id.toString();
            llenadoGratisActualizado = await crearLlenadoGratis(bodyLlenadosGratis);
        }
        /*************************************************************************************/

        //Guardamos la nueva venta en la BD de MongoDB
        venta.save()
            .then( item => { //Si todo salió bien
                
                const dataVenta = item.publicData(); //Datos de la venta creada            

                return res.status(201).json({ //Retornamos la respuesta al Cliente
                    error: null,
                    message: 'Venta guardada exitosamente!',
                    venta: dataVenta, //Datos de la venta creada
                    detallesVentas: resDetalleVentas,
                    inventarioCliente: inventarioClienteActualizado,
                    llenadoGratis: llenadoGratisActualizado
                });
            })
            .catch((e)=>{//si hubo un problema
                return res.status(400).json({ //Retornamos la respuesta al Cliente
                    error: true,
                    message: e.message,
                    type: e
                })
            })
    }
}

function actualizarVenta(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idVenta = req.params.id
    const bodyVenta = req.body.venta; //Cuerpo para guardar una venta
    const bodyDetallesVenta = req.body.detalleVenta; //Cuerpo para guardar detalle de la venta
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {
        
        //Buscamos la venta por su ID
        Venta.findById(idVenta)
            .then( venta => { 
                //si no existe la venta
                if(!venta){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe la venta',
                    }));
                };
            })
            .catch(next)

    //Si la venta si existe
    let nuevaInfo = {}; //Guardaremos los datos del body    

    //Vamos validando los campos que no vengan vacíos del body
    for (const key in bodyVenta) {
        if (typeof bodyVenta[key] !== 'undefined' && bodyVenta[key]){
            nuevaInfo[key] = bodyVenta[key]; //Lo guardamos en una nuevo objecto
        }
    }

    //Actualizamos los datos
    Venta.findByIdAndUpdate(idVenta, nuevaInfo, { new: true})
        .then( async ventaActualizada => {

            const arrayDetallesVentas = await Promise.all(
                bodyDetallesVenta.map( async detalleProducto => {

                    const idDelDetalle = detalleProducto.id;
                    delete detalleProducto.id;
                    
                    /**AQUI ACTUALIZAMOS LOS DETALLES DE LAS VENTAS */
                    const detallesVenta = await actualizarDetalleDeVentas(idDelDetalle, detalleProducto);

                    return detallesVenta;
                })
            );

            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Datos de la venta actualizados exitosamente',
                venta: ventaActualizada.publicData(), //Datos de la venta modificada
                detallesVentas: arrayDetallesVentas
            })
        })
        .catch(next)
    }
}

function eliminarVenta(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idVenta = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  

        //Buscamos la venta por su ID
        Venta.findById(idVenta)
            .then( venta => { 
                //si no existe la venta
                if(!venta){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe la venta',
                    }));
                };
            })
            .catch(next)

        //Si la venta si existe, se elimina
        Venta.findOneAndDelete({ _id: idVenta })
            .then(async (ventaEliminada) => {
                
                /**AQUI ELIMINAMOS LOS PRODUCTOS DE LA VENTA */
                const productosEliminados = await eliminarDetalleDeVentas(idVenta)

                return res.status(201).json({ //Retornamos la respuesta al Cliente
                        error: null,
                        message: 'Venta y sus datos eliminados exitosamente',
                        venta: ventaEliminada.publicData(), //Datos de la venta eliminada
                        detallesVentas: productosEliminados
                })
            })
            .catch(next);
    }
}

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
    obtenerVentas,
    obtenerVenta,
    crearVenta,
    actualizarVenta,
    eliminarVenta
};