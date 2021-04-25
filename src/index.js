import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TabPanel from './core/components/tab-panel';

// Declaración de imports lazy
const ClienteView = React.lazy(() => import('./impl/view/cliente-view'));

/**
 * Mapa de vistas cargadas con react lazy. Se utilizan desde el panel de pestañas para cargar las vistas.
 */
const VIEW_MAP = {
    'ClienteView': ClienteView
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
            menuOptions: [['Clientes', 'ClienteView'], ['Tipos de cliente', 'TipoClienteView'], ['Usuarios', 'UsuarioView']],
        };
    }

    render() {
        const menuOptions = this.state.menuOptions;

        // Los ítems del menú son un listado creado a partir de la pripiedad menuOptions
        const items = menuOptions.map((item) => {
            return (
                <li key={"leftMenuOption:" + item} onClick={() => this.props.onClick(item[0], item[1])}>
                    <span>{item[0]}</span>
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
        super()
        this.menu = React.createRef()
        this.tabPanel = React.createRef()
    }

    addTabToTabPanel(l, m) {
        this.tabPanel.current.handleAddTab(l, VIEW_MAP[m]);
    }

    render() {
        return (
            <div id="main">

                <div id="header">
                    <h1>API REST</h1>
                </div>

                <div id="container">

                    <div id="leftMenu">
                        <h4>MENÚ</h4><br />
                        <Menu ref={this.menu} onClick={(l, t) => this.addTabToTabPanel(l, t)} />
                    </div>

                    <div id="panel">
                        <div id="inner-panel">

                            <TabPanel ref={this.tabPanel}>
                            </TabPanel>

                        </div>
                    </div>

                </div>

                <div id="footer">
                    <b>2021</b>
                </div>

            </div>
        );
    }
}

// Renderizado de index en root
ReactDOM.render(
    <App />,
    document.getElementById('root')
);