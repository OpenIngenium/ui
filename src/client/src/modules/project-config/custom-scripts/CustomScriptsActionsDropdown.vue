<template>
    <div>
        <ing-modal v-if="showModal" @close="showModal = false" size="small">
            <!-- Title -->
            <template slot="title">
                <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                    <span class="glyphicon glyphicon-cog"></span>
                    Confirm Delete?
                </h4>
            </template>

            <!-- Body -->
            <template slot="body">
                <p>
                    Deleting a custom script may impact existing<br >
                    procedures and as runs that used it (not being able<br>
                    to display its details). Instead, consider<br>
                    deactivating it to prevent its use.
                </p>
            </template>

            <!-- Footer -->
            <template slot="footer">
                <button type="button"
                        class="btn btn-default pull-left"
                        @click="showModal = false">
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-danger pull-right"
                    @click="handleDelete()">
                    Delete
                </button>
            </template>
        </ing-modal>

        <select 
            :disabled="!$can('update', 'Configuration_Management') || !$can('delete', 'Configuration_Management')"
            v-model="action" 
            @change="handleAction($event)" 
            class="form-control" 
            :style="{width: '95px'}">
            <option value="" selected>Actions</option>
            <template v-if="isActive">
                <option value="deactivate">Deactivate</option>
            </template>
            <template v-else>
                <option value="activate">Activate</option>
            </template>
            <option value="delete">Delete</option>
        </select>
    </div>
</template>

<script>
    import IngModal from "../../common/IngModal.vue";
    import {mapActions} from "vuex";

    export default {
        name: "CustomScriptsActionsDropdown",
        components: {
            "ing-modal": IngModal,
        },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                action: "",
                showModal: false,
            };
        },
        computed: {
            isActive: function() { return this.data.status === "ACTIVE"; }
        },
        methods: {
            ...mapActions([
                "updateCustomScriptsStatus",
                "deleteCustomScript",
                "displayFeedback"
            ]),
            handleAction: function(event) {
                // console.log(event.target.value);
                switch (event.target.value) {
                    case "activate":
                        this.updateCustomScriptsStatus({
                            name: this.data.script_id,
                            status: "ACTIVE",
                        }).then(() => {
                            this.$emit('tableEvent', { action: 'activate', script_id: this.data.script_id });
                        });
                        this.action = "";
                        break;
                    case "deactivate":
                        this.updateCustomScriptsStatus({
                            name: this.data.script_id,
                            status: "INACTIVE",
                        }).then(() => {
                            this.$emit('tableEvent', { action: 'deactivate', script_id: this.data.script_id });
                        });
                        this.action = "";
                        break;
                    case "delete":
                        this.showModal = true;
                        this.action = "";
                        break;
                    default:
                        break;
                }
            },
            handleDelete: async function() {
                try {
                    await this.deleteCustomScript({
                        script_id: this.data.script_id
                    });
                    this.$emit('tableEvent', { action: 'delete', script_id: this.data.script_id });
                    this.showModal = false;
                } catch (error) {
                    this.showModal = false;
                    this.displayFeedback({ type: 'error', errorObj: error });
                }
            }
        }
    };
</script>

<style scoped>

</style>
