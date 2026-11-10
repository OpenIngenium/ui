<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
            Delete Procedure Label
        </template>
        <template slot="body">
            <div>
                Are you sure to delete this label? 
            </div>
            <ul style="margin-top: 10px;">
                <li>Label Name: {{prepopulateData.name}}</li>
                <li>Description: {{prepopulateData.description}}</li>
            </ul>
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
                Confirm
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngModal from "../../common/IngModal.vue";

    export default {
        name: "DeleteProcedureLabelModal",
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
                    label_id: this.prepopulateData.label_id
                });
            },
        }
    };
</script>

<style scoped>

</style>