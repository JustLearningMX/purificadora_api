/**Controlador con las funciones que se implementan
 * en el endpoint /productos para Crear, Leer, Actualizar 
 * y Eliminar Productos mediante las funciones que
 * nos proporciona mongoose*/

 const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
 const Producto = mongoose.model('Producto'); //Modelo a utilizar

function obtenerProductos(req, res, next){

    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los productos
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {      
        
        Producto.find()
            .then(todos => {    
                let arrayProductos = [];
                todos.map( (producto)=>{
                    arrayProductos.push(producto.publicData());
                });

                return (res.status(201).json({
                    error: null,
                    message: 'Lista de productos generada exitosamente',
                    productos: arrayProductos
                }));
            })
            .catch(next)
    }
}

function obtenerProducto(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idProducto = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los productos
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        if(idProducto) {
            Producto.findById(idProducto)
            .then( producto => {
                return (res.status(201).json({
                    error: null,
                    message: 'Producto existente.',
                    producto: producto
                }));
            })
            .catch(next)
        }
    }
}

function crearProducto(req, res, next){
    const usuario = verificarUsuario(req, res);

    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  
        
        const body = req.body;
        //Creamos un nuevo producto basado en el modelo y su esquema
        const producto = new Producto(body);

        //Guardamos el nuevo producto en la BD de MongoDB
        producto.save()        
        .then( product => { //Si todo salió bien
            const dataProduct = product.publicData(); //Datos del producto creado

            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Producto guardado exitosamente',
                producto: dataProduct //Datos del producto creado
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

function actualizarProducto(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idProducto = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    //Se le envía toda la lista de los productos
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {
        
        //Buscamos al producto por su ID
        Producto.findById(idProducto)
            .then( producto => { 
                //si no existe el producto
                if(!producto){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe el producto',
                    }));
                };
            })
            .catch(next)

    //Si el producto si existe
    let nuevaInfo = {}; //Guardaremos los datos del body    

    //Vamos validando los campos que no vengan vacíos del body
    for (const key in req.body) {
        if (typeof req.body[key] !== 'undefined' && req.body[key]){
            nuevaInfo[key] = req.body[key]; //Lo guardamos en una nuevo objecto
        }
    }

    //Actualizamos los datos
    Producto.findByIdAndUpdate(idProducto, nuevaInfo, { new: true})
        .then((productoActualizado)=>{            
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Datos del producto actualizados exitosamente',
                producto: productoActualizado.publicData() //Datos del usuario modificado
            })
        })
        .catch(next)
    }
}

function eliminarProducto(req, res, next){
    const usuario = verificarUsuario(req, res);
    const idProducto = req.params.id
    
    //Si existe un usuario, y es Admin o Empleado (No Clientes)
    if(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) {  

        //Buscamos al producto por su ID
        Producto.findById(idProducto)
            .then( producto => { 
                //si no existe el producto
                if(!producto){
                    return (res.status(401).json({
                        error: true,
                        message: 'No existe el producto',
                    }));
                };
            })
            .catch(next)

        //Si el producto si existe
        Producto.findOneAndDelete({ _id: idProducto })
        .then((productoElimninado) => {
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                    error: null,
                    message: 'Producto y sus datos eliminados exitosamente',
                    usuario: productoElimninado.publicData() //Datos del usuario eñliminado    
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
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};