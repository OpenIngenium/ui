<template>
    <form>
        <div class="dynamic-elements">
            <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                v-on:save="save"
                :element-id="elementId"
                :index="idx"
                :mode="mode"
                :element-path="elementMap.path"
                entry="manual-input-entry">
            </entries-wrapper>
        </div>

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
    </form>
</template>

<script>
    import IngDataEntry from "../../../common/IngDataEntry.vue";

    export default {
        name: "ManualInputElement",
        components: {
            'ing-data-entry': IngDataEntry
        },
        created() {
            this.columnInfos = [
                {
                    name: 'name',
                    header: 'Name',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 116,
                    enumValues: [],
                },
                {
                    name: 'type',
                    header: 'Type',
                    type: 'string',
                    defaultValue: 'STRING',
                    executionOnly: false,
                    width: 116,
                    enumValues: ['STRING', 'INTEGER', 'FLOAT'],
                },
                {
                    // split into two columns for display - IngDataEntry.vue joins them back into
                    // the [] / [v1] / [v1,v2] array verification_values is stored as, based on
                    // the verification_condition column below
                    name: 'verification_values',
                    header: 'Verify Value 1',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 58,
                    verificationValuePart: 'value1',
                    enumValues: [],
                },
                {
                    name: 'verification_values',
                    header: 'Verify Value 2',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 58,
                    verificationValuePart: 'value2',
                    enumValues: [],
                },
                {
                    name: 'verify_on',
                    header: 'Verify On',
                    type: 'string',
                    defaultValue: 'VALUE',
                    executionOnly: false,
                    width: 116,
                    enumValues: ['VALUE', 'CHANGE']
                },
                {
                    name: 'verification_condition',
                    header: 'Verify Condition',
                    type: 'string',
                    defaultValue: 'RECORD',
                    executionOnly: false,
                    width: 116,
                    enumValues: ['CONTAINS', 'EQUAL', 'NOT_EQUAL', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL', 'NOT_EQUAL', 'RECORD', 'INCLUSIVE_RANGE', 'EXCLUSIVE_RANGE'],
                },
                {
                    name: 'actual_value',
                    header: 'Actual Value',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: true,
                    width: 116,
                    enumValues: []
                },
            ];
        },
        methods: {
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            }
        }
    };
</script>
