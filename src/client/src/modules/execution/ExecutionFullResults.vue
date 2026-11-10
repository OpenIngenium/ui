<template>
    <ul>
        <li v-for="(val, key, idx) in getexecutionResultsEntry" :key="idx">
            <span class="result-key">{{key}}</span>:&nbsp;<span class="result-value">{{val}}</span>
        </li>
    </ul>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        name: "ExecutionFullResults",
        props: {
            elementId: {
                type: String,
                required: true
            },
            entryIndex: {
                type: Number,
                require: true
            }
        },
        data() {
            return {};
        },
        computed: {
            ...mapGetters([
                "executionResultsEntry"
            ]),
            getexecutionResultsEntry: function() {
                return this.executionResultsEntry(this.elementId, this.entryIndex);
            }
        }
    };
</script>

<style scoped>
    ul {
        padding: 20px;
        list-style: none;
        cursor: text;
    }
    .result-value {
        font-weight: bold;
    }
</style>
