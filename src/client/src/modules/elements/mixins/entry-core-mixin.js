import { mapActions, mapGetters } from "vuex";
import { titlecase, truncate } from "../../common/filters.js";

const entryCoreMixin = {
    props: {
        elementId: {
            type: String,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        mode: {
            type: String,
            required: true
        },
    },
    methods: {
        ...mapActions([
            "setEntryViewStateDetailLevel",
        ]),
        toggleViewLevelTwoThree: function() {
            const detailLevel = this.detailLevel === 2 ? 3 : 2;
            this.setEntryViewStateDetailLevel({
                elementId: this.elementId,
                refIndex: this.index,
                detailLevel: detailLevel
            });
        },
        save: function() {
            throw('You must implement this function in a context-specific mixin');
        },
        entryDrop: function() {
            throw('You must implement this function in a context-specific mixin');
        },
        getBoolElementKey: function(key) {
            return Boolean(this.elementKey(this.elementId, key));
        },
        getElementKey: function(key) {
            return this.elementKey(this.elementId, key);
        },
        getExecutionResultsEntryKey: function(key, defaultType) {
            let result = this.executionResultsEntryKey(this.elementId, this.index, key);
            // guard against undefined, allow caller to specify a default type to match prop type
            if(result === undefined && defaultType) {
                result = defaultType();
            }
            return result;
        },
        getExecutionResultsEntry: function() {
            try {
                return this.executionResultsEntry(this.elementId, this.index);
            }
            catch(error) {
                return undefined;
            }
        }
    },
    computed: {
        ...mapGetters([
            "elementKey",
            "executionInputEntryKey",
            "executionResultsEntryKey",
            "entryViewState",
            "executionResultsEntry",
        ]),
        enableDynamicEntryActions: function() {
            return this.mode !== "as-run";
        },
        enableExecution: function() {
            return this.mode === 'execution' || this.mode === 'as-run';
        },
        isAuthoring: function() {
            return this.mode === 'authoring';
        },
        isLevelTwoDetail: function() {
            return this.detailLevel >= 2;
        },
        isLevelThreeDetail: function() {
            return this.detailLevel === 3;
        },
        isStringCondition: function() {
            return this.type === 'STRING';
        },
        // abstract base functions
        disableFields: function() {
            throw('You must implement this function in a context-specific mixin');
        },
        canDisableExecuteField: function() {
            throw('You must implement this function in a context-specific mixin');
        },
        detailLevel: function() {
            if(this.entryViewState(this.elementId, this.index) !== undefined)
                return this.entryViewState(this.elementId, this.index).detailLevel;
            else
                return 3;
        },
    },
    filters: {
        titlecase,
        truncate
    }
};

export default entryCoreMixin;
