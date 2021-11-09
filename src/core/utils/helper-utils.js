// Definición de tokens para almacenamiento en localStorage

/**
 * Cadena para delimitar los distintos tokens del identificador.
 */
 const SAVE_DELIMITER = "$$";
 /**
  * Separador para el identificador del token.
  */
 const SAVE_SEPARATOR = "@@";
 /**
  * Token para indicar la pestaña.
  */
 const TAB_SAVE_SEPARATOR = "tab";
 /**
  * Token para identificar el modal en caso de que sea un controlador modal.
  */
 const MODAL_SAVE_SEPARATOR = "modal";
 /**
  * Token para identificar la propiedad.
  */
 const PROPERTY_SAVE_SEPARATOR = "property";
 /**
  * Token para identificar si es variable de estado o no.
  */
 const STATE_SAVE_SEPARATOR = "state";

 /**
  * Identificador para pestañas que van a ser eliminadas. Se utiliza para que al cerrar una pestaña, componentWillUnmount no vuelva a guardar los datos en localStorage.
  */
 const TAB_TO_DELETE = "dontSaveThisTab";

 // Otros campos

/**
 * Estados y acciones de los controladores de vista.
 */
const ViewStates = {
    LIST: "LIST",
    VALIDATE: "VALIDATE",
    DETAIL: "DETAIL",
    EDIT: "EDIT",
    DELETE: "DELETE",
}

/**
 * Validadores de vista.
 */
const ViewValidators = {
    CODE_VALIDATOR: "CODE_VALIDATOR",
    IS_NUMERIC_VALIDATOR: "IS_NUMERIC_VALIDATOR",
}

/**
 * Códigos de acción para la API.
 */
const APIActionCodes = {
    CREATE: 1,
    EDIT: 2,
    DELETE: 3,
    SELECT: 4,
}

/**
 * Códigos de acción para la API.
 */
const SelectActions = {
    COUNT: 1,
}

/**
 * Accede a un miembro de un objeto a partir de un string, por ejemplo: nested1.nested2
 * @param {*} path 
 * @param {*} obj 
 * @param {*} separator 
 * @returns any
 */
function resolve_property_by_string(path, obj, separator = '.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

/**
 * Da formato a un string numérico.
 * @param {*} number 
 * @param {*} decimals 
 * @param {*} dec_point 
 * @param {*} thousands_sep 
 * @returns 
 */
function number_format(number, decimals, dec_point, thousands_sep) {
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n, prec) {
            // Fix para IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

/**
 * Foco en el siguiente elemento del formulario.
 * 
 * @param {*} currentElementId Id del elemento actual.
 */
function focusNextElement(currentElementId) {
    // Busco el elemento actual en el formulario.
    var currentElement = document.getElementById(currentElementId);

    // Selector de elementos sobre los que se puede hacer foco.
    var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    var universe = document.querySelectorAll(focussableElements);
    var list = Array.prototype.filter.call(universe, function (item) { return item.tabIndex >= "0" });

    var index = list.indexOf(currentElement);
    // Obtengo el siguiente elemento partiendo del actual (o bien el primero si fuese el último).
    var nextFocusElement = list[index + 1] || list[0];

    // Foco y selección
    if (nextFocusElement !== null && nextFocusElement !== undefined) {
        nextFocusElement.focus();

        // Si además es un input, seleccionar el texto
        if (nextFocusElement.tagName === "INPUT") {
            nextFocusElement.select();
        }
    }
}

/**
 * Fuerza el evento onBlur de todos los elementos activos del formulario.
 */
function forceOnBlur() {
    document.querySelectorAll('input,textarea').forEach(function (element) {
        if (element === document.activeElement) {
            return element.blur();
        }
    });
}

/**
 * Modelado para modales. 
 */
class ModalHelper {

    // CONTRUCTOR
    constructor(title, id, parentContainer, content, modal_width) {
        this.title = title;
        this.id = id;
        this.parentContainer = parentContainer;
        this.content = content;
        this.modal_width = modal_width;
    }

}


// Exportar como módulo.
module.exports = { ViewStates, ViewValidators, APIActionCodes, SelectActions, resolve_property_by_string, number_format, focusNextElement, forceOnBlur, ModalHelper,
    SAVE_DELIMITER, SAVE_SEPARATOR, TAB_SAVE_SEPARATOR, MODAL_SAVE_SEPARATOR, PROPERTY_SAVE_SEPARATOR, STATE_SAVE_SEPARATOR, TAB_TO_DELETE }