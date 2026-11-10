<template>
    <div class="cmd_builder_repeat_section">
        <div 
            v-if="showRemove"
            class="remove_section">
            <button 
                type="button" 
                class="btn btn-danger"
                @click="removeSectionClick">
                <span class="glyphicon glyphicon-remove"></span>
            </button>
        </div>
        <cmd-constructor-entry-args
            :arguments="this.section"
            :section-index="this.sectionIndex"
            v-on:updateArgEvent="updateRepeatArgEvent"
            arg-type="repeat"></cmd-constructor-entry-args>
        <div 
            v-if="showAdd"
            class="add_section">
            <button 
                type="button"
                class="btn btn-danger"
                @click="addSection">
                <span class="glyphicon glyphicon-plus"></span>
            </button>
        </div>
    </div>
</template>

<script>
    import CmdConstructorEntryArgs from "./CmdConstructorEntryArgs.vue";
    import { mapGetters, mapActions } from "vuex";

    export default {
        name: 'CmdConstructorRepeatSection',
        components: {
            CmdConstructorEntryArgs
        },
        data() {
            return {
                add: true
            };
        },
        props: {
            section: {
                type: Array
            },
            sectionIndex: {
                type: Number
            }
        },
        computed: {
            ...mapGetters([
                "selectedCmdObj",
                "selectedCmdObjRepeatArgs"
            ]),
            showAdd: function() {
                const max = this.selectedCmdObj.repeat_max;
                return max > this.selectedCmdObjRepeatArgs.length && this.sectionIndex === this.selectedCmdObjRepeatArgs.length-1;
            },
            showRemove: function() {
                const max = this.selectedCmdObj.repeat_max;
                const min = this.selectedCmdObj.repeat_min;
                return max > 1 && min < this.selectedCmdObjRepeatArgs.length;
            },
        },
        methods: {
            ...mapActions([
                "addSection",
                "removeSection"
            ]),
            removeSectionClick: function(){
                this.removeSection(this.sectionIndex);
            },
            updateRepeatArgEvent: function(payload) {
                this.$emit('updateRepeatArgEvent', payload);
            }
        }
    };
</script>

<style scoped>
    .cmd_builder_repeat_section {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding-top: 10px;
        margin-bottom:10px;
    }
    .add_section button {
        outline: none !important;
        border-radius: 50%;
        padding: 0;
        font-size: 14px;
        width: 28px;
        height: 28px;
        z-index: 10;
        opacity: 1;
        margin-left: 10px;
        margin-bottom:10px;
        background-color:#dff0d8;
        color:#3c763d;
        border-color: rgba(60, 118, 61, 0.25);
    }
    .remove_section button {
        outline: none !important;
        border-radius: 50%;
        font-size: 14px;
        width: 28px;
        height: 28px;
        z-index: 10;
        opacity: 1;
        padding: 0;
        margin-left: 10px;
        background-color:#f2dede;
        color:#a94442;
        border-color: rgba(169, 68, 66, 0.25);
    }
</style>
