<template>
    <div class="cmd_builder_arguments_inside_form">
        <div v-if="this.argsPresent()" style="margin-left: 10px; margin-right: 10px;">
            <div class="row titles-row">
                <div class="col-xs-3">Input</div>
                <div class="col-xs-1">Name</div>
                <div class="col-xs-1">Default</div>
                <div class="col-xs-1">Type</div>
                <div class="col-xs-1">Size</div>
                <div class="col-xs-1">Repeat</div>
                <div class="col-xs-2">Ranges</div>
                <div class="col-xs-2">Description</div>
            </div>

            <div class="row">
                <div class="col-xs-12"><b>Arguments</b></div>
            </div>
            <cmd-constructor-entry-args 
                :arguments="selectedCmdObjArgs"
                v-on:updateArgEvent="updateArg"
                arg-type="regular"></cmd-constructor-entry-args>

            <div class="row" v-if="repeatMax > 0">
                <div class="col-xs-12">
                    <b>Repeat Arguments</b>
                    (min: {{repeatMin}} max: {{repeatMax}})
                    <span class="add_section" v-if="selectedCmdObjRepeatArgsLength < repeatMax">
                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="addSection">
                            <span class="glyphicon glyphicon-plus"></span>
                        </button>
                    </span>
                </div>
            </div>
            <cmd-constructor-repeat-sections
                v-on:updateRepeatArgEvent="updateRepeatArg"
                v-if="selectedCmdObj.repeat_max > 0"></cmd-constructor-repeat-sections>
        </div>
        <div v-if="!this.argsPresent()">
            <div style="margin:50px 0; font-size:16px; font-weight:bold; text-align:center;">No Arguments</div>
        </div>
    </div>
</template>

<script>
    import CmdConstructorRepeatSections from "./CmdConstructorRepeatSections.vue";
    import CmdConstructorEntryArgs from "./CmdConstructorEntryArgs.vue";
    import { mapGetters, mapActions } from "vuex";

    export default {
        name: 'CmdConstructorArgs',
        components: {
            CmdConstructorRepeatSections,
            CmdConstructorEntryArgs
        },
        computed: {
            ...mapGetters([
                "selectedCmdObj",
                "selectedCmdObjArgs",
                "selectedCmdObjRepeatArgs",
            ]),
            selectedCmdObjRepeatArgsLength: function() {
                return this.selectedCmdObjRepeatArgs.length;
            },
            repeatMin: function() {
                return this.selectedCmdObj.repeat_min;
            },
            repeatMax: function() {
                return this.selectedCmdObj.repeat_max;
            },
        },
        methods: {
            ...mapActions([
                "setArg",
                "setRepeatArg",
                "addSection",
            ]),
            argsPresent: function() {
                return this.selectedCmdObj.arguments.length > 0;
            },
            updateArg: function(payload) {
                this.setArg(payload.data);

                this.$emit('updateCmdString', payload);
            },
            updateRepeatArg: function(payload) {
                this.setRepeatArg(payload.data);

                this.$emit('updateCmdString', payload);
            }
        }
    };
</script>


<style scoped>
    .cmd_builder_arguments_inside_form{
        border-top:1px solid #DDDDDD;
        border-bottom:1px solid #DDDDDD;
        margin-left:auto;
        margin-right:auto;
        padding-top:10px;
    }

    .titles-row {
        margin-bottom: 15px;
        font-size: 12px;
        font-weight: bold;
        padding-bottom:10px;
        border-bottom: 2px solid #DDDDDD;
        word-break: break-word;
        overflow-wrap: anywhere;
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
        background-color:#dff0d8;
        color:#3c763d;
        border-color: rgba(60, 118, 61, 0.25);
    }
</style>
