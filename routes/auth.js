/**
 * Implementa dos middlewares para configurar autorizaciones
 * sobre los distintos endpoints de la API y decodificar
 * el código del JWT
 */

const jwt = require('express-jwt'); //Módulo para autorizaciones en rutas y datos

//Palabra secreta para firmar el JWT
const config = require('../config');
const secret = process.env.SECRET; 
// const secret = process.env.SECRET; //Palabra secreta para firmar el JWT


// Obtenemos el jwt del header de la petición y verificamos su existencia.
function obtenerTokenDelHeader(req) {

    const autorizacion = req.headers.authorization; //Si el encabezado cuenta con el apartado auth
    const token = autorizacion.split(' ')[0]; //Si viene como "Token"
    const bearer = autorizacion.split(' ')[0]; //Si viene como "Bearer"

    //Si existe el token
    if(autorizacion && token === 'Token' || autorizacion && bearer === 'Bearer' ){
        return autorizacion.split(' ')[1]; //Retorna el token
    }

    //Si no existe
    return null; //Se retorna valor nulo
}

//Creando dos middlewares para las autorizaciones en los endpoints
const auth = {
    //Si una ruta es requerida con autorización
    requerido: jwt({
        secret: secret,
        algorithms: ['HS256'],
        userProperty: 'usuario', //JWT descifrado y se puede utilizar después en el objeto request por medio de req.usuario
        obtenerToken: obtenerTokenDelHeader
    }),

    //Si una ruta es opcional
    opcional: jwt({
        secret: secret,
        algorithms: ['HS256'],
        userProperty: 'usuario', //JWT descifrado y se puede utilizar después en el objeto request por medio de req.usuario
        credentialsRequired: false, //Aquí se indica que las credenciales no son obligatorias
        obtenerToken: obtenerTokenDelHeader
    }),    
};

//Exportamos el módulo
module.exports = auth;