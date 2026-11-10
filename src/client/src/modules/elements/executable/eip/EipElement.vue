<template>
    <form>
        <div v-if="isLevelTwoDetail">
            <div class="row">
                <div class="col-xs-2"><b>Signal Name</b></div>
                <div class="col-xs-2"><b>Function Number (ECDS)</b></div>
                <div class="col-xs-1"><b>From (red probe)</b></div>
                <div class="col-xs-1"><b>To (black probe)</b></div>
                <div class="col-xs-3"><b>Expected</b></div>
                <div class="col-xs-1"><b>Measured</b></div>
                <div class="col-xs-2"><b>Measured Units</b></div>
            </div>
        </div>

        <div class="dynamic-elements">
            <entries-wrapper
                v-for="(entry, idx) in elementEntryCount"
                :key="idx"
                v-on:save="save"
                :element-id="elementId"
                :index="idx"
                :mode="mode"
                :element-path="elementMap.path"
                entry="eip-entry"
                :class="modStyle(elementId, `entries.${idx}`)">>
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
    import {mapGetters} from "vuex";
    import IngDataEntry from "../../../common/IngDataEntry.vue";

    export default {
        name: "EipElement",
        created() {
            this.columnInfos = [
                {
                    name: 'signal_name',
                    header: 'Signal Name',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 125,
                    enumValues: [],
                },
                {
                    name: 'icds',
                    header: 'Function Number (ECDS)',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 125,
                    enumValues: [],
                },
                {
                    name: 'from',
                    header: 'From (red probe)',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 125,
                    enumValues: [],
                },
                {
                    name: 'to',
                    header: 'To (black probe)',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 125,
                    enumValues: [],
                },
                {
                    name: 'unit',
                    header: 'Units',
                    type: 'string',
                    defaultValue: 'Volt',
                    executionOnly: false,
                    width: 50,
                    enumValues: ['Volt', 'miliVolt', 'Ohm', 'KiloOhm', 'MegaOhm'],
                    sync: {
                        index: 8,
                        allowedValues: {
                            'Volt': ['Volt', 'miliVolt'],
                            'miliVolt': ['Volt', 'miliVolt'],
                            'Ohm': ['Ohm', 'KiloOhm', 'MegaOhm'],
                            'KiloOhm': ['Ohm', 'KiloOhm', 'MegaOhm'],
                            'MegaOhm': ['Ohm', 'KiloOhm', 'MegaOhm']
                        }
                    }
                },
                {
                    name: 'min_value',
                    header: 'Min',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 50,
                    enumValues: [],
                    validateAs: 'number'
                },
                {
                    name: 'max_value',
                    header: 'Max',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 50,
                    enumValues: [],
                    validateAs: 'number'
                },
                {
                    name: 'actual_value',
                    header: 'Measured',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: true,
                    width: 50,
                    enumValues: [],
                },
                {
                    name: 'measured_unit', 
                    header: 'Measured Units',
                    type: 'string',
                    defaultValue: 'Volt',
                    executionOnly: true,
                    width: 80,
                    enumValues: ['Volt', 'miliVolt', 'Ohm', 'KiloOhm', 'MegaOhm'],
                },
            ];
        },
        components: {
            'ing-data-entry': IngDataEntry
        },
        methods: {
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            }
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ])
        }
    };
</script>

<style scoped>

</style>
