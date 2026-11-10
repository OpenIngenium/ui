import { mapGetters, mapActions } from "vuex";
import { getUsername } from "../../common/utils";
import { getElementDef } from "../../common/elem_types";

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
            "stepPaletteBuiltIn",
            "stepPaletteCustom"
        ]),
        canEditElement: function() {
            return false;
        },
        canDeleteElement: function() {
            return false;
        },
        canMoveElement: function() {
            return false;
        },
        canDisableExecuteField: function() {
            return false;
        },
        disableFields: function() {
            return true;
        },
        isAllowEdit: function() {
            return false;
        }
    },
    methods: {
        ...mapActions([
            "fetchStepPaletteBuiltIn",
            "fetchStepPaletteCustom"
        ]),
        getElementMap: function(elementData) {
            return getElementDef(elementData, this.stepPaletteBuiltIn, this.stepPaletteCustom);
        },
        elementDrop: function() {
            return false;
        },
        removeElementCallback: function() {
            return false;
        }
    }
};
