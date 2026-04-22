const asRunMixin = {
    computed: {
        disableFields: function() {
            return true;
        },
        canDisableExecuteField: function() {
            return true;
        }
    }
};

export default asRunMixin;
