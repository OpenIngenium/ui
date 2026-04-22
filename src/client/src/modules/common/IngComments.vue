<template>
    <div class="row">
        <div class="col-xs-12">
            <p style="margin-bottom: 10px;"><span class="glyphicon glyphicon-comment"></span> Comments</p>
            <div class="step_comment step_show_details"></div>
        </div>
        <div class="col-xs-12">
            <template v-for="comment in elementComments">
                <div v-if="comment.content !== ''" class="col-xs-12" :key="comment.comment_id">
                    <p><b>{{ comment.user_name }}</b> posted on <em>{{ comment.time_updated }}</em></p>
                    <froalaView v-model="comment.content"></froalaView>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    export default {
        name: "IngComments",
        data() {
            return {
                displayed: false
            };
        },
        props: {
            elementId: {
                type: String,
                default: ''
            }
        },
        computed: {
            elementComments: function() {
                return this.comments(this.elementId);
            },
            ...mapGetters([
                "comments"
            ])
        }
    };
</script>

<style>

</style>

