/**Funcion que ordena alfabeticamente un array de objetos 
 * en base a una key especifica (a, b) => ordenarObjsPorKey(a, b, 'miKey') */
function ordenarObjsPorKey(item1, item2, key) {
    if (item1[`${key}`] > item2[`${key}`]) return 1;
    if (item1[`${key}`] < item2[`${key}`]) return -1;
    return 0;
}

module.exports = {
    ordenarObjsPorKey
}