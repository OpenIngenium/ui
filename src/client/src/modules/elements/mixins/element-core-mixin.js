import { mapGetters, mapActions } from "vuex";

const elementCoreMixin = {
    props: {
        elementId: {
            type: String,
            required: true
        },
        elementMap: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            required: true
        },
        showTableEntry: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    computed: {
        ...mapGetters([
            "elementKey",
            "executionInputKey",
            "executionResultsKey",
            "elementViewState",
            "executionRedlineInputKey",
            "numEntries"
        ]),
        isLevelTwoDetail: function() {
            return this.detailLevel >= 2;
        },
        isLevelThreeDetail: function() {
            return this.detailLevel === 3;
        },
        enableDynamicEntryActions: function() {
            return this.mode !== "as-run";
        },
        isAuthoring: function() {
            return this.mode === 'authoring';
        },
        enableExecution: function() {
            return this.mode === 'execution' || this.mode === 'as-run';
        },
        elementEntryCount: function() {
            return this.numEntries(this.elementId);
        },
        detailLevel: function() {
            return this.elementViewState(this.elementId).detailLevel;
        },
        // abstract base functions
        disableFields: function() {
            throw('You must implement this method in a context-specific mixin');
        },
        canDisableExecuteField: function() {
            throw('You must implement this method in a context-specific mixin');
        },
        enableTableEntry: function() {
            return this.showTableEntry;
        }
    },
    methods: {
        ...mapActions([
            "setElementViewStateDetailLevel"
        ]),
        getBoolElementKey: function(key) {
            return Boolean(this.elementKey(this.elementId, key));
        },
        getElementKey: function(key) {
            return this.elementKey(this.elementId, key);
        },
        getExecutionInputKey: function(key) {
            return this.executionInputKey(this.elementId, key);
        },
        toggleViewLevelTwoThree: function() {
            const detailLevel = this.detailLevel === 2 ? 3 : 2;
            this.setElementViewStateDetailLevel({
                elementId: this.elementId,
                detailLevel: detailLevel
            });
        },
        // abstract base functions
        save: function() {
            throw('You must implement this method in a context-specific mixin');
        },
        setElementInput: function() {
            throw('You must implement this method in a context-specific mixin');
        }
    }
};

export default elementCoreMixin;
