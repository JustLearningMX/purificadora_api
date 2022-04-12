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
function signup(req, res, next) {

    //Obtenemos el cuerpo con los datos de la petición
    //para crear un usuario nuevo se requieren: nombre, 
    //apellidos, tipo, email, telefono, password
    const body = req.body;
        password = body.password; //Obtenemos el pass en texto plano del body
        delete body.password; //Lo eliminamos para evitar problemas de seguridad

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
        .catch(next) //si hubo un problema
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
            return res.json({
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

module.exports = {
    login,
    signup,
    obtenerUsuario
};