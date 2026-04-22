<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
            Change Status of Venue
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="status">
                    Status
                </label>
                <select 
                    id="status" 
                    class="form-control" 
                    v-model="currentStatus">
                    <option 
                        v-for="(statusOption, idx) in statusOptions" 
                        :key="idx"
                        :value="statusOption.value">
                        {{ statusOption.name }}
                    </option>
                </select>
            </div>
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
                Confirm Change Status
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngModal from "../../common/IngModal.vue";

    export default {
        name: "ChangeStatusModal",
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
                statusOptions: [
                    { name:"Available", value:"AVAILABLE" }, 
                    { name:"Down", value:"DOWN" },
                    { name:"Unknown", value:"UNKNOWN" }, 
                    { name:"Retired", value:"RETIRED"}
                ],
                selectedStatus:"",
            };
        },
        computed: {
            currentStatus:{
                get(){
                    return this.prepopulateData.status;
                },
                set(value) {
                    this.selectedStatus = value;
                }
            }
        },
        methods: {
            ...mapActions([]),
            close: function() {
                this.$emit('close');
            },
            submit: async function() {
                this.$emit('confirm', {
                    status: this.selectedStatus
                });
            },
        }
    };
</script>

<style scoped>

</style>