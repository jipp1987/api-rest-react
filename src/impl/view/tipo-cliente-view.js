import HeaderHelper from '../../core/view/header-helper';
import { FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';
import TipoCliente from '../model/tipo_cliente';

/**
 * Controlador de mantenimiento de clientes.
 */
class TipoClienteView extends ViewController {

    // CONSTRUCTOR
    constructor(props) {
        super(props);

        /**
         * Clase de la entidad principal.
         */
        this.entity_class = TipoCliente;

        /**
         * Nombre de la clase.
         */
        this.table_name = "TipoCliente";

        /**
         * Título de la vista.
         */
        this.view_title = "Tipos de cliente";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
         * Dirección de la API.
         */
        this.url = properties.apiUrl + '/api/TipoCliente';

        /**
             * Campos para la SELECT.
             */
        this.fields = [
            new FieldClause("tipo_cliente_id", null),
            new FieldClause("codigo", null),
            new FieldClause("descripcion", null),
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new HeaderHelper(0, 'codigo', 'Código', '100px', null),
            new HeaderHelper(1, 'descripcion', 'Descripción', '200px', null),
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

export default TipoClienteView;