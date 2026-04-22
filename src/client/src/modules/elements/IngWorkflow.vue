<template>
    <div 
        style="position: relative;" 
        :id="`workflow-step-${this.workflowType}`" 
        class="page-break"
        v-if="showWorkflow">
        <li class="step workflow" :style="`border-color: ${this.workflowType == 'DATA_REVIEW' ? 'rgb(230, 173, 216);' : 'rgb(173, 216, 230);'}`">
            <div class="step_execution_details" style="font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                <span v-if="this.workflowType == 'DATA_REVIEW'">Data Review/Closeout: {{ this.execution.description }}</span>
                <span v-if="this.workflowType == 'ACTIVITY_REPORT'">Activity Report: {{ this.execution.description }}</span>
                <span class="caret-class glyphicon" :class="getCaretIcon" @click="toggleView"></span>
            </div>
            <br>
            <div class="row" v-if="showSummary">
                <div class="col-xs-12" v-if="editing">
                    <froala-edit 
                        ref="froalaWrapperComponent"
                        :content="content" 
                        :customConfig="config"
                        :handleInputChange="updateFrolaValue">
                    </froala-edit>
                </div>
                <div 
                    class="col-xs-12"
                    @click="activateEditMode"
                    v-else-if="value == ''"
                >
                    <i v-if="!executionFinalized" style="cursor:pointer;">Click to edit content</i>
                </div>
                <div 
                    class="col-xs-12"
                    @click="activateEditMode"
                    v-else>
                    <froalaView v-model="value"></froalaView>
                </div>
            </div>
        </li>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import {coreExecutionUrls, fileServerUrls} from '../../api/core-urls';
    import {getJwt} from '../common/utils';
    import FroalaEdit from "../common/FroalaEdit.vue";

    export default {
        name: "IngWorkflow",
        components: {
            'froala-edit': FroalaEdit
        },
        data: function() {
            return {
                editing: false,
                valueTemp: '',
                fileIdLookup: {}, // {fileUrl: file_id}
                showSummary: true
            };
        },
        // watch: {
        //     value: function(value) {
        //         this.froalaValue = value;
        //     }
        // },
        created() {
            this.content = this.workflowComment;
            this.fileConfig();
        },
        computed: {
            ...mapGetters([
                "execution",
                "mode",
                "executionFinalized",
            ]),
            froalaValue: {
                get() { return this.execution[this.workflowType == 'DATA_REVIEW' ? 'data_review_content' :'activity_report_content']; },
                set(val) { this.valueTemp = val; }
            },
            workflowComment: function() {
                return this.execution[this.workflowType == 'DATA_REVIEW' ? 'data_review_content' :'activity_report_content'];
            },
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
                        'blur': this.editWorkflow,
                    }
                };
            },
            getCaretIcon: function() {
                return this.showSummary ? 'glyphicon-chevron-up' :'glyphicon-chevron-down';
            },
            showWorkflow: function() {
                return this.mode !== 'authoring';
            }
        },
        props: {
            value: {
                type: String,
                required: false
            },
            workflowType: {
                type: String,
                required: true
            },
            executionId: {
                type: String,
                required: true
            }
        },
        methods: {
            ...mapActions([
                "saveExecution",
                "deleteExecutionFile"
            ]),
            fileConfig:function() {
                let fileData = {};
                this.execution.files.forEach(file => {
                    fileData[`/file_server/${file.url}`] = file.file_id;
                });
                this.fileIdLookup = fileData;
            },
            updateFrolaValue: function(value){
                this.content = value;
            },
            activateEditMode: function() {
                if (this.executionFinalized) {
                    return;
                }
                this.editing = true;
            },
            cancelEdit: function() {
                this.content = this.workflowComment;
            },
            // Related to image upload
            beforeImgUploadHandler: function(images) {
                if (images.length !== 1){
                    return false;  // Stop image upload if there is no image or more than 1 images
                }
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.imageUploadParams.file_name = images[0].name;
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.requestHeaders.Authorization = 'Bearer ' + getJwt();
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.imageUploadURL = coreExecutionUrls.files(this.executionId);
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
                this.deleteExecutionFile({
                    fileId: this.fileIdLookup[imageSrc]
                });
                delete this.fileIdLookup[imageSrc];
            },


            // Related to file upload
            beforeFileUploadHandler: function(files) {
                if (files.length !== 1){
                    return false;  // Stop image upload if there is no image or more than 1 images
                }
                
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.fileUploadParams.file_name = files[0].name;
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.requestHeaders.Authorization = 'Bearer ' + getJwt();
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.fileUploadURL = coreExecutionUrls.files(this.executionId);
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
                
                /* eslint-enable no-console */

                this.deleteExecutionFile({
                    fileId: this.fileIdLookup[linkHref]
                });
                delete this.fileIdLookup[linkHref];
            },
            editWorkflow: function() {
                const editorContent = this.content;
                const contentType = this.workflowType === 'DATA_REVIEW' ? 'data_review_content' : 'activity_report_content';
                const executionPayload = {};
                executionPayload[contentType] = editorContent;

                this.saveExecution(executionPayload);
            
                this.editing = false;
            },
            toggleView:function() {
                this.showSummary = !this.showSummary;
            }
        }
    };
</script>

<style>
    .caret-class {  
        cursor: pointer;
    }
    .step.workflow{
        background-color: white;
        border-width: 2px !important;
        margin-top: 13px !important;
        cursor: default !important;
    }
    .step_execution_details {
        padding-left: 0px;
        margin-left: 0px;
    }

    .step-draggable-area:hover {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
    }

    .step-draggable-area:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }

    li.step_organization > div.step-draggable-area {
        margin: 10px 10px 0px 10px;
    }

    .step_description {
        padding-top:5px;
    }

    .step_type_text {
        font-weight:bold;
    }

    span.step_type_text.step_organization {
        color:#31708f;
    }

    span.step_type_text.step_executable {
        color:#3c763d;
    }

    span.step_type_text.step_non_executable {
        color:#8a6d3b;
    }

    li.step_organization > div.step-draggable-area + div.step_description {
        margin-left: 10px;
    }

    li.step_organization .step_detail {
         padding:10px;
    }

    a.anchor {
        display: block;
        position: relative;
        top: -70px;
        visibility: hidden;
    }
    .no-dnd-events {
        pointer-events : none;
    }

    li.placeholder.drag-over {
        margin: 0 0 11px 0;
        border-bottom: 2px dotted #f16e00;
        position: relative;
    }

    li.placeholder.drag-over:before {
        font-family: 'Glyphicons Halflings', sans-serif;
        content: "\e092";
        position: absolute;
        left: -23px;
        top: -4px;
        font-size: 20px;
        color: #f16e00;
    }

    li.placeholder-nested.drag-over:before {
        @extend li.placeholder.drag-over:before;
        top: 0px;
    }

    li.placeholder-nested.drag-over {
        @extend li.placeholder.drag-over;
    }

    li.placeholder-nested {
        min-height: 5px;
    }

    li.placeholder-nested .dndText {
        visibility: hidden;
        background-color:white;
        position:absolute;
        top:3px;
        width:250px;
        text-overflow: ellipsis;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }

    li.placeholder-nested.drag-over .dndText {
        visibility: visible;
    }

    .procedure-modification-status{
        margin-top:10px;
    }

    .redline-blueline-indicator{
        padding:5px;
        border-radius:3px;
        float:right;
        margin-top:5px;
        font-weight:bold;
        padding:3px 5px;
        text-transform: capitalize;
        cursor:pointer;
    }

    .redline{
        border:1px solid #ff4d4d;
        background-color:#ffe7e7;
        color:#ff4d4d;
    }

    .blueline{
        border:1px solid #4da6ff;
        background-color:#e7f3ff;
        color:#4da6ff;
    }

    .approve-checkmark{
        float:right;
        color:#A3DE5F;
        margin-top:10px;
        padding-right:5px;
    }

    .redline-edit{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        border-radius:3px;
        border:1px solid gray;
        color:gray;
    }

    .redline-modify{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        border-radius:3px;
        border:1px solid gray;
        color:gray;
    }

    .procedure-modification-status-debugger{
        color:black;
        background-color:lightyellow;
        border:1px dashed black;
        border-radius:3px;
        padding:3px 5px;
        margin-top:5px;
        font-weight:bold;
    }

    .procedure-title {
        font-size:12px;
    }

    .procedure-title-non-icon {
        font-size: 12px;
        margin-left: 10px;
    }

    .deleted-title {
        border-bottom:2px dashed gray;
        color:gray;
        font-weight:bold;
        margin-bottom:-15px;
        text-align:center;
    }

    /* some pure hackery to account for consistent spacing */
    .no-entry-element-additional-margin {
        margin-top: 15px;
    }

    .comments-container-step_organization {
        padding: 0px 10px 10px 10px;
    }

    .active_breakpoint {
        color:red;
    }

    div.copy {
        margin: -40px 0 11px 0;
        border-bottom: 2px dotted #3c763d;
        position: relative;
        bottom: 15px;
        width: 100%;
        display: none;
    }

    div.copy .copy-contents {
        position: relative;
        top: 10px;
        text-align: center;
    }

    div.copy .copy-contents .btn-group {
        margin: 0 auto; 
        text-align: center;
        width: inherit;
        display: inline-block;
    }

    li.placeholder-nested:hover + div.copy{
        display: initial;
    }
    div.copy:hover {
        display: initial;
    }
    div.copy .copy-contents .copy-button{
        max-width: 750px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
