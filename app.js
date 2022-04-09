/**
 * Punto de entrada del Servidor, aquí inicia todo.
 * Básicamente aquí se arranca la aplicación y se pone
 * al servidor en escucha de peticiones del cliente.
 */

//Se importan las dependencias
const express = require('express'); //Para levantar un servidor
const bodyParser = require('body-parser'); //Parsea cuerpo de peticiones
const cors = require('cors'); //Seguridad en peticiones HTTP
const debug = require('debug')('app:main'); //Debug de la aplicación
require('dotenv').config(); //Configura variables de entorno
const mongoose = require('mongoose'); //ODM para MongoDB

//Importamos los Modelos
require('./models/Usuario');

//Creamos la aplicación
const app = express();

//Middlewares necesarios
app.use(bodyParser.urlencoded({ extended: false})); //Parsea el body
app.use(bodyParser.json()); //Datos a JSONs
app.use(cors()); //Seguridad en peticiones

//Obtenemos los datos para la conexión con la BD (de .env)
const dbUser = process.env.DB_USER; //Usuario de la BD
const dbPass = process.env.DB_PASS; //Su password
const dbName = process.env.DB_NAME; //Nombre de la BD

//Creamos la conexión a la BD con MongoDB usando Mongoose
// Candena de conexión obtenida desde MongoDB Atlas
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.kvrrq.mongodb.net/${dbName}?retryWrites=true&w=majority`)
    .then(()=>{ //Si todo salió bien
        debug(`Conexión a la BD ${dbName} exitosa`);
    })
    .catch((error) => {//Si algo salió mal
        debug(`Error en la conexión a la BD ${dbName}`, error);
    });

//Debuguear mongoose
mongoose.set('debug', true);

//Middleware para gestionar los endpoints mediante un ruteador
// purificadora_api/v1 --> Raíz de la API
app.use('/v1', require('./routes/index'));

//Ponemos la aplicación a la escucha
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    debug(`Servidor escuchando en el Puerto ${PORT}`);
});