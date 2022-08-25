/** Modelo DetalleVenta que define un esquema mongoose y lo
 ** relaciona con una colección de MongoDB y sus campos
 **/

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose

// Esquema para del Detalle de la Venta: Se incluyen los campos y sus validaciones
const DetalleVentaSchema = new mongoose.Schema(
    {
      //Campos requeridos
      id_venta: {type: mongoose.Schema.Types.ObjectId, ref: 'Venta', required: [true, "No puede estar vacío"], index: true },
      id_producto: {type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: [true, "No puede estar vacío"], index: true },
      cantidad: { type: Number, required: [true, "No puede estar vacío"] },
      precio: { type: mongoose.Types.Decimal128, required: [true, "No puede estar vacío"] },
    },
    {
      timestamps: true, //Fecha de creación y/o modificación
      collection: "detalleVentas", //Se define la colección (tabla) para este esquema
    }
  );

  //Función que devuelve datos públicos del esquema creado
DetalleVentaSchema.methods.publicData = function(){
    return ({
        id: this.id,
        id_venta: this.id_venta,
        id_producto: this.id_producto,
        cantidad: this.cantidad ,
        precio: this.precio,
        fecha: this.createdAt,
    });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("DetalleVenta", DetalleVentaSchema);