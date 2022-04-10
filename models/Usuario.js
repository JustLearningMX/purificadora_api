/**
 * Modelo Usuario que define un esquema mongoose
 * y lo relaciona con una colección de MongoDB
 * y sus campos
 */

//Importamos mongoose
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator"); //Para validar email y teléfono.

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
    password: {
      type: String,
      required: [true, "No puede estar vacío"],
    },

    //Campos opcionales que se pueden Actualizar una vez dado de alta
    /* direccion: String,
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
    }, */
  },
  {
    timestamps: true, //Fecha de creación y/o modificación
    collection: "usuarios", //Se define la colección (tabla) para este esquema
  }
); 

// Usando plugin de validación para que no se repitan correos ni teléfonos
UsuarioSchema.plugin(uniqueValidator, { message: "Ya existe" }); 

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("Usuario", UsuarioSchema); 

//Función que devuelve datos públicos del esquema creado
UsuarioSchema.methods.publicData = ()=>{
    return {
        id: this.id,
        nombre: this.nombre,
        apellidos: this.apellidos,
        tipo: this.tipo,
        email: this.email,
        telefono: this.telefono,
        direccion: this.direccion,
        ciudad: this.ciudad,
        cp: this.cp,
        rfc: this.rfc,
        emailRecuperacion: this.emailRecuperacion,
        telefonoRecuperacion: this.telefonoRecuperacion,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        password: this.password
    };
};