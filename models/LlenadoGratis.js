/** Modelo LlenadoGratis que define un esquema mongoose y lo
 ** relaciona con una colección de MongoDB y sus campos **/

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose

// Esquema para el control de los llenados gratis por 
// usuario: Se incluyen los campos y sus validaciones
const LlenadoGratisSchema = new mongoose.Schema(
    {
      //Campos requeridos
      telefono_cliente: {
        type: String,
        required: [true, "No puede estar vacío"],
        match: [/^[0-9]+$/, "Es inválido"],
        index: true,
      },
      id_venta: {type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: [true, "No puede estar vacío"], index: true },
      cantidad: { type: Number, required: [true, "No puede estar vacío"] },
    },
    {
      timestamps: true, //Fecha de creación y/o modificación
      collection: "llenadoGratis", //Se define la colección (tabla) para este esquema
    }
  );

  //Función que devuelve datos públicos del esquema creado
LlenadoGratisSchema.methods.publicData = function(){
    return ({
        id: this.id,
        telefono_cliente: this.telefono_cliente,
        id_venta: this.id_venta,
        cantidad: this.cantidad,
    });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("LlenadoGratis", LlenadoGratisSchema);