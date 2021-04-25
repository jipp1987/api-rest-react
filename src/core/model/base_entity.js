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
    }
  
    /**
     * Método estático a implementar.
     */
    static getIdFieldName() {
      throw new Error("Method 'getIdFieldName()' must be implemented.");
    }

  }