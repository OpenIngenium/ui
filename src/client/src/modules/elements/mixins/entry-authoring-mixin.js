import { mapActions, mapGetters } from "vuex";
import Vue from "vue";
import { titlecase } from "../../common/filters.js";
import entryCoreMixin from "./entry-core-mixin.js";
import authoringMixin from "./authoring-mixin.js";
import { getUsername } from '../../common/utils.js';

const entryAuthoringMixin = Vue.extend(entryCoreMixin).extend(authoringMixin).extend({
    data() {
        return {
            version: this.$route.params.version,
            procedureId: this.$route.params.procedureId,
            currentUser: getUsername(),
        };
    },
    computed: {
        ...mapGetters([
            "elementKey",
            "procedureDetails",
        ]),

        alwaysEnableInExecution: function() { return !this.workingCopy; },
        canEditElement: function() { return this.workingCopy; },
        enableDynamicEntryActions: function() { return this.workingCopy; },
    },
    methods: {
        ...mapActions([
            "editEntryInput",
            "editEntryArray",
            "moveEntry"
        ]),
        entryDrop: function(event) {
            if (this.workingCopy) {
                const insertAfterIndex = event.target.getAttribute('dropAfterIndex');
                const draggedEntryIndex = event.dataTransfer.getData('entryIndex');
                this.moveEntry({
                    insertAfterIndex: insertAfterIndex,
                    draggedEntryIndex: draggedEntryIndex,
                    elementId: this.elementId
                });
            }
        },
        save: function() {
            if (this.workingCopy) {
                this.$emit('save');
            }
        }
    },
    filters: {
        titlecase
    }
});

export default entryAuthoringMixin;
