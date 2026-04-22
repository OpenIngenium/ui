<template>
    <span 
        v-if="data && data.name"
        style="margin: 0px 2px; cursor: default;"
        class="label btn-primary">
        <i  class="remove-label glyphicon glyphicon-remove" @click="deleteLabel"></i>
        {{ data.name | truncate(64) }}
    </span>
</template>

<script>


    import {truncate} from "../common/filters";
    export default {
        name: "ProcedureLabel",
        props: {
            data: {
                type: Object,
                required: true
            },
        },
        filters: {
            truncate: truncate
        },
        methods: {

            deleteLabel: function() {
                return this.$emit('deleteLabel', this.data);
            }
        }
    };
</script>

<style lang="scss" scoped>
    .label {
        border-radius: 5px;
        padding: 5px;
        text-align: center;
        line-height: 2;
        z-index: 0;
        word-break: break-all;
        white-space: normal; 
    }
    .remove-label {
        cursor: pointer;
    }
</style>