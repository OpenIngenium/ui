import Vue from "vue";
import elementCoreMixin from "./element-core-mixin";
import authoringMixin from "./authoring-mixin.js";
import { mapActions } from "vuex";


const elementAuthoringMixin = Vue.extend(elementCoreMixin).extend(authoringMixin).extend({
    data() {
        return {
            version: this.$route.params.version,
            procedureId: this.$route.params.procedureId,
        };
    },
    computed: {     
        executed: function() { return false; },
    },
    methods: {
        ...mapActions([
            "saveElementInput",
            "editElementInput",
            "editElementArray",
        ]),
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
