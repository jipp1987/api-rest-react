import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from "react-intl";

import './styles/tabs.css';

/**
 * Componente de pestaña, entendidos como los botones que se visualizan en la parte superior del panel de pestañas.
 */
 export default class Tab extends Component {

    /**
     * Definición de tipos de propiedades. Si se le pasara un parámetro de un tipo no definido en este mapa, lanzaría excepción.
     */
    static propTypes = {
        activeTab: PropTypes.number.isRequired,
        tabIndex: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        onCloseClick: PropTypes.func.isRequired,
    };

    /**
     * La función onClick vendrá definida desde TabPanel. Realmente aquí lo que hago es forzar a que se pase como parámetro el índice de la pestaña. 
     */    
    onClick = () => {
        const { tabIndex, onClick } = this.props;
        onClick(tabIndex);
    }

    render() {
        const {
            onClick,
            props: {
                activeTab,
                label,
                tabIndex,
            },
        } = this;

        let className = 'tab-list-item';

        if (activeTab === tabIndex) {
            className += ' tab-list-active';
        }

        return (
            <li key={'tabIndex$$' + tabIndex} className={className}>
                <span onClick={onClick}><FormattedMessage id={label} /></span>
                <button style={{marginLeft: '10px'}} key={'tabIndexCloseButton$$' + tabIndex} onClick={() => this.props.onCloseClick(tabIndex)}>X</button>
            </li>
        );
    }
}