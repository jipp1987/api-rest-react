import './styles/buttons.css';


/**
 * Botón con imagen.
 */
export default function ImageButton(props) {
    return (
        <div id={props.id + 'btnContainer'} className='btn-container' onClick={props.onClick} title={props.title}>
            <button id={props.id + 'btn'} className={'image-button ' + props.className} />
            <span id={props.id + 'txt'} className='btn-text'>{props.title}</span>
        </div>
    );
}