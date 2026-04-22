<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
            Delete Venue
        </template>
        <template slot="body">
            <div>
                Are you sure to delete this venue? For most cases, it is preferred to change venue status to RETIRED instead of deleting it.
            </div>
            <ul style="margin-top: 10px;">
                <li>Venue Name: {{prepopulateData.name}}</li>
                <li>Status: {{prepopulateData.status}}</li>
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
        name: "DeleteVenueModal",
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
                    venueId: this.prepopulateData.venueId
                });
            },
        }
    };
</script>

<style scoped>

</style>