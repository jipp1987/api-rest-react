import React from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import Loader from 'react-loader-spinner';

/**
 * Rastreador de promesas para mantener un indicador de "cargando".
 * 
 * @param {*} props 
 * @returns LoadingIndicator
 */
export default function LoadingIndicator(props) {
    const { promiseInProgress } = usePromiseTracker();

    return promiseInProgress &&
        <div
            style={{
                width: "100%",
                height: "100",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Loader type="ThreeDots" color="#C0C0C0" height="100" width="100" />
        </div>
};