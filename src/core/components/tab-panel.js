import React, { Component, Suspense } from 'react';
import Tab from './tab';

import './styles/tabs.css';

/**
 * Componente de panel de pestañas dinámico.
 */
export default class TabPanel extends Component {

    constructor(props) {
        super(props);
        /**
         * Almacena los componentes abiertos en cada pestaña, para que al regresar a una pestaña abierta no vuelva a instanciar otro distinto.
         */
        this.componentsMap = new Map();

        this.state = {
            activeTab: null,
            data: []
        };
    }

    /**
     * Se utiliza para cargar los componentes en el panel de cada pestaña. Cuando se vuelve a una pestaña ya abierta, en lugar de obtener el componente lazy de nuevo se 
     * utiliza un mapa de componentes guardado en TabPanel.
     * 
     * @param {*} index Índice de la pestaña dentro del TabPanel.
     * @param {*} component Componente por defecto que le correspondería a la pestaña. Si no existiera en el mapa (es decir, si abrimos una nueva pestaña), se devuelve este mismo 
     * componente pero antes se almacena en el mapa de TabPanel.
     * @returns Componente a mostrar en una pestaña.
     */
    getComponentFromIndex(index, component) {
        if (this.componentsMap.has(index)) {
            return this.componentsMap.get(index);
        } else {
            this.componentsMap.set(index, component);
            return component;
        }
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
            content: tab
        })

        // Modifico el estado: tanto los nuevos datos como la pestaña activa (la última en añadirse).
        this.setState({ data: data, activeTab: data.length - 1 })
    }

    render() {
        const {
            onClickTabItem,
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

                            // Primero pinto los botones de las pestañas, que contendrán la lógica de cambio y cierre de pestañas utilizando funciones definidas aquí.
                            return (
                                <Tab
                                    key={'tab$$' + i}
                                    activeTab={activeTab}
                                    tabIndex={i}
                                    label={label}
                                    onClick={onClickTabItem}
                                />
                            );
                        })}
                    </ol>

                    <div className="tab-content">

                        {data.map((step, i) => {
                            // Luego se pinta el contenido de la pestaña como tal: primero obtengo el componente a pintar (que puede ser un componente nuevo o  
                            // un contenido existente de una pestaña ya abierta a la que ha regresado el usuario).
                            const LazyComponent = this.getComponentFromIndex(i, data[i].content);

                            // Muy importante esto: para cambiar lo que ve el usuario se utiliza el estilo. Las pestañas no activas tiene display none; debe ser así 
                            // porque si por ejemplo devolviese null o undefined el componente se cargaría de nuevo cada vez que cambio de pestaña y por tanto no mantendría el 
                            // estado.
                            return (
                                <div key={'tabDiv$$' + i} style={{ display: i === activeTab ? 'block' : 'none' }}>
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <LazyComponent tab={i} />
                                    </Suspense>
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