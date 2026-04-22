<template>
    <div v-if="!disabled" class="actions-container">
        <button :disabled="disabled" type="button" class="btn btn-success dynamic_entry_button dynamic_entry_add_button" @click="createEntry">
            <span :style="{left: '1px'}" class="glyphicon glyphicon-plus"></span>
        </button>

        <button :disabled="disabled" type="button" class="btn btn-info dynamic_entry_button dynamic_entry_copy_button" @click="copyEntry">
            <span class="glyphicon glyphicon-copy">
            </span>
            <p>Copy</p>
        </button>

        <button 
            :disabled="disabledOrOne"
            type="button" 
            class="step-draggable dynamic_entry_move_button"
            v-drag-and-drop="{ disabled: disabledOrOne, elemId: elementId, entryIndex: index, draggableType: 'entry' }">
            <span class="glyphicon glyphicon-resize-vertical"></span>
        </button>

        <button :disabled="disabledOrOne" type="button" class="btn btn-danger dynamic_entry_button dynamic_entry_remove_button" @click="deleteEntry">
            <span class="glyphicon glyphicon-remove"></span>
        </button>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "DynamicEntryActions",
        components: {},
        props: {
            elementId: {
                type: String,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            elementPath: {
                type: String,
                required: true
            },
            disableFields: {
                type: Boolean,
                required: true,
            }
        },
        computed: {
            ...mapGetters([
                "numEntries",
                "elementKey",
                "executionRedlineInputKey"
            ]),
            entryCount: function() {
                return this.numEntries(this.elementId, this.index);
            },
            disabledOrOne: function() {
                return this.disabled || this.entryCount === 1;  
            },
            disabled: function() {
                if(this.disableFields) {
                    return true;
                }
                else if (this.elementKey(this.elementId, "preview")) {
                    return true;
                }
                else if (this.elementKey(this.elementId, "run_for_score")) {
                    const status = this.elementKey(this.elementId, "procedure_modification_status");
                    const approval_status = this.executionRedlineInputKey(this.elementId, "approval.status") === "APPROVED";

                    switch(status) {
                        case "MODIFYING":
                            return approval_status;
                        case "NONE":
                        case "ADDED":
                            return false;
                        case "ORIGINAL":
                        case "MODIFIED":
                        case "MODIFYING_OLD":
                        case "DELETED":
                            return true;
                    }
                } else {
                    return false;
                }
            }
        },
        methods: {
            ...mapActions([
                "createEntryInput",
                "copyEntryInput",
                "deleteEntryInput"
            ]),
            createEntry: function(e) {
                // Button exists in a form, do not submit
                e.preventDefault();
                this.createEntryInput({
                    elementId: this.elementId,
                    refIndex: this.index,
                    elementPath: this.elementPath
                });
            },
            copyEntry: function(e) {
                // Button exists in a form, do not submit
                e.preventDefault();
                this.copyEntryInput({
                    elementId: this.elementId,
                    refIndex: this.index,
                    elementPath: this.elementPath
                });
            },
            deleteEntry: function(e) {
                // Button exists in a form, do not submit
                e.preventDefault();
                this.deleteEntryInput({
                    elementId: this.elementId,
                    refIndex: this.index,
                    elementPath: this.elementPath
                });
            }
        }
    };
</script>

<style scoped>
    .actions-container {
        position: relative;
        bottom: 15px;
        display: flex;
        margin: 0 17px -10px;
        justify-content: space-between;
    }

    .dynamic_entry_button {
        outline: none !important;
        padding: 0;
        border-radius: 5px;
        font-size: 14px;
        width: 28px;
        height: 28px;
    }

    .dynamic_entry_add_button {
        color: #3c763d;
        background-color: #dff0d8;
        border-color: rgba(60,118,61,0.25);
    }

    .dynamic_entry_remove_button {
        color: #a94442;
        background-color: #f2dede;
        border-color: rgba(169,68,66,0.25);
    }

    .dynamic_entry_copy_button {
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: inherit;
        padding-left: 5px;
        padding-right: 5px;
    }

    .dynamic_entry_move_button {
        display: inline;
        cursor: move;
    }

    .dynamic_entry_copy_button  p {
        display: inline;
        font-weight: bold;
    }



</style>
