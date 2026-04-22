// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div>
        <div v-if="index === 0 && !this.disableFields"
            class="entry-dropzone"
            v-drag-and-drop="{ targetOnly: true }"
            :dropAfterIndex="-1"
            :dropType="'entry'"
            v-on:drop="entryDrop">
        </div>
        <component
            :is="entry"
            :element-id="elementId"
            :index="index"
            v-on:save="save"
            :mode="mode">
        </component>
        <dynamic-entry-actions
            v-if="enableDynamicEntryActions && isLevelThreeDetail"
            :element-id="elementId"
            :index="index"
            :disable-fields="disableFields"
            :element-path="elementPath">
        </dynamic-entry-actions>
        <div v-if="!this.disableFields" 
            class="entry-dropzone"
            v-drag-and-drop="{ targetOnly: true }"
            :dropAfterIndex="index"
            :dropType="'entry'"
            v-on:drop="entryDrop">
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import DynamicEntryActions from "../elements/DynamicEntryActions.vue";
    export default {
        name: "EntryWrapper",
        components: {
            DynamicEntryActions
        },
        props: {
            entry: {
                required: true,
                type: String
            },
            elementPath: {
                required: true,
                type: String
            }
        },
        methods: {
        }
    };
</script>

<style lang="scss" scoped>
    .no-dnd-events {
        pointer-events : none;
    }
    div.entry-dropzone.drag-over {
        margin: 0 0 11px 0;
        border-bottom: 2px dotted #f16e00;
        position: relative;
    }

    div.entry-dropzone.drag-over:before {
        font-family: 'Glyphicons Halflings', sans-serif;
        content: "\e092";
        position: absolute;
        left: -23px;
        top: -4px;
        font-size: 20px;
        color: #f16e00;
    }

    div.entry-dropzone.drag-over:before {
        @extend div.entry-dropzone.drag-over:before;
        top: 0px;
    }

    div.entry-dropzone.drag-over {
        @extend div.entry-dropzone.drag-over;
    }

    div.entry-dropzone {
        min-height: 5px;
    }
</style>

