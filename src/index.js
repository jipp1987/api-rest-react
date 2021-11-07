import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider, FormattedMessage } from "react-intl";
import TabPanel from './core/components/tab-panel';
import { Toaster } from 'react-hot-toast';

import messages_en from "./translations/en.json";
import messages_es from "./translations/es.json";

import './index.css';

// Carga de mensajes
const messages = {
    'es': messages_es,
    'en': messages_en
};

/**
 * Mapa de vistas cargadas con react lazy. Se utilizan desde el panel de pestañas para cargar las vistas.
 */
const VIEW_MAP = {
    // OJO!!! Utilizar la ruta desde impl incluida, NO agregar src porque desde tabpanel no es capaz de cargarlos si lo pongo aquí, tiene que ser en ese componente...
    'ClienteView': 'impl/view/cliente-view',
    'TipoClienteView': 'impl/view/tipo-cliente-view',
    'UsuarioView': 'impl/view/usuario-view',
}

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

                                <TabPanel ref={this.tabPanel} />

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