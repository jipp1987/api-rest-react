import React from "react";
import ReactDOM from 'react-dom';

import "./styles/modal.css";

export default function Modal(props) {
  
  // Comprobar si ha llegado una función para onClose: en ese caso, crear sección para botón "cerrar modal"
  var closeButton = null;
  
  // Contenedor padre del modal
  const parentContainer = props.parentContainer !== undefined && props.parentContainer !== null ? props.parentContainer : 'root';
  
  if (props.onClose !== undefined && props.onClose !== null) {
    // Crear sección para mostrar el botón de cerrar
    closeButton =
      <div className="modal-footer">
        <button onClick={props.onClose} className="button">
          X
        </button>
      </div>
  }
  

  // Usamos stopPropagation para evitar que al hacer click en el interior del modal se lance el evento de cierre
  // Es decir, se lanza el evento de cierre sólo al hacer click fuera del modal (y si se ha establecido una función de cierre)
  // props-children no se define como tal en las propiedades del componente, sino que es la parte entre las etiquetas de apertura y cierre del mismo
  return ReactDOM.createPortal(
    <div id={props.id} className="modal" onClick={props.onClose}>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h4 className="modal-title">{props.title}</h4>
        </div>

        {closeButton}

        <div className="modal-body">{props.children}</div>

      </div>

    </div>, document.getElementById(parentContainer)
  );

};