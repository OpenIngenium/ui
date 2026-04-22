<template>
    <ing-modal v-if="showModal" @close="close()">
        <!-- Title -->
        <template slot="title">
            <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                <span class="glyphicon glyphicon-cog"></span>
                Update Flight Dictionary Version
            </h4>
        </template>

        <!-- Body -->
        <template slot="body">
            <div v-if="showError"
                 class="form-group"
                 :style="{color: 'orangered', fontWeight: 'lighter', fontSize: 'smaller', fontFamily: 'Arial'}">
                <div v-if="uploadError">Something went wrong uploading to server</div>
            </div>
            <div class="form-group">
                <label
                    data-toggle="tooltip"
                    data-placement="right"
                    :title="tooltips.project_config_add_update_version"
                    class="ing-tooltip"
                    for="version"><b>Version <span :style="{color: 'orangered'}">*</span></b></label>
                <input id="version" v-model="version" class="form-control" disabled>
            </div>
            <div class="form-group">
                <label 
                    data-toggle="tooltip"
                    data-placement="right"
                    :title="tooltips.project_config_add_update_state"
                    class="ing-tooltip"
                    for="state"><b>State</b></label>
                <select id="state" v-model="state" class="form-control">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="NOT_PUBLISHED">NOT_PUBLISHED</option>
                    <option value="RETIRED">RETIRED</option>
                    <option value="RELEASED">RELEASED</option>
                </select>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" v-model="description" class="form-control" :style="{resize: 'none'}" rows="4"></textarea>
            </div>
        </template>

        <!-- Footer -->
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Cancel
            </button>
            <button
                type="button"
                class="btn btn-primary pull-right"
                @click="handleSubmit()">
                Submit
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../../common/IngModal.vue";
    import {mapGetters, mapActions} from "vuex";
    let TOOLTIPS = require('../../common/tooltip-config');

    export default {
        name: "FlightDictionaryUpdateModal",
        components: {
            "ing-modal": IngModal,
        },
        props: {
            showModal: {
                type: Boolean,
                required: true
            },
            version: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                stateLocal: "",
                descriptionLocal: "",
                uploadResults: "",
                showError: false,
                uploadError: false,
            };
        },
        computed: {
            ...mapGetters([
                "flightVersion",
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            selectedVersion: function() { return this.flightVersion(this.version); },
            state: {
                get: function() { return this.stateLocal === "" ? this.selectedVersion.state : this.stateLocal; },
                set: function(val) { this.stateLocal = val; }
            },
            description: {
                get: function() { return this.descriptionLocal === "" ? this.selectedVersion.dictionary_description : this.descriptionLocal; },
                set: function(val) { this.descriptionLocal = val; }
            },
        },
        methods: {
            ...mapActions([
                "updateFlightDict"
            ]),
            close: function() {
                this.stateLocal = "";
                this.descriptionLocal = "";
                this.showError = false;
                this.uploadError = false;
                this.$emit('close');
            },
            handleSubmit: function() {
                this.updateFlightDict({
                    version: this.version,
                    state: this.stateLocal === "" ? this.state : this.stateLocal,
                    description: this.descriptionLocal === "" ? this.description : this.descriptionLocal,
                }).then((status) => {
                    // move refreshing flight dictionary with filters up one level
                    this.$emit('refreshDictionaries');

                    if(status) {
                        this.close();
                    } else {
                        this.showError = true;
                        this.uploadError = true;
                    }
                });
            }
        }
    };
</script>

<style scoped>

</style>
