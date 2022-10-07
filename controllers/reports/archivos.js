const mongoose = require('mongoose'); //Mongoose para usar esquemas de modelos
const Venta = mongoose.model('Venta'); //Modelo de la venta
const { fechaCorta, hora, removeTime } = require('../../utils/formateadorDeFechas');
const { VentasDetallesYProductosTodos } = require('../../utils/mongoDBAgreggations.js');
const { ordenarObjsPorKey } = require('../../utils/ordenarArrays');

async function crearVentasEnExcel(req, res) {
    const { pestana, tipoReporte, fechaIni, fechaFin, nombreBuscar, idBuscar } = req.query;//Datos del request
    const fechaInicial = (typeof fechaIni === 'string') && fechaIni === 'null' ? null : new Date(fechaIni);
    const fechaFinal = (typeof fechaFin === 'string') && fechaFin === 'null' ? null : new Date(fechaFin);
    const nomCliente = (typeof nombreBuscar === 'string') && nombreBuscar === 'null' ? null : nombreBuscar;
    const idCliente = (typeof idBuscar === 'string') && idBuscar === 'null' ? null : idBuscar;

    const filtrarLasVentas = {
        filtrarPorClientes: (ventasOrdenadasPorFecha, idCliente) => filtrarPorClientes(ventasOrdenadasPorFecha, idCliente),
        filtrarPorProductos: (ventasOrdenadasPorFecha, idCliente) => filtrarPorProductos(ventasOrdenadasPorFecha, idCliente),
    };

    //Traemos todas las ventas de la BD
    const todasLasVentas = await ObtenerTodasLasVentas();
    const ventasOrdenadasPorFecha = OrdenarVentasPorFecha(todasLasVentas, fechaInicial, fechaFinal);
    
    //Filtrado segun la seccion de Reportes
    const data = (pestana === 'Ventas') ? [...ventasOrdenadasPorFecha] :
                 (pestana === 'Clientes') ? filtrarLasVentas.filtrarPorClientes(ventasOrdenadasPorFecha, idCliente) :
                 (pestana === 'Productos') ? filtrarLasVentas.filtrarPorProductos(ventasOrdenadasPorFecha, idCliente) : null;
    
    //Si hay informacion para mostrar
    if(data.length < 0){
        console.log('Sin informacion para mostrar');
    } else { //Se filtran las ventas por el periodo de fechas
        const periodo = (fechaInicial && fechaFinal) ? `Periodo del ${fechaCorta(fechaInicial)} al ${fechaCorta(fechaFinal)}` : `Todo el ciclo`;
        const cliente = nomCliente && idCliente ? `${nomCliente}` : '';
        const tituloEncabezado = `Reporte de ${pestana}. ${periodo}. ${cliente}`;
       
        //Despues se forman filas de ventas-productos
        const dataOrdenada = (pestana === 'Ventas') ? ordenarLasVentasConProductos(data) : 
                             (pestana === 'Clientes') ? data : 
                             (pestana === 'Productos') ? data : null;

        //Finalmente se genera el excel
        crearArchivoDeExcel(dataOrdenada, pestana, res, tituloEncabezado);
    }
}

//Traemos todas las ventas de la BD
async function ObtenerTodasLasVentas() {
    const todasLasVentas = await Venta.aggregate(VentasDetallesYProductosTodos());
    return todasLasVentas;
}

//Ordenamos las ventas segun el periodo
function OrdenarVentasPorFecha(todasLasVentas, fechaInicial, fechaFinal) {
    if(todasLasVentas.length > 0) {  

        //Para verificar si existe un periodo valido
        const fechaIniEpoch = fechaInicial ? fechaInicial.getTime() : 0;
        const fechaFinEpoch = fechaFinal ? fechaFinal.getTime() : 0;
    
        // Si existe un periodo valido
        if ( (fechaInicial && fechaFinal) && (fechaIniEpoch < fechaFinEpoch) ) {
            const nuevasVentas = todasLasVentas.filter( venta => {
                const fechaVenta = removeTime(new Date(venta.createdAt)); //Remover horas, segundos, etc.
              
                return (fechaVenta.getTime() >= fechaIniEpoch && fechaVenta.getTime() <= fechaFinEpoch );
            })
            
            return nuevasVentas;
        } else {
            return todasLasVentas
        }
    }
}

function ordenarLasVentasConProductos(data) {

    let totalVentas = []; //Array para info de las ventas ya ordenadas
    data.map( item => { //Mapeamos las ventas
        const {  //Destructuracion de los datos
            id_venta, 
            createdAt,
            Cliente,
            Empleado,
            Sucursal,
            Productos,
            llenadoGratis
        } = item;

        const idVenta = id_venta.toString();

        //Formato dd/mmm/aa hh:mm a la fecha
        const fecha = new Date(createdAt);
        const diaDeLaTransaccion = fechaCorta(fecha);
        const horaDeLaTransaccion = hora(fecha);

        //Datos de la sucursal, empleado y cliente
        const { nombre: nombreSucursal } = Sucursal[0]; 
        const { nombre: nombreEmpleado, apellidos: apellidosEmpleado } = Empleado[0]; 
        const { nombre: nombreCliente, apellidos: apellidosCliente, telefono } = Cliente[0];

        //Mapeo de cada Producto en cada venta
        Productos.map( producto => {
            
            let filaVentaProducto = {}; //Fila para cada venta y su producto
            const { id_producto, cantidad, nombre, capacidad, medida, precio } = producto; //Datos del producto
            const idProducto = id_producto.toString();
            //Llenados gratis unicamente en garrafones de 19 lts
            const totalLlenadosGratis = (llenadoGratis.length > 0 && idProducto === "62f2a17281de05ae2869feab") ? llenadoGratis[0].cantidad : 0;
            //Formato al precio
            const precioProducto = Number(precio).toFixed(2);

            //Se guarda la fila en un objeto nuevo
            filaVentaProducto = {
                id_venta: idVenta,
                fecha: `${diaDeLaTransaccion} ${horaDeLaTransaccion}`,
                sucursal: nombreSucursal,
                empleado: `${nombreEmpleado} ${apellidosEmpleado}`,
                cliente: `${nombreCliente} ${apellidosCliente}`,
                telefono,
                id_producto: idProducto,
                cantidad,
                nombre,
                capacidad,
                medida,
                precio: precioProducto,
                gratis: totalLlenadosGratis
            };

            //Se agrega al array
            totalVentas.push(filaVentaProducto);
        });
    });
    return totalVentas;
}

function filtrarPorClientes(ventasOrdenadasPorFecha, idBuscar) {
    // Array vacio para guardar el nuevo arreglo
    let ventasOrdenadasPorCliente = [];

    //Mapeo de todas las ventas
    ventasOrdenadasPorFecha.map( (venta) => {
        const { Cliente } = venta;
        //Objeto vacio para guardar una venta
        let objetoVenta = {};

        //Verificamos que si ya existe un cliente en el nuevo array
        const existeCliente = ventasOrdenadasPorCliente.length > 0 
            ? ventasOrdenadasPorCliente.filter( ventaOrdenada => ventaOrdenada.telefono === Cliente[0].telefono) 
            : false;
        
        //No existe el cliente o devolvio un array vacio
        if(!existeCliente || existeCliente.length < 1){ 
            
            //Obtenemos al cliente de la venta
            const [ {_id, nombre, apellidos, telefono, email, ciudad, tipo} ] = Cliente;
            const id_cliente = _id.toString();
            
            //Actualizamos el objeto venta
            objetoVenta = {
                Ventas: [{...venta}],
                id_cliente,
                nombre,
                apellidos,
                telefono,
                email: email ? email : null,
                ciudad: ciudad ? ciudad : null,
                tipo
            }

            //Lo agregamos al nuevo array
            ventasOrdenadasPorCliente.push(objetoVenta);
        } 
        else { //Ya existe, guardamos la venta en el cliente encontrado en el nuevo arreglo
            if(existeCliente.length > 0) existeCliente[0].Ventas.push(venta);
        }
        
        return null;
    });

    //Un cliente en especifico
    if(idBuscar){
        const ventasOrdenadasPorClienteYTelefono = ventasOrdenadasPorCliente.filter( venta => venta.telefono === idBuscar)
        
        if(ventasOrdenadasPorClienteYTelefono.length > 0) {
            const dataOrdenada = ordenarLasVentasPorClientesProductos(ventasOrdenadasPorClienteYTelefono);
            return dataOrdenada;
        }
    }

    const dataOrdenada = ordenarLasVentasPorClientesProductos(ventasOrdenadasPorCliente);
    return dataOrdenada;
}

function ordenarLasVentasPorClientesProductos(ventasPorClientes) {
    let filasXl = []; //Una fila del reporte

    ventasPorClientes.map( ventaCliente => {
        const { Ventas } = ventaCliente;

        const array = ordenarLasVentasConProductos(Ventas);
        filasXl.push(...array);
    });

    return filasXl;
}

function filtrarPorProductos(ventasOrdenadasPorFecha, idBuscar) {
    // Array vacio para guardar el nuevo arreglo
    let ventasOrdenadasPorProductos = [];

    //Mapeo de todas las ventas
    ventasOrdenadasPorFecha.map( (venta) => {
        
        const { createdAt, id_venta, Cliente, Empleado, Sucursal, llenadoGratis, Productos } = venta;
        const { nombre: sucursal } = Sucursal[0];
        const { nombre: nombreEmpleado, apellidos: apellidosEmpleado } = Empleado[0];
        const atendio = `${nombreEmpleado} ${apellidosEmpleado}`;
        const { nombre, apellidos } = Cliente[0];
        const cliente = `${nombre} ${apellidos}`;
        const fecha = fechaCorta(createdAt);

        let filaXl = {};

        Productos.map( producto => {
            const { id_producto, nombre, medida, capacidad, cantidad: cantidad_producto, precio: precioTotal } = producto;
            const gratis = (llenadoGratis.length > 0) && (id_producto === '62f2a17281de05ae2869feab') ? llenadoGratis[0].cantidad : 0;
            const precio = Number(precioTotal).toFixed(2);

            filaXl = {
                id_producto: id_producto.toString(),
                nombre,
                medida,
                capacidad,
                id_venta: id_venta.toString(),
                fecha,
                cliente,   
                sucursal,             
                atendio,
                cantidad_producto,
                precio,
                gratis
            };

            ventasOrdenadasPorProductos.push({...filaXl});
            
        });
    });

    //Un producto en especifico
    if(idBuscar){
        const ventasOrdenadasPorProductoYId = ventasOrdenadasPorProductos.filter( venta => venta.id_producto === idBuscar)
        ventasOrdenadasPorProductoYId.sort((a, b) => ordenarObjsPorKey(a, b, 'id_producto'));
        return ventasOrdenadasPorProductoYId;
    }

    ventasOrdenadasPorProductos.sort((a, b) => ordenarObjsPorKey(a, b, 'id_producto'));
    return ventasOrdenadasPorProductos;
}

function crearArchivoDeExcel(totalVentas, pestana, res, tituloEncabezado) {
    const xl = require('excel4node'); //Importamos la biblioteca
    //Creamos el archivo de Excel
    let wb = new xl.Workbook(); //Nuevo libro
    let ws = wb.addWorksheet(pestana); //Nueva hoja
    const estilosEncabezado = wb.createStyle({
        font: {
          bold: true,
          color: 'FFFFFF',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#023859',
            fgColor: '#023859',
          },
          alignment: {
              horizontal: 'center',
              vertical: 'center'
          },
    });
    const estilosFilas = wb.createStyle({
        font: {
          color: '#2c2929',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#EAF2FD',
            fgColor: '#EAF2FD',
          },
          alignment: {
              horizontal: 'center',
              vertical: 'center'
          },
    });

    //Agregamos encabezados de cada columna
    const encabezados = Object.entries(totalVentas[0]).map( item => item[0]);
    ws.cell(1,1,1,13,true).string(`${tituloEncabezado}`).style(estilosEncabezado);
    for (let i = 1; i <= encabezados.length; i++) {
            ws.cell(2,i).string(encabezados[i-1]).style(estilosEncabezado);
    }

    //Recorremos todas las ventas y vamos guardando las celdas 
    if(totalVentas.length > 0) {
        for (let i = 1; i <= totalVentas.length; i++) { //Filas por cada venta-producto    
            for (let j = 1; j <= Object.values(totalVentas[0]).length; j++) { //Columnas por cada campo o atributo
                const data = Object.values(totalVentas[i-1])[j-1]; //Valor de la celda
                
                if(typeof data === 'string') {
                    ws.cell(i+2,j).string(data).style(estilosFilas);
                } else {
                    ws.cell(i+2,j).number(data).style(estilosFilas);
                }
            }
        }
    }
    
    //Escribimos los datos en el workbook
    wb.write(`reporteDe${pestana}.xlsx`, res)     
}

module.exports = {
    crearVentasEnExcel,
}