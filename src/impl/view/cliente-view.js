import React, { Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import HeaderHelper from '../../core/view/header-helper';
import Cliente from '../model/cliente';
import { JoinTypes, JoinClause, FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
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
     * Función de preparado de borrado de elementos de la tabla.
     */
    openTipoClienteModal = () => {
        // Le añado un nuevo modal
        const LazyComponent = React.lazy(() => import('./tipo-cliente-view'));
        const modalId = uuidv4();

        const modalContent = <div id={'modalDiv$$' + modalId}>
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent key={modalId} tab={this.state.tab} parentContainer={'modalDiv$$' + modalId} />
            </Suspense>
        </div>;

        // Añadir modal y actualizar estado
        this.addModal("i18n_tipos_cliente_title", modalContent);
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
                    suggestAction={(inputText) => this.suggestEntities(properties.apiUrl + '/api/TipoCliente', inputText,
                        ['codigo', 'descripcion'], ['codigo', 'descripcion'], 'tipo_cliente_id')}
                    label={<FormattedMessage id="i18n_clientes_customer_type" />}
                    maxLength={4}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    findAction={() => this.openTipoClienteModal()} />

            </div>
        );
    }

}