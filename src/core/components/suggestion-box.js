import React, { useState, useEffect } from 'react';

import './styles/inputs.css';

export default function SuggestionBox(props) {
    // Estado inicial a partir de las propiedades
    const [value, setValue] = useState(props.entity[props.valueName] !== null && props.entity[props.valueName] !== undefined ? props.entity[props.valueName] : "");
    const [isRequired, setIsRequired] = useState(props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false);
    const [entity, setEntity] = useState(props.entity);
    const [isEditing, setIsEditing] = useState(props.isEditing);
    const [result, setResult] = useState(null);

    // Rerenderizado utilizando el hook useEffect. Se utiliza para detectar cambios en los valores de estado y forzar el rerender del componente.
    useEffect(() => {
        setIsRequired(props.isRequired);
    }, [props.isRequired]);
    
    useEffect(() => {
        setIsEditing(props.isEditing);
    }, [props.isEditing]);

    useEffect(() => {
    }, [result]);

    // Obtener datos de las propiedades
    const { label, minLength, id } = props;

    // Si no se ha especificado máximo de caracteres, máximo 50
    const maxLength = props.maxLength === undefined ? 50 : props.maxLength;

    // Si no se ha especificado tamaño, por defecto el máximo de caracteres más 5 para que sea un poco más grande y no quede mal
    const size = props.size !== null && props.size !== undefined ? props.size : maxLength + 5;

    /**
     * Manejar onChange.
     * 
     * @param {event} event 
     */
    const handleChange = async (event) => {
        // Tras un cambio en el input, actualizo también la entidad del modelo
        var newValue = event.target.value;
        
        // El cambio de estado es tanto del valor del input como de la entidad, para mantenerla actualizada 
        setValue(newValue);
        // entity[props.valueName] = newValue;
        // setEntity(entity);

        // Si ha introducido más de un caracter, comenzar acción de suggestion
        if (newValue !== undefined && newValue !== null && newValue.length > 1) {
            setResult(await props.suggestAction(newValue));
        }
    }

    return (<div className="input-panel">

        <label htmlFor={id} className="my-label">{label}</label>

        <div style={{ float: 'left' }}>

            <input
                id={id}
                disabled={!isEditing ? 'disabled' : ''}
                type="text"
                className="my-input"
                onChange={handleChange}
                size={size}
                maxLength={maxLength}
                minLength={minLength}
                value={value}
                style={{ float: 'left' }}
                required={isRequired ? 'required' : ''} />

        </div>

    </div>);

}