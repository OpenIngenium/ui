<template>
    <div
        v-if="displayConversation" 
        class="row">
        <div class="col-xs-12" :style="'border: 2px solid ' + conversationTypeColor + '; border-radius: 8px; background-color:white; padding:0px; margin-bottom:3px;'">
            <div class="row" :style="'background-color: ' + conversationTypeColor +'; margin:0px; height: 30px;'">  
                <div class="col-xs-3" style="padding-top:4px; cursor:pointer;">
                    <p 
                        v-if="!editType"
                        @click="activateEditType">{{ conversationTypeText }}</p>
                    <select
                        v-if="editType"
                        style="width:150px;"
                        v-model="conversationType">
                        <option value="COMMENT">Comment</option>
                        <option v-if="version == -1" value="ACTIVITY_REPORT_COMMENT">Activity Report Comment</option>
                        <option v-if="version == -1" value="DATA_REVIEW_COMMENT">Data Review/Closeout Comment</option>
                    </select>
                    <button 
                        v-if="editType"
                        type="button" 
                        class="btn btn-default btn-sm"
                        @click="editType = false">Cancel</button>
                </div>
                <div class="col-xs-6" style="padding-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-height:40px;">
                    <span
                        v-if="!expanded"
                        v-html="firstCommentPreview"></span>
                </div>
                <div class="col-xs-3 pull-right" style="padding-top:0px;">
                    <button 
                        @click="expanded = !expanded"
                        class="btn btn-link btn-sm"
                        style="float:right; color:black; margin-bottom:5px;"
                        type="button">
                        <span :class="'glyphicon ' + (!expanded ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top')"></span>
                    </button>
                    <div 
                        v-if="!executionFinalized"
                        style="float:right; margin-bottom:5px;"
                        class="dropdown">
                        <button
                            v-if="canDeleteConversation" 
                            style="color: black; text-decoration: none;"
                            class="btn btn-link dropdown-toggle" 
                            type="button" 
                            id="dropdownMenu1" 
                            data-toggle="dropdown" 
                            aria-haspopup="true" 
                            aria-expanded="true">
                            <span class="glyphicon glyphicon-option-horizontal"></span>
                        </button>
                        <ul 
                            style="width:75px;"
                            class="dropdown-menu" 
                            aria-labelledby="dropdownMenu1">
                            <li><a @click="deleteConversation({
                                type: conversationType,
                                version: version,
                                executionId, 
                                elementId,
                                conversationId: elementConversation.conversation_id
                            });">Delete Conversation</a></li>
                        </ul>
                    </div>
                    <label
                        style="margin-top:2px;">
                        <span style="font-weight:normal; margin-right:5px;">Resolved</span>
                        <ing-toggle
                            :value="isResolved"
                            onName="Yes"
                            offName="No"
                            :clickHandler="toggleMode"
                            sizeClass="btn-xs"
                            :disable="executionFinalized"
                            customStyle="position:absolute">
                        </ing-toggle>
                    </label>
                </div>
            </div>
            <div style="padding:0px;" v-if="expanded">
                <template v-for="comment in elementComments">
                    <ing-comment
                        :key="comment.id"
                        :version="version"
                        :executionId="executionId"
                        :elementId="elementId"
                        :conversationId="conversationId"
                        :mode="mode"
                        :commentId="comment.comment_id"></ing-comment>
                </template>
            </div>
            <div v-if="expanded && !executionFinalized">
                <button 
                    v-if="!editMode"
                    style="margin-bottom:0px;"
                    type="button"
                    @click="addReplyCallback()"
                    class="btn btn-link">
                    <span class="glyphicon glyphicon-share-alt"></span> Add Reply
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import IngComment from './IngComment.vue';
    import IngToggle from './IngToggle.vue';
    import { getUsername } from './utils';
    import { mapGetters, mapActions } from "vuex";
    

    export default {
        name: "IngConversation",
        data() {
            return {
                expanded: true,
                editMode: false,
                editType: false,
                content: "",
            };
        },
        components: {
            'ing-comment': IngComment,
            'ing-toggle' : IngToggle,
        },
        props: {
            version: {
                type: Number,
                default: -1
            },
            executionId: {
                type: String,
                default: ''
            },
            elementId: {
                type: String,
                default: ''
            },
            conversationId: {
                type: String,
                default: ''
            }
        },
        mounted() {
            // this.editMode = elementComments;
        },
        computed: {
            ...mapGetters([
                "conversation",
                "comments",
                "commentFilter",
                "resolvedFilter",
                "unresolvedFilter",
                "dataReviewFilter",
                "activityReportFilter",
                "mode",
                "executionFinalized",
            ]),
            isResolved: function(){
                return this.elementConversation.status == "RESOLVED";
            },
            elementConversation: function() {
                return this.conversation(this.elementId, this.conversationId);
            },
            elementComments: function() {
                return this.comments(this.elementId, this.conversationId);
            },
            conversationTypeColor: function() {
                const conversationType = this.elementConversation.type;
                switch(conversationType) {
                    case "COMMENT": return "lightgray";
                    case "ACTIVITY_REPORT_COMMENT": return "#add8e6";
                    case "DATA_REVIEW_COMMENT": return "#e6add8";
                }
            },
            displayConversation: function() {
                if(this.mode == 'as-run' || this.mode == 'execution') {
                    const toggles = [];
                    
                    toggles.push("COMMENT");
                    toggles.push("ACTIVITY_REPORT_COMMENT");
                    toggles.push("DATA_REVIEW_COMMENT");
                    
                    return toggles.includes(this.elementConversation.type);
                } else {
                    return true;
                }
            },
            conversationTypeText: function() {
                const conversationType = this.elementConversation.type;
                switch(conversationType) {
                    case "COMMENT": return "Comments";
                    case "ACTIVITY_REPORT_COMMENT": return "Activity Report Comments";
                    case "DATA_REVIEW_COMMENT": return "Data Review/Closeout Comments";
                }
            },
            firstCommentPreview: function() {
                if(this.elementConversation) {
                    let objectKeys = Object.keys(this.elementConversation.comments);
                    return `${this.elementConversation.comments[objectKeys[0]].content}`;
                } else return "";
            },
            canDeleteConversation: function() {
                if (this.$can(['update'], 'Admin')) {
                    return true;
                }

                if (this.elementConversation) {
                    let comments = Object.values(this.elementConversation.comments);
                    if (comments.length === 0) {
                        return true;
                    } else {
                        return comments[0].user_name === getUsername();
                    }
                } else {
                    return false;
                }
            },
            conversationType: {
                get: function() {
                    return this.elementConversation.type;
                },
                set: function(val) {
                    this.editConversation({
                        version: this.version,
                        executionId: this.executionId,
                        elementId: this.elementId,
                        conversationId: this.conversationId,
                        fromType: this.elementConversation.type,
                        conversation: {
                            status: this.elementConversation.status,
                            type: val
                        }
                    });
                    this.editType = false;
                }
            },
        },
        methods: {
            ...mapActions([
                "postComment",
                "editConversation",
                "deleteConversation",
            ]),
            toggleMode: async function() {
                this.editConversation({
                    version: this.version,
                    executionId: this.executionId,
                    elementId: this.elementId,
                    conversationId: this.conversationId,
                    fromType: this.elementConversation.type,
                    conversation: {
                        status: this.isResolved ? 'UNRESOLVED' : 'RESOLVED',
                        type: this.elementConversation.type
                    }
                });
            },
            addReplyCallback: async function() {
                // this.editMode = true;

                // Create comment before allowing user to post content of comment,
                // since comment id must be known to post photos/files
                await this.postComment({
                    version: this.version,
                    executionId: this.executionId, 
                    elementId: this.elementId, 
                    conversationId: this.conversationId, 
                    comment: ''
                });
            },
            activateEditType: function() {
                if (this.executionFinalized) {
                    return;
                }
                this.editType = true;
            }
        }
    };
</script>

<style>

</style>

