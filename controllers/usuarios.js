/**
 * Controlador con las funciones que se implementan
 * en el endpoint /usuarios para Crear, Leer, Actualizar 
 * y Eliminar Usuarios mediante las funciones que
 * nos proporciona mongoose
 */

const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const passport = require('passport'); //Módulo para autenticación
const Usuario = mongoose.model('Usuario'); //Modelo a utilizar

//Crear nuevo usuario
function signup(req, res) {

    //Obtenemos el cuerpo con los datos de la petición
    //para crear un usuario nuevo se requieren: nombre, 
    //apellidos, tipo, email, telefono, password
    const body = req.body;        
        password = body.password; //Obtenemos el pass en texto plano del body
        delete body.password; //Lo eliminamos para evitar problemas de seguridad

    if(!req.usuario){        
        body.tipo = 'cliente'
    } else if(!req.usuario.admin) {
        return (
            res.status(401).json({
                error: true,
                message: 'No tiene autorización para crear usuarios'
            })
        );
    }

    //Creamos un nuevo usuario basado en el modelo y su esquema
    const usuario = new Usuario(body);

    //Al usuario instanciado llamamos el método q encripta el password
    usuario.crearPassword(password); //Pasamos por parámetro el password en txt plano

    //Guardamos el nuevo usuario en la BD de MongoDB
    usuario.save()        
        .then( user => { //Si todo salió bien
            const dataUser = user.publicData(); //Datos del usuario creado

            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Usuario guardado exitosamente',
                usuario: dataUser //Datos del usuario creado
            });
        })
        .catch((e)=>{//si hubo un problema
            return res.status(400).json({ //Retornamos la respuesta al Cliente
                error: true,
                message: e.message,
                type: e
            })
        }) 
};

//Iniciar sesión en la aplicación
function login(req, res, next) {
    const { telefono, password } = req.body;

    //Si no existe un teléfono o el password
    if(!telefono || !password){
        return (
            res.status(422).json({
                error: true,
                message: 'Teléfono o Password no pueden estar vacíos'
            })
        );
    };
        
    //Si existen teléfono y password, autenticamos con passportjs
    passport.authenticate('local', 
    { session: false}, 
    function(err, user, info){
        //Si hubo error
        if(err){
            return next(err); //Retornamos el error
        };

        //Si no hubo error
        if(user){ // Existe el usuario
            user.token = user.generarJWT(); //Generamos su token
            return res.status(200).json({
                error: null,
                message: 'Login exitoso',
                user: user.toAuthJSON(),
            });
        } else { //Si no existe el usuario
            return res.status(422).json({
                error: true,
                message: 'Error al iniciar sesión',
                info: info,
            });
        };
    })(req, res, next);    
};

//Busca al usuario logueado por su id
function obtenerUsuario(req, res, next) {
    const idUser = req.usuario.id; // Id guardado en usuario -> id

    Usuario.findById(idUser) 
        .then((user)=>{
            //si no existe el usuario o hay un error
            if(!user){
                return (res.status(401).json({
                    error: true,
                    message: 'No existe el usuario',
                }));
            };

            const dataUser = user.publicData(); //Datos del usuario encontrado            

            //Existe el usuario y no hubo error
            return (res.status(201).json({
                error: false,
                message: 'Usuario encontrado',
                user: dataUser,
            }));
    })
    .catch(next);
};

//Busca al usuario logueado por su id
function obtenerUsuarios(req, res, next) {
    const usuario = req.usuario; // Id guardado en usuario -> id

    if(!usuario) {
        return (res.status(401).json({
            error: true,
            message: 'Es necesario autenticarse como Administrador o Empleado para acceder a este recurso',
        }));
    }

    if(usuario) {
        return (res.status(200).json({
            error: false,
            message: 'Usuario con token',
            usuario: usuario
        }));
    }
};

//Actualizar datos de un Usuario
function modificarUsuario(req, res, next) {
    const idUser = req.usuario.id; // Id guardado en usuario -> id

    //Buscamos al usuario por su ID
    Usuario.findById(idUser)
        .then( user => { 
            //si no existe el usuario
            if(!user){
                return (res.status(401).json({
                    error: true,
                    message: 'No existe el usuario',
                }));
            };
        })
        .catch(next)

    //Si el usuario si existe
    let nuevaInfo = {}; //Guardaremos los datos del body    
    
    //Vamos validando los campos que no vengan vacíos del body
    for (const key in req.body) {
        if (typeof req.body[key] !== 'undefined' && req.body[key]){
            nuevaInfo[key] = req.body[key]; //Lo guardamos en una nuevo objecto
        }
    }
    
    //Actualizamos los datos
    Usuario.findByIdAndUpdate(idUser, nuevaInfo, { new: true})
        .then((usuarioActualizado)=>{            
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Datos del usuario actualizados exitosamente',
                usuario: usuarioActualizado.publicData() //Datos del usuario modificado
            })
        })
        .catch(next)
}

//Elimina un usuario
function eliminarUsuario(req, res, next) {
    const idUser = req.usuario.id; // Id guardado en usuario -> id

    //Buscamos al usuario por su ID
    Usuario.findById(idUser)
        .then( user => { 
            //si no existe el usuario
            if(!user){
                return (res.status(401).json({
                    error: true,
                    message: 'No existe el usuario',
                }));
            };
        })
        .catch(next)

    //Si el usuario si existe
    Usuario.findOneAndDelete({ _id: idUser })
    .then((usuarioElimninado) => {
        // res.status(200).send(`Usuario ${req.params.id} eliminado: ${r}`);
        return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Usuario y sus datos eliminados exitosamente',
                usuario: usuarioElimninado.publicData() //Datos del usuario eñliminado    
        })
    })
    .catch(next);
}

//Permite a un usuario cambiar su password
function cambiarPassword(req, res, next) {

    const idUser = req.usuario.id; // Id guardado en usuario -> id    

    //Si el usuario si existe
    let { viejoPassword, nuevoPassword } = req.body; //Guardaremos el nuevo password del body

    //si viene vacío
    if(!viejoPassword || !nuevoPassword){
        return (res.status(401).json({
            error: true,
            message: 'Los passwords no pueden venir vacíos',
        }));
    };

    //Buscamos al usuario por su ID
    Usuario.findById(idUser)
        .then( user => { 
            //si no existe el usuario
            if(!user){
                return (res.status(401).json({
                    error: true,
                    message: 'No existe el usuario',
                }));
            };

            //Validamos primero el password actual
            const isValid = user.validarPassword(viejoPassword);
            if(!isValid){
                return (res.status(401).json({
                    error: true,
                    message: 'El Password actual es incorrecto',
                }));
            }

            //Si existe el usuario y su password actual está correcto
            user.crearPassword(nuevoPassword);

            //Actualizamos los datos
            Usuario.findByIdAndUpdate(idUser, user, { new: true})
                .then((usuarioActualizado)=>{            
                    return res.status(201).json({
                        error: null,
                        message: 'Contraseña actualizada correctamente.',
                        usuario: usuarioActualizado.publicData() //Datos del usuario modificado
                    })
                })
                .catch(next)            
            
        })
        .catch(next) 
}

module.exports = {
    login,
    signup,
    obtenerUsuario,
    obtenerUsuarios,
    modificarUsuario,
    eliminarUsuario,
    cambiarPassword
};