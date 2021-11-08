/**
 * Mapa de vistas cargadas con react lazy. Se utilizan desde el panel de pestañas para cargar las vistas. Contiene la ruta absoluta de cada componente de vista, pero no incluye la 
 * url base "src/" definida en jsconfig.json, porque entonces la carga dinámica no funciona bien (es la función de carga dinámica la que debe incluir la url base).
 */
const VIEW_MAP = {
    'ClienteView': 'impl/view/cliente-view',
    'TipoClienteView': 'impl/view/tipo-cliente-view',
    'UsuarioView': 'impl/view/usuario-view',
}

// Exportar como módulo.
module.exports = { VIEW_MAP };