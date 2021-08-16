import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { ViewStates, ModalModel } from "../utils/helper-utils";
import { OrderByTypes, OrderByClause } from '../utils/dao-utils';

import DataTable from '../components/data-table.js';
import ImageButton from '../components/image-button';
import LoadingIndicator from '../components/loading-indicator';
import Modal from "../components/modal";

import { FormattedMessage } from "react-intl";
import { trackPromise } from 'react-promise-tracker';
import toast from 'react-hot-toast';


import "./../components/styles/buttons.css";

/**
 * @class Controlador de mantenimiento de clientes.
 */
export default class ViewController extends React.Component {

    /**
     * Definición de tipos de propiedades. Si se le pasara un parámetro de un tipo no definido en este mapa, lanzaría excepción.
     */
    static propTypes = {
        tab: PropTypes.number.isRequired,
        parentContainer: PropTypes.string.isRequired
    };

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
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

            /**
             * Lista de paneles modales abiertos en el controlador.
             */
            modalList: []
        };
    }

    /**
    * Convierte un array json a un array de entidades del modelo de datos.
    * 
    * @param {json} json_result 
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
     * Envía una petición a la API. 
     * 
     * @param {string} url Dirección de la API. Si null, se utiliza la url asociada al controlador. 
     * @param {RequestOptions} requestOptions Objecto de opciones para la petición.
     * @returns {Promise} Evento asíncrono que a su vez devuelve el resultado de la operación 
     * (que es un objeto RequestResponse con atributos success, status_code y response_object). Dado que devuelve una promesa, la función que llame a ésta 
     * debe emplear then para captura el return interno, es decir, el resultado.
     */
    makeRequestToAPI(url, requestOptions) {
        return trackPromise(
            fetch(url !== undefined && url !== null ? url : this.url, requestOptions)
                .then(res => res.json())
                .then(
                    (result) => {
                        // Result es un objeto RequestResponse con atributos success, status_code y response_object
                        return result;
                    },

                    // TODO Si se produce un error en la consulta con la API, habrá que hacer algo aquí, redirigir a otra página o algo así
                    (error) => {
                        toast.error(error.message);
                    }
                )
        );
    }

    /**
     * Paso final para obtener las request options. Devuelve un object notation, un diccionario, con clave-valor para hacer la request a la API. 
     * 
     * @param {dict} request_body Es un diccionario con el cuerpo de la request que se va a enviar a la API. 
     * @returns {dict} Diccionario de requestOptions para peticiones a la API.
     */
    getRequestOptionsFinal(request_body) {
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
     * Devuelve las opciones para la request a la api.
     * 
     * @returns {dict} Diccionario de requestOptions para peticiones a la API.
     */
    getRequestOptions(controllerState = null, fields = null, joins = null, filters = null, group_by = null, order = null, is_count = false) {
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
                // Cargar parámetros de consulta: si vienen como argumentos se utilizan ésos, sino los del propio controller.
                const fields_param = fields !== undefined && fields !== null ? fields : this.fields;
                const joins_param = joins !== undefined && joins !== null ? joins : this.joins;
                const filters_param = filters !== undefined && filters !== null ? filters : this.filters;
                const group_by_param = group_by !== undefined && group_by !== null ? group_by : this.group_by;
                const order_param = order !== undefined && order !== null ? order : this.order;

                request_body = {
                    username: null,
                    password: null,
                    action: 4,
                    request_object: {
                        fields: fields_param,
                        joins: joins_param,
                        filters: filters_param,
                        group_by: group_by_param,
                        order: order_param,
                        is_count: is_count
                    }
                };

                break;
        }


        // Objeto para envío de solicitud a API.
        return this.getRequestOptionsFinal(request_body);
    }

    /**
     * Hace una consulta a la API para traer datos para el listado.
     */
     fetchData = () => {
        this.makeRequestToAPI(null, this.getRequestOptions(ViewStates.LIST)).then((result) => {
            this.setState({
                items: this.convertFromJsonToEntityList(result['response_object'])
            });
        });
    }

    /**
     * Maneja el evento de envío del objeto a la api.
     * 
     * @param {*} e 
     */
     saveChanges(e) {
        e.preventDefault();

        // Comprobar primero que no hay errores en el formulario a través del campo del elemento seleccionado
        if (this.selectedItem.errorMessagesInForm.size === 0) {
            this.makeRequestToAPI(null, this.getRequestOptions()).then((result) => {
                // Si el resultado ha sido correcto es un código 200
                if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                    this.setState({ viewState: ViewStates.DETAIL });
                    toast.success(result['response_object']);
                } else {
                    toast.error(result['response_object']);
                }
            });
        } else {
            // Si hay errores, mostrar toast
            for (let value of this.selectedItem.errorMessagesInForm.values()) {
                toast.error(value);
            }
        }
    };

    /**
     * Función de de borrado de elementos.
     * 
     * @param {entityClass} Elemento a eliminar. 
     */
     deleteItem = (elementToDelete) => {
        // A la api le tengo que pasar el objeto como un diccionario
        const item_dict = elementToDelete.toJsonDict();

        // Cuerpo de la solicitud a la API
        const request_body = {
            username: null,
            password: null,
            action: 3,
            request_object: item_dict
        };

        const request_options = this.getRequestOptionsFinal(request_body);

        this.makeRequestToAPI(null, request_options).then((result) => {
            // Si el resultado ha sido correcto es un código 200
            if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                toast.success(result['response_object']);
                // Cargar datos
                this.fetchData();
            } else {
                toast.error(result['response_object']);
            }
        });
    }

    componentDidMount() {
        this.fetchData();
    }

    /**
     * Añade una cláusula order_by al orden del controlador, o bien modifica una existente; depende del flag de la cabecera pasada como parámetro.
     * 
     * @param {HeaderHelper} header 
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
    * @returns {toolbar}. 
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
     * Añade un nuevo modal a la lista del controlador. Actualiza el estado del controlador de vista.
     * 
     * @param {string} title 
     * @param {any} content 
     */
    addModal = (title, content) => {
        // Copio la lista de modales
        const modalList = this.state.modalList.slice();

        // Id del modal
        const modalUuid = "modalPanel$$" + uuidv4();

        // Contenedor padre: será el panel de la pestaña del viewcontroller si es el primer modal de la lista, 
        // o bien el panel modal del último elemento si la lista ya tiene contenido
        const parentContainer = modalList.length === 0 ? this.props.parentContainer : modalList[modalList.length - 1].id;

        // Añadir a la lista de modales
        modalList.push(new ModalModel(title, modalUuid, parentContainer, content));

        // Actualizo el estado del controlador
        this.setState({ modalList: modalList });
    }

    /**
     * Elimina un modal del listado del controlador de vista.
     * 
     * @param {int} modalIndex 
     */
    removeModal = (modalIndex) => {
        // Copio la lista de modales
        const modalList = this.state.modalList.slice();

        if (modalList !== undefined && modalList !== null && modalIndex > -1) {
            modalList.splice(modalIndex, 1);
        }

        // Actualizo el estado del controlador
        this.setState({ modalList: modalList });
    }

    /**
     * Función de preparado de borrado de elementos de la tabla.
     * 
     * @param {entityClass} Elemento a eliminar. 
     */
    confirmDeleteItem = (elementToDelete) => {
        // Le añado un nuevo modal
        const modalContent =
            <div
                style={{
                    width: "100%",
                    height: "100",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >

                <div style={{ padding: '0px 20px' }}>
                    <span><FormattedMessage id="i18n_common_delete_item" /></span>
                </div>

                <div>
                    <button className='flat-button' onClick={() => {
                        this.deleteItem(elementToDelete);
                        this.removeModal(this.state.modalList.length - 1);
                    }}><FormattedMessage id="i18n_common_yes" /></button>

                    <button className='flat-button' style={{ marginLeft: '10px' }} onClick={() =>
                        this.removeModal(this.state.modalList.length - 1)
                    }><FormattedMessage id="i18n_common_no" /></button>
                </div>

            </div>

        // Añadir modal y actualizar estado
        this.addModal("i18n_common_confirm", modalContent);
    }

    /**
     * Renderizado de la vista de tabla o listado.
     * 
     * @returns Componente visual de tabla o listado. 
     */
    renderTableView() {
        const { items } = this.state;
        const view_title = this.view_title;

        // TOOLBAR
        const toolbar = this.renderToolbarList();

        return (
            <div>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                {toolbar}

                <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                    onHeaderOrderClick={(h) => this.add_order_by_header(h)} table_name={this.table_name}
                    deleteAction={this.confirmDeleteItem} />
            </div>
        );
    }

    /**
     * Implementación de renderizado de formulario de edición y detalle. Pensado para implementar.
     * 
     * @param {boolean} isInDetailMode Si true se mostrarán todos los campos deshabilitados.
     *  
     * @returns Componente visual de formulario de edición/detalle.
     */
    renderDetailEditForm(isInDetailMode = false) {
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
        const view_title = this.view_title;

        const editDetailForm = this.renderDetailEditForm(this.isInDetailMode());

        // Toolbar
        const toolbar = this.renderToolbarEditDetail();

        return (
            <div>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                <form method="POST" action="/" onSubmit={(e) => this.saveChanges(e)}>

                    {toolbar}

                    <div style={{ marginTop: '10px' }}>
                        {editDetailForm}
                    </div>

                </form>
            </div>
        );
    }

    /**
     * Implementación del renderizado.
     * 
     * @returns Formulario del mantenimiento.
     */
    render() {
        // La vista a renderizar depende del estado de este atributo.
        const { viewState, modalList } = this.state;

        let selectedView;

        switch (viewState) {
            case ViewStates.LIST:
                selectedView = this.renderTableView();
                break;
            case ViewStates.EDIT:
            case ViewStates.DETAIL:
                selectedView = this.renderEditView();
                break;
            default:
                selectedView = null;
                break;
        }

        // Cargamos el waitStatus, la vista seleccionada y la lista de modalPanels
        return (
            <div>
                <LoadingIndicator parentContainer={this.props.parentContainer} />

                {selectedView}

                {modalList.map((step, i) => {
                    return <Modal title={<FormattedMessage id={step.title} />}
                        id={step.id} key={step.id} index={i} onClose={() => this.removeModal(i)}
                        parentContainer={step.parentContainer}>{step.content}</Modal>
                })}
            </div>
        );

    }

}