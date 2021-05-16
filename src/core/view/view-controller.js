import React from 'react';
import DataTable from '../../core/components/data-table.js';
import { OrderByTypes, OrderByClause } from '../utils/dao-utils';
import ImageButton from '../components/image-button';
import PropTypes from 'prop-types';
import { FormattedMessage } from "react-intl";

/**
 * Controlador de mantenimiento de clientes.
 */
export default class ViewController extends React.Component {

    /**
     * Definición de tipos de propiedades. Si se le pasara un parámetro de un tipo no definido en este mapa, lanzaría excepción.
     */
    static propTypes = {
        tab: PropTypes.number.isRequired,
    };

    // CONSTRUCTOR
    constructor(props) {
        super(props);
        // Referencia a la tabla de datos para poder actualizarla.
        this.dataTable = React.createRef();

        /**
         * Nombre del campo id.
         */
        this.id_field_name = 'id';

        /**
         * Dirección de la API.
         */
        this.url = '';

        /**
         * Límite de filas.
         */
        this.rowLimit = 50;

        /**
         * Campos para la SELECT.
         */
        this.fields = null;

        /**
         * Filtros activos.
         */
        this.filters = null;

        /**
         * OrderBys activos.
         */
        this.order = null;

        /**
         * Joins activos.
         */
        this.joins = null;

        /**
         * Group bys activos.
         */
        this.group_by = null;

        /**
         * Array de objetos HeaderHelper para modelar las cabeceras.
         */
        this.headers = null;

        // Establecer estado para atributos de lectura/escritura.
        this.state = {
            /**
             * Se ha producido error durante la carga en la api.
             */
            error: null,

            /**
             * Se ha cargado en la api.
             */
            isLoaded: false,

            /**
             * Lista de datos para mostrar en la tabla.
             */
            items: [],

            /**
             * Pestaña en la que está situado el controlador de vista.
             */
            tab: props.tab,
        };
    }

    /**
     * Devuelve las opciones para la request a la api.
     * 
     * @returns 
     */
    getRequestOptions() {
        // Objeto para envío de solicitud a API.
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            cache: 'default',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                username: null,
                password: null,
                action: 4,
                request_object: {
                    fields: this.fields,
                    joins: this.joins,
                    filters: this.filters,
                    group_by: this.group_by,
                    order: this.order
                },
            })
        };

        return requestOptions;
    }

    /**
     * Convierte un array json a un array de entidades del modelo de datos.
     * 
     * @param {*} json_result 
     * @returns Lista de entidades según el modelo de datos correspondiente a la vista. 
     */
    convertFromJsonToEntityList(json_result) {
        var result = [];

        // Convertir entidad a entidad.
        if (json_result !== null && json_result.length > 0) {
            for (let i = 0; i < json_result.length; i++) {
                result.push(this.entity_class.from(json_result[i]));
            }
        }

        return result;
    }

    /**
     * Traer datos de la api.
     */
    fetchData = () => {
        fetch(this.url, this.getRequestOptions())
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: this.convertFromJsonToEntityList(result['response_object'])
                    });
                },

                // Nota: es importante manejar errores aquí y no en 
                // un bloque catch() para que no interceptemos errores
                // de errores reales en los componentes.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {
        this.fetchData();
    }

    /**
     * Añade una cláusula order_by al orden del controlador, o bien modifica una existente; depende del flag de la cabecera pasada como parámetro.
     * 
     * @param {*} header 
     */
    add_order_by_header(header) {
        // Clono con slice la lista de order bys según el estado.
        const order_list = this.order == null ? [] : this.order.slice();

        // Busco la cláusula order_by cuyo campo se corresponda con el nombre de la cabecera, la convierto a otro estado siguiendo un
        // semáforo: si no existe pasa a ASC, si ASC pasa a DESC, y si DESC se elimina.
        var index = null;
        var exists = null;
        for (let i = 0; i < order_list.length; i++) {
            if (order_list[i].field_name === header.field_name) {
                index = i;
                break;
            }
        }

        // Si existe, cambiar el tipo de la cláusula según el flag order_state. También cambiar el estado de dicho flag para visualizar el cambio en la propia cabecera.
        if (index != null) {
            exists = order_list[index];

            if (header.order_state === 'up') {
                exists.order_by_type = OrderByTypes.DESC;
                header.order_state = 'down';
            } else {
                // Elimino del array
                order_list.splice(index, 1);
                header.order_state = null;
            }
        } else {
            // Si no existe, añadir a la lista de order_bys una nueva cláusula con ASC
            order_list.push(new OrderByClause(header.field_name, OrderByTypes.ASC));
            header.order_state = 'up';
        }

        // Modifico las cabeceras del controlador también
        for (let i = 0; i < this.headers.length; i++) {
            if (this.headers[i].field_name === header.field_name) {
                this.headers[i] = header;
                break;
            }
        }

        // Reasigno el orden del viewcontroller
        this.order = order_list;

        // Llamo a fetchdata para rehacer el estado del viewcontroller y de la tabla interior.
        this.fetchData();
    }

    /**
     * Reestablece el orden por defecto.
     */
    restartOrder() {
        // Reestablecer cabeceras
        // Modifico las cabeceras del controlador también
        for (let i = 0; i < this.headers.length; i++) {
            this.headers[i].order_state = null;
        }

        // Traer datos de nuevo quitando el orden
        this.order = [];
        this.fetchData();
    }

    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns Toolbar. 
    */
    renderToolbar() {
        return (
            <div style={{ display: 'inline-block', marginBottom: '2px', padding: '2px' }}>
                <ImageButton title='i18n_reset_order_button' className='restart-button' onClick={() => this.restartOrder()} />
            </div>
        );
    }

    renderTableView() {
        const { error, isLoaded, items } = this.state;
        const view_title = this.view_title;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            // TOOLBAR
            const toolbar = this.renderToolbar();

            return (
                <div>
                    <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                    {toolbar}

                    <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                        onHeaderOrderClick={(h) => this.add_order_by_header(h)} table_name={this.table_name} />
                </div>
            );
        }
    }

}