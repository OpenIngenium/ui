// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <div>
        <div class="row data-bar-element condensed container-element" style="margin:0px">
            <div class="col-xs-3 text-left">
                Default Command String
            </div>
            <div class="col-xs-2">
                <select 
                    class="form-control input-sm" 
                    v-model="defaultCmdString"
                    @change="save"
                    :disabled="disableFields"
                    :class="modStyle(elementId, 'default_cmd_string')">
                    <option v-for="option in defaultStringOptions" 
                        :value="option.value" 
                        :key="option.value">
                        {{option.text}}</option>
                </select>
            </div>
            <div class="col-xs-7"></div>
        </div>
        <form>
            <div class="dynamic-elements">
                <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                    v-on:save="save"
                    :element-id="elementId"
                    :index="idx"
                    :mode="mode"
                    :element-path="elementMap.path"
                    entry="manual-gds-entry"
                    :class="modStyle(elementId, `entries.${idx}`)">
                </entries-wrapper>
            </div>
        </form>

        <ing-data-entry
            :showModal="enableTableEntry"
            :entries-length="elementEntryCount"
            :element-id="elementId"
            :mode="mode"
            :level="detailLevel"
            :disableFields="disableFields"
            :canDisableExecuteField="canDisableExecuteField"
            :columnInfos="columnInfos"
            v-on:dataEntryEvent="handleDataEntryEvent"
            ></ing-data-entry>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";
    import IngDataEntry from "../../../common/IngDataEntry.vue";

    export default {
        name: "ManualGdsElement",
        created() {
            this.columnInfos = [
                {
                    name: 'data_path',
                    header: 'Data Path',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 350,
                    enumValues: []
                },
                {
                    name: 'session_id',
                    header: 'Session ID',
                    type: 'integer',
                    defaultValue: 0,
                    executionOnly: true,
                    width: 350,
                    enumValues: []
                }
            ];
        },
        data() {
            return {
                defaultStringOptions: [
                    { text: 'AB', value: 'AB' },
                    { text: 'A', value: 'A' },
                    { text: 'B', value: 'B' }
                ]
            };
        },
        components: {
            'ing-data-entry': IngDataEntry
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            defaultCmdString: {
                get() { 
                    return this.executionInputKey(this.elementId,"default_cmd_string");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "default_cmd_string",
                        value: value
                    });
                }
            },
        },
        methods: {
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            }
        }
    };
</script>
