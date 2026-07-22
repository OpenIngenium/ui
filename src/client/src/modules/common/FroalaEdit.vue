<template>
    <froala ref="froalaEditor" :tag="tag" :config="froalaConfiguration" v-model="inputValue"> </froala>
</template>

<script>
    import _ from 'lodash';
    import {FROALA_COLORS, FROALA_TOOLBAR_BUTTONS, FROALA_FONTS} from './utils';

    export default {
        name: "FroalaEdit",
        data: function() {
            return {
                config:{
                    // Editor overall
                    key : "Ig1A7vB3C1B2E2F2E4E4I1CqgfkOPVi1b1b2Le2e1G1AWMSGSAFDTGHWsE7D7E6E5A1I4I4C3B6B5==",
                    attribution: false,
                    charCounterCount: false,
                    toolbarButtons: FROALA_TOOLBAR_BUTTONS,
                    quickInsertTags: '',
                    linkAlwaysBlank: true,
                    pastePlain: false, // Resolves: https://jira.jpl.nasa.gov/browse/ING-4083

                    // Fonts
                    fontFamily: FROALA_FONTS,
                    fontFamilyDefaultSelection: 'Arial',
                    fontFamilySelection: true,
                    fontSizeSelection: true,

                    // Colors
                    colorsBackground: FROALA_COLORS,
                    colorsStep: 5,
                    colorsText: FROALA_COLORS,

                    // Related to image upload
                    imageUploadParam: 'file_content',

                    // Related to file upload
                    fileUploadParam: 'file_content',
                    fileMaxSize: 1024 * 1024 * 100,

                    events: {
                        // Related to image upload
                        'image.error': function(error) {
                            /* eslint-disable no-console */
                            console.log(error);
                            /* eslint-enable no-console */
                        },

                        // Related to file upload
                        'file.error': function(error) {
                            /* eslint-disable no-console */
                            console.log(error);
                            /* eslint-enable no-console */
                        },

                        //Related to innitial setup
                        'initialized': () => { this.$refs.froalaEditor._$editorObject.events.focus(); }
                    }
                }
            };
        },
        props: {
            content: {
                type: String,
                required: false
            },
            customConfig: {
                type: Object,
                required: false
            },
            tag:{
                type: String,
                required: false
            },
            handleInputChange: {
                type: Function,
                required: true
            }
        },
        computed: {
            froalaConfiguration: function() {
                let value = {};
                _.merge(value, this.config, this.customConfig);
                return value;
            },
            inputValue: {
                get() { return this.content; },
                set(val) {
                    this.handleInputChange(val);
                }
            }
        },
        
    };
</script>
