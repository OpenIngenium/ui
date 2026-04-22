<template>
    <ing-modal class="feedback-modal" v-if="showFeedbackModal" v-on:close="hideFeedbackModal">
        <template slot="title">
            <template v-if='feedbackType === "success"'>
                <h4 style="font-weight: bold; color: green; display: inline-block;">
                    <span class="glyphicon glyphicon-ok"></span>
                    Success!
                </h4>
            </template>
            <template v-if='feedbackType === "error"'>
                <h4 style="font-weight: bold; color: red; display: inline-block;">
                    <span class="glyphicon glyphicon-exclamation-sign"></span>
                    Ingenium Error
                </h4>
            </template>
            <template v-if='feedbackType === "warning"'>
                <h4 style="font-weight: bold; color: orange; display: inline-block;">
                    <span class="glyphicon glyphicon-exclamation-sign"></span>
                    Warning
                </h4>
            </template>
        </template>
        <template slot="body">
            <div v-if='feedbackType === "success"'>
                <p>{{ feedbackObject.message }} 
                    <a :href="`/authoring/${feedbackObject.procedureId}/${feedbackObject.version}`">
                        (Version {{feedbackObject.version}})
                    </a>
                </p>
            </div>
            <div v-if='feedbackType === "error"'>
                <p>An error has occurred. Please review the error message and if needed contact Ingenium support.</p>
                <div v-if="feedbackObject.message">
                    <b>Message: </b>
                    <p>{{ feedbackObject.message.replace(/'/g,"") }}</p>
                </div>
                <div v-if="feedbackObject.details">
                    <b>Details: </b>
                    <pre style="white-space: pre-wrap;">{{ feedbackObject.details }}</pre>
                </div>
            </div>
            <div v-if='feedbackType === "warning"'>
                <p>Please review the warning message and if needed contact Ingenium support.</p>
                <div v-if="feedbackObject.message">
                    <b>Message: </b>
                    <p>{{ feedbackObject.message.replace(/'/g,"") }}</p>
                </div>
                <div v-if="feedbackObject.details">
                    <b>Details: </b>
                    <pre style="white-space: pre-wrap;">{{ feedbackObject.details }}</pre>
                </div>
            </div>
        </template>
        <template slot="footer">
            <button
                @click="hideFeedbackModal"
                type="button"
                class="btn btn-default pull-right">
                Dismiss
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "./IngModal.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "FeedbackModal",
        components: {
            IngModal
        },
        methods: {
            ...mapActions([
                "toggleFeedbackModal"
            ]),
            hideFeedbackModal: function() {
                this.toggleFeedbackModal(false);
            }
        },
        computed: {
            ...mapGetters([
                "feedbackObject",
                "feedbackType",
                "showFeedbackModal",
            ])
        }
    };
</script>

<style lang="scss" scoped>

</style>
