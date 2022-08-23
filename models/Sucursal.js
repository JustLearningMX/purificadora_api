/** Modelo Sucursal que define un esquema mongoose y lo
 ** relaciona con una colección de MongoDB y sus campos
 **/

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose

// Esquema para la Sucursal: Se incluyen los campos y sus validaciones
const SucursalSchema = new mongoose.Schema(
    {
      //Campos requeridos
      nombre: { type: String, required: [true, "No puede estar vacío"] },
      telefono: String,
      direccion: String,
      ciudad: String,
      estado: String,
      cp: { 
          type: String,
          match: [/^[0-9]+$/, "Es inválido"],
      },
    },
    {
      timestamps: true, //Fecha de creación y/o modificación
      collection: "sucursales", //Se define la colección (tabla) para este esquema
    }
  );

  //Función que devuelve datos públicos del esquema creado
SucursalSchema.methods.publicData = function(){
    return ({
        id: this.id,
        nombre: this.nombre,
        telefono: this.telefono ? this.telefono : null,
        direccion: this.direccion ? this.direccion : null,
        ciudad: this.ciudad ? this.ciudad : null,
        estado: this.estado ? this.estado : null,
        cp: this.cp ? this.cp : null, 
    });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("Sucursal", SucursalSchema);