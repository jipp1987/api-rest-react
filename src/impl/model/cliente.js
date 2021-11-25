import BaseEntity from './../../core/model/base_entity';
import TipoCliente from './tipo_cliente';
import Usuario from './usuario';

/**
 * Modelo de entidad cliente.
 */
export default class Cliente extends BaseEntity {

    // CONTRUCTOR
    constructor(cliente_id, codigo, saldo, tipo_cliente, nombre, apellidos, usuario_creacion, usuario_ult_mod) {
        super();
        this.cliente_id = cliente_id;
        this.codigo = codigo;
        this.saldo = saldo;
        this.tipo_cliente = tipo_cliente;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.usuario_creacion = usuario_creacion;
        this.usuario_ult_mod = usuario_ult_mod;
    }

    // MÉTODOS
    /**
     * 
     * @returns Devuelve el nombre del campo id de la clase.
     */
    static getIdFieldName() {
        return 'cliente_id';
    }

    /**
     * Convertir de json a objeto.
     * 
     * @param {*} json 
     * @returns Instancia de clase.
     */
    static from(json) {
        const o = new Cliente();

        for (const key in json) {
            switch (key) {
                case 'tipo_cliente':
                    o[key] = TipoCliente.from(json[key]);
                    break;

                case 'usuario_creacion':
                case 'usuario_ult_mod':
                    o[key] = Usuario.from(json[key]);
                    break;

                case 'errorMessagesInForm':
                case 'uuid':
                    // Esto no debe settearlo
                    break;

                default:
                    o[key] = json[key];
                    break;
            }
        }

        return o;
    }

    /**
     * Método estático a implementar. Devuelve un array de strings con las propiedades de la clase a exportar en json.
     * 
     * @returns Listado de propiedades a exportar en json. 
     */
    getPropertiesList() {
        const json_props = ['cliente_id', 'codigo', 'saldo', 'tipo_cliente', 'nombre', 'apellidos', 'usuario_creacion', 'usuario_ult_mod'];
        return json_props;
    }

}