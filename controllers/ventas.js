/**Controlador con las funciones que se implementan
 * en el endpoint /ventas para Crear, Leer, Actualizar 
 * y Eliminar Ventas mediante las funciones que
 * nos proporciona mongoose*/

 const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
 const Venta = mongoose.model('Venta'); //Modelo a utilizar

function obtenerVentas(req, res, next){

    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los productos
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {      
        
        Venta.find()
            .then(todos => {    
                let arrayVentas = [];
                todos.map( (venta)=>{
                    arrayVentas.push(venta.publicData());
                });

                return (res.status(201).json({
                    error: null,
                    message: 'Lista de ventas generada exitosamente',
                    productos: arrayVentas
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
            .then( venta => {
                return (res.status(201).json({
                    error: null,
                    message: 'Venta existente.',
                    venta: venta
                }));
            })
            .catch(next)
        }
    }
}

function crearVenta(req, res, next){
    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        
        const body = req.body;
        //Creamos una nueva venta basado en el modelo y su esquema
        const venta = new Venta(body);

        //Guardamos la nueva venta en la BD de MongoDB
        venta.save()        
        .then( item => { //Si todo salió bien
            const dataVenta = item.publicData(); //Datos de la venta creada

            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Venta guardada exitosamente',
                venta: dataVenta //Datos de la venta creada
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
    for (const key in req.body) {
        if (typeof req.body[key] !== 'undefined' && req.body[key]){
            nuevaInfo[key] = req.body[key]; //Lo guardamos en una nuevo objecto
        }
    }

    //Actualizamos los datos
    Venta.findByIdAndUpdate(idVenta, nuevaInfo, { new: true})
        .then((ventaActualizada)=>{            
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Datos de la venta actualizados exitosamente',
                producto: ventaActualizada.publicData() //Datos de la venta modificada
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

        //Si la venta si existe
        Venta.findOneAndDelete({ _id: idVenta })
        .then((ventaEliminada) => {
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                    error: null,
                    message: 'Venta y sus datos eliminados exitosamente',
                    venta: ventaEliminada.publicData() //Datos de la venta eliminada   
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