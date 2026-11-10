import Vue from "vue";
import elementCoreMixin from "./element-core-mixin";
import executionMixin from "./execution-mixin";
import { mapActions, mapGetters } from "vuex";


const elementExecutionMixin = Vue.extend(elementCoreMixin).extend(executionMixin).extend({
    computed: {
        ...mapGetters([
            "executionMetaDataKey",
            "executionRedlineInputKey",
            "elementKey"
        ]),
        executed: function() { return this.getBoolElementKey('executed'); },
    },
    methods: {
        ...mapActions([
            "saveElementInput",
            "saveRedlineInput",
            "editElementInput",
            "editElementArray",
        ]),
        getExecutionMetaDataKey: function(key) {
            return this.executionMetaDataKey(this.elementId, key);
        },
        save: function() {
            this.saveElementInput({
                elementPath: this.elementMap.path,
                elementId: this.elementId,
            });
        },
        setElementInput: function(key, value){
            this.editElementInput({
                elementId: this.elementId,
                keyString: key,
                value
            });
        }
    }
});

export default elementExecutionMixin;
