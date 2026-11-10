// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// The extended component is registered as "custom-script-entry-outputs" in execution.js, etc.

<template>
    <div v-if="isLevelThreeDetail && rows_visible.length > 0">
        <p style='text-align:center; font-weight:bold;'>{{ entry_output_array_title }}</p>
        <div class="">
            <table class="table" style="margin-bottom:15px; word-break: break-all;">
                <thead>
                    <tr>
                        <th v-for="(column, index) in columns_visible" :key="index">{{ column.field }}</th>
                        <th v-if="columns_invisible.length > 0"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows_visible" :key="index">
                        <td v-for="(cell, cell_index) in Object.values(row)" :key="cell_index">
                            {{ cell }}
                        </td>
                        <td v-if="columns_invisible.length > 0">
                            <ing-popover placement="bottom">
                                <template slot="title">Details</template>
                                <ul slot="body" style="width: 300px">
                                    <li v-for="(val, key, idx) in rows_all[index]" :key="idx" style="word-break: break-all;">
                                        <span class="result-key">{{key}}</span>:&nbsp;<span class="result-value">{{val}}</span>
                                    </li>
                                </ul>
                                <span :class="['glyphicon-eye-open', 'glyphicon']"></span>
                            </ing-popover>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import IngTable from "../../../common/IngTable.vue";
    import { mapGetters } from "vuex";
    
    const transpose = matrix => {
        let [row] = matrix;
        return row.map((value, column) => matrix.map(row => row[column]));
    };

    export default {
        name: "CustomScriptEntryOutputs",
        components: {
            'ing-table': IngTable
        },
        data() {
            return {
            };
        },
        methods: {
        },
        watch: { },
        computed: { 
            ...mapGetters([
                "executionResultsEntryKey",
            ]),
            entry_output_array_title: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    return entry_output_array ? entry_output_array.name : '';
                }
            },
            columns_visible: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    
                    if(entry_output_array && entry_output_array.outputs) {
                        return entry_output_array
                            .outputs
                            .filter(output => output.visible === "YES")
                            .map(output => {
                                return {
                                    field: output.name,
                                    name: output.name.toUpperCase(),
                                    sortable: false,
                                };
                        });                        
                    }
                    return [];
                }
            },
            columns_invisible: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    if(entry_output_array && entry_output_array.outputs) {
                        return entry_output_array
                            .outputs
                            .filter(output => output.visible === "NO")
                            .map(output => {
                                return {
                                    field: output.name,
                                    name: output.name.toUpperCase(),
                                    sortable: false,
                                };
                        });
                    }
                    return [];
                }
            },
            columns_all: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    if(entry_output_array && entry_output_array.outputs) {
                        return entry_output_array
                            .outputs
                            .map(output => {
                                return {
                                    field: output.name,
                                    name: output.name.toUpperCase(),
                                    sortable: false,
                                };
                        });
                    }
                    return [];
                }
            },            
            rows_visible: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    if(entry_output_array && entry_output_array.outputs) {
                        const column_order = entry_output_array
                            .outputs
                            .filter(output => output.visible === "YES")
                            .map(output => output.values);
                        
                        if(column_order.length > 0) {
                            const columns_visible_parsed = this.columns_visible.map(column => column.field);
                            const transposed_data = transpose(column_order);
                            return transposed_data.map(data => _.zipObject(columns_visible_parsed, data));
                        }
                    }
                    return [];
                }
            },
            rows_all: {
                get() {
                    const entry_output_array = this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array");
                    if(entry_output_array && entry_output_array.outputs) {
                        const column_order = entry_output_array
                            .outputs
                            .map(output => output.values);
                        
                        if(column_order.length > 0) {
                            const columns_all_parsed = this.columns_all.map(column => column.field);
                            const transposed_data = transpose(column_order);
                            return transposed_data.map(data => _.zipObject(columns_all_parsed, data));
                        }                    
                    }

                    return [];
                }
            },            
        }
    };
</script>

<style scoped>

    .required-field {
        display: inline;
    }

    .error {
        background-color: orangered;
    }

</style>
