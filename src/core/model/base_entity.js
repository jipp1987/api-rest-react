import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract BaseEntity.
 *
 * @class BaseEntity
 */
export default class BaseEntity {

  constructor() {
    if (this.constructor === BaseEntity) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    /**
     * Id único para evitar problemas en tablas y listados de react.
     */
    this.uuid = uuidv4();

    /**
     * Mapa de errores por atributo. Necesario para la validación en los formularios. La clave es un string con el nombre de la propiedad errónea; 
     * el valor es una tupla con el error y el valor erróneo. Merece la pena almacenar el valor erróneo porque si se cambia el valor de la propiedad desde otro punto, se puede 
     * comparar el valor actual con el almacenado junto al error para saber si ha cambiado y si es así eliminar el error del mapa.
    */
    this.errorMessagesInForm = new Map();
  }

  // FUNCIONES
  /**
   * Método estático a implementar. Devuelve el nombre del campo identificador en la base de datos.
   */
  static getIdFieldName() {
    throw new Error("Method 'getIdFieldName()' must be implemented.");
  }

  /**
   * Devuelve el nombre del campo código de la entidad.
   * 
   * @returns {string} Nombre del campo código de la entidad.
   */
  static getCodigoFieldName() {
    return "codigo";
  }

  /**
   * Método estático a implementar. Convierte de json a instancia de clase.
   */
  static from() {
    throw new Error("Method 'from()' must be implemented.");
  }

  /**
   * Método estático a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
   */
  getPropertiesList() {
    throw new Error("Method 'getPropertiesList()' must be implemented.");
  }


  /**
   * Devuelve un diccionario con las propiedades del objeto para enviarlo como json a una api.
   */
  toJsonDict() {
    // Obtengo las propiedades a exportar.
    const json_properties = this.getPropertiesList();

    // Devuelvo un diccionario con esas propiedades estrictamente, para descartar cualquier otro campo que no pertenezca al modelo de la base de datos.
    var json_dict = {};
    for (var i = 0; i < json_properties.length; i++) {
      // Descartar aquellas propiedades undefined.
      if (this[json_properties[i]] !== undefined) {
        // Importante comprobar si alguna de las propiedades es un objeto que sea también una BaseEntity, en ese caso deberá llamar a su propio toJsonDict.
        if (this[json_properties[i]] !== null && this[json_properties[i]].prototype instanceof BaseEntity) {
          json_dict[json_properties[i]] = this[json_properties[i]].toJsonDict();
        } else {
          json_dict[json_properties[i]] = this[json_properties[i]];
        }
      }
    }

    return json_dict;
  }

}