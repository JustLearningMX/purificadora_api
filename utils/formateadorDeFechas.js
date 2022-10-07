/**Funcion que recibe una fecha en formato ISO
 * y lo transforma en un formato corto: dd-mmm-aa */
function fechaCorta(fecha) { //Recibe la fecha
    const [month, day, year] = [fecha.getMonth(), fecha.getDate(), fecha.getFullYear()]; //Extraemos mes, dia y anho
    return `${day}-${mesesCorto[month]}-${year.toString().slice(2)}`; //Retornamos en formato dd-mmm-aa
}

/**Funcion que recibe una fecha en formato ISO
 * y retorna la hora: hh-mm */
function hora(fecha) {
    const [hour, minutes] = [fecha.getHours(), fecha.getMinutes()];
    return `${hour}:${minutes}`;
}

function removeTime(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
}

function dividirFecha(fecha){
    return fecha.split('-');
}

const mesesCorto = {
    0: 'ene',
    1: 'feb',
    2: 'mar',
    3: 'abr',
    4: 'may',
    5: 'jun',
    6: 'jul',
    7: 'ago',
    8: 'sep',
    9: 'oct',
    10: 'nov',
    11: 'dic'
};

module.exports = {
  fechaCorta,
  hora, 
  removeTime,
  dividirFecha  
};