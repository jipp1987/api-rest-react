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

    // Asignar un uuid para los keys de tablas y otros componentes
    this._uuid = uuidv4();
  }

  /**
   * Método estático a implementar. Devuelve el nombre del campo identificador en la base de datos.
   */
  static getIdFieldName() {
    throw new Error("Method 'getIdFieldName()' must be implemented.");
  }

  /**
   * Método estático a implementar. Convierte de json a instancia de clase.
   */
  static from() {
    throw new Error("Method 'from()' must be implemented.");
  }

  // GETTERS Y SETTERS
  get uuid() {
    return this._uuid
  }

  set uuid(uuid) {
    this._uuid = uuid
  }

}