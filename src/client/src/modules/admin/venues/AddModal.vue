<template>
    <ing-modal v-if="showModal" @close="close">
        <template slot="title">
            {{ title }}
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="name">
                    Venue Group
                </label>
                <select id="venue_group_id" class="form-control" v-model.lazy="venue_group_id">
                    <option 
                        v-for="(venueGroup, idx) in venueGroups" 
                        :key="idx"
                        :value="venueGroup.venueGroupId">
                        {{ venueGroup.name }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="name">
                    Venue Name
                </label>
                <input id="name" class="form-control" v-model.lazy="name">
            </div>
            <div class="form-group">
                <label for="description">
                    Description
                </label>
                <textarea id="description" class="form-control" v-model.lazy="description">
                </textarea>
            </div>
            <div class="form-group">
                <label for="ampcs_address">
                    Venue Address
                </label>
                <input id="ampcs_address" class="form-control" v-model.lazy="ampcs_address">
            </div>
            <div class="form-group">
                <label for="location">
                    Location
                </label>
                <input id="location" class="form-control" v-model.lazy="location">
            </div>
            <div class="form-group">
                <label for="type">
                    Type
                </label>
                <select id="type" class="form-control" v-model.lazy="type">
                    <option value="">-= Select Type =-</option>
                    <option value="WSTS">WSTS</option>
                    <option value="Testbed">Testbed</option>
                    <option value="ATLO">ATLO</option>
                    <option value="Other">Other</option>
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
        name: "AddModal",
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
                venue_group_id: '',
                name: '',
                description: '',
                ampcs_address: '',
                location: '',
                type: '',
                venueId: '',
                errorMessage: '',
            };
        },
        computed: {
            ...mapGetters([
                'venueGroups',
            ]),
            inputValidated: function() {
                if (this.venue_group_id && this.name && this.ampcs_address && this.type) {
                    return true;
                } else {
                    return false;
                }
            },
            editMode: function() {
                return Object.keys(this.prepopulateData).length > 0;
            },
            title: function() {
                return this.editMode ? 'Update Venue' : 'Add Venue';
            },
        },
        methods: {
            ...mapActions([
                "createVenue",
                "editVenue"
            ]),
            resetFields: function() {
                this.venue_group_id = '';
                this.name = '';
                this.description = '';
                this.ampcs_address = '';
                this.location = '';
                this.type = '';
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
                if(Object.keys(this.prepopulateData).length === 0) {
                    // CREATE
                    try {
                        const res = await this.createVenue({
                            venue_group_id: this.venue_group_id,
                            name: this.name,
                            description: this.description,
                            ampcs_address: this.ampcs_address,
                            location: this.location,
                            type: this.type
                        });
                        this.close('submit');
                    } catch (error) {
                        this.errorMessage = error.message;
                    }
                } else {
                    // EDIT
                    const venueId = this.venueId;
                    try {
                        await this.editVenue({
                            venueId,
                            venue: {
                                venue_group_id: this.venue_group_id,
                                name: this.name,
                                description: this.description,
                                ampcs_address: this.ampcs_address,
                                location: this.location,
                                type: this.type
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
            prepopulateData: function(newVal, oldVal) {
                this.name = newVal.name;
                this.description = newVal.description;
                this.ampcs_address = newVal.ampcs_address;
                this.location = newVal.location;
                this.type = newVal.type;

                this.venueId = newVal.venueId;
                this.venue_group_id = newVal.venueGroupId;
            }
        }
    };
</script>

<style scoped>

</style>
