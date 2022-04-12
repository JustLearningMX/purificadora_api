/**
 * Controlador con las funciones que se implementan
 * en el endpoint /usuarios para Crear, Leer, Actualizar 
 * y Eliminar Usuarios mediante las funciones que
 * nos proporciona mongoose
 */

const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');

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

function login(req, res) {
    res.json({
        error: null,
        message: 'Login'
    });
};

module.exports = {
    login,
    signup
};