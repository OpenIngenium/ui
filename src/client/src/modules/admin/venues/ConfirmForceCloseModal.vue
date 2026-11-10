<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
           Force Close Execution
        </template>
        <template slot="body">
            <div class="alert alert-danger" role="alert">
                You are about to force close the execution on the "{{ this.prepopulateData.name }}" venue.
                Once it is closed, you won't be able to resume it.
                If you plan to continue with the execution later, force suspend it instead.
            </div>
            <table class="ing-table table table-striped">
                <thead>
                    <tr>
                        <th colspan="2">
                            Information
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Execution ID</td>
                        <td>{{ this.prepopulateData.executionId }}</td>
                    </tr>
                    <tr>
                        <td>Conductor</td>
                        <td>{{ this.prepopulateData.testConductor }}</td>
                    </tr>
                    <tr>
                        <td>Started on</td>
                        <td>{{ this.prepopulateData.startedOn }}</td>
                    </tr>
                </tbody>
            </table>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Cancel
            </button>
            <button
                type="button"
                class="btn btn-primary pull-right"
                @click="submit()">
                Confirm Close Execution
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngModal from "../../common/IngModal.vue";

    export default {
        name: "ConfirmStopExecution",
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false
            },
            prepopulateData: {
                type: Object
            }
        },
        components: {
            'ing-modal': IngModal,
        },
        data() {
            return {
                
            };
        },
        computed: {
            
        },
        methods: {
            ...mapActions([]),
            close: function() {
                this.$emit('close');
            },
            
            submit: async function() {
                this.$emit('confirm', {
                    executionId: this.prepopulateData.executionId
                });
            },
        }
    };
</script>

<style scoped>

</style>