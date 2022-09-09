//Agregacion en MongoDB que une Ventas con detalleVentas y asu vez este con los productos
const VentasDetallesYProductosPorUsuario = (telefono_cliente)=>{ //Tabla "ventas"
    return [{
        '$lookup': { //Join "ventas" con la tabla "detalleVentas"
            'from': 'detalleVentas',
            'let': {idVenta: "$_id"},
            'pipeline': [
                { $match:
                    { $expr:
                        { $and:    //Id's iguales
                            { $eq: ["$id_venta", "$$idVenta"]}
                        }
                    }
                },
                { '$lookup': { //Join "detalleVentas" con la tabla "productos"
                        'from': 'productos',
                        'let': {idProducto: '$id_producto'},
                        'pipeline': [
                            { $match: 
                                { $expr:
                                    { $and:     //Id's iguales
                                        { $eq: ['$_id', '$$idProducto']}
                                    }
                                }
                            },
                            {  //El campo 'cantidad' en tabla "productos" se cambia a 'capacidad'
                                $addFields: { capacidad: '$cantidad'}
                            },
                            { $project: //Proyeccion de la tabla "productos"
                                {
                                    precio: 0,
                                    createdAt: 0,
                                    updatedAt: 0,
                                    __v: 0,
                                    cantidad: 0, //Quitamos 'cantidad' por que ya existe su copia 'capacidad'
                                }
                            },
                        ],
                        'as': 'Producto'
                    }                        
                },
                { $replaceRoot: //Se juntan "productos" con "detallesVentas" para hacer uno solo
                    { newRoot:
                        {
                            $mergeObjects: [ { $arrayElemAt: [ "$Producto", 0 ] }, "$$ROOT" ]
                        }
                    }
                },
                { $project: //Proyeccion de la tabla "detalleVentas"
                    {
                        __v: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        _id: 0,
                        Producto: 0 //Quitamos el array generado con "productos" debido a que junto con "detalleVentas"
                    }
                }
            ],
            'as': 'Productos', //Array resultante de juntar "productos" con "detalleVentas"
        }
    },
    { $project: //Proyeccion de la tabla "ventas"
        {
            __v: 0,
            updatedAt: 0,
            id_sucursal: 0,
            id_empleado: 0,
        }
    },
    { $match: //Coincida el telefono del usuario que solicita con los que hay en la BD
        {
            telefono_cliente: `${telefono_cliente}`
        }
    }]
}

//Agregacion en MongoDB para obtener los llenados gratis que el usuario tiene en su historial
const LlenadoGratisPorUsuario = (telefono_cliente)=>{ //Tabla "llenadoGratis"
    return [        
    { $match: //Coincida el telefono del usuario que solicita con los que hay en la BD
        {
            telefono_cliente: `${telefono_cliente}`
        }
    },
    { $project: //Proyeccion de la tabla "llenadoGratis"
        {
            _id: 0,
            __v: 0,
            updatedAt: 0,
        }
    },]
}

module.exports = {
    VentasDetallesYProductosPorUsuario,
    LlenadoGratisPorUsuario
}