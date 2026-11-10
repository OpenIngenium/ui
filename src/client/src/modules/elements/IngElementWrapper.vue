<template>
    <div>
        <ing-tag-toolbar
            v-if="mode == 'authoring'"
            v-on:newTag="handleNewTag"
            v-on:deleteTag="handleDeleteTag"
            v-on:editTag="handleEditTag">
        </ing-tag-toolbar>
        
        <!-- Scroll Up -->
        <!-- distance: for direction="top" it is measured from the top of the page, so this
             loads the previous step while the page is within 500px of the top instead of
             only when it is scrolled all the way up. The scroll position is kept after
             loading (getTopElemHeight) instead of being reset to near the top.
             keep-alive: ing-vue-infinite-loading's destroyed() hook has a typo
             (`!this.status !== STATUS.COMPLETE`, always true) that unconditionally calls
             the module-level throttleer.reset(), wiping any pending scroll check queued by
             the *other* sentinel below. v-if toggles this sentinel on/off whenever the top
             of the whole list is reached, so that reset can fire often. keep-alive swaps in
             deactivated()/activated() instead of destroyed()/created(), which does not touch
             throttleer, so a toggle here can no longer cancel a pending load on the other end. -->
        <keep-alive>
            <infinite-loading
                v-if="hasAdditionalElementsBefore"
                direction="top"
                @infinite="scrollUpHandler"
                :getTopElemHeight="getTopElemHeight"
                :distance="500">
            </infinite-loading>
        </keep-alive>
        
        <ol data-target-only="true"
            ref="stepsCanvas"
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
        <!-- distance: load the next step while the end of the rendered steps is still within
             500px below the screen, instead of only once it has been reached.
             keep-alive: see the note on the top sentinel above. -->
        <keep-alive>
            <infinite-loading
                v-if="hasAdditionalElementsAfter"
                direction="bottom"
                @infinite="scrollDownHandler"
                :topHeightRemoved="topHeightRemoved"
                :distance="500">
            </infinite-loading>
        </keep-alive>

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
            // Height that paging down removes from the top of the canvas. infinite-loading
            // shifts the scroll position by this amount to keep the view steady, so it has
            // to be exact. Paging removes the step *and* the drop target / gap rendered
            // after it, so measure up to the next step: clientHeight of the step alone
            // misses the drop target (13px), the gap margin, element margins and the
            // current-step border. That error is re-applied on every page, and
            // infinite-loading keeps paging while the sentinel stays in range, so a burst
            // of pages accumulates it into a visible scroll away from the running step.
            // Steps are read from the DOM rather than from a v-for $ref: Vue 2 appends
            // refs of newly created components to the end of the array, so after paging
            // up (or a follow jump backwards) $refs[0] is no longer the top step.
            getTopElemHeight() {
                const canvas = this.$refs.stepsCanvas;
                if (!canvas) {
                    return 0;
                }

                const steps = Array.from(canvas.children).filter(child => child.classList.contains('step-container'));
                const topElem = steps[0];
                if (!topElem) {
                    return 0;
                }

                const nextElem = steps[1];
                if (nextElem) {
                    return nextElem.getBoundingClientRect().top - topElem.getBoundingClientRect().top;
                }

                return topElem.getBoundingClientRect().height;
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
                if (!el) {
                    console.warn('scrollToById el not found');
                    return;
                }

                let pos = el.style.position;
                let top = el.style.top;
                el.style.position = 'relative';
                el.style.top = '-250px';
                el.scrollIntoView({behavior: "auto", block: "start"});
                el.style.top = top;
                el.style.position = pos;

                // infinite-loading restores the scroll position it saved before paging in
                // a $nextTick of its own, which lands after this scroll and would undo it.
                // Re-assert the position we actually reached once on the next frame so the
                // step being executed stays in focus.
                const expectedTop = el.getBoundingClientRect().top;
                if (typeof window.requestAnimationFrame === 'function') {
                    window.requestAnimationFrame(() => {
                        const current = document.getElementById(elementId);
                        if (!current) {
                            return;
                        }
                        const drift = current.getBoundingClientRect().top - expectedTop;
                        if (Math.abs(drift) > 1) {
                            window.scrollBy(0, drift);
                        }
                    });
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

