import BaseEntity from './../../core/model/base_entity';

/**
 * Modelo de entidad usuario.
 */
export default class Usuario extends BaseEntity {

    // CONTRUCTOR
    constructor(usuario_id, username, password) {
        super();
        this.usuario_id = usuario_id;
        this.username = username;
        this.password = password;
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
        const o = new Usuario();
        
        for (const key in json) {
            switch (key) {
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
        const json_props = ['usuario_id', 'username', 'password'];
        return json_props;
    }

}