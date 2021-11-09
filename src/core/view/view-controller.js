import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import {
    ViewStates, ModalHelper, SAVE_DELIMITER, SAVE_SEPARATOR, TAB_SAVE_SEPARATOR,
    MODAL_SAVE_SEPARATOR, PROPERTY_SAVE_SEPARATOR, STATE_SAVE_SEPARATOR, TAB_TO_DELETE
} from "../utils/helper-utils";

import DataTable from '../components/data-table.js';
import ImageButton from '../components/image-button';
import LoadingIndicator from '../components/loading-indicator';
import Modal from "../components/modal";

import { FormattedMessage } from "react-intl";
import CoreController from './core-controller';

import "./../components/styles/buttons.css";

/**
 * Propiedades a excluir durante el almacenado. 
 */
const PROPERTIES_TO_EXCLUDE_IN_STORAGE = ['dataTable', 'props', '_reactInternals', '_reactInternalInstance', 'context', 'refs', 'id'];

/**
 * @class Controlador de vista.
 */
export default class ViewController extends CoreController {

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
         * Id del controller.
         */
        this.id = this.generateUuid();

        /**
         * Índice del modal.
         */
        this.modal_index = props.modal_index !== undefined && props.modal_index !== null ? props.modal_index : null;

        /**
         * Si tiene índice de modal, es un controlador modal.
         */
        this.is_modal = this.modal_index !== null ? true : false;

        /**
         * Elemento en el que se ha de hacer el último foco.
         */
        this.last_focus_element = null;

        // Establecer estado para atributos de lectura/escritura.
        this.state = {
            /**
             * Lista de datos para mostrar en la tabla.
             */
            items: [],

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
     * Función para almecenar los datos del viewcontroller en almacenamiento local.
     */
    saveStateToLocalStorage() {
        // Para almacenar la variable con localStorage, he de tener en cuenta tres cosas:
        // 1. Pestaña del controlador
        // 2. Modal (el controlador puede estar en un modal o en la ventana principal, pero si está en un modal hay que registrarlo)
        // 3. Si es una propiedad del objeto o bien pertenece al estado del mismo


        for (var prop in this) {
            if (Object.prototype.hasOwnProperty.call(this, prop)) {
                // Excluir funciones y propiedades a excluir
                if (typeof this[prop] === 'function' || PROPERTIES_TO_EXCLUDE_IN_STORAGE.includes(prop)) {
                    continue;
                }


                // El estado lo trato aparte
                if (prop === 'state') {
                    continue;
                }

                localStorage.setItem(TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.tab + (this.is_modal ? SAVE_DELIMITER + MODAL_SAVE_SEPARATOR + SAVE_SEPARATOR + this.modal_index : "") + SAVE_DELIMITER + PROPERTY_SAVE_SEPARATOR + SAVE_SEPARATOR + prop,
                    JSON.stringify(this[prop]));
            }
        }

        // Guardo aparte el estado
        // eslint-disable-next-line
        Object.entries(this.state).map(([key, value]) => {
            localStorage.setItem(TAB_SAVE_SEPARATOR + SAVE_SEPARATOR + this.props.tab + (this.is_modal ? SAVE_DELIMITER + MODAL_SAVE_SEPARATOR + SAVE_SEPARATOR + this.modal_index : "") + SAVE_DELIMITER + STATE_SAVE_SEPARATOR + SAVE_SEPARATOR + key, value);
        });
    }

    /**
     * Restaura el estado desde localStore.
     */
    restoreStateFromLocalStore() {
        // Recorrer lista de propiedades del objeto y a partir de localStorage ir completando datos
        let key;
        let key_split;
        let field_name;

        for (var prop in this) {
            if (Object.prototype.hasOwnProperty.call(this, prop)) {
                // Excluir funciones y algunas propiedades que o bien no se han almacenado o se van a tratar a posteriori
                if (typeof this[prop] === 'function' || PROPERTIES_TO_EXCLUDE_IN_STORAGE.includes(prop)) {
                    continue;
                }

                // Reinicio de variables
                key = null;
                key_split = null;
                field_name = null;

                // Voy recorriendo localStore y estableciendo valores
                for (let i = 0; i < localStorage.length; i++) {
                    key = localStorage.key(i);

                    // Hago un split por el delimitador de cada idenficador
                    key_split = key.split(SAVE_DELIMITER);

                    // Tengo que comprobar que la pestaña (y el modal, si el controlador es modal) coinciden para no volcar los datos en el controller equivocado.

                    // El último valor siempre es el nombre del campo
                    field_name = key_split[key_split.length - 1];
                }
            }
        }
    }

    /**
     * Sobrescritura de componentDidMount de React.component, para que al cargar el componente en la vista por primera vez traiga los datos desde la API.
     */
    componentDidMount() {
        this.fetchData();

        // Añade listener para guardar el estado en localStorage cuando el usuario abandona o refresca la página
        window.addEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );
    }

    /**
     * Sobrescritura de componentWillUnmount para guardar los datos en localStorage al recargar la página. 
     */
    componentWillUnmount() {
        // Eliminar el listener definido en componentDidMount
        window.removeEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );

        // Guarda el estado pero sólo si el componente se desmonta sin haberse cerrado la pestaña (es decir, si se ha recargado la página).
        // La función de cerrado de pestaña se lanza antes de desmontar el componente.
        if (localStorage.getItem(TAB_TO_DELETE + SAVE_SEPARATOR + this.props.tab)) {
            // Si se ha cerrado la pestaña, no guardo los datos. Sí que elimino esta clave para evitar problemas.
            localStorage.removeItem(TAB_TO_DELETE + SAVE_SEPARATOR + this.props.tab);
        } else {
            this.saveStateToLocalStorage();
        }
    }

    /**
     * Sobrescritura de componentDidUpdate para poner el foco en el primer input de texto posible. Debe hacerse aquí, no se puede poner en el render 
     * porque querySelector sólo funciona en componentes ya montados en el DOM y por tanto sólo pueden llamarse en funciones del ciclo de vida del componente.
     */
    componentDidUpdate() {
        // Buscar todos los inputs de tipo texto no deshabilitados
        let focusable;
        let focusable_list;

        // Si es modal y no encuentra input text, que ponga el foco incluso en los botones no deshabilitados
        if (this.last_focus_element !== undefined && this.last_focus_element !== null) {
            focusable = this.last_focus_element;
        } else {
            if (this.is_modal === true) {
                focusable_list = document.getElementById(this.props.parentContainer).querySelectorAll('button:not(:disabled), input[type="text"]:not(:disabled):not([readonly]):not([type=hidden]');
            } else {
                focusable_list = document.getElementById(this.props.parentContainer).querySelectorAll('input[type="text"]:not(:disabled):not([readonly]):not([type=hidden]');
            }
        }

        // Establecer el foco en el primero que haya encontrado.
        if (focusable_list !== undefined && focusable_list !== null && focusable_list.length > 0) {
            focusable = focusable_list[0];
        }

        // Establecer el foco en el primero que haya encontrado.
        if (focusable !== undefined && focusable !== null) {
            focusable.focus();
            // Que sólo haga select si es un input text
            if (focusable.getAttribute !== undefined && focusable.getAttribute('type') === 'text') {
                focusable.select();
            }
        }

        // Al final siempre vuelvo null el elemento de foco
        this.last_focus_element = null;
    }

    /**
     * Genera un uuid aleatorio.
     * 
     * @returns {string} Uuid aleatorio.
     */
    generateUuid() {
        return uuidv4();
    }

    /**
     * Añade un nuevo modal a la lista del controlador. Actualiza el estado del controlador de vista.
     * 
     * @param {string} title 
     * @param {any} content 
     * @param {string} width 
     */
    addModal = (title, content, width) => {
        // Copio la lista de modales
        const modalList = this.state.modalList.slice();

        // Id del modal
        const modalUuid = "modalPanel$$" + this.generateUuid();

        // Ancho del modal
        const modal_width = width !== undefined && width !== null ? width : '500px';

        // Contenedor padre: será el panel de la pestaña del viewcontroller si es el primer modal de la lista, 
        // o bien el panel modal del último elemento si la lista ya tiene contenido
        const parentContainer = modalList.length === 0 ? this.props.parentContainer : modalList[modalList.length - 1].id;

        // Añadir a la lista de modales
        modalList.push(new ModalHelper(title, modalUuid, parentContainer, content, modal_width));

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
     * Cierra el último modal abierto de la lista del controlador.
     * 
     * @returns 
     */
    removeLastModal = () => {
        if (this.state.modalList !== undefined && this.state.modalList !== null && this.state.modalList.length > 0) {
            this.removeModal(this.state.modalList.length - 1);
        } else {
            return;
        }
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
     * Selecciona un ítem para el detalle.
     * 
     * @param {entity_class} elementToSelect 
     */
    prepareDetail = (elementToSelect) => {
        this.selectedItem = elementToSelect;

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.DETAIL
        });
    }

    /**
     * Selecciona un ítem para la edición.
     * 
     * @param {entity_class} elementToSelect 
     */
    prepareEdit = (elementToSelect) => {
        this.selectedItem = elementToSelect;

        // Cambiar estado.
        this.setState({
            viewState: ViewStates.EDIT
        });
    }

    /**
     * Prepara una nueva instancia del elemento seleccionado para la creación.
     */
    prepareCreate() {
        this.selectedItem = new this.entity_class();
    }

    /**
     * Navega a la vista de creación.
     */
    goToCreateView() {
        // Instanciar nuevo elemento seleccionado según la clase asociada al controlador.
        this.prepareCreate();

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
     * Renderizado de la vista de tabla o listado.
     * 
     * @returns Componente visual de tabla o listado. 
     */
    renderTableView() {
        const { items } = this.state;
        const view_title = this.view_title;

        // TOOLBAR
        const toolbar = this.renderToolbarList();

        // Las acciones dependen de si el controlador es modal o no
        let select_action;
        if (this.is_modal === true) {
            select_action = this.props.select_action;
        } else {
            select_action = this.prepareDetail;
        }

        return (
            <div>
                <h3 style={{ marginBottom: '15px', textTransform: 'uppercase' }}><FormattedMessage id={view_title} /></h3>

                {toolbar}

                <DataTable ref={this.dataTable} headers={this.headers} data={items} id_field_name={this.id_field_name}
                    onHeaderOrderClick={(h) => this.add_order_by_header(h)} table_name={this.table_name}
                    deleteAction={this.confirmDeleteItem} selectAction={select_action} editAction={this.prepareEdit} />
            </div>
        );
    }

    /**
     * Implementación de renderizado de formulario de edición y detalle. Está pensado para sobrescribir en cada implementación de ViewController.
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
     * @returns {boolean}
     */
    isInDetailMode() {
        const { viewState } = this.state;
        return (viewState !== null && viewState !== undefined && viewState === ViewStates.DETAIL);
    }

    /**
     * Renderizado de la vista de edición.
     * 
     * @returns {Component} Componente visual de edición. 
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
     * @returns {Component} Formulario del mantenimiento.
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
                        parentContainer={step.parentContainer} width={step.modal_width}>{step.content}</Modal>
                })}
            </div>
        );

    }

}