<template>
    <div class="collapse navbar-collapse" 
        id="element-dropdowns"
        :style="menuPosition">
        <!-- Delete element confirmation modal {{{ -->
        <ing-modal v-show="confirmRemoveElement" @close="handleCancelDelete()" size="small">
            <template slot="title">
                <h4>Confirm Delete</h4>
            </template>

            <template slot="body">
                <p>Do you want to delete the section and all its children? This action cannot be reverted.</p>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary pull-right" @click="handleDeleteStep(true, menuContext)">Delete</button>
                <button type="button" class="btn pull-right" @click="handleCancelDelete()">Cancel</button>
            </template>
        </ing-modal>
        <!-- }}} -->

        <ul class="nav navbar-nav">
            <li 
                :class="{ open: expanded , [dropDownDirection]: true}" 
                @click.self="toggleDropdown"
                v-click-outside="closeDropdown">
                <ul class="dropdown-menu">
                    <li v-if="hasSelectedElementsToCopy" class="dropdown-submenu">
                        <a class="submenu" data-toggle="dropdown" href="#">Copy <span class="caret"></span></a>
                        <ul class="dropdown-menu" :style="subMenuLevel1">
                            <li v-for="(copyDropdownItem, idx) in copyDropdownItems"
                                :key="idx + copyDropdownItem.insertAfterId"
                                class="dropdown-submenu">
                                <a @click.prevent="(e) => handlePasteOperation(e, {
                                    insertAfterId: copyDropdownItem.insertAfterId,
                                    level: copyDropdownItem.level,
                                    operation: 'COPY'
                                })" v-html="copyDropdownItem.label"></a>
                            </li>
                        </ul>
                    </li>
                    <li v-if="hasSelectedElementsToMove" class="dropdown-submenu">
                        <a class="submenu" data-toggle="dropdown" href="#">Move <span class="caret"></span></a>
                        <ul class="dropdown-menu" :style="subMenuLevel1">
                            <li v-for="(cutDropdownItem, idx) in cutDropdownItems"
                                :key="idx + cutDropdownItem.insertAfterId"
                                class="dropdown-submenu">
                                <a @click.prevent="(e) => handleCutOperation(e, {
                                    insertAfterId: cutDropdownItem.insertAfterId,
                                    level: cutDropdownItem.level,
                                    operation: 'CUT'
                                })" v-html="cutDropdownItem.label"></a>
                            </li>
                        </ul>
                    </li>
                    <li class="dropdown-submenu">
                        <a class="submenu" data-toggle="dropdown" href="#">Insert Step <span class="caret"></span></a>
                        <ul class="dropdown-menu" :style="subMenuLevel1">
                            <li v-for="group in paletteGroups" :key="group"
                                class="dropdown-submenu">
                                <a class="submenu" data-toggle="dropdown" href="#">{{ group }} <span class="caret"></span></a>
                                <ul class="dropdown-menu" :style="subMenuLevel2">
                                    <li v-for="(element, index) in usedElementsByPaletteGroup(group)" 
                                        :key="index"
                                        class="dropdown-submenu">
                                        <a class="submenu" data-toggle="dropdown" href="#">{{ element.displayName }}<span class="caret"></span></a>
                                        <ul class="dropdown-menu" :style="subMenuLevel3">
                                            <li v-for="(insertDropdownItem, idx) in insertDropdownItems"
                                                :key="idx + insertDropdownItem.insertAfterId">
                                                <a @click.prevent="(e) => handleInsertStep(e, {
                                                    elementPath: element.path,
                                                    insertAfterId: insertDropdownItem.insertAfterId,
                                                    level: insertDropdownItem.level,
                                                    scriptMeta: element.scriptMeta
                                                })" v-html="insertDropdownItem.label"></a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a @click.prevent="handleDeleteStep(false, menuContext)">Delete</a>
                    </li>
                    <li v-if="mode === 'execution'">
                        <a @click.prevent="handleToggleBreakpoint">Toggle Breakpoint</a>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from "vuex";
    import { elementsByPaletteGroup, getElementCategories } from "./elem_types";

    export default {
        name: "IngContextMenu",
        data() {
            return {
                insertDropdownItems: [],
                cutDropdownItems: [],
                copyDropdownItems: [],
                xOffset: 0,
                yOffset: 0
            };
        },
        created() {
            this.fetchStepPaletteBuiltIn();
            this.fetchStepPaletteCustom();
        },
        props: {
            mode: {
                type: String,
                default: ''
            },
            expanded: {
                type: Boolean,
                default: false
            },
            menuContext: {
                type: Object
            },
            menuYOffset: {
                type: Number,
            },
            menuXOffset: {
                type: Number,
            },
            handleDeleteStep: {
                type: Function,
            },
            handleToggleBreakpoint: {
                type: Function,
            },
            handleInsertStep: {
                type: Function
            },
            handleCutOperation: {
                type: Function
            },
            handlePasteOperation: {
                type: Function
            },
            confirmRemoveElement: {
                type: Boolean
            }
        },
        watch: {
            menuContext: function(value) {
                this.generateInsertHandlers();
                this.generateCutHandlers();
                this.generateCopyHandlers();

            },
            selectedElementIds: function(value) {
                this.generateCutHandlers();
                this.generateCopyHandlers();
            }
        },
        computed: {
            ...mapGetters([
                "element",
                "elementsByParent",
                "copyParams",
                "selectedElementIds",
                "selectedElementIdsForCopy",
                "selectedElementIdsForMove",
                "hasSelectedElements",
                "hasSelectedElementsToCopy",
                "hasSelectedElementsToMove",
                "stepPaletteBuiltIn",
                "stepPaletteCustom"
            ]),
            paletteGroups: function() { 
                return getElementCategories(this.stepPaletteBuiltIn, this.stepPaletteCustom);
            },
            dropDownDirection: function() {
                const spaceBelow = window.innerHeight - this.menuYOffset;
                if(spaceBelow > 400) {
                    return 'dropdown';
                } else {
                    return 'dropup';
                }
            },
            menuPosition: function() {
                return {
                    position: 'fixed',
                    top: `${this.menuYOffset}px`,
                    left: `${this.menuXOffset}px`,
                    zIndex: 100
                };
            },
            subMenuLevel1: function() {
                return { marginTop: '-31px' };
            },
            subMenuLevel2: function() {
                return { marginTop: '-31px' };
            },
            subMenuLevel3: function() {
                return { marginTop: '-31px' };
            }
        },
        methods: {
            ...mapActions([
                "fetchStepPaletteBuiltIn",
                "fetchStepPaletteCustom",
            ]),
            usedElementsByPaletteGroup(group) {
                return elementsByPaletteGroup(group, this.stepPaletteBuiltIn, this.stepPaletteCustom);
            },
            getMenuItems: function(previousElementId, previousElement, operation, label) {
                let dropdownItems = [];
                if (previousElement) {
                    if (previousElement.elem_type === 'SECTION') {
                        dropdownItems.push({
                            label: `${label} child of ${previousElement.number}: ${previousElement.title}`,
                            insertAfterId: previousElement.elem_id,
                            level: 'CHILD',
                            operation: operation,
                            selected: false,
                        });
                    } else if (previousElement.elem_type === 'PROCEDURE_SECTION') {
                        // can add a child element if procedure has been imported into the current execution
                        if (previousElement.imported && (previousElement.child_execution_id ==='')) {
                            dropdownItems.push({
                                label: `${label} child of ${previousElement.number}: ${previousElement.title}`,
                                insertAfterId: previousElement.elem_id,
                                level: 'CHILD',
                                operation: operation,
                                selected: false,
                            });
                        }
                    }
                    let childElements = this.getChildElements(previousElementId);
                    if (childElements && (childElements.length > 0)) {
                        // cannot add as a sibling
                    } else {
                        dropdownItems.push({
                            label: `${label} sibling of ${previousElement.number}: ${previousElement.title}`,
                            insertAfterId: previousElement.elem_id,
                            level: 'SIBLING',
                            operation: operation,
                            selected: false,
                        });

                        while (previousElement) {
                            let parentElement = this.element(previousElement.parent_id);
                            if (parentElement) {
                                let siblingElements = this.getChildElements(parentElement.elem_id);

                                if (siblingElements && (siblingElements.length > 0) && (siblingElements[siblingElements.length-1].elem_id === previousElement.elem_id)) {
                                    // previous element is the last child
                                    dropdownItems.push({
                                        label: `${label} sibling of ${parentElement.number}: ${parentElement.title}`,
                                        insertAfterId: parentElement.elem_id,
                                        level: 'SIBLING',
                                        operation: operation,
                                        selected: false,
                                    });
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
                    dropdownItems.push({
                        label: `${label} at the top`, 
                        insertAfterId: '-1',
                        level: 'CHILD',
                        operation: operation,
                        selected: false,
                    });
                }
                return dropdownItems;
            },
            generateInsertHandlers: function() {
                const previousElementId = this.menuContext.elem_id;
                const previousElement = this.element(previousElementId);
                const operation = "INSERT";
                const label = "Insert &#10132;";

                this.insertDropdownItems = this.getMenuItems(previousElementId, previousElement, operation, label);
            },
            generateCopyHandlers: function() {
                const previousElementId = this.menuContext.elem_id;
                const previousElement = this.element(previousElementId);
                const operation = "COPY";

                if (this.hasSelectedElementsToCopy) {
                    let label = "";
                    if (this.selectedElementIdsForCopy.length > 1) {
                        label = `Copy-n-Paste ${this.selectedElementIdsForCopy.length} elements &#10132;`;
                    } else {
                        label = 'Copy-n-Paste 1 element &#10132;';
                    }
                    this.copyDropdownItems = this.getMenuItems(previousElementId, previousElement, operation, label);
                } else {
                    this.copyDropdownItems = [];
                }
                // need to register event handlers again since menus were re-generated
                window.contextMenuDropdowns();
            },
            generateCutHandlers: function() {
                const previousElementId = this.menuContext.elem_id;
                const previousElement = this.element(previousElementId);
                const operation = "CUT";

                if (this.hasSelectedElementsToMove) {
                    let label = "";
                    if (this.selectedElementIdsForMove.length > 1) {
                        label = `Cut-n-Paste ${this.selectedElementIdsForMove.length} elements &#10132;`;
                    } else {
                        label = 'Cut-n-paste 1 element &#10132;';
                    }
                    this.cutDropdownItems = this.getMenuItems(previousElementId, previousElement, operation, label);
                } else {
                    this.cutDropdownItems = [];
                }
                // need to register event handlers again since menus were re-generated
                window.contextMenuDropdowns();
            },
            getChildElements: function(parentId) {
                return this.elementsByParent(parentId);
            },
            toggleDropdown(e) {
                e.stopPropagation(); // Prevent the event from immediately propagating to document
                this.$emit('toggle-dropdown');

                // Give the toggleDropdown a higher priority over the click-outside directive
                this.$nextTick(() => {
                    document.addEventListener('click', this.closeDropdownOnce);
                });
            },
            closeDropdown() {
                this.$emit('close-dropdown');
            },
            closeDropdownOnce(event) {
                if (event) event.stopPropagation();
                
                this.closeDropdown();
                document.removeEventListener('click', this.closeDropdownOnce);
            },
            handleCancelDelete() {
                this.$emit('cancel-delete');
            },
        }
    };
</script>

<style scoped>
    #element-dropdowns {
        position: absolute;
    }

    .dropdown-submenu {
        position: relative;
    }

    .dropdown-submenu .dropdown-menu {
        top: auto;
        left: 100%;
        margin-top: -1px;
        margin-bottom: -31px;
    }
    .caret{
        transform: rotate(270deg);
    }
</style>

