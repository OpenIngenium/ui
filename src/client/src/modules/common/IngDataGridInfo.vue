<template>
    <div>
        <div class="step_number">{{ elementKey(elementId, 'number') }}</div> 
        <div class="step_title">{{ elementKey(elementId, 'title') }}</div>
        <div class="step_execution_details">
            <div class="step_type step_executable">
                <span class="step_type_text step_executable">{{ elementKey(elementId, 'step_type') | titlecase}} (Data Entries)</span>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import {titlecase} from "../common/filters";
    export default {
        name:"IngDataGridInfo",
        props: {
            elementId: {
                type: String,
                default: ""
            }
        },
        data() {
            return {};
        },
        computed: {
            ...mapGetters([
                "elementKey"
            ]),
        },
        filters: {
            titlecase
        }
    };
</script>

<style scoped>
    span.step_type_text.step_executable {
        color:#3c763d;
    }
</style>
