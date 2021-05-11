import BaseEntity from './../../core/model/base_entity';

/**
 * Modelo de entidad tipo de cliente.
 */
export default class TipoCliente extends BaseEntity {

    // CONTRUCTOR
    constructor(tipo_cliente_id, codigo, descripcion, usuario_creacion, usuario_ult_mod) {
        super();
        this._tipo_cliente_id = tipo_cliente_id;
        this._codigo = codigo;
        this._descripcion = descripcion;
        this._usuario_creacion = usuario_creacion;
        this._usuario_ult_mod = usuario_ult_mod;
    }

    // GETTERS Y SETTERS
    get tipo_cliente_id() {
        return this._tipo_cliente_id
    }

    set tipo_cliente_id(tipo_cliente_id) {
        this._tipo_cliente_id = tipo_cliente_id
    }

    get codigo() {
        return this._codigo
    }

    set codigo(codigo) {
        this._codigo = codigo
    }

    get descripcion() {
        return this._descripcion
    }

    set descripcion(descripcion) {
        this._descripcion = descripcion
    }

    get usuario_creacion() {
        return this._usuario_creacion
    }

    set usuario_creacion(usuario_creacion) {
        this._usuario_creacion = usuario_creacion
    }

    get usuario_ult_mod() {
        return this._usuario_ult_mod
    }

    set usuario_ult_mod(usuario_ult_mod) {
        this._usuario_ult_mod = usuario_ult_mod
    }

    // MÉTODOS
    /**
     * 
     * @returns Devuelve el nombre del campo id de la clase.
     */
    static getIdFieldName() {
        return 'tipo_cliente_id';
    }

    /**
     * Convertir de json a objeto.
     * 
     * @param {*} json 
     * @returns Instancia de clase.
     */
    static from(json) {
        return Object.assign(new TipoCliente(), json);
    }

}