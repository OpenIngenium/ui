<template>
    <div 
        id="execution_page_left" 
        :style="{ height: leftDivHeight }"
        class="col-xs-3">
        <div id="execution_toolbar_wrapper">
            <div id="execution_toolbar_top" ref="toolbarTop">
                <status is-as-run :jump-to-step="jumpToStep"></status>
            </div>
            <br>
            <ul class="nav nav-tabs nav-justified" id="pills-tab">
                <li class="nav-item active">
                    <a class="nav-link" 
                        id="pills-profile-tab" 
                        data-toggle="tab" 
                        href="#pills-profile"
                        aria-controls="pills-profile" 
                        aria-selected="false">Outline</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" 
                        id="pills-search-tab" 
                        data-toggle="tab" 
                        href="#pills-search"
                        aria-controls="pills-search" 
                        aria-selected="false">Search</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" 
                        id="pills-review-tab" 
                        data-toggle="tab" 
                        href="#pills-review"
                        aria-controls="pills-profile" 
                        aria-selected="false">Review</a>
                </li>
            </ul>
            <div 
                class="tab-content" 
                id="pills-tabContent">
                <div class="tab-pane active" 
                    id="pills-profile"
                    aria-labelledby="pills-profile-tab">
                    <div id="outline-left" @mouseenter="onMouseEnter">
                        <div>
                            <div class="outline-top-control">
                                <div>
                                    <span
                                        @click="collapseAllOutlines"
                                        style="font-size:25px; color:blue;"
                                        type="button"
                                        class="glyphicon glyphicon-triangle-top">
                                    </span>
                                    <span
                                        @click="expandAllOutlines"
                                        style="font-size:25px; color:blue;"
                                        type="button"
                                        class="glyphicon glyphicon-triangle-bottom">
                                    </span>

                                     <button
                                        v-if="hasSelectedElementsForThis"
                                        @click="resetElementSelections"
                                        type="button"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        onclick="$(this).tooltip('hide');"
                                        :title="tooltips.clear_selections"
                                        class="btn btn-default btn-sm ing-tooltip">Clear selections
                                    </button>
                                </div>
                                <div>
                                    Follow <ing-toggle
                                    :value="outlineFollow"
                                    :clickHandler="toggleFollow"
                                    sizeClass="btn-xs"
                                    customStyle="height:20px"
                                    ></ing-toggle>
                                </div>
                            </div>
                            <!-- subtract 80px to account for extra controls at the top of outline -->
                            <div id="outline-container" :style="{ maxHeight: `${toolbarMaxHeight-80}px` }" style="padding-left:20px">
                                <template v-for="element in rootElements">
                                    <outline
                                        style="padding-left:0px;"
                                        :key="element.elem_id"
                                        :title="element.title"
                                        :number="element.number"
                                        :element="element"
                                        :breakpoint="element.break_point"
                                        :element-id="element.elem_id"
                                        :children="element.children"
                                        :modificationType="element.procedure_modification && element.procedure_modification.justification ? element.procedure_modification.justification.modification_type : ''"
                                        :modificationStatus="element.procedure_modification_status"
                                        :status="element.execution && element.execution.meta_data ? element.execution.meta_data.status : '-'"
                                        :type="element.elem_type"
                                        :collapsed="element.collapsed"
                                        :collapse="toggleOutline"
                                        :selectOrJumpToStep="selectOrJumpToStep"
                                        :jump-to-step="jumpToStep"
                                        :current-step="currentStepId"
                                        :tagIds="element.tag_ids"
                                        :tags="executionTags"
                                        :depth="0"
                                        :selectedElementIds="selectedElementIdsForThis"
                                        :filteredElementIdMap="filteredElementIdMap"
                                    >
                                    </outline>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div 
                    class="tab-pane"
                    id="pills-search"
                    aria-labelledby="pills-search-tab">
                    <div id="search-replace-left" :style="{ maxHeight: `${toolbarMaxHeight}px` }">
                        <search :jump-to-step="jumpToStep"></search>
                    </div>
                </div>

                <div class="tab-pane"
                    id="pills-review"
                    aria-labelledby="pills-review-tab">
                    <div id="review-left" :style="{ maxHeight: `${toolbarMaxHeight}px` }">
                        <comments></comments>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from "vuex";
    import IngToggle from "../../common/IngToggle.vue";
    import Search from "../../common/side-panel/Search.vue";
    import Status from "../../common/side-panel/Status.vue";
    import Outline from "../../common/side-panel/Outline.vue";
    import Comments from "../../common/side-panel/Comments.vue";

    let TOOLTIPS = require('../../common/tooltip-config');

    export default {
        name: "SidePanel",
        components: {
            Status,
            Outline,
            'comments': Comments,
            'search': Search,
            'ing-toggle': IngToggle
        },
        data() {
            return {
                scrollY: 0,
                windowHeight: 0,
                toolbarTop: 0,
                toolbarMaxHeight: 0,  // placeholder value
                leftDivHeight: '100vh',
            };
        },
        watch: {
            scrollY: function() {
                this.handleScrollOrResize();
            },
            windowHeight: function() {
                this.handleScrollOrResize();
            }
        },
        created() {
            this.scrollY = window.scrollY;
            this.windowHeight = window.innerHeight;

            window.addEventListener('scroll', this.handleScroll);
            window.addEventListener('resize', this.handleHeight);

            this.loadElementSelections();
        },
        mounted() {
            this.toolbarTop = this.$refs.toolbarTop.offsetHeight;
        },
        destroyed() {
            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleHeight);
        },
        computed: {
            ...mapGetters([
                "fetchOutlinePrecomputed",
                "outlineFollow",
                "currentStepId",
                "executionTags",
                "execution",
                "copyParams",
                "selectedElement",
                "executionId",
                "copyElemIdMap",
                "selectedElementIdsForThis",
                "hasSelectedElements",
                "hasSelectedElementsForThis",
                "filteredElementIdMap",
            ]),
            rootElements: function() {
                return this.fetchOutlinePrecomputed;
            },
            tooltips: function() {
                return TOOLTIPS.default.TOOLTIPS;
            },
        },
        methods: {
            ...mapActions([
                "editScrollToElementId",
                "toggleOutlineCollapsed",
                "toggleOutlineCollapsedAll",
                "setOutlineFollow",
                "resetElementSelections",
                "addCopyElemId",
                "setCopyParams",
                "addElemIdRange",
                "removeCopyElemId",
                "loadElementSelections",
            ]),
            onMouseEnter: function() {
                this.loadElementSelections();
            },
            toggleFollow: function() {
                this.setOutlineFollow(!this.outlineFollow);
            },
            collapseAllOutlines: function() {
                this.toggleOutlineCollapsedAll(true);
            },
            expandAllOutlines: function() {
                this.toggleOutlineCollapsedAll(false);
            },
            toggleOutline: function(elementId, e) {
                if(e) e.preventDefault();
                this.toggleOutlineCollapsed({elementId: elementId});
            },
            jumpToStep: function(id, e) {
                if(e) e.preventDefault();
                this.editScrollToElementId({id: id});
            },
            handleScroll: function() {
                this.scrollY = window.scrollY;
                this.toolbarTop = this.$refs.toolbarTop.offsetHeight;
            },
            handleHeight: function() {
                this.windowHeight = window.innerHeight;
                this.toolbarTop = this.$refs.toolbarTop.offsetHeight;
            },
            handleScrollOrResize: function() {
                this.leftDivHeight = `${this.windowHeight - 50}px`;
                
                const tabAndPaddingDelta = 150;
                this.toolbarMaxHeight = this.windowHeight - this.toolbarTop - tabAndPaddingDelta;
            },
            selectOrJumpToStep: function(element, e) {
                if (e) {
                    e.preventDefault();
                }

                if (e.metaKey || e.ctrlKey  || e.shiftKey) {
                    // reset copyElemIdMap if it doenst match current exec or proc id
                    if (this.hasSelectedElements && !this.hasSelectedElementsForThis) {
                        this.resetElementSelections();
                    }

                    if (e.shiftKey) {
                        if (!this.selectedElement(element.elem_id)) {
                            // select
                            this.addElemIdRange({ elementId: element.elem_id });
                        } else {
                            // unselect
                            this.removeCopyElemId({ elementId: element.elem_id });
                        }
                    } else if (e.ctrlKey || e.metaKey) { // CONTROL + CLICK (Windows) or COMMAND + CLICK (Mac)
                        if (!this.selectedElement(element.elem_id)) {
                            // select
                            this.addCopyElemId({ elementId: element.elem_id });
                        } else {
                            // unselect
                            this.removeCopyElemId({ elementId: element.elem_id });
                        }
                    } else {
                        console.warn(`This should not happen. metaKey: ${e.metaKey} ctrlKey: ${e.ctrlKey} shiftKey: ${e.shiftKey}`);
                    }

                    // call copy params method
                    const copyParams = {
                        copyElemIdMap: this.copyElemIdMap,
                        execution_id: this.executionId,
                        procedure_id: undefined,
                        procedure_version: undefined,
                    };

                    this.setCopyParams({copyParams});       
                } else {
                    this.editScrollToElementId({id: element.elem_id});
                }
            },
        }        
    };
</script>

<style lang="scss" scoped>
    @import '../../../assets/styles/sidepanel.css';
    div#execution_page_left {
        background-color: #eee;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 15px;
        position: sticky;
        top: 50px;
        z-index: 1;

        min-width: 400px;
    }
    div#execution_page_left h2 {
        margin-bottom: 5px;
    }

    div#execution_toolbar_wrapper {
        width: 100%;
        height: 100%;
        display: -webkit-box; /* OLD - iOS 6-, Safari 3.1-6 */
        display: -moz-box; /* OLD - Firefox 19- (buggy but mostly works) */
        display: -ms-flexbox; /* TWEENER - IE 10 */
        display: -webkit-flex; /* NEW - Chrome */
        display: flex; /* NEW, Spec - Opera 12.1, Firefox 20+ */
        -ms-flex-direction: column;
        -moz-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;
    }
    div#execution_toolbar_wrapper div#execution_toolbar_top {
        width: 100%;
        // height: 50px;
    }

    div#execution_toolbar_wrapper div#execution_toolbar_outline {
        width: 100%;
        min-height: 345px;
        // max-height: 600px;
        overflow: scroll;
        -webkit-box-flex: 1; /* OLD - iOS 6-, Safari 3.1-6 */
        -moz-box-flex: 1; /* OLD - Firefox 19- */
        -webkit-flex: 1; /* Chrome */
        -ms-flex: 1; /* IE 10 */
        flex: 1; /* NEW, */
        background-color: #ccc;
        border: 1px solid #999;
        border-radius: 4px;
        padding: 10px;
        -webkit-box-shadow: inset 0px 0px 10px 0px rgba(0,0,0,0.5);
        -moz-box-shadow: inset 0px 0px 10px 0px rgba(0,0,0,0.5);
        box-shadow: inset 0px 0px 10px 0px rgba(0,0,0,0.5);
    }

    .header {
        margin:0px;
        padding:0px;
        margin-bottom:8px;
        margin-top:10px;
    }

    .header .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px dotted #c8c8c8;
    }

    .nav-link {
        color:black;
    }


    #search-replace-left {
        width: 100%;
        overflow: scroll;

        background-color: white;
        
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        border-right: 1px solid #ddd;

        padding: 10px 10px;
        padding-bottom: 10px;
    }

    #palette-left {
        width: 100%;
        overflow: scroll;

        margin-top: -10px;
        background-color: white;
        
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        border-right: 1px solid #ddd;
        padding: 0px 10px;
        padding-bottom: 10px;
    }

    #outline-left {
        width: 100%;        
        
        background-color: white;
        
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        border-right: 1px solid #ddd;

        padding: 10px 10px;
        padding-bottom: 10px;
    }

    #review-left {
        width: 100%;
        overflow: scroll;

        background-color: white;
        
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        border-right: 1px solid #ddd;
        padding: 0px 10px;

        padding-bottom: 10px;
    }

    #pills-profile {
        height: 100%;
        background-color: white;
    }

    #pills-review {
        height: 100%;
        background-color: white;
    }

    #outline-container {
        overflow: scroll;
    }

    @media print {
        #execution_page_left{
            display: none;
        }
    }

</style>
