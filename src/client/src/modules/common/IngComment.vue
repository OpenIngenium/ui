<template>
    <div class="row" style="margin-bottom:3px;">
        <div class="col-xs-12">
            <div class="row">
                <div class="col-xs-1" style="padding-right: 4px;">
                    <img 
                        style="float: right; border-radius: 50%; width: 35px; height: 35px;" 
                        src="/static/images/default-profile-photo.jpeg" 
                    >
                </div>
                <div class="col-xs-11" style="border-left: 2px solid lightgray; padding-left: 5px;">
                    <div 
                        v-if="!executionFinalized"
                        style="float:right;"
                        class="dropdown">
                        <button 
                            v-if="canModifyComment"
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
                            <li v-if="canEditComment"><a @click="editMode = true">Edit Comment</a></li>
                            <li><a @click="showModal=true">Delete Comment</a></li>
                        </ul>
                    </div>
                    <ing-modal v-if="showModal" @close="showModal=false" size="small">
                        <template slot="title">
                            <h4>
                            Comfirm Delete
                            </h4>
                        </template>
                        <template slot="body">
                            <p>Do you want to delete the comment?</p>
                        </template>

                        <template slot="footer">
                            <button type="button" class="btn btn-primary pull-right" @click="handleDelete()">Delete</button>
                            <button type="button" class="btn pull-right" @click="showModal=false">Cancel</button>
                        </template>
                    </ing-modal>
                    <p style="margin-bottom: 0px;">
                        <b>{{ elementComment.user_name }}</b> &middot; <span
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            class="ing-tooltip"
                            style="color:black; text-decoration: underline;"
                            :title="elementComment.time_updated"
                        >{{ convertTime(elementComment.time_updated) }} ago</span><br>
                    </p>
                    <div 
                        style="overflow:scroll;"
                        @click="activateCommentEditMode">
                        <froalaView v-if="!editModeComputed"  v-model="elementComment.content"></froalaView>
                    </div>
                    <div 
                        v-if="editModeComputed && !executionFinalized" 
                        style="margin:0px 10px 10px 10px;">
                        <froala-edit 
                            ref="froalaWrapperComponent"
                            :tag="'textarea'" 
                            :content="content" 
                            :customConfig="config"
                            :handleInputChange="updateFrolaValue">
                        </froala-edit>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { timesince } from './filters';
    import {coreExecutionUrls, coreProcedureUrls, fileServerUrls, fileServerUrl} from '../../api/core-urls';
    import {getJwt, getUsername} from './utils';
    import IngModal from "./IngModal.vue";

    import { mapGetters, mapActions } from "vuex";
    import FroalaEdit from "./FroalaEdit.vue";

    export default {
        name: "IngComment",
        data() {
            return {
                editMode: false,
                showModal: false,
                content: "",
                fileIdLookup: {}  // {fileUrl: file_id}
            };
        },
        components: {
            'froala-edit': FroalaEdit,
            'ing-modal': IngModal
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
            },
            commentId: {
                type: String,
                default: ''
            },
            mode: {
                type: String,
                default: ''
            }
        },
        created() {
            this.content = this.elementComment.content;
            this.fileConfig();
        },
        watch:{
            // We are using this.content because of how Froala is managing events.
            // We are watching this element to update value of this.content everytime the watcher page has new comment.
            elementComment: function(value) {
                this.content = value.content;
            },
            editModeComputed: {
                handler(value) {
                    if(value && this.execution && this.execution.status == 'RUNNING') {
                        this.toggleExecutionFollow(false);
                    }
                },
                // immediate is set to trigger the callback immediately with the current value of the expression.
                // This also triggers the event when the Comment component is initialized.
                immediate: true
            }
        },
        computed: {
            ...mapGetters([
                "comment",
                "expandedComment",
                "execution",
                "executionFinalized"
            ]),
            config: function() {
                return {
                    // Editor overall
                    // Related to image upload
                    imageUploadParams: {
                        execution_id: this.executionId,
                        elem_id: this.elementId,
                    },

                    // Related to file upload
                    fileUploadParams: {
                        execution_id: this.executionId,
                        elem_id: this.elementId,
                    },

                    events: {
                        // Related to image upload
                        'image.beforeUpload': this.beforeImgUploadHandler,
                        'image.uploaded': this.afterImgUploadedHandler,
                        'image.removed': this.imageRemovedHandler,

                        // Related to file upload
                        'file.beforeUpload': this.beforeFileUploadHandler,
                        'file.uploaded': this.afterFileUploadedHandler,
                        'file.unlink': this.fileUnlinkHandler,
                        'blur': this.updateExistingComment,
                    },
                };
            },
            elementComment: function() {
                return this.comment(this.elementId, this.conversationId, this.commentId);
            },
            editModeComputed: function() {
                if((this.expandedComment == this.commentId) && (this.elementComment && this.elementComment.user_name === getUsername())) return true;
                else return this.editMode;
            },
            canModifyComment: function() {
                // edit or delete
                return this.elementComment.user_name === getUsername() || this.$can(['update'], 'Admin') ? true : false;
            },
            canEditComment: function() {
                // edit
                return this.elementComment.user_name === getUsername();
            },
        },
        methods: {
            ...mapActions([
                "deleteComment",
                "editComment",
                "clearExpandedEdit",
                "deleteExecutionConversationCommentFile",
                "deleteProcedureConversationCommentFile",
                "toggleExecutionFollow"
            ]),
            fileConfig: function() {
                let fileData = {};
                this.comment(this.elementId, this.conversationId, this.commentId).files.forEach(file => {
                    fileData[`${fileServerUrl}${file.url}`] = file.file_id;
                });
                this.fileIdLookup = fileData;
            },
            updateFrolaValue: function(value){
                this.content = value;
            },
            convertTime: function(time) {
                return timesince(time);
            },
            // Related to image upload
            beforeImgUploadHandler: function(images) {
                if (images.length !== 1){
                    return false;  // Stop image upload if there is no image or more than 1 images
                }
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.imageUploadParams.file_name = images[0].name;
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.requestHeaders.Authorization = 'Bearer ' + getJwt();
                
                // check if authoring, if so grab version
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.imageUploadURL =
                    this.mode != "authoring" 
                        ? coreExecutionUrls.conversationCommentFiles(this.executionId, this.elementId, this.conversationId, this.commentId) 
                        : coreProcedureUrls.versionedConversationCommentFiles(this.executionId, this.version, this.elementId, this.conversationId, this.commentId);
            },
            afterImgUploadedHandler: function(response) {

                // Create the link and insert it to the editor
                try {
                    if (response) {
                        const responseJson = JSON.parse(response);
                        const fileUrl = fileServerUrls.fileGet(responseJson.url);
                        this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.image.insert(
                            fileUrl,
                            false,
                            null,
                            this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.image.get(),
                            response
                        );

                        this.fileIdLookup[fileUrl] = responseJson.file_id;

                        return false;  // Prevent Froala from further processing response
                    }
                }
                catch(error) {
                    // In case error, let Froala to display error message at UI
                    /* eslint-disable no-console */
                    console.log(error);
                    /* eslint-enable no-console */
                }
            },
            imageRemovedHandler: function(image) {
                // Note: Image is a jQuery object of the image to be removed
                const imageSrc = image.attr('src');
                // convert %20 to spaces, etc.
                const imageSrcDecoded = decodeURI(imageSrc);
                const fileId = this.fileIdLookup[imageSrcDecoded];
                if(this.mode != "authoring" ) {
                    if (fileId) {
                        this.deleteExecutionConversationCommentFile({
                            elementId: this.elementId,
                            conversationId: this.conversationId,
                            commentId: this.commentId,
                            fileId: fileId
                        });
                        delete this.fileIdLookup[imageSrcDecoded];
                    } else {
                        console.warn(`image association was not found. commentId: ${this.commentId} imageSrcDecoded: ${imageSrcDecoded}`);
                    }
                } else {
                    if (fileId) {
                        this.deleteProcedureConversationCommentFile({
                            version: this.version,
                            elementId: this.elementId,
                            conversationId: this.conversationId,
                            commentId: this.commentId,
                            fileId: fileId
                        });
                        delete this.fileIdLookup[imageSrcDecoded];
                    } else {
                        console.warn(`image association was not found. commentId: ${this.commentId} imageSrcDecoded: ${imageSrcDecoded}`);
                    }
                }
            },


            // Related to file upload
            beforeFileUploadHandler: function(files) {
                if (files.length !== 1){
                    return false;  // Stop image upload if there is no image or more than 1 images
                }
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.fileUploadParams.file_name = files[0].name;
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.requestHeaders.Authorization = 'Bearer ' + getJwt();
                
                // check if authoring, if so grab version
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.fileUploadURL =
                    this.mode != "authoring" 
                        ? coreExecutionUrls.conversationCommentFiles(this.executionId, this.elementId, this.conversationId, this.commentId) 
                        : coreProcedureUrls.versionedConversationCommentFiles(this.executionId, this.version, this.elementId, this.conversationId, this.commentId);
            },
            afterFileUploadedHandler: function(response) {

                // Create the link and insert it to the editor
                try {
                    if (response) {
                        const responseJson = JSON.parse(response);
                        const fileUrl = fileServerUrls.fileGet(responseJson.url);
                        this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.file.insert(
                            fileUrl,
                            responseJson.file_name,
                            response
                        );

                        this.fileIdLookup[fileUrl] = responseJson.file_id;

                        return false;  // Prevent Froala from further processing response
                    }
                }
                catch(error) {
                    /* eslint-disable no-console */
                    console.log(error);  // log the error at console
                    /* eslint-enable no-console */
                    // Note: Froala will display an error message at UI when it fails to parse the response
                }
            },
            fileUnlinkHandler: function(link) {
                // Note: Link is the DOM object of the link removed
                const linkHref = link.attributes.href.value;
                /* eslint-disable no-console */
                console.log('linkHref: ', linkHref);
                /* eslint-enable no-console */
                // convert %20 to spaces, etc.
                const linkHrefDecoded = decodeURI(linkHref);
                const fileId = this.fileIdLookup[linkHrefDecoded];

                if (this.mode != "authoring") {
                    if (fileId) {
                        this.deleteExecutionConversationCommentFile({
                            elementId: this.elementId,
                            conversationId: this.conversationId,
                            commentId: this.commentId,
                            fileId: fileId
                        });
                        delete this.fileIdLookup[linkHrefDecoded];
                    } else {
                        console.warn(`file association was not found. commentId: ${this.commentId} linkHrefDecoded: ${linkHrefDecoded}`);
                    }
                } else {
                    if (fileId) {
                        this.deleteProcedureConversationCommentFile({
                            version: this.version,
                            elementId: this.elementId,
                            conversationId: this.conversationId,
                            commentId: this.commentId,
                            fileId: fileId
                        });
                        delete this.fileIdLookup[linkHrefDecoded];
                    } else {
                        console.warn(`file association was not found. commentId: ${this.commentId} linkHrefDecoded: ${linkHrefDecoded}`);
                    }
                }
            },

            // Related to comment overall
            updateExistingComment: function() {
                this.editMode = false;
                
                const editorContent = this.content;
                this.editComment({
                    version: this.version,
                    executionId: this.executionId, 
                    elementId: this.elementId, 
                    conversationId: this.conversationId, 
                    commentId: this.commentId,
                    comment: {
                        editorContent
                    }
                });
                this.content = editorContent;
                this.clearExpandedEdit();
            },
            toggleCommentSection: function() {
                this.showAddComment = !this.showAddComment;
            },
            cancelCallback: function() {
                this.editMode = false; 
                this.clearExpandedEdit();
            },
            activateCommentEditMode: function() {
                if (this.executionFinalized) {
                    return;
                }
                if (this.canEditComment) {
                    this.editMode = true;
                }
            },
            close: function() {
                this.$emit('close');
            },
            handleDelete: function() {
                this.deleteComment({
                    version: this.version,
                    executionId:this.executionId, 
                    elementId:this.elementId, 
                    conversationId:this.conversationId, 
                    commentId:this.commentId});
                this.showModal=false;
            }
        }
    };
</script>

<style>

</style>

