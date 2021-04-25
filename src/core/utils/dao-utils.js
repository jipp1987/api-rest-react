/**
 * Tipos de filtro.
 */
 const FilterTypes = {
	EQUALS: "EQUALS",
    NOT_EQUALS: "NOT_EQUALS",
    LIKE: "LIKE",
    NOT_LIKE: "NOT_LIKE",
    IN: "IN",
    NOT_IN: "NOT_IN",
    LESS_THAN: "LESS_THAN",
    LESS_THAN_OR_EQUALS: "LESS_THAN_OR_EQUALS",
    GREATER_THAN: "GREATER_THAN",
    GREATER_THAN_OR_EQUALS: "GREATER_THAN_OR_EQUALS",
    BETWEEN: "BETWEEN"
}

/**
 * Tipos de operadores.
 */
 const OperatorTypes = {
	AND: "AND",
    OR: "OR"
}

/**
 * Tipos de OrderBy.
 */
 const OrderByTypes = {
	ASC: "ASC",
    DESC: "DESC"
}

/**
 * Tipos de joins.
 */
const JoinTypes = {
    INNER_JOIN: "INNER_JOIN",
    LEFT_JOIN: "LEFT_JOIN",
    RIGHT_JOIN: "RIGHT_JOIN"
}

/**
 * Cláusula de filtrado para consultas contra la API.
 */
class FilterClause {

    // Constructor.
    constructor(field_name, filter_type, object_to_compare, table_alias = null, operator_type = null, start_parenthesis = null, end_parenthesis = null) {
        /**
         * Nombre del campo.
         */
        this.field_name = field_name;
        /**
         * Tipo de filtro.
         */
        this.filter_type = filter_type;
        /**
         * Objecto a comparar.
         */
        this.object_to_compare = object_to_compare;
        /**
         * Alias de tabla.
         */
        this.table_alias = table_alias;
        /**
         * Tipo de operador.
         */
        this.operator_type = operator_type == null ? OperatorTypes.AND : operator_type;
        /**
         * Paréntesis de inicio.
         */
        this.start_parenthesis = start_parenthesis == null ? 0 : start_parenthesis;
        /**
         * Paréntesis del final.
         */
        this.end_parenthesis = end_parenthesis == null ? 0 : end_parenthesis;
    }

}

/**
 * Cláusula de order by.
 */
class OrderByClause {

    // Constructor.
    constructor(field_name, order_by_type, table_alias = null) {
        /**
        * Nombre del campo.
        */
        this.field_name = field_name;
        /**
         * Tipo de orderby.
         */
        this.order_by_type = order_by_type;
        /**
         * Alias de tabla.
         */
        this.table_alias = table_alias;
    }

}

/**
 * Cláusula de join.
 */
class JoinClause {

    // Constructor.
    constructor(table_name, join_type, table_alias) {
        /**
        * Nombre de la tabla.
        */
        this.table_name = table_name;
        /**
         * Tipo de join.
         */
        this.join_type = join_type;
        /**
         * Alias de tabla.
         */
        this.table_alias = table_alias;
    }

}

/**
 * Cláusula de group by.
 */
class GroupByClause {

    // Constructor.
    constructor(field_name, table_alias) {
        /**
        * Nombre del campo.
        */
        this.field_name = field_name;
        /**
         * Alias de tabla.
         */
        this.table_alias = table_alias;
    }

}

/**
 * Cláusula de select.
 */
 class FieldClause {

    // Constructor.
    constructor(field_name, table_alias) {
        /**
        * Nombre del campo.
        */
        this.field_name = field_name;
        /**
         * Alias de tabla.
         */
        this.table_alias = table_alias;
    }

}

// Exportar como módulo.
module.exports = { FieldClause, JoinClause, FilterClause, OrderByClause, GroupByClause, JoinTypes, FilterTypes, OrderByTypes, OperatorTypes }