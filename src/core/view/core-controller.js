import React from 'react';

import { FilterClause, FilterTypes } from '../../core/utils/dao-utils';
import { ViewStates, SelectActions } from "../utils/helper-utils";
import { OrderByTypes, OrderByClause } from '../utils/dao-utils';
import { APIActionCodes } from '../utils/helper-utils';
import { trackPromise } from 'react-promise-tracker';
import { FormattedMessage } from "react-intl";

import toast from 'react-hot-toast';


import "./../components/styles/buttons.css";

/**
 * @class Core de controladores de vista.
 */
export default class CoreController extends React.Component {

    /**
     * Crea una instancia del controlador de vista.
     * 
     * @param {props} 
     */
    constructor(props) {
        super(props);

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
         * Elemento seleccionado para edición y detalle.
         */
        this.selectedItem = null;

        /**
         * Elemento seleccionado para eliminación.
         */
        this.itemToDelete = null;
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
     * Devuelve las opciones para la request a la api.
     * 
     * @param {ViewStates} controllerState Estado del controlador. Si null, se utilizará el que tenga el controlador en un momento dado. 
     * Se utiliza para poder hacer una acción diferente a la que corresponda al estado del controlador, es decir: ViewStates.LIST -> Select, ViewStates.EDIT -> Edición, 
     * ViewStates.DETAIL -> Detalle (hace lo mismo que edit). También es útil para realizar un par de acciones más: ViewStates.DELETE y ViewStates.VALIDATE: los ViewControllers no 
     * están de forma natural en estos estados, así que cuando se desea eliminar un elemento o hacer una consulta para algún tipo de validación hay que pasar estos dos estados según 
     * corresponda.
     * @param {List[FieldClause]} fields Listado de FieldClause para selects. Si null, se utilizará el propio atributo del ViewController.
     * @param {List[JoinClause]} joins Listado de JoinClause para selects. Si null, se utilizará el propio atributo del ViewController.
     * @param {List[FilterClause]} filters Listado de FilterClause para selects. Si null, se utilizará el propio atributo del ViewController.
     * @param {List[GroupByClause]} group_by Listado de GroupByClause para selects. Si null, se utilizará el propio atributo del ViewController.
     * @param {List[OrderByClause]} order Listado de OrderByClause para selects. Si null, se utilizará el propio atributo del ViewController.
     * @param {SelectActions} select_action Acciones especiales para select. Si null, será una select normal. Sólo aplica para estados LIST y VALIDATE. 
     * @returns {dict} Diccionario de requestOptions para peticiones a la API.
     */
    getRequestOptions(controllerState = null, fields = null, joins = null, filters = null, group_by = null, order = null, select_action = null) {
        let request_body;

        // En función del estado del viewcontroller, el body de la petición será diferente.
        var { viewState } = this.state;

        // Si se ha pasado un estado como parámetro significa que queremos forzar una consulta en concreto
        if (controllerState !== undefined && controllerState !== null) {
            viewState = controllerState;
        }

        switch (viewState) {
            case ViewStates.EDIT:
            case ViewStates.DETAIL:
                // La acción a realizar será 1 para creación (el objeto no tiene id) o 2 para edición (el objeto tiene id)
                const action = this.selectedItem[this.id_field_name] !== undefined && this.selectedItem[this.id_field_name] !== null ? APIActionCodes.EDIT : APIActionCodes.CREATE;

                request_body = {
                    username: null,
                    password: null,
                    action: action,
                    select_action: null,
                    request_object: this.selectedItem.toJsonDict()
                };

                break;

            case ViewStates.DELETE:
                request_body = {
                    username: null,
                    password: null,
                    action: APIActionCodes.DELETE,
                    select_action: null,
                    request_object: this.itemToDelete.toJsonDict()
                };

                break;

            case ViewStates.LIST:
            case ViewStates.VALIDATE:
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
                    action: APIActionCodes.SELECT,
                    select_action: select_action,
                    request_object: {
                        fields: fields_param,
                        joins: joins_param,
                        filters: filters_param,
                        group_by: group_by_param,
                        order: order_param
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
     * Hace una consulta a la API para traer datos para el listado.
     */
    fetchData = () => {
        this.makeRequestToAPI(null, this.getRequestOptions(ViewStates.LIST)).then((result) => {
            // Controlar que haya resultado: ha podido producirse algún error durante la conexión con la API y no haber resultado.
            if (result !== undefined && result !== null) {
                this.setState({
                    items: this.convertFromJsonToEntityList(result['response_object'])
                });
            }
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
     * @param {entity_class} Elemento a eliminar. 
     */
    deleteItem = (elementToDelete) => {
        // Asigno a itemToDelete el elemento pasado como parámetro.
        this.itemToDelete = elementToDelete;

        this.makeRequestToAPI(null, this.getRequestOptions(ViewStates.DELETE)).then((result) => {
            // Si el resultado ha sido correcto es un código 200
            if (result['status_code'] !== undefined && result['status_code'] !== null && result['status_code'] === 200) {
                toast.success(result['response_object']);
                this.itemToDelete = null;
                // Cargar datos
                this.fetchData();
            } else {
                toast.error(result['response_object']);
            }
        });
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
    * Convierte un array json a un array de entidades del modelo de datos.
    * 
    * @param {json} json_result 
    * @returns {List} Lista de entidades según el modelo de datos correspondiente a la vista. 
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


    // VALIDACIÓN
    /**
     * Función asíncrona para validar un objeto pasado como parámetro. El objeto debería heredar de BaseEntity para asegurar que posee el mapa de errores de validación.
     * 
     * @param {any} item_to_check Elemento a validar.
     * @param {string} field_name Nombre del campo a validar.
     * @param {func} callback Función a ejecutar. Debería devolver un string con el error en caso de que se produzca, o no devolver nada si todo ha ido bien.
     * @param {array} params Array de parámetros para la función.
     */
    validate = async (item_to_check, field_name, callback, params) => {
        if (item_to_check !== null && item_to_check[field_name] !== undefined && item_to_check[field_name] !== null) {
            // Tiene mapa de errores (campo errorMessagesInForm)
            const hasErrorsMap = item_to_check.errorMessagesInForm !== undefined && item_to_check.errorMessagesInForm !== null;

            // Eliminar el error del mapa de errores primero, si se produce algún error almacenará para prevenir el submit del formulario
            if (hasErrorsMap) {
                item_to_check.errorMessagesInForm.delete(field_name);
            }

            // Llamar a función de validación. Importante utilizar await para que la función asíncrona espera al resultado de la promesa.
            const error = await callback.apply(this, params);

            // Si ha devuelto algo distinto de undefined/null significa que se ha producido algún error, por tanto hay que grabarlo en el mapa de errores
            if (error !== undefined && error !== null) {
                if (hasErrorsMap) {
                    item_to_check.errorMessagesInForm.set(field_name, error);
                }

                // Mostrar aviso de error
                toast.error(error);
            }
        }
    }

    /**
     * Acción de validación de código de elemento seleccionado. Comprueba si ya existe un código igual en la base de datos. Se utiliza el elemento seleccionado para ello.
     * 
     * @param {any} item_to_check Si null, se utilizará el elemento seleccionado (this.selectedItem). 
     * @param {string} field_code_name Si null, se utilizará el nombre del campo "código" del elemento seleccionado.
     * @param {List[FilterClause]} additional_filters Filtros adicionales que se quisieran introducir.
     */
    code_is_valid = (item_to_check = null, field_code_name = null, additional_filters = null) => {
        item_to_check = item_to_check !== null ? item_to_check : this.selectedItem;
        field_code_name = field_code_name !== null ? field_code_name : this.entity_class.getCodigoFieldName();

        const codigo = item_to_check[field_code_name];

        // Filtrar por código de tipo de cliente.
        const filters = [new FilterClause(field_code_name, FilterTypes.EQUALS, codigo)];

        // Añadir los filtros adicionales si los hubiera
        if (additional_filters !== null && additional_filters.length > 0) {
            filters.push(additional_filters);
        }

        // Consultar con la API si ya existe un registro en la tabla con el código introducido. Importante devolver la promesa para recoger el resultado en la función validate.
        return this.makeRequestToAPI(null, this.getRequestOptions(ViewStates.VALIDATE, null, null, filters, null, null, SelectActions.COUNT)).then((result) => {
            // Determinar el resultado
            if (result !== undefined && result !== null) {
                if (result['success'] === true) {
                    // Si count es mayor que cero, es que ya existe un registro con el mismo código
                    var count = result['response_object'];

                    if (count !== undefined && count !== null && count > 0) {
                        // Avisar al usuario
                        return <FormattedMessage id="i18n_error_codeAlreadyExists" values={{ 0: codigo }} />;
                    }
                } else {
                    return result['response_object'];
                }
            }
        });
    }

    string_is_only_numbers = (text) => {
        return /^\d+$/.test(text);
    }

}