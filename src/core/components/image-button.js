import { FormattedMessage } from "react-intl";

import './styles/buttons.css';


/**
 * Botón con imagen.
 */
export default function ImageButton(props) {
    return (
        <div className='btn-container' onClick={props.onClick}>
            <button className={'image-button ' + props.className} />
            <span className='btn-text'><FormattedMessage id={props.title} /></span>
        </div>
    );
}