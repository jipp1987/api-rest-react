import HeaderHelper from '../../core/view/header-helper';
import MyInput from '../../core/components/my-input';
import { FieldClause, FilterClause, FilterTypes } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';
import TipoCliente from '../model/tipo_cliente';
import { FormattedMessage } from "react-intl";
import React from 'react';

import { ViewStates } from "../../core/utils/helper-utils";

import toast from 'react-hot-toast';

/**
 * Controlador de mantenimiento de clientes.
 */
export default class TipoClienteView extends ViewController {

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
     * Acción posterior para validar el tipo de cliente.
     */
    tipo_cliente_is_valid = () => {
        // Si error es null al final, ha ido todo bien y el código es válido
        var error = null;

        // Eliminar el error del mapa de errores primero, si se produce algún error almacenará para prevenir el submit del formulario
        this.selectedItem.errorMessagesInForm.delete('codigo');

        if (this.selectedItem !== undefined && this.selectedItem !== null &&
            this.selectedItem.codigo !== undefined && this.selectedItem.codigo !== null) {
            // Filtrar por código de tipo de cliente.
            const filters = [new FilterClause("codigo", FilterTypes.EQUALS, this.selectedItem.codigo)];

            fetch(this.url, this.getRequestOptions(ViewStates.LIST, null, null, filters, null, null, true))
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result['success'] === true) {
                            // Si count es mayor que cero, es que ya existe un registro con el mismo código
                            var count = result['response_object'];

                            if (count !== undefined && count !== null && count > 0) {
                                // Avisar al usuario
                                error = "$$Ya existe un registro con el código " + this.selectedItem.codigo;
                                toast.error(error);
                                this.selectedItem.errorMessagesInForm.set("codigo", error);
                            }
                        } else {
                            error = result['response_object'];
                            toast.error(error);
                            this.selectedItem.errorMessagesInForm.set("codigo", error);
                        }
                    },

                    // Nota: es importante manejar errores aquí y no en 
                    // un bloque catch() para que no interceptemos errores
                    // de errores reales en los componentes.
                    (error) => {
                        error = error.message;
                        toast.error(error);
                        this.selectedItem.errorMessagesInForm.set("codigo", error);
                    }
                )
        }
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
                    entity={this.selectedItem}
                    valueName="codigo"
                    label={<FormattedMessage id="i18n_common_code" />}
                    maxLength={4}
                    isEditing={!isInDetailMode}
                    isRequired={true}
                    post_action={this.tipo_cliente_is_valid} />

                <MyInput
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