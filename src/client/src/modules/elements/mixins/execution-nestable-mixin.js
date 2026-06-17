import { mapActions, mapGetters } from "vuex";
import { getUsername } from "../../common/utils";
import { getElementDef } from "../../common/elem_types";

// event.DataTransfer casts all types to string so we need to set
// any undefined vars back to their type so they aren't truthy
function parseDataTransfer(data){
    if (data === "undefined") {
        return undefined;
    } else {
        return data;
    }
}

export default {
    data() {
        return {
            executionId: this.$route.params.executionId,
            currentUser: getUsername(),
        };
    },    
    props: {
        isPreview: {
            type: Boolean,
            default: false,
        }
    },
    computed: {
        ...mapGetters([
            "elementsByParent",
            "elementKey",
            "canParticipate",
            "executionRedlineInputKey",
            "stepPaletteBuiltIn",
            "stepPaletteCustom"
        ]),
        disableFields: function() { 
            return this.isPreview === true || this.elementKey(this.stepData.elem_id, "executed") || !this.canParticipate;  
        },
        canEditElement: function() {
            if (this.isPreview) {
                return false;
            }
            if (!this.canParticipate) {
                return false;
            }
            if (this.elementKey(this.stepData.elem_id, "run_for_score")) {
                let status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                switch (status) {
                case "MODIFYING":
                case "ADDED":
                    return this.executionRedlineInputKey(this.stepData.elem_id, "approval.status") !== "APPROVED";
                case "DELETED":
                case "MODIFYING_OLD":
                case "MODIFIED":
                case "ORIGINAL":
                    return false;
                case "NONE":
                    // Note this should not happen. run_for_score element cannot be NONE
                    return true;
                }
            } else {
                return true;
            }
        },
        canDeleteElement: function() {
            if (this.isPreview) {
                return false;
            }
            if (!this.canParticipate) {
                return false;
            }
            const executed = this.elementKey(this.stepData.elem_id, "executed");
            const executable = this.elementKey(this.stepData.elem_id, "executable");
            if (executed && executable === 'EXECUTED') {
                return false;
            }
            if (this.elementKey(this.stepData.elem_id, "run_for_score")) {
                if (this.stepData.elem_type === 'SECTION') {
                    return true;
                } else {
                    let status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                    switch (status) {
                    case "MODIFYING":
                    case "ADDED":
                    case "DELETED":
                    case "MODIFYING_OLD":
                    case "MODIFIED":
                        return false;
                    case "ORIGINAL":
                    case "NONE":
                        // return true so that ORIGINAL element can be deleted to create a deletion redline
                        return true;
                    }
                }
            } else {
                return true;
            }
        },
        canMoveElement: function() {
            if (this.isPreview) {
                return false;
            }
            if (!this.canParticipate) {
                return false;
            }

            if (this.elementKey(this.stepData.elem_id, "run_for_score")) {
                let status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                switch (status) {
                case "MODIFYING":
                case "ADDED":
                case "DELETED":
                case "MODIFYING_OLD":
                case "MODIFIED":
                case "ORIGINAL":
                    return false;
                case "NONE":
                    // Note this should not happen. run_for_score element cannot be NONE
                    return true;
                }
            } else {
                return true;
            }
        },
    },
    methods: {
        ...mapActions([
            "createElement",
            "moveElement",
            "copyElement",
            "removeElement",
            "fetchStepPaletteBuiltIn",
            "fetchStepPaletteCustom"
        ]),
        isAllowEdit: function() {
            return this.canParticipate;
        },
        removeElementCallback: async function() {
            await this.removeElement({elementId: this.stepData.elem_id});
        },
        getElementMap: function(elementData) {
            let elemMap = getElementDef(elementData, this.stepPaletteBuiltIn, this.stepPaletteCustom);
            if (!elemMap) {
                return null;
            }
            // special case for procedure section in execution
            if (elemMap.name === 'PROCEDURE_SECTION') {
                if (elementData.imported === false) {
                    // make a copy to avoid changing the value in the map
                    elemMap = JSON.parse(JSON.stringify(elemMap));
                    elemMap.isNestable = false;
                }
            }
            return elemMap;
        },
        elementDrop: async function(event) {
            const insertAfterId = event.target.getAttribute('dropafterid');
            const parentId = event.target.getAttribute('parentid') || "";
            const level = event.target.getAttribute('level');
            const draggedElementId = parseDataTransfer(event.dataTransfer.getData('elemId'));
            const elementPath = parseDataTransfer(event.dataTransfer.getData('elementPath'));
            const copyElement = parseDataTransfer(event.dataTransfer.getData('copy'));

            // If the element comes from within the canvas, move or copy it
            if (draggedElementId) {

                if (copyElement) {
                    await this.copyElement({elementId: draggedElementId, insertAfterId: insertAfterId, level: level});
                } else {
                    // Dont allow insertion after self.
                    if (draggedElementId === insertAfterId) {
                        return;
                    }
                    await this.moveElement({elementId: draggedElementId, insertAfterId: insertAfterId, level: level});
                }
            // Else if an element originates in the palette, create it
            } else if (elementPath) {
                await this.createElement({elementType: elementPath, insertAfterId: insertAfterId,  level: level});
            }
        }
    }
};
