<template>
    <ing-modal v-show="showModal" @close="close()">
        <template slot="title">
            <h4 id="modal-title">
                Load Search Rule
            </h4>
        </template>
        <template slot="body">
            <div style="margin-top: -30px;">
                <ing-table
                    tableTitle=""
                    empty-message="No save rules to display"
                    :data="loadSaveRule"
                    :columns="tableColumns"
                    :includeFooter="false"
                    @handleEvent="tableEvent">
                </ing-table>
            </div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Cancel
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../common/IngModal.vue";
    import IngTable from '../common/IngTable.vue';
    import ActionButtons from "./ActionButtons.vue";

    export default {
        name: "LoadRuleModal",
        components: {
            'ing-modal': IngModal,
            'ing-table': IngTable
        },
        data() {
            return {
                tableColumns: [
                    { 
                        field: 'name',
                        name: 'Name',
                        normalWrap: true
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        normalWrap: true
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: ActionButtons
                    }
                ],
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
            loadSaveRule: {
                type: Array,
                required: true,
                default: ()=>[]
            }
        },
        methods: {
            close: function() {
                this.$emit('close');
            },
            tableEvent: function(action) {
                if(action.event == 'delete'){
                    this.$emit('delete', action.data);
                }
                if(action.event == 'select'){
                    this.$emit('load', action.data);   
                }
            }
        },
    };
</script>
<style lang="scss" scoped>
    #modal-title {
        font-weight: bold;
        display: inline-block;
    }
</style>
