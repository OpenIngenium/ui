import Vue from "vue";
import entryCoreMixin from "./entry-core-mixin";
import asRunMixin from "./as-run-mixin";
import { titlecase } from "../../common/filters.js";


const entryAsRunMixin = Vue.extend(entryCoreMixin).extend(asRunMixin).extend({
    methods: {
        entryDrop: function() {
            return false;
        },
        save: function() {
            return false;
        }
    },
    computed: {
        disableFields: function() {
            return true;
        },
        canDisableExecuteField: function() {
            return true;
        },        
        alwaysEnableInExecution: function() {
            return true;
        },
        canEditElement: function() {
            return false;
        },
    },
    filters: {
        titlecase
    }
});

export default entryAsRunMixin;
