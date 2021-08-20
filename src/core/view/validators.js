/**
 * Comprueba si un string son sólo números.
 * 
 * @param {string} text String a comprobar. 
 * @returns {boolean} true si son sólo números, false en caso contrario. 
 */
function string_is_only_numbers(text) {
    return /^\d+$/.test(text);
}

// Exportar funciones del módulo
module.exports = { string_is_only_numbers }