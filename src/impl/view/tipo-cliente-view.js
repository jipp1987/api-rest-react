import React from 'react';
import DataTable from '../../core/components/data-table.js';
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
         * Nombre del campo id.
         */
        this.id_field_name = TipoCliente.getIdFieldName();

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

    renderTableView() {
        const { error, isLoaded, items } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            // TOOLBAR
            const toolbar = this.renderToolbar();

            return (
                <div>
                    <h3 style={{ marginBottom: '15px' }}>TIPOS DE CLIENTE</h3>

                    {toolbar}

                    <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                        onHeaderOrderClick={(h) => this.add_order_by_header(h)} />
                </div>
            );
        }
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