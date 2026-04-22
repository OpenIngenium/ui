import { mapActions, mapGetters } from "vuex";

const authoringMixin = {
    computed: {
        disableFields: function() {
            return !this.workingCopy || !this.$route.query.hasOwnProperty('update'); 
        },
        canDisableExecuteField: function() {
            // execution time input should be disabled for authoring
            return true;
        },
        workingCopy: function() { return this.version === "0"; },
    }
};

export default authoringMixin;
