import { mapActions, mapGetters } from "vuex";

const executionMixin = {
    computed: {
        ...mapGetters([
            "elementKey",
            "executionRedlineInputKey",
            "canParticipate"
        ]),
        disableFields: function() {
            if (this.elementKey(this.elementId, "executed")) {
                return true;
            } else if (this.elementKey(this.elementId, "preview")) {
                return true;
            } else if(!this.canParticipate) {
                return true;
            } else if (this.elementKey(this.elementId, "run_for_score")) {
                const status = this.elementKey(this.elementId, "procedure_modification_status");
                const approval_status = this.executionRedlineInputKey(this.elementId, "approval.status") === "APPROVED";

                switch(status) {
                case "MODIFYING":
                case "ADDED":
                    return approval_status;
                case "ORIGINAL":
                case "NONE":
                case "MODIFIED":
                case "MODIFYING_OLD":
                case "DELETED":
                    return true;
                }
            } else {
                return false;
            }
        },
        canDisableExecuteField: function() {
            if(this.elementKey(this.elementId, "executed")) {
                return true;
            } else if(this.elementKey(this.elementId, "preview")) {
                return true;
            } else if(!this.canParticipate) {
                return true;
            } else if(this.elementKey(this.elementId, "run_for_score")) {
                const status = this.elementKey(this.elementId, "procedure_modification_status");

                switch(status) {
                case "DELETED":
                case "MODIFYING_OLD":
                case "MODIFIED":
                    return true;
                case "NONE":
                case "ADDED":
                case "ORIGINAL":
                case "MODIFYING":
                    return false;
                }
            } else {
                return false;
            }
        }
    }
};

export default executionMixin;
