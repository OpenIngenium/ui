<template>
    <li class="placeholder" 
        v-drag-and-drop="{targetOnly: true}"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @dragenter="onDragEnter" 
        @dragleave="onDragLeave"
        :class="{'drag-over': active, 'keepDragOverOpen': active, 'keepMouseOverOpen': active, 'drag-area-empty-canvas': !hasElements}"
    >
        <div v-if="active" class="row">
            <div class="col-xs-1 text-right" style="padding-right: 0px;">
                <button v-if="hasSelectedElements"
                    type="button" style="border-top-left-radius: 0px; border-bottom-left-radius: 0px; margin-top: 4px;"
                    class="btn btn-default btn-xs"
                    @click="cancelCopyOperation">
                    <i data-toggle="tooltip" 
                        data-placement="top" 
                        title="Click to cancel copy/cut/paste operation"
                        style="color: #BA0C2F;"
                        class="cancel-copy glyphicon glyphicon-remove-circle">
                    </i>
                </button>
            </div>
            <div class="col-xs-10 dropdown open">
                <ul class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                    style="width: 100% !important; pointer-events: auto !important; cursor: default; padding: 0px;"
                    ref="dropdown"
                    @drop="handleDrop($event, null)"
                    >
                    <li v-if="dropdownItems.some(item => (item.operation === 'COPY'))" style="padding-left: 5px; padding-top: 5px;">Copy</li>
                    <li v-for="(dropdownItem, index) in dropdownItems.filter(item => (item.operation === 'COPY'))" 
                        v-drag-and-drop="{targetOnly: true}"
                        @drop="handleDrop($event, dropdownItem)"
                        @dragenter="onItemDragEnter(index)" 
                        :class="{'selected': dropdownItem.selected}"
                        :key="dropdownItem.insertAfterId + '-' + index"
                    >
                        <a class="dropdown-dropdownItem"
                            style="cursor: pointer;"
                            @click="handleDropdownItemClick($event, dropdownItem)"
                            v-html="dropdownItem.label"
                        >
                        </a>
                    </li>
                    <li v-if="dropdownItems.some(item => (item.operation === 'CUT'))" style="padding-left: 5px; padding-top: 5px;">Move</li>
                    <li v-for="(dropdownItem, index) in dropdownItems.filter(item => (item.operation === 'CUT'))" 
                        v-drag-and-drop="{targetOnly: true}"
                        @drop="handleDrop($event, dropdownItem)"
                        @dragenter="onItemDragEnter(index)" 
                        :class="{'selected': dropdownItem.selected}"
                        :key="'dropdown-' + dropdownItem.insertAfterId + '-' + index"
                    >
                        <a class="dropdown-dropdownItem"
                            style="cursor: pointer;"
                            @click="handleDropdownItemClick($event, dropdownItem)"
                            v-html="dropdownItem.label"
                        >
                        </a>
                    </li>
                    <li v-for="(dropdownItem, index) in dropdownItems.filter(item => (item.operation === 'INSERT'))" 
                        v-drag-and-drop="{targetOnly: true}"
                        @drop="handleDrop($event, dropdownItem)"
                        @dragenter="onItemDragEnter(index)" 
                        :class="{'selected': dropdownItem.selected}"
                        :key="'dropdown-' + dropdownItem.insertAfterId + '-' + index"
                    >
                        <a class="dropdown-dropdownItem"
                            style="cursor: pointer;"
                            @click="handleDropdownItemClick($event, dropdownItem)"
                            v-html="dropdownItem.label"
                        >
                        </a>
                    </li>
                </ul>
            </div>
            <div class="col-xs-1"></div>
        </div>

    </li>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import _ from "lodash";

    // event.DataTransfer casts all types to string so we need to set
    // any undefined vars back to their type so they aren't truthy
    function parseDataTransfer(data){
        if (data === "undefined") {
            return "";
        } else {
            return data;
        }
    }

    export default {
        name: 'DropPlaceHolder',
        props: {
            previousElementId: {
                type: String,
                required: true,
            },
            executionId: {    // this stores execution_id (for execution) or procedure_id (for authoring)
                type: String,
                required: true
            },
        },
        data() {
            return {
                dropdownItems: []
            };
        },
        mounted() {
            document.addEventListener('click', this.handleClickDropOutside);
            document.addEventListener('drop', this.handleClickDropOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickDropOutside);
            document.removeEventListener('drop', this.handleClickDropOutside);
        },
        computed: {
            ...mapGetters([
                "elementsByParent",
                "element",
                "elementIds",
                "copyParams",
                "selectedElementIds",
                "selectedElementIdsForCopy",
                "selectedElementIdsForMove",
                "hasSelectedElements",
                "hasSelectedElementsToCopy",
                "hasSelectedElementsToMove",
            ]),
            active: function() {
                return this.dropdownItems.length > 0;
            },
            hasElements: function() {
                return this.elementIds.length > 0;
            },
            isEmpty: function() {
                return this.elementIds.length === 0;
            }
        },
        methods: {
            ...mapActions([
                'createElement',
                'moveElement',
                'multiCopyElement',
                'multiMoveElement',
                'removeElement',
                'loadElementSelections',
                'resetElementSelections'
            ]),
            handleDrop: function(event, dropdownItem) {
                if (dropdownItem) {
                    // getData works only when drag starts or drop happens.
                    // So we have to get data here.
                    dropdownItem.elementPath = parseDataTransfer(event.dataTransfer.getData('elementPath'));
                    dropdownItem.draggedElementId = parseDataTransfer(event.dataTransfer.getData('elemId'));
                    try {
                        const scriptMetaRaw = event.dataTransfer.getData('scriptMeta');
                        dropdownItem.scriptMeta = scriptMetaRaw ? JSON.parse(scriptMetaRaw) : null;
                    } catch (e) {
                        dropdownItem.scriptMeta = null;
                    }

                    if (dropdownItem.elementPath) {
                        dropdownItem.operation = 'INSERT';
                    } else if (dropdownItem.draggedElementId) {
                        dropdownItem.operation = 'CUT';
                    }

                    try {
                        this.operate(dropdownItem, false);
                    } catch (error) {
                        console.error(error);
                        // error will be reported via web socket
                    }
                }

                this.deactivate();
            },
            handleDropdownItemClick: function(event, dropdownItem) {
                let keepCopy = event.altKey;
                this.operate(dropdownItem, keepCopy);
                this.deactivate();
            },
            handleClickDropOutside: function(event) {
                if (this.isEmpty) {
                    // special case when there is no element
                    // where $el covers the entire canvas.
                    if (this.$refs["dropdown"]) {
                        if (!this.$refs["dropdown"].contains(event.target)) {
                            this.deactivate();
                        }
                    }
                } else {
                    if (!this.$el.contains(event.target)) {
                        this.deactivate();
                    }
                }
            },
            operate: async function(dropdownItem, keepCopy) {
                if (dropdownItem.operation === 'CUT') {
                    if (dropdownItem.draggedElementId) {
                        // do not move onto itself
                        if (dropdownItem.draggedElementId === this.previousElementId) {
                            return;
                        }
                    
                        await this.moveElement({
                            elementId: dropdownItem.draggedElementId,
                            insertAfterId: dropdownItem.insertAfterId, 
                            level: dropdownItem.level
                        });
                    } else if (this.hasSelectedElementsToMove) {
                        await this.multiMoveElement({
                            executionId: this.executionId,
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
                    // always clear the selections after move
                    this.resetElementSelections();

                } else if (dropdownItem.operation === 'COPY') {
                    if (this.hasSelectedElementsToCopy) {
                        await this.multiCopyElement({
                            executionId: this.executionId,
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

                    if (!keepCopy) {
                        this.resetElementSelections();
                    }
                } else {
                    // insert 
                    if (dropdownItem.elementPath) {
                        await this.createElement({elementType: dropdownItem.elementPath, insertAfterId: dropdownItem.insertAfterId, level: dropdownItem.level, scriptMeta: dropdownItem.scriptMeta});
                    } else {
                        console.warn(`elementType was not provided: ${dropdownItem.elementPath}`);
                    }
                }
            },
            onMouseEnter: function() {
                this.loadElementSelections();
                if (this.hasSelectedElements) {
                    let drag_operation = '';
                    this.activate(drag_operation);
                }
            },
            onMouseLeave: function() {
                this.deactivate();
            },
            onDragEnter: function(e) {
                // ignore bubbled events from children
                if (e.target === this.$el) {
                    let drag_operation = '';
                    // types are meta data of the drag operation. Their names are in lower cases.
                    if (e.dataTransfer.types.includes('elementpath')) {
                        // element is added from step palette
                        drag_operation = 'INSERT';
                    } else if (e.dataTransfer.types.includes('elemid')) {
                        // element is moved via drag/drop
                        drag_operation = 'CUT';
                    }
                    this.activate(drag_operation);
                }
            },
            onDragLeave: function(e) {
                if (this.$refs["dropdown"]) {
                    let box = this.$refs["dropdown"].getBoundingClientRect();
                    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) {
                        this.deactivate();
                    }
                }
            },
            onItemDragEnter: function(index) {
                const dropdownItems = _.cloneDeep(this.dropdownItems);
                for (const [i, dropdownItem] of dropdownItems.entries()) {
                    dropdownItem.selected = i === index;
                }
                this.dropdownItems = dropdownItems;
            },
            activate: function(drag_operation) {
                this.dropdownItems = this.newGetDropdownItems(drag_operation);
            },
            deactivate: function() {
                this.dropdownItems = [];
            },
            newGetDropdownItems: function(operation) {
                let dropdownItems = [];

                let insertLabel = "Insert &#10132;";
                let copyPasteLabel = "";
                let copyMoveLabel = "";

                if (this.selectedElementIdsForCopy.length > 1) {
                    copyPasteLabel = `Copy-n-Paste ${this.selectedElementIds.length} elements &#10132;`;
                } else {
                    copyPasteLabel = 'Copy-n-Paste 1 element &#10132;';
                }

                if (this.selectedElementIdsForMove.length > 1) {
                    copyMoveLabel = `Cut-n-Paste ${this.selectedElementIds.length} elements &#10132;`;
                } else {
                    copyMoveLabel = 'Cut-n-paste 1 element &#10132;';
                }

                let canInsert = false;
                let canCopy = false;
                let canMove = false;
                if (operation === 'INSERT') {
                    // when adding a step
                    canInsert = true;
                } else if (operation === 'CUT') {
                    // when moving a step by drag and drop in the main canvas
                    canMove = true;
                } else {
                    // move/copy operation
                    if (this.copyParams && this.copyParams.execution_id && this.copyParams.execution_id === this.executionId) {
                        canMove = true;
                    } else if (this.copyParams && this.copyParams.procedure_id && this.copyParams.procedure_id === this.executionId) {
                        canMove = true;
                    }
                    canCopy = true;
                }

                //console.log(`canInsert: ${canInsert} canCopy: ${canCopy} canMove: ${canMove}`);

                let previousElement = this.element(this.previousElementId);

                if (previousElement) {
                    if (previousElement.elem_type === 'SECTION') {
                        // drag-n-drop move operation

                        if (canInsert) {
                            dropdownItems.push({
                                label: `${insertLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'CHILD',
                                operation: 'INSERT',
                                selected: false,
                            });
                        }
                        if (canCopy) {
                            dropdownItems.push({
                                label: `${copyPasteLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'CHILD',
                                operation: 'COPY',
                                selected: false,
                            });
                        }
                        if (canMove) {
                            dropdownItems.push({
                                label: `${copyMoveLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'CHILD',
                                operation: 'CUT',
                                selected: false,
                            });
                        }
                    } else if (previousElement.elem_type === 'PROCEDURE_SECTION') {
                        // can add a child element if procedure has been imported into the current execution
                        if (previousElement.imported && (previousElement.child_execution_id ==='')) {
                            if (canInsert) {
                                dropdownItems.push({
                                    label: `${insertLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                    insertAfterId: previousElement.elem_id,
                                    level: 'CHILD',
                                    operation: 'INSERT',
                                    selected: false,
                                });
                            }
                            if (canCopy) {
                                dropdownItems.push({
                                    label: `${copyPasteLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                    insertAfterId: previousElement.elem_id,
                                    level: 'CHILD',
                                    operation: 'COPY',
                                    selected: false,
                                });
                            }
                            if (canMove) {
                                dropdownItems.push({
                                    label: `${copyMoveLabel} child of ${previousElement.number}: ${previousElement.title}`,
                                    insertAfterId: previousElement.elem_id,
                                    level: 'CHILD',
                                    operation: 'CUT',
                                    selected: false,
                                });
                            }
                        }
                    }

                    let childElements = this.getChildElements(this.previousElementId);
                    if (childElements && (childElements.length > 0)) {
                        // cannot add as a sibling
                    } else {
                        if (canInsert) {
                            dropdownItems.push({
                                label: `${insertLabel} sibling of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'SIBLING',
                                operation: 'INSERT',
                                selected: false,
                            });
                        }
                        if (canCopy) {
                            dropdownItems.push({
                                label: `${copyPasteLabel} sibling of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'SIBLING',
                                operation: 'COPY',
                                selected: false,
                            });
                        }
                        if (canMove) {
                            dropdownItems.push({
                                label: `${copyMoveLabel} sibling of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'SIBLING',
                                operation: 'CUT',
                                selected: false,
                            });
                        }

                        while (previousElement) {
                            let parentElement = this.element(previousElement.parent_id);
                            if (parentElement) {
                                let siblingElements = this.getChildElements(parentElement.elem_id);

                                if (siblingElements && (siblingElements.length > 0) && (siblingElements[siblingElements.length-1].elem_id === previousElement.elem_id)) {
                                    if (canInsert) {
                                        dropdownItems.push({
                                            label: `${insertLabel} sibling of ${parentElement.number}: ${parentElement.title}`,
                                            insertAfterId: parentElement.elem_id,
                                            level: 'SIBLING',
                                            operation: 'INSERT',
                                            selected: false,
                                        });
                                    }
                                    if (canCopy) {
                                        dropdownItems.push({
                                            label: `${copyPasteLabel} sibling of ${parentElement.number}: ${parentElement.title}`,
                                            insertAfterId: parentElement.elem_id,
                                            level: 'SIBLING',
                                            operation: 'COPY',
                                            selected: false,
                                        });
                                    }
                                    if (canMove) {
                                        dropdownItems.push({
                                            label: `${copyMoveLabel} sibling of ${parentElement.number}: ${parentElement.title}`,
                                            insertAfterId: parentElement.elem_id,
                                            level: 'SIBLING',
                                            operation: 'CUT',
                                            selected: false,
                                        });
                                    }

                                    previousElement = parentElement;
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                } else {
                    if (canInsert) {
                        dropdownItems.push({
                            label: `${insertLabel} at the top`, 
                            insertAfterId: '-1',
                            level: 'CHILD',
                            operation: 'INSERT',
                            selected: false,
                        });
                    }
                    if (canCopy) {
                        dropdownItems.push({
                            label: `${copyPasteLabel} at the top`, 
                            insertAfterId: '-1',
                            level: 'CHILD',
                            operation: 'COPY',
                            selected: false,
                        });
                    }
                    if (canMove) {
                        dropdownItems.push({
                            label: `${copyMoveLabel} at the top`, 
                            insertAfterId: '-1',
                            level: 'CHILD',
                            operation: 'CUT',
                            selected: false,
                        });
                    }
                }

                return dropdownItems;
            },
            getChildElements: function(parentId) {
                return this.elementsByParent(parentId);
            },
            cancelCopyOperation: function() {
                this.deactivate();
                this.resetElementSelections();
            }
        },
    };
</script>
<style scoped lang="scss">
    li.placeholder {
        height: 13px;
    }

    /* Begin Style if No Elements Are Present in The Canvas */
    li.placeholder.drag-over, li.placeholder.keepDragOverOpen, li.placeholder.keepMouseOverOpen {
        margin: 0 0 11px 0;
        border-bottom: 2px dotted #f16e00;
        position: relative;
    }

    li.placeholder.drag-over:before, li.placeholder.keepDragOverOpen:before, li.placeholder.keepMouseOverOpen:before {
        font-family: 'Glyphicons Halflings', sans-serif;
        content: "\e092";
        position: absolute;
        left: -23px;
        top: -4px;
        font-size: 20px;
        color: #f16e00;
    }

    li.placeholder .insert {
        visibility: hidden;
    }

    li.placeholder.drag-over .insert {
        visibility: visible;
    }
    li.placeholder.drag-over .dropdown {
        visibility: visible;
    }
    li.placeholder .dropdown {
        visibility: hidden;
    }
    li.placeholder div.open {
        visibility: visible !important;
    }
    .drag-text-area {
        display: flex;
        justify-content: center;
        position: absolute;
        top: 250px;
        left: 0;
        bottom: 0;
        right: 0;
        font-size: 20px;
        color: gray;
    }

    .drag-area-empty-canvas {
        position: relative;
        height: 500px !important;
        padding-top: 220px;
    }

    .drag-area-empty-canvas:before {
        padding-top: 220px;
    }

    li.selected {
        background-color: #F0F0F0;
    }
</style>
