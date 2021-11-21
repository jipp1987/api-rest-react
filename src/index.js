import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider, FormattedMessage } from "react-intl";
import TabPanel from './core/components/tab-panel';
import { Toaster } from 'react-hot-toast';

import { VIEW_MAP } from './impl/view/view_map';
import { SAVE_SEPARATOR, TAB_TO_DELETE } from "src/core/utils/helper-utils";

import messages_en from "./translations/en.json";
import messages_es from "./translations/es.json";

import './index.css';

// Carga de mensajes
const messages = {
    'es': messages_es,
    'en': messages_en
};

/**
 * Clase menú.
 */
class Menu extends React.Component {

    // CONSTRUCTOR
    constructor(props) {
        super(props);

        this.state = {
            // Opciones del menú. El primera valor es el label, el segundo el identificador que se corresponde con VIEW_MAP para cargar en el panel de pestañas las vistas.
            menuOptions: [['i18n_clientes_title', 'ClienteView'], ['i18n_tipos_cliente_title', 'TipoClienteView'], ['i18n_usuarios_title', 'UsuarioView']],
        };
    }

    render() {
        const menuOptions = this.state.menuOptions;

        // Los ítems del menú son un listado creado a partir de la pripiedad menuOptions
        const items = menuOptions.map((item) => {
            return (
                <li key={"leftMenuOption:" + item} onClick={() => this.props.onClick(item[0], item[1])}>
                    <span><FormattedMessage id={item[0]} /></span>
                </li>
            );
        });

        return (<ul className="menuLeft">
            {items}
        </ul>);
    }

}


class App extends React.Component {
    constructor() {
        super();
        this.menu = React.createRef();
        this.tabPanel = React.createRef();

        this.state = {
            /**
             * Idioma por defecto
             */
            lang: "es"
        };
    }

    addTabToTabPanel(l, m) {
        this.tabPanel.current.handleAddTab(l, VIEW_MAP[m]);
    }

    /**
     * Función para obtener el componente de forma dinámica.
     * 
     * @param {string} route Ruta absoluta del componente SIN la url base ("src/" en este caso) incluida en la misma.  
     * @returns LazyComponent
     */
    get_lazy_component(route) {
        // Tengo que partir siempre de src, sino lo hago así por algún motivo la función no es capaz de encontrarlo.
        return require("src/" + route).default;
    }

    /**
     * Elimina datos de la pestaña de localStore. Pensado para el cierre de la pestaña.
     * 
     * @param {int} tab 
     */
    delete_data_on_tab_close(tab) {
        // Borro todo localStorage, puesto que las pestañas se han reordenado.
        localStorage.clear();

        // Guardo en localStorage la pestaña que se va a cerrar para evitar que componentWillUnmount del viewController vuelva a 
        // guardar los datos (habrá que eliminar luego esta clave desde el controlador).
        localStorage.setItem(TAB_TO_DELETE + SAVE_SEPARATOR + tab, true);
    }

    render() {
        // Obtengo el lenguage por defecto
        const lang = this.state.lang;

        return (
            <IntlProvider locale={lang} messages={messages[lang]}>
                <div id="main">

                    <div id="header">
                        <div style={{ float: 'left' }}>
                            <h1>API REST</h1>
                        </div>

                        <div style={{ float: 'right' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button style={{ background: 'transparent', color: 'ghostwhite' }} onClick={() => { this.setState({ lang: "es" }) }}>CASTELLANO</button>
                                <button style={{ background: 'transparent', color: 'ghostwhite', marginTop: '5px' }} onClick={() => { this.setState({ lang: "en" }) }}>ENGLISH</button>
                            </div>
                        </div>
                    </div>

                    <div id="container">

                        <div id="leftMenu">
                            <h4 style={{ textTransform: 'uppercase' }}><FormattedMessage id="i18n_menu_title" /></h4><br />
                            <Menu ref={this.menu} onClick={(l, t) => this.addTabToTabPanel(l, t)} />
                        </div>

                        <div id="panel">
                            <div id="inner-panel">

                                <Toaster
                                    position="top-right"
                                    containerStyle={{
                                        position: 'relative',
                                    }}
                                    toastOptions={{
                                        // Define default options
                                        className: '',
                                        duration: 5000,
                                        style: {
                                            background: '#363636',
                                            color: '#fff',
                                        },
                                        // Default options for specific types
                                        success: {
                                            duration: 3000,
                                            theme: {
                                                primary: 'green',
                                                secondary: 'black',
                                            },
                                        },
                                    }} />

                                <TabPanel ref={this.tabPanel} get_component={(route) => this.get_lazy_component(route)}
                                    cleanLocalDataOnTabClose={(t) => this.delete_data_on_tab_close(t)} />

                            </div>
                        </div>

                    </div>

                    <div id="footer">
                        <b>2021</b>
                    </div>

                </div>
            </IntlProvider>
        );
    }
}

// Renderizado de index en root
ReactDOM.render(
    <App />,
    document.getElementById('root')
);