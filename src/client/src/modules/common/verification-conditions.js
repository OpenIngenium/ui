export default {
    VERIFICATION_CONDITIONS: {
        "GREATER_THAN": {
            label: "Greater Than", indicator: ">",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "LESS_THAN": {
            label: "Less Than", indicator: "<",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "GREATER_THAN_OR_EQUAL": {
            label: "Greater Than Or Equal", indicator: "=>",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "LESS_THAN_OR_EQUAL": {
            label: "Less Than Or Equal", indicator: "<=",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "CONTAINS": {
            label: "Contains", indicator: "Contains",
            allowedType: ["string", "enum", "boolean"]
        },
        "EQUAL": {
            label: "Equal", indicator: "=",
            allowedType: ["string", "enum", "boolean", "unsigned", "integer", "float", "time"]
        },
        "NOT_EQUAL": {
            label: "Not Equal", indicator: "!=",
            allowedType: ["string", "enum", "boolean", "unsigned", "integer", "float", "time"]
        },
        "RECORD": {
            label: "Record", indicator: "Record",
            allowedType: ["string", "enum", "boolean", "unsigned", "integer", "float", "time"]
        },
        "INCLUSIVE_RANGE": {
            label: "Inclusive Range", indicator: "Inclusive",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "EXCLUSIVE_RANGE": {
            label: "Exclusive Range", indicator: "Exclusive",
            allowedType: ["unsigned", "integer", "float", "time"]
        },
        "NOT_PRESENT": {
            label: "Not Present", indicator: "Not Present",
            allowedType: ["string", "enum", "boolean", "unsigned", "integer", "float", "time"]
        }
    }
};
