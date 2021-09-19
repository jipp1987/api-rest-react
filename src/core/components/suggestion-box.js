import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './styles/inputs.css';

/**
 * Clase CSS para línea seleccionada del suggestionBox.
 */
const SELECTED_CLASS = "suggestion-box-selected-row";

/**
 * Sufijo del id de la tabla de selección.
 */
const SELECTED_TABLE_ID_SUFIX = "_suggestionTable";

/**
 * Fabrica una tabla html para mostrar el listado de sugerencias a partir de una lista de objetos genéricos.
 * 
 * @param {string} parentId Id del componente padre.
 * @param {list} result Lista de objetos genéricos.
 * @param {function} selectAction Acción de selección.
 * @param {string} idFieldName Nombre del campo id para descartar de las columnas mostradas.
 * @returns {table} Devuelve una tabla html. 
 */
function makeTableForSuggestionBox(parentId, result, selectAction, idFieldName) {
    const printColumns = (obj) => {
        return Object.keys(obj).map(function (key) {
            return key !== idFieldName ? <td key={uuidv4()}>{obj[key]}</td> : null;
        })
    };

    const printRows = (list) => {
        return list.map((obj) => {
            const id = uuidv4();
            return <tr key={id} id={id} onClick={() => selectAction(obj)} onMouseEnter={() => forceOnHover(id, parentId)}>{printColumns(obj)}</tr>
        })
    };

    return (
        <table id={parentId + SELECTED_TABLE_ID_SUFIX} className="suggestion-box">
            <tbody>
                {printRows(result)}
            </tbody>
        </table>
    );
}

/**
 * Devuelve las un array de dos posiciones: primero la el componente de tabla asociado al input, y segundo sus filas.
 * 
 * @param {string} parentId Id del componente padre.
 * @returns Si no encuentra la tabla de sugerencias o sus filas, devuelve null.
 */
function find_suggestion_box_with_its_rows(parentId) {
    // Buscar tabla de sugerencias con sus filas
    var suggestion_table = document.getElementById(parentId + SELECTED_TABLE_ID_SUFIX);
    
    if (suggestion_table === undefined || suggestion_table === null) {
        return null;
    }
    
    var rows = null;
    
    if (suggestion_table !== null) {
        rows = suggestion_table.querySelectorAll("tr");
    }
    
    // Comprobar que haya filas que seleccionar
    if (rows === undefined || rows === null || rows.length <= 0) {
        return null;
    }

    return [suggestion_table, rows];
}

/**
 * Forzar onHover de líneas del suggestionBox.
 * 
 * @param {*} id Identificador de la línea actual. 
 * @param {*} parentId Padre.
 */
function forceOnHover(id, parentId) {
    // Buscar tabla de sugerencias con sus filas
    const suggestion_box_with_rows = find_suggestion_box_with_its_rows(parentId);
    
    if (suggestion_box_with_rows === null) {
        return;
    }

    const suggestion_table = suggestion_box_with_rows[0];
    const rows = suggestion_box_with_rows[1];
    
    // Comprobar que haya filas que seleccionar
    if (rows !== undefined && rows !== null && rows.length > 0) {
        // Quitar clase de selección a fila seleccionada previamente
        const selected_row = suggestion_table.querySelectorAll("tr." + SELECTED_CLASS);
        if (selected_row !== undefined && selected_row !== null && selected_row.length > 0) {
            selected_row[0].classList.remove(SELECTED_CLASS);
        }

        // Seleccionar fila actual
        document.getElementById(id).classList.add(SELECTED_CLASS);
    }

}

/**
 * Comprobar las teclas de cursos para navegar entre filas.
 * 
 * @param {*} e 
 */
function checkKey(e, parentId) {
    e = e || window.event;

    // Buscar tabla de sugerencias con sus filas
    const suggestion_box_with_rows = find_suggestion_box_with_its_rows(parentId);

    if (suggestion_box_with_rows === null) {
        return;
    }

    // const suggestion_table = suggestion_box_with_rows[0];
    const rows = suggestion_box_with_rows[1];

    const start = rows[0];
    const end = rows[rows.length - 1];

    // Buscar la fila seleccionada y quitarle la clase css de selección
    var index = null;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute('class') === SELECTED_CLASS) {
            rows[i].classList.remove(SELECTED_CLASS);
            index = i;
            break;
        }
    }

    // up arrow
    if (e.keyCode === 38) {
        // Si no hay fila seleccionada, seleccionar la última
        if (index === null) {
            end.classList.add(SELECTED_CLASS);
        } else {
            // Comprobar que no me salgo de la lista de filas
            if (index > 0) {
                rows[index - 1].classList.add(SELECTED_CLASS);
            } else {
                end.classList.add(SELECTED_CLASS);
            }
        }
    } else if (e.keyCode === 40) {
        // down arrow
        // Si no hay fila seleccionada, seleccionar la primera
        if (index === null) {
            start.classList.add(SELECTED_CLASS);
        } else {
            // Comprobar que no me salgo de la lista de filas
            if (index < rows.length - 1) {
                rows[index + 1].classList.add(SELECTED_CLASS);
            } else {
                start.classList.add(SELECTED_CLASS);
            }
        }
    } else if (e.keyCode === 13) {
        // Tecla enter / intro: seleccionar línea resaltada.
        if (index !== null) {
            rows[index].click();
        }
    }
}

/**
 * Componente SuggestionBox.
 * 
 * @param {*} props 
 * @returns 
 */
export default function SuggestionBox(props) {
    // Estado inicial a partir de las propiedades
    const [value, setValue] = useState(props.entity[props.valueName] !== null && props.entity[props.valueName] !== undefined ? props.entity[props.valueName] : "");
    const [isRequired, setIsRequired] = useState(props.isRequired !== undefined && props.isRequired !== null ? props.isRequired : false);
    const [entity, setEntity] = useState(props.entity);
    const [isEditing, setIsEditing] = useState(props.isEditing);
    const [result, setResult] = useState(null);

    // Obtener datos de las propiedades
    const { label, minLength, id } = props;

    // Rerenderizado utilizando el hook useEffect. Se utiliza para detectar cambios en los valores de estado y forzar el rerender del componente.
    useEffect(() => {
        setIsRequired(props.isRequired);
    }, [props.isRequired]);

    useEffect(() => {
        setIsEditing(props.isEditing);
    }, [props.isEditing]);

    // Para detectar el click fuera del componente
    // useRef crea un objeto ref mutable que se mantendrá con persistente durante todo el ciclo de vida del componente. 
    // useRef es como una “caja” que se puede mantener en una variable mutable en su propiedad .current. Lo utilizaré sobre la división contenedora de input y tabla de resultados.
    const wrapperRef = useRef(null);
    const [isResultTableVisible, setIsResultTableVisible] = useState(false);

    /**
     * Utilizar un efecto para añadir un eventListener al hacer click
     */
    useEffect(() => {
        document.addEventListener("click", handleClickOutside, false);
        // Eliminar el listener después para que no lo lance siempre que se haga click fuera del componente: sólo debe hacerlo la primera vez tras hacer click fuera del componente
        return () => {
            document.removeEventListener("click", handleClickOutside, false);
        };
    });

    /**
     * Función para resetear la entidad si se ha click fuera de la división sin haber seleccionado objeto. 
     */
    const resetEntity = () => {
        // Si no se ha seleccionado elemento (es decir, el id es null), limpiar el componente
        if (entity[props.idFieldName] === null) {
            // Borrar el código seleccionado de la entidad y settearla en el componente
            entity[props.valueName] = null;
            setEntity(entity);
            // Vaciar input
            setValue("");
            setIsResultTableVisible(false);
        }
    }

    /**
     * Función para manejar el click fuera del componente
     */
    const handleClickOutside = event => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsResultTableVisible(false);
            resetEntity();
        }
    };

    /**
     * Manejar presionado de teclas mientras está puesto el foco sobre el input.
     * 
     * @param {event*} e 
     */
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'Tab':
                resetEntity();
                break;

            case 'Enter':
            case 'ArrowUp':
            case 'ArrowDown':
                // Si está visible la tabla de sugerencias, ejecutar la rutina de comprobación de tecla presionada
                if (isResultTableVisible) {
                    checkKey(e, id);
                }
                // Si es la tecla enter, prevenir el comportamiento por defecto para que no haga submit del formulario
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
                break;

            default:
                break;
        }
    }


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

        // Importante: cada vez que escriban hay que resetear la entidad seleccionada
        entity[props.valueName] = newValue;
        // El id lo pongo a null
        entity[props.idFieldName] = null;
        setEntity(entity);

        // Si ha introducido más de un caracter, comenzar acción de suggestion
        if (newValue !== undefined && newValue !== null && newValue.length > 1) {
            setResult(await props.suggestAction(newValue));
            // Visualizar la tabla de resultados
            setIsResultTableVisible(true);
        }
    }

    /**
     * Acción de selección del ítem.
     * 
     * @param {obj} item 
     */
    const selectItem = (item) => {
        // Establecer valor del input así como valor del id y código de la entidad
        setValue(item[props.valueName]);
        entity[props.valueName] = item[props.valueName];
        entity[props.idFieldName] = item[props.idFieldName];
        setEntity(entity);
        // Ocultar tabla de resultados
        setIsResultTableVisible(false);
    }

    // Preparar tabla de sugerencias si hay resultado y si es visible (es decir, no se ha "salido" del componente haciendo click fuera)
    const suggestionTable = isResultTableVisible && (result !== undefined && result !== null && result.length > 0 ?
        makeTableForSuggestionBox(id, result, selectItem, props.idFieldName) : null);

    // Tiene posición relativa porque la tabla interior de suggestion-box debe tenerla absoluta para así solapar cualquier elemento que tenga debajo. 
    return (<div className="input-panel" style={{ position: 'relative' }} ref={wrapperRef}>

        <label htmlFor={id} className="my-label">{label}</label>

        <div style={{ float: 'left' }}>

            <input
                id={id}
                disabled={!isEditing ? 'disabled' : ''}
                onKeyDown={handleKeyDown}
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

        {suggestionTable}

    </div>);

}