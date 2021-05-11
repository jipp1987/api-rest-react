import HeaderHelper from '../../core/view/header-helper';
import { FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';
import Usuario from '../model/usuario';

/**
 * Controlador de mantenimiento de clientes.
 */
class UsuarioView extends ViewController {

    // CONSTRUCTOR
    constructor(props) {
        super(props);

        /**
         * Clase de la entidad principal.
         */
        this.entity_class = Usuario;

        /**
         * Nombre de la clase.
         */
        this.table_name = "Usuario";

        /**
         * Título de la vista.
         */
        this.view_title = "Usuarios";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
         * Dirección de la API.
         */
        this.url = properties.apiUrl + '/api/Usuario';

        /**
             * Campos para la SELECT.
             */
        this.fields = [
            new FieldClause("usuario_id", null),
            new FieldClause("username", null),
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new HeaderHelper(0, 'username', 'Nombre de usuario', '100px', null),
        ];
    }

    /**
     * Implementación del renderizado.
     * 
     * @returns Formulario del mantenimiento.
     */
    render() {
        return this.renderTableView();
    }

}

export default UsuarioView;