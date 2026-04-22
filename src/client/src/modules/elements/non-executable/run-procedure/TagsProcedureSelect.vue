<template>
    <div class="tags-selected">
        <ing-table
            tableId="tagsSelectedTable"
            tableTitle=""
            empty-message="No tags to display."
            :data="tagSelections"
            :columns="tableColumns"
            @handleEvent="tableEvent"
            :includeFooter="false"
        ></ing-table>
    </div>
</template>

<script>
    import IngTag from "../../IngTag.vue";
    import IngTable from "../../../common/IngTable.vue";
    import SelectTagCheckbox from "./SelectTagCheckbox.vue";

    export default {
        name: "TagsProcedureSelect",
        components: {
            'ing-tag': IngTag,
            'ing-table': IngTable
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: 'actions',
                        name: '',
                        component: SelectTagCheckbox,
                    },
                    {
                        field: 'tag',
                        name: 'Tag',
                        component: IngTag,
                        normalWrap: true
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        normalWrap: true
                    }
                ]
            };
        },
        props: {
            tagSelections: {
                type: Array,
                required: true
            }
        },
        methods: {
            tableEvent: function(e) { this.$emit('selectTag', e); }
        },
        computed: {
        }
    };
</script>

<style lang="scss" scoped>
    .tags-selected {
        margin-top: -30px;
    }
    .tags-selected b {
        color: #545454;
        margin: 0;
    }
    .tag-well {
        background-color: #F7F7F7;
        margin-top: 4px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 12px;
        color: #797979;
    }
</style>
