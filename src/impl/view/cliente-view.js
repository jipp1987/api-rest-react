import React from 'react';
import DataTable from '../../core/components/data-table.js';
import HeaderHelper from '../../core/view/header-helper';
import Cliente from '../model/cliente';
import { JoinTypes, JoinClause, FieldClause } from '../../core/utils/dao-utils';
import ViewController from '../../core/view/view-controller';
import { properties } from './../../properties';

/**
 * Controlador de mantenimiento de clientes.
 */
class ClienteView extends ViewController {

    // CONSTRUCTOR
    constructor(props) {
        super(props);

        /**
         * Nombre del campo id.
         */
        this.id_field_name = Cliente.getIdFieldName();

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
            new HeaderHelper(0, 'codigo', 'Código', '100px', null),
            new HeaderHelper(1, 'nombre', 'Nombre', '200px', null),
            new HeaderHelper(2, 'apellidos', 'Apellidos', '200px', null),
            new HeaderHelper(3, 'tipo_cliente.codigo', 'Código tipo de cliente', '250px', null),
            new HeaderHelper(4, 'tipo_cliente.descripcion', 'Tipo de cliente', '250px', null),
            new HeaderHelper(5, 'saldo', 'Saldo', '100px', 'FLOAT')
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
                    <h3 style={{ marginBottom: '15px' }}>CLIENTES</h3>

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

export default ClienteView;