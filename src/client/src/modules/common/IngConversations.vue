<template>
    <div id="conversation" class="row" style="margin:0px 0px;">
        <div class="col-xs-12">
            <div v-if="!elementConversations"><p style="display: inline;">There are no conversations.</p>
                <div v-if="!executionFinalized" class="dropdown" style="display: inline; margin-left:-13px; bottom: 1px;">
                    <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        Start a conversation
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                        <li><a @click.prevent="createNewConversation('COMMENT');">General Comments</a></li>
                        <li v-if="version == -1"><a @click.prevent="createNewConversation('ACTIVITY_REPORT_COMMENT');">Activity Report Comments</a></li>
                        <li v-if="version == -1"><a @click.prevent="createNewConversation('DATA_REVIEW_COMMENT');">Data Review/Closeout Comments</a></li>
                    </ul>
                </div>
            </div>
            <template v-for="conversation in elementConversations">
                <ing-conversation
                    :key="conversation.id"
                    :version="version"
                    :elementId="elementId"
                    :executionId="executionId"
                    :conversationId="conversation.conversation_id"
                ></ing-conversation>
            </template>
        </div>
        <div class="col-xs-12" style="padding:0px; margin-top:-10px; margin-left:-10px;" v-if="elementConversations">
            <div class="dropdown" v-if="!executionFinalized">
                <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    Add Conversation
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a @click.prevent="createNewConversation('COMMENT');">General Comments</a></li>
                    <li v-if="version == -1"><a @click.prevent="createNewConversation('ACTIVITY_REPORT_COMMENT');">Activity Report Comments</a></li>
                    <li v-if="version == -1"><a @click.prevent="createNewConversation('DATA_REVIEW_COMMENT');">Data Review/Closeout Comments</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from "vuex";

    import IngConversation from "./IngConversation.vue";

    export default {
        name: "IngConversations",
        data() {
            return {
                displayed: false
            };
        },
        components: {
            'ing-conversation': IngConversation
        },
        props: {
            version: {
                type: Number,
                default: -1
            },
            elementId: {
                type: String,
                default: ''
            },
            executionId: {
                type: String,
                default: ''
            }
        },
        computed: {
            elementConversations: function() {
                let conversations = this.conversations(this.elementId);
                if(Object.keys(conversations).length === 0 && conversations.constructor === Object) 
                    return false;
                else return conversations;
            },
            ...mapGetters([
                "conversations",
                "execution",
                "executionFinalized",
                "isPending",
            ])
        },
        methods: {
            ...mapActions([
                "postConversation",
                "setPending",
            ]),
            createNewConversation: async function(type) {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.postConversation({ 
                    version: this.version,
                    executionId: this.executionId, 
                    elementId: this.elementId, 
                    conversation: {
                        type: type,
                        status: "UNRESOLVED"
                    }
                });
                this.setPending(false);
            }
        }
    };
</script>

<style>

</style>

