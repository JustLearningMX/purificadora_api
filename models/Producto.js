/** Modelo Producto que define un esquema mongoose y lo
 ** relaciona con una colección de MongoDB y sus campos
 **/

//Módulos requeridos
const mongoose = require("mongoose");//Importamos mongoose

// Esquema para el Producto: Se incluyen los campos y sus validaciones
const ProductoSchema = new mongoose.Schema(
    {
      //Campos requeridos
      nombre: { type: String, required: [true, "No puede estar vacío"] },
      medida: { type: String, required: [true, "No puede estar vacío"] },
      cantidad: { type: Number, required: [true, "No puede estar vacío"] },
      precio: { type: mongoose.Types.Decimal128, required: [true, "No puede estar vacío"] },
    },
    {
      timestamps: true, //Fecha de creación y/o modificación
      collection: "productos", //Se define la colección (tabla) para este esquema
    }
  );

  //Función que devuelve datos públicos del esquema creado
ProductoSchema.methods.publicData = function(){
    return ({
        id: this.id,
        nombre: this.nombre,
        medida: this.medida,
        cantidad: this.cantidad,
        precio: this.precio,
        createdAt: this.createdAt ,
        updatedAt: this.updatedAt, 
    });
};

//Se define la correspondencia entre el Modelo y el esquema creado.
mongoose.model("Producto", ProductoSchema);