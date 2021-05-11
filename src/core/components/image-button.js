import './styles/buttons.css';


/**
 * Botón con imagen.
 */
export default function ImageButton(props) {
    return (
        <div className='btn-container' onClick={props.onClick} title={props.title}>
            <button className={'image-button ' + props.className} />
            <span className='btn-text'>{props.title}</span>
        </div>
    );
}