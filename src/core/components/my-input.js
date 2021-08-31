import React from "react";
import PropTypes from "prop-types";
// import { focusNextElement } from "../utils/helper-utils";

import './styles/inputs.css';

/**
 * Componente de input de texto.
 */
export default class MyInput extends React.Component {

    static propTypes = {
        id: PropTypes.string.isRequired,
        entity: PropTypes.object.isRequired,
        valueName: PropTypes.string.isRequired,
        label: PropTypes.object.isRequired,
        size: PropTypes.number,
        maxLength: PropTypes.number,
        minLength: PropTypes.number,
        isEditing: PropTypes.bool,
        isRequired: PropTypes.bool,
        validation: PropTypes.func,
        subsequentAction: PropTypes.func,
    };

    constructor(props) {
        super(props);
        // Compruebo si ha llegado algún valor de la propia entidad, sino lo inicializo en string vacío. Si no lo hago se produce un error en javascript.
        const value = props.entity[props.valueName] !== null && props.entity[props.valueName] !== undefined ? props.entity[props.valueName] : "";
        const isRequired = props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false;

        this.state = {
            // Necesito almacenar el valor del input como tal en el estado para que lo mantenga ante los distintos cambios, de tal modo que el input esté controlado
            value: value,
            // Guardo la entidad, pues quiero mantener el modelo actualizado además del valor
            entity: props.entity,
            isEditing: props.isEditing,
            isRequired: isRequired,
        };
    }

    // Sobrescribo este método estático para mantener el componente actualizado ante cualquier cambio en los datos.
    static getDerivedStateFromProps(nextProps, prevState) {
        const { isEditing, isRequired } = nextProps;

        // Lo que hago es comparar los datos del estado previo con los nuevos que vengan en las propiedades entrantes. Si son distintos, actualizo el estado.
        return isEditing === prevState.isEditing && isRequired === prevState.isRequired
            ? null
            : { isEditing: isEditing, isRequired: isRequired };
    }

    handleChange(e) {
        const entity = this.state.entity;
        // Tras un cambio en el input, actualizo también la entidad del modelo
        var newValue = e.target.value;
        entity[this.props.valueName] = newValue;

        // El cambio de estado es tanto del valor del input como de la entidad, para mantenerla actualizada 
        this.setState({ value: newValue, entity: entity });
    }

    /**
     * Acción posterior tras perder el foco.
     */
    onBlur = async (event) => {
        // Ejecutar primero los validadores si los hubiera
        // Asumo que va a ser null para evitar forzar el click al final si no hay eventos asíncronos; los eventos asíncronos durante la validación 
        // previenen el click del botón si se hace click sin salir del input, es decir, se lanza el onblur del input pero luego no hace click.
        var isValid = null;

        const { validation, subsequentAction } = this.props;

        // Validador de código
        if (validation !== undefined && validation !== null) {
            // Como validate me devuelve una promesa, la función debe ser asíncrona y tengo que poner un await aquí para esperar a recoger el resultado.
             isValid = await validation();
        }

        // Si ha llegado hasta aquí y hay acción posterior (y no ha habido validación o ésta ha sido correcta), ejecutar la acción
        var actionHasHappened = null;
        if ((isValid === null || isValid) && subsequentAction !== undefined && subsequentAction !== null) {
            await subsequentAction();
            actionHasHappened = true;
        }

        // Si se ha hecho click en un botón sin haber tabulado, se lanzará el evento onblur pero prevendrá el click del botón. Comprobando el relatedTarget del evento 
        // podemos forzar el click. Sólo pasamos por aquí si la validación ha sido ok.
        if ((isValid || actionHasHappened) && event !== undefined && event !== null) {
            const { relatedTarget } = event;

            if (relatedTarget && ('submit' === relatedTarget.getAttribute('type') || 'button' === relatedTarget.getAttribute('type'))) {
                relatedTarget.click();
            }
        }
    };

    /**
     * Pinta un label para campos obligatorios.
     * @param {boolean} isRequired 
     * @returns {component}
     */
    renderRequiredLabel(isRequired) {
        if (isRequired) {
            return (
                <span style={{ color: 'red', fontWeight: 'bold', float: 'left', marginLeft: '5px' }}>*</span>
            )
        } else {
            return null;
        }
    }

    render() {
        // Obtener datos de las propiedades
        const { label, minLength, id } = this.props;
        const { isEditing, isRequired } = this.state;

        // Si no se ha especificado máximo de caracteres, máximo 50
        const maxLength = this.props.maxLength === undefined ? 50 : this.props.maxLength;

        // Si no se ha especificado tamaño, por defecto el máximo de caracteres más 5 para que sea un poco más grande y no quede mal
        const size = this.props.size !== null && this.props.size !== undefined ? this.props.size : maxLength + 5;

        // Etiqueta de campo obligatorio
        const requiredLabel = this.renderRequiredLabel(isRequired);

        return (
            <div className="input-panel">

                <label htmlFor={id} className="my-label">{label}</label>

                <div style={{ float: 'left' }}>

                    <input
                        id={id}
                        disabled={!isEditing ? 'disabled' : ''}
                        type="text"
                        className="my-input"
                        onChange={(e) => this.handleChange(e)}
                        onBlur={(e) => this.onBlur(e)}
                        size={size}
                        maxLength={maxLength}
                        minLength={minLength}
                        value={this.state.value}
                        style={{ float: 'left' }}
                        required={isRequired ? 'required' : ''} />

                    {requiredLabel}

                </div>

            </div>
        );
    }

}