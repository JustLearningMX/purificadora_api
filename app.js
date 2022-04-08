/**
 * Punto de entrada del Servidor, aquí inicia todo.
 * Básicamente aquí se arranca la aplicación y se pone
 * al servidor en escucha de peticiones del cliente.
 */

//Se importan las dependecias
const express = require('express'); //Para levantar un servidor
const bodyParser = require('body-parser'); //Parsea cuerpo de peticiones
const cors = require('cors'); //Seguridad en peticiones HTTP
const debug = require('debug')('app:main'); //Debug de la aplicación
require('dotenv').config(); //Configura variables de entorno

//Creamos la aplicación
const app = express();

//Middlewares necesarios
app.use(bodyParser.urlencoded({ extended: false})); //Parsea el body
app.use(bodyParser.json()); //Datos a JSONs
app.use(cors()); //Seguridad en peticiones

//Middleware para gestionar los endpoints
// purificadora_api/v1 --> Raíz de la API
app.get('/v1', (req, res)=>{
    res.json({
        error: null,
        message: 'Bienvenido a la API de Purificadora Río Jordán'
    });
});

//Ponemos la aplicación a la escucha
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    debug(`Servidor escuchando en el Puerto ${PORT}`);
});