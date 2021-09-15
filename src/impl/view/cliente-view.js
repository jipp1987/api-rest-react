import HeaderHelper from '../../core/view/header-helper';
import Cliente from '../model/cliente';
import { JoinTypes, JoinClause, FieldClause, FilterClause, FilterTypes, OperatorTypes } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { ViewStates } from '../../core/utils/helper-utils';
import { ViewValidators } from '../../core/utils/helper-utils';
import { properties } from './../../properties';

import TipoCliente from '../model/tipo_cliente';
import MyInput from '../../core/components/my-input';
import SuggestionBox from '../../core/components/suggestion-box';

import { FormattedMessage } from "react-intl";

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
     * Sobrescritura. Prepara una nueva instancia del elemento seleccionado para la creación.
     */
    prepareCreate() {
        this.selectedItem = new Cliente();
        this.selectedItem.tipoCliente = new TipoCliente();
    }

    /**
     * Busca por coincidencia en el código o descripción de los tipos de cliente.
     * 
     * @param {string} inputText Texto que se usará en los filtros por coincidencia.
     * @returns {list} Devuelve una lista de resultados obtenidos de la api, o bien una lista vacía si no encuentra nada.
     */
    async suggestTiposCliente(inputText) {
        var list = [];

        if (inputText !== undefined && inputText !== null) {
            // Consultar a la api de tipos de cliente
            const url = properties.apiUrl + '/api/TipoCliente';


            // Buscar por código y descripción
            const filters = [
                new FilterClause("codigo", FilterTypes.STARTS_WITH, inputText),
                new FilterClause("descripcion", FilterTypes.STARTS_WITH, inputText, null, OperatorTypes.OR),
            ];

            // Campos: el id tengo que pasarlo siempre
            const fields = [
                new FieldClause("tipo_cliente_id"),
                new FieldClause("codigo"),
                new FieldClause("descripcion"),
            ];

            // TODO Esto hay que revisarlo: tengo que pasar listados vacíos porque si paso null me coge los listados de cláusulas del propio controlador. 
            // Buscar una forma de poder pasar null o nada mejor.
            const result = await this.makeRequestToAPI(url, this.getRequestOptions(ViewStates.LIST, fields, [], filters, [], []), false);

            // Determinar el resultado
            if (result !== undefined && result !== null) {
                // Es una lista de diccionarios: aquellas claves que no formen parte de la lista de fields, las elimino
                list = result['response_object'];

                if (list !== undefined && list !== null && list.length > 0) {
                    // Eliminar las claves que no formen parte del listado de campos seleccionado
                    var selected_fields = [];
                    var not_selected_fields = [];

                    // Array de campos seleccionados en los fieldclauses
                    fields.forEach(field => selected_fields.push(field.field_name));

                    // Como todos los elementos del resultado tienen las mismas claves, utilizo el primer elemento para obtener aquellas claves que no forman parte
                    // del conjunto de campos seleccionados
                    Object.keys(list[0]).forEach(function (k) {
                        if (!selected_fields.includes(k)) {
                            not_selected_fields.push(k);
                        }
                    });

                    // Recorro los diccionarios y elimino esas claves
                    list.forEach(dict => not_selected_fields.forEach(e => delete dict[e]));
                } else {
                    list = [];
                }
            }
        }

        return list;
    }

    /**
    * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
    * 
    * @param {boolean} isInDetailMode Si true se mostrarán todos los campos deshabilitados.
    *  
    * @returns Componente visual de formulario de edición/detalle.
    */
    renderDetailEditForm(isInDetailMode = false) {
        return (
            <div>

                <MyInput
                    id={this.id + "_codigo"}
                    entity={this.selectedItem}
                    valueName="codigo"
                    label={<FormattedMessage id="i18n_common_code" />}
                    maxLength={10}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    validation={() => this.validateEntity(this.selectedItem, "codigo", ViewValidators.CODE_VALIDATOR, ViewValidators.IS_NUMERIC_VALIDATOR)} />

                <MyInput
                    id={this.id + "_nombre"}
                    entity={this.selectedItem}
                    valueName="nombre"
                    label={<FormattedMessage id="i18n_common_first_name" />}
                    maxLength={50}
                    isEditing={!isInDetailMode}
                    isRequired={true} />

                <MyInput
                    id={this.id + "_apellidos"}
                    entity={this.selectedItem}
                    valueName="apellidos"
                    label={<FormattedMessage id="i18n_common_last_name" />}
                    maxLength={80}
                    isEditing={!isInDetailMode}
                    isRequired={false} />

                <SuggestionBox
                    id={this.id + "_tipoCliente"}
                    entity={this.selectedItem.tipoCliente}
                    valueName={this.selectedItem.tipoCliente.constructor.getCodigoFieldName()}
                    idFieldName={this.selectedItem.tipoCliente.constructor.getIdFieldName()}
                    suggestAction={(inputText) => this.suggestTiposCliente(inputText)}
                    label={<FormattedMessage id="i18n_clientes_customer_type" />}
                    maxLength={4}
                    isEditing={!isInDetailMode}
                    isRequired={true} />

            </div>
        );
    }

}