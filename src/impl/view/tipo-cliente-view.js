import HeaderHelper from '../../core/view/header-helper';
import MyInput from '../../core/components/my-input';
import { FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';
import TipoCliente from '../model/tipo_cliente';
import { FormattedMessage } from "react-intl";
import React from 'react';
import { ViewValidators } from '../../core/utils/helper-utils';

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class TipoClienteView extends ViewController {

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
        this.entity_class = TipoCliente;

        /**
         * Nombre de la clase.
         */
        this.table_name = "TipoCliente";

        /**
         * Título de la vista.
         */
        this.view_title = "i18n_tipos_cliente_title";

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
            new HeaderHelper(0, 'codigo', 'i18n_common_code', '100px', null),
            new HeaderHelper(1, 'descripcion', 'i18n_common_description', '200px', null),
        ];
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
                    maxLength={4}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    validation={() => this.validateEntity(this.selectedItem, "codigo", ViewValidators.CODE_VALIDATOR, ViewValidators.IS_NUMERIC_VALIDATOR)} />

                <MyInput
                    id={this.id + "_descripcion"}
                    entity={this.selectedItem}
                    valueName="descripcion"
                    label={<FormattedMessage id="i18n_common_description" />}
                    maxLength={50}
                    isEditing={!isInDetailMode}
                    isRequired={true} />
            </div>
        );
    }

}