import React, { Component } from 'react';
import Tab from './tab';
import { v4 as uuidv4 } from 'uuid';

import './styles/tabs.css';

/**
 * Componente de panel de pestañas dinámico.
 */
export default class TabPanel extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeTab: null,
            data: []
        };
    }

    /**
     * Función para almecenar los datos del tabpanel en almacenamiento local.
     */
    saveStateToLocalStorage() {
        const { activeTab, data } = this.state;

        localStorage.setItem('activeTab', JSON.stringify(activeTab));
        localStorage.setItem('data', JSON.stringify(data));
    }

    /**
     * Sobrescritura de componentDidMount para recuperar los datos de localStorage al cargar la página. 
     */
    componentDidMount() {
        const v_activeTab = JSON.parse(localStorage.getItem("activeTab"));
        const v_data = JSON.parse(localStorage.getItem("data"));

        // OJO!!! Vigilar que los datos almacenados en localStorage no sean null, sino provocará errores.
        this.setState({ activeTab: v_activeTab, data: (v_data !== null ? v_data : []) });

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

        // Guarda el estado
        this.saveStateToLocalStorage();
    }

    /**
     * Acción de click en una pestaña: modifica la pestaña activa.
     * 
     * @param {*} tab 
     */
    onClickTabItem = (tab) => {
        // Modifica el estado del panel cambiando la pestaña activa.
        this.setState({ activeTab: tab });
    }

    /**
     * Acción de click para cerrar una pestaña.
     * 
     * @param {*} tab Índice de la pestaña a eliminar.
     */
    onCloseTabItem = (tab) => {
        // Clono los datos del estado del TabPanel.
        let data = this.state.data.slice();

        // Eliminar elemento por índice
        data.splice(tab, 1);

        // Calcular la nueva pestaña seleccionada
        let newActiveTab;
        // Si la longitud del nuevo contenido es mayor que cero, hago el cálculo
        if (data.length > 0) {
            // Esto lo hago sólo si se ha cerrado la pestaña activa
            if (tab === this.state.activeTab) {
                // Si se ha eliminado la primera pestaña, la pestaña activa es la cero
                if (tab === 0) {
                    newActiveTab = 0;
                } else {
                    // Si no se ha eliminado la primera pestaña, la nueva pestaña activa es la inmediatamente anterior.
                    newActiveTab = tab - 1;
                }
            } else {
                // Si se ha cerrado una pestaña distinta a la activa y es anterior a ésta, la nueva pestaña será una anterior
                newActiveTab = this.state.activeTab > tab ? this.state.activeTab - 1 : this.state.activeTab;
            }
        } else {
            // Si se han eliminado todas las pestañas, la nueva pestaña activa es null
            newActiveTab = null;
        }

        // Modifico el estado: tanto los nuevos datos como la pestaña activa (la última en añadirse).
        this.setState({ data: data, activeTab: newActiveTab })
    }

    /**
     * Evento para manejar la adición de nuevas pestañas.
     * 
     * @param {*} label 
     * @param {*} tab 
     */
    handleAddTab(label, tab) {
        // Clono los datos del estado del TabPanel.
        let data = this.state.data.slice();

        // Modifico el listado añadiendo un nuevo tab.
        data.push({
            label: label,
            // content: tab,
            content: tab,
            id: uuidv4()
        })

        // Modifico el estado: tanto los nuevos datos como la pestaña activa (la última en añadirse).
        this.setState({ data: data, activeTab: data.length - 1 })
    }

    render() {
        const {
            onClickTabItem,
            onCloseTabItem,
            state: {
                activeTab,
                data,
            }
        } = this;

        // Compruebo que haya datos (pestañas).
        if (data !== null && data.length > 0) {

            return (
                <div className="tabs">
                    <ol className="tab-list">

                        {data.map((step, i) => {
                            const label = data[i].label;
                            const id = data[i].id;

                            // Primero pinto los botones de las pestañas, que contendrán la lógica de cambio y cierre de pestañas utilizando funciones definidas aquí.
                            return (
                                <Tab
                                    key={'tab$$' + id}
                                    activeTab={activeTab}
                                    tabIndex={i}
                                    label={label}
                                    onClick={onClickTabItem}
                                    onCloseClick={onCloseTabItem}
                                />
                            );
                        })}
                    </ol>

                    <div className="tab-content">

                        {data.map((step, i) => {
                            // Cargo el componente.
                            const LazyComponent = this.props.get_component(step.content);
                            const id = step.id;

                            // Muy importante esto: para cambiar lo que ve el usuario se utiliza el estilo. Las pestañas no activas tiene display none; debe ser así 
                            // porque si por ejemplo devolviese null o undefined el componente se cargaría de nuevo cada vez que cambio de pestaña y por tanto no mantendría el 
                            // estado.
                            // OJO!!! NO usar como key el propio índice, puede dar lugar a comportamientos inesperados (por ejemplo, volver a llamar al constructor de un componente)
                            // así como problemas de rendimiento.
                            // Observar que la posición es relativa. Esto es así para que los modales (con posición absoluta) sólo afecten a la pestaña sobre la que están abiertos
                            // y no a toda la pantalla.

                            return (
                                <div key={'tabDiv$$' + id} id={'tabDiv$$' + id}
                                    style={{ display: i === activeTab ? 'block' : 'none', position: 'relative', height: '100%', overflow: 'auto' }}>
                                    <LazyComponent key={id} tab={i} parentContainer={'tabDiv$$' + id} />
                                </div>
                            );
                        })}

                    </div>

                </div>
            );
        } else {
            // Si no hay pestañas devuelvo null para que no pinte nada.
            return null;
        }
    }
}