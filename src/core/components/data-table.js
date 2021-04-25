import React, { Component } from 'react'
import { resolve_property_by_string } from '../utils/helper-utils'
import './styles/table.css';

/**
 * Clase de tabla de datos.
 */
class DataTable extends Component {
    
    constructor(props) {
        super(props)
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
        return attributes.map(function (header) {
            // Utilizo la función resolve_property_by_string, la cual es capaz de resolver los atributos de un objeto, 
            // incluidos los de objetos anidados.
            return <td key={header.field_name}
                style={(header.field_format != null && (header.field_format === 'INTEGER' || header.field_format === 'FLOAT')) ?
                    { textAlign: "right" } : { textAlign: "left" }}
                header={header.field_name}>{header.convert_value_as_header_format(resolve_property_by_string(header.field_name, d))}
            </td>
        });
    }

    /**
     * Renderizado de datos de la tabla.
     * @param {*} data 
     * @returns 
     */
    renderTableData(data, attributes) {
        const id_field_name = this.props.id_field_name;

        return data.map((d, index) => {
            return (
                <tr key={d[id_field_name]}>
                    {this.renderRowData(d, attributes)}
                </tr>
            )
        })
    }

    /**
     * Renderiza las cabeceras.
     * 
     * @param {*} headers 
     * @returns headers_render
     */
    renderHeaders(headers) {
        const headers_render = headers.map((step, i) => {
            return (
                // En función del tipo de dato, alinear a izquierda o derecha. Los datos numéricos van a la derecha.
                <th key={'header$' + headers[i].index}
                    style={(headers[i].field_format != null && (headers[i].field_format === 'INTEGER' || headers[i].field_format === 'FLOAT')) ?
                        { textAlign: "right", width: headers[i].width } : { textAlign: "left", width: headers[i].width }}>

                    {headers[i].field_label}
                    <button className="order-button" onClick={() => this.props.onHeaderOrderClick(headers[i])}>
                        {headers[i].order_state == null ? String.fromCharCode(8691) : (headers[i].order_state === 'up' ? String.fromCharCode(8679) :
                            String.fromCharCode(8681))}
                    </button>

                </th>
            );
        });

        return headers_render;
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
                        <tr key='headers_row'>
                            {headers_render}
                        </tr>
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