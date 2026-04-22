<template>
    <div 
        id="authoring_page_left"
        :style="{ height: leftDivHeight }"
        class="col-xs-3">
        <div id="authoring_toolbar_wrapper">
            <div id="authoring_toolbar_top" ref="toolbarTop">
                <ing-context-menu
                    :expanded="showElementMenu"
                    :menuContext="menuContext"
                    :menuYOffset="menuYOffset"
                    :menuXOffset="menuXOffset"
                    :handleDeleteStep="handleDeleteStep"
                    :confirmRemoveElement="confirmRemoveElement"
                    :handleInsertStep="handleInsertStep"
                    :handleCutOperation="handleCopyOrPasteOperation"
                    :handlePasteOperation="handleCopyOrPasteOperation"
                    @toggle-dropdown="handleToggleDropdown" 
                    @close-dropdown="handleCollapseContextMenu"
                    @cancel-delete="handleCancelDelete"
                ></ing-context-menu>

                <configuration-management></configuration-management>
                <dictionaries 
                    v-if="isAllowEdit"
                    pagetype="authoring"></dictionaries>
            </div>
            <br><br>
            <ul class="nav nav-tabs nav-justified" id="pills-tab">
                <li class="nav-item active" v-if="isAllowEdit">
                    <a class="nav-link"
                        id="pills-home-tab"
                        data-toggle="tab"
                        href="#pills-home"
                        aria-controls="pills-home"
                        aria-selected="true">Step&nbsp;Palette</a>
                </li>
                <li :class="`nav-item ${!isAllowEdit ? 'active' : ''}`">
                    <a class="nav-link" 
                        id="pills-profile-tab" 
                        data-toggle="tab" 
                        href="#pills-profile"
                        aria-controls="pills-profile" 
                        :aria-selected="!isAllowEdit">Outline</a>
                </li>  
                <li
                    class="nav-item">
                    <a class="nav-link" 
                        id="pills-search-tab" 
                        data-toggle="tab" 
                        href="#pills-search"
                        aria-controls="pills-search" 
                        aria-selected="false">Search</a>
                </li>
                <li
                    class="nav-item">
                    <a class="nav-link" 
                        id="pills-validate-tab" 
                        data-toggle="tab" 
                        href="#pills-validate"
                        aria-controls="pills-validate" 
                        aria-selected="false">Validate</a>
                </li>
                <li 
                    v-if="!isAllowEdit" 
                    class="nav-item">
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
                    id="pills-home"
                    aria-labelledby="pills-home-tab"
                    v-if="isAllowEdit">
                    <div id="palette-left" :style="{ maxHeight: `${toolbarMaxHeight}px` }">
                        <step-palette></step-palette>
                    </div>
                </div>
                
                <div :class="`tab-pane ${!isAllowEdit ? 'active' : ''}`"
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
                            </div>

                            <!-- subtract 80px to account for extra controls at the top of outline -->
                            <div id="outline-container" :style="{ maxHeight: `${toolbarMaxHeight-80}px` }">
                                <template v-for="element in rootElements">
                                    <outline
                                        style="padding-left:0px;"
                                        :key="element.elem_id"
                                        :isAllowEdit="isAllowEdit"
                                        :title="element.title"
                                        :number="element.number"
                                        :element="element"
                                        :element-id="element.elem_id"
                                        :children="element.children"
                                        :type="element.elem_type"
                                        :collapsed="element.collapsed"
                                        :collapse="toggleOutline"
                                        :selectOrJumpToStep="selectOrJumpToStep"
                                        :jump-to-step="jumpToStep"
                                        :tagIds="element.tag_ids"
                                        :tags="procedureTagsObj"
                                        :depth="0"
                                        :toggleElementMenu="toggleElementMenu"
                                        :selectedElementIds="selectedElementIdsForThis"
                                        :filteredElementIdMap="filteredElementIdMap">
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
                        <search :replace="isAllowEdit" :jump-to-step="jumpToStep"></search>
                    </div>
                </div>
                
                <div
                    class="tab-pane"
                    id="pills-validate"
                    aria-labelledby="pills-validate-tab">
                    <div id="validate-left" :style="{ maxHeight: `${toolbarMaxHeight}px` }">
                        <validate :editable="isAllowEdit" :jump-to-step="jumpToStep"></validate>
                    </div>
                </div>

                <div 
                    v-if="!isAllowEdit" 
                    class="tab-pane"
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
    import Dictionaries from "../../common/side-panel/Dictionaries.vue";
    import StepPalette from '../../common/side-panel/StepPalette.vue';
    import Validate from '../../common/side-panel/Validate.vue';
    import ConfigurationManagement from "./ConfigurationManagement.vue";
    import Outline from '../../common/side-panel/Outline.vue';
    import Search from '../../common/side-panel/Search.vue';
    import Comments from '../../common/side-panel/Comments.vue';
    import { mapGetters, mapActions } from "vuex";
    import { getUsername } from "../../common/utils";
    import IngContextMenu from "../../common/IngContextMenu.vue";
    
    let TOOLTIPS = require('../../common/tooltip-config');

    export default {
        name: "SidePanel",
        components: {
            Dictionaries,
            StepPalette,
            ConfigurationManagement,
            Outline,
            'validate': Validate,
            'comments': Comments,
            'search': Search,
            'ing-context-menu': IngContextMenu,
        },
        data() {
            return {
                scrollY: 0,
                windowHeight: 0,
                toolbarTop: 0,
                toolbarMaxHeight: 0,  // placeholder value
                leftDivHeight: '100vh',
                currentUser: getUsername(),
                showElementMenu: false,
                confirmRemoveElement: false,
                menuContext: {},
                menuYOffset: 0,
                menuXOffset: 0
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
                "procedureVersion",
                "mode",
                "copyParams",
                "copyElemIdMap",
                "selectedElementIdsForThis",
                "selectedElementIdsForCopy",
                "selectedElementIdsForMove",
                "hasSelectedElementsForThis",
                "hasSelectedElementsToCopy",
                "hasSelectedElementsToMove",
                "selectedElement",
                "procedureDetails",
                "procedureId",
                "procedureTagsObj",
                "filteredElementIdMap"
            ]),
            rootElements: function() {
                return this.fetchOutlinePrecomputed;
            },
            isAllowEdit: function() {
                return this.$route.query.hasOwnProperty('update') && this.workingCopy && (
                    this.procedureDetails.locked_by === undefined ||
                    this.procedureDetails.locked_by === '' ||
                    this.procedureDetails.locked_by === this.currentUser);
            },
            workingCopy: function() {
                return this.procedureVersion === "0";
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
                "removeElement",
                "updateElement",
                "moveElement",
                "multiMoveElement",
                "multiCopyElement",
                "resetElementSelections",
                "createElement",
                "addCopyElemId",
                "removeCopyElemId",
                "setCopyParams",
                "loadElementSelections",
                "addElemIdRange"
            ]),
            onMouseEnter: function() {
                this.loadElementSelections();
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
            collapseElementMenu: function(clear = true) {
                this.showElementMenu = false;
                if (clear) {
                    this.menuContext = {};
                }
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
                        execution_id: undefined,
                        procedure_id: this.procedureId,
                        procedure_version: this.procedureVersion ? parseInt(this.procedureVersion) : 0,
                    };
                    
                    this.setCopyParams({copyParams});       
                } else {
                    this.editScrollToElementId({id: element.elem_id});
                }
            },
            handleDeleteStep: async function(now, element) {
                if (now) {
                    await this.removeElement({elementId: element.elem_id});
                    this.confirmRemoveElement = false;
                } else {
                    if (['SECTION', 'PROCEDURE_SECTION'].includes(element.elem_type)) {
                        this.confirmRemoveElement = true;
                    } else {
                        await this.removeElement({elementId: element.elem_id});
                        this.confirmRemoveElement = false;
                    }
                }

                this.collapseElementMenu(false);
            },
            handleCancelDelete: function() {
                this.confirmRemoveElement = false;
            },
            handleToggleDropdown: function() {
                this.showElementMenu = !this.showElementMenu;
            },
            handleCollapseContextMenu: function() {
                this.showElementMenu = false;
            },
            handleInsertStep: async function(e, {
                elementPath,
                insertAfterId,
                level
            }) {
                this.operate({
                    operation: 'INSERT',
                    elementPath,
                    insertAfterId,
                    level
                }, false);
                this.showElementMenu = false;
            },
            handleCopyOrPasteOperation: async function(e, dropdownItem) {
                if (e) {
                    e.preventDefault();
                }

                // Do not clear selected elements if ALT key was pressed
                if (e.altKey) {
                    this.operate(dropdownItem, false);
                    this.showElementMenu = false;
                } else {
                    this.operate(dropdownItem, true);
                    this.showElementMenu = false;
                }
            },
            operate: async function(dropdownItem, reset = true) {
                if (dropdownItem.operation === 'CUT') {
                    if (this.hasSelectedElementsToMove) {
                        await this.multiMoveElement({
                            executionId: this.procedureId,
                            elementIds: this.selectedElementIdsForMove, 
                            insertAfterId: dropdownItem.insertAfterId,
                            level: dropdownItem.level,
                            sourceExecutionId: this.copyParams.execution_id,
                            sourceProcedureId: this.copyParams.procedure_id,
                            sourceProcedureVersion: this.copyParams.procedure_version,
                        });
                    } else {
                        console.warn('Source element was not provided for cut/paste');
                    }
                    // always reset element selections after move
                    this.resetElementSelections();
                } else if (dropdownItem.operation === 'COPY') {
                    if (this.hasSelectedElementsToCopy) {
                        await this.multiCopyElement({
                            executionId: this.procedureId,
                            elementIds: this.selectedElementIdsForCopy, 
                            insertAfterId: dropdownItem.insertAfterId,
                            level: dropdownItem.level,
                            sourceExecutionId: this.copyParams.execution_id,
                            sourceProcedureId: this.copyParams.procedure_id,
                            sourceProcedureVersion: this.copyParams.procedure_version,
                        });
                    } else {
                        console.warn('Source element was not provided for copy/paste');
                    }

                    if (reset) {
                        this.resetElementSelections();
                    }
                } else {
                    if (dropdownItem.elementPath) {
                        await this.createElement({elementType: dropdownItem.elementPath, insertAfterId: dropdownItem.insertAfterId, level: dropdownItem.level});
                    } else {
                        console.warn(`elementType was not provided: ${dropdownItem.elementPath}`);
                    }
                }
            },
            toggleElementMenu: function(element, e) {
                if(e) e.preventDefault();

                this.menuYOffset = e.clientY;
                this.menuXOffset = e.clientX;

                this.menuContext = element;
                this.showElementMenu = true;
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
        }
    };
</script>

<style lang="scss" scoped>
    @import '../../../assets/styles/sidepanel.css';
    div#authoring_toolbar_bottom {
        margin-top: 50px;
    }

    div#authoring_page_left {
        background-color: #eee;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 15px;
        position: sticky;
        position: -webkit-sticky;
        top: 50px;
        z-index: 1;

        min-width: 400px;
    }
    div#authoring_page_left h2 {
        margin-bottom: 5px;
    }

    div#authoring_toolbar_wrapper {
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
    div#authoring_toolbar_wrapper div#authoring_toolbar_top {
        width: 100%;
    }

    div#authoring_toolbar_wrapper div#authoring_toolbar_bottom {
        width: 100%;
        max-height: 500px;
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

    #validate-left {
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

    #pills-search {
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
        div#authoring_page_left {
            display: none;
        }
        #authoring_toolbar_bottom{
            display: none;
        }
        #outline-left {
            display: none;
        }
        ul.nav{
            display:none;
        }
    }

</style>
