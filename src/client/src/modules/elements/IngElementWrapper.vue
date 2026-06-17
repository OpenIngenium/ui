<template>
    <div>
        <ing-tag-toolbar
            v-if="mode == 'authoring'"
            v-on:newTag="handleNewTag"
            v-on:deleteTag="handleDeleteTag"
            v-on:editTag="handleEditTag">
        </ing-tag-toolbar>
        
        <!-- Scroll Up -->
        <infinite-loading
            v-if="hasAdditionalElementsBefore"
            direction="top"
            @infinite="scrollUpHandler"
            :scrollTopPreset="20"
            :distance="5">
        </infinite-loading>
        
        <ol data-target-only="true"
            class="steps_list drag-area"
            id="steps_canvas"
            v-bind:class="{ 'no-elements': !this.anyElements }">

            <ing-workflow
                v-if="execution && !isAuthoringMode"
                workflow-type="ACTIVITY_REPORT"
                :execution-id="execution.execution_id"
                :value="execution.activity_report_content"></ing-workflow>
            <ing-workflow
                v-if="execution && !isAuthoringMode"
                workflow-type="DATA_REVIEW"
                :execution-id="execution.execution_id"
                :value="execution.data_review_content"></ing-workflow>

            <!-- Insert step before the first step in viewport -->
            <drop-place-holder
                v-if="canParticipate && !disableDropTarget"
                previousElementId="-1"
                :execution-id="procedureOrExecutionId"
            >
            </drop-place-holder>
            <div v-else class="step-gap"></div>
            <!-- Loop through steps -->
            <template v-for="element in elements">
                <ing-element
                    v-if="getElementMap(element)"
                    class="step-container"
                    :key="element.elem_id"
                    ref="viewElemRef"
                    :element-map="getElementMap(element)"
                    :step-data="element">
                </ing-element>
                <drop-place-holder
                    v-if="canParticipate && !disableDropTarget"
                    :key="'target-' + element.elem_id"
                    :previousElementId="element.elem_id"
                    :execution-id="procedureOrExecutionId"
                >
                </drop-place-holder>
                <div v-else class="step-gap" :key="`${element.elem_id}-placeholder`"></div>
            </template>
        </ol>
        <!-- Scroll Down -->
        <infinite-loading
            v-if="hasAdditionalElementsAfter"
            direction="bottom"
            @infinite="scrollDownHandler"
            :topHeightRemoved="topHeightRemoved"
            :distance="5">
        </infinite-loading>

        <!-- Redline Justification Modal -->
        <ing-modal v-show="redlineJustificationModal" @close="handleJustificationModalClose()">
            <template slot="title">
                <h4> <span class="glyphicon glyphicon-plus"></span> Provide Justification to Redline/Blueline</h4>
            </template>
            <template slot="body">
                <p>{{bulkJustificationModalMessage}}</p>
                <div class="form-group">
                    <label for="justification-description">
                        Justification
                    </label>
                    <textarea id="justification-description" class="form-control" style="width: 100%" v-model="procedureModificationJustification" placeholder="Click to add justification"></textarea>
                </div>
                <div class="redline-blueline-toggle">
                    <div class="btn-group btn-group-toggle">
                        <label 
                            class="label-btn-radius btn" 
                            :class="`${modificationType == 'REDLINE' ? 'redline-btn' : 'default-btn'}`">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="'REDLINE'" 
                                id="redline" 
                                v-model="checkRedline"> Redline
                        </label>
                        <label 
                            class="label-btn-radius btn" 
                            :class="`${modificationType == 'BLUELINE' ? 'blueline-btn' : 'default-btn'}`">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="'BLUELINE'" 
                                id="blueline" 
                                v-model="checkRedline"> Blueline
                        </label>
                    </div>
                </div>
            </template>
            <template slot="footer">
                <button type="button" class="btn pull-left" @click="handleJustificationModalClose()">Cancel</button>
                <button type="button" class="btn btn-primary pull-right" @click="handleApplyJustification()">Apply</button>
            </template>
        </ing-modal>
        
    </div>
</template>

<script>
    import {mapGetters, mapActions} from "vuex";
    import DropPlaceHolder from "./DropPlaceHolder.vue";
    import IngWorkflow from "./IngWorkflow.vue";
    import IngModalVue from '../common/IngModal.vue';
    import InfiniteLoading from 'ing-vue-infinite-loading';
    import IngTagToolbar from './IngTagToolbar.vue';
    import Vue from 'vue';
    
    Vue.use(InfiniteLoading);    

    export default {
        name: "IngElementWrapper",
        props: {
            showElementWrapper: {
                type: Boolean,
                default: true
            }
        },
        components: {
            'infinite-loading': InfiniteLoading,
            'drop-place-holder': DropPlaceHolder,
            'ing-workflow': IngWorkflow,
            'ing-modal' : IngModalVue,
            'ing-tag-toolbar': IngTagToolbar  
        },
        data() {
            return {
                tooltips: [
                    { pasteButton: "Click to paste content after the specified step " },
                    { cancelButton: "Click to discard copy" }
                ],
                isViewportInitialLoad: true,
                scrollToElementIdAfterUpdate: '',
                topHeightRemoved: 0,
                procedureModificationJustification: '',
                modificationType: 'REDLINE'
            };
        },
        mounted() {
            window.addEventListener('beforeunload', this.cachePreviousView);
        },
        updated() {
            if (this.scrollToElementIdAfterUpdate !== '') {
                this.scrollToById(this.scrollToElementIdAfterUpdate);
                this.scrollToElementIdAfterUpdate = '';
            }
        },
        watch: {
            scrollToElement: function(newValue) {
                if (newValue.elementId && this.elements.length) {
                    const i = this.elementIds.indexOf(newValue.elementId);
                    if (i >= 0) {
                        this.scrollToElementIdAfterUpdate = newValue.elementId;
                        // make sure updated() is called when the view window does not change.
                        this.$forceUpdate();
                    } else {
                        console.warn(`WATCH Not found i: ${i} viewportTopPointer: ${this.viewportTopPointer}`);
                    }
                }
            },
            filteredElementIds: function(newValue) {
                if (newValue && newValue.length > 0) {
                    // handle id in query parameter
                    if (this.isViewportInitialLoad && this.elementFromURL) {
                        this.editScrollToElementId({id: this.elementFromURL});
                        this.isViewportInitialLoad = false;
                    }
                    // handle initial page load, load previous "position" from local storage
                    else if (this.isViewportInitialLoad) {
                        this.reloadPreviousView(this.topPointerKey, this.yPositionKey);
                        this.isViewportInitialLoad = false;
                    }
                }
            },
        },
        computed: {
            ...mapGetters([
                "execution",
                "canParticipate",
                "isTestConductor",
                "procedurePreviewElementIds",
                "elements",
                "element",
                "elementIds",
                "viewportTopPointer",
                "scrollToElement",
                "hasAdditionalElementsBefore",
                "hasAdditionalElementsAfter",
                "anyFilter",
                "conversations",
                "pageTitle",
                "mode",
                "procedureDetails",
                "procedureModificationModal",
                "bulkJustificationModalMessage",
                "filteredElementIds",
                "isAuthoringMode",
            ]),
            venueId: function() {
                return this.venue.venue_id;
            },
            anyElements: function() {
                return this.elementsByParent('').length ? true : false;
            },
            rootElements: function() {
                return this.elementsByParent('').filter(
                    (elem) => !this.procedurePreviewElementIds.includes(elem.elem_id)
                );
            },
            procedureOrExecutionId: function() {
                if (this.mode === 'authoring') {
                    return this.procedureId;
                } else {
                    return this.executionId;
                }
            },
            disableDropTarget: function() {
                // disable drop target if filters are active
                return !this.isAllowEdit || this.anyFilter;
            },
            procedureTags: function() {
                if(this.procedureDetails)
                    return this.procedureDetails.tags;
                return [];
            },
            topPointerKey: function() {
                if (this.mode === 'execution') {
                    return `execution_${this.executionId}_viewportTopPointerID`;
                } else if (this.mode === 'as-run') {
                    return `asRun_${this.executionId}_viewportTopPointerID`;
                } else if (this.mode === 'authoring') {
                    return `authoring_${this.$route.params.procedureId}_${this.$route.params.version}_viewportTopPointerID`;
                } else {
                    return '';
                }
            },
            yPositionKey: function() {
                if (this.mode === 'execution') {
                    return `execution_${this.executionId}_savedYPos`;
                } else if (this.mode === 'as-run') {
                    return `asRun_${this.executionId}_savedYPos`;
                } else if (this.mode === 'authoring') {
                    return `authoring_${this.$route.params.procedureId}_${this.$route.params.version}_savedYPos`;
                } else {
                    return '';
                }
            },
            redlineJustificationModal: {
                get() {
                    return this.procedureModificationModal;
                },
                set(val) {
                    this.toggleProcedureModificationModal(val);
                }
            },
            checkRedline: {
                get() {
                    return this.modificationType;
                },
                set(val) {
                    this.modificationType = val;
                }
            },
            elementFromURL: function() {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                if (id) {
                    return id;
                } else {
                    return '';
                }
            }
        },
        methods: {
            ...mapActions([
                "saveExecution",
                "toggleElemFilter",
                "editScrollToElementId",
                "scrollElements",
                "addProcedureTag",
                "removeProcedureTag",
                "editProcedureTag",
                "setViewportTopPointer",
                "toggleProcedureModificationModal",
                "saveBulkJustificationElements"
            ]),
            cachePreviousView: function() {
                if (this.elements && this.elements[0] && this.elements[0].elem_id) {
                    window.localStorage.setItem(this.topPointerKey, this.elements[0].elem_id);
                    window.localStorage.setItem(this.yPositionKey, document.documentElement.scrollTop.toString());
                }
            },            
            reloadPreviousView: function(topPointerKey, yPositionKey) {
                const previousViewportTopPointerID = window.localStorage.getItem(topPointerKey);
                const previousYPosition = window.localStorage.getItem(yPositionKey);
                if (previousViewportTopPointerID && previousYPosition) {
                    const previousViewportTopPointer = this.elementIds.indexOf(previousViewportTopPointerID);
                    if (previousViewportTopPointer > -1) {
                        this.setViewportTopPointer({index: previousViewportTopPointer});
                        // scroll after page has been rendered
                        Vue.nextTick(function() {
                            window.scrollTo(0, previousYPosition);
                        });
                    }
                }
            },
            nextElementId: function(elementId) {
                let nextElementId = '';                
                const idx = this.elementIds.indexOf(elementId);

                if (idx > -1) {
                    if (idx < this.elementIds.length) {
                        nextElementId = this.elementIds[idx+1];
                    }
                }
                // console.log(`nextElementId idx: ${idx} nextElementId: ${nextElementId}`);
                return nextElementId;
            },
            nextElementParentId: function(elementId) {
                let nextParentId = '';                
                const nextElementId = this.nextElementId(elementId);                
              
                if (nextElementId !== '') {                  
                    const nextParentElem = this.element(nextElementId);

                    if (nextParentElem) {
                        nextParentId = nextParentElem.parent_id;
                    }
                }
                // console.log(`nextElementParentId nextParentId: ${nextParentId}`);
                return nextParentId;                
            },            
            getTopElemHeight() {
                const topElem = this.$refs.viewElemRef[0];
                return topElem ? topElem.$el.clientHeight : 0;
            },
            scrollUpHandler: async function(state) {
                await this.scrollElements({scrollDirection: 'up'});
                state.loaded();
            },
            scrollDownHandler: async function(state) {
                this.topHeightRemoved = -this.getTopElemHeight();                
                await this.scrollElements({scrollDirection: 'down'});
                state.loaded();
            },
            scrollToById: function(elementId, topStyle) {
                let el = document.getElementById(elementId);
                if (el) {
                    let pos = el.style.position;
                    let top = el.style.top;
                    el.style.position = 'relative';
                    el.style.top = '-250px';
                    el.scrollIntoView({behavior: "auto", block: "start"});
                    el.style.top = top;
                    el.style.position = pos;
                } else {
                    console.warn('scrollToById el not found');
                }
            },
            handleNewTag: async function(tag) {
                await this.addProcedureTag({
                    procedureId: this.procedureDetails.procedure_id,
                    tag
                });
            },
            handleDeleteTag: async function(tag) {
                await this.removeProcedureTag({
                    procedureId: this.procedureDetails.procedure_id,
                    tagId: tag.tag_id
                });
            },
            handleEditTag: async function(tag) {
                await this.editProcedureTag({
                    procedureId: this.procedureDetails.procedure_id,
                    tag
                });
            },
            handleApplyJustification: function() {
                this.saveBulkJustificationElements({
                    bulkJustificationInput: {
                        modification_type: this.checkRedline,
                        content: this.procedureModificationJustification
                    }
                });
                this.handleJustificationModalClose();
            },
            handleJustificationModalClose: function() {
                this.redlineJustificationModal = false;
                this.procedureModificationJustification = '';
                this.checkRedline = 'REDLINE';
            }
        }
    };
</script>

<style lang="scss" scoped>
    .drag-area {
        min-height: 250px;
    }
    .no-dnd-events {
        pointer-events : none;
    }
    .no-elements {
        min-height: 175px;
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
        //text-align: center;
    }

    div.copy .copy-contents .btn-group {
        margin: 0 auto;
        text-align: center;
        width: inherit;
        display: inline-block;
    }

    div.copy .copy-contents .copy-button{
        max-width: 750px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    li.placeholder:hover + div.copy{
        display: initial;
    }
    div.copy:hover {
        display: initial;
    }
    .tooltip {
        display: block !important;
        z-index: 10000;
    }

    .tooltip .tooltip-inner {
        background: black;
        color: white;
        border-radius: 16px;
        padding: 5px 10px 4px;
    }

    .tooltip .tooltip-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
    }

    .tooltip[x-placement^="top"] {
        margin-bottom: 5px;
    }

    .tooltip[x-placement^="top"] .tooltip-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .tooltip[x-placement^="bottom"] {
        margin-top: 5px;
    }

    .tooltip[x-placement^="bottom"] .tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }

    .tooltip[x-placement^="right"] {
        margin-left: 5px;
    }

    .tooltip[x-placement^="right"] .tooltip-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }

    .tooltip[x-placement^="left"] {
        margin-right: 5px;
    }

    .tooltip[x-placement^="left"] .tooltip-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
    }

    .tooltip[aria-hidden='true'] {
        visibility: hidden;
        opacity: 0;
        transition: opacity .15s, visibility .15s;
    }

    .tooltip[aria-hidden='false'] {
        visibility: visible;
        opacity: 1;
        transition: opacity .15s;
    }

    .approval-review {
        float:right;
    }

    .approval-review .active{
        color: #fff;
        background-color: #337ab7;
        border-color: #2e6da4;
    }

    .step-gap {
        margin-top: 10px;
    }

    .label-btn-radius {
        border-radius: 0 4px 4px 0 !important;
    }

    .hide-radio-circle {
        display:none;
    }

    .redline-approval-toggle{
        padding-top: 15px;
        width:50%;
    }

    .default-btn {
        background-color: #ffffff;
        color: #999;
        font-weight:bold !important;
        border-color:#999;
        height: 35px;
    }
    .redline-btn {
        background-color:#ffe7e7;
        color:#ff4d4d;
        font-weight:bold !important;
        border-color:#ff4d4d;
        height: 35px;
    }

    .blueline-btn {
        background-color: #e7f3ff;
        color: #4da6ff;
        font-weight:bold !important;
        border-color:#4da6ff;
        height: 35px;
    }

    .redline-blueline-toggle{
        margin-left:33%;
    }
</style>

