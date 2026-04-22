<template>
    <ing-modal v-if="showModal" @close="close()">
        <!-- Title -->
        <template slot="title">
            <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                <span class="glyphicon glyphicon-cog"></span>
                Update SSE Dictionary Version
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
                <label for="version">Version <span :style="{color: 'orangered'}">*</span></label>
                <input id="version" v-model="version" class="form-control" disabled>
            </div>
            <div class="form-group">
                <label for="state">State</label>
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

    export default {
        name: "SseDictionaryUpdateModal",
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
                "sseVersion",
            ]),
            selectedVersion: function() { return this.sseVersion(this.version); },
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
                "updateSseDict"
            ]),
            close: function() {
                this.stateLocal = "";
                this.descriptionLocal = "";
                this.showError = false;
                this.uploadError = false;
                this.$emit('close');
            },
            handleSubmit: function() {
                this.updateSseDict({
                    version: this.version,
                    state: this.stateLocal === "" ? this.state : this.stateLocal,
                    description: this.descriptionLocal === "" ? this.description : this.descriptionLocal,
                }).then((status) => {
                    // move refreshing flight dictionary with fiters up one level
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
