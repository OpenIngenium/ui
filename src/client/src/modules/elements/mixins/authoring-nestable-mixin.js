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
            version: this.$route.params.version,
            procedureId: this.$route.params.procedureId,
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
            "procedureDetails"
        ]),
        isAllowEdit: function() {
            return this.$route.query.hasOwnProperty('update') && this.workingCopy && (
                this.procedureDetails.locked_by === undefined ||
                this.procedureDetails.locked_by === '' ||
                this.procedureDetails.locked_by === this.currentUser);
        },
        workingCopy: function() { return this.version === "0"; },
        canEditElement: function() { return this.isAllowEdit; },
        canDeleteElement: function() { return this.isAllowEdit; },
        canMoveElement: function() { return this.isAllowEdit; },
        disableFields: function() { return !this.isAllowEdit; },
    },
    methods: {
        ...mapActions([
            "createElement",
            "moveElement",
            "copyElement",
            "removeElement",
        ]),

        removeElementCallback: async function() {
            if (this.isAllowEdit) {
                await this.removeElement({elementId: this.stepData.elem_id});
            }
        },
        getElementMap: function(elementData) {
            let elemMap = getElementDef(elementData);
            // special case for procedure section in authoring
            if (elemMap.name === 'PROCEDURE_SECTION') {
                // make a copy to avoid changing the value in the map
                elemMap = JSON.parse(JSON.stringify(elemMap));
                elemMap.isNestable = false;
            }
            return elemMap;
        },
        elementDrop: async function(event) {
            if (this.isAllowEdit) {
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
    }
};
