<template>
    <span 
        v-if="data && data.name"
        :style="tagStyle()"
        data-toggle="tooltip" 
        data-placement="right"
        data-trigger="hover" 
        :title="`${data.description}`"
        class="tag">
        <i v-if="remove" class="remove-tag glyphicon glyphicon-remove" @click="deleteTag"></i>
        <input v-if="checkbox" type="checkbox" style="margin-top: 2px;">
        {{ data.name }}
    </span>
</template>

<script>
    import { textToColor } from '../common/hash-colors.js';

    export default {
        name: "IngTag",
        props: {
            data: {
                type: Object,
                required: true
            },
            remove: {
                type: Boolean,
                required: false,
                default: false
            },
            checkbox: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        methods: {
            textHashToColor: function(text) {
                return textToColor(text);
            },
            tagStyle: function() {
                return `background-color: ${this.textHashToColor(this.data.name).background}; color: ${this.textHashToColor(this.data.name).text}; margin: 0px 2px; cursor: default;`;
            },
            deleteTag: function() {
                return this.$emit('deleteTag', this.data);
            }
        }
    };
</script>

<style lang="scss" scoped>
    .tag {
        border-radius: 5px;
        padding: 5px;
        text-align: center;
        line-height: 2;
        z-index: 0;
    }
    .remove-tag {
        cursor: pointer;
    }
</style>