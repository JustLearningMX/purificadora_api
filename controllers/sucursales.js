/**Controlador con las funciones que se implementan
 * en el endpoint /sucursales para Crear, Leer, Actualizar 
 * y Eliminar Sucursales mediante las funciones que
 * nos proporciona mongoose*/

 const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
 const Sucursal = mongoose.model('Sucursal'); //Modelo a utilizar

function obtenerSucursales(req, res, next){

    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de las sucursales
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {      
        
        Sucursal.find()
            .then(todos => {    
                let arraySucursales = [];
                todos.map( (sucursal)=>{
                    arraySucursales.push(sucursal.publicData());
                });

                return (res.status(201).json({
                    error: null,
                    message: 'Lista de sucursales generada exitosamente',
                    sucursales: arraySucursales
                }));
            })
            .catch(next)
    }
}

function obtenerSucursal(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idSucursal = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los sucursales
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        if(idSucursal) {
            Sucursal.findById(idSucursal)
            .then( sucursal => {
                return (res.status(201).json({
                    error: null,
                    message: 'Sucursal existente.',
                    sucursal: sucursal
                }));
            })
            .catch(next)
        }
    }
}

function crearSucursal(req, res, next){
    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        
        const body = req.body;
        //Creamos un nuevo sucursal basado en el modelo y su esquema
        const sucursal = new Sucursal(body);

        //Guardamos el nuevo sucursal en la BD de MongoDB
        sucursal.save()        
        .then( item => { //Si todo salió bien
            const dataSucursal = item.publicData(); //Datos del sucursal creado

            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Sucursal guardada exitosamente',
                sucursal: dataSucursal //Datos del sucursal creado
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

function actualizarSucursal(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idSucursal = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los sucursales
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {
        
        //Buscamos al sucursal por su ID
        Sucursal.findById(idSucursal)
            .then( sucursal => { 
                //si no existe el sucursal
                if(!sucursal){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe la sucursal',
                    }));
                };
            })
            .catch(next)

    //Si el sucursal si existe
    let nuevaInfo = {}; //Guardaremos los datos del body    

    //Vamos validando los campos que no vengan vacíos del body
    for (const key in req.body) {
        if (typeof req.body[key] !== 'undefined' && req.body[key]){
            nuevaInfo[key] = req.body[key]; //Lo guardamos en una nuevo objecto
        }
    }

    //Actualizamos los datos
    Sucursal.findByIdAndUpdate(idSucursal, nuevaInfo, { new: true})
        .then((sucursalActualizado)=>{            
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Datos de la sucursal actualizados exitosamente',
                sucursal: sucursalActualizado.publicData() //Datos de la sucursal modificada
            })
        })
        .catch(next)
    }
}

function eliminarSucursal(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idSucursal = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  

        //Buscamos al sucursal por su ID
        Sucursal.findById(idSucursal)
            .then( sucursal => { 
                //si no existe el sucursal
                if(!sucursal){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe la sucursal',
                    }));
                };
            })
            .catch(next)

        //Si el sucursal si existe
        Sucursal.findOneAndDelete({ _id: idSucursal })
        .then((sucursalEliminado) => {
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                    error: null,
                    message: 'Sucursal y sus datos eliminados exitosamente',
                    usuario: sucursalEliminado.publicData() //Datos del usuario eñliminado    
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
    obtenerSucursales,
    obtenerSucursal,
    crearSucursal,
    actualizarSucursal,
    eliminarSucursal
};