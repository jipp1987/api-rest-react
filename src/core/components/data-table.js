import React, { Component } from 'react'
import { resolve_property_by_string } from '../utils/helper-utils'
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from "react-intl";
import ImageButton from './image-button';

import './styles/table.css';

/**
 * Clase de tabla de datos.
 */
class DataTable extends Component {

    constructor(props) {
        super(props);

        /**
         * Id único de componente.
         */
        this.uuid = uuidv4();

        this.state = {
            headers: props.headers,
            data: props.data,
        }
    }

    // Sobrescribo este método estático para mantener el componente actualizado ante cualquier cambio en los datos.
    static getDerivedStateFromProps(nextProps, prevState) {
        const { data } = nextProps;

        // Lo que hago es comparar los datos del estado previo con los nuevos que vengan en las propiedades entrantes. Si son distintos, actualizo el estado.
        return data === prevState.data
            ? null
            : { data: data };
    }

    //componentDidUpdate(nextProps) {
    // Esto se ejecuta tras getDerivedStateFromProps. Puede ser útil si condicionalmente hay que hacer algo en ese momento.
    //}

    /**
     * Renderizado de datos de cada fila de la tabla.
     * @param {*} d 
     * @returns 
     */
    renderRowData(d, attributes) {
        const table_name = this.props.table_name;
        const uuid = this.uuid;

        // Columna de acciones
        const actionColumn = <td key={uuid + ":" + table_name + ":column:actions:" + d.uuid} style={{width: '10px'}}>
            <div className="action-column-div">
                <ImageButton className='select-button' onClick={() => this.props.selectAction(d)} />
                <ImageButton className='edit-button' onClick={() => this.props.editAction(d)} />
                <ImageButton className='delete' onClick={() => this.props.deleteAction(d)} />
            </div>
        </td>;

        // Columnas a partir de los atributos del objeto
        const columns = attributes.map(function (header) {
            // Utilizo la función resolve_property_by_string, la cual es capaz de resolver los atributos de un objeto, 
            // incluidos los de objetos anidados.
            return <td key={uuid + ":" + table_name + ":column:" + header.field_name}
                style={(header.field_format != null && (header.field_format === 'INTEGER' || header.field_format === 'FLOAT')) ?
                    { textAlign: "right" } : { textAlign: "left" }}
                header={header.field_name}>{header.convert_value_as_header_format(resolve_property_by_string(header.field_name, d))}
            </td>
        });

        return <tr key={uuid + ":" + table_name + ":row:" + d.uuid}>{actionColumn}{columns}</tr>
    }

    /**
     * Renderizado de datos de la tabla.
     * @param {*} data 
     * @returns 
     */
    renderTableData(data, attributes) {
        return data.map((d, index) => {
            // Utilizo el nombre del campo id para obtener el identificador único de cada fila.
            return this.renderRowData(d, attributes);
        });
    }

    /**
     * Renderiza las cabeceras.
     * 
     * @param {*} headers 
     * @returns headers_render
     */
    renderHeaders(headers) {
        const uuid = this.uuid;
        const table_name = this.props.table_name;

        // Cabecera para columna de acciones
        const actions_header = <th key={uuid + ":" + table_name + ':header:actionColumnHeader'}>
            <FormattedMessage id="i18n_common_actions" />
        </th>

        const headers_render = headers.map((step, i) => {
            return (
                // En función del tipo de dato, alinear a izquierda o derecha. Los datos numéricos van a la derecha.
                <th key={uuid + ":" + table_name + ':header:' + headers[i].index}
                    style={(headers[i].field_format != null && (headers[i].field_format === 'INTEGER' || headers[i].field_format === 'FLOAT')) ?
                        { textAlign: "right", width: headers[i].width } : { textAlign: "left", width: headers[i].width }}>

                    <FormattedMessage id={headers[i].field_label} />

                    <button className="order-button" onClick={() => this.props.onHeaderOrderClick(headers[i])}>
                        {headers[i].order_state == null ? String.fromCharCode(8691) : (headers[i].order_state === 'up' ? String.fromCharCode(8679) :
                            String.fromCharCode(8681))}
                    </button>

                </th>
            );
        });

        return <tr key={uuid + ":" + table_name + ":headers_row"}>{actions_header}{headers_render}</tr>;
    }

    render() {
        const { headers, data } = this.state;

        // A partir de las cabeceras seleccionadas, construyo una lista de atributos a mostrar.
        // const attributes = Object.keys(d);
        let attributes = [];
        for (let i = 0; i < headers.length; i++) {
            attributes.push(headers[i]);
        }

        // Defino las cabeceras. Observar que estoy pintando flechas en función del estado del orden de la cabecera usando el valor decimal de los símbolos unicode.
        const headers_render = this.renderHeaders(headers);

        return (
            <div style={{ display: 'block' }}>
                <table className="my-table">
                    <thead>
                        {headers_render}
                    </thead>

                    <tbody>
                        {this.renderTableData(data, attributes)}
                    </tbody>
                </table>
            </div>
        );
    }
}


export default DataTable;