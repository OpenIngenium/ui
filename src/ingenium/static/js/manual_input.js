ING.manual_input = {};

ING.manual_input.verification_conditions = [
    { condition: "GREATER_THAN", friendly: "Greater Than", field_type: "INPUT" },
    { condition: "LESS_THAN", friendly: "Less Than", field_type: "INPUT" },
    { condition: "GREATER_THAN_OR_EQUAL", friendly: "Greater Than or Equal", field_type:  "INPUT"},
    { condition: "LESS_THAN_OR_EQUAL", friendly: "Less Than or Equal", field_type: "INPUT" },
    { condition: "EQUAL", friendly: "Equal", field_type: "INPUT" },
    { condition: "NOT_EQUAL", friendly: "Not Equal", field_type: "INPUT" },
    { condition: "CONTAINS", friendly: "Contains", field_type: "INPUT" },
    { condition: "RECORD", friendly: "Record", field_type: "NONE" },
    { condition: "NOT_PRESENT", friendly: "Not Present", field_type: "NONE" },
    { condition: "INCLUSIVE_RANGE", friendly: "Inclusive Range", field_type: "RANGE" },
    { condition: "EXCLUSIVE_RANGE", friendly: "Exclusive Range", field_type: "RANGE" },
]

ING.manual_input.initialize_dynamic_elements = function($elements) {
    $elements.each(function(i, element) {
        /* initialize change listener for changing verification_condition */
        $(element).find('select[name="verification_condition"]').change(function() {
            var option = {};
            for (var i=0; i < ING.manual_input.verification_conditions.length; i++) {
                if (ING.manual_input.verification_conditions[i].condition === $(this).val()) {
                    option = ING.manual_input.verification_conditions[i];
                }
            }
            /* hide show verification value fields based on verification condition */
            $(element).find('input.verification_value').toggle(option.field_type == 'INPUT' || option.field_type == 'RANGE');
            $(element).find('span.verification_value_range').toggle(option.field_type == 'RANGE');
            $(element).find('input.verification_value_to').toggle(option.field_type == 'RANGE');
            $(element).find('label.verification_value_none').toggle(option.field_type == 'NONE');
        }).trigger('change');
    });
}
