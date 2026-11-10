<template>
    <ing-modal class="kickout-modal" v-if="kickedOut" v-on:close="closeModal">
        <template slot="title">
            <template>
                <h4 style="font-weight: bold; color: blue; display: inline-block;">
                    <span class="glyphicon glyphicon-ok"></span>
                    Leaving Execution Mode
                </h4>
            </template>
        </template>
        <template slot="body">
            <p>
                You were removed from participants or redline approvers list of the execution ({{ executionId }}). Switching to watch mode.
            </p>
        </template>
        <template slot="footer">
            <button
                @click="closeModal"
                type="button"
                class="btn btn-primary pull-right">
                OK
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../common/IngModal.vue";
    import { mapGetters } from "vuex";

    export default {
        name: "KickoutModal",
        components: {
            IngModal
        },
        methods: {
            closeModal: function() {
                this.$router.push({ path: `/execute/as_run/${this.executionId}`});
                this.$router.go();
            }
        },
        computed: {
            ...mapGetters([
                "executionId",
                "kickedOut",
            ])
        }
    };
</script>

<style lang="scss" scoped>

</style>
