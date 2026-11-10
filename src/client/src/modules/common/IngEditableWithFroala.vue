<template>
    <div class="row">
        <template v-if="disabled">
            <div class="col-xs-12" :class="inputClasses">
                <froalaView v-model="valueTemp"></froalaView>
            </div>
        </template>
        <template v-else>
            <template v-if="editing">
                <div class="col-xs-12">
                    <textarea
                        v-if="!useFroala"
                        ref="executionDescription"
                        v-model="froalaValue"
                        class="form-control"
                        @blur="this.confirmEdit"
                        rows="3"></textarea>
                    <froala-edit 
                        ref="froalaWrapperComponent"
                        v-if="useFroala" 
                        :content="valueTemp" 
                        :customConfig="config"
                        :handleInputChange="updateFrolaValue">
                    </froala-edit>
                </div>
            </template>
            <template v-else>
                <div class="col-xs-12" @click="toggleEdit(true)">
                    <p v-if="froalaValue && !useFroala" :class="inputClasses">{{ froalaValue }}</p> 
                    <div v-else-if="value && useFroala" :class="inputClasses">
                        <froalaView v-model="value"></froalaView>
                    </div>
                    <div class="print-hide" v-else-if="!this.disabled" :class="inputClasses">
                        {{promptText}}
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
    import {coreExecutionUrls, coreProcedureUrls, fileServerUrls, fileServerUrl} from '../../api/core-urls';
    import {getJwt} from './utils';
    import FroalaEdit from "./FroalaEdit.vue";
    
    export default {
        name: "IngEditableWithFroala",
        components: {
            'froala-edit': FroalaEdit
        },
        props: {
            elementId: {
                type: String,
                required: false,
            },
            promptText: {
                type: String,
                required: false,
                default: '<<Click to add description>>'
            },
            value: {
                type: String,
                required: false,
            },
            disabled: {
                type: Boolean,
                default: false
            },
            useFroala: {
                type: Boolean,
                required: false,
                default: true
            },
            inputClasses: {
                type: String,
                required: false
            },
        },
        data: function() {
            return {
                editing: false,
                fileIdLookup: {},  // {fileUrl: file_id}
                valueTemp: ''
            };
        },
        watch: {
            value: function(value){
                this.froalaValue = value;
            }
        },
        created() {
            this.fileConfig();
        },
        computed: {
            ...mapGetters([
                'executionId',
                'procedureId',
                'mode',
                'elementKey'
            ]),
            froalaValue: {
                get() { return this.valueTemp; },
                set(val) { this.valueTemp = val; }
            },
            config: function() {
                return {
                    // Editor overall
                    width: '100%',
                    // Related to image upload
                    imageUploadURL: this.mode == 'authoring' ? coreProcedureUrls.elementFile(this.procedureId, this.elementId) : coreExecutionUrls.elementFile(this.executionId, this.elementId),
                    imageUploadParams: {
                        execution_id: this.mode == 'authoring'? this.procedureId: this.executionId,
                        elem_id: this.elementId,
                    },
                    // Related to file upload
                    fileUploadURL: this.mode == 'authoring' ? coreProcedureUrls.elementFile(this.procedureId, this.elementId) : coreExecutionUrls.elementFile(this.executionId, this.elementId),
                    fileUploadParams: {
                        execution_id: this.mode == 'authoring'? this.procedureId: this.executionId,
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
                        'blur': this.confirmEdit,
                    }
                };
            }
        },
        methods: {
            ...mapActions([
                'deleteProcedureElementFile',
                'deleteExecutionElementFile'
            ]),
            fileConfig: function() {
                let fileData = {};
                let files = this.elementKey(this.elementId, 'files') ? this.elementKey(this.elementId, 'files') : [];
                files.forEach(file => {
                    fileData[`${fileServerUrl}${file.url}`] = file.file_id;
                });
                this.fileIdLookup = fileData;
            },
            updateFrolaValue: function(value){
                this.valueTemp = value;
            },
            // Editor overall
            toggleEdit: function(enable) {
                this.editing = enable;
                if(enable) {
                    this.$nextTick(() => { if(this.$refs.executionDescription) this.$refs.executionDescription.focus(); });
                }
            },
            confirmEdit: function() {
                if(this.value != this.valueTemp) {
                    this.froalaValue = this.valueTemp;
                    this.$emit('save', this.froalaValue);
                }
                //this.editing = false;
                this.toggleEdit(false);
            },

            // Related to image upload
            beforeImgUploadHandler: function(images) {
                if (images.length !== 1){
                    return false;  // Stop image upload if there is no image or more than 1 images
                }
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.imageUploadParams.file_name = images[0].name;
                this.$refs.froalaWrapperComponent.$refs.froalaEditor._$editorObject.opts.requestHeaders.Authorization = 'Bearer ' + getJwt();
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
                        /* eslint-disable no-console */
                        console.log('fileUrl: ', fileUrl);
                        /* eslint-enable no-console */

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
                const imageSrcDecoded = decodeURI(imageSrc);
                const fileId = this.fileIdLookup[imageSrcDecoded];
                if(this.mode == 'authoring') {
                    if (fileId) {
                        this.deleteProcedureElementFile({
                            elementId: this.elementId,
                            fileId: fileId,
                        });
                        delete this.fileIdLookup[imageSrcDecoded];
                    } else {
                        console.warn(`image association was not found. elementId: ${this.elementId} imageSrcDecoded: ${imageSrcDecoded}`);
                    }
                } else {
                    if (fileId) {
                        this.deleteExecutionElementFile({
                            elementId: this.elementId,
                            fileId: fileId,
                        });
                        delete this.fileIdLookup[imageSrcDecoded];
                    } else {
                        console.warn(`image association was not found. elementId: ${this.elementId} imageSrcDecoded: ${imageSrcDecoded}`);
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
                const linkHrefDecoded = decodeURI(linkHref);
                const fileId = this.fileIdLookup[linkHrefDecoded];

                if(this.mode == 'authoring') {
                    if (fileId) {
                        this.deleteProcedureElementFile({
                            elementId: this.elementId,
                            fileId: fileId,
                        });
                        delete this.fileIdLookup[linkHrefDecoded];
                    } else {
                        console.warn(`file association was not found. elementId: ${this.elementId} linkHrefDecoded: ${linkHrefDecoded}`);
                    }
                } else {
                    if (fileId) {
                        this.deleteExecutionElementFile({
                            elementId: this.elementId,
                            fileId: fileId,
                        });
                        delete this.fileIdLookup[linkHrefDecoded];
                    } else {
                        console.warn(`file association was not found. elementId: ${this.elementId} linkHrefDecoded: ${linkHrefDecoded}`);
                    }
                }
            },
        },
        beforeMount: function() {
            this.valueTemp = this.value;
        }
    };
</script>

<style scoped>
    /* Froala buttons */
    .margin-left-5 {
        margin-left: 5px;
    }
    .margin-top-10 {
        margin-top: 10px;
    }

    .froala-non-edit {
        padding-left: 12px;
    }

    /* z-index: 1 !important; position: relative !important; */
    .fr-box {
        z-index: inherit;
    }
    
    .fr-box >>> .fr-toolbar {
        z-index: 0;
    }

    .fr-box >>> .fr-wrapper {
        z-index: 0;
    }

    .full-width-2-line-description {
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
    }

    @media print {
        .print-hide{ 
            display:none;
        }
    }
/* import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css'; */
    @import '~froala-editor/css/froala_editor.pkgd.min.css';
    /* @import '~font-awesome/css/font-awesome.css'; */
    @import '~froala-editor/css/froala_style.min.css';
</style>
