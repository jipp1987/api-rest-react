import { number_format } from '../utils/helper-utils.js';

/**
 * Clase de ayuda para modelar las cabeceras de las tablas.
 */
class HeaderHelper {

    // CONTRUCTOR
    constructor(index, field_name, field_label, width, field_format = null, order_state = null) {
        /**
         * Índice que ocupará dentro del orden de las cabeceras de la tabla.
         */
        this._index = index;

        /**
         * Nombre del campo a nivel de modelo de datos.
         */
        this._field_name = field_name;

        /**
         * Etiqueta de visualización.
         */
        this._field_label = field_label;

        /**
         * Ancho.
         */
        this._width = width;

        /**
         * Formato de campo.
         */
        this._field_format = field_format;

        /**
         * Estado del orden (null, ASC, DESC)
         */
        this._order_state = order_state;
    }

    // GETTERS Y SETTERS
    get index() {
        return this._index
    }

    set index(index) {
        this._index = index
    }

    get field_name() {
        return this._field_name
    }

    set field_name(field_name) {
        this._field_name = field_name
    }

    get field_label() {
        return this._field_label
    }

    set field_label(field_label) {
        this._field_label = field_label
    }

    get field_format() {
        return this._field_format
    }

    set field_format(field_format) {
        this._field_format = field_format
    }

    get order_state() {
        return this._order_state
    }

    set order_state(order_state) {
        this._order_state = order_state
    }
    
    get width() {
        return this._width
    }

    set width(width) {
        this._width = width
    }

    // FUNCIONES
    /**
     * Convierte un valor de acuerdo con el formato de la cabecera.
     * @param {*} value 
     * @returns value
     */
    convert_value_as_header_format(value) {
        if (value != null) {
            switch (this._field_format) {
                case 'FLOAT':
                    return number_format(value, 2, ',', '.');
                case 'INTEGER':
                case 'DATE':
                case 'DATETIME':
                case 'NONE':
                default:
                    return value;
            }
        } else {
            return null;
        }
    }

}

// Exportar como módulo.
export default HeaderHelper;