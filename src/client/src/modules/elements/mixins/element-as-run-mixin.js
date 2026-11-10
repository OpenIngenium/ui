import Vue from "vue";
import elementCoreMixin from "./element-core-mixin";
import asRunMixin from "./as-run-mixin";
import { mapGetters } from "vuex";


const elementAsRunMixin = Vue.extend(elementCoreMixin).extend(asRunMixin).extend({
    computed: {
        ...mapGetters([
            "executionMetaDataKey",
            "elementKey"
        ]),

        disableFields: function() {
            return true;
        }, 
        canDisableExecuteField: function() {
            return true;
        },
        executed: function() { 
            return this.getBoolElementKey('executed'); 
        },
    },
    methods: {
        getExecutionMetaDataKey: function(key) {
            return this.executionMetaDataKey(this.elementId, key);
        },
        save: function() {
            return false;
        },
        setElementInput: function() {
            return false;
        }
    }
});

export default elementAsRunMixin;
