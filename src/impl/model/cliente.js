import BaseEntity from './../../core/model/base_entity';

/**
 * Modelo de entidad cliente.
 */
 export default class Cliente extends BaseEntity {
    
    // CONTRUCTOR
    constructor(cliente_id, codigo, saldo, tipo_cliente, nombre, apellidos, usuario_creacion, usuario_ult_mod) {
        super();
        this._cliente_id = cliente_id;
        this._codigo = codigo;
        this._saldo = saldo;
        this._tipo_cliente = tipo_cliente;
        this._nombre = nombre;
        this._apellidos = apellidos;
        this._usuario_creacion = usuario_creacion;
        this._usuario_ult_mod = usuario_ult_mod;
    }

    // GETTERS Y SETTERS
    get cliente_id() {
        return this._cliente_id
    }

    set cliente_id(cliente_id) {
        this._cliente_id = cliente_id
    }

    get codigo() {
        return this._codigo
    }

    set codigo(codigo) {
        this._codigo = codigo
    }

    get saldo() {
        return this._saldo
    }

    set saldo(saldo) {
        this._saldo = saldo
    }

    get tipo_cliente() {
        return this._tipo_cliente
    }

    set tipo_cliente(tipo_cliente) {
        this._tipo_cliente = tipo_cliente
    }

    get nombre() {
        return this._nombre
    }

    set nombre(nombre) {
        this._nombre = nombre
    }

    get apellidos() {
        return this._apellidos
    }

    set apellidos(apellidos) {
        this._apellidos = apellidos
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
        return 'cliente_id';
    }


}