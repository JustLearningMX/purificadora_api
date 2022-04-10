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

    //Creamos un nuevo usuario basado en el modelo y su esquema
    const usuario = new Usuario(body);

    //Guardamos el nuevo usuario en la BD de MongoDB
    usuario.save()
        .then( user => { //Si todo salió bien
            return res.status(201).json({ //Retornamos la respuesta al Cliente
                error: null,
                message: 'Usuario guardado exitosamente',
                usuario: user.publicData()
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