import React from "react";
import PropTypes from "prop-types";
// import { focusNextElement } from "../utils/helper-utils";
import { v4 as uuidv4 } from 'uuid';

import './styles/inputs.css';

/**
 * Componente de input de texto.
 */
export default class MyInput extends React.Component {

    static propTypes = {
        entity: PropTypes.object.isRequired,
        valueName: PropTypes.string.isRequired,
        label: PropTypes.object.isRequired,
        size: PropTypes.number,
        maxLength: PropTypes.number,
        minLength: PropTypes.number,
        isEditing: PropTypes.bool,
        isRequired: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.id = uuidv4();

        // Compruebo si ha llegado algún valor de la propia entidad, sino lo inicializo en string vacío. Si no lo hago se produce un error en javascript.
        var value = props.entity[props.valueName] !== null && props.entity[props.valueName] !== undefined ? props.entity[props.valueName] : "";
        var isRequired = props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false;

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
     * Pinta un label para campos obligatorios.
     * @param {*} isRequired 
     * @returns 
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
        const id = this.id;
        const { label, minLength } = this.props;
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