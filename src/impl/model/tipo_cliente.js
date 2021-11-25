import BaseEntity from './../../core/model/base_entity';
import Usuario from './usuario';

/**
 * Modelo de entidad tipo de cliente.
 */
export default class TipoCliente extends BaseEntity {

    // CONTRUCTOR
    constructor(tipo_cliente_id, codigo, descripcion, usuario_creacion, usuario_ult_mod) {
        super();
        this.tipo_cliente_id = tipo_cliente_id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.usuario_creacion = usuario_creacion;
        this.usuario_ult_mod = usuario_ult_mod;
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
        const o = new TipoCliente();

        for (const key in json) {
            switch (key) {
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
        const json_props = ['tipo_cliente_id', 'codigo', 'descripcion', 'usuario_creacion', 'usuario_ult_mod'];
        return json_props;
    }

}