/**Controlador con las funciones que se implementan en el endpoint /ventas,
 * una vez creada la venta, sus detalles de productos y el inventario actual, entonces
 * se actualiza la tabla de llenados gratis en caso de aplicar*/

 const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
 const LlenadoGratis = mongoose.model('LlenadoGratis'); //Modelo a utilizar
 
 /**Funcion que Crea un registro en la Bd con la cantidad  
  *de botellones de 19lts gratis, cuando aplica el caso */
 async function crearLlenadoGratis(body){
 
    //Creamos una instancia del modelo con los datos
    const llenadoGratis = new LlenadoGratis(body);

    try { //Guardamos los datos
        const item = await llenadoGratis.save();
        const dataLlenadoGratis = item.publicData();

        //Retornamos la respuesta
        return { 
            error: null,
            message: 'Llenado gratis del cliente creado y guardado exitosamente en la BD',
            datos: dataLlenadoGratis,
        };
    } catch (e) {
        return {
            error: true,
            message: 'No se puedo guardar el llenado gratis del cliente',
            venta: body,
            totalError: e,
        };
    }
 }
 
 module.exports = {
     crearLlenadoGratis
 }