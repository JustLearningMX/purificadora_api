/**
 * Configurando sesiones con Passport.js
 * Passport es un paquete de autenticación 
 * para simplificar el manejo de sesiones
 */

const passport = require('passport'); //Importamos módulo de passport
const LocalStrategy = require('passport-local').Strategy; //Estrategia local para autenticado
const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const Usuario = mongoose.model('Usuario'); //Modelo a utilizar

//Utilizando el middleware Passport
passport.use(
    new LocalStrategy({ //Definimos elementos utilizados para habilitar sesión
        usernameField: 'telefono',
        passwordField: 'password'
    }, function(telefono, password, done){ //Función callback para buscar el usuario

        Usuario.findOne({telefono: telefono}) //Buscamos al usuario por su teléfono
            .then(function(user){ //Si la promesa fue OK con la consulta a la BD

                //Si no existe el usuario o el password es incorrecto
                if (!user || !user.validarPassword(password)) {
                    return done(null, false, {error: {'Teléfono o contraseña': 'incorrecto'}});
                }

                //Si existe el usuario y password correcto
                return done(null, user) //Devolvemos la info del usuario
            })
            .catch(done); //Si algo fue mal
    })
);

/**
 * LocalStrategy inspecciona los campos telefono y password de las peticiones que vienen 
 * del frontend, esperando que la petición tenga el siguiente formato:
 * 
 *  {
 *   "telefono": "8331234567",
 *   "password": "mipassword123"
 *  }
 */