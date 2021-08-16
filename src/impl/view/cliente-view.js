import HeaderHelper from '../../core/view/header-helper';
import Cliente from '../model/cliente';
import { JoinTypes, JoinClause, FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class ClienteView extends ViewController {

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props) {
        super(props);

        /**
         * Clase de la entidad principal.
         */
        this.entity_class = Cliente;

        /**
         * Nombre de la clase.
         */
        this.table_name = "Clientes";

        /**
          * Título de la vista.
          */
        this.view_title = "i18n_clientes_title";

        /**
         * Nombre del campo id.
         */
        this.id_field_name = this.entity_class.getIdFieldName();

        /**
         * Dirección de la API.
         */
        this.url = properties.apiUrl + '/api/Cliente';

        /**
             * Campos para la SELECT.
             */
        this.fields = [
            new FieldClause("cliente_id", null),
            new FieldClause("codigo", null),
            new FieldClause("nombre", null),
            new FieldClause("apellidos", null),
            new FieldClause("tipo_cliente.codigo", null),
            new FieldClause("tipo_cliente.descripcion", null),
            new FieldClause("saldo", null),
        ];

        /**
         * Joins activos.
         */
        this.joins = [
            new JoinClause("tipo_cliente", JoinTypes.INNER_JOIN, null),
        ];

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = [
            new HeaderHelper(0, 'codigo', 'i18n_common_code', '100px', null),
            new HeaderHelper(1, 'nombre', 'i18n_common_first_name', '200px', null),
            new HeaderHelper(2, 'apellidos', 'i18n_common_last_name', '200px', null),
            new HeaderHelper(3, 'tipo_cliente.codigo', 'i18n_clientes_customer_type_codigo', '250px', null),
            new HeaderHelper(4, 'tipo_cliente.descripcion', 'i18n_clientes_customer_type', '250px', null),
            new HeaderHelper(5, 'saldo', 'i18n_clientes_saldo', '100px', 'FLOAT')
        ];
    }

    
    /**
     * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
     * 
     * @returns Componente visual de formulario de edición/detalle.
     */
     renderDetailEditForm() {
        return null;
    }

}