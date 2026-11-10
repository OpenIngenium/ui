import Vue from "vue";
import elementCoreMixin from "./element-core-mixin";
import authoringMixin from "./authoring-mixin.js";
import { mapActions, mapGetters } from "vuex";


const elementAuthoringMixin = Vue.extend(elementCoreMixin).extend(authoringMixin).extend({
    data() {
        return {
            version: this.$route.params.version,
            procedureId: this.$route.params.procedureId,
        };
    },
    computed: {
        ...mapGetters([
            "executionMetaDataKey"
        ]),
        executed: function() { return false; },
    },
    methods: {
        ...mapActions([
            "saveElementInput",
            "editElementInput",
            "editElementArray",
        ]),
        getExecutionMetaDataKey: function(key) {
            return this.executionMetaDataKey(this.elementId, key);
        },
        save: function() {
            if (this.workingCopy) {
                this.saveElementInput({
                    elementPath: this.elementMap.path,
                    elementId: this.elementId,
                });
            }
        },
        setElementInput: function(key, value){
            if (this.workingCopy) {
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: key,
                    value
                });
            }
        }
    }
});

export default elementAuthoringMixin;
