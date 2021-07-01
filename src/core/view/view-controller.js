import React from 'react';
import DataTable from '../../core/components/data-table.js';
import { OrderByTypes, OrderByClause } from '../utils/dao-utils';
import ImageButton from '../components/image-button';
import PropTypes from 'prop-types';
import { ViewStates } from "../utils/helper-utils";

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

        /**
         * Elemento seleccionado para edición, detalle y eliminación.
         */
        this.selectedItem = null;

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

            /**
             * Estado del controlador de vista. Por defecto navegar a la vista de listado.
             */
            viewState: ViewStates.LIST,
        };
    }

    /**
     * Devuelve las opciones para la request a la api.
     * 
     * @returns 
     */
    getRequestOptions(controllerState = null) {
        let request_body;

        // En función del estado del viewcontroller, el body de la petición será diferente.
        var { viewState } = this.state;
        
        // Si se ha pasado un estado como parámetro significa que queremos forzar una consulta en concreto
        if (controllerState !== undefined && controllerState !== null) {
            viewState = controllerState;            
        }

        switch (viewState) {
            case ViewStates.EDIT:
                // La acción a realizar será 1 para creación (el objeto no tiene id) o 2 para edición (el objeto tiene id)
                const action = this.selectedItem[this.id_field_name] !== undefined && this.selectedItem[this.id_field_name] !== null ? 2 : 1;
                // A la api le tengo que pasar el objeto como un diccionario
                const item_dict = this.selectedItem.toJsonDict();

                request_body = {
                    username: null,
                    password: null,
                    action: action,
                    request_object: item_dict
                };

                break;

            case ViewStates.DETAIL:
                request_body = null;
                break;

            case ViewStates.LIST:
            default:
                request_body = {
                    username: null,
                    password: null,
                    action: 4,
                    request_object: {
                        fields: this.fields,
                        joins: this.joins,
                        filters: this.filters,
                        group_by: this.group_by,
                        order: this.order
                    }
                };

                break;
        }


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

            body: JSON.stringify(
                request_body
            )

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
        fetch(this.url, this.getRequestOptions(ViewStates.LIST))
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
     * Navega a la vista de creación.
     */
    goToCreateView() {
        // Instanciar nuevo elemento seleccionado según la clase asociada al controlador.
        this.selectedItem = new this.entity_class();

        this.setState({
            viewState: ViewStates.EDIT
        });
    }

    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns Toolbar. 
    */
    renderToolbarList() {
        return (
            <div className='toolbar'>
                <ImageButton title='i18n_reset_order_button' className='restart-button' onClick={() => this.restartOrder()} />
                <ImageButton title='i18n_add_button' className='add-button' onClick={() => this.goToCreateView()} />
            </div>
        );
    }

    /**
     * Vuelve a la vista del listado.
     */
    goToList() {
        // Cargar datos
        this.fetchData();

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.LIST
        });
    }

    /**
     * Maneja el evento de envío del objeto a la api.
     * 
     * @param {*} e 
     */
    saveChanges = async (e) => {
        e.preventDefault();

        const response = await fetch(this.url, this.getRequestOptions());
        const result = await response.json();

        // Si el resultado ha sido correcto es un código 200
        if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
            console.log(result['response_object']);
            this.setState({ viewState: ViewStates.DETAIL });
        }

        this.setState({
            viewState: ViewStates.DETAIL
        });
    };

    /**
    * Método de renderizado de toolbar de la tabla.
    * 
    * @returns Toolbar. 
    */
    renderToolbarEditDetail() {
        return (
            <div className='toolbar'>
                <ImageButton title='i18n_back_button' className='back-button' onClick={(e) => { e.preventDefault(); this.goToList(); }} />
                <ImageButton title='i18n_save_button' className='save-button' type='submit' />
            </div>
        );
    }

    /**
     * Renderizado de la vista de tabla o listado.
     * 
     * @returns Componente visual de tabla o listado. 
     */
    renderTableView() {
        const { error, isLoaded, items } = this.state;
        const view_title = this.view_title;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            // TOOLBAR
            const toolbar = this.renderToolbarList();

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

    /**
     * Renderizado de formulario de edición y detalle. Pensado para implementar.
     * 
     * @returns Componente visual de formulario de edición/detalle.
     */
    renderDetailEditForm() {
        return null;
    }

    /**
     * Devuelve true si el controlador de vista está en modo detalle.
     * 
     * @returns bool
     */
    isInDetailMode() {
        const { viewState } = this.state;
        return (viewState !== null && viewState !== undefined && viewState === ViewStates.DETAIL);
    }

    /**
     * Renderizado de la vista de edición.
     * 
     * @returns Componente visual de edición. 
     */
    renderEditView() {
        const { error, isLoaded } = this.state;
        const view_title = this.view_title;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const editDetailForm = this.renderDetailEditForm();

            return (
                <div>
                    <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                    {editDetailForm}
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
        // La vista a renderizar depende del estado de este atributo.
        const { viewState } = this.state;

        switch (viewState) {
            case ViewStates.LIST:
                return this.renderTableView();
            case ViewStates.EDIT:
            case ViewStates.DETAIL:
                return this.renderEditView();
            default:
                return null;
        }

    }

}