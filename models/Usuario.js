/**
 * Modelo Usuario que define un esquema mongoose
 * y lo relaciona con una colección de MongoDB
 * y sus campos
 */

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose
const uniqueValidator = require("mongoose-unique-validator"); //Para validar email y teléfono.
const crypto = require('crypto'); //Para generar y validar hashes
const jwt = require('jsonwebtoken'); //Módulo para generar un JWT

//Palabra secreta para firmar el JWT
// const config = require('../config');
const secret = process.env.SECRET; 

// Esquema para el Usuario: Se incluyen los campos y sus validaciones
const UsuarioSchema = new mongoose.Schema(
  {
    //Campos requeridos para SignUp
    nombre: { type: String, required: [true, "No puede estar vacío"] },
    apellidos: { type: String, required: [true, "No puede estar vacío"] },
    tipo: {
      type: String,
      enum: ["admin", "empleado", "cliente"],
      required: [true, "No puede estar vacío"],
    },
    email: {
      type: String,
      required: [true, "No puede estar vacío"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "es inválido"],
      index: true,
    },
    telefono: {
      type: String,
      required: [true, "No puede estar vacío"],
      unique: true,
      match: [/^[0-9]+$/, "Es inválido"],
    },
    hash: String,
    salt: String,

    //Campos que el usuario puede Actualizar una vez dado de alta
    direccion: String,
    ciudad: String,
    cp: { 
        type: String,
        match: [/^[0-9]+$/, "Es inválido"],
    },
    rfc: String,
    emailRecuperacion: {
        type: String,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "es inválido"],
    },
    telefonoRecuperacion: {
        type: String,
        match: [/^[0-9]+$/, "Es inválido"],
    },
  },
  {
    timestamps: true, //Fecha de creación y/o modificación
    collection: "usuarios", //Se define la colección (tabla) para este esquema
  }
);

// Usando plugin de validación para que no se repitan correos ni teléfonos
UsuarioSchema.plugin(uniqueValidator, { message: "Ya existe" });

//Método del Esquema Usuario que genera un password 
//cifrado mediante una función hash
UsuarioSchema.methods.crearPassword = function (password) { //Recibe el pass en txt plano del usuario
  this.salt = crypto.randomBytes(16).toString("hex"); //Genera una 'sal' random por usuario
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512") //Encriptado con el algoritmo pbkdf
    .toString("hex"); //Lo pasa a string
};

//Método del Esquema Usuario que valida un password 
//cifrado mediante una función hash
UsuarioSchema.methods.validarPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512") //Encriptado
    .toString("hex"); //Lo pasa a string

    return this.hash === hash; //Valida ambos hashes y retorna boleano
};

//Método para generar un JWT de 30 días
UsuarioSchema.methods.generarJWT = function () {

  //30 días de validez del token antes de expirar
  const hoy = new Date();
  const expedido = new Date(hoy);
  expedido.setDate(hoy.getDate() + 30);

  // Regresamos el token firmado
  return jwt.sign( //Payload del JWT
    {
      id: this._id, //Id del usuario en la BD
      telefono: this.telefono, //Su teléfono
      email: this.email,
      admin: this.tipo === 'admin' ? true : false,
      exp: parseInt(expedido.getTime() / 1000), //Periodo validez
    }, secret ); //Palabra secreta para validar el token

};

//Método que regresa al cliente una representación en JSON del usuario ya autenticado
UsuarioSchema.methods.toAuthJSON = function () {
  return { //retornamos campos y token
    id: this._id, 
    telefono: this.telefono,
    email: this.email,
    admin: this.tipo === 'admin' ? true : false,
    token: this.generarJWT(),
  };
};

//Función que devuelve datos públicos del esquema creado
UsuarioSchema.methods.publicData = function(){
    return ({
        id: this.id,
        nombre: this.nombre,
        apellidos: this.apellidos,
        tipo: this.tipo,
        email: this.email,
        telefono: this.telefono,  
        createdAt: this.createdAt ,
        updatedAt: this.updatedAt,        

        direccion: this.direccion ? this.direccion : null,
        ciudad: this.ciudad ? this.ciudad : null,
        cp: this.cp ? this.cp : null,
        rfc: this.rfc ? this.rfc : null,
        emailRecuperacion: this.emailRecuperacion ? this.emailRecuperacion : null,
        telefonoRecuperacion: this.telefonoRecuperacion ? this.telefonoRecuperacion : null,
    });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("Usuario", UsuarioSchema); 