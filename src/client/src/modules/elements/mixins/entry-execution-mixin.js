import { mapActions, mapGetters } from "vuex";
import Vue from "vue";
import { titlecase } from "../../common/filters.js";
import entryCoreMixin from "./entry-core-mixin.js";
import executionMixin from "./execution-mixin";

const entryExecutionMixin = Vue.extend(entryCoreMixin).extend(executionMixin).extend({
    methods: {
        ...mapActions([
            "editEntryInput",
            "editEntryArray",
            "saveElementInput",
            "moveEntry",
        ]),
        entryDrop: function(event) {
            const insertAfterIndex = event.target.getAttribute('dropAfterIndex');
            const draggedEntryIndex = event.dataTransfer.getData('entryIndex');

            this.moveEntry({
                insertAfterIndex: insertAfterIndex,
                draggedEntryIndex: draggedEntryIndex,
                elementId: this.elementId
            });
        },
        save: function() {
            this.$emit('save');
        }
    },
    computed: {
        ...mapGetters([
            "elementKey",
            "executionRedlineInputKey"
        ]),
        canEditElement: function() { return true; },
        alwaysEnableInExecution: function() { return false; }
    },
    filters: {
        titlecase
    }
});

export default entryExecutionMixin;
