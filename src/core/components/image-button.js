import { FormattedMessage } from "react-intl";
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import './styles/buttons.css';


/**
 * Botón con imagen.
 */
export default function ImageButton(props) {
    // Comprobar si ha llegado un tipo
    var type = props.type;
    if (type === undefined || type === null) {
        // Botón por defecto
        type = 'button';
    }

    // Lo mismo con el id
    var id = props.id;
    if (id === undefined || id === null) {
        // Si no ha llegado id alguno, establecer uno por defecto
        id = uuidv4();
    }

    const label = props.title !== undefined && props.title !== null ? 
        <span className='btn-text'><FormattedMessage id={props.title} /></span> : null;

    return (
        <div className='btn-container'>
            <button className="custom-button" id={id} type={type} onClick={props.onClick} style={props.style}>
                <span className={'image-button ' + props.className}></span>
                {label}
            </button>
        </div>
    );
}