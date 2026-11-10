// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
import { mapGetters } from 'vuex';

<template>
    <div v-if="rows_visible.length > 0">
        <div class="">
            <table class="table" style="margin-bottom:15px; word-break: break-all;">
                <thead>
                    <tr>
                        <th v-for="(column, index) in columns_visible" :key="index">{{ column.field }}</th>
                        <th v-if="rows_invisible.length > 0"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows_visible" :key="index">
                        <td v-for="(cell, cell_index) in Object.values(row)" :key="cell_index">
                            {{ cell }}
                        </td>
                        <td v-if="rows_invisible.length > 0">
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
    import { mapGetters } from "vuex";
    
    const transpose = matrix => {
        let [row] = matrix;
        return row.map((value, column) => matrix.map(row => row[column]));
    };

    export default {
        name: "CustomScriptOutputArray",
        data() {
            return {
                outputColumns: [
                    {
                        field: "name",
                        name: "Name",
                        sortable: false,
                    },
                    {
                        field: "description",
                        name: "Description",
                        sortable: false,

                    },
                    {
                        field: "type",
                        name: "Type",
                        sortable: false
                    }
                ]
            };
        },
        props: {
            elementId: {
                required: true,
                type: String
            },
            mode: {
                type: String,
                required: true
            }
        },        
        methods: {
            handleSearch() {
                return false;
            }
        },
        watch: { },
        computed: { 
            ...mapGetters([
                "executionResultsKey",
                "executionInputKey"
            ]),
            output_array_title: {
                get() {
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    return output_array.name || '';
                }
            },
            columns_visible: {
                get() {
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    
                    if(output_array && output_array.outputs) {
                        return output_array
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
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    if(output_array && output_array.outputs) {
                        return output_array
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
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    if(output_array && output_array.outputs) {
                        return output_array
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
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    if(output_array && output_array.outputs) {
                        const column_order = output_array
                            .outputs
                            .filter(output => output.visible === "YES" && output.hasOwnProperty('values'))
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
            rows_invisible: {
                get() {
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    if(output_array && output_array.outputs) {
                        const column_order = output_array
                            .outputs
                            .filter(output => output.visible === "NO" && output.hasOwnProperty('values'))
                            .map(output => output.values);
                        
                        if(column_order.length > 0) {
                            const columns_invisible_parsed = this.columns_invisible.map(column => column.field);
                            const transposed_data = transpose(column_order);
                            return transposed_data.map(data => _.zipObject(columns_invisible_parsed, data));
                        }                    
                    }

                    return [];
                }
            },
            rows_all: {
                get() {
                    const output_array = this.executionResultsKey(this.elementId, "output_array");
                    if(output_array && output_array.outputs) {
                        const column_order = output_array
                            .outputs
                            .filter(output => output.hasOwnProperty('values'))
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
