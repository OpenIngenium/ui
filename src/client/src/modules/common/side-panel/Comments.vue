<template>
    <div style="padding-top:10px;">
        <!-- <pre>{{ elementsConversations }}</pre> -->
        <template v-for="elementConversation in elementsConversations">
            <div 
                :key="elementConversation.conversation_id"
                class="conversation"
                :style="{
                    border: `2px solid ${commentTypeToColor(elementConversation.type)}`
                }"
                >
                <div 
                    class="header"
                    :style="{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        backgroundColor: commentTypeToColor(elementConversation.type)
                    }">
                    <button
                        class="btn btn-link btn-sm"
                        style="float:right; color:black; bottom:5px;"
                        @click="toggleCollapsed(elementConversation.conversation_id)"
                        type="button">
                        <span :class="'glyphicon ' + (isCollapsed(elementConversation.conversation_id) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top')"></span>
                    </button>
                    <span 
                        v-if="elementConversation.status == 'RESOLVED'"
                        style="float:right; color:green; position:relative; top:5px;"
                        class="glyphicon glyphicon-ok"></span>
                    <a  
                        style="top:5px;"
                        href="#" @click.prevent="handleScrollToElem(elementConversation.element.element_id)">
                        <b>{{ elementConversation.element.number }}</b> {{ elementConversation.element.title }}
                    </a>
                </div>
                <div v-if="!isCollapsed(elementConversation.conversation_id)" style="padding:5px;">
                    <template v-for="(comment, idx) in objectCommentsToArray(elementConversation.comments)">
                        <div 
                            :key="idx">
                            <div class="comment-header">
                                <b>{{ comment.user_name }}</b> &middot; <span style="text-decoration: underline;">{{ convertTime(comment.time_updated)}} ago</span>
                            </div>
                            <div 
                                class="comment-content"
                                v-html="comment.content"></div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script>

    import { timesince } from '../filters';
    import _ from 'lodash';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "Comments",
        data() {
            return {
                collapsed: []
            };
        },
        computed: {
            ...mapGetters([
                "execution",
                "procedure",
                "conversations",
                "elementsConversations",
                "elements",           
                "commentFilter",
                "activityReportFilter",
                "dataReviewFilter",
            ]),
            isAuthoring: function() {
                return window.location.pathname.split("/")[1] == "authoring";
            },
        },
        methods: {
            ...mapActions([
                "editScrollToElementId",
            ]),
            commentTypeToColor: function(type) {
                switch(type) {
                    case "COMMENT": return "lightgray";
                    case "DATA_REVIEW_COMMENT": return "rgb(230, 173, 216)";
                    case "ACTIVITY_REPORT_COMMENT": return "rgb(173, 216, 230)";
                }
            },
            objectCommentsToArray: function(commentObject) {
                return Object.keys(commentObject).map(comment => {
                    return commentObject[comment];
                });
            },
            toggleCollapsed: function(id) {
                if(this.collapsed.includes(id))
                    this.collapsed.splice(this.collapsed.indexOf(id), 1);
                else
                    this.collapsed = [...this.collapsed, id];
            },
            isCollapsed: function(id) {
                return this.collapsed.includes(id);
            },
            convertTime: function(time) {
                return timesince(time);
            },
            handleScrollToElem: function(elem_id) {
                this.editScrollToElementId({id: elem_id});
            },
        }
    };
</script>

<style lang="scss" scoped>
.elementConversations {
    border: 1px solid lightgrey;
    border-radius: 8px;
    padding:8px;
}

.conversation {
    margin-bottom: 10px;
    border-radius: 8px;
}

.conversation .header {
    padding:5px;
}

.conversation .comment-content {
    max-height: 80px; 
    overflow: hidden;
}

.conversation .comment-content img {
    display: hidden;
}

.conversation-data-review {
    color: rgb(230, 173, 216);
}
.conversation-comment {
    color: lightgray;
}
.conversation-activity-report {
    color: rgb(173, 216, 230);
}
</style>
