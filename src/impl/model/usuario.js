import BaseEntity from './../../core/model/base_entity';

/**
 * Modelo de entidad usuario.
 */
export default class Usuario extends BaseEntity {

    // CONTRUCTOR
    constructor(usuario_id, username, password) {
        super();
        this._usuario_id = usuario_id;
        this._username = username;
        this._password = password;
    }

    // GETTERS Y SETTERS
    get usuario_id() {
        return this._usuario_id
    }

    set usuario_id(usuario_id) {
        this._usuario_id = usuario_id
    }

    get username() {
        return this._username
    }

    set username(username) {
        this._username = username
    }

    get password() {
        return this._password
    }

    set password(password) {
        this._password = password
    }


    // MÉTODOS
    /**
     * 
     * @returns Devuelve el nombre del campo id de la clase.
     */
    static getIdFieldName() {
        return 'usuario_id';
    }

    /**
     * Convertir de json a objeto.
     * 
     * @param {*} json 
     * @returns Instancia de clase.
     */
    static from(json) {
        return Object.assign(new Usuario(), json);
    }

}