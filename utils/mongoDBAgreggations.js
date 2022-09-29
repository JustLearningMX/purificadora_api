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

const VentasDetallesYProductosTodos = ()=>{ //Tabla "ventas"
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
                        Producto: 0 //Quitamos el array generado con "productos" debido a que va junto con "detalleVentas"
                    }
                }, 
            ],
            'as': 'Productos', //Array resultante de juntar "productos" con "detalleVentas"
        },
    },
    {   //Join "ventas" con la tabla "usuarios" para obtener el cliente
        '$lookup': {
            'from': 'usuarios',
            'let': {telCliente: "$telefono_cliente"},
            'pipeline': [
                { $match:
                    { $expr:
                        { $and:
                            { $eq: ["$telefono", "$$telCliente"]}
                        }
                    }
                },
                { $project:
                    {
                        createdAt: 0,
                        salt: 0,
                        __v: 0,
                        updatedAt: 0,
                        hash: 0
                    }
                }
            ],
            'as': 'Cliente',
        },
    },
    {   //Join "ventas" con la tabla "usuarios" para obtener el empleado
        '$lookup': {
            'from': 'usuarios',
            'let': {idEmpleado: "$id_empleado"},
            'pipeline': [
                { $match:
                    { $expr:
                        { $and:
                            { $eq: ["$_id", "$$idEmpleado"]}
                        }
                    }
                },
                { $project:
                    {
                        createdAt: 0,
                        salt: 0,
                        __v: 0,
                        updatedAt: 0,
                        hash: 0
                    }
                }
            ],
            'as': 'Empleado',
        },
    },
    {   //Join "ventas" con la tabla "sucursales" para obtener sucursal de la compra
        '$lookup': {
            'from': 'sucursales',
            'let': {idSucursal: "$id_sucursal"},
            'pipeline': [
                { $match:
                    { $expr:
                        { $and:
                            { $eq: ["$_id", "$$idSucursal"]}
                        }
                    }
                },
                { $project:
                    {
                        createdAt: 0,
                        __v: 0,
                        updatedAt: 0,
                    }
                }
            ],
            'as': 'Sucursal',
        },
    },
    {   //Join "ventas" con la tabla "llenadoGratis" para obtener si hubo llenados gratis
        '$lookup': {
            'from': 'llenadoGratis',
            'let': {idVenta: "$_id"},
            'pipeline': [
                { $match:
                    { $expr:
                        { $and:
                            { $eq: ["$id_venta", "$$idVenta"]}
                        }
                    }
                },
                { $project:
                    {
                        createdAt: 0,
                        __v: 0,
                        updatedAt: 0,
                    }
                }
            ],
            'as': 'llenadoGratis',
        },
    },
    {  //El campo '_id' en tabla "ventas" se cambia a 'id_venta'
        $addFields: { id_venta: '$_id'}
    },
    { $project: //Proyeccion de la tabla "ventas"
        {
            __v: 0,
            updatedAt: 0,
            telefono_cliente: 0,
            id_sucursal: 0,
            id_empleado: 0,
            _id: 0,
        }
    },
    // { $match: //Coincida el telefono del usuario que solicita con los que hay en la BD
    //     {
    //         telefono_cliente: `${telefono_cliente}`
    //     }
    // }
    ]
}

module.exports = {
    VentasDetallesYProductosPorUsuario,
    LlenadoGratisPorUsuario,
    VentasDetallesYProductosTodos
}