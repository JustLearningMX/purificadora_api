/** Modelo Venta que define un esquema mongoose y lo
 ** relaciona con una colección de MongoDB y sus campos
 **/

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose

// Esquema para la Venta: Se incluyen los campos y sus validaciones
const VentaSchema = new mongoose.Schema(
  {
    //Campos requeridos
    telefono_cliente: {
      type: String,
      required: [true, "No puede estar vacío"],
      match: [/^[0-9]+$/, "Es inválido"],
      index: true,
    },
    id_sucursal: {type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: [true, "No puede estar vacío"] },
    id_empleado: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: [true, "No puede estar vacío"] },
    // fecha : { type: Date, required: [true, "No puede estar vacío"] },
    // id_cliente: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: [true, "No puede estar vacío"], index: true },
  },
  {
    timestamps: true, //Fecha de creación y/o modificación
    collection: "ventas", //Se define la colección (tabla) para este esquema
  }
);

  //Función que devuelve datos públicos del esquema creado
VentaSchema.methods.publicData = function(){
  return ({
    id: this.id,
    fecha: this.createdAt,
    telefono_cliente: this.id_cliente,
    id_empleado: this.id_empleado,
    id_sucursal: this.id_sucursal,
  });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("Venta", VentaSchema);