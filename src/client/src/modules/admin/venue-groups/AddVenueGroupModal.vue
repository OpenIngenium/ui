<template>
    <ing-modal v-if="showModal" @close="close">
        <template slot="title">
            {{ title }}
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="name">
                    Venue Group Name
                </label>
                <input id="name" class="form-control" v-model="name">
            </div>
            <div class="form-group">
                <label for="description">
                    Description
                </label>
                <textarea id="description" class="form-control" v-model="description">
                </textarea>
            </div>
            <div class="form-group">
                <label for="status">
                    Status
                </label>
                <select id="status" class="form-control" v-model="status">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                </select>
            </div>
            <div v-if="errorMessage" style="color: red;">Error: {{ errorMessage }}</div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="cancel">
                Cancel
            </button>
            <button
                type="button"
                class="btn btn-primary pull-right"
                :disabled="!inputValidated"
                @click="submit">
                Submit
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngModal from "../../common/IngModal.vue";

    export default {
        name: "AddVenueGroupModal",
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
            'ing-modal': IngModal
        },
        data() {
            return {
                venueGroupId: '',
                name: '',
                description: '',
                status: 'ACTIVE',
                errorMessage: '',
            };
        },
        computed: {
            ...mapGetters([
                'venueGroupIdMap'
            ]),
            inputValidated: function() {
                if (this.name && (!this.errorMessage)) {
                    return true;
                } else {
                    return false;
                }
            },
            editMode: function() {
                return Object.keys(this.prepopulateData).length > 0;
            },
            title: function() {
                return this.editMode ? 'Update Venue Group' : 'Add Venue Group';
            },
        },
        methods: {
            ...mapActions([
                "createVenueGroup",
                "editVenueGroup"
            ]),
            resetFields: function() {
                this.name = '';
                this.description = '';
                this.status = 'ACTIVE';
                this.errorMessage = '';
            },
            close: function(action) {
                this.resetFields();
                this.$emit('close', action);
            },
            cancel: function() {
                this.close('cancel');
            },
            submit: async function() {
                if (Object.keys(this.prepopulateData).length === 0) {
                    // CREATE
                    try {
                        const res = await this.createVenueGroup({
                            name: this.name,
                            description: this.description,
                            status: this.status,
                        });
                        this.close('submit');
                    } catch (error) {
                        this.errorMessage = error.message;
                    }
                } else {
                    // EDIT
                    try {
                        await this.editVenueGroup({
                            venueGroupId: this.venueGroupId,
                            venueGroup: {
                                name: this.name,
                                description: this.description,
                                status: this.status,
                            }
                        });
                        this.close('submit');
                    } catch (error) {
                        this.errorMessage = error.message;
                    }
                }
            }
        },
        watch: {
            name: function(newVal, oldVal) {
                if (newVal) {
                    const venueGroupId = this.venueGroupIdMap[newVal];
                    if (venueGroupId && (venueGroupId !== this.venueGroupId)) {
                        this.errorMessage = `Venue group of the same name already exists.`;
                        return;
                    }
                }
                this.errorMessage = '';
            },
            prepopulateData: function(newVal, oldVal) {
                this.venueGroupId = newVal.venueGroupId || '';
                this.name = newVal.name;
                this.description = newVal.description;
                this.status = newVal.status || 'ACTIVE';
            }
        }
    };
</script>

<style scoped>

</style>
