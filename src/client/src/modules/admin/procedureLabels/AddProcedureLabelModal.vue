<template>
    <ing-modal v-if="showModal" @close="close">
        <template slot="title">
            Add Procedure Label
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="name">
                    Label Name*
                </label>
                <input id="name" class="form-control" v-model.lazy="name">
            </div>
            <div class="form-group">
                <label for="description">
                    Description*
                </label>
                <textarea id="description" class="form-control" v-model.lazy="description">
                </textarea>
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
        name: "AddProcedureLabelModal",
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
                name: '',
                description: '',
                label_id: '',
                errorMessage: '',
            };
        },
        computed: {
            inputValidated: function() {
                if (this.name && this.description) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        methods: {
            ...mapActions([
                "createLabel",
            ]),
            resetFields: function() {
                this.name = '';
                this.description = '';
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
                        const res = await this.createLabel({
                            name: this.name,
                            description: this.description
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
                this.label_id = newVal.label_id;
            }
        }
    };
</script>

<style scoped>

</style>
