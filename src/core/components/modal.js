import React, { useEffect } from "react";
import ReactDOM from 'react-dom';

import "./styles/modal.css";

export default function Modal(props) {
  // Si la propiedad show ha llegado como false, entonces devolver null (no se muestra el modal)
  if (!props.show) {
    return null;
  }

  // Comprobar si ha llegado una función para onClose: en ese caso, crear sección para botón "cerrar modal"
  var closeButton = null;
  if (props.onClose !== undefined && props.onClose !== null) {
    // Crear un evento para cerrar el modal al presionar la tecla ESC
    const closeOnEscapeKeyDown = (e) => {
      if ((e.charCode || e.keyCode) === 27) {
        props.onClose();
      }
    }

    // Usar hook de efecto: añadir un evento al cuerpo del documento para cerrar el modal
    useEffect(() => {
      document.body.addEventListener('keydown', closeOnEscapeKeyDown);

      // Eliminar el evento del cuerpo del documento
      return function cleanup() {
        document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
      }
    }, []);

    // Crear sección para mostrar el botón de cerrar
    closeButton =
      <div className="modal-footer">
        <button onClick={props.onClose} className="button">
          X
        </button>
      </div>
  }

  // Contenedor padre del modal
  const parentContainer = props.parentContainer !== undefined && props.parentContainer !== null ? props.parentContainer : 'root'; 

  // Usamos stopPropagation para evitar que al hacer click en el interior del modal se lance el evento de cierre
  // Es decir, se lanza el evento de cierre sólo al hacer click fuera del modal (y si se ha establecido una función de cierre)
  // props-children no se define como tal en las propiedades del componente, sino que es la parte entre las etiquetas de apertura y cierre del mismo
  return ReactDOM.createPortal(
    <div id={props.id} className="modal" onClick={props.onClose}>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h4 className="modal-title">{props.title}</h4>
          {closeButton}
        </div>

        <div className="modal-body">{props.children}</div>

      </div>

    </div>, document.getElementById(parentContainer)
  );

};